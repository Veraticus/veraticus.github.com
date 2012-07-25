---
layout: post
title: "Installing ShareKit with RubyMotion"
date: 2012-07-18 19:38
comments: true
categories: [rubymotion]
---
My RubyMotion app is almost complete. I spent a lot of time today getting ShareKit to work correctly in it; while Motion Cocoapods generally work pretty well out of the box, ShareKit was obstinate and unpleasant and it took me most of the day to get it working correctly. So, to save someone else some time, I documented the steps I took to get it working.

Just a small caveat first, though; this is not simple and elegant like the rest of the code here. (Generally.) I could've done this in a better way -- by extracting the changes out into a new Cocoapod spec repository -- and maybe in the future when I have some time I will. But until then, I hope this somewhat ugly hack helps out someone else!

<!-- more -->

## 1. Set up the Rakefile

First, you need to add the ShareKit sharerers you want into your Rakefile.

```ruby
$:.unshift("/Library/RubyMotion/lib")
require 'motion/project'
require 'motion-cocoapods'

Motion::Project::App.setup do |app|
  app.pods do
    pod 'ShareKit/Facebook'
    pod 'ShareKit/Twitter'
  end
end
```

I couldn't get this working with ObjectiveFlickr because of BridgeSupport duplicate symbol errors; if you want Flickr sharing, you'll have to manually edit the conflicting symbols out of either ShareKit or ObjectiveFlickr. For my app -- and the rest of this walkthrough -- I'll assume the only sharers you're using will be Facebook and Twitter.

## 2. Create a ShareKit Configuration File

I put mine in `app/extensions/sharekit_configuration.rb`, and it looks like this:

```ruby
class SharekitConfiguration < DefaultSHKConfigurator

  def appName
    'YourAppName'
  end

  def appURL
    'http://yourappurl.com'
  end

  def facebookAppId
    '1234567890'
  end

  def twitterConsumerKey
    'abcedfgh1234567890'
  end

  def twitterSecret
    'abcedfgh1234567890'
  end

  def twitterCallbackUrl
    'http://yourappurl.com'
  end

end
```

After you create the file, you need to load it in your `app_delegate.rb`.

```ruby
  def application(application, didFinishLaunchingWithOptions:launchOptions)
    ...

    SHKConfiguration.sharedInstanceWithConfigurator(SharekitConfiguration.alloc.init)
    SHK.flushOfflineQueue

    ...
  end
```

That `SHK.flushOfflineQueue` will try to send stored shared content, if there is any, so make sure to include it.

## 3. Alter your Cocoapod Sources

This is the ugly hack. The Cocoapod version of the Facebook iOS SDK is not the correct one; the ShareKit people provide their own fork that includes the functionality you need. (If you don't use it, the Facebook login won't work at all.) But also the version of ShareKit is old and the Facebook sharing functionality appears to be broken in it anyway, so you might as well update that to the most recent version as well.

All Cocoapod spec information is stored in `~/.cocoapods/master`. The first file we'll change is the Facebook iOS SDK pod spec. It's located at `~/.cocoapods/master/Facebook-iOS-SDK/1.2/Facebook-iOS-SDK.podspec`, and you want to change the line of it that defines the source to look like this:

```ruby
Pod::Spec.new do |s|
  ...
  s.source   = { :git => 'git://github.com/ShareKit/facebook-ios-sdk.git', :commit => '397c0b62b116a9680035e87a07ab936e1c5dfce6' }
  ...
end
```

This points to the most recent commit of the ShareKit Facebook iOS SDK fork. And similarly, we should update the ShareKit pod as well, which is located at `~/.cocoapods/master/ShareKit/2.0/ShareKit.podspec`.

```ruby
Pod::Spec.new do |s|
  ...
  s.source   = { :git  => 'https://github.com/ShareKit/ShareKit.git', :commit => 'a249839dde09e326b1806e22ab3ddb77d733fce9' }
  ...
end
```

## 4. Manually Copy Resources

ShareKit expects that its bundle and plist will be present in the resources directory, and you'll have to manually move them there for it to work.

```bash
cp vendor/Pods/ShareKit/Classes/ShareKit/Core/SHKSharers.plist resources/
cp -r vendor/Pods/ShareKit/Classes/ShareKit/ShareKit.bundle resources/
cp -r vendor/Pods/ShareKit/Classes/ShareKit/ShareKit.bundle resources/ShareKit.bundle/
```

For some inexplicable reason ShareKit seems to want the bundle both in the resources directory and as a subdirectory in its own bundle. I have no idea why this is but I couldn't get ShareKit working without this step.

## 5. Hook up the Share Action

This is the simplest, most straightforward step. In your view:

```ruby
def initWithFrame(frame)
  ...
  @share = UIButton.buttonWithType(UIButtonTypeCustom)
  @share.setTitle("Tap to Share", forState:UIControlStateNormal)
  @share.frame = [[60, 300], [200, 30]]
  @share.addTarget(controller, action:'share', forControlEvents:UIControlEventTouchUpInside)
  self.addSubview(@share)
  ...
end
```

And in your controller:

```ruby
def share
  item = SHKItem.text("This is the text you'll be sharing!")
  actionSheet = SHKActionSheet.actionSheetForItem(item)

  SHK.setRootViewController(self)

  actionSheet.showInView(self.view)
end
```

That's all there is to it! When you touch the 'Tap to Share' button, you should see the ShareKit action sheet pop up with all of the functionality you'd expect ShareKit to have. Twitter and Facebook sharing are yours to leverage!

As I said, this is sort of ugly, especially manually editing Cocoapod sources. But hopefully this guide will help someone else integrate ShareKit into their RubyMotion project quickly and easily. I sure wish I had known all this earlier this morning!