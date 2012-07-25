---
layout: post
title: "Rails Concerns III: Metatags"
date: 2012-07-12 09:48
comments: true
categories: [rails]
---
Following parts [one](http://joshsymonds.com/blog/2012/07/01/rails-concerns-i-starting-with-redcarpet/) and [two](http://joshsymonds.com/blog/2012/07/04/rails-concerns-ii-taggable/) of my series on Rails concerns, I'm going to finish up with an extremely useful controller concern: automatically adding metatags to (and correctly displaying individualized titles on) your pages. Metatags, of course, are SEO-boosters that you should really be using if you aren't already. In addition to improving your search engine ranking, they allow your pages to appear idiomatically in Facebook's Open Graph. Of course, everyone wants metatags on each and every page on your site, but unfortunately it can be sort of a headache getting them there. Using the [meta-tags](https://github.com/kpumuk/meta-tags/) gem and some good old-fashioned hard work, though, we can implement a very simple method to get metatags into every page of our application with minimal hassle.

<!-- more -->

## Setup

Include the meta-tags gem in your Gemfile:

```ruby
gem 'meta-tags', :require => 'meta_tags'
```

While the gem itself hasn't been updated for awhile, that doesn't really matter; it still functions quite well for our purposes. Once it's in the Gemfile, we'll configure some sensible defaults in our application layout, `application.html.erb`.

```ruby
<head>
  <meta charset="utf-8">
  <%= display_meta_tags :site => 'Your Site Name Here', :keywords => Metatags::KEYWORDS %>
  ...
</head>
```

We'll be defining that `CONSTANTS` constant shortly. This ensures that on each page the name of your site appears in the title, all by itself if you don't specify anything else, and that keywords appear in the keywords `meta` tag, which robots like the Googlebot use when computing your page's relevance.

## The Concern

The meta-tags gem allows us to specify additional hashed options in either controllers or views: these options are concatenated with the defaults specified above to create attractive and meaningful metatags for each and every page. Since controllers tend to encapsulate models, I elected to make this a controller concern. (And forget doing this in views: replicating this code in each and every view is not my idea of a good time.) So our controller should, ideally, look somewhat like this:

```ruby
class UsersController < ApplicationController
  before_filter :find_user

  include Metatags
  metatags :title => :name, :description => :summary, :short_tag => :slug, :keywords => :name, :canonical => :user_url

  private

  def find_user
    @user = User.find(params[:id]) if params[:id]
  end
```

We specify with a hash how the metatags should be constructed: the keys of the hash are the names of each metatag we intend to use, while the values are the methods that need to be executed on the controller's object in order to get the information for that tag. In other words, if we have an object called `@user`, then we want the title of the page to include `@user.name` -- and that's represented by a hash that looks like `:title => :name`. However, this won't work for every key and value. For example, the `:canonical` key should indicate how to find the canonical URL of this resource, so we'll need a special exception for that... and the Facebook Open Graph name for `:canonical` is `:url`, so we'll need to switch it when we generate the Facebook tags.

This, then, is the actual module itself:

```ruby
module Metatags
  extend ActiveSupport::Concern

  OG_TAGS = [:title, :type, :image, :url, :description]
  KEYWORDS = ['default', 'keywords', 'here']

  included do
    append_before_filter :set_metatags
  end

  module ClassMethods
    def metatags(hash)
      @hash = hash
    end
  end

  private

  def set_metatags
    object = self.instance_variable_get("@#{self.class.to_s.underscore.split('_').first.singularize}")
    hash = self.class.instance_variable_get(:@hash)

    if object
      new_hash = {:open_graph => {}}
      hash.each do |tag, method|
        value = object.send(method) if object.respond_to?(method)
        
        if tag == :keywords
          value = Array(value) + KEYWORDS
        elsif tag == :canonical
          value = self.send(method, object)
        end

        new_hash[tag] = value
        tag = :url if tag == :canonical
        new_hash[:open_graph][tag] = value if OG_TAGS.include?(tag)
      end
      set_meta_tags new_hash
    end
  end

end
```

Obviously this concern is somewhat complicated: bear with me and I'll explain it.

At the top of the code, we define which OpenGraph tags we care about, as well as the default keywords for our application. When the module is included, it appends a `before_filter` to its controller that will try to set all the metatag information. However, it also creates a new class method on its included class, a side-effect of having a child module called `ClassMethods`: in this case, it provides included controllers with a method called `metatags` that accepts a hash of metatag names and method names, as I discussed above.

Finally, we have a private method called `set_metatags` that performs the actual heavy lifting of the concern. It searches for an instance variable named after the controller itself: so if you have a `UsersController`, it tries to find an instance variable called `@user`. If that object exists, it tries to populate a new hash with the result of sending it each hash value.

We have two special exceptions we're concerned with. First, we don't want to replace the existing site keywords -- we only want to add to them. So if the tag is `:keywords` we add the keywords in `KEYWORDS` to whichever ones we passed to `meta_tags`. Second, if the tag is `:canonical`, we do something a little special. We assume the key is a Rails named route that will accept one argument, the controller's object, to generate a correct canonical URL.

Underneath that, we switch the name of the `:canonical` tag to `:url` so that the Facebook Open Graph tags are set up correctly. With that you're all done. Each controller will automatically try to query its object as you specified and set metatag information for each view based on the results of those queries.

## Caveats

Because the metatag creation happens in a `before_filter`, the ordering of your filters becomes crucially important. If you have a `before_filter` that finds your controller's primary object like my controller sample above, it's vital that you place the `before_filter` above the concern's `include`, or, if you'd prefer, use `prepend_before_filter` instead of `before_filter`. Otherwise the metatag concern will place its `before_filter` ahead of the one that finds your object, your object will be nil when `set_metatags` runs, and the metatag information will never display correctly on the page.

Though complicated, I think this example best demonstrates the power and portability of concerns. With one simple method invocation in your controller, you generate an immense wealth of SEO and Open Graph information: and the best part is, you only had to write the code to do this once. Further customizability can easily be achieved with additions to the module to better fit your application's specific concerns.

This ends the first part of my series on Rails concerns. While I don't have anything else exciting to show off presently, the concern pattern is a powerful one that I've used a lot in the past and that I intend to use a lot in the future. Thus, when I come up with something else cool and interesting, I'll definitely continue talking about awesome Rails concerns.