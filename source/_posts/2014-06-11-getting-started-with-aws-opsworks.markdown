---
layout: post
title: "Getting Started With AWS OpsWorks"
date: 2014-06-11 13:59:00 -0500
comments: true
categories: [servers, aws, opsworks]
---
I've been creating a complicated OpsWorks server setup for a client, as I mentioned in [my last post](http://joshsymonds.com/blog/2014/05/09/creating-an-aws-opsworks-instance-store-ami/), and I've been really enjoying the process. OpsWorks, while still a beta service, has a lot to recommend itself: it couples the best parts of chef to the power of the impressive AWS APIs. Using OpsWorks, it's easy to make processes that seem almost magical.

How magical? Well, imagine super-fast command line deploys, seamless cookbook updates, great chatbot and application integration, then marry all those things to AWS autoscaling via elastic load balancing. One use case for my client: [TravisCI](https://travis-ci.org/) automatically creating servers, running remote acceptance tests on them, then destroying them afterwards -- all while notifying chatrooms of its progress. Now that's assurance your code will work in production! Really, the sky's the limit here for awesome integrations.

I've learned a lot in the process of implementing this setup. If you're looking to give OpsWorks a go for your next project, here's some hints and tips to make get started on the right path.

<!-- more -->

## 1. Setup vagrant to be compatible with OpsWorks

You'll want to test all of your OpsWorks recipes locally -- how else can you be sure they'll work remotely? [Vagrant](http://www.vagrantup.com/) is the ideal tool for making this happen. You'll want to download the same AMI and the same version of chef that OpsWorks is using: ubuntu 12.04 and chef 11.10 respectively, for me. Here's how to do that in your `Vagrantfile`:

```ruby
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = "ubuntu-precise64"
  config.vm.box_url = "https://opscode-vm-bento.s3.amazonaws.com/vagrant/opscode_ubuntu-12.04_provisionerless.box"

  # Specifies the chef version Opsworks is running
  config.omnibus.chef_version = "11.10.0"
end
```

This requires the `vagrant-omnibus` plugin, which you can install with `vagrant plugin install vagrant-omnibus`.

## 2. Use librarian-chef

OpsWorks expects all of your recipes to be in one git repository that it can download. This may be bad practice for many chefs, but since it's required here and it's the cookbook repository format that [librarian-chef](https://github.com/applicationsonline/librarian-chef) expects and supports, you'll want to download and configure librarian-chef.

Just the default librarian-chef configuration works, with one exception: you'll want to strip `.git` directories from the checked-out sources to prevent OpsWorks from becoming confused. That's relatively easy to set up:

```bash
librarian-chef config install.strip-dot-git 1 --local
```

I store the source of my cookbooks in one repository and use an orphan branch of that same repository for the actual cookbooks that are installed and managed by librarian. This is pretty easy to set up:

```bash
# Create the orphan branch
git checkout --orphan cookbooks
git rm -rf .
git add . -A
git commit -m 'Initial commit'
git push origin cookbooks
```

Then in your master branch, set up your cookbook branch as a submodule in a subdirectory that librarian-chef will install to:

```
# .gitmodules
[submodule "cookbooks"]
  path = cookbooks
  url = git@github.com:user/repository.git
  branch = cookbooks
```

I have a small Rakefile that allows me to run `rake` to sync my changes directly to the cookbooks branch.

```ruby
desc "install all cookbooks and synchronize them to GitHub"
task :default do
  puts "## Installing cookbooks"
  system "librarian-chef install"
  puts "## Pushing cookbooks to GitHub"
  cd "cookbooks" do
    system %Q(echo "gitdir: ../.git/modules/cookbooks" > .git)
    system "git add ."
    system "git add -u"
    message = "Cookbooks generated via librarian-chef at #{Time.now.utc}"
    system "git commit -m \"#{message}\""
    system "git pull"
    system "git push origin cookbooks"
  end
  puts "## Done!"
end
```

Keep in mind this setup isn't ideal for collaboration: if I had a lot of people updating the cookbooks simultaneously, I would definitely set up separate repositories. But for smaller OpsWorks projects, this works perfectly well.

## 3. Don't bother with OpsWorks' recipe syntax

Though it's clever that OpsWorks has their own recipe syntax they'd like you to use, my advice is: don't. If you ever want to use your chef recipes somewhere else -- or bring chef recipes from elsewhere to OpsWorks -- you'll thank yourself for just using the standard recipe format. So instead of this:

```ruby
# No!
node[:deploy].each do |app_name, deploy|
  template '/etc/init/puma.conf' do
    source 'puma.conf'
    owner  'root'
    group  'root'
    mode   '0644'
  end
end
```

Use the plainer, simpler:

```ruby
# Yes!
template '/etc/init/puma.conf' do
  source 'puma.conf'
  owner  'root'
  group  'root'
  mode   '0644'
end
```

The former syntax won't work properly on vagrant, just for starters, which is a great reason all by itself not to use it. You'll want to control what recipes get applied where through custom layers rather than OpsWorks' special syntax.

## 4. Overwrite any recipes that overlap

OpsWorks inserts a lot of their own recipes into your cookbooks, and you can't disable this behavior, even if you're using your own custom recipes. This can lead to naming collisions that can be frustrating to resolve. For a Rails stack, I had to manually remove the `unicorn` and `passenger-apache2` cookbooks that led to merge errors with the `application_ruby` cookbook. Thankfully, removing cookbooks in OpsWorks is pretty easy: if you have a recipe named exactly the same as an OpsWorks one, yours will replace it.

You'll want to create a cookbook named after the offending cookbook (for example, `unicorn`) and replace every file in the OpsWorks cookbook with a blank one. You can find all the OpsWorks cookbook sources [in their GitHub repository](https://github.com/aws/opsworks-cookbooks). So, to continue the unicorn example, you'd make a `unicorn` directory, a `recipes` subdirectory, and three files: `default`, `rails`, and `stop`. The content of all these files should be something like this:

```ruby
# Prevent OpsWorks from trying to install this cookbook.

```

Obviously you should only do this if you're definitely not using OpsWorks' cookbooks.

## 5. OpsWorks is your single point of truth

Get rid of your data bags, encrypted data bags, configuration yaml files: everything. Embrace OpsWorks as your centralized chef server and the primary authority on the state and setup of your application. Data bags are arguably chef smell at this point anyway, and OpsWorks continues their inexorable slide towards obsolescence. You'll want to set up everything you can with sensible attributes in your custom application recipes:

```ruby
# site-cookbooks/your-app/attributes/default.rb
default['database'] = {
  'pool' => 5,
  'host' => 'localhost',
  'name' => 'app_database',
  'username' => 'username',
  'password' => 'password'
}
```

Then pass overrides in your stack JSON. Your stack JSON is where you'll enumerate all the settings particular to your environment: though I'm not incredibly happy with this setup, as it's not versioned, AWS makes it easy to copy stack and layer setups really easily, so in practice it's not difficult to update multiple stacks or create a new one from sensible defaults.

## 6. Use the AWS API

So what's the real advantage of doing this whole song and dance? Using the AWS API, you can command and control your servers (and all your attached AWS stuff) with an ease and simplicity you can't achieve anywhere else. But for more details on that, you'll just have to stay tuned for my next post, which will discuss all the awesome things you can start doing with OpsWorks once you have it set up properly.

