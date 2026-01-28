---
title: "Introduction to Programming III"
date: 2012-08-21 10:56
tags: [beginner, ruby]
---
Another in the exciting introduction to programming series! This is looking like it'll be a four-part series; at least, I think I'm running into a wall in terms of complexity that I think defines the end of "introduction." Still, I hope it'll be helpful to someone, and it'll hopefully be a popular class at the Center on Halsted.


## Flow Control

In this lesson, we're going to learn how to give our programs some structure. While your very first program was pretty exciting, it also left a little to be desired. What if you wanted to change what we said based on the person's name or hobby? And how do we make Ruby keep repeating the program without manually pressing the "play" button by ourselves?

We're about to learn the means to do that, and we'll start with a fundamental concept in computer programming: comparisons.

### Comparisons

Many programs rely on comparisons of data to execute properly. For example, consider y. If you put in your email address and password, it has to figure out if those are actually equivalent to what's been stored on the website. As another example, think of an mp3 player. When the song has played the entire length of its track, it has to automatically move to the next track. To do that sort of thing, computer programs rely on comparisons.

All comparisons return `true` or `false`. `true` and `false` are special objects in Ruby: we use them all the time, as you'll see very shortly. Let's learn about comparisons in an exciting **exercise*.

1. Type `1 == 1`. This is the equality comparison. It checks if two objects are exactly equal to each other. We use two equals here, instead of one, because one equal is for variable assignment (as we learned last lesson). Two equals are for equality comparison.

2. Try `'string' == 'other string'`. Obviously these two strings are different: the comparison returns false.

3. Try `'mary' == 'mary'`. Since these two strings are the same, we get true.

4. Try `1 > 2`. Greater than and less than are other comparison operators: they tell you when numbers are, obviously, greater than or less than other numbers.

5. Try `2 < 2`. Two is not less than two, it is equal to two; so this comparison returns false.

6. Try `2 <= 2`. This is the less than or equal to operator: it has an equivalent greater than or equal to operator, `>=`. 

7. Try `'cat' < 'dog'`. This part is a litle confusing: when you compare strings, it compares the actual byte values of the first differing letters. Thus, on most computers, `'z' > 'a'` will be true! This can be very unexpected and is a reason why you generally don't use greater than or less than on strings.

8. Instead, a common string method that returns `true` or `false` is `include?`. Try `'zookeeper'.include?('zoo')`. This returns true, because the string 'zookeeper' does indeed contain the substring 'zoo.'

As I said before, we use `true` and `false` all the time: and their primary use is for branching.

### Branching

Very frequently, you'll want to vary what your program does based on a comparison. If the user enters in the word 'dog', you want to print our 'bark': but if they enter in 'cat', you want to print out 'meow'. We already know how to compare the strings 'dog' and 'cat': but how do we change what our program does based on the result of comparisons?

We use branching! Branching is a simple concept but very powerful. Let's write our second program to understand how we can use branching in Ruby.

```ruby
puts "What animal do you want to hear?"
animal = gets.chomp

if animal == 'cat'
  puts "Meow!"
elsif animal == 'dog'
  puts "Bark."
else
  puts "Moo..."
end
```

Remember `puts` and `gets` from our last lesson, along with `chomp` to get rid of newlines? We're using them again: `puts` outputs information to the console, whereas `gets` gets it in. But the new and exciting stuff here is the `if` statement.

An `if` statement in Ruby allows us to change what our program does on the fly. When you type `if`, the first thing afterwards has to be a conditional that evaluates to `true` or `false`. If the statement is true, the very next line is executed; in this case, we puts "Meow!".

If that conditional isn't `true`, however, we skip that line entirely and move along. In this case, the computer moves to the next statement: `elsif`. As you might have guessed, `elsif` is computer speak for "else if." In other words, if the first if statement is false, try this one instead. Just like `if`, `elsif` takes one condition that must evaluate to `true` or `false`, and just like `if`, if the statement isn't true, it moves on to the next one. We can have as many `elsif`s as we like after an initial `if`: the first one that is true, though, will cause the other ones to all be skipped. It's an "else if", after all, not an "and if!"

The final piece of this conditional puzzle is `else`. If all the previous conditions have been false, then what we've provided in `else` will be executed. In this case, if you didn't enter in 'cat' or 'dog,' then we assume you must want a cow and we put out "Moo...".

All `if` statements have to end with an `end`. A lot of multi-line programming needs an `end` at the very end: otherwise the computer won't know where the `if` terminates.

Let's try another new program -- except this time you'll make it on your own. Let's use a new string method, called `capitalize`. Ask what the user's name is, and then get it from the command line. Check if what they typed is equal to what they typed, capitalized. If it is, then welcome them to Introduction to Programming. If it isn't, ask them to try again with a capitalized name... since the most important part of programming is correct capitalization!

### Looping

Of course, running this program over and over again isn't exactly the most fun thing in the entire universe. I bet you've heard that computers are great at mindless, repetitive tasks... but here, it's you clicking on that little "play" button making the program run. Doesn't that seem like an injustice?

Happily, we can fix this problem. Let's try another program to illustrate how easy it is to repeat stuff in Ruby.

```ruby
100.times do
  puts "I love programming!"
end
```

That should probably leave you breathless, saying "I love programming!" a hundred times. What exactly happened here, though?

`times` is a method on integers that takes a new kind of Ruby construct: a block. A block is a small, encapsulated bit of code that a lot of Ruby methods accept. These methods that want blocks always do something with the code in the block. In this case, `times` simply repeats the block over and over, for as many times as the integer it was called on.

