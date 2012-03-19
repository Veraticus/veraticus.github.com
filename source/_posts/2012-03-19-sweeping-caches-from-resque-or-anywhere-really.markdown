---
layout: post
title: "Sweeping Caches from Resque (or Anywhere Really)"
date: 2012-03-19 10:29
comments: true
categories: [rails, resque]
---
Phil Karlton, someone I can only presume is a pretty smart programmer, said ["there are only two hard things in Computer Science: cache invalidation and naming things."](http://martinfowler.com/bliki/TwoHardThings.html) He's totally right; cache invalidation is one of the biggest headaches when designing highly usable, highly available websites and is something that I'm sure every Rails programmer worth their salt has struggled with. (Naming things is also a pain but not the focus of this post.)

<!-- more -->

And unfortunately the reason for the struggle is that Rails' caching tools don't go nearly as far as they should. This is really through no fault of their own; honestly, Rails' caching methods are amazingly robust, and if you don't know what they are, you should read [the guide](http://guides.rubyonrails.org/caching_with_rails.html) on them. But good tools can only take you so far. Ultimately, caching is as application-specific as you can get, and when you get to finely-grained control you have to take the reins yourself.

One of the problems I ran into recently was invalidating caches during an association join. I have two models, album and photo, and when one is added to the other I wanted to expire all the caches dealing with both. I already have [cache sweepers](http://api.rubyonrails.org/classes/ActionController/Caching/Sweeping.html) in my application, but callbacks aren't triggered on association. And putting something in an after_add on the association itself didn't seem like the right answer; why should I put cache expiration stuff in my model when I already have sweepers dedicated to that logic?

I'm not sure I'm in love with the solution I came up with, but it certainly seems to work. All of the association logic happens in Resque jobs, so I added the cache invalidation directly to this jobs by invoking the sweeper manually:

```ruby
PhotoSweeper.send(:new).expire_cache_for(photo)
```

The ```send``` business is necessary because new is a private method for sweepers. Nevertheless this really seems to get the job done; the caches are swept appropriately, and my cache invalidation logic remains safely in the sweepers, where I can add or edit it as much as I want. I suppose if I really wanted to I could put this in an after_add on the model as well. I've resisted that so far but maybe it's the logical place for this kind of expiration logic to happen.