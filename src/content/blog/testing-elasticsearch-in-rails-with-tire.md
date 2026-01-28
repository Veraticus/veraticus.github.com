---
title: "Testing Elasticsearch in Rails with Tire"
date: 2012-04-15 23:38
tags: [rails, gems]
---
In my [previous entry on elasticsearch](http://joshsymonds.com/blog/2012/03/25/elasticsearch-and-percolation-in-rails/), I promised I would elaborate on testing [elasticsearch](http://www.elasticsearch.org/) (and [tire](https://github.com/karmi/tire)) in Rails applications. There's not really a whole lot of secret sauce to it, but I figured it'd make a good, quick post with some crunchy code for a late night. While writing, though, I realized I could also talk about a small problem I ran into while using tire -- specifically relating to index regeneration. This isn't a major flaw, but it did waste some of my time, so I figured documenting it (prior to fixing it) would be a sensible idea.


## Testing Tire

There are two components to testing tire: the first is emptying the index before tests where the contents of the index matters, and the second is ensuring that you only delete the index you want, rather than your development index (which would be annoying). Deleting the correct index is really easy. You just want something like this in your model:

```ruby
class Photo
  include Tire::Model::Search

  index_name("#{Rails.env}-search-photos")
  
  ...
end
```

Specifying `index_name` as dependent on the Rails environment ensures that your development index won't be destroyed by the next bit of code. 

```ruby
def clear_photo_index
  Photo.tire.index.delete
  Photo.tire.index.create(:mappings => Photo.tire.mapping_to_hash, :settings => Photo.tire.settings)
  Photo.tire.index.refresh
end
```

I stuck that code in `test_helper.rb` and I call it before each of my photo tests. The first line, obviously, deletes the entire index. The second recreates it, using the mappings and settings already specified in the Photo model. And then we refresh it just to make sure that tire agrees with elasticsearch about the indexed fields.

## Caveat Indexor

Overall, tire and elasticsearch have been joys to use. I have experienced unexpected behavior in tire though, particularly relating to index mappings. Obviously, deleting an index in tire works just as expected -- the index and all its associated data goes away. Also deleted are the field mappings for that index. However, what happens when you try to create a new object without reloading the class that defined it?

Tire still faithfully stores the object into the deleted index. This invokes elasticsearch's [automatic index creation](http://www.elasticsearch.org/guide/reference/api/index_.html) logic, which attempts to determine the types of your fields manually. Unfortunately, it never seems to correctly identify geo_point fields properly. For example, this is what my index mapping should look like:

```ruby
{"photo"=>{"properties"=>{"account_id"=>{"type"=>"string"}, "id"=>{"type"=>"string"}, "lat_lng"=>{"type"=>"geo_point"}, "name"=>{"type"=>"string", "analyzer"=>"snowball"}}}}
```

But if I delete the index and then insert an object into it, elasticsearch automatically determines the types as follows:

```ruby
{"photo"=>{"properties"=>{"_type"=>{"type"=>"string"}, "account_id"=>{"type"=>"long"}, "id"=>{"type"=>"long"}, "lat_lng"=>{"type"=>"string"}, "name"=>{"type"=>"string"}}}}
```

The key difference here is that `lat_lng` is not a geo_point but is instead a string, which prevents any of the index geolocation queries from being run on it. You can correct this problem by deleting the index and reloading the class in which the index is defined, which causes tire to create the index again from your provided mapping. (Or run the `tire.index.create` code from above.) But I spent a tiring(pun!) hour trying to figure out why my indexes kept on receiving inappropriate field types before hitting on this as the reason.

Similarly, and possibly more frustratingly, if you are incrementally developing an index, changes to your mapping won't appear in the index until you delete said index and reload its defining class. Again, deleting the index and inserting data immediately will cause elasticsearch to guess the field mappings for your index, with tragically inconsistent results.

I told the very talented [karmi](https://github.com/karmi) about this problem and he sensibly suggested I write a failing test for it, though unfortunately I haven't had the time to sit down and really do that. In the meantime, just know that this annoyance exists, and if you're working on tire indexes, make sure you religiously delete the mapping and then reload the class before you attempt to use the index again.
