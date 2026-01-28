---
title: "Middleman for Non-Techies"
date: 2012-04-21 11:56
tags: [gems]
---
I didn't make a post on the 18th because I've been in San Francisco at [the Hipstamatic offices](http://www.refinery29.com/hipstamatic-office-pictures), which are totally awesome. The work I've been doing here has taken up all of my time, so I didn't even get the chance to start writing a post until today. While I was here, I met [Luke Beard](http://lukesbeard.com/), a super talented designer who's been touching up a lot of our sites. For example, the excellent [disposable.hipstamatic.com](http://disposable.hipstamatic.com/) site is all his handiwork. I wanted to streamline his development process, so that he could deploy his work without feeling blocked by my (usually extremely full) schedule.

We're going to use [Middleman](https://github.com/middleman/middleman) to achieve this, in addition to some other nice effects: automatic minification of JS and CSS and smushing of images. Middleman is essentially intended for developers, though; it requires commandline tools that can be fairly intimidating to those who've never really bothered popping open the console before. So here's some small tweaks I made to our HTML projects to make the whole process easier on Luke and any future designers we hire.


## Use Middleman 3

Luke doesn't use CoffeeScript or Sass (yet), so the CSS files he creates are just pure CSS. In Middleman 2, .css files aren't automatically minified unless they're run through a secondary processor, like Scss or Compass. This was extremely frustrating to figure out, but is happily really easy to fix. Use Middleman 3. Middleman 3 is in beta and you can install it like so:

```bash
gem install middleman --pre
```

The Middleman 3 beta has a number of [other cool features](http://awardwinningfjords.com/2012/01/03/middleman-3-beta.html) that are worth checking out. In my limited experience using it, there aren't any major syntax changes; my Middleman 2 projects converted without a single hitch.

## Circumvent the Console

Once people figure out git, they universally love it. Most of our non-technical people who've been introduced to it use [Github for Mac](http://mac.github.com/), though, because honestly the console commands are kind of arcane. Half way through an explanation of the syntax of `git add`, I realized I was really barking up the wrong tree. So I didn't want to force people to open a console window, cd into the Middleman directory, and start up a server. As simple as that sounds, I knew it would be an enormous point of failure.

So I made a quick little script I inserted into the Middleman project directories.

```ruby
#!/usr/bin/env ruby

Kernel.exec("cd #{File.dirname(__FILE__)} && middleman")
``` 

I called it `start`. Chmod it 0755, and then when the designer checks out the repository, they can just double-click on `start` to automatically boot up the middleman console.

## Deploy with Hubot

Of course, we also wanted to make it easy to deploy. My deploy script is stolen entirely from a [gist](https://gist.github.com/1902178):

```ruby
SSH_USER = 'root'
SSH_HOST = 'www.example.com'
SSH_DIR  = '/var/www/html/www.example.com'

desc "Build the website from source"
task :build do
  puts "## Building website"
  status = system("middleman build --clean")
  puts status ? "OK" : "FAILED"
end

desc "Run the preview server at http://localhost:4567"
task :preview do
  system("middleman server")
end

desc "Deploy website via rsync"
task :deploy do
  puts "## Deploying website via rsync to #{SSH_HOST}"
  status = system("rsync -avze 'ssh' --delete build/ #{SSH_USER}@#{SSH_HOST}:#{SSH_DIR}")
  puts status ? "OK" : "FAILED"
end

desc "Build and deploy website"
task :gen_deploy => [:build, :deploy] do
end
```

Actually executing this script requires the console, and see the point I made just above for how I feel about that. Instead, we decided that our resident [hubot](http://hubot.github.com/) (named Hipstabot of course) should be the one to deploy the actual code. We already use him to deploy our Rails site, and typing commands in a Campfire chatroom is a lot easier and more sensible than typing commands into the commandline. This is a sanitized version of the CoffeeScript I wrote to allow Hipstabot to deploy static sites:

```coffeescript
module.exports = (robot) ->
  robot.respond /deploy site (\w*)/i, (msg) ->
    util = require('util')
    exec = require('child_process').exec
    
    site = msg.match[1]

    msg.send "[#{site}/deploy] Initiating deploy"
    exec "cd /home/hipstabot/workspace/#{site} && sudo -u hipstabot git pull", (error, stdout, stderr) ->
      if error != null
        msg.send "Fatal error pulling repository:"
        msg.send chomp stderr
      else
        msg.send "[#{site}/deploy] Building & deploying site"
        exec "cd /home/hipstabot/workspace/#{site} && sudo -u hipstabot rake gen_deploy", (error, stdout, stderr) ->
          if error != null
            msg.send "Fatal error building site:"
            msg.send chomp stderr
          else
            msg.send "[#{site}/deploy] Deploy complete"

chomp = (text) ->
  text.replace(/(\n|\r)+$/, '')
```

All the sudoing is to ensure no weirdness happens with directories being owned by someone other than Hipstabot, which would prevent git from pulling correctly.

Using this process, Luke can deploy sites quickly and easily, our customers get minified CSS and JS, and I'm not involved in any step of the process. Creating workflows like this -- that make what people do easier and better -- is one of the greatest joys of being a programmer, and I hope someone finds this post helpful in accomplishing something similar.
