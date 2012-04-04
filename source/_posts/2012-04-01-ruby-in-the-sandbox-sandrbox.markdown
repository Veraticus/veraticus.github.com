---
layout: post
title: "Ruby in the Sandbox: SandRBox"
date: 2012-03-31 11:19
comments: true
categories: [beginner, ruby, sandrbox]
---
I volunteer in the cyber center at the [Center on Halsted](http://www.centeronhalsted.org/). They're always looking for people to teach new classes, so I figured I would teach an introduction to programming class -- an introduction through Ruby. Besides being my favorite computer language, I think Ruby makes a great beginner's language: it has none of the strange, computer-oriented concepts that make most programming languages difficult to learn, and it even reads like pure, simple English. Instead of pointers and variable typing, you have sensible enumerators and object orientation. And also it's super fun.

Unfortunately, getting stuff installed on the computers at the cyber center is kind of a headache. Like most chronically underfunded but well-meaning institutions, there are about three levels of bureaucracy between you and getting anything done. And teaching Ruby without the aid of irb would be next to impossible. So what's a guy to do?

Simple: [create irb online](http://sandrbox.herokuapp.com/).

<!-- more -->

Now, I hear what you're saying: "Josh, that already exists, and it's called [tryruby.org](http://tryruby.org/)!" Unfortunately, I don't like tryruby all that much. I have nothing but respect for their mission, but the service itself is achingly slow and frequently it won't work at all. I don't know what they're running it on (the only code I could find on github was months old), but I figured I could whip up something better.

[Turns out I was right](https://github.com/Veraticus/Sandrbox). Sandrbox is a simple project that I'm actually pretty proud of; it makes use of some very edge-case metaprogramming concepts to create as secure an irb environment as I could whip up. In addition to removing dangerous methods on classes (and their metaclasses), it has some really nice syntactical sugar that makes it easy to understand where you are in a block. And when the execution of your secure code is done, it restores all the classes and methods that were missing while removing any new ones that were added, guaranteeing that your environment will be exactly the same as before you started executing code.

This is obviously important if you intend to run that code on a server somewhere -- after all, you can't have someone doing something like:

```ruby
`killall -9 thin` # bad
Kernel.exec("rm -rf /") # worse
```

These methods when executed in Sandrbox are instead gently sanitized:

```ruby
Sandrbox.perform(['`killall -9 thin`']).output # => ["NameError: undefined local variable or method ``' for Kernel:Module"]
Sandrbox.perform(['Kernel.exec("rm -rf /")']).output # => ["NameError: undefined local variable or method `exec' for Kernel:Module"]
```

While still allowing you to retain the power and complexity of Ruby:

```ruby
Sandrbox.perform(['class Foo', 'def test', '"Hi!"', 'end', 'end', 'Foo.new.test']).output # => [nil, '"Hi!"']
```

Even cooler is that it automatically does some parsing for you, so that you know when code can be executed or the user is probably not done yet typing:

```ruby
response = Sandrbox.perform(['class Foo', 'def test'])
response.output # []
response.complete? # false
response.indent_level # 2
response.indent_character # 'def'
```

I put a small Sinatra app in front of this and made a little site that I also called [Sandrbox](http://sandrbox.herokuapp.com/). I intend to use it in place of irb to teach this introduction to programming course -- it'll make a great tool for putting the power of Ruby in front of people while still being relatively assured that they can't destroy my server (intentionally or accidentally). And the code is really pretty neat, so you should definitely [check out the repository](https://github.com/Veraticus/Sandrbox). I can't say that it's totally secure yet, but it's a damn sight better than uncensored irb, and after a week or two of work I bet I'll be able to get it locked down pretty damn tight.

But until then, go ahead and try to break it!