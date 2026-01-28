---
title: "Don't Mess With Primary Keys"
date: 2012-03-04 19:11
tags: [rails, beginner]
---
[I really like answering questions on Stack Overflow](http://stackoverflow.com/users/1224374/veraticus) -- it's like a trivia game that you win by knowing Rails backwards and forwards, but instead of cheesy prizes you get awesome reputation points! And also little badges!

Recently I've been seeing a lot of beginner-style questions, and the most popular has definitely been some variant of "how do I mess with the primary key column?"

The answer is always, invariably, the same: don't.


It might seem sensible to tuck some sort of business logic away into your primary key. Just earlier today, [I answered a question](http://stackoverflow.com/questions/9558715/changing-models-id-type-from-integer-to-decimal-makes-all-entries-try-to-be-0-0/9558832#9558832) from a guy who wanted to turn his primary key column into a decimal, and have the part before the decimal be equal to the primary key of another table -- so you'd have 75.001 and 75.002, with 75 being the primary key of the orders table. A cute idea for a new column like order_number or something like that, but just a plain awful idea for a primary key.

Primary keys, when you get right down to it, are database artifacts. They're useful because they allow databases to expose powerful relations for our data: without a way for databases to reference individual rows that are guaranteed to be unique, even the most basic joins would be impossible. And because they're important for databases, the assumption seems to be that they're important for people too.

Part of this is Rails' fault. By exposing URLs with primary keys by default (like users/4), one would automatically assume that the primary key is important data for a user to know (your key is 4 and that's important!). In reality nothing could be further from the truth: the ID for a user is arbitrary database-internal logic and has no business facing users at all. I wish Rails going forward came bundled with the really awesome [FriendlyId](https://github.com/norman/friendly_id) Gem that makes some unique database column appear to your internal application logic as the real ID for that table. Then you'd have URLs like users/josh, and that both looks better and obfuscates the primary key.

As a sidenote, this is why UUID-based keys like [MongoDB's](http://www.mongodb.org/display/DOCS/Object+IDs) and [Dynamoid's](https://github.com/Veraticus/Dynamoid) are rather nifty -- they make really ugly ID-based URLs by default so force you to choose a better column to use as a URL slug.

The problem with all this attention on the primary key is that, invariably, people want to change it. Changing primary keys is awful. It will disassociate data all throughout your database, it messes with table autoincrementing... it will lead to problems right at the moment, and even more down the road you won't even foresee. Or even worse, you'll want to choose something nonstandard as a primary key (or not choose one at all) -- and you'll want to perform a join and be forced to deal with the consequences of your decision. Hint: they won't be pretty.

So do yourself a favor. View the ID column as what it really is: an internal database construction. It should be an auto-incrementing integer, no excuses. If you want any kind of business logic, make a new column for it and manage it separately. You'll be glad you did, I promise.
