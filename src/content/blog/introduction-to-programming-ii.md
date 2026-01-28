---
title: "Introduction to Programming II"
date: 2012-08-05 17:48
tags: [beginner, ruby]
---

It took me a long time to author this -- and to update this blog in general, in fact. RubyMotion has turned out to be fun and profitable, but also exhausting; I'm engaged in another RubyMotion project that has taken up most of the free time I used to dedicate to this blog.

Still, I committed to making an entire series, starting with [Introduction to Programming I](http://joshsymonds.com/blog/2012/04/24/introduction-to-programming-i/), and this is the next in that line. I hope someone finds it useful! I actually made edits to the last post to remove references to sandRBox -- I'm using [repl.it](http://repl.it) now, since that runs on the individual's browser.


## Digging Deeper into Ruby

In our last lesson, we used an online tool ([repl.it](http://repl.it)) to understand the basics of the Ruby programming language. We learned some of the basic objects of Ruby -- integers, strings, and floats -- and we also learned what methods are and how they can be used to manipulate those objects. Today we'll start by learning about variables, a key concept in computer programming. Afterwards, we'll use variables to understand more about Ruby's basic objects, and then we'll discover how we can create and manipulate entirely new classes of objects.

### Variables

A variable is a way of naming data. Why would you want to do this? In computer programs, you'll need to reference the same piece of data over and over again. Maybe you have a string that's particularly important to you; maybe you want to store the result of a calculation so you can refer to it later; or maybe you have an open file that you need to read data from. Variables let you accomplish these goals and more.

In Ruby, variable names are all lower-case, and they can't contain numbers or spaces. `variable`, `this_is_a_long_name`, and `specialsauce` are all valid variable names. In order to use a variable, you just assign it to any Ruby object with an equal sign, like this: `mary = 'little lamb'`. Now you can always refer to that same `'little lamb'` string by using the `mary` variable. If you type the variable name by itself into repl.it, you'll see its value: so when you type `mary`, you'll see `"little lamb"`.

Let's do a quick **exercise** to understand the power and importance of variables in Ruby.

1. Try `mary = 'little lamb'`. Now, type `mary`. It has the value of `'little lamb'`. This is how you assign variables.

2. Let's put our variable to use! Try `mary + 'chop'`. `mary` is exactly equivalent to `'little lamb'`: essentially, `mary` is the name of that string, now, and every time you call it by its name you're actually using that string. So when you type `mary + 'chop'`, you're actually saying `'little lamb' + 'chop'`.

3. Try `mary` again. Note that even though we saw `'little lambchop`' previously, `mary`'s value hasn't changed. The only way to change the value of a variable is to assign it with an equals sign.

3. Try `mary = mary + 'chop'`. Now the variable `mary` is going to be `'little lambchop'`, because we assigned it again.

4. Try `dinner = mary`. The variable `dinner` now has the same value as the variable `mary`, which is to say, `'little lambchop'`.

5. Let's change what we're having for dinner. Try `dinner = 'big lambchop'`. We've changed the value of `dinner`: what do you think's happened to the value of `mary`?

6. Try `mary` to find out. Are you surprised that its value hasn't changed? Each variable gets its own copy of the object you assigned to it. Changing the value of one variable doesn't affect any other similarly-assigned variables. Even though `dinner` and `mary` looked like they had the same value, actually each of them had a copy of the same string.

7. Let's use some numbers with variables. Try `number = 3`. Then do some basic math. Try `number + number`, `number * number`, and `number / number`.

8. Finally, let's change our number. Try `number = number * 3`.

Reassignment of an existing variable (as in `number = number * 3`) is an extremely common pattern in any programming language. It's so common, in fact, that Ruby provides some clever shorthand to make it even easier to do.

Let's explore variable reassignment in an **exercise**.

1. Try `mary = 'little lamb'`. Now, try `mary += 'chop'`. This is exactly equivalent to `mary = mary + 'chop'`.

2. Try `number = 3`. Now, try `number *= 4`. This is exactly equivalent to `number = number * 4`.

There are shortcuts for division (`/=`) and subtraction (`-=`) reassignment as well, if you ever need those.

Now that we understand variables, the rest of Ruby's world opens up before us. The basic types we discussed -- integers, strings, floats, and variables -- form the foundation for the Ruby programming language. Now that we've learned about them, we can learn about some exciting new objects... and then eventually how to create new kinds of objects of our very own!

### Organizing Data

We know now how we would put in numbers and letters in a Ruby program. But what if you want to organize them? Say you wanted to create a list of names, or perhaps you needed a dictionary of words. What would be the best way to do that?

That's what we'll discover now.

### Arrays

Arrays are lists of objects. They look like this:

`["This", "is", 'an', 'array', 123]`

The brackets around the array are telling you what it is -- an array. The elements of the array are separated by commas. This array has five elements -- four strings and one integer. You can put any object into an array, and an array can be as big as you like. Just keep adding commas and elements inside the brackets until it's as big as you need.

Let's try some **exercises** to understand how to use arrays.

1. Let's make a new array and assign it to a variable. Try `friends = []`. The empty brackets mean this is an empty array.

2. Let's learn some handy array methods. Try `friends.empty?` The sad truth is, presently we have no friends. We can verify that by trying `friends.count`, which, of course, is zero.

3. Being friendless sucks. Let's add a friend to our array. Try `friends.<<('tom')`. Now our array is `['tom']`. It has one element, the string 'tom'. The `<<` method inserts an object onto the end of an array. Because this syntax is used so frequently to add elements to an array, it has a shortcut. You can use `friends << 'tom'` -- without the parenthesis or the dot -- in order to directly add an element to an array. This is very similar to the shortcut syntax for addition or subtraction (`1 + 1` instead of `1.+(1)`).

4. Let's add another friend. Try `friends.push('jimmy')`. Our friends list is certainly filling up! `push` and `<<` do the exact same thing to an array. They accept one argument -- the object to be inserted into the array -- and push it onto the very end.

5. When you count an array's elements in Ruby, you always start at zero. That is, the very first object in our array is object 0, not object 1. Let's see what that element is: use `friends[0]` to see the very first friend. Use `friends[1]` to see our second friend.

6. We can also access the elements of our array, instead of using the `[]` function, by using some English-soundung methods. Try `friends.first` to see our first friend, and `friends.last` to see our last.

7. This is all well and good, but let's say we have a fight with Tom and want to remove him from our friends array. Try `friends.delete('tom')`. The `delete` method removes every object that's identical to the provided argument, so if we had `'tom'` more than once in the array, all copies of him would be removed.

Arrays are used commonly in Ruby to organize data in list format. Because they preserve ordering of their elements -- that is, the first element is always the first, the last element is always the last -- you can encode a lot of information in them and be confident of accessing it later.

### Hashes

A hash is like a dictionary. In a dictionary, you look up a word -- say, 'zebra' -- and read a definition ('a big white and black striped horse-like animal'). Similarly, in a hash, you look up keys and receive values in return. A key is like the word 'zebra' in a dictionary: it's what you use to look up information in a hash. Values are the definitions: they're what you get back when you look up a word.

Hashes look like this:

`{'mary' => 'little lamb', 'freddy' => 1, 'zebra' => 'a big white and black striped horse-like animal', 1 => 3}`

Hashes are always contained in curly brackets, and each key has a hash rocket `=>` that points to its value. They're very different from arrays, though: hashes have no internal ordering. In an array, we know the first element will always be first... but inside a hash, there's no guarantee that the element we just added will be the last. Let's try some **exercises** to explore this exciting new data structure.

1. First, let's make a new hash and assign it to a variable. Try `dictionary = {'zebra' => 'animal'}`. If we provided an empty set of curly braces (`{}`), we'd have made a blank hash; instead we're starting it with an entry.

2. Let's look up a value in our hash. Try `dictionary['zebra']`. The square bracket notation here is similar to what we used earlier in arrays to look up elements; but here, when we look up an element in our hash, we have to provide the key name we stored it with. If we try `dictionary[0]`, 

3. Adding a key and value to our hash is easy. Try `dictionary['peacock'] = 'beautiful'`. This assigns a new key -- 'peacock' -- to a new value -- 'beautiful'. We can look up that value by using `dictionary['peacock']`.

4. We can see an array of the keys in our hash with `dictionary.keys`, and an array of values with `dictionary.values`. Note, as I said earlier, that the ordering of elements in a hash is not preserved -- so the keys and values might not appear in the same positions you'd expect.

5. Keys have to be unique in a hash -- if you assign a value to a key that already exists, it will replace that key's existing value. Let's change the value of 'zebra'. Try `dictionary['zebra'] = 'striped'`. Now the value of 'zebra' is 'striped', instead of 'animal'.

6. Finally, data structures can contain other data structures. Let's add an array to our hash. Try `dictionary['other_animals'] = ['seahorse', 'human', 'eel']`.

Hashes are a great format for storing information in a way that we want to quickly look up later. Whereas arrays are for lists of things, hashes are very much like dictionaries.

We'll look more at hashes and arrays later, when we discuss further how to manipulate data structures. But as of right now, we now know all the basic types in Ruby! It's time to use what we've learned to create our very first program.

### Our First Program

We now know enough to write our very first program in Ruby! We need two methods we haven't discussed so far: `gets` and `puts`. `gets` grabs the next line of input from the command line; `puts` spits out whatever we tell it to the console. Let's use those methods to create a program that automatically tabulates points for us.

In Ruby, you write programs in a text editor. While on repl.it, the text editor is the left-half of the screen that we haven't really covered yet. When you write code in there, and press the 'play' button in the upper right, the code will be executed and you'll see the result on the right-hand side. Let's try entering this in to the text editor half of repl.it:

```ruby
scores ||= {}
puts 'Who just scored points?'
name = gets.chomp 
puts 'How many more points did they get?'
points = gets.chomp

scores[name] = points
puts 'The current standings are: ' + scores.inspect
```

Let's dissect this progrma line-by-line to understand what's happening here.

In the first line, we create a hash called `scores`. The `||=` syntax only assigns the variable if it hasn't already been assigned: we'll cover how it works more in the next lesson.

In the second line, we ask the user who scored points.

In the third, we actually get the name from the command line. Input from the command line is usually terminated by a return -- but that return isn't helpful for us, so we use a string method called `chomp` to remove the new line from the end.

In the fourth and fifth lines, we again query the user and chomp their input.

The seventh line performs hash assignment, like we just learned: the score is inserted into the hash so that we can keep track of it.

And finally, in the fifth line, we output the actual scores. `inspect` returns a view of the object that's easily understandable to humans.

You can run this progrma multiple times. Every time you do, you can add in a new score to the hash; later we'll discover how to have the program automatically loop so that we don't have to keep running it manually.

### Your First Program

Now that we know a little about Ruby, it's time for you to make your very first program all on your own!

Let's create a boss program. Have it ask you what your name is, and what your hobby is. Then use the string method `upcase` to have it yell back to you that you should get back to work doing that.

Next time, we'll learn how to control flow through our Ruby programs, and we'll start really digging into what makes the Ruby programming language so cool: enumerators!
