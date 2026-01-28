---
title: "Designing Sites for Users"
date: 2012-06-17 17:52
tags: [rails]
---
Designing a new site from scratch can be difficult -- not technically, but from a usability perspective. What color will your users like best? How big should your buttons be? Where should advertising be placed? Of course, there are [amazing usability books](http://www.amazon.com/Dont-Make-Me-Think-Usability/dp/0321344758) out there, but there are some questions you can only answer through experience. Of course, designing for usability should be one of our top priorities -- and here are three cute little libraries that will help you make your sites awesome, beautiful, and most importantly, usable for your users.


## Mailcheck
The amazing [Mailcheck](https://github.com/Kicksend/mailcheck) library is great for any site that accepts email addresses. According to its creators, [Kicksend](http://kicksend.com), [Mailcheck reduced email confirmation signup bounces by 50%](http://blog.kicksend.com/how-we-decreased-sign-up-confirmation-email-bounces-by-50/). Now that's pretty impressive.

I also love Mailcheck's philosophy. The guiding idea here -- that users will make errors, and software should respond efficiently to correct them -- is true no matter what you're making, from an iPhone app to a website. Always remember that users will improperly use your software. Guiding them back to the appropriate path is your responsibility, with libraries like Mailcheck specifically, but also generally through your app's flow and and user experience. Every form field that encounters frequent errors should have a Mailcheck-like check around it; your users will thank you by loving your app even more.

## Chosen
[Chosen](https://github.com/harvesthq/chosen) is cute little syntactical sugar that turns select boxes from ugly, long monstrosities into helpful little widgets. Check out the [sample page](https://github.com/harvesthq/chosen) to see everything that it can do; if you have a select box on your site (and chances are that you do), then you should be using Chosen to help users select items from it more effectively.

Chosen expresses another important usability concept -- accessibility. Modern software can be ridiculously complicated, but most users don't care at all for complexity: they want information presented to them clearly, and they want to be able to navigate said information sensibly. By turning enormous select lists into hinting dropdowns, Chosen formats information sensibly and allows users to select what they want quickly. Ideal accessibility from a user's perspective.

## Bandit
There's been a fair amount of [discussion](http://www.chrisstucchio.com/blog/2012/bandit_algorithms_vs_ab.html) recently about the [multi-armed bandit problem](http://en.wikipedia.org/wiki/Multi-armed_bandit), especially as it relates to A/B testing. I've done A/B testing with Rails before but never really enjoyed it; but I recently came across the [bandit](https://github.com/bmuller/bandit) gem and I know I'll be using it extensively moving into the future.

Using multi-armed bandit solutions, you can test lots of options at once, and for as long as you like. Gradually the numbers for the test will reflect the reality of user preference: you don't need a set number of tests (as per A/B testing) and you aren't confined to only two options. Ultimately, you don't need to guess what a user wants. You can make some reasonable guesses and set them all up as possibilities, and over time, user choice will guide the direction of your site. And that's pretty awesome.

In the end, usability is about making your software more responsive and more presentable to your audience. Try out these libraries, but more than that, keep in mind the principles that guide them. By following those, you're guaranteed to make software that's much more usable than it would be otherwise.
