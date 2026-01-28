---
title: "Classifying and Refactoring Your Code"
date: 2012-03-16 00:39
tags: [ruby, beginner]
---
Outside of the guiding framework of Rails, it can be difficult to manage your own Ruby code, as I've discovered in the process of creating [Dynamoid](https://github.com/Veraticus/Dynamoid). MVC provides a clear and concise framework that encapsulates the functionality of most web applications really well; but outside of web applications, exactly where and how to put your code is a lot less clear. I thought I'd share some of my experiences and thoughts on doing this in my own Gem in the hopes that the lessons I've learned will aid others.


## Hashes = Objects
In the earlier iterations of Dynamoid, I was passing around almost everything in hashes, and the calculations I was performing on those hashes was growing more and more complicated as I went, with logic flying around my files like a flock of disorganized birds. When I was putting index logic into criteria chains, I realized that keeping indexes as hashes was an enormous mistake... and one I wish I had realized earlier.

As I was refactoring my code I realized that I pass hashes around in a number of places. Hashes work well initially to store small amounts of data, but if you're using them for that purpose you almost certainly want a real object instead. Just whip that hash apart into a class and you'll be surprised how much code will go in there, and how much simpler your application will be for your trouble.

## Refactor Early, Refactor Often
I tend to be my own harshest critic, but honestly, my first pass at features tends to be messy at best. I make my tests pass (always test first, btw, but that's so fundamental I'm not going to include it as a point) but usually in the most complicated, slowest, unpleasant way possible. Take some time after the tests pass to stare at your code a bit and decide if that's really the best way to go about doing things. Usually a change will jump out at you immediately, but don't be afraid to just come back to the code later if nothing presents itself.

Tests allow you to do this kind of refactoring free of charge. I always imagine tests as the scaffolding around my code; no matter how tall the code gets, with the scaffolding it'll never fall over.

## Document!
I'm really bad at this one myself, but I'm going to be going back through Dynamoid in the very near future and adding documentation to all my methods. Even if your code is a one-liner, people will read documentation over code every time. So document that code! Especially in a collaborative environment, documentation is critical for making your project easy to contribute to.
 
I'm sure other things will pop out at me after some thought, but these are the biggest takeaways Dynamoid has given me. Hopefully they'll be of use to someone else as well.
