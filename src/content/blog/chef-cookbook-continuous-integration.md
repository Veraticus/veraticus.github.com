---
title: "Chef Cookbook Continuous Integration"
date: 2015-02-04 11:37:38 -0600
tags: [chef, servers]
---
Testing infrastructure is as crucial to the success of a business as testing applications. Yet most infrastructure is untested and validated only occasionally, and only by hand -- this is especially a tragedy when chef is used, because chef has many high-quality tools to provide testing coverage from [static analysis](https://foodcritic.io) to [unit testing](https://github.com/sethvargo/chefspec) and even [full convergence runs](http://kitchen.ci/).

At Symonds &amp; Son, we spent a lot of time and energy integrating our tests on [CircleCI](https://circleci.com) into a continuous deployment process that begins with three layers of testing and ends with automated cookbook deployment to the chef servers we manage. I'll discuss chef continuous deployment in a later article; here, I'll cover how we got Foodcritic, ChefSpec, and Test Kitchen all running seamlessly in Circle.


 > My good friend and coworker, [Chris LoPresto](https://twitter.com/chrislopresto), contributed greatly to the engineering innovations discussed here.

CircleCI has a number of great integrations: here we'll use their docker service to create docker instances and automatically converge them with Test Kitchen. Before we do so, we'll run foodcritic and ChefSpec on them as well just to make sure everything works as we would expect.

## Get Tested

You'll need to actually set up tests and get them running before getting them into continuous integration! Happily the process of testing cookbooks is relatively fast and easy: all three software tools Symonds &amp; Son uses have great documentation and tons of examples on the Internet. Here's how we set them up.

### Foodcritic

Running Foodcritic is pretty simple. Simply add the foodcritic gem to your `Gemfile` and execute a command like this:

```sh
foodcritic . -X spec -f any -t ~FC003
```

`~FC003` instructs Foodcritic not to use a rule that guards for chef-solo. We intentionally do not obey rule FC003 as we use chef-zero locally and chef-server remotely.

### ChefSpec

ChefSpec is slightly more complicated. Your best bet is to follow the excellent installation guide at the [ChefSpec README](https://github.com/sethvargo/chefspec), since we don't really do any customization on top of that: our ChefSpec tests are rather traditional. Here's a sample from our cookbook that updates aptitude:

```ruby
require 'chefspec'
require_relative '../spec_helper'

describe 'custom_apt::default' do

  before { stub_recipes %w(apt) }

  let(:chef_run) { ChefSpec::Runner.new.converge(described_recipe) }

  it 'upgrades upstart' do
    expect(chef_run).to upgrade_package('upstart')
  end

end
```

### Test Kitchen

The most complicated of the chef testing suites, Test Kitchen performs actual convergence on a platform of your choice and then will run automated tests on the created instance. Test Kitchen is also the most essential of the suites, in my opinion -- performing static analysis and unit tests are all well and good, but the only way to definitively determine if your cookbook works is to actually ensure servers converge and that their internal state is correct.

Most of our cookbooks use [Docker](https://docker.com) containers to perform testing. This has downsides: docker containers will not allow you to modify important files in their `/etc` directory. For example, you cannot change iptables rules in a docker container. Additionally Upstart does not work at all in docker-land. Despite drawbacks like this, docker has many advantages. It is extremely fast and well-supported across testing providers. In fact, our continuous integrator of choice, Circle, provides first-class support for docker containers on their test VMs -- allowing you to run docker Test Kitchen convergences directly on Circle.

Happily, the `.kitchen.yml` that supports this is rather standard:

```yaml
---
driver:
  name: docker
  privileged: true

provisioner:
  name: chef_zero
  require_chef_omnibus: 11.16.4
  attributes:
    test-kitchen: true

platforms:
  - name: ubuntu-14.04

suites:
  - name: default
    run_list:
      - recipe[cookbook::default]
```

The only special section to note here is the driver configuration: we're using docker and setting it to privileged mode, which enables it to more exactly match a cloud VM.

Just for completeness' sake, here's a simple test from the afore-mentioned aptitude cookbook testing for the proper version of Upstart:

```ruby
require 'serverspec'
set :backend, :exec

describe command('apt-cache policy upstart | grep Installed') do
  its(:exit_status) { should eq 0 }
  its(:stdout) { should include('1.12.1') }
end
```

Once you have your three testing suites set up, all that remains is to integrate them into Circle.

## Circle Continuous Integration

[CircleCI](https://circleci.com) is my favorite continuous integration tool. It has a great UI and is really simple to set up with GitHub: it also has great support for third-party plugins, and even better, lets you SSH into a failed instance to run tests yourself and figure out exactly what went wrong.

For our purposes, we need CircleCI to properly install chef and then run all the tests on our cookbook. As it turns out this is not all that difficult to set up: you'll want a `circle.yml` that looks a little like this...

```yaml
machine:
  services:
    - docker
dependencies:
  pre:
    - if ! chef -v; then
        if ! [ -f chefdk_0.3.5-1_amd64.deb ]; then
          wget https://opscode-omnibus-packages.s3.amazonaws.com/ubuntu/12.04/x86_64/chefdk_0.3.5-1_amd64.deb;
        fi;
        sudo dpkg -i chefdk_0.3.5-1_amd64.deb;
      fi
    - chef gem install specific_install
    - sudo chef gem specific_install kitchen-docker -l http://github.com/peterabbott/kitchen-docker.git -b v1.6.4
    - sudo chef gem uninstall chefspec
    - chef gem install chefspec:4.0.1
    - mkdir ~/.chef
    - cp ~/${CIRCLE_PROJECT_REPONAME}/test/circle/knife.rb ~/.chef/knife.rb
  cache_directories:
    - ./chefdk_0.3.5-1_amd64.deb
test:
  override:
    - chef exec berks install
    - chef exec rspec -P spec/**/*_spec.rb --tty --color
    - chef exec foodcritic . -X spec -f any -t ~FC003
    - chef exec kitchen test
```

There's a lot going on here, so let's dive in at the top!

First, the `machine.services` directive informs CircleCI we want docker to start on our Circle test VMs. Without this, the kitchen specs won't work at all.

Next comes the dependencies directive. Chef provides the excellent [ChefDK](https://downloads.chef.io/chef-dk/) download which bundles everything we care about: chef's own command-line interface, [Berkshelf](https://berkshelf.com) (for managing cookbook dependencies), and all three testing tools we're using. We're installing the official Chef `.deb` distribution of ChefDK onto the Circle machine to get around downloading each tool individually.

Next comes a bit of gem back-and-forth. Until very recently, the GitHub [kitchen-docker main fork](https://github.com/portertech/kitchen-docker) was not kept up-to-date: we manually install a version of kitchen-docker that actually works, and then reinstall a better version of chefspec.

Finally, we copy a stub `knife.rb` to `~/.chef/knife.rb`. You'll need to set this file up yourself, but it's intentionally pretty small. If you're downloading any cookbooks from a Berkshelf-API server, you'll probably need to include a valid private key for that server either in the `knife.rb` (bad) or include it as an environment variable in Circle (good). Here's what the `knife.rb` should look like:

```rb
# A knife.rb for Circle

node_name 'circleci'
chef_server_url 'https://your.chef.url'
client_key ENV['CIRCLE_CI_MACHINE_USER_CHEF_KEY']
```

Once all the setup is done, running the tests is by comparison quite simple! We perform a `berks install` and then run each test command individually. If you have your tests working locally, this should get them working properly in Circle as well.

Of course, even if you are testing your cookbooks, you're really only half-way to heaven. After testing comes deployment: and this can be a little difficult with chef's complicated keying and validation structure. In my next post I'll detail how we automatically release and deploy cookbooks to their destination chef servers... stay tuned!
