---
title: "Why RubyMotion Is Better Than Objective-C"
date: 2012-05-04 02:14
tags: [rubymotion]
---
Generally speaking I try to stay away from inflammatory posts. But the release of [RubyMotion](http://www.rubymotion.com/) has been a revelation to me. I've done iOS programming before, but I've always found it unpleasant next to programming in other languages. Don't get me wrong, Objective-C is better than C or C++, but I don't think that's saying a whole lot.

I've spent the better part of yesterday and last night (since RubyMotion was released) giving it a try. After converting two existing projects from Objective-C into RubyMotion, and spending some time developing one of those further using RubyMotion alone, I've come to a number of conclusions about RubyMotion and Objective-C. Ultimately, RubyMotion is superior to Objective-C in almost every way, and [Laurent Sansonetti](https://twitter.com/#!/lrz) must be some kind of mythical otherworldly genius to have developed something at once so usable and so powerful.

Why do I believe this? What makes RubyMotion so superior to straight-up Objective-C?


## Objective-C is Hard to Use

That's a pretty broad statement. By saying that, I mean that Objective-C is syntactically unwieldy, and that the development tools around it are difficult to employ. In my brief experience with RubyMotion, these are the main pain points it seems to be aiming to solve, so I'll discuss them very briefly for comparison's sake. I don't want to turn this post into hating on Xcode or Objective-C: it's really more about how RubyMotion is great.

So, that said, on with the Xcode and Objective-C hating!

### Xcode is Unstable

There's really no other way to put it. How many of you have had Xcode crash for no particularly good reason? And crashes are just the most common errors. Not three days ago I discovered, when I attempted to open a new terminal window, that somehow Xcode had forked over 700 processes and had consumed all available OS process slots. Seriously?

![Internal Error](http://veratic.us/GN2c/internal_error.jpg)

Why does that dialogue even exist? Who is it supposed to help?

Another gem is when your simulator crashes in a particular way that prevents Xcode from opening up any simulator in any app again. I still haven't figured out how to fix that without restarting my computer.

I don't want to dedicate this post to talking about the many instabilities in Xcode; I could go on, but I think I've made my point already. It's buggy.

### Xcode Hides Important Information

Xcode's user interface is nightmarishly complicated. Clutter doesn't even begin to describe it.

Put simply, Xcode takes all the build options possible for the Objective-C compiler, organizes them into unhelpful menus and buttons, and succeeds in obfuscating the few that are really important -- the most important settings for your project are hidden behind layers of unintuitive navigation. For example, to enable Zombie Objects, a common debug option for finding and correcting bad access errors, you have to go down one menu, select a navigation option, and then select a tab. That's three layers of menus between you and a useful checkbox! How on Earth would anyone find that without the help of Google?

I think the plethora of menus and tabs are intended to make projects approachable and easy for beginners. However, the layers of abstraction make windows cluttered and unhelpful for experienced developers, while being utterly incomprehensible for new ones. As another example, witness the dreaded Project file (the root of any Objective-C application). Click on it and go to your build targets and be assaulted by five tabs, many of them multiple pages long. There are important settings that you should change here. Good luck finding them.


### Objective-C Is Tedious

I end up doing a lot of copying and pasting in Objective-C. Copying and pasting is boring. Why do I have to have huge statements like this?

```objective-c
static UIColor *firstColor = nil;
static UIColor *secondColor = nil;
static UIColor *thirdColor = nil;
static UIColor *fourthColor = nil;
static UIColor *fifthColor = nil;
static UIColor *sixthColor = nil;
```

Hint: I only typed one of those. There's a level of abstraction waiting to be unlocked in Objective-C to collapse statements like that into one line (or preferably into nothingness). But, unfortunately, it's just not there yet.

I also end up writing a lot of debug statements. Introspection is unavailable at runtime and stack trace debugging, while vastly improved over where it used to be in Xcode 3, is still really unpleasant. Breakpoints and NSLog are the orders of the day in Objective-C, but it makes programming a very time-consuming process, where you spend a lot of effort verifying very little.

Ultimately, instead of solving interesting problems in Objective-C, I seem to spend most of my time on boilerplate code, copied and pasted from other projects or the Internet. It's taxing, boring, and very, very tedious.

## RubyMotion is Easy to Use

So! All the unpleasantness is out of the way. How, then, does RubyMotion solve all these problems? Why is it so, so cool?

### RubyMotion Uses Rake

`rake` is Ruby's `make` equivalent: it runs tasks on the commandline. By using a simple Rakefile, RubyMotion exposes an elegant and intuitive DSL for building your projects. Instead of layers of complicated menus, you have this:

```ruby
Motion::Project::App.setup do |app|
  app.name = 'TestApp'
  app.interface_orientations = [:portrait]
  app.identifier = '.com.TestCompany.TestApp'
  app.frameworks << 'CoreAudio'
  app.pods do
    dependency 'AFNetworking'
    dependency 'SVProgressHUD'
  end
end
```

Easy, elegant expression of the most important options in your application. Take that, build targets!

### RubyMotion is Ruby

Gone are header files, property and method declarations, and lines of ugly boilerplate variable initializers. RubyMotion is Ruby; that means you declare variables and methods as you need them. A side effect of this (besides shorter, more readable files) is that a lot of long Objective-C code is trimmed really substantially. Check out this snippet from the sample projects showing how easy it is to give a tableView new cells:

```ruby
cell = tableView.dequeueReusableCellWithIdentifier(CellID) || UITableViewCell.alloc.initWithStyle(UITableViewCellStyleSubtitle, reuseIdentifier:CellID)
```

The corresponding Objective-C, of course, looks like this:

```objective-c
UITableViewCell *cell = [self.tableView dequeueReusableCellWithIdentifier:CellID];

if(cell == nil) {
    cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:MyCellIdentifier];
}
```

I am admittedly biased: I think coding should be fun and easy, with a focus on doing interesting things. If you disagree with me then you probably won't like that RubyMotion is Ruby. The intersection of Objective-C and Ruby is handled really flawlessly. It revives the Smalltalk-style decorator syntax that Objective-C employs (with methods like `searchBar.setShowsCancelButton(false, animated:true)`) that Ruby 2.0 will be implementing. And it lets you do some totally awesome things. Check out this UIView I made:

```ruby
class LotsaLabels < UIView
  def initWithFrame(frame)
    if super
      offset = 0
      [:label1, :label2, :label3, :label4].each do |t|
        self.instance_variable_set("@#{t}_text".to_sym, UILabel.alloc.initWithFrame([[0, 10 + offset], [self.frame.size.width, 40]]))
        self.instance_variable_set("@#{t}_label".to_sym, UILabel.alloc.initWithFrame([[0, 55 + offset], [self.frame.size.width, 14]]))

        text = self.instance_variable_get("@#{t}_text".to_sym)
        label = self.instance_variable_get("@#{t}_label".to_sym)

        text.font = UIFont.fontWithName('Arial Rounded MT Bold', size:40)
        text.textColor = UIColor.redColor
        label.font = UIFont.fontWithName('Arial Rounded MT Bold', size:15)
        label.textColor = UIColor.grayColor

        text.text = label.text = t.to_s.capitalize
        text.adjustsFontSizeToFitWidth = label.adjustsFontSizeToFitWidth = true
        text.backgroundColor = label.backgroundColor = UIColor.clearColor
        text.textAlignment = label.textAlignment = UITextAlignmentCenter

        self.addSubview(text)
        self.addSubview(label)
        offset += 90
      end
    end
    self
  end
end
```

That would have taken forever and involved a lot of copying and pasting in Objective-C. As you can see, you can call any Objective-C methods from Ruby itself, because all Ruby classes are implemented on top of Objective-C classes -- with the traditional Ruby methods you've grown to know and love baked right on top. Of course, because Ruby is Ruby, there's significant room for improvement here. Why not a class to create these labels?

```ruby
class Label
  attr_accessor :label

  def initialize(text, frame)
    @label = UILabel.alloc.initWithFrame(frame)
    @label.adjustsFontSizeToFitWidth = true
    @label.textAlignment = UITextAlignmentCenter
    @label.backgroundColor = UIColor.clearColor
    @label.text = text.to_s
  end
end

class BigLabel < Label
  def initialize(text, frame)
    super
    @label.font = UIFont.fontWithName('Arial Rounded MT Bold', size:40)
    @label.textColor = UIColor.blackColor
  end
end

class LittleLabel < Label
  def initialize(text, frame)
    super
    @label.font = UIFont.fontWithName('Arial Rounded MT Bold', size:20)
    @label.textColor = UIColor.grayColor
  end
end
```

Or if you don't like classes, give a module a whirl instead:

```ruby
module Label
  def new_label(text, frame)
    label = UILabel.alloc.initWithFrame(frame)
    label.adjustsFontSizeToFitWidth = true
    label.textAlignment = UITextAlignmentCenter
    label.backgroundColor = UIColor.clearColor
    label.text = text.to_s
    label
  end
end

class BigLabel
  include Label
  attr_accessor :label

  def initialize(text, frame)
    @label = new_label(text, frame)
    @label.font = UIFont.fontWithName('Arial Rounded MT Bold', size:40)
    @label.textColor = UIColor.blackColor
  end
end

class LittleLabel
  include Label
  attr_accessor :label

  def initialize(text, frame)
    @label = new_label(text, frame)
    @label.font = UIFont.fontWithName('Arial Rounded MT Bold', size:20)
    @label.textColor = UIColor.grayColor
  end
end
```

Okay, the module example was a little contrived, but you get the idea.

This is the power of Ruby + Objective-C: you get Ruby's powerful and expressive enumerators, metaprogramming, and reflection, but Objective-C's APIs and libraries. It's like chocolate and peanut butter, they just go together so well.

Oh, and finally, because it's Ruby, it considers testing a first class citizen. Every RubyMotion app ships with a spec file that lets you create tests for your iPhone application in a simple and elegant manner that will look familiar to anyone who's ever used RSpec:

```ruby
describe "Application 'TestApp'" do
  before do
    @app = UIApplication.sharedApplication
  end

  it "has one window" do
    @app.windows.size.should == 1
  end
end
```

### RubyMotion Makes Debugging Easy

Whereas Xcode and Objective-C debugging is painful in the extreme, in RubyMotion it couldn't be easier. As soon as you compile and run a project, you enter a runtime loop for both debugging it and reflecting in it. From the simulator itself, you can select interface elements and arbitrarily change them from the commandline; by programatically referencing your application delegate, you can make your simulator call code without even pressing a button.

I don't think I'm doing this feature justice by describing it. You should really go [check out the video](http://www.rubymotion.com/getting-started/) to see it in action.

Exceptions also give you sensible error messages, and even backtraces! I put a method in my app that doesn't exist. Check out the RubyMotion console output:

```ruby
2012-05-04 09:37:52.843 TestApp[54214:f803] *** Terminating app due to uncaught exception 'NoMethodError', reason: 'lotsa_labels.rb:51:in `block in initWithFrame:': undefined method `explode' for #<LotsaLabels:0x6c385a0> (NoMethodError)
	from lotsa_labels.rb:42:in `initWithFrame:'
	from test_view_controller.rb:14:in `loadView'
	from test_view_controller.rb:103:in `showLabels:'
```

This isn't all sweetness and light, though. Without breakpoints, it can be a little difficult to stop and step through code to see exactly what's happening. As a rule you don't have to do that nearly as much, though -- or at least I haven't so far. Finally, there's no great way to get logging output from the application other than outputting directly to stdout. When I want to log stuff, I end up having lines like this:

```ruby
  $stdout.puts "Received response: #{response}"
```

Which just splats lines directly into the console. Not the most elegant solution, but it works, and that's what counts.

### RubyMotion Isn't Perfect

As you've just gathered, RubyMotion has room for improvement. I know I'll miss tab completion from Xcode. Method names never seemed so long as when you have to type them. dequeueReusableCellWithIdentifier, ugh. Without tab completion, you do a lot of copying and pasting from the documentation when you find a method name you like, just to ensure you don't accidentally typo it.

I've definitely run into errors with no backtrace at all -- just a straight simulator crash along with no output on the commandline. So there's still some ironing out around the whole process that needs to be done. And Cocoapods, for all its awesomeness, won't compile JSONKit for some reason. Or I'm doing something wrong, one of the two.

These are minor implementation errors, though; the overall philosophy and integration is, well...

### Better Than Objective-C

RubyMotion corrects a lot of the flaws in Objective-C and Xcode. It's easier to write and debug; it gives you Ruby's powerful programming idioms on top of Objective-C's extremely extensive libraries. It bakes in testing and provides an easy, quick way to set up and provision apps. Though it has a number of extremely minor downsides, overall I would unequivocally recommend checking out RubyMotion if you have any interest at all in either Ruby or iOS apps. You'll be glad you did.
