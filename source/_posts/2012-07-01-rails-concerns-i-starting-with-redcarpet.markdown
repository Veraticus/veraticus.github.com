---
layout: post
title: "Rails Concerns I: Starting with Redcarpet"
date: 2012-07-01 20:32
comments: true
categories: [rails]
---
Rails concerns are a fancy way of saying Ruby modules. 37signals uses concerns [a lot in the new Basecamp](http://37signals.com/svn/posts/3167-code-spelunking-in-the-all-new-basecamp), and it's easy to see why: separation and recatoring allow you to reuse code more sensibly and test it in only one place. But concerns aren't only for code refuse -- by allowing you to unclutter models, they make it more obvious where code in your application lives. Even though, for example, orders are the only model in your system being shipped, having a concern called Shipping makes it completely obvious that that's where all the functionality for shipping lies... whereas a newcomer to your application would have to search through the order model to find it.

I've been using concerns extensively in GirlsGuideTo's upcoming application, and I figured it'd be an interesting read if I shared the ones I've made so far. They're not too complicated (this first one I'm posting mostly just to illustrate the concept), but but don't let that fool you. They can be super complicated and really involved -- but more than that, concerns just make your code better, so you should definitely be using them!

<!-- more -->

## Redcarpeted

A lot of fields in GirlsGuideTo are Markdown encoded by the pretty awesome [Redcarpet](https://github.com/tanoku/redcarpet/) gem. These fields occur across models, and rather than copy and paste code all over the place, I extracted the idea of converting fields to and from Markdown into a concern.

```ruby
module Redcarpeted
  extend ActiveSupport::Concern

  module ClassMethods

    def redcarpet(field)
      define_method("#{field}_markdown".to_sym) do
        read_attribute(field)
      end

      define_method("#{field}_html".to_sym) do
        Redcarpet.new(read_attribute(field)).to_html
      end
    end
    
  end

end
```

`ActiveSupport::Concern` is the magic that makes concerns so ... magical. Simply by including another module called `ClassMethods`, `ActiveSupport::Concern `automatically knows to extend the base class with those methods when it's included.

In this case, this allows you to do something like this in your model:

```ruby
  class Post < ActiveRecord::Base
    include Redcarpeted

    redcarpet :body

  end
```

Now your Post has two new methods: `body_markdown` and `body_html`, allowing you to quickly and easily access the raw Markdown and formatted HTML for any attribute in your model. (And if you're curious, the reason to bother including a `body_markdown` method is in case you decide to override the base method `body` yourself at some future point.)

That's just the starts of Rails concerns, though. Next time I'll post a more complicated example with greater ActiveRecord connectivity that will hopefully be a lot more exciting.