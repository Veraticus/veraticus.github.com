---
title: "Huey, for Controlling Phillips Hue Lightbulbs"
date: 2012-11-28 01:08
tags: [gems, huey]
---
I just authored a cool little Gem that allows for automatic discovery of, and control over, the pretty nifty [Phillips Hue lightbulbs](http://meethue.com). I decided to name it [Huey](https://github.com/Veraticus/huey), since I love nothing more than cute and silly names. I only spent a few hours tonight hacking it together, so I'm sure there's a lot of room for improvement, but it works and does everything it's supposed to and seems fairly fault tolerant; so I thought, why not announce it and fix problems when I wake up tomorrow?


Huey uses [SSDP](http://en.wikipedia.org/wiki/Simple_Service_Discovery_Protocol) to discover the IP of the Hue hub the first time the code is run. I wish I could take credit for the EventMachine code that went into making this work correctly, but actually I largely cribbed it from Turboladen's [upnp library](https://github.com/turboladen/upnp). I would've just included it as a Gem dependency but for some reason it's not released as a Gem, which is pretty frustrating for situations like this.

I chose a pretty boring UUID for Huey to use: ```'0123456789abdcef0123456789abcdef'```. This works just fine, but if you want to change it Huey is ultra-configurable and you can do so either in a block or directly:

```ruby
  Huey.configure do |config|
    config.uuid = '0123456789abdcef0123456789abcdef'
  end
  # or
  Huey::Config.uuid = '0123456789abdcef0123456789abcdef'
```

The first time you issue a request to the Hue hub, you'll likely see an attractive error message like this:

```ruby
  Huey::Errors::PressLinkButton: 'Press the link button and try your request again'
```

Unfortunately, the first time any request is sent, Hue needs to validate the new client by you actually walking over and touching the link button on the hub. But once you do that, you can just resend the request and it should work fine. Then you can use the whole gamut of the Hue API:

```ruby
Huey::Bulb.all # Returns an array of your bulbs

bulb = Huey::Bulb.find(1) # Finds the bulb with the ID of 1
bulb = Huey::Bulb.find('Living Room') # Finds the bulb with the name 'Living Room'

bulb.alert! # Flashes the bulb in question once, useful for checking connectivity
bulb.on = false # Turn the bulb off
bulb.bri = 100 # Dim the bulb a little bit
bulb.ct = 500 # Change the bulb's color
```

I think Huey is pretty cool and I definitely intend to make a lot of use out of it. I'll be updating it constantly as I do so to support more and better features, so follow the repository and let me know what you think.
