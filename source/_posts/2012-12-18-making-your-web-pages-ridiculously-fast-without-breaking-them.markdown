---
layout: post
title: "Making your Web Pages Ridiculously Fast (Without Breaking Them)"
date: 2012-12-18 10:28
comments: true
categories: [javascript]
---
I spent a lot of time optimizing page loading speed on GirlsGuideTo. The result is pages that load almost instantly initially and on subsequent loads; and while I'm proud of the work I've done in getting these pages zippy, there was no real secret sauce involved. Here I'll discuss techniques anyone can use to make their web pages load with amazing rapidity, all without breaking Google Analytics and other scripts you might already have installed.

<!-- more -->

## Speed It Up

There are two JavaScript additions to your page I'll be discussing here: head.js and Turbolinks.

### Head.js

The first ingredient in our speed cake is [head.js](http://headjs.com/). While head.js has a number of components -- media queries and dynamic CSS among them -- the reason it initially became popular, and the reason I'm talking about it now, is its basic, core functionality. Head.js allows you to asynchronously load your page's scripts. This might not sound like an enormous time savings, but consider this: do you use [Google Web Fonts](http://www.google.com/webfonts) or [Adobe's TypeKit](https://typekit.com/)? Chances are you do, since everyone loves fonts. But fonts must be downloaded by the client browser, a process that usually occurs in the page's head (before dom rendering has even begun), slowing down the rest of the page load while it waits.

And your user sees an empty browser while they're waiting. That's unacceptable.

Head.js alleviates this problem by giving you asynchronous script loading. Your application JavaScript, your fonts, jQuery, Google Analytics... everything that got put into your head that stopped your page from loading now loads at the same time as the rest of your content. Your user sees a page faster and is happier as a result.

Here's what the code looks like for GirlsGuideTo:

```javascript
head.js( { 'application': '//girlsguideto.cloudfront.net/assets/application.js' }, { 'typekit': '//use.typekit.net/typekit.js' }, { 'ga': '//www.google-analytics.com/ga.js' }, { 'jquery.embedly-2.1.7': '//scripts.embed.ly/jquery.embedly-2.1.7.min.js' } )
```

Of course I didn't hand-code that myself, I used the super helpful [headjs-rails](https://github.com/muitocomplicado/headjs-rails) Gem to put this in my application.html.erb's head:

```ruby
<%= javascript_include_tag "head.js" %>
<%= headjs_include_tag "application", '//use.typekit.net/typekit.js', '//www.google-analytics.com/ga.js', '//scripts.embed.ly/jquery.embedly-2.1.7.min.js' %>
```

Pretty easy, huh? Give it a shot and you'll see your page load times start really blazing.

### Turbolinks

Playing off of Defunkt's amazing [pjax](http://pjax.heroku.com/), [Turbolinks](https://github.com/rails/turbolinks) speeds up your pageloads by making every page request Ajax-y (or more accurately Pjax-y). When you click on a link, Turbolinks will fetch the page you requested and replace the existing document's body with its content. No CSS or JavaScript loading occurs, making each page load blazingly fast -- and thanks to the magic of pushState, your back button and everything else you'd expect on the page still work.

Turbolinks is ridiculously easy to install. Simply add it to your Gemfile and then, in your application.js, add this line:

```javascript
//= require turbolinks
```

## Now Fix It 

If you followed my advice up until this point, you might be stunned to discover your Google Analytics and `$(document).ready()` stuff has completely broken. No worries! We'll fix it, and it'll be quick and easy to do so.

### $(document).ready()

This is the easiest thing to correct. `$(document).ready()` now fires before all your scripts have finished loading, since each script is loaded asynchronously and separately. So you'll either see weird behavior from it, or it won't execute at all (since $ will be undefined, as jQuery has yet to load). Simply replace all instances of `$(document).ready()` with `head()`. `head()` is called by head.js when your scripts have loaded. Something like this would make sense:

```javascript
head(function() {
  // Load Typekit
  try{Typekit.load();}catch(e){}

  // Load Google Analytics
  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-XXX-1']);
  _gaq.push(['_trackPageview']);
})
```

### Google Analytics

Google Analytics will load correctly on your initial page load, now. But unfortunately it won't load on any subsequent pages, since additional pages are called via Ajax. We need to hook into one of Turbolink's events to correctly record users visiting our site:

```javascript
head(function() {
  document.addEventListener('page:change', function() { 
    _gaq.push(['_trackPageview']); 
  })
)}
```

`page:change` is called every time Turbolinks fetches and renders a page: when it does so, we call Google analytics manually to inform it to track the current page view.

### Other Scripts

This should get you 95% of the way to having pages that are incredibly fast and work very well. One last caveat is that any script that loads on `$(document).ready()` must now also load on `page:change` as well: ready is not called when the page is already loaded, after all. So if you have CoffeeScript like this:

```coffeescript
$(document).ready ->
  doExcitingThings()
```

You'll want to add this as well:

```coffeescript
$(document).ready ->
  doExcitingThings()

document.addEventListener 'page:change', ->
  doExcitingThings()
```

Remember this is only for scripts that you're sure are loaded after jQuery -- scripts loaded asynchronously need to use `head()` instead of `$(document).ready()`.

And that's all there is to it! With these simple tips (and simple fixes) your pages will be incredibly, ridiculously fast. The only downside to these techniques relates to Turbolinks. If you have a lot of script-specific state on your pages, clearing it out between page loads will probably be a big headache. For most of us, without highly stateful JavaScript applications, all you'll see are massive speed improvements. Your users won't believe how fast your site is, and best of all, these changes are really easy to implement. So what're you waiting for? Get JavaScripting!
