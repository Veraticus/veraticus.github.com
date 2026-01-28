---
title: "My Love/Hate Relationship with Heroku"
date: 2012-06-03 22:43
tags: [servers]
---
There's been [some](http://justcramer.com/2012/06/02/the-cloud-is-not-for-you/) [discussion](http://rdegges.com/heroku-isnt-for-idiots) recently about the relative merits of [Heroku](http://heroku.com). I've managed applications both inside Heroku and outside it, and personally speaking, I just can't decide whether or not I like the web's premier platform-as-a-service or not. Every now and again I'll gnash my teeth in frustration over it, and then other times I'll sigh dreamily and think of all the wonderful things Heroku has done for me -- and indeed, for the world. So I jotted down a quick list of pros and cons that I think everyone considering Heroku should know; then, at least, you can make an informed decision as to whether or not it's right for you.


## Pros

### Lets Me Sleep At Night

I get paged from Hipstaweb servers every now and again at odd hours, and usually for horribly arcane reasons -- an AWS instance became unresponsive, or a logfile that I thought was getting truncated suddenly spiralled out of control, or all the other small things that make systems administration so interesting. Heroku has never, ever had a stability problem like that. I imagine that sometimes stuff like that happens, but when it does Heroku just kills the dead or dying dyno behind the scenes and starts up a new one.

Heroku's Postgres instances also do automatic backups and have always been available whenever I've needed them. Heroku doesn't pay their infrastructure team enough, in my opinion; I've seriously never had a single outage of any sort on their service, and I have this comforting belief that if something did go horribly awry, I would be in good hands.

### Easy & Fast 

Getting started on Heroku is ridiculously easy. You can have an app deployed there in just a minute or two, all from doing nothing more than adding a git remote and pushing to it. No matter how good your Chef recipes are, it'll take you at least fifteen minutes to get a bare EC2 instance provisioned from nothing to accepting HTTP connections. After you do that, of course, clever use of AMIs will get there much quicker... but still nowhere near as fast as Heroku.

### Extensible

This is sort of a rider to "easy & fast," but I think it deserves its own bulletpoint. Heroku addons provide managed solutions for nearly every need your application might have. Email sending, Redis instances, elasticsearch searching... and it's really cool of Heroku to essentially provide marketing for these smaller SaaS companies. Additionally all of the addons I've used have worked really well, so there's definitely some quality control going on.

### Flexible

Heroku's Cedar stack is really cool. Not only can you run whatever server software you want on it (I use unicorn), but you can spin up Resque workers, rapnd daemons -- essentially anything at all, as long as you're willing to pay for the dyno it runs on. The flexibility Heroku provides allows you to run nearly anything in their managed environment, and then scale it however you find appropriate. With correct separation of concerns, this provides you an enormous amount of control over how your application is deployed and how you can respond to traffic influxes.

## Cons

### Expensive

There's really no getting around this one. SmashingBoxes wrote [a cost comparison](http://smashingboxes.com/heroku-vs-amazon-web-services/) between Heroku and AWS, and their conclusion is inescapable: Heroku is costly. And it's not just Heroku -- especially once you start throwing in addons, your credit card will start hurting hard. RedisToGo is very pricey, and the Postgres database options are seriously expensive. Heroku provides quite a lot, so their cost understandable, but it is definitely a cost... and a big one, at that.

### Deploys Suck

Deploying to Heroku is easy and fast -- the first time. But then when you compare the speed and ease of ongoing deployments to your own servers you start scratching your head. Compiling a slug takes a while. After slug compilation is complete, your dynos must restart: and during the restart your application is completely offline. There's no unicorn-style rolling deployments here. For small applications this is somewhat acceptable -- in a bare Rails application, my dynos restarted in 300-400 milliseconds. But in a big application you can be offline for excrucating, horrifying seconds, and that really sucks.

### Addon Constrained

If you want to do something really customized or compiled on Heroku -- something that needs the JRE, for example -- you're pretty much screwed unless an addon already exists for it. You can't compile elasticsearch or Lucene yourself, and if you don't like the addons that provide those solutions you're essentially out of luck. You'll need to spool up your own EC2 instance, add Heroku's security group, and connect your application to it. But then you have to manage that EC2 instance yourself. And if you're doing that, why not just manage the entire application yourself as well?

## Conclusions

All this boils down to pretty much one thing: is your app going to be big, or small? Small apps that require few dynos and no add-ons are extremely cost efficient and benefit from Heroku's platform-as-a-service. They're fast to deploy because they don't take as long to compile, and the dynos serving them restart more quickly But bigger addons will be more expensive -- and when you restart them, they take awhile to come back up. Also as an application grows your need for customized software will grow as well. Say you need hand-compiled elasticsearch or something like that; that's just something that Heroku can't provide.

So, for a big application, I would stick to doing it by hand. Yes, you'll have a few more infrastructure annoyances, but you'll need the control.

But! All big appliations started small. There's nothing preventing you from starting on Heroku and then migrating to some other solution when you start hitting stumbling blocks. Migrating data can be frustrating, but if you need Heroku's ability to start lean and quick, then don't be afraid to go for it. Just always have an eye on your exit strategy, so that when you need to do something yourself, it's easy and fast. And that's the real beauty of Heroku -- it gives you speed when you need it, and puts you in a pretty good position to graduate to something else when you outgrow it.
