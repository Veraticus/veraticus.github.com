---
layout: post
title: "Introduction to Programming I"
date: 2012-04-24 12:04
comments: true
categories: [beginner, ruby]
---
This is a copy of the handout I'll be giving to students for my upcoming class at the [Center on Halsted](http://www.centeronhalsted.org/), creatively titled "Introduction to Programming." It borrows structure rather liberally from Chris Pine's [Learn to Program](http://pine.fm/LearnToProgram), but the content is my own.

<!-- more -->

## Getting Started with Ruby

### Welcome to Programming

Computer programming is the skill that allows you to make computers do what you want. Computers are excellent at menial, repetitive tasks that require little oversight and no creativity: but you can also use them to make amazing websites, games, and applications. Whether it's a simple program to make your day-to-day life easier, or a complicated application that gives you full-time employment, computer programming is invaluable professionally and also rewarding personally. Even better, it's lots of fun!

Many people are intimidated by the idea of learning computer programming -- they're worried you need complicated math or lots of formal training to do well. Nothing could be further from the truth. Computer programming can be learned by anyone and is very much learning a new language. All you need to succeed at computer programming is familiarity with computers, a willingness to learn, and a computer to do the programming on.

You'll be learning computer programming through the computer language Ruby. Ruby was created with two goals in mind: productivity and fun. While easy to learn, it's also an extremely powerful programming language widely used in the professional world. Some of the most popular websites on the Internet were created with Ruby -- for example, Github, Hulu, and Twitter are all implemented in Ruby.

To learn Ruby, we'll be using an online tool that allows us to quickly and easily try Ruby, called sandRBox. In our first **exercise**, we'll go to sandRBox and type in an example expression.

1. Open up your web browser.

2. In the address bar, type `sandrbox.com`, and press enter.

3. In the page that opens, type `1 + 1`, and press enter.

The output of your command is returned to you immediately. Congratulations, you're a computer programmer!

### Numbers

Computers are really excellent at math. In this **exercise**, we'll learn how to do math in Ruby.

1. Try `2 * 3`. `*` is the multiplication operator.

2. Try `9 / 3`. `/` is the division operator.

3. Try `2+2`. You don't need spaces around the operator; in fact, Ruby doesn't care how many spaces appear in a statement.

4. Try `-9 - 3`. By putting a minus in front of a number, it becomes negative.

5. Try `9 / 0`. This is your first ever error message in Ruby. The kind of error appears before the colon (ZeroDivisionError, in this case); some helpful error text appears afterwards. Obviously, this error means you can't divide by zero.

6. Try `5 / 2`. It might surprise you that the result is 2 instead of 2.5; what's going on here?

In Ruby, there are two kinds of numbers. There are **integers** -- that is, whole numbers, whether positive or negative -- and there are **floats**. Floats (short for "floating-point numbers") are numbers with any kind of decimal place, even if that decimal place is zero. `55.123`, `-231.4`, `0.001`, and `5.0` are all floats.

Most of the time, you'll be using integers. This is because most people (and thus most programs) deal in whole things: you don't receive 4.3 emails, or view 1.8 webpages, or listen to 5.24 of a song. Floats are used when you're doing more complicated mathematics, for example graphics or physics. 

In this **exercise**, let's do some math on floats.

1. Try `2.0 * 3.0`. Of course, the answer `6.0` is the same as the answer for integer math, `6`.

2. Try `5.0 / 2.0`. Now that answer looks a lot more like what we'd expect!

3. Try `-9.0 + 8.0`. Everything you would expect to work in integers works fine on floats.

4. Try `(598.0 / (92.0 - 90.0)) * 43.0 + 2.0`. Even complicated math is easy with computers!

### Strings

Numbers are exciting, but people generally use words a lot more than they do numbers. We refer to letters, words, and sentences in Ruby as **strings**. Strings in Ruby are always encapsulated by either single or double-quotes. In this **exercise**, we'll write a few strings to see how they work.

1. Try `'Hello.'`. Notice that when Ruby returns a string to us, it's always in double quotes, even if we typed it in single quotes.

2. Try `"This is a big fancy string."`. Strings can be of any length and can contain any characters: spaces or punctuation included.

3. Try `'2 is my favorite number'`. Numbers that are in strings are just more words.

4. Try `'Well isn't this nice.'`. Oh no!

5. Try `"She said, "This is foolish!""` What's happening?

You'll get a syntax error for the last two statements above. In both cases, Ruby is expecting a single quote or double quote to end the string, but instead we're using one inside the actual string itself. Ruby is only a computer language. Unlike a human reading either of those sentences, it can't tell which quotation marks are part of the sentence and which are intended to start and end the string; instead it gives us a syntax error.

Strings are fun to type, but they're even more fun to actually use! Let's do an **exercise** that shows us the power of strings.

1. Try `'Hello' * 3`. Whoops, we probably wanted to put a space in there. Let's try it again with `'Hello ' * 3`. There, isn't that much better?

2. Try `'Message in ' + 'a bottle.'` Again, space is important.

3. Try `'12' * 3`. Is this different than what you'd expect?

4. Try `'12' + '12' + '12'`. How about that?

The last two won't actually do math, like you might expect. Remember `'12'` is a string: `12` is an integer! So `'12'` is no different from `'sandwiches'` or `'love'` -- it's a word to Ruby, not a number. If you try to use strings as numbers, Ruby won't understand what you mean. Here's a quick **exercise** to illustrate this point.

1. Try `'14' + 14`.

2. Try `3 * 'bacon'`.

If you think about it, both of these errors make sense. What would it mean to add 14 to the word "fourteen?" How do you multiply three by bacon? Remember, computers can only do what you tell them. If you tell them to do things that don't make any sense, they'll return errors. Still, wouldn't it be nice to be able to add `'14'` to `14` and get 28, like we'd expect?

### Methods

What do `1`, `"Hello"`, and `'My favorite number is 3'` all have in common? In Ruby, they're all objects. Ruby objects are very similar to real-world objects. Objects in Ruby can do things, just like objects you interact with every day. A car can drive, a cat can meow, and a person can smile. Objects in Ruby can do things as well; and the things that they can do are called **methods**.

In Ruby, you make an object perform a method with a period, and then the name of the method you want to call. So if you could use Ruby on your car, you would use `car.drive` to drive it, and if your cat wanted to meow, it would do `cat.meow`. Let's try a quick **exercise** to see how easy it is to use methods.

1. Try `'Hello'.reverse`. reverse is a method for strings: it reverses the string for you. How helpful! In this example, 'Hello' is the object. The period instructs Ruby that a method is coming up next, and reverse is the name of the method.

2. Try `1.odd?`. Ruby tells you `true`, which obviously means that 1 is an odd number.

3. Try `1.zero?`. One is not zero, so Ruby returns `false`.

4. Try `'Sentence!'.length`. Length is a string method that returns how many characters are in that string.

5. Try `'I want to yell this'.upcase`. Upcase transforms a string into all capitals.

There are dozens of possible methods for strings and numbers. Learning Ruby is very much like learning a new language -- while you will learn the grammar and the most commonly-used words in this class, you'll eventually want to grab a dictionary and look up more words yourself. Ruby's documentation contains a simple, complete, easy-to-read list of methods and is free online. There are instructions for finding it at the end of this handout.

Ruby tries to be as sensible as possible. Methods are named to be unsurprising and predictable. For example, if you know about `upcase`, you can guess that there's a similar method called `downcase` that does exactly the opposite -- that is, it would convert all letters into lowercase. And you'd be right!

Because Ruby tries very hard to be unsurprising, there are many methods with the same name between different kinds of objects. These methods generally do the same sorts of things. For example, strings and numbers both have a method that might look very familiar to you: the method `+`! Yes, you were already using methods without even realizing what they were. Try a quick **exercise** to prove it.

1. Try `1.+1`. 

2. Try `2.-1`.

3. Try `"One".+"One"`.

The plus method is special. You don't need a period before it, but on almost all other methods, you do. It also acts differently for strings and numbers. On strings, `+` concatenates strings together. But on numbers, it actually adds them. Unfortunately, not all methods are present on every object. Try this **exercise** to get a new, exciting Ruby error that you'll probably see a lot of: the NoMethodError.

1. Try `1.reverse`. Whoops: `reverse` is a method for strings only.

2. Try `"Hello".odd?` Drat. Looks like `odd?` is only for numbers.

3. Try `"Hello".zero?` So is `zero?`.

With the NoMethodError, Ruby is letting you know that a method you tried to call on an object didn't exist. You might have the wrong kind of object, or maybe you mistyped the method name. Whatever the case, this is Ruby's nice way of telling you that you messed up somewhere.

### Conversion

Remember earlier how we thought it'd be nice if you could add `'14'` and `14` together to get 28? We now have all the ingredients to make this happen. Ruby has methods that convert one kind of object into another kind of object. In this **exercise**, we'll do some exciting conversions!

1. Try `1.to_s`. to_s means "to string." Notice that the result comes back with quotation marks -- this isn't the number 1 anymore, but instead the word "1"!

2. Try `1.to_f`. to_f means "to float." The result is the number 1 as a float -- that is, 1.0.

3. Try `2.3.to_i`. to_i means "to integer." Because integers can only be whole numbers, the trailing .3 is dropped, converting the number to 2.

4. Try `'3'.to_i`. The word "3" is now the number 3.

5. Try `'14'.to_i + 14`. Pretty convenient, huh?

6. Try `'Hello'.to_i`.

The result of that last one might surprise you. Ruby tries very hard to perform conversions sensibly, but when it can't convert a string, it'll return zero instead. So be careful of what you're trying to convert, or else you might get zero back instead.

### Next Session

Now that we've covered the basics of Ruby, we'll put what we've learned into action. Using variables, we'll create our first Ruby programs, and finally make the computer work for us!