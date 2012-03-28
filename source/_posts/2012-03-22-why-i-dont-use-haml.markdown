---
layout: post
title: "Why I Don't Use Haml"
date: 2012-03-22 13:19
comments: true
categories: [ruby, gems]
---

I initially thought of titling this post something more inflammatory, like "Why Haml Sucks" or "Only Losers Use Haml." But the truth is [Haml](http://haml-lang.com/) does anything but suck. It's actually quite elegant; the syntax is clean, not needing closing tags is just really cool, and it's very fast to read. It seems like it would be an ideal language to replace HTML, just like SASS and CoffeeScript are abstractions of and (to a certain extent) replacements for CSS and JavaScript, respectively.

So why do I bang my head against my desk every time I see someone using it in a view?

<!-- more -->

## Indentation Sucks (Usually)

Notice the cute little parenthetical up there? That's because I really do like CoffeeScript, which is just as whitespace-sensitive as Haml. So what's the difference?

CoffeeScript uses indentations to abstract away one of the worst "features" of JavaScript: the dreaded ```})``` sequences. Closing arguments and functions again and again is not only a headache, it happens so frequently that some sort of error is inevitable. Strict whitespace rules help us avoid errors in closure. Of course, the same argument can be made about HTML and Haml's whitespace rules, but there's another key difference here.

HTML closures indicate which tag they close. You don't have a forest of ```)})})}```, which even if you indent correctly still won't tell you which parenthesis or bracket they're closing. Instead you have an obvious and syntactic declaration of which tag you're ending when you end it. You can argue that the tag closure is unnecessary (Haml seems largely based on this argument), but you're trading explicit tag closure for explicit whitespace restrictions...

And ultimately (and most damningly), whitespace restrictions make the document harder to read and understand than closing tags. If you have an extremely long page with many nested elements, Haml is very difficult to comprehend and consequently much harder to use.

## If It Ain't Broke...

SASS and CoffeeScript fix serious errors and oversights in the implementations of their specific languages. CoffeeScript ensures correct lexical scoping of variables; SASS allows variable assignment and better selectors than CSS. Both are enormous improvements on the languages they compile into.

Haml doesn't add anything at all to HTML. There's no special Haml tags that do something HTML couldn't do by itself. It gives you a shortcut for the syntax, but that's essentially it.

And HTML really isn't that bad by itself. The syntax is already fairly clean and clear; it's not like we're lost in a field of, well, parenthesis and curly brackets. Tables can get a little muddy at times, but good HTML and CSS prevent documents from becoming unreadable -- and Haml doesn't offer any interesting or unique tools to improve readability, either.

## Designers Aren't Programmers

But I think this is the biggest reason I don't use Haml. Frontend designers use CSS, and the best ones employ JavaScript (and program good JavaScript!) -- but every single one is going to be using HTML to create their pages. Eventually, if your site gets big, you're going to want a designer to do some pages for you... and they're not going to be producing Haml, they're going to be producing HTML.

Sure, you can change that HTML to Haml. But let me guarantee you, one day they'll want to change something, and at that point you do one of three things:

1. Show them the Haml site, tell them to do it all in Haml, and pay for them learning it.
2. Take their design and convert it to Haml yourself and then incorporate it into the page.
3. Curse your unjust fate and just switch to erb and copypaste their changes in.

As I said at the beginning, I like Haml. But it's a markup language for programmers, and ultimately the people who use HTML the most aren't programmers. SASS is barely a programming language, more like a set of syntactical shortcuts; and CoffeeScript appeals to those who program in JavaScript already. Haml just doesn't appeal to the correct audience to use its core feature set, which is a damn shame, because Haml really is pretty cool.