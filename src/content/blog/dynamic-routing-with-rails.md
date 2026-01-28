---
title: "Dynamic Routing with Rails"
date: 2012-05-22 23:08
tags: [rails, beginner]
---
I love Rails' routing system. Quickly and easily connecting English-readable URLs to complicated web actions is one of the joys of working in one of the coolest web frameworks on the Internet. At Synthetic, we're ramping up to get a new site out, and as part of the push for that I implemented some cool dynamic routing. I wanted to briefly summarize how and why I went with the routing choices I did, to illustrate using routes expressively and, hopefully, easily.


## The Problem

Hipstamatic has gear. Lots and lots of gear. We have over 100 lenses, flashes, and films; but from a programmatic perspective they're all really similar -- they all have a name, a description, some assets associated to them... And so they're all lumped together in a single model called `Gear`. Our new application is intended to let users browse our entire gear collection, and so obviously it has a single controller that (surprise surprise) allows you to see each piece of gear. Thus we wind up with routes like this:

```
  gear/alfred
  gear/dreampop
  gear/stache
```

And that's kind of tragic. Each type of gear should have its own route, even if they're all in the same model. Something like this would be both more readable and more expressive:

```
  lenses/alfred
  flashes/dreampop
  films/stache
```

Of course, having a controller for each kind of gear would be crazy. Happily, Rails provides some easy routing solutions!

## The Solution

In our routes.rb, for each kind of resource that we're expecting, we create matching routes:

```ruby
[:lenses, :films, :flashes, :cases].each do |gear|
  match "#{gear}/:id", :controller => :gear, :action => :show, :type => gear, :as => gear
end
```

Let's dissect this routing statement in two steps. For the first, obviously, we're linking a route like `lenses/a1` or `flashes/cherry` to the gear controller. Importantly we're also passing a type: either lenses, films, flashes, or cases, instructing the controller which endpoint we want. In said controller, we should make sure that this passed type and the name of the piece of gear match. Otherwise people would go to `lenses/dreampop` or `flashes/alfred` and still see the correct resource despite specifying an invalid type and name combination. That would just be madness!

```ruby
class GearController < ApplicationController
  before_filter :find_gear
  
  private
  
  def find_gear
    @gear = Gear.type(params[:type].to_s.singularize).where(:reference => params[:id]).first if params[:id]
  end
end
```

Type is a named scope that matches the passed params[:type] to a database column storing the actual type of gear. So this will try to find a lens or flash or what have you with the appropriate reference name. Simple enough.

For the second part of the above route, the `:as => gear` part creates named routes like lenses_path and films_url. With that in mind, it's easy for us to dynamically generate links based only on the gear object. This is the helper that allows us to do so:

```ruby
def multi_path(obj)
  self.send("#{obj.type.pluralize.downcase}_path".to_sym, obj.reference)
end
```

So I can use `multi_path(Gear.find_by_name('Kaimal Mark II'))` and the route will be generated as if I had typed `lenses_path` instead of `multi_path`: similarly with any object that responds to type and reference, which happily for me is all gear. This is important because I don't want to have to use a switch in iterated blocks to figure out which path name I want to use. Now I can just use multi_path and be guaranteed that the correct one will be selected.

With only a few lines of code, it's easy to make routes that were previously clunky and unexpressive into sensible, readable endpoints. And you don't have to sacrifice DRY to do so. If you have a lot of data that's expressed through only one controller, consider dynamic routing like this. It's easier for customers to remember URLs that are readable to them, and this is a good way to make that happen.
