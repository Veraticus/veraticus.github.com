---
title: "RubyMotion Tips &amp; Tricks"
date: 2012-05-07 17:48
tags: [rubymotion]
---
I've been using RubyMotion for four days now. I still like it a lot, and I think the coolest thing about it is the rapidly-evolving community around its use. Ian Phillips figured out how to [link Interface Builder and RubyMotion](http://ianp.org/2012/05/07/rubymotion-and-interface-builder/); Alan deLevie wrote a neat [connection to Parse.com](https://github.com/adelevie/ParseModel). Personally, I've been spending the time writing lots of code. I've just deployed my first RubyMotion app into TestFlight and sent it to some testers. Soon hopefully I'll have an actual RubyMotion app, which is pretty exciting! I've learned a lot in the last four days of use and wanted to post a few tips and tricks to hopefully make life easier for other RubyMotionists.


## Wrap It Up

I'm using `NSUserDefaults` to store some cached data so I don't flood my server. Calling `NSUserDefaults` constantly was really getting me down though, so I made this cute little wrapper class that does all the hard work for me.

```ruby
class Cache
  class << self
    def keys
      NSUserDefaults.standardUserDefaults.dictionaryRepresentation
    end
    
    def write(key, data)
      NSUserDefaults.standardUserDefaults[cache_key(key)] = data
      NSUserDefaults.standardUserDefaults[timestamp_key(key)] = Time.now
      self.synchronize
    end
  
    def read(key)
      NSUserDefaults.standardUserDefaults[cache_key(key)]
    end
  
    def delete(key)
      NSUserDefaults.standardUserDefaults.removeObjectForKey(cache_key(key))
      self.synchronize
    end
  
    def exists?(key)
      !NSUserDefaults.standardUserDefaults[cache_key(key)].nil? && Time.now - NSUserDefaults.standardUserDefaults[timestamp_key(key)] <= 3600
    end
  
    def synchronize
      NSUserDefaults.standardUserDefaults.synchronize
    end
  
    def purge
      keys.each { |key| self.delete(key) if key =~ keyspace }
      self.synchronize
    end
    
    private
  
    def keyspace
      "app-cache"
    end
  
    def cache_key(key)
      "#{keyspace}-#{key}"
    end
  
    def timestamp_key(key)
      "#{cache_key(key)}-timestamp"
    end
  end
end
```

I only want to cache the data for one hour (3600 seconds); that's why I only return true for `exists?` if the keys are younger than that. Using this cache is really simple.

```ruby
@data = if Cache.exists?('cache_key')
  Cache.read('cache_key')
else
  results = 1 # Populate the cache with slow work here
  Cache.write('cache_key', results)
  results
end
```

The only caveat to this wrapper -- something I need to look at more -- is that you can only store property values in it. In other words, no custom classes, which sort of sucks if you have a lot of models that you want to hold somewhere. I'm getting around this by storing IDs and then looking them up afterwards in my model. I could use CoreData instead (and the sample app has [an excellent example of how to use it](https://github.com/HipByte/RubyMotionSamples/blob/master/Locations/app/locations_store.rb)) but that's a level of complexity I don't think my app needs yet.

## Don't Be Afraid To Use Blocks

Blocks are one of the coolest parts of Ruby! A lot of Objective-C code can be made more readable and more beautiful by sticking it in block syntax. Here's a little UIView helper to show you what I mean.

```ruby
class UIView
  def self.animate_with_block(duration = 0.5)
    beginAnimations(nil, context:nil)
    animationDuration = duration
    yield
    commitAnimations
  end
end
```

Check out the before and after to see how this makes code look oh so much better.

```ruby
#Before
def showSelection
  UIView.beginAnimations(nil, context:nil)
  UIView.animationDuration = 0.2
  @selection.alpha = 1
  @picker.alpha = 0
  UIView.commitAnimations
end

# After
def showSelection
  UIView.animate_with_block(0.2) do
    @selection.alpha = 1
    @picker.alpha = 0
  end
end
```

There's a lot of stuff I ended up wrapping in blocks just for sanity's sake; having to commitAnimations or synchronize after every operation is a big downer. Remembering to end blocks is quite a bit easier, and as a bonus makes your code look a lot more readable as well.

## Make Shortcuts

I stole this one rather blatantly from [Sam Soffes](http://samsoff.es/posts/rubymotion-review). It's trivially easy to open up classes and add your own methods to them: 

```ruby
class UIColor
  def self.darkBlueColor
    @dark_blue_color ||= self.colorWithRed(0, green:0.1, blue:0.44, alpha:1)
  end
  
  def self.lightBlueColor
    @light_blue_color ||= self.colorWithRed(0, green:0.21, blue:0.88, alpha:1)
  end  
end
```

Then you have your own cool code like `UIColor.darkBlueColor` next to the standard UIColor methods. If you find yourself copying and pasting something over and over, don't! It's super easy to make extensible, quick shortcuts in Ruby. Take advantage of that.

## Stand on the Shoulders of Giants

There are a lot of RubyMotion projects popping up out there, and there are a lot of existing Cocoapods projects. Why reinvent the wheel? Use other peoples' smarts to propel your own project ahead quickly and easily; if you find yourself outgrowing your dependencies, then you should consider doing them yourself, but not before.

For example, I've been using [AFNetworking](https://github.com/AFNetworking/AFNetworking) to do my networking management, connections, and callbacks -- they already made the whole NSURLConnection stuff easy to use, and I gotta say using it in Ruby is super easy too:

```ruby
Server.sharedInstance.getPath("data", parameters:{:user_id => user.id},
  success:lambda { |operation, response| @label.text = 'User gotten!'},
  failure:lambda { |operation, error| $stdout.puts("Error: #{error}")}
)
```

Of course, you'll want to do something a bit more interactive with your error than just log it, but you get the idea. Meanwhile, on the RubyMotion side, I stole quite a bit of code from [BubbleWrap](https://github.com/mattetti/BubbleWrap), specifically the really excellent [kernel shortcuts](https://github.com/mattetti/BubbleWrap/blob/master/lib/kernel.rb). Being able to do `simulator?` or `ipad?` is really awesome and a big time saver. I really hope that RubyMotion gets its own concept of Gems soon; it'll make receiving code faster than just copying and pasting it directly into my source.

As I get closer to releasing the app I'm working on, I'm sure I'll have more interesting tips and tricks to share: these thoughts are really all that stood out to me after a quick review of my code. As I said at the top, I'm still really impressed with RubyMotion; I've had a few more random crashes without error messages or backtraces, but that's my only real complaint so far. We'll see how RubyMotion fares as my app moves towards release, but I am personally hopeful, and at the very least it's made iPhone programming a lot less painful.
