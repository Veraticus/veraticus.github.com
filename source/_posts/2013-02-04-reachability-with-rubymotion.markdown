---
layout: post
title: "Reachability with RubyMotion"
date: 2013-02-04 17:55
comments: true
categories: [rubymotion]
---
A couple days ago I shared with a friend my code to quickly and easily do reachability checks in RubyMotion, and I figured I would post the code on my blog as well. In addition to detecting network reachability, this code suspends the operation queue when the target host is unreachable, allowing you to continue appending requests and ensuring that they will be delivered in the order they were queued.

There might be a more efficient way to do something similar, but this works for me.

<!-- more -->

## Rakefile

Add the really awesome [Reachability](https://github.com/tonymillion/Reachability) Pod to your project.

```ruby
Motion::Project::App.setup do |app|
...
  app.pods do
    pod 'Reachability'
  end
...
end
```

## AFNetworking AFHTTPClient Subclass

I also use the super convenient AFNetworking library to quickly and easily do REST-compliant requests to my servers. This is the code I stick in my AFHTTPClient:

```ruby
class ServerClient < AFHTTPClient

  # Singleton!
  def self.instance
    @@instance ||= new
  end

  def hostname
    'http://yourhosthere.com'
  end

  def setupReachability
    self.operationQueue.maxConcurrentOperationCount = 1
    self.operationQueue.suspended = true
    
    @reachability = Reachability.reachabilityWithHostname(ServerClient.instance.hostname)
    @reachability.reachableBlock = lambda {|reachable| ServerClient.instance.operationQueue.suspended = false}
    @reachability.unreachableBlock = lambda {|reachable| ServerClient.instance.operationQueue.suspended = true}
    @reachability.startNotifier
  end
  
end
```

## app_delegate.rb

Finally, call the setupReachability method in your app delegate and you're done:

```ruby
class AppDelegate

  def application(application, didFinishLaunchingWithOptions:launchOptions)
    ...
    ServerClient.instance.setupReachability
    AFNetworkActivityIndicatorManager.sharedManager.enabled = true
    ...
  end
end
```