---
title: "Fnordmetric: Native Rails Metrics"
date: 2012-03-13 22:05
tags: [ruby, rails]
---
Over the weekend I spent some time getting [Fnordmetric](https://github.com/paulasmuth/fnordmetric) set up in an application. On the surface it looks really cool and quite nifty, but I ran into some trouble getting it configured how I wanted it and figured I'd make a post about it. I think I might have been struggling against the conventions in it a little too much, but it was still an instructive battle.

## Engineize It
The Gem itself assumes you'll be running it on its own port, presumably redirecting nginx traffic there. But this is 2012 and Rails engines are all the rage -- so why bother with a separate app? Well, I'll get to the reason why later, but mounting it as an engine is pretty simple.

Set up an initializer or something that defines all the Fnord metrics you want, something like ```config/initializers/fnord.rb```
```ruby
require "fnordmetric"

FnordMetric.namespace :analytics do
  gauge :events_total, 
    :tick => 1.day.to_i, 
    :progressive => true,
    :title => "Events (total)"


  event(:"*") do
    incr :events_tota
  end
end

FnordMetric.server_configuration = {
  :redis_url => "redis://localhost:6379",
  :redis_prefix => "fnordmetric",
  :inbound_stream => ["0.0.0.0", "1339"],
  :start_worker => true,
  :print_stats => 3,
  :event_queue_ttl => 120,
  :event_data_ttl => 3600*24*30,
  :session_data_ttl => 3600*24*30
}
```

That stuff is copy-pasted from the Github README, so I won't go into explaining it. Note that we do not include FnordMetric.standalone at the bottom, however; we'll be mounting the server ourselves in routes.rb like so:

```ruby
  mount FnordMetric.embedded, :at => "/fnord"
```

Then you can go to localhost:3000/fnord, and tada! Fnord metrics!

## Set Up a Worker
The difficult, of course, is that each instance of your app will now also spin up its own instance of a FnordWorker, which might not be what you want. I got around this by altering my config/initializers/fnord.rb:

```ruby
FnordMetric.server_configuration = {
  :redis_url => "redis://localhost:6379",
  :redis_prefix => "fnordmetric",
  :inbound_stream => ["0.0.0.0", "1339"],
  :start_worker => (Rails.env.development? || ENV['FNORD_WORKER'] ? true : false),
  :print_stats => 3,
  :event_queue_ttl => 120,
  :event_data_ttl => 3600*24*30,
  :session_data_ttl => 3600*24*30
}
```

I know some people hate the ternary operator, but I kind of like it. Anyway, this causes the worker to start only if there's an environment variable set to start it or the Rails environment is development. I set up one instance that receives this variable when it starts, and now I only have one worker. Simplicity itself!

Ultimately, I like Fnordmetric, but I'm not using it in my production applications. I feel like there's a level of abstraction to go before it's really usable in big production apps. It's much better at tracking arbitrary metrics than NewRelic -- honestly, trying to shoehorn stats into their system feels silly at times -- but setting up the tracking stuff is a pain, involving a lot of unnecessary repetition. I think that a Fnordmetric2.0 would be awesome, though, so I hope the project sees more love and work. And who knows, if I have some time I'll try contributing to it myself. That's the joy of open source: if you have a good idea, you make it happen.
