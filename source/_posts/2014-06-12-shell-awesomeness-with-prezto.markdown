---
layout: post
title: "Shell Awesomeness with Prezto"
date: 2014-06-12 16:56:11 -0500
comments: true
categories: [shell]
---
As developers, we spend a lot of time in our shells: making them fast and responsive improves our productivity. I play around with a lot of development tools (as I mentioned in [a previous post](http://joshsymonds.com/blog/2014/01/22/supercharge-your-rails-development-environment/)) trying to find the best combination of intelligence, responsiveness, and fun. Recently I was investigating alternatives to [oh-my-zsh](https://github.com/robbyrussell/oh-my-zsh), which is a wonderful set of Zsh packages but suffers from weird slowdowns and, unfortunately, requires a lot of configuration. I stumbled upon [prezto](https://github.com/sorin-ionescu/prezto) and I love it -- originally an optimized fork of oh-my-zsh, it's now its own project, and it is fast, beautiful, and leverages the full power of Zsh. It looks like this:

![Terminal](http://veratic.us/image/300y2o0a3t03/screenie.png)

You should get it. And when you do, use these configuration settings to make your experience even better.

<!-- more -->

## Customize your .zpreztorc

You'll want to enable a bunch of modules in your `.zpreztorc`, which is the configuration file for everything prezto. Here's my modules:

```sh
# Set the Prezto modules to load (browse modules).
# The order matters.
zstyle ':prezto:load' pmodule \
  'environment' \
  'terminal' \
  'editor' \
  'history' \
  'directory' \
  'spectrum' \
  'utility' \
  'ssh' \
  'completion' \
  'homebrew' \
  'osx' \
  'ruby' \
  'rails' \
  'git' \
  'syntax-highlighting' \
  'history-substring-search' \
  'prompt'
```

They're not kidding when they say the order matters: `prompt` must come last, `history-substring-search` must come before it, and `syntax-highlighting` must come before that. The result of messing this up will likely be a ton of Zsh errors output to your shell after every command.

Some highlights from this list:

* `history` and `history-substring-search` work together to bring you one of the most awesome features of zprezto: when you type in a command and press up and down, you'll only get history results of you typing that command. Super helpful for typing in ssh, then going back in time to see your previous ssh servers.

* `syntax-highlighting` gives you some [fish](http://fishshell.com/)-style highlights. Executable commands will turn blue, incomplete or unrecognized commands will turn red, folders get underlined... it provides immediate and visceral visual feedback to what you're entering.

* `directory` gives you some awesome shortcuts for the directory stack: `d` to see all the directories you've entered, then the numbers `1` to `9` to jump to a previous directory you've visited.

And that's just a start. Visit the [prezto modules list](https://github.com/sorin-ionescu/prezto/tree/master/modules) and view each individual module's README to learn more about them.

After modules are done, get your identities into the SSH agent! There's a configuration block for that later:

```sh
# Set the SSH identities to load into the agent.
zstyle ':prezto:module:ssh:load' identities 'id_rsa' 'id_rsa.github' 'id_rsa.client1' 'id_rsa.client2' # all the rest of your identities
```

I also set up a custom theme for myself, the source of which I'll include below. If you want to enable that theme (or a different one), you'll also need to specify it in your `.zpreztorc`:

```sh
# Set the prompt theme to load.
# Setting it to 'random' loads a random theme.
# Auto set to 'off' on dumb terminals.
zstyle ':prezto:module:prompt' theme 'josh'
```

You can find the full text of my `.zpreztorc` [as a gist](https://gist.github.com/Veraticus/a1b5204d8f922de5ea88).

## Customize your .zshrc

`.zshrc` is loaded in every interactive shell: use it to set up your Ruby switcher, important aliases, and anything else you need for maximum awesomeness. Mine is fairly self-explanatory:

{% gist 79ab3d262305ae2c5aeb zshrc.zsh %}

## Select your theme

There are a lot of cool themes out there. But I was pretty used to my old Zsh theme, which was simple, clean, and had an obvious indicator when your last command failed. For an example of what it looks like, see the screenshot at the start of this post.

The arrow on the left shows green when your last exit code was 0, and red when it was 1. It includes the branch you're on, with an indicator of whether you have uncommitted files on the right-hand side. It does a ton more as well, and here's the source for your use:

{% gist 1b30a6b6cbe8dae57e9f prompt_josh_setup.zsh %}

Place this in `~/.zprezto/modules/prompt/functions/prompt_josh_setup` and then select it in your `.zpretorc` for best results.

prezto is easy to configure and presents a lot of powerful options: you'll want to spend some time getting used to it. But it's also really enjoyable. Once you start learning the power behind your shell and how easy it becomes to access, I guarantee that you'll never look back.