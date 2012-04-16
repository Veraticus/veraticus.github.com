---
layout: post
title: "Achieving 100% Uptime"
date: 2012-04-09 17:52
comments: true
categories: [rails, servers]
---
![Uptime - 100%](http://f.cl.ly/items/0q2M3B2o1f1D1D451B1S/uptime.jpg)

Keeping a highly available web application online is no joke. Everything above 99% is extremely impressive; that means that you battled the forces of [erosion](http://en.wikipedia.org/wiki/Software_erosion) and probably even deployed some pretty neat features without even a hiccup from your users' perspective. I always feel great when I get our weekly [New Relic](http://newrelic.com/) status report email -- it's a good indication of how well I did my job in the previous week. And for a couple weeks now I'm happy to report I've been very proud indeed, with 100% uptime on the Hipstamatic web application.

How do you achieve numbers like these? Unfortunately getting to 100% isn't an easy road, and I want to state up front that I also don't think it's a realistic goal. Issues you can't control can ruin your uptime number, and you shouldn't feel broken up about that. It happens to everybody. But it's always good setting goals that are difficult to achieve, and this one is no different.

So what's the secret to 100% uptime?

<!-- more -->

## Watch It Constantly

Some people check their fantasy baseball league or their portfolio every morning. At the slightest hint of trouble, they'll be waist-deep in trading players or stocks to get everything right back on track. You should be that way with your servers and the software that runs on them. This usually means monitoring software, and a lot of it.

At Hipstamatic, we make extensive use of New Relic to give us a broad overview of our application. It helps us proactively fix nascent problems, analyzing slow queries and sluggish pages. But you need something closer to the metal, and for that we use [monit](http://mmonit.com/monit/). Monit is an amazing tool to control your applications' behavior and warn you when that behavior becomes dangerous. Here's a sample of our unicorn monit file:

```bash
  if totalmem > 70% for 4 cycles then alert
  if totalmem > 90% for 6 cycles then exec "kill -USR2 `cat /pids/unicorn.pid`"
  if cpu > 70% for 4 cycles then alert
  if cpu > 90% for 6 cycles then exec "kill -USR2 `cat /pids/unicorn.pid`"
```

This states that I get an alert when unicorn's total memory or CPU usage exceeds 70%, and that unicorn receives a USR2 signal when total memory or CPU exceed 90%.

Finally, we employ [munin](http://munin-monitoring.org/) to compile statistics that we care about, including nginx connections and unicorn requests served.

Yes, this is a lot of monitoring. But I feel like even this isn't enough. You can't watch your stack too carefully, and you can't have too many tools in place to help you analyze what's going on. Consider this trifecta of tools only a start, but at least it's a good one.

## Seamless Deploys

On an average week I deploy seven to ten times. Of course, this entire process is invisible to our users; the magic that makes this happen is [unicorn](http://unicorn.bogomips.org/). There have been many posts on the wonders of unicorn and how to configure it correctly. I will simply post the part of our `unicorn.rb` that allows us to do seamless restarting, which you can find in a number of gists essentially unmodified.

```ruby
before_fork do |server, worker|
  old_pid = "#{server.config[:pid]}.oldbin"
  if File.exists?(old_pid) && server.pid != old_pid
    begin
      Process.kill("QUIT", File.read(old_pid).to_i)
    rescue Errno::ENOENT, Errno::ESRCH
    end
  end
end
```

The command we use to restart unicorn is:

```bash
  if [ ! -f '/pids/unicorn.pid' ]; then cd current_path && bundle exec unicorn_rails -c ./config/unicorn.rb -E production -D; else kill -USR2 `cat /pids/unicorn.pid`; fi
```

USR2 is the signal that tells unicorn to start reloading itself: the before_fork causes the new server to kill the old server only when it's ready to start processing connections.

## Migrations Without Downtime

The last key component to 100% uptime is migrating your database without bringing your site down. Of course, this only applies if you're changing how existing code interacts with the database -- for new tables, simply migrate before deploying and you're done. If only it could be that easy all the time...

Frequently we are required to change existing tables and colums or add new ones. For those of us still using relational databases, migrations almost always mean locked tables, and locked tables mean site downtime. To fix this problem, my tool of choice has been [Large Hadron Migrator](https://github.com/soundcloud/large-hadron-migrator). Large Hadron Migrator requires very little from your tables (just an autoincrementing ID) and allows you to alter tables and even add new columns without bringing your site down.

```ruby
class AddOrdersCountToUsers < ActiveRecord::Migration

  def self.up
    Lhm.change_table(:users) do |m|
      m.ddl("ALTER TABLE #{m.name} ADD COLUMN orders_count INT(11) default 0")
    end
  end

  def self.down
    Lhm.change_table(:users) do |m|
      m.ddl("ALTER TABLE #{m.name} DROP COLUMN orders_count")
    end
  end
  
end
```

Yes, unfortunately, this includes raw SQL. There is a [small DSL](http://rubydoc.info/github/soundcloud/large-hadron-migrator/master/Lhm/Migrator#add_column-instance_method) that exposes a few common methods, but for anything really deep you're gonna need to get your hands dirty. Using this method you'll be able to become the envy of your friends and peers, for you'll be able to execute zero downtime migrations.

And those three points are the main ways I've reduced our downtime. It's a difficult road to 100%, but it's worth it because you can stare at pretty graphs like this:

![Better than Facebook](http://f.cl.ly/items/470B350J0U0q1u3r0T0s/availability-1.jpg)

And imagine that your website and a 100% bar are sitting right at the very tippy top.