---
layout: post
title: 'Quick &amp; Easy User Preferences in Rails'
date: 2012-05-16 18:11
comments: true
categories: [rails]
---
My first RubyMotion application is rapidly nearing completion. As it involves user preferences that have to be stored both locally and remotely, I was investigating the available Rails gems for user preferences and really didn't like what was presently out there. I don't really have time to maintain another gem, but maybe someone else has run into this problem and wants a quick and easy solution for creating user preferences. If so, then this code's for you.

<!-- more -->

## Setting Up Preferences

You need a preference model. It should look like this:

```ruby
class Preference < ActiveRecord::Base
  belongs_to :user
  
  validates_uniqueness_of :name, :scope => :user_id
  
  attr_accessible :name, :value
end
```

I used this migration to create it:

```ruby
class CreatePreferences < ActiveRecord::Migration
  def change
    create_table :preferences do |t|
      t.string :name, :value
      t.integer :user_id
      t.timestamps
    end
  end
end
```

You might note that the value of all preferences, regardless of if they're supposed to be Boolean or datetime, is a string. Keep this in mind when you have to query this field later. (That is, if you want to search for all preferences where the value is true, you'll want to search for "1". And similarly, doing `user.preferences.first.true?` will always return `true`, as any string value is true. So, coder beware!)

## Using Them

Ideally, this is what we want the user model to look like.

```ruby
class User < ActiveRecord::Base
  include Preferences
  
  preference :chime, false
  preference :name, "Josh"
  preference :awesome, true
  
  ...
end
```

Simple but straightforward: we include the module and then define each preference, with its name first and default value second. Ideally we don't want to save default values to the database, since that would just make a lot of unnecessary records.

## The Preferences Module

So let's make that happen in that `include Preferences` line! This is the real heart of the preferences engine.

```ruby
module Preferences
  extend ActiveSupport::Concern
  
  included do
    has_many :preferences
    @@preferences = {}
  end
  
  module ClassMethods
    def preference(name, default)
      preferences = self.class_variable_get(:'@@preferences')
      preferences[name] = default
      self.class_variable_set(:'@@preferences', preferences)
    end
  end
  
  def read_preference(name)
    if p = self.preferences.where(:name => name).first
      return p
    end
    return self.preferences.new(:name => name, :value => @@preferences[name]) if @@preferences.has_key?(name)
    nil
  end
  
  def write_preference(name, value)
    p = self.preferences.find_or_create_by_name(name)
    p.update_attribute(:value, value)
  end
  
  def method_missing(method, *args)
    if @@preferences.keys.any?{|k| method =~ /#{k}/}
      if method =~ /=/
        self.write_preference(method.gsub('=', ''), *args)
      else
        self.read_preference(method)
      end
    else
      super
    end
  end
end
```

This is really pretty simple. Upon inclusion it tells the model that it's a part of that it `has_many :preferences` and sets up a class variable hash to store preferences and their defaults. When you declare `preference :chime, true` it records that in the class variable, and then all instances will respond to either `user.chime = true` or `user.write_preference(:chime, true)`. You can read values with `user.chime` or `user.read_preference(:chime)`. If a value isn't written in the database, it returns the default value instead.

This probably has a level or two of refactoring that could happen around it. Maybe when I have time I will turn it into a more sensible gem, but until then, if anyone needs quick and dirty preferences... here you go.