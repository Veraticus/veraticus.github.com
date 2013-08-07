---
layout: post
title: "RubyMotion Update: One Month Later"
date: 2013-08-07 10:59
comments: true
categories: [rubymotion]
---
My [last post on RubyMotion](http://joshsymonds.com/blog/2013/06/26/why-im-not-using-rubymotion-in-production/) generated quite a lot of interest, and I've been asked a few times for my opinion on the recent RubyMotion bugfixes (like correcting [RM-3](http://hipbyte.myjetbrains.com/youtrack/issue/RM-3) and [RM-32](http://hipbyte.myjetbrains.com/youtrack/issue/RM-32)). I thought it sensible to revisit this issue a month later to discuss the changes the HipByte team has been making and what they mean for the future of the RubyMotion project.

<!-- more -->

The issues Laurent prioritized have done much to restore my confidence in using RubyMotion for production applications (which I think is a great framework anyway, memory issues aside). Before starting new client work in it, I'm personally waiting a release or two longer to make sure that the fixes are indicative of a future pattern of prioritizing stability and memory management over exciting new hotness... Exciting new hotness is definitely great and probably lots of fun to make, but those of us making money on RubyMotion care more for platform stability than nifty new features. Or, at least, I do.

RM-3 flew under the radar because there were workarounds that corrected it most of the time -- specifically, using instance variables instead of local variables or, when that failed, making a class to contain the block in question. These fixes would usually result in the memory behavior you'd expect, but their decidedly un-Ruby-like syntax made them very surprising to anyone using the framework for the first time. [A comment on my original post on Hacker News](https://news.ycombinator.com/item?id=5952085) states:

<blockquote>Every time I heard the phrase "well-known workaround" I interpret it as "tribal knowledge."</blockquote>

And I think that applied very well to the workarounds available for the memory management issues. If you knew these issues existed and how to circumvent them, you were fine: but if you came into the framework with no foreknowledge and just coded regular Ruby, you were in for a nasty surprise. For RubyMotion to really attract the kind of success it deserves, surprises like that can't exist. Either you should be able to code Ruby as you would in MRI, or the differences in RubyMotion syntax as compared to regular Ruby syntax must be made as clear as possible.

HipByte recently released [RubyMotion 2.5](http://blog.rubymotion.com/post/56232015979/new-in-rubymotion-blocks-rewrite-retain-cycle), which is a strong affirmation of these principles. In addition to a complete rewrite of blocks, it contains a cyclic reference detector and improvements to crash reporting so that exceptions are no longer mysterious possibly-memory, possibly-something-else errors: now we can know with some confidence exactly what went wrong. This is RubyMotion saying, "we take performance and crashes very seriously" -- a much-appreciated statement indeed.

So is RubyMotion worth buying now? In my opinion, yes, very much. It's much faster to build iOS apps in RubyMotion than Objective-C, so if you want to get a rapid prototype out or just don't want to learn C and Objective-C, RubyMotion is a great investment. It's also a great way to get acclimated with the iOS frameworks in a language that's a lot kinder and gentler than Objective-C. And while I don't feel confident saying "this is now production-solid" yet, I'm watching the project very closely and it's definitely moving rapidly in the right direction.

So what's next? Well, I'd be lying if I said I weren't super excited about the new [RubyMotion JoyBox blog post](http://blog.rubymotion.com/post/57465814533/create-an-asteroids-game-for-ios-in-15-minutes-with). I'll personally be using RubyMotion to make an awesome game of some sort, because everyone loves games. I know that the RubyMotion team is incredibly dedicated to the framework, and I have the utmost confidence in their work as demonstrated by the performance improvements and bugfixes in versions 2.4 and 2.5. RubyMotion has a very bright future ahead of it; what it's done up to this point is nothing short of amazing, and there's every reason to believe that's a trend HipByte will continue into the future.
