---
title: "Rails Concerns IV: Class Methodable"
date: 2012-10-22 14:27
tags: [rails]
---
In my application, seed data is an unfortunate necessity. I don't like it but it's there, and it's tightly integrated into many parts of the app (dropdowns, navigational links, and so on). Finding that seed data also tends to be rather ugly and long, unfortunately. Who wants to type `Tag.find_by_name('Health & Wellness')` or one of the finder variations every time you're looking for something? Not me, that's for sure. I found myself aliasing these finders constantly as class methods: so, the above would be much more easily referenced as `Tag.health_wellness`.

Once I started duplicating this functionality across models I knew I had a concern. This is the module I came up with to encapsulate it.


## Methodizing Names

The first problem with a concern like this is that it's no easier to call class methods that have weird characters in them. You can do `Tag.send('Health & Wellness')` but the goal here is to eliminate intervening calls, so that we end up with `Tag.health_wellness`. Having `send` in there looks weird and doesn't seem very clean.

I opted to fix this with a new String method I called `methodize`. Put it in your lib folder and Rails will load it when the application starts.

```ruby
class String
  def methodize
    self.gsub(/\s/, '').downcase.gsub(/[^a-z0-9]/, '_')
  end
end
```

## Setting a Scope

The models that employ this concern will probably have different columns you'll want to find them by. One might be called 'name', whereas another might be 'title' or 'slug'. To get around these differences, our concern will assume that each model will have a scope that smooths over these differences. I called that scope 'named'.

```ruby
class Tag
  scope :named, lambda {|n| where(name: n.downcase)}
end
```

## Creating the Concern

The concern itself is quite simple. It consists of one method, `class_methodable`. We call that with an array of names that we want to turn into class methods. For each of those, we define a singleton method that sets or gets a class variable of the value we're looking for. The code itself follows:

```ruby
module ClassMethodable
  extend ActiveSupport::Concern

  module ClassMethods
    def class_methodable(methods)

      methods.each do |method|
        define_singleton_method(method.to_s.methodize) do
          v = "@@#{method.to_s.methodize}"

          if class_variable_defined?(v)
            class_variable_get(v)
          else
            class_variable_set(v, self.named(method.to_s).first)
          end
        end
      end
    end

  end

end
```

## Using It

Now that everything's in place, actually using the concern is quite simple. In our class:

```ruby
class Tag
  include ClassMethodable

  class_methodable 'Health & Wellness', 'Relationships', 'Other Stuff'
end
```

And in our code:

```ruby
Tag.relationships # => Tag.named('Relationships')
Tag.health_wellness # => Tag.named('Health & Wellness')
Tag.other_stuff # => Tag.named('Other Stuff')
```

Now we can reference our seed data quickly and cleanly, without having to resort constantly to finders.
