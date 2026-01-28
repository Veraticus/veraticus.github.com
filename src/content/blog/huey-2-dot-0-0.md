---
title: "Huey 2.0.0"
date: 2013-05-09 11:18
tags: [gems, huey]
---
Today I released [Huey](https://github.com/Veraticus/huey) version 2.0.0! Though it contains a number of small bug fixes, the biggest change is switching away from SSDP to using the Hue's own bridge discovery protocol. This is both faster and more extensible -- now when you make the initial request for the Hue bridge IP, it takes a fraction of the time SSDP did. And you can also manually specify the IP yourself, like so:

```ruby
Huey.configure do |config|
  config.hue_ip = '123.456.789.012'
end
```

With some clever port forwarding on your router combined with this new option, Huey is now usable on servers outside your local network.

SSDP is still easily enabled if you prefer that over this new method, or find that the Hue bridge discovery API is problematic. Huey just keeps getting better, but let me know if you run into an issues with it [at the repository](https://github.com/Veraticus/huey). Happy Hueing!
