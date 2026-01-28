---
title: "How to Refactor a Large and Old Project"
date: 2012-04-03 10:06
tags: [rails]
---
The Rails application backing Hipstamatic is very, very large. It started over two years ago as a Rails 2.1 project, and has been continuously improved since then -- moving to Rails 3.2, adding in redis and resque, and then adding in elasticsearch. During that time the database has bounced around continuously in size and importance as we move data from MySQL to data stores that are [better suited for it](http://joshsymonds.com/blog/2012/03/25/elasticsearch-and-percolation-in-rails/). And while at the start it handled only contests and submissions, since then we've added in orders, the family album, D-Series support, and even more exciting behind-the-scenes stuff.

And as you can imagine from a project that's undergone continuous improvement for a long time, it's kind of a mess. A lot of stuff was done without an eye towards our future needs, and, even more embarrassingly, a lot of stuff was done with a future need in mind -- and, of course, that need never materialized, so the code is named or structured improperly.

The temptation with any project as large and old as this is to do [the Big Rewrite](http://chadfowler.com/2006/12/27/the-big-rewrite). I've been involved in a few of those, and my advice regarding them is quite simple:


#DON'T DO IT

There are [multiple](http://mentalized.net/journal/2010/10/04/avoiding_the_big_rewrite/) [articles](http://www.joelonsoftware.com/articles/fog0000000069.html) [discussing](http://blog.objectmentor.com/articles/2009/01/09/the-big-redesign-in-the-sky) why the Big Rewrite is a horrible idea, and reiterating their excellent points here isn't my intention. Instead I'm going to discuss the plan I've decided on for our own project, which I'm going to call, in lieu of the Big Rewrite, the Proper Refactoring.

Our Proper Refactoring will split our one monolithic application apart into a number of services, exposing their APIs for the happiness of our users while hiding the internals of their business logic from parts of the application that don't care about it. If you want to follow along on our process (or do your own Proper Refactoring), I wrote down a quick summary of the three (well, four) simple stages that will take us from having one large working app to many small working apps!

1.  ###Test it all first.

    This entire process is doomed to failure if your application isn't tested. There's no way you can achieve 100% test coverage, regardless of what [SimpleCov](https://github.com/colszowka/simplecov) tells you -- there's always that quick fix you stuck in to fix a small problem that isn't tested and won't show up in any coverage report. But you need to get as close as humanly possible, because stuff will break (like that quick fix), and you can limit how much breakage occurs by testing everything you can before you start. 

    Happily, Hipstamatic is well tested, so step zero for us is pretty well completed. I still anticipate problems will occur as we make the change, and of course as I find code that isn't adequately tested I'll write tests for it... but both of those are unavoidable.

2.  ###Find breakpoints and map splits.

    Hipstamatic will be turning into five services: authentication, photos, contests, ordering, and D-Series cameras. Our main goal is to silo concerns apart from each other, making each part of the application more failure resistant and robust while allowing us to develop them all independently from each other if necessary. I'm not 100% settled on this separation of concerns, but the order that I listed them is the order I'll be working on them. If it seems like something just has to be married to something else, I'll combine them together and that'll be that.

    So if you're doing this on your own project, split your application into units that are atomic enough that they can be changed independently from each other, but not so atomic that close couplings are undone. My benchmark for this is going to be if I have two projects open simultaneously and keep coding in the two of them in tandem, most likely they should be merged.

3.  ###Start copying and pasting.

    The fun part! Take the parts necessary for the one fragment you're working on and merge them into one coherent project. Crucically, *don't change anything except what's absolutely necessary*. You'll find code that you want to change, trust me. Just slap some TODOs on that baby and keep moving. It's important that you change as little as possible, because the process is already breaking apart your nice pretty app. If you start changing the pieces once they're broken, you'll find they don't fit back together quite right, and that will be an enormous headache to fix.

4.  ###Add relevant bits to the API Gem.

    For our web services to understand each other, and to prevent duplication of code, I'll be extracting connector bits into a Gem that each application (and indeed any application that wants to consume our API) can use. It'll most likely be heavily based on [httparty](https://github.com/jnunemaker/httparty) since ActiveResource isn't anywhere near as actively developed.

And the split is complete! Of course it sounds pretty easy when you gloss over most of the hard work in step #2, but hey, the way to make complicated projects seem achievable is to reduce them into manageable steps. I intend to follow this road map like the Pope follows the Bible -- that is, using the good parts and ignoring the rest. Zing! But I'll report back in a future post to indicate how well these steps worked for me. Until then, wish me luck!
