---
layout: post
title: "Why I'm Not Using RubyMotion in Production"
date: 2013-06-26 12:11
comments: true
categories: [rubymotion]
---
> **Based on recent bugfixes and refinements by the RubyMotion team, I've posted [an update to this blog post](http://joshsymonds.com/blog/2013/08/07/rubymotion-update-one-month-later/). Check it out after reading this article.**

I'm a big proponent of RubyMotion -- a year and a month ago, I wrote an article titled "[Why RubyMotion is Better Than Objective-C](http://joshsymonds.com/blog/2012/05/04/why-rubymotion-is-better-than-objective-c/)" and despite its divisiveness I still stand behind the points I made. Recently I've been doing a lot of OSX and iOS coding, coming out with a [Mac app](http://gistifyapp.com) and working on a new iPhone app for a client. For both projects, though I initially evaluated RubyMotion, I ended up settling on using Objective-C. Given that my blog post is frequently cited as a reason to adopt RubyMotion, after more than a year of its use, I wanted to weigh in on why I believe it isn't an appropriate choice for production applications.

<!-- more -->

Before I begin, I'd like to say that I still use RubyMotion frequently and have made production (and prototype) applications built in it. I still love it, have renewed my RubyMotion license, and will do so for the foreseeable future. I believe it is a more productive option for coding than Objective-C. But it has a number of critical issues, and I feel compelled to say that it is an inappropriate choice for those looking for a platform to produce, distribute, and develop iPhone or Mac apps intended for broad release.

## RubyMotion's ARC-equivalent is buggy

This is the main problem with RubyMotion, but it disguises a host of smaller issues with the RubyMotion project and community that's grown up around it.

RubyMotion, for those who don't know, uses its own analog to Apple's automatic reference counting to obviate the need for manual retention and release of objects. It usually works great. But unfortunately it sometimes prematurely releases objects (or possibly fails to retain them?), leading to hard-to-diagnose memory access errors. Most tragically, these errors occur randomly from a user's perspective -- sometimes the code will succeed (since the memory being referenced still contains the object the OS is expecting, despite being released) while other times it will fail (when the memory contains other data).

This happens most frequently when using blocks and is easily reproducible with a very simple test case:

```ruby
class Test
  def test
    foo = 42
    Proc.new { foo + 123 } # The local variable foo is released when the function ends
  end
end
Test.new.test.call # Memory access error -- crashes sometimes, not all the time
```

This example is straight from the RubyMotion bug tracker, where this issue is designated [RM-3](http://hipbyte.myjetbrains.com/youtrack/issue/RM-3). Despite being discovered four months ago, the problem has yet to be fixed. In the interim, instead, OSX support was revealed to great fanfare -- and this same issue occurs on the new platform. I'm as excited as the next guy for cool new features, but production applications are experiencing this error, and while it must be incredibly difficult to fix, a fix would be very welcome indeed.

Of course, there's a workaround. Instance variables are retained by the class, so changing `foo` above to `@foo` will correct the crashing error -- sometimes. I've used instance variables and have still experienced crashes in blocks and I'm frankly not sure if it's due to this error or something else entirely.

And that's really the core issue: it's difficult to determine which memory access errors are due to RM-3, which are the result of some other RubyMotion retain/release error, and which are caused by you screwing something up.

## Why is this a problem?

Aside from the severity of this issue -- randomly crashing code and memory access errors are, in my mind, emergencies to be corrected as soon as humanly possible -- the way that the bug has been handled, both by the community and the RubyMotion team, is very concerning.

The RubyMotion team is very small. Making a garbage collector that's as stable and performant as Objective-C's ARC (developed over years by many smart programmers) is a tall task indeed for a tiny group of people, regardless of their obvious brilliance. But more concerning than the time it's taken to fix this error is the lack of communication and visibility regarding it. There's been little said to the community about the severity of this issue, when a fix is expected, or how to properly diagnose and repair the problem until a release patches it.

As developers, we use tools like RubyMotion not just for hobby projects, but to create real products that are used daily. We must be able to expect that critical flaws in our toolchains will be fixed promptly -- otherwise it's irresponsible of us to create our applications using them. And this isn't the only old bug that hasn't been discussed in awhile: the bug tracker is littered with issues of varying severity that are not scheduled for fixing and have no recent comments from the RubyMotion team.

The RubyMotion community, meanwhile, is an amazing place full of overwhelmingly positive people... which I think works against us when trying to raise concerns with the framework itself. I really like RubyMotion and I think many in the community feel the same. Voicing serious problems is much less exciting for us than discussing new features or building awesome wrappers, so those who do point them out are largely ignored or dismissed as naysayers.

Happily, this seems to be changing.

## Why post about this now?

Because of [this email thread](https://groups.google.com/forum/#!topic/rubymotion/x6-9c__IHH0) in the RubyMotion group. Summary: lots of people are experiencing memory-related issues that are a result of RM-3 or possibly some other difficult-to-identify problem with RubyMotion's memory management, and they're coming forward and talking about them. One post in the thread states:

<blockquote>I'm experiencing these memory-related types of crashes (like SIGSEGV and SIGBUS) with about 10-20% of users in production.</blockquote>

That's a truly startling number if accurate. I haven't bundled Crittercism (or another app performance analyzer) in production, but I've heard from people using my applications who have experienced random crashes that I can only assume are memory-related. And mine is admittedly an incredibly simple app -- apps with more views and complicated networking code seem like they'd be leaving themselves open to even more potential memory-related errors. (Generally, it seems like the more asynchronous stuff you do, the more likely your code is to hit a released object.)

While I've personally experienced these RubyMotion memory problems myself, I never thought they were part of a bigger problem: I don't regularly go to meetups or watch the bug tracker, and was startled to discover that the issues were endemic to the community. People have been trying to raise visibility of these problems but so far there's been little said about them outside of the issue tracker and a few isolated posts in the community group.

While I think RubyMotion is a great project and I love using it, it's inarguable that these memory-management issues are serious, fundamental flaws in the framework. They prevent the creation of stable, reliable code through no fault of the developer's, leading to random crashes and poor user experience. Thus I cannot recommend anyone use RubyMotion for applications that users will touch until these issues are sorted out -- which I hope they will be, and very soon.
