---
layout: post
title: "Rails Concerns II: Taggable"
date: 2012-07-04 15:31
comments: true
categories: [rails]
---
For the second part of my series on Rails concerns (following [part one earlier this week](http://joshsymonds.com/blog/2012/07/01/rails-concerns-i-starting-with-redcarpet/)), I'll be dissecting a tagging system and how to make it concerned. Of course, you have great gems like [acts-as-taggable-on](https://github.com/mbleigh/acts-as-taggable-on/), but if you want significant customized functionality in either your Tag class or the taggables, you're going to have to roll your own solution. That's what I'm doing for GirlsGuideTo, and this is how I implemented it.

<!-- more -->

## The Tag Model

The tag model itself is fairly straightforward:

```ruby
class Tag < ActiveRecord::Base
  has_many :taggings

  has_many :addresses, through: :taggings, source: :taggable, source_type: Address
  has_many :users, through: :taggings, source: :taggable, source_type: User
end
```

Unfortunately, you can't just say `belongs_to :taggable, through: :taggings`. Polymorphic has-and-belongs-to-many associations don't work, since they have no real table to select from. To illustrate this concept, consider the `Tag` model above: if you had a line like `belongs_to :taggable` and called `tag.taggables`, what would be returned? Theoretically an array of objects, but the objects would be of all different sorts: some would be addresses, some would be users. And how would they be grabbed from the database? You can't `SELECT * from taggables`, since there is no taggables table.

This is frustrating, but easy enough to work around. You'll have to specify every model that's taggable in the `Tag` class. But since we'll be employing a concern here, we know that all of the taggable classes will respond the same way. Thus, if you're confident, you can define a taggables method yourself:

```ruby
  def taggables
    [addresses + users].flatten
  end
```

Whether or not you decide to do this is up to you. I would recommend against it since likely you'll want to display the different kinds of taggables in different places anyway.

## The Join Model

Tag has-and-belongs-to-many taggables through a join model. That model is `Tagging`, and should look like this:

```ruby
class Tagging < ActiveRecord::Base
  attr_accessible :tag_id, :taggable_id, :taggable_type

  belongs_to :tag
  belongs_to :taggable, :polymorphic => true
end
```ruby

There's nothing particularly surprising here. Just remember to set the `taggable` to polymorphic or Rails won't fill in the association correctly.

## The Taggable Concern

Finally, we can get to the concern itself. This is how I've set it up:

```ruby
module Taggable
  extend ActiveSupport::Concern

  included do
    has_many :taggings, :as => :taggable
    has_many :tags, :through => :taggings
  end

  def tag(name)
    name.strip!
    tag = Tag.find_or_create_by_name(name)
    self.taggings.find_or_create_by_tag_id(tag.id)
  end

  def tag_names
    tags.collect(&:name)
  end
end
```

This uses a new feature of concerns: the `included` statement. Anything inside this block will be executed by the including class when the inclusion occurs. In this case, we'll be including this concern in multiple ActiveRecord models -- and those models will automatically `has_many` :taggings and :tags.

And on those models we'll be able to do some neat stuff. We can automatically add a tag just by calling `model.tag("tag_name")`: if it didn't exist before, it will automatically be created, and then it'll be added to the model's taggings. Also we can get a handy array of all the names of tags for a model. This is just the start of the functionality you can employ, though. Taggable would be a sensible place to put tag cloud creation and tagging contexts, if you wanted to ape more functionality from acts-as-taggable-on while still retaining your own customized implementations.

Next time I discuss concerns, I'll talk about an ActionController concern to improve your page's SEO and Facebook Graph integration. It'll be pretty awesome, so stay tuned!