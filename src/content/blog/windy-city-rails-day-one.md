---
title: "Windy City Rails, Day One"
date: 2014-09-04 09:34:52 -0500
tags: [business, rails]
---

It's been a few years since I last went to Windy City Rails, despite the fact that it's oh-so-convenient and there are so many high-quality Ruby and Rails developers in Chicago. I decided to go this year and, for those not able to come, provide small synopses of the presentations. So, without further ado, I present: Windy City Rails 2014, Day One.


## 1. Rubinius X by [Brian Shirai](https://twitter.com/brixen)

This was a really dense talk, as one would expect about a completely new implementation of Ruby. [Rubinius](http://rubini.us/) aims to be a performant, compliant Ruby -- Rubinius X means version 10 of Rubinius (8 versions ahead of MRI!), and has some very ambitious goals: perhaps the most interesting of which is ensuring the future of Ruby.

It's no secret that Ruby is old now. The question is, how do we keep it relevant even in its increasing age? Brian's hedge against winding up in a programmer nursing home is Rubinius X, which has a lot of interesting features:

* First-class network support, including better concurrency and easier communications. No more global interpreter lock problems! (Though whether any ordinary user of Ruby would ever really run into GIL issues is an open question...) No more shared memory! No more mutable strings! Wait, what was that last one? Well, we should ask ourselves, why is there a difference between strings and symbols at all? A reasonable question ask, and symbols vs. strings are certainly one of the first conceptual stumbling blocks to understanding Ruby. This led to this great line:

> The greatest trick the devil ever pulled was to convince language designers that strings are arrays of characters. - Brian Shirai

* Better performance. I rather think focusing on Ruby's performance is a red herring -- it's generally fast enough for most of our purposes, and if you're doing scientific computing most likely you're optimizing C anyway. But Rubinius X has per-method compilation, allowing for significant bytecode performance increases... in addition to in-code type assertions and cost-free instrumenting. Faster is never a bad thing!
* Capturing the program's runtime experience. Rubinius X allows us to see what lines of code were actually invoked, what arguments were passed to methods, and in general grants a really granular view on what code is actually being run in production.
* Functional programming paradigms, including real functions as first-class citizens (not just [module_function](http://apidock.com/ruby/Module/module_function)). You can declare dynamic or static types for these functions with type assertion checking.

The claim is that Rubinius (and Rubinius X) are usable today, immediately, in your MRI app with only minor changes to your Gemfile.

As exciting as all this is, I am personally a little skeptical. Rubinius X promises the moon and stars but we saw little actual code demoed, so I'm not sure how many of these features are actually available or how best to use them. I would be interested in performance comparisons to MRI and seeing an example of how this would improve my existing code and simplify my app's design patterns before I'm totally sold.

## 2. Recommendation Engines with Redis and Ruby by [Evan Light](https://twitter.com/elight)

By comparison to the previous, this session was quite light. Extremely helpful for the Rubyist not yet familiar with [resque](https://github.com/resque/resque) or [redis](redis.io), Recommendation Engines with Redis and Ruby focused on a specific case study for implementing a recommendation engine in redis.

While the talk was quite fascinating, I was personally hopeful it would focus on the statistical methods of recommendation (using something like k-clustering), which it did not. Instead, the case study discussed implementing a solid and performant recommendation engine taking advantage of redis' native features: inverted indexes, clever key TTL tricks, sorted sets, and queues, queues, queues!

resque workers performed the actual recommendation work, which was based purely on the relative apparent interest of users in tags, and bubbling up posts and users based on the users' own tagging behavior.

Though an interesting and conversational case study, and probably very informative for a beginning Rails user, this session did not really discuss anything revolutionary -- probably because the sample app seemed to be a few years old at this point. resque is old news now, and redis even older, but the design patterns discussed were still universal and helpful.

## 3. What Devise Does When You're Not Looking by [Lucas Mazza](https://twitter.com/lucasmazza)

[Devise](https://github.com/plataformatec/devise) is the most popular Rails authentication framework, and this was a very useful presentation on what Devise actually does and how it does it. Significantly more interesting than just a read-through of the Devise README, this presentation was simply a walkthrough of the gem and how to customize it.

The foundation of Devise is [Warden](https://github.com/hassox/warden). If Rack is HTTP infrastructure or ActiveModel is ORM infrastructure, Warden is authentication infrastructure. Warden is Rails middleware that provides user session management, failure handling, and lifecycle callbacks. Devise integrates Warden's magic seamlessly with Rails, providing model, router, and controller/view patterns to handle almost all common authentication cases.

Of course, Device's Rails opt-in model integration is great. It provides modules such as session expiration, IP tracking, and account confirmation all in your user model, if you want it. And on top of that you have routing helpers and tons of default controller actions and views. Additionally, Devise is sensibly secure by default -- after all, you don't want to be concerned with implementing security! Security experts should be taking care of that. So Devise uses bcrypt, encrypted tokens, and prevents timing attacks by default.

Devise is a set of reusable, extensible shortcuts for getting authentication cleanly and seamlessly into a Rails app, and honestly everyone should be using it in their app if they aren't already. This session was a concise overview of how best to implement it and configure it.

## 4. Let's Do Some Upfront Design by [Mark Menard](https://twitter.com/mark_menard)

Initially I was concerned this would be a session about visual design, but actually this was a very cogent presentation on code design, refactoring, and the proper way to structure code. That said, it started with a rather controversial question: who likes TDD? Who doesn't like it? Hands were raised and responses mixed, with most people falling somewhere in between.

Though doing upfront design has a reputation for not being particularly agile, *Let's Do Some Upfront Design* argued quite clearly that planning before starting a project can reap immense rewards down the road. Particularly using sequence diagrams and separating the coordinators (the what) from the processors (the how) can simplify your thinking about a system and lead to better abstractions and inheritance hierarchies.

While this was a really helpful talk from a design perspective, the focus on testing quickly became very abstract, disappearing into the realm of mock objects far too rapidly for my tastes. (What exactly is the value of tests if they're all testing mocks?) Still, for illustrative purposes the tests were very well-written, and seeing the value in both clear tests and clear models went a long way to showing the value of early planning.

The overall value that the upfront design achieved is undeniable, and the talk itself quite clearly illustrated that with many examples and clearly argued points.

## 5. Protect Your Code by [Daliah Saper](https://twitter.com/SaperLaw)

Of all the sessions on the first day, this was the one I was looking forward to most! My consulting business, [Symonds & Son](https://symondsandson.com), has been quite successful, but success brings with it the reality of contract negotiations and the potential for legal difficulties, areas I am not yet too familiar with.

Though taking only half an hour, *Protect Your Code* summarized the main legal issues facing developers: copyright law, licensing, open source software, work for hire, licensing and assignment, trademarks, and contract law.

Perhaps the biggest take-away for me was understanding code ownership a little bit better. If you are an employee of an organization and you develop code in your day job, the company owns that code. You don't have to sign a piece of paper for this -- it's just that way by default. As a private contractor, everything you create is yours -- except work for hire, where you must assign copyright to the person hiring you.Either as an employee, employer, contractee or contractor it's vitally important to understand the ownership of created code and how contracts change that ownership.

And that led naturally into a discussion of licensing with open source software, particularly the tainting nature of the Gnu Public License. When used for hobbyist projects it's quite acceptable, but the fact that everything it touches becomes open-source can be quite a nuisance for enterprise-grade software.

While fascinating through and through, this presentation make me concerned to review the contracts I use in my business. Probably this is a sensible warning to all consultants: have a good lawyer look over your agreements. Hopefully it'll be wasted money, but if it's not, it'll have been a very worthwhile exercise.

## 6. Domain Driven Rails by [Yan Pritzker](https://twitter.com/skwp)

*Domain Driven Rails* started with a boxing match between DHH and Uncle Bob.

Throughout the first day as a whole, there was definite tension between the simple, CRUD-based applications DHH advocates and the complicated, enterprise logic of Uncle Bob's hexagonal architecture. (To anyone who's been to Ruby conferences before this will probably come as no surprise.) Of course there's no resolution to be found between the two, and happily, this talk took a very sensible middle-ground.

It also included lots of actual code and many interesting statistics from Code Climate on a real, actual project: [reverb](https://reverb.com/), a guitar marketplace. Though the reverb app is monolithic by any definition of the word, with a thousand classes and a hundred models, it still manages to have low churn, high code quality, and quick development iterations. Indeed, they defended their huge application with a very sensible quote from Martin Fowler about the trend towards separating apps into distinct services:

> While small microservices are certainly simpler to reason about, I worry that this pushes complexity into the interconnections between services, where it's less explicit and thus harder to figure out when it goes wrong. - Martin Fowler

reverb's refactoring secret? Plain old Ruby objects! The presentation argued quite convincingly in favor of rejecting "skinny controller, fat model" for "skinny controller, skinny model, and skinny domain objects sitting between the two." This domain layer encapsulates specific kinds of behavior -- say, a ReturnOrderMailer or a ProcessUserCreditCard -- that can decorate models but are not necessarily part of them.

This definitely takes the better parts of DHH's philosophy of simple POROs while rejecting MVC as the be-all, end-all of Rails application design. Decorators, combined with events and event listeners, helped to significantly lower the architectural complexity of reverb without having to break it out into many disparate parts.

Overall a very solid argument, though I'm still not completely on-board with the idea of hundreds of classes each controlling a minute part of a model's behavior. It clearly works for reverb, though.

## 7. Go for Rubyists by [Ken Walters](https://twitter.com/lostghost)

Providing a straightforward, sensible introduction to Go, *Go for Rubyists* gave us a glance at Go, complete with code samples and helpful walkthroughs. Once again, the keywords for this presentation were "performance" and "concurrency," which should be no surprise to anyone who's even slightly familiar with Go.

And it's hard not to be seduced by the allure of Go. It's pretty great -- fast compilation, statically linked, highly opinionated, lots of tooling, and all that while still human readable.

Concurrency is a first-class citizen in Go, based on routines and channels. A routine is sort of like a very, very lightweight thread. Routines communicate not by sharing memory, but by transferring data over channels. A very clear separation that makes it easy to reason about multi-threaded applications.

It's always interesting to see other perspectives and different languages. This was a well-done presentation filled with demos and language samples, so it was clear and obvious what the benefits of Go would be for a Rubyist. If you also find Go interesting, you should go to [golang.org](http://golang.org/) and check it out yourself.

## 8. Resolved: Your Local Government Runs on Rails by [Tiffani Bell](https://twitter.com/tiffani)

A fascinating discussion about using software in the public sector, *Resolved* dealt mainly with the experience of programming for large government entities. Spoiler alert: it sounds pretty difficult.

Though governments make use of many of the same Rails tools any of us would find familiar -- Heroku, postgres, jQuery -- the talk dealt a lot with the many different data formats that bureaucracies seem to inevitably accrue. If you're lucky, your city might have a bunch of CSVs on-hand. But if you're not, you'll have a lot of scanned documents you'll likely need to parse for data.

The presentation had some code samples on how to do this via OCR with Google's Tesseract, falling back on Mechanical Turk in the case of ambiguity. Overall a clever solution that would probably prove extremely helpful for the (likely many) governments with legacy scanned data.

It's rare to hear about the use of Rails (or just software development in general) outside of the isolated bubbles of startups and the larger but still isolated bubbles of large corporations. *Resolved* had a lot of great insight into this underreported facet of Ruby usage.

## 9. The Functional Web by [Sean Griffin](https://twitter.com/sgrif)

*The Functional Web* argued that Rails must evolve to meet the needs of a changing Internet: web sockets, streaming responses, and event-based connections all cry out for a Rails solution that ActionController and Rack cannot easily provide. While it's easy to agree that these are all things Rails is terrible at, I'm not sure if Rails will ever be a great tool for solving these sorts of problems.

Ultimately Rails is intended to serve web applications, and thus must return a response within a reasonable period of time -- as the presentation pointed out, unicorn and delayed_job (or preferentially sidekiq) can get you pretty far for both synchronous responses and asynchronous workers.

Once again, that bogeyman of Rails, concurrency, was evoked. But Rails is actually quite performant even in high-load situations with the proper application optimizations and server configurations. Concurrency issues, in my experience, primarily occur if you're doing something that should not really be done in the request lifecycle -- like serving huge files or processing tons of data.

And as if to illustrate that the presentation started discussing the best way to spawn a thread in a Rails controller to do both those things. This is a pretty significant anti-pattern for the reasons the talk itself described; it's semantically unpleasant, incredibly slow, and generally just the wrong place to do this.

Criticism aside, *the Functional Web* sensibly pointed out that Ruby needs better thread implementation and support. But if Rails is ever going to be a sensible server for web sockets and streaming responses, it'll have to look very, very different than it does today... and I'm not sure that's such a good thing, when excellent tools to accomplish these goals exist already.

## Side Thoughts

* BrainTree's CryptoHunt is a cute idea, but I'm willing to bet the prize is an employment offer from BrainTree. I would've been more excited by a year of free credit card processing or something.
* People seem to generally think DHH was very inflammatory at RailsConf with the whole "TDD is dead" keynote, though almost everyone agrees TDD should only be used when it makes sense.
* VenueOne is actually pretty swanky and the food was reasonably good. Hors d'oeuvres during cocktails were tasty.
* Everyone thinks concurrency is a big pain point for Rails. I find this point of view mysterious.
* [Ray Hightower](https://twitter.com/RayHightower) is a super duper friendly guy.

And that's all I have for day one of the conference! Tune in tomorrow though, there are a lot more presentations and I'm quite excited about a few of them.