`do` defines the start of a block; `end` is, obviously, the end. Everything between the `do` and the `end` is part of the block, and in this case will be repeated 100 times.

What if we don't want to repeat this merely 100 times, though? What if we want to repeat something endlessly? For that, let's make a completely new program.

```ruby
puts "This is an endless loop! Type 'q' to quit."

loop do
  response = gets.chomp

  if response == 'q'
    break
  else
    puts response
  end
end
```

This program uses a block to do most of its work: but the method we're using to start that block is `loop`. As you probably guessed, `loop` will repeat the programming inside the block endlessly, never exiting if it can help it. The special method `break` that we use inside the block is one of only two ways to exit a loop that is permanently repeating.

Let's try another loop, but this time, let's "forget" to include a break statement.

```ruby
loop do
  puts "Sayonara repl.it"
  sleep(1)
end
```

That sleep method commands the computer to wait for 1 second whenever it encounters it: in this case, the computer will output "Sayonara repl.it", wait one second, and then do it all again.

Oh no! We forgot to include a break statement, and now our computer will repeat this poor program forever. What are we supposed to do?

### The End of Repl.it

Unfortunately, there's not a whole lot we can do... on repl.it.

We've learned about the basic types of Ruby: integers, strings, and floats. We've learned how to use methods on them, and we've learned about Ruby's basic data structures -- arrays and hashes. We've even learned about variables and comparisons. And through it all, repl.it has been our constant ally and friend.

Now we have to abandon it.

That might sound harsh, but remember that repl.it is only a tool for learning Ruby. Real computer programming takes place not in a browser, but on your own computer. When a program goes haywire on our own computer, we have special tools for terminating it and restoring the system's functionality. But on repl.it, those tools don't work. So as we get into more complicated programming, we'll have to migrate away from repl.it and onto some more complicated tools: but along with additional complexity comes greater power.

### Installing Ruby Locally

For the purposes of this class, I've installed Ruby on all the computers beforehand. But if you ever want to install Ruby on your own computer at home, it's really simple. Instructions for downloading Ruby can be found on the official Ruby website at ruby-lang.org: just click on the "Download Ruby" button in the upper-right to get started, and the downloader will walk you through the installation process.

To verify that we've installed Ruby correctly, let's open up an important tool that we'll be using a lot during programming: the command prompt. A command prompt is part of an operating system. It lets you type commands into the computer directly: they're powerful but also rather opaque, because you need to know the commands and what they do beforehand.

To start the command prompt, click on the "Start" menu. Then click "Run...", type in "cmd", and press enter.

Welcome to the command prompt.

There are a number of commands you can type here, but we want to start interactive Ruby. Interactive Ruby is the right-hand side of repl.it: a window where we can type Ruby commands and see them executed immediately. To start interactive Ruby, type `irb` into the command prompt and press "enter." You'll see a window very similar to the one on the right side of repl.it.

Now, let's try that last program again, this time on our own local computer.

```ruby
loop do
  puts "Sayonara repl.it"
  sleep(1)
end
```

Oh no, we forgot to put in a break again! But this time we can fix our out-of-control program. Press "Ctrl" and "C" simultaneously to break the program. "Ctrl-C" is a shortcut for programs in the command prompt that instructs them to exit immediately. Computer programmers call this "breaking" or "aborting" the program.

Now we have Ruby on our computer. Interactive Ruby is a great way of writing short snippets of code and testing functionality, and you'll use it frequently for smaller, simpler applications.

### Coding Locally

Now we understand how to get interactive Ruby back. But being able to write programs and then execute them afterwards was actually pretty helpful too. How do we get back the left-hand side of repl.it, the one that let us write code and then run it all at once?

Most computer programs are actually just text files, so we can just use our favorite text editor! The hard work of converting the text into computer instructions is handled by the language itself, so theoretically you could write a computer program in Microsoft Word if you wanted to. But there are way better programs for programming: they provide shortcuts to run the program, help you remember method names, and provide syntax correction if you get something wrong. Let's use one of those instead.

I've already installed a free program called Notepad++ onto your computers. It does a lot of what I've said above, and as a bonus doesn't cost a dime. You can find out more about it (and download it at home) at its [website](http://notepad-plus-plus.org/). We'll be using Notepad++ to program Ruby, so double click its icon on your desktop to start it up. Let's write a simple program to test it out.

```ruby
loop do
  puts "What's your name?"
  name = gets.chomp

  if name == "Josh"
    puts "You're teaching a class!"
  elsif name == "Alisa"
    puts "That's Josh's sister's name."
  else
    puts "Hi, " + name.capitalize
  end
end
```

The content of this program should be fairly familiar to you by now. Save it and give it a filename of `name.rb`. .rb is the extension for Ruby programs: it tells the computer that the text file you saved is intended to be run by the Ruby interpreter. Now, just double-click the file in the location you saved it and you'll see it run. Magical!

You can also run the program manually from the command-line. To do so, navigate to the folder in which you saved it by using `cd` (the command line instruction to change directories). So if you saved it in a folder called "My Documents", you'd use `cd "My Documents\"` to navigate there. Once you're in the same folder as the program, type `ruby name.rb` to run the program. This is exactly the same as double-clicking on the program icon as above, except by doing it through the command line you're doing it like a programming pro!

### Next Time

In our next and last class, we'll learn more about flow control using Ruby's powerful and expressive enumerators. We'll learn about classes, how to write our own classes and methods, and write a couple exciting and awesome programs.
