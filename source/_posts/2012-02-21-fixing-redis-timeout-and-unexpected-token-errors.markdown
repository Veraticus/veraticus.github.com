---
layout: post
title: "Fixing Redis Timeout and Unexpected Token Errors"
date: 2012-02-21 12:41
comments: true
categories: [redis, server]
---
Ran into some annoying problems with redis and resque recently that couldn't be immediately solved through judicious Googling, so figured I'd make a quick post about it.

## Resource temporarily unavailable - Timeout reading from the socket

If you installed redis-rb and hiredis by following the [instructions at the redis-rb github page](https://github.com/ezmobius/redis-rb) then you might start running into this problem. Essentially, the version of hiredis they specify (and that you probably installed) is out of date -- 0.3.1 has a known bug with socket disconnects when reading from redis. So happily, the solution to this is pretty simple: just upgrade your version of hiredis. We use 0.4.4 now.

## unexpected token at 'OK' (Resque::Helpers::DecodeException)

This one took a bit more tracking down to fix.

The newest versions of resque (I'm using 1.20.0) rely on versions greater than 2.4 of redis. Versions below that respond differently to certainly redis commands -- for example, returning "OK." Upgrading your redis server handily fixes this problem.