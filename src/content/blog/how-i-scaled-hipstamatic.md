---
title: "How I Scaled Hipstamatic"
date: 2012-04-06 10:58
tags: [rails, servers]
---
The [Proper Refactoring](http://joshsymonds.com/blog/2012/04/03/how-to-refactor-a-large-and-old-project/) proceeds apace, but I think in my last post I gave the impression that the Hipstamatic Rails project is inefficient or, even worse, slow. Nothing could be further from the truth; over the course of two years I've been continuously improving the project to be more responsive and much, much faster. How much faster? Well, unfortunately, I don't have metrics from the first months I worked at Synthetic. But we were using XML and then plist to generate our responses to the iPhone app, and that process was achingly slow: I would estimate 200ms on average. 

Now, take a look at our average response time over the last month.

![Average response time - 115ms](http://f.cl.ly/items/1H0v0C420X0a1O3Y2p3Y/Hipstaweb%20-%20New%20Relic-1.jpg)

Considering the web of external services Hipstamatic depends on for much of its operation, I'm proud of our 115ms average response time. Proud but not satisfied -- hence the need for the Proper Refactoring, and I am optimistic that it will lead to a net performance gain for us and our users. There's no reason we can't achieve 50-70ms response times with better caching and slimmer applications.

Over the same time period that our response time has dropped, our user base has grown exponentially, and so too our traffic. At the beginning of my tenure at Synthetic our site was receiving close to 100,000 hits a day, and nearly all of that web traffic: now [community.hipstamatic.com](http://community.hipstamatic.com) sees about a million requests a day, most of that API traffic generated from our iPhone applications. That's an enormous amount of growth, and much of that over the course of just one or two explosive months.

Synthetic is [a team](http://heysynthetic.com/about_us/) of extremely talented individuals. But as our main Rails programmer and only server administrator, I wanted to discuss the lessons I personally learned in making Hipstamatic's web site and web services fast. (Or, at the very least, a lot faster.)


## Cache *Everything*

This is easily the most important, most crucial rule to making your applications fast. You'd be surprised what you can cache, and how much time caching will save. Memcached access times are ridiculously fast, faster even than the fastest database query. Stick everything in your cache. Everything. *Everything*.

![Cache all the things](http://f.cl.ly/items/3f0J2M0H3o3h0w1X1i3m/cache-all-the-things.jpg)

This is such an important rule I even gave you an annoying memegenerator image of it. Yes, people, it's memegenerator important.

You really can't go overboard enough when it comes to caching. Make resque jobs whose only purpose is to warm your caches. Use [cache sweepers](http://api.rubyonrails.org/classes/ActionController/Caching/Sweeping.html) to sensibly and programmatically expire caches. Almost 90% of our application traffic returns the same (or very similar) JSON and HTML. By caching those responses, we save massive amounts of time, and more importantly, boatloads of money (due to lessened server load).

## Choose Your Tools Wisely

Choose software that is frequently updated and widely used in the community. Choose software that is robust: by that I mean resistant to failure, and that has survived years of use in live, highly available environments. And finally and most importantly, choose software that is fast. Very, very fast.

Two years ago, we switched from a single, shared instance on A Small Orange to Amazon's Elastic Cloud, allowing us to scale each of our components as necessary and independently from each other. Speed gains were noticeable immediately, but even better was the fact that there was a whole bunch of excellent software easily available to help us manage and scale our cloud presence. (See my earlier post [on Rubber](http://joshsymonds.com/blog/2012/02/23/why-i-like-rubber/)).

One year ago, we migrated from Apache and Passenger to nginx and Unicorn. I don't want to get into software evangelism or drawn out discussions about which server software is superior; for our stack, for our requirements, nginx and Unicorn are much faster and more memory efficient than Apache and Passenger ever were. And more responsive -- the ability of Unicorn to do live deploys is just amazing and has totally revolutionized our development and deployment process.

Take the time and do the research. There's a best tool for you waiting out there -- finding it will make your life a thousand times easier.

## Less is More

For a long time, incoming requests to the app were load balanced through [HAProxy](http://haproxy.1wt.eu/) before reaching a Passenger instance. HAProxy is an amazing piece of software; it's extremely fast and gives you an awesome drill-down into incoming requests and your server status.

It also added 10 milliseconds to our response times on average.

If a piece of your stack isn't mission critical (and HAProxy, for us, was just a nice piece of software and not mission critical) then you should remove it. Amazing graphics and interesting metrics are less important than your response time. Examine your stack carefully, with a very critical eye, and whatever isn't absolutely necessary I would strongly recommend cutting out entirely.

What I found helpful to do was draw a quick flow chart of how a request is actually serviced. Nothing that you intend to present to your boss; just a small approximation of your stack. Each step on that chain adds time to that request returning a response. If it adds time to the request turnaround, it needs to be adding something important to that response. Otherwise, it needs to go.

## Achieve Balance

When we were extensively using [redis](http://redis.io/) as a semi-persistent datastore, I constantly experienced bottlenecks for redis connections. But you can encounter this problem anywhere in your server setup: I also had to deal with MySQL bottlenecks and, in one extremely memorable instance, Unicorn queue bottlenecks. These are all issues with load balancing inside the stack.

There's never a part of your stack that is immune to load balancing problems. Once you correctly scale one part, another component that performed adequately will suddenly start chugging under unexpected load or new use conditions. And, unfortunately, pre-optimization can backfire; sometimes you'll target the wrong part of your stack for optimizations, and other times you'll scale something that won't experience a bottleneck at all.

I recommend against trying to pre-scale unless you're sure that a new feature will distribute existing load in new, exciting ways. Achieving balance is an ongoing tightrope act -- you can guess to a limited extent where you'll tip after the next step, but you can never be sure until you actually take it. That's why being sensitive to your application after changes is so important. Use [New Relic](http://newrelic.com/) to monitor your setup very carefully, especially after deploys, and have plans in place to scale every component of your application if necessary.

Formal plans generally aren't required, but know what steps you'd take if something started to fail. Even ten seconds of idle thought can save you agonizing minutes of unavailability.

## Use 75% of Every Server

This rule applies doubly to servers on EC2. Instances that reach 100% memory or CPU utilization are instances that are very difficult to fix (and are much more prone to crashing in a shared environment). You can't SSH into them because they take forever to respond; you can't reboot them because they don't respond to Amazon's control plane. They are about to become horrible zombies in your setup, taking up space but refusing to die, and you'll have to route around them to keep your uptime intact.

Try to ensure your servers never reach this stage. I try to keep my computers at either 75% CPU utilization or 75% memory utilization: achieving both simultaneously is a very difficult balancing act but if you can get there then I applaud you. (As a side note, this is why Heroku is so appealing to me -- not needing to worry about maximizing your server resources sounds pretty awesome.)

If you're using less than 75%, then you can likely combine services together and remove servers. And if you're using more... well, I have [PagerDuty](http://www.pagerduty.com/) configured to call me if at any time a server reaches 85% resource usage, and those are calls I take very seriously.

I'm sure I'll think of other lessons I learned while scaling Hipstamatic. Many of these ideas are shared ideas -- for example, the amazing [Sam Soffes](http://samsoff.es/) initially encouraged us to move from Apache/Passenger to Nginx/Unicorn. However, the implementation and maintenance was mine and mine alone, and boy did I learn a lot while scaling Hipstamatic.
