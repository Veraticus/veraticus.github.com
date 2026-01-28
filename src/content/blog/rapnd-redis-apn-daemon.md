---
title: "Rapnd: Redis APN Daemon"
date: 2012-02-21 13:21
tags: [rapnd, redis]
---
[rapnd](http://github.com/Veraticus/rapnd) is a gem I developed to create a persistent connection through which to pass messages to Apple's Push Notification servers. It's pretty neat and you should check it out.

## Why another push notification gem?

The existing ones just didn't do what I wanted. There were some that created persistent daemon connections... but they were only usable with one app, and we have two apps we want to send push notifications for. There were some with multiple app support, but they didn't have daemons or they assumed the existence of ActiveRecord. And in my opinion using ActiveRecord to store notifications is pretty dumb.

## Whoa! ActiveRecord is just fine, bro.

Yeah, I love ActiveRecord. But it's clearly the wrong storage solution for push notifications. For every single push notification we send, we couldn't care less about the content or whether or not it was actually delivered -- so storing them in the database just built a huge table that we ended up not needing at all. Redis is the perfect solution: it can handle arbitrarily-sized lists, but doesn't bother with any significant kind of persistence. Also, blpop made the programming a breeze.

## Why a daemon?

Well, Apple tells you to do it. But for a more important reason, Apple claims that constantly established and dropped connections to their servers will result in IP blacklisting. I've never actually seen this in practice, but... well... why chance it? rapnd uses one connection per daemon and tries to keep it open as long as possible.

So yeah, it's pretty cool. Go check out [the rapnd github page](http://github.com/Veraticus/rapnd) to see the deets.
