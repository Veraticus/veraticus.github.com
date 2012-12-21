---
layout: post
title: "Dynamic Cache Counters in Rails"
date: 2012-10-29 17:55
comments: true
categories: [rails]
---
I spent a frustrating hour today searching for a way to do dynamic cache counters in Rails.

The problem is best summed up in a use case. I have a model called votes. A vote can be an upvote or a downvote; I set a column called `type` indicating what it is. Though I call the column `type` there's no need for STI here -- there's really only one model, after all. However, it is polymorphic. You can vote up any kind of content on the site. I want to cache the number of upvotes and downvotes separately for that content. Unfortunately, the out-of-the-box Rails counter mechanism doesn't let you do this. According to the `counter_cache` documentation, you must either specify `true` or the name of the column you're caching under. You're out of luck if you want to change it dynamically.

This, then, is the solution I came up with to allow dynamic cache counters.

<!-- more -->

The most ideal way to do this is to hook into the existing [ActiveRecord CounterCache](http://api.rubyonrails.org/classes/ActiveRecord/CounterCache.html) module. Given that, the code is quite simple, really:

```ruby
class Vote < ActiveRecord::Base
  belongs_to :voteable, polymorphic: true, touch: true

  after_create :increment_counters
  after_destroy :decrement_counters

  [:increment, :decrement].each do |type|
    define_method("#{type}_counters") do
      voteable_type.classify.constantize.send("#{type}_counter", "#{self.type}votes_count".to_sym, self.voteable_id)
    end
  end

end
```

The CounterCache module has two methods we care about here: `increment_counter` and `decrement_counter`. We manually trigger these methods on the parent object's class after a vote is created or destroyed; note that I don't intend to change the type of the vote, but if you do, you'll also need an after_save callback to decrement one counter and increment another. So with these callbacks, if I have a vote with type `up`, it will call `increment_counter` on the column `upvotes_count` with the ID of the saving object.

This code assumes that the parent model will correctly have a counter column of the appropriate type defined. 

Instead of this quasi-hack, I briefly investigated patching Rails to allow the `counter_cache` option to accept a lambda or proc, but doing so would have involved a lot of changes and would probably be stuck forever in Github issues. This change, while not exactly as clean and portable, does the job with a minimum of fuss.