---
title: "Elasticsearch and Percolation in Rails"
date: 2012-03-25 11:39
tags: [rails, gems]
---
Hipstamatic uses the pretty awesome Family Album feature for people to like and react to each others' photos. You can create either a magic album -- an album that matches to a combination of criteria including accounts, geolocation, tags and descriptions -- or a curated album, selecting photos directly that you want to include. The latter is a pretty straight-forward association and isn't very interesting to talk about, but I wanted to discuss briefly the methods we used to implement magic albums and what we finally settled on. It involved a lot of setting up elasticsearch and percolation, and ultimately I think it's a very durable, excellent solution for anyone wanting to index a lot of data and retrieve it extremely quickly.


Initially, magic albums were a set of complicated MySQL queries. I think anyone who's had experience with indexes in an enormous MySQL database knows where this one is going... its performance was terrible, and as more people created more albums our RDS instance started really chugging. The worst part was we were spending enormous amounts of time, energy, and money invested in a small part of our application, and it was having a cascade effect through the database ruining the rest of the user experience.

As a stopgap measure, we switched to using Redis lists to hold the association but kept the actual index in MySQL. Recently though we migrated away from MySQL completely to an index storage called [elasticsearch](http://www.elasticsearch.org/). Elasticsearch is awesome because it's built on Lucene, is incredibly easy to get going, and is very very powerful. I passed over search solutions like [Sphinx](http://sphinxsearch.com/) and [Searchify](http://www.searchify.com/) mostly because we aren't doing any text searching: all of the queries albums perform on photos are controlled by direct, matched fields. We just needed a great, simple engine for indexing them constantly and pulling results out quickly -- an engine that wouldn't bring the rest of our stack down if there was an indexing failure or if we were bombarded with many simultaneous queries.

Elasticsearch has given us all that and more. Using the amazing [tire](https://github.com/karmi/tire) gem, it was simple to get our photo model set up correctly:

```ruby
class Photo < ActiveRecord::Base
  include Tire::Model::Search
  
  mapping do
    indexes :id
    indexes :lat_lng, :type => :geo_point
    indexes :account_id
    indexes :created_at, :type => :date
    indexes :tags
  end
end
```

(The code here is changed slightly from its production form to redact business logic and simplify it.) Of course, the real magic takes place in the albums model. Albums are essentially saved queries, if you think about it: they should search for photos every time they're called. So we have a method to generate the query we're looking for:

```ruby
class Album < ActiveRecord::Base

  def elasticsearch_query
    query = []
    query << {:terms => {:account_ids => query[:accounts]}} unless query[:accounts].blank?
    query << {:terms => {:tags => query[:tags]}} unless query[:tags].blank?
    query << {:range => {:created_at => {:from => query[:starts_at], :to => query[:ends_at]}}} unless query[:starts_at].blank? && query[:ends_at].blank?
    query << {:geo_distance => {:lat_lng => [query[:lat].to_f, query[:lng].to_f.join(','), :distance => "#{query[:range]}km"}} unless query[:lat].blank? || query[:lng].blank?
    query
  end

end
```

These are all, in elasticsearch parlance, filters rather than queries: queries must look into data fields and perform operations in them, whereas filters just filter on a fields' value directly... exactly what I was looking for. `terms` instructs the filter parser that at least one of the select elements must match. `range`, as you can see, allows us to pull only photos within a certain date. `geo_distance` is particularly cool and lets us filter all photos by their geographic location.

Using this couldn't be simpler:

```ruby
class Album < ActiveRecord::Base

  def elasticsearch_photos
    finder = Photo.search do
      query { all }
      filter(:and, elasticsearch_query) unless elasticsearch_query.empty?
      sort {by :created_at, "desc" }
    end
    
    finder.results
  end
```

Tada! Easy and simple searching inside your models. The performance gain for us was massive; elasticsearch has a ridiculously small memory footprint, but consistently returns responses to us in 50-60 milliseconds. Now that's performance!

Many of you might be wondering, though, how we get the reverse of this association. Albums have many (searched) photos; how does a photo know what album it's in? This was a stumbling block for the other search solutions I investigated, and I was concerned I would have to bust out the old, gimpy MySQL.

But elasticsearch to the rescue! It employs a very neat feature called [the percolator](http://www.elasticsearch.org/blog/2011/02/08/percolator.html). Percolation allows us to save searches as an index themselves, and then determine what objects match any of the saved searches. So, we save the search an album would conduct along with the album's ID into the photo percolator; then we can determine what queries a photo matches when we save it. It's really quite ingenuous and was, of course, ridiculously easy to set up:


```
class Album < ActiveRecord::Base
  after_save :register_query

  def register_query
    Photo.index.register_percolator_query(self.id) do |q|
      q.filtered do
        query {all}
        filter(:and, elasticsearch_query) unless elasticsearch_query.empty?
      end
    end
  end
  
end
```

This uses the same `elasticsearch_query` method as above (of course, since we want to save the same query into the database). And on the photo model, to use it, we just do:

```
class Photo < ActiveRecord::Base

  def percolated_albums
    Album.find(Photo.index.percolate(self))
  end
end
```

This was a rather whirlwind tour, but I was really impressed at how easy it was to get elasticsearch set up properly. It really has added quite a lot to our stack and I look forward to using it on other domain problems (maybe even including full text search)! It was pretty easy to get it tested as well, but I think I'll save details on how I did that for another post.
