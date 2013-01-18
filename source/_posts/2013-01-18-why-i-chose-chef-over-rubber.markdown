---
layout: post
title: "Why I Chose Chef Over Rubber"
date: 2013-01-18 14:34
comments: true
categories: [servers, chef]
---
One of my mandates at Everest has been to sanitize the server build and deploy process. Provisioning every server individually with the same bash script was not exactly the height of extensibility and maintainability, and unfortunately had resulted in an enormous cluster that was very opaque: there was nearly no visibility into what the servers were actually doing. When I evaluated options to create a better process I looked at my go-to configuration management tool, [rubber](https://github.com/wr0ngway/rubber), in addition to [Chef](http://en.wikipedia.org/wiki/Chef_(software\)) and [Puppet](http://en.wikipedia.org/wiki/Puppet_(software\)). As a result of this evaluation -- and surprising even myself -- I ended up choosing Chef as our solution. Here's why.

<!-- more -->

## Collaboration

One of rubber's weaknesses is it is not a particularly great collaborative tool. If both you and someone else are provisioning a new server simultaneously, you'll get a merge conflict in your server yaml file: you really don't want to make a mistake resolving *that* merge conflict.

By contrast, it's really easy for multiple people to work together in Chef. You can be working in the same cookbook, even, and just altering different recipes. Bootstrapping several servers simultaneously couldn't be easier. And treating the Chef server as the central authority for cookbooks is also extremely helpful for keeping everyone on the same page with regards to what's actually going into the servers.

Chef is just a better tool for teams of people.

## Extensibility & Community Support

For the tools that rubber provides in its stack -- and it provides a lot -- it's an excellent solution. But adding additional facilities into rubber is a pain. You either have to come up with recipes on your own, or hope that someone has a semi-active fork with what you want in it. There's no real extensibility, and while it's easy enough to roll your own recipes, it'd definitely be ideal not to repeat work if you're fairly confident someone else has already done it.

Enter Chef cookbooks. There are a frightening amount of active cookbooks on Github for every need imaginable. Many are actively supported, and even if they're not precisely what you're looking for, they provide an excellent jumping-off point for creating your own solutions.

We're using the excellent [librarian](https://github.com/applicationsonline/librarian) gem to manage our external cookbooks and the source cookbooks I've been developing internally for us. It's a great way to treat cookbooks like any other dependency to resolve, and will save you a lot of time in git cloning repositories.

## More Granularity

rubber allows you to control a lot, on a per-server basis. But it has no real equivalent to data bags or even environments. Adding a user's SSH key to my deploy recipe used to be an unpleasant process. Now I can just update the users data bag with a new entry and instruct my servers to pull it: tada, new user on the servers.

Similarly changing postfix configuration on a per-environment basis is a snap.

# But Rubber is a Great Tool

Don't get me wrong: I still really like rubber. It doesn't fit for Everest's use case, definitely -- with so many servers and so much going on behind the scenes, we really needed more granularity, control, and power. But if I were provisioning just one server, or even three or four, then rubber would still be my go-to tool.

Why? It's just a whole lot faster to get started with than Chef. It makes tons of sensible default decisions that simplify your life really significantly. You don't have to go searching for good recipes or the right way to do things. Just like Rails, rubber **knows** the right way to do things. As long as you take its advice you'll go far, but trying to work against its defaults will be really painful.

## Final Word on Chef vs. Puppet

Doesn't matter, choose whichever you like more.