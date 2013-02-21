---
layout: post
title: "Home Automation With Phillips Hue &amp; Huey"
date: 2013-02-20 19:32
comments: true
categories: [gems, huey]
---
I released v1.0.0 of [huey](https://github.com/Veraticus/huey) today, adding some exciting new features: specifically, light groups and group events. Using them enabled me to quickly and easily set up a light timing schedule from one of my home machines, managed with cron (through the excellent [whenever](https://github.com/javan/whenever) gem). In case you too would like awesome automatic light magic, here's how to make it work.

<!-- more -->

## Huey v1.0.0

New in huey v1.0.0 are light groups: arbitrary collections of bulbs on which you can run commands simultaneously. Getting them to work is ridiculously simple:

```ruby
Huey::Group.new('Living Room') # Contains all bulbs that have 'Living Room' in their name
Huey::Group.new('Living Room', 'Foyer') # All bulbs that have either 'Living Room' or 'Foyer' in their name
g = Huey::Group.new(Huey::Bulb.find(1), Huey::Bulb.find(3)) # A group specifically containing bulbs 1 and 3
g.name = 'My Bulbs' # Name your group to find it later
```

Once you have a group set up, you can act on all its bulbs simultaneously as you would on any individual bulb.

```ruby
group = Huey::Group.find('My Bulbs')

group.bri = 200
group.on = true
group.save # All changes you've made are committed to all the bulbs in a group

group.update(bri: 200, ct: 500) # Set and save in one step
```

Of course, you probably want to do the same actions to groups over and over again: for example, dimming all your lights at night and brightening them in the morning. For that we have a shorthand called events:

```ruby
event = Huey::Event.new(name: 'All Lights Off', group: group, actions: {on: false})
event.execute # All lights turn off
```

## YAML Setup

Huey can read your groups and events from YAML configuration files. Here's a sample from my setup:

```yaml
# groups.yml
Study: ["Study Side", "Study Ceiling"]
Bedroom: ["Bedroom Left", "Bedroom Right"]
Living Room: ["Living Room Front", "Living Room Center", "Living Room Back"]
```

```yaml
# events.yml
Wakeup:
  group: Bedroom
  actions:
    "on": true
    bri: 255
    ct: 200

Sunset:
  group: Bedroom
  actions:
    "on": true
    bri: 255
    ct: 350
```

```ruby
Huey::Group.import('groups.yml') # Import groups
Huey::Event.import('events.yml') # Import events
Huey::Event.find('Wakeup').execute # Run an event on a group
```

I'm setting up three groups here, called Study, Bedroom, and Living Room. I have a lot of potential events and I selected two to show here: what happens when we wake up, and the corresponding later afternoon setup. (If we end up hating this it's likely to change, but it gives you an idea how this is supposed to work, anyhow.) Once everything is slurped in, running an event is simple.

## Whenever

Finally, I have it all stitched together through whenever, because who likes reading crontabs? When you set up whenever, it creates a file called config/schedule.rb that it uses to read the crontab. I altered mine to include this:

```ruby
job_type :event, %Q(cd /directory/to/huey_control && ruby -e "require 'huey'; Huey::Group.import('groups.yml'); Huey::Event.import('events.yml'); Huey::Event.find(':task').execute(true)")

every :weekday, at: '9:30AM' do
  event "Wakeup"
end
```

To install your new crontab, use `whenever --update-crontab`.

That's all there is to it! Now your Hue lights will work in perfect synchronization with the schedule you've provided, allowing you to set up your home lighting system however you like, and alter it easily from cron.

But there's a lot more you can do with huey if you'd like. Why not make an event that's triggered by an incoming email or phone call? Or set your door bell to flash your lights instead of ring a chime? With events and light groups, setting up this kind of awesome automation functionality is easier than ever. So go do something cool with it!