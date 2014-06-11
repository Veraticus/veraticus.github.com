---
layout: post
title: "Supercharge Your Rails Development Environment"
date: 2014-01-22 08:55:45 -0600
comments: true
categories: [rails]
---
I love trying to improve my development environment. Efficiency is important to me: I spend hours and hours a day programming, and even a 1% or 2% productivity boost would provide a massive time savings over the course of a year. Or, as xkcd so pithily put it:

[![Is It Worth The Time?](http://imgs.xkcd.com/comics/is_it_worth_the_time.png)](http://xkcd.com/1205/)

Of course, I've probably obliterated any potential savings by spending so much time experimenting, but now that I've done it you don't have to! Listed here is everything important to me to get my development environment zipping along. Hopefully you'll be able to find something useful here too that makes your programming experiences a little bit faster.

<!-- more -->

## Basics

* Font: **[Source Code Pro](http://store1.adobe.com/cfusion/store/html/index.cfm?event=displayFontPackage&code=1960) (Free)** A good, clean, monospaced font is extremely important. You'll be staring at it in your text editor and on your terminal, and it has to be easy on the eyes while still differentiating similar-looking characters (l as in llama, 1 as in the number, I as in yours truly). I've used Inconsolata, Monaco, and Anonymous extensively, but found Source Code Pro to be superior in almost all respects: more readable, more beautiful, less tiring to the eyes. Realistically they're all pretty close though, so just find something you like and go with it.

* Computer: **[MacBook](http://store.apple.com/us/mac) ($Lots)** Ruby is cross-platform: you can develop on a Mac, Linux, or even Windows if you like. I prefer a Mac. They're extremely reliable, very well-designed, with rock-solid performance characteristics and extremely impressive support guarantees. They really only have one downside, but it's a doozy: the big price tag. See if you can get your employer to buy one for you. Some people don't like OSX, but in my mind it unifies a good user experience with the power of Unix under the hood. There's definitely some stuff about Windows I like more (I have a gaming PC that uses Windows 8), but for development, Macs can't be beat. They also have great, first-class tool support for anything you're likely to do in Rails.

* Shell: **[zsh](http://www.zsh.org/), specifically [oh-my-zsh](https://github.com/robbyrussell/oh-my-zsh) (Free)** zsh is what bash wants to be. Command completion, sharing of history between shells, spelling correction, amazing prompts... and oh-my-zsh makes it easy to set up and install. If you need some inspiration for your `.zshrc`, [check out mine](https://gist.github.com/Veraticus/8563408)! My favorite feature is sleeping 10 seconds after you do an `rm` glob... this has saved me from my own stupidity more than once. (Lots of stuff from my `.zshrc` is taken from [this StackOverflow question](http://stackoverflow.com/questions/171563/whats-in-your-zshrc).)

## Mac Apps

* **[1Password](https://agilebits.com/onepassword/mac) ($50)** Insanely expensive compared to most other software on this list, but also pretty non-negotiable. I have over 300 passwords stored in it -- including six client logins to AWS, four to RackSpace, and untold multiples for my own servers: how am I supposed to keep all of that straight myself? And generate new ultra-secure passwords whenever I need? Well thankfully I don't have to. 1Password has bulletproof security and I'm never concerned I'll lose, forget, or even care about any individual password ever again.

* **[Alfred](http://www.alfredapp.com/) (Free to try, &pound;17 to buy)** I use Alfred to open nearly everything on my computer. Not just apps! Alfred can open web pages, login automatically with 1Password integration, perform calculations, run one-off terminal commands, find and open files... Alfred has enormously simplified everything I do with my Mac. Definitely a huge time-saver.

* **[Asepsis](http://asepsis.binaryage.com/) (Free)** So many important files on your comptuer are dotfiles, which are hidden by default on Macs. So you turn on viewing hidden files... and suddenly, everywhere you go, you see the dreaded `.DS_Store`. I hate seeing `.DS_Store` files. They appear in every directory, they appear on your desktop, they appear in your nightmares... well Asepsis gets rid of all of them. And it's free.

* **[Bartender](http://www.macbartender.com/) (Free to try, $15 to buy)** Look at the upper-right of your Mac. Do you see the volume icon there? The AirPlay icon? Even worse, your own name? (What, are you worried you'll forget it?) Banish the clutter into Bartender and clean up your menu bar: you can hide all the icons you never (or rarely) use, and even configure them to display only when their app does something important.

* **[Caffeine](http://lightheadsw.com/caffeine/) (Free)** Prevent your Mac from ever falling asleep. Helpful if you've ever started a long-running task, left your computer for awhile, and returned to find it had stopped to take a nap.

* **[CloudApp](http://www.getcloudapp.com/) (Free, or $4.99 a month)** CloudApp gives you drag-and-drop sharing of any file you'd desire. I love having my drops available at a vanity URL (http://veratic.us) -- you'd be surprised how many developers say how cool that is, and ask how they can get one of their own. If you don't want the URL then the free version should suit you just fine.

* **[Flint](http://giantcomet.com/flint/mac/) (Free, then $14.99)** I love Campfire and BaseCamp. Flint makes Campfire easy-to-use. Even better, it gives me a badged icon in my dock when people speak, and a growl notification when they mention my name.

* **[Gistify](http://gistifyapp.com/) ($1.99)** Shameless self-promotion, but I honestly love the app I made for myself! I make gists all the time; gistify gives you drag-and-drop gisting of snippets or files, and allows you to create gists from your clipboard contents. Super convenient and super lightweight.

* **[Growl](http://growl.info/) (Free, or $3.99)** The Apple Notification Center is pretty good... but Growl still seems to be the gold standard for notifications. One of the first pieces of software I install on a new computer. (That said, I have no idea what the $3.99 version does. Growl is one of the few pieces of software on this list I've never bought.)

* **[HyperDock](http://hyperdock.bahoom.com/) (Free, or $9.95)** Allows you to hover over your dock items and see a preview pane summarizing all of that app's open windows, a la Windows' default behavior when you hover over an app in the taskbar. Extremely helpful if you have a lot of files open simultaneously -- for example, if you have lots of projects open at once in your text editor.

* **[iTerm 2](http://www.iterm2.com/#/section/home) (Free)** The best terminal replacement ever -- I don't know how I ever lived without, and once you start using it, you'll never be able to go back to the default Mac terminal. It has so many nice improvements I can't even list them all, and for the absurd price of "free" there's absolutely no reason not to use it.

* **[Little Snitch](http://www.obdev.at/products/littlesnitch/index.html) (Free to try, $34.95 to buy)** Little Snitch is a really excellent software firewall. I'm incredibly paranoid about network security, especially on my development machine. Little Snitch allows me to opt-out of connections I don't trust and really lock down my computer -- not only in general, but on a network-by-network basis. As a bonus, it lets me see my network traffic so I get notified if DropBox suddenly decides to resync everything.

* **[Monosnap](https://www.monosnap.com/welcome) (Free, $4.99 to enable sharing)** The best skitch replacement (since Evernote ruined it). Fast screen or window captures with built-in DropBox, CloudApp, and Evernote uploading for only $4.99. It'll record videos of your screen and even take selfies on your Mac's camera, if you're too lazy to grab your phone.

* **[Sublime Text 3](http://www.sublimetext.com/3) (Free, then $70(!))** My favorite text editor (and I've tried most of them). Expensive? Definitely. But you get what you pay for. ST3's best feature is its incredibly versatile package system -- there's a package for pretty much everything, and as a bonus it supports most of TextMate's plugins as well. Despite its depth and power, it's still light-weight enough to start instantly and doesn't spend any time doing reindexing or otherwise chugging. ST3 is also cross-platform if you end up doing a bit of light programming on something other than your primarily development machine, which is useful for standardizing your editor everywhere.

* **[TotalSpaces](http://totalspaces.binaryage.com/) (Free to try, $18 to buy)** I don't like Mac's default Spaces implementation -- four desktops right next to each other means the furthest space could be two screens away, and the widgets view is totally worthless. TotalSpaces lets you stack desktops in a grid and move left, right, up, and down. Now every space is only one swipe away from any other space. As a bonus you can get rid of the widgets as well.

* **[Tweetbot](http://tapbots.com/software/tweetbot/mac/) ($19.99)** Twitter is actually a valuable professional tool for me. It lets me keep on top of interesting news and developments in the tech world, contact authors of the software I use directly, and find lots of pictures of kittens. But leaving the #kittens aside, Tweetbot is the best app I've used for twittering. It's fast, effective, and stays out of my way when I don't want it.

* **[Unibox](http://www.uniboxapp.com/) ($9.99)** I like Unibox compared to Mail.app and Mail Pilot: it's speedy, it organizes mail effectively, and I feel like I have a bit more control of my inbox. That said I haven't yet run into the program that *completely* replaces Gmail in a browser for me... Unibox is as close as I've come and I use it on a daily basis, but if I'm searching for a specific piece of mail, I turn to gmail.

## Sublime Text Packages

If you love Sublime Text 3, you'll want the best packages for it too. Here's what I recommend:

* [Package Control](https://sublime.wbond.net/) allows you to find, install, and update Sublime Text 3 packages. A prerequisite for installing anything else without going insane.

* [Soda](http://buymeasoda.github.io/soda-theme/) is a beautiful, functional theme that I really enjoy. I've tried a few others and didn't find them nearly as compelling ([SpaceGray](http://kkga.github.io/spacegray/) is also quite nice, though the syntax highlighting isn't to my taste). Because I find it easier to read light text on a dark background, I use Soda Dark specifically.

* [Alignment](http://wbond.net/sublime_packages/alignment) makes it easy to align everything properly and make your code nice and readable.

* [BracketHighlighter](https://github.com/facelessuser/BracketHighlighter) shows you if you're inside brackets (or a block, or HTML element) and where the start and end of said brackets are. Invaluable.

* [git](https://github.com/kemayo/sublime-text-git) gives you git integration right in Sublime Text 3, and works great with...

* [GitGutter](http://www.jisaacks.com/gitgutter), which shows in your gutter changes that are waiting to be committed.

* [SidebarEnhancements](https://github.com/titoBouzout/SideBarEnhancements) gives you tons more options when you right-click anything in your sidebar, including clipboard, move to trash, reveal in finder, open in another program, and everything else you'd expect a sidebar to reasonably contain.

* [SublimeLinter](http://sublimelinter.readthedocs.org/en/latest/) (and linters for your languages of choice) provides cheap and easy sanity-checking of your code. Now you'll know as soon as you save (or as soon as you finish typing, if you like) if you fat-fingered a variable name.

## Useful Development Tools

* [homebrew](http://brew.sh/) is the best package manager I've come across. It'll install everything from libxml2 to postgresql from source automatically, helps you manage upgrades from one version to the next, and is fast and performant.

* [rbenv](https://github.com/sstephenson/rbenv) allows you to have multiple versions of Ruby on your system simultaneously, each without stepping on the others' toes. If you regularly develop in runtimes other than MRI (I have to do JRuby stuff somewhat frequently, for example) this allows you switch back and forth without going insane.

* [zeus](https://github.com/burke/zeus) preloads your Rails apps so that tests, the console, and the server all load lightning-fast. The milliseconds you wait for Rails to start now become microseconds, saving you entire minutes per year... And isn't that really the point of optimization?

I'm sure there's a lot that I missed and some things I don't even know about. If I didn't include your favorite app, Sublime Text plugin, or Rails development tool let me know [@Veraticus](http://twitter.com/Veraticus) -- there's nothing I love more than taking a new app for a spin and even adopting it if it turns out to be amazing!