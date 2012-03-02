---
layout: post
title: "Setting up Unicorn in a Production Environment"
date: 2012-02-27 10:20
comments: true
categories: [unicorn, servers]
---
Configuring unicorn for your Rails servers is as much an art as it is a science.

That said, there are some things that make the configuration and setup a lot easier that I wish I had known before I had taken the unicorn plunge.

<!-- more -->

## worker_processes
I searched high and low for a guide on how many workers each of my unicorns should employ and came up empty-handed. Unfortunately, this is highly dependent on your application. If you do complicated ImageMagick or PDF transformations on your server threads (which you shouldn't with unicorn, but hey, who knows) then your threads will use a lot of memory, especially on those operations. For reference, our Rails app takes up about 25 megabytes of memory per worker. However, we have offloaded all of our long-running and memory-intensive tasks into Resque.

We use EC2's m1.xlarge instance class and have 30 workers running per server. This number is intentionally set low; in my experience, the closer you come to maximum resource usage in an EC2 instance, the more likely it is to crash, or even worse become unresponsive.

## working_directory

This should be fairly straightforward but has an important caveat: make sure to make this the static path of your current deploy, so the actual target of your symlink. Ours is ```'/our/app/directory/current'```. Putting fanciness in here is very likely to get you shot in the foot with unicorn not reloading your app correctly, so I can't stress enough, just make this a simple string.

## listen

Our backlog is set to 64. If a unicorn has 64 queued connections likely it's dead and we need failover to happen immediately; nginx takes care of that when unicorn refuses to service a request.

## preload_app

true.

## Gemfile

We had an issue where unicorn wouldn't pick up our Gemfile correctly. Turns out that it doesn't understand symlinked directories for reading gemfiles, so we had to employ this dazzling bit of code to get new gems into our bundle when the unicorns restarted:

```ruby
before_exec do |server|
  ENV['BUNDLE_GEMFILE'] = '/mnt/Hipstaweb-<%= RUBBER_ENV %>/current/Gemfile'
end
```

## before_fork and after_fork magic

If you're seriously considering unicorn, I'm sure you've seen the following gisted:

```ruby
before_fork do |server, worker|
  defined?(ActiveRecord::Base) and
    ActiveRecord::Base.connection.disconnect!

  old_pid = "#{server.config[:pid]}.oldbin"
  if File.exists?(old_pid) && server.pid != old_pid
    begin
      Process.kill("QUIT", File.read(old_pid).to_i)
    rescue Errno::ENOENT, Errno::ESRCH
    end
  end
end
```ruby

But just to reinforce how awesome it is: this configuration is awesome. It allows your new unicorn to gracefully kill the old master while a new one seamlessly reloads. This is the key to one of unicorn's biggest selling points -- zero downtime deploys.

```ruby
after_fork do |server, worker|
  ActiveRecord::Base.establish_connection
  ActiveRecord::Base.verify_active_connections!
end
```

If you include the ```connection.disconnect!``` line in your before_fork, make sure you reestablish the connection in your after_fork. This prevents stale database connections and ensures each worker is always correctly connected to the database.

(As a postscript to this post: your unicorn servers are required to have [My Little Pony](http://en.wikipedia.org/wiki/List_of_My_Little_Pony:_Friendship_Is_Magic_characters) server names.)