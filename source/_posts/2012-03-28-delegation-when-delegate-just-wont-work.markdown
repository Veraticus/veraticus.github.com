---
layout: post
title: "Delegation when Delegate Just Won't Work"
date: 2012-03-28 15:37
comments: true
categories: [rails, beginner]
---
Rails provides a really awesome ability to avoid [Law of Demeter](http://en.wikipedia.org/wiki/Law_of_Demeter) violations -- the [Module#delegate](http://apidock.com/rails/Module/delegate) method. The Law of Demeter is an informal programming guideline, intended to make your code more obvious and more reusable: objects should only call methods on other objects, not objects of those objects. To provide a more concrete example:

```ruby
  @user.address.street_address # Law of Demeter violation: @user should not reach into address!
  @user.street_address # So much better...
```

Rails, because it's cool, provides a quick and easy pattern for making this work:

```ruby
class User < ActiveRecord::Base
  has_one :address
  delegate :street_address, :to => address

end

User.new.street_address # Calls address.street_address
```

Check out the [delegate documentation](http://apidock.com/rails/Module/delegate) for more information on how this functionality works. But [a question I came across on Stack Overflow](http://stackoverflow.com/questions/9914400/delegate-all-method-calls-on-a-model-to-an-association) today asked: what do you when you want to delegate all methods? I do [something similar in Dynamoid](https://github.com/Veraticus/Dynamoid/blob/master/lib/dynamoid/adapter.rb#L122) and wanted to talk about how to make this pattern sensible and performant.

<!-- more -->

Essentially you have two options when delegation fails: the easy but less performant way, and the hard but more performant way. It's always nice to have choices, right?

## The Easy Way

The easy way uses `method_missing`. Method_missing, of course, is part of Ruby's extensive metaprogramming suite; it is called when a method that doesn't exist is invoked on an object. So, if you have an object (say our user from above) and you want to delegate all methods that it doesn't have itself to its address, you would simply do:

```ruby
class User < ActiveRecord::Base
  has_one :address

  def method_missing(method, *args)
    return address.send(method, *args) if address && address.respond_to?(method)
    super
  end
end
```

This works and will correctly send every method that can be called on an address to that address. Unfortunately, method_missing is slower than defining a method directly on the object, so every time you're forced to use method_missing you're added fractions of milliseconds to your application. This speed difference is usually imperceptible, but you never know: if you use this method_missing enough it could make a difference.

## The Hard Way

So we have the hard way. This method is "harder" only in that you need to know the methods you want to delegate beforehand -- in which case, why aren't you using `delegate`? There is still a use for this method though: if you want to do something like benchmarking or argument recording before you delegate, you can do that easily here.

```ruby
class User < ActiveRecord::Base
  has_one :address
  
  [:all, :my, :methods, :here].each do |m|
    define_method(m) do |*args|
      address.send(m, *args)
    end 
  end

  end
```

In Dynamoid, we perform benchmarking in this method before sending the response along, allowing you to see how long the actual request took in DynamoDB.

Ultimately, you should use `delegate` if possible... but if it isn't, then either of these two options should get you started to avoid programming unpleasantness. Don't address your objects through other objects -- your code will look better and be more maintainable if you take some time to isolate methods!