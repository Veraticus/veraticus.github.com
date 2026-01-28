---
title: "Huey Gem Release"
date: 2012-12-21 01:53
tags: [gems, huey]
---
I pushed the first version of [Huey](https://github.com/Veraticus/huey) to [RubyGems](http://rubygems.org/gems/huey) (calling it 0.1.0).

It's in a really good state right now, actually -- in addition to a rather full and complete set of tests, I added a couple neat new features:

* Now you can make as many changes as you like to a bulb, and then commit them all at once with `save` (alias as `commit` for your convenience). 

* Ability to set colors as a RGB hex. So you can do `bulb.rgb  = '#8FF1F5'` to get your bulb to be colored aqua. Colors in Hue are a little more pastel than you might expect, though, so exact shade matching might take a bit of experimentation.

* Copyright and license information.

I'll be adding more features as I use it more, so watch [the repository](https://github.com/Veraticus/huey) for changes.
