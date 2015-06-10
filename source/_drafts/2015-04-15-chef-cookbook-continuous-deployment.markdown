---
layout: post
title: "Chef Cookbook Continuous Deployment"
date: 2015-04-15 10:00:25 -0500
comments: true
categories: [chef, servers]
---
Last post, I discussed [continuous integration with Chef](http://joshsymonds.com/blog/2015/02/04/chef-cookbook-continuous-integration/) -- how to properly get a test suite set up around a cookbook and then run it automatically in CircleCI. But continuous integration is only half of any good product workflow... the other half, of course, being continuous deployment! Getting a single, well-tested cookbook to multiple Chef servers can be a challenge, but in a Chef-oriented consultancy it is a necessity. Here's how we make it happen at Symonds &amp; Son.

<!-- more -->

