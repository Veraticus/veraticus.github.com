---
title: "Chef Cookbooks for Rails"
date: 2013-01-22 12:36
tags: [chef, rails]
---
I spent awhile trying to find other people's Chef cookbook collections for deploying Rails applications. In the absence of anything other than old GitHub repositories, I decided to write a quick post summarizing the cookbooks I used and a few settings that made them work as I expected. I'll go by the roles that I created to organize the cookbooks, starting with the most basic: base.


## base

```ruby
run_list %W(
  recipe[chef-client::delete_validation]
  recipe[chef-client::config]
  recipe[chef-client::service]
  recipe[apt]
  recipe[monit]
  recipe[postfix]
  recipe[openssh]
  recipe[ntp]
  recipe[vim]
  recipe[build-essential]
  recipe[user::data_bag]
  recipe[logrotate]
  recipe[ohai]
  recipe[ruby_build]
  recipe[rbenv::system]
  recipe[sudo]
  recipe[zsh]
  recipe[oh-my-zsh]
  recipe[collectd]
  recipe[collectd::attribute_driven]
  recipe[htop]
  recipe[runit]
  recipe[rsyslog::client]
)
```

This is the run list I'm using as the base for all the servers. I don't think there's anything surprising here, but I do want to point out a few things:

* **openssh** should be configured like this:

```ruby
  default_attributes 'openssh' => {
      'permit_root_login' => 'no',
      'password_authentication' => 'no'
    }
```

You don't want to allow root logins or password logins. It is also probably worthwhile to delete any preexisting sudoer for your AMI image if one exists (like ubuntu for example), using...

* **user::data_bag** from [this cookbook](http://github.com/fnichol/chef-user). It allows you to have data bags for your users that get automatically added (or removed) from every server. It's really helpful.

* I went back and forth on **ruby_build and rbenv** in the base cookbook. Compiling your own Ruby takes significantly longer than installing Ruby from a package, and I could just compile Ruby on the application servers and use the Ruby package on everything else. Ultimately I decided to keep compiled Ruby in the base list -- it seems slightly faster than the package and allows me to apply performance patches, and since I made an AMI of the base role the speed difference didn't matter a whole lot to me. But I can definitely see taking this out.

* **zsh and oh-my-zsh** are obviously just silly nice-to-haves. Use a zsh theme that says the server name or else you'll get confused.

## statistics

I'm running Graylog2 and Graphite to compile logs and interesting statistics from our servers. This is the runlist that establishes the role dedicated to these two pieces of software, which I called `statistics`:

```ruby
run_list %W(
  recipe[ebs]
  recipe[apache2]
  recipe[statsd]
  recipe[python]
  recipe[graphite]
  recipe[graylog2]
  recipe[graylog2::apache2]
)
```

I use [this EBS cookbook](https://github.com/titanous/chef-ebs) with this configuration:

```ruby
default_attributes 'ebs' => {
    'volumes' => {
      '/data' => {
        'size' => 100,
        'fstype' => 'xfs'
      }
    }
  }
```

This server saves and compiles enormous amounts of data, and in order to hold it all correctly I provision an external EBS drive to contain it. I'm actually not even sure 100 gigs is enough space but it seems good for now. elasticsearch, mongodb, and graphite are all set up to save their data to subdirectores in /data. While I could easily have made this a RAID array instead, persistence of this data is not super important to me right now: while it would suck to lose all our analytics information, given our traffic it would rebuild into something useful very quickly anyway.

I would use nginx instead of Apache2, but for a server only accessible internally that will probably not see a lot of traffic, it was much easier and faster to just set up Apache2 and passenger than start unicorns for the Graphite and Graylog web interfaces.

## app

```ruby
run_list %W(
  recipe[imagemagick]
  recipe[nginx]
  recipe[unicorn]
)
```

Probably among the least surprising roles. The application servers use nginx and unicorn for blazingly fast speed. Make sure to add the nginx collectd plugin to this server for additional metrics and monitoring:

```ruby
default_attributes 'collectd' => {
    'plugins' => {
      'nginx' => { }
    }
  }
```

And those are the basic roles I developed. Because Everest is a complicated application there are a number of roles that I don't discuss here, but this should be more than enough to get anyone started for some good, sensible Chef cookbooks to use with Rails.

# Security & Safety

Before you deploy a server using any of these roles, make sure to keep security and safety in mind. A lot of these tools (like Graphite and Graylog2) allow web access and run servers with potential security vulnerabilities. Lock them behind Apache2 basic access, change your EC2 security group settings to allow only certain IP addresses access, and establish a VPN for your internal network. With logs, statistics, and other business-sensitive information, you can never be too security-conscious.
