---
layout: post
title: "Packaging Anything with Chef and fpm"
date: 2015-06-10 10:33:45 -0500
comments: true
categories: [servers]
---
Compiling software takes a long time. The worst offender, for us, is usually Ruby, but it could be anything -- recently we had a client that wanted to install ffmpeg on each server, with compilation times upwards of five minutes. The answer to getting around long compilation times in a standardized server environment is, of course, packages! So we developed a Chef-based solution to create packages with the really excellent [fpm](https://github.com/jordansissel/fpm), upload them to S3, and then download them on target servers: all without needing anything other than a few gems.

Want to do it yourself? Then read on.

<!-- more -->

## Creating Packages

There are two parts to this setup: first, compiling the software and creating packages from it. Then, downloading it on client servers. For the purposes of this cookbook, I'll be referring to the former as "creating," and the latter as "installing."

Creating is pretty easy. We'll have one generic `create` recipe that all the other recipes can include, and a provider that does most of the heavy lifting. First, let's set up some cookbook attributes:

```ruby
# symondsandson_packages/attributes/default.rb

# Compile extensions immediately
default['build-essential']['compile_time'] = true
default['xml']['compiletime']              = true

# fpm settings
default['symondsandson_packages']['fpm']['version'] = '1.3.3'
set['fpm_tng']['exec']                       = '/opt/chef/embedded/bin/fpm'
set['fpm_tng']['gem']                        = '/opt/chef/embedded/bin/gem'

# S3 settings
default['symondsandson_packages']['s3']['bucket']            = 'packages'
default['symondsandson_packages']['s3']['download_path']     = 'production' # By default, download from production
default['symondsandson_packages']['s3']['upload_path']       = 'development'  # By default, upload to development
default['symondsandson_packages']['s3']['access_key_id']     = 'XXX'
default['symondsandson_packages']['s3']['secret_access_key'] = 'YYY'

# Download settings
default['symondsandson_packages']['download']['cache_directory'] = '/usr/local/symondsandson/cache/'
```

I've pegged our package creation to fpm 1.3.3, which has worked extremely well for us. Remember to include your actual access key and secret access key to actually upload this to S3! Also note the cache directory location. We'll be using that down below.

Now the base create recipe:

```ruby
# symondsandson_packages/recipes/create.rb

# Install everything we need to create packages.
include_recipe 'apt'
include_recipe 'build-essential'
include_recipe 'xml'

package "zlib-devel compiletime install wget liblzma-dev libssl-dev libyaml-dev libreadline6-dev"

chef_gem 'fpm' do
  version node['symondsandson_packages']['fpm']['version']
  action :upgrade
end

chef_gem 'fog' do
  version '1.25.0'
end
```

Here we're just installing a bunch of packages that will be necessary for compiling whatever software we choose. And finally, let's create a version of Ruby:

```ruby
# symondsandson_packages/recipes/create_ruby.rb

# Pull in package creation prerequisites.
include_recipe 'symondsandson_packages::create'

# Pull in Ruby prerequisites
%w(libffi6 libffi-dev).each do |package|
  apt_package package
end

# Install rbenv
include_recipe 'custom_ruby::rbenv'

rbenv_ruby '2.2.0' do
  environment({
    'CONFIGURE_OPTS' => "--enable-shared --with-opt-dir=/usr/local/rbenv/versions/2.2.0"
  })
end

%w(bundler backup puma nokogiri).each do |g|
  rbenv_gem g do
    rbenv_version '2.2.0'
    action :install
  end
end

symondsandson_packages 'ruby' do
  version '2.2.0'
  input_args '.'
  prefix "/usr/local/rbenv/versions/2.2.0"
  chdir "/usr/local/rbenv/versions/2.2.0"
  action :create
end
```

Again, we're just installing package prerequisites, compiling Ruby and a few gems, and then using a provider called `symondsandson_packages` to do the real work. The provider is quite special, so let's dig into it in a little bit more detail.

## The Package Provider

Of course, the package provider does most of the heavy lifting. In addition to creating the packages, it also supports installing them. Before we get to it though, let's implement a little bit of abstraction so we can DRY up the provider a bit:

```ruby
# symondsandson_packages/libraries/packages_helper.rb

# A few DRY helpers.
module SymondsandsonPackages
  extend self

  def name(node, package, version)
    "#{package}-#{version}.deb"
  end

  def download_path(node, package, version)
    File.join(node['symondsandson_packages']['s3']['download_path'], package, self.name(node, package, version))
  end

  def upload_path(node, package, version)
    File.join(node['symondsandson_packages']['s3']['upload_path'], package, self.name(node, package, version))
  end

end
```

This shouldn't exactly be surprising stuff, and we're about to use it extensively!

```ruby
# symondsandson_packages/providers/default.rb

require 'chef/mixin/shell_out'
require 'chef/mixin/language'
include Chef::Mixin::ShellOut

use_inline_resources

def load_current_resource
  @package_name = ::SymondsandsonPackages.name(node, new_resource.name, new_resource.version)
  @download_path = ::SymondsandsonPackages.download_path(node, new_resource.name, new_resource.version)
  @upload_path = ::SymondsandsonPackages.upload_path(node, new_resource.name, new_resource.version)
  @cache_directory = new_resource.cache_directory || node['symondsandson_packages']['download']['cache_directory']
end

action :install do
  run_context.include_recipe 'apt'
  run_context.include_recipe 'symondsandson_packages::default'
  run_context.include_recipe 's3_file'

  s = s3_file(::File.join(@cache_directory, @package_name)) do
    bucket node['symondsandson_packages']['s3']['bucket']
    aws_access_key_id node['symondsandson_packages']['s3']['access_key_id']
    aws_secret_access_key node['symondsandson_packages']['s3']['secret_access_key']
    action :nothing
  end
  s.instance_variable_set(:@remote_path, "/#{@download_path}") # Instance variables do not enter a lwrp setting block
  s.run_action(:create)

  d = dpkg_package(@package_name) do
    action :nothing
  end
  d.instance_variable_set(:@source, ::File.join(@cache_directory, @package_name)) # Instance variables still do not enter a lwrp setting block
  d.run_action(:install)

  new_resource.updated_by_last_action(s.updated_by_last_action? && d.updated_by_last_action?)
end

action :create do
  run_context.include_recipe 'fpm-tng::default'

  fpm_tng_package new_resource.name do
    input_type 'dir'
    output_type 'deb'
    version new_resource.version
    prefix new_resource.prefix
    chdir new_resource.chdir
    input_args new_resource.input_args
    provides new_resource.provides
  end

  ruby_block "upload #{new_resource.name} package" do
    block do
      require 'fog'

      connection = Fog::Storage.new provider:              'AWS',
                                    aws_access_key_id:     node['symondsandson_packages']['s3']['access_key_id'],
                                    aws_secret_access_key: node['symondsandson_packages']['s3']['secret_access_key']

      bucket = connection.directories.get node['symondsandson_packages']['s3']['bucket']

      file = bucket.files.create key:  ::SymondsandsonPackages.upload_path(node, new_resource.name, new_resource.version),
                                 body: ::File.open("/opt/fpm-pkgs/#{new_resource.name}-#{new_resource.version}.deb")
    end
  end

end
```

There's a lot of stuff going on here, so let's take it piece by piece.

First, we set some instance variables for use throughout the provider. We use them almost immediately in the `install` action with the excellent [s3_file](https://github.com/adamsb6/s3_file) Chef provider, which allows us to easily download files from S3. Tragically we are forced to do some Ruby gymnastics to set instance variables for the providers, since instance variables do not enter blocks appropriately in Chef... but once the file is downloaded from S3, we use dkpg_package on it to install it. If both the files was downloaded and installed, then the `install` action updated its resource.

The `create` action is just as easy. We pass in a bunch of arguments that fpm expects: here we make extensive use of the [fpm_tng](https://github.com/hw-cookbooks/fpm-tng) provider, which wraps the installation and use of fpm. Finally, we manually upload the created package file using Fog directly.

Using this provider and the `create` recipes above, you should be able to start up a vagrant or test-kitchen instance using a recipe like `symondsandson_packages::create_ruby` and have it automatically compile and upload Ruby to an S3 bucket of your choosing.

## Installing Packages

Now that we have the provider out of the way, installing packages is simplicity itself!

```ruby
# symondsandson_packages/recipes/install_ruby.rb

# Do common basics.
include_recipe 'apt'
include_recipe 'build-essential'

# Install necessary packages
package "zlib-devel compiletime install" do
  package_name 'zlib1g-dev'
end.run_action(:install)

# Install rbenv to manage the Ruby versions
include_recipe 'custom_ruby::rbenv'

# Install libyaml so Ruby can function
package 'libyaml-dev'

symondsandson_packages "ruby-2.2.0" do
  name 'ruby'
  version '2.2.0'
  action :install
end

# Make sure rbenv detects and sets shims for this Ruby
rbenv_global '2.2.0'

end
```

This simple and robust system has allowed us to package up any kind of software in a repeatable, efficient manner and then deploy it to multiple servers quickly. It's saved our clients tons of time wasted in compilation, and was pretty interesting and fun to code besides. Hopefully you'll find it useful as well!
