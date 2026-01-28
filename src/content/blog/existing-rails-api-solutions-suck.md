---
title: "Existing Rails API Solutions Suck"
date: 2013-02-22 11:00
tags: [rails]
---
In the past two months, since joining [Everest](http://everest.com), I've spent quite a lot of time and effort researching and reviewing the various Rails API gems and I've come to a startling and disheartening conclusion.

They all suck.

In different ways, sure. And many have redeeming characteristics. But overall none of them do what I would consider the three most important parts of supporting a Rails API:

1. Be DRY. I need versioning without copy and pasting huge swathes of code. If I want to make a query optimization in an API endpoint I shouldn't need to browse through every version of the API, applying it to each file.
2. Support views (or something like them). Rendering JSON in controllers and models is inappropriate. JSON is a representation of data: a representation of data is a view of a model. You can argue this is a presenter or serializer or whatever, and that's fine. There are clearly places where this logic should **not** be, though.
3. Integrate with Rails. I have an existing and complicated web application that I want to provide an API for. Probably I want to leverage the power of the Rails stack and everything I've installed in it, like logging, error reporting, performance metrics and so on.

Taken in that light, then, here are mini-reviews for every existing Rails API Gem I could find. And believe me, I think I found most of them. (Spoiler alert: they suck.)


## [grape](https://github.com/intridea/grape)

grape has some really cool features. Being able to define params and a description before an endpoint, rake-style, makes it incredibly obvious what you're doing and what you're expecting. Also it makes generating documentation quick and easy. If I were doing an incredibly small Sinatra-only API, I would choose grape to do it in every time.

Unfortunately that's where the great stuff ends. For Rails applications -- assuming you actually want to use grape with Rails -- it is really an unpleasant solution, since it just doesn't play nicely with Rails.

First, its error handling, logging, and most of its middleware stack are entirely divorced from the rest of your Rails application. I hope you don't want to use [NewRelic](http://newrelic.com) or [Ratchet.io](http://ratchet.io) with grape, because if you do you're on your own, buddy. Sure, you can get it in manually. Hooray for manual labor. In order to provide unified Graylog2 logging, statsd statistics, and error reporting for Rails and grape, I extracted the common bits into a middleware that sits in front of both of them. This was ugly and unpleasant, and frankly seemed really unnecessary.

Second, and for those of you already gearing up to say "but grape isn't FOR Rails", you end up duplicating a lot of Rails' structure inside it anyway, even in small applications. If you don't want your API file to be two thousand lines long, you end up including endpoint modules that smell suspiciously like controllers, except with inline routing. In an actual Rails application, this separate but similar structure is by tradition hidden in the `lib/` directory, where nothing at all integral to your application ordinarily resides.

Third, if you want to version your API, you get to copy and paste the entire thing. To prevent us doing this every time at Everest, I implemented a module inheritance system for the API versions, but frankly it feels hacky and was difficult to get grape to support properly.

Fourth, its caching support is pathetic. You have to install a completely separate gem ([garner](https://github.com/artsy/garner)) if you want any kind of caching at all. Do people who use grape not experience any sort of load? Do their APIs not engage in any sort of database querying? Why is this a tacked-on side project instead of a core feature?

And of course it has no view support. If you want to reuse data representations, define a method in the base API and call it all over the place. It's like a view, but more hidden!

I assume some people must use grape for at least as complicated an app as I do. When I was Googling how to do versioning without copy pasting, I came across numerous slideshows from various Rails conferences discussing how great it is. None of them address any of these problems, so I'm curious how the really big players make grape work without these difficulties. (My suspicion is they don't use grape.)

## [acts_as_api](https://github.com/fabrik42/acts_as_api)

Who thought that putting data representations inside a model was a good idea? Data representations go inside a view -- that's what views are for. You don't see rules for coercing models to HTML inside a model. Why should JSON then be allowed? Well, to answer my rhetorical question, it shouldn't.

This gem leads to really horrible uses like this when you version an API:

```ruby
class User < ActiveRecord::Base
  api_accessible :public do |t|
    t.add :id
    t.add :first_name
    t.add :last_name
    t.add :real_name
    t.add :gender
  end

  api_accessible :with_timezone, extend: :public do |t|
    t.add :timezone
  end
end
```

This is a versioned resource. You don't want to change the existing representation and break clients that already use the API, so instead you extend it and add in a field. The old representation has to live in your model forever, a silent sentry to the history of your mistakes, bloating your model until the day you finally get fed up with lines and lines of this and switch to actually using views for their intended purpose.

## [rocket_pants](https://github.com/filtersquad/rocket_pants)

rocket_pants actually does quite a lot right (besides having a sweet name): it's fairly DRY and it integrates with Rails pretty well.

That said, versioning is still a tremendous pain in the butt. Routing allows you to at least select which controller your requests are sent to, but this quickly gets complicated:

```ruby
api version: 1 do
  get 'x', to: 'test#item'
end

api version: 1..3 do
  get 'y', to: 'test#item2'
end

api version: 2 do
  get 'y', to: 'test#override' # how does this interact with the line above?
end

api version: 2..4 do
  get 'x', to: 'test#item3' # x now does something different for only versions 2 and 4
end
```

Confusing!

Why not have a simple fallback method where you define the highest version of your API, and the router checks to see which controllers exist in that version, moving back to an earlier version until it finds a defined controller? You could even have the router detect this on application load to prevent increased loading times. Then you don't need any sort of fooling around with complicated routing rules. Instead you just define the basic structure of your API and your application correctly infers versions from it, and if you have specific overrides you can address them in the routing file.

Wishing aside, rocket_pants also doesn't use views, instead encouraging you to use a model's `serializable_hash` method to instruct it how to convert the model to JSON. Let's hope you don't have more than one representation of your model.

## [versionist](https://github.com/bploetz/versionist)

versionist supports views correctly but it suffers from a tremendously overwhelming amount of copy/pasting. It you want to version your API, it copies not only the routes inside your routes.rb, but also: 

* Your controllers and controller specs
* Your presenters and presenter specs
* Your helpers and helper specs
* Your docs

To a new location. These are just copies: in all likelihood they'll end up largely exactly the same as the previous version. It provides a Rails generator that does this automatically. I'm on the fence as to whether great support for poor design patterns is unironically helpful though.

## [api-versions](https://github.com/erichmenge/api-versions)

Though it's practically unknown, in all my searching this is the gem that really got closest to what I was looking for. By default, it uses this heretofore unseen programming concept called "inheritance" to prevent code duplication from one version of your API to the next.

Unfortunately, when you use its helpfully-provided Rails generator `api_versions:bump` it still creates a new controller for each of your old controllers. While they inherit code, which is nice, why do you have an empty controller just to provide inheritance to a previous version of the API? Still, this is definitely the least amount of copy/pasting we've seen up until this point, and I sincerely appreciate the author's attempt to remain DRY in the very wet API landscape.

## So what should I do if I'm making a Rails API?

Use [jbuilder](https://github.com/rails/jbuilder) (or [rabl](https://github.com/nesquena/rabl)) to create views. If you have a tremendous hatred of views, use [active_model_serializers](https://github.com/rails-api/active_model_serializers) instead to achieve the same goal. Your controllers should be pretty much like regular Rails ActionControllers. Feel free to include an extremely low-touch library like [versionist](https://github.com/bploetz/versionist) or [api-versions](https://github.com/erichmenge/api-versions). Put most of your controller code in modules and include it in the actual controllers to prevent copy and pasting everywhere for the first. For the latter, not much you can do. Suck it up and copy and paste in your routes for both. Unfortunately, that's the best solution I can come up with.

## Stop whining and do something about it!

You know what? I think I will.
