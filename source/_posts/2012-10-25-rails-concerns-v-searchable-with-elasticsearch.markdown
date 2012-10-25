---
layout: post
title: "Rails Concerns V: Searchable with Elasticsearch"
date: 2012-10-25 12:50
comments: true
categories: [rails]
---
I use the wonderful [elasticsearch](http://www.elasticsearch.org/) for my searching needs. I described in [previous](http://joshsymonds.com/blog/2012/03/25/elasticsearch-and-percolation-in-rails/) [posts](http://joshsymonds.com/blog/2012/04/15/testing-elasticsearch-in-rails-with-tire/) how I use and test elasticsearch in general; but in my current project, I found myself using elasticsearch in a very similar way across all my models. Call me crazy, but that sounds like a concern to me!

As a result of this concern, I ended up having a really neat abstraction that allowed me to search across all my models using elastcisearch's [multi-index search functionality](http://www.elasticsearch.org/guide/reference/api/multi-index.html). The end result of this concern was not only less duplicated code; it was a useful utility function that acted on all the models that implemented it.

<!-- more -->

## The Setup

I have multiple models that are searchable, all of which are searchable in somewhat similar ways. For example, users need left-handed ngram indexing for their names (for autocompletion), but also full searching on the same field; similarly, the titles of content work almost exactly the same way. The only difference between the two was the weights they should use, so I set them up similarly in tire:

```ruby
class User

  settings ElasticSearchAnalysis do
    mapping do
      indexes :name, type: 'multi_field', fields: {
        name: {type: 'string', analyzer: 'full', boost: 3},
        partial: {type: 'string', search_analyzer: 'full', index_analyzer: 'partial'}
      }
    end
  end

end
```

`ElasticSearchAnalysis` is a constant that contains the settings for the partial and full analyzers referenced in the mappings. Of course, I index more fields for content, but ultimately I was using the searchers in the two models in a very similar way: a boolean should of all the different mappings conjoined together. As I was working on the code for the two different models, it was looking more and more similar... and then when I added in searching to tags and it was just about the same thing, I figured it was time to come up with a concern. I elected to call it `searchable` and wanted it to look something like this:

```ruby
class User
  include Searchable

  settings ElasticSearchAnalysis do
    # elasticsearch settings here
  end

  searchable :name, 'name.partial'
end
```

Where I could simply list all the fields I wanted to search.

## The Module

This is the module I came up with to express this.

```ruby
module Searchable
  extend ActiveSupport::Concern

  module ClassMethods
    def searchable(fields)
      @search_fields = fields
    end

    def search(term, options = {})
      searcher(term, :text, options)
    end

    private

    def searcher(term, type, options = {}, field_options = {})
      fields = Array(@search_fields)

      self.tire.search(options.merge(load: true)) do
        query do
          boolean do
            fields.each do |field|
              should {send(type, field, term, field_options)}
            end
          end
        end
      end.results

    end
  end
end
```

If you've been following my series on concerns, this shouldn't be very surprising stuff. When you call searchable, the fields are added to an instance variable: then, when you call search on the model, we concatenate all the fields together and boolean search across on each of them. So once this is all set up, you'd use it like this:

```ruby
User.search('Josh Symonds')
```

Which will generate a tire query like this:

```ruby
User.tire.search(load: true) do
  query do
    boolean do
      should text('name', 'Josh Symonds')
      should text('name.partial', 'Josh Symonds')
    end
  end
end
```

## Extending to More Like This

Of course, that `searcher` private method is just begging for another use. Why abstract it out so cleverly and not do something with it? Let's use elasticsearch's [more like this query](http://www.elasticsearch.org/guide/reference/query-dsl/mlt-query.html) so we can quickly find objects like each other (to display in an attractive sidebar, for example). __For this to work, in addition to having tire in your Gemfile, you'll also need tire-contrib__. So make sure you have it there or else this will explode.

```ruby
module Searchable
  extend ActiveSupport::Concern
  
  module ClassMethods

    ...
    
    def more_like(term, options = {})
      searcher(term, :more_like_this_field, options, {min_term_freq: 1, min_doc_freq: 2})
    end

    ...
  end
end
```

Now you can say `User.more_like('Josh Symonds')` and it'll find all documents with a more_like_this query for my name. Clever!

## Searching Across Multiple Models

If you have a single search field on your site (like in the top navbar), most likely you'll want to search across multiple models with it: the user could be searching for a person, or a piece of content, or a tag. There's no easy way to know for sure what it is they want, so we should search across all of the fields and order the results by their relevance. Though this sounds complicated, with this concern, this is actually surprisingly easy.

```ruby
module Searchable
  extend ActiveSupport::Concern

  module ClassMethods
    def searchable(fields)
      @search_fields = fields
      Searchable.loaded_classes[self.to_s] = fields
    end

    ...
  end

  def self.loaded_classes
    @loaded_classes ||= {}
  end

  def self.search(term, options = {})
    Tire.search(Searchable.loaded_classes.keys.collect {|k| k.downcase.pluralize}.reverse, options.merge(load: true)) do
      query do
        boolean do
          Searchable.loaded_classes.values.flatten.uniq.each do |field|
            should {text field, term}
          end
        end
      end
    end.results
  end

end
```

We changed the `searchable` method slightly. Now, in addition to adding to an instance variable, it adds to a hash that the module itself keeps track of: this hash contains all the models as keys, and all their fields as values. Then, when we use it, it constructs a search across all those models' indexes for all the fields those models should be searching. To give a concrete example, let's say we use `Searchable.search('Josh Symonds')` and we have indexes on content titles and user names. This is what the resulting tire query will look like:

```ruby
Tire.search(['users', 'contents'], {load: true}) do
  query do
    boolean do
      should text('name', 'Josh Symonds')
      should text('name.partial', 'Josh Symonds')
      should text('title', 'Josh Symonds')
      should text('title.partial', 'Josh Symonds')
    end
  end
end
```

If you have some models that should be more relevant (like an exact tag match should be the most relevant result), give those mappings an appropriate boost inside the tire mappings for the model. Also keep in mind this will return an array of potentially very different objects: users and contents, in this case. You should either make sure they're all duck-typed correctly together, or check their type before acting on them. Finally, this will only work in development if you load each model before calling `Searchable.search`. Just entering the constant name of the model should be enough, but if you don't, then the module won't know to search with that model. Such is the danger of lazy loading in development.

## The Final Module

For your reference, this is the final module with all code included.

```ruby
module Searchable
  extend ActiveSupport::Concern

  module ClassMethods
    def searchable(fields)
      @search_fields = fields
      Searchable.loaded_classes[self.to_s] = fields
    end

    def search(term, options = {})
      searcher(term, :text, options)
    end

    def more_like(term, options = {})
      searcher(term, :more_like_this_field, options, {min_term_freq: 1, min_doc_freq: 2})
    end

    private

    def searcher(term, type, options = {}, field_options = {})
      fields = Array(@search_fields)

      self.tire.search(options.merge(load: true)) do
        query do
          boolean do
            fields.each do |field|
              should {send(type, field, term, field_options)}
            end
          end
        end
      end.results

    end
  end

  def self.loaded_classes
    @loaded_classes ||= {}
  end

  def self.search(term, options = {})
    Tire.search(Searchable.loaded_classes.keys.collect {|k| k.downcase.pluralize}.reverse, options.merge(load: true)) do
      query do
        boolean do
          Searchable.loaded_classes.values.flatten.uniq.each do |field|
            should {text field, term}
          end
        end
      end
    end.results
  end

end
```