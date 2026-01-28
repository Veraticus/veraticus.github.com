---
title: "Dynamoid 0.4.0"
date: 2012-05-01 00:04
tags: [gems, dynamoid]
---
[Dynamoid 0.4.0](https://github.com/Veraticus/Dynamoid) is a pretty significant improvement over previous iterations of Dynamoid. While the project has obviously always been my hobby, 0.4.0 represents what I would consider one of the first iterations I would use in a real production application. Not because the previous version haven't worked -- they've all done exactly what they should do. But now it has the flexibility and options to really allow an application to thrive in Amazon's DynamoDB.

What do I mean by that?


### Per-table Performance

Previously to 0.4.0, Dynamoid's table provisioning relied on the defaults that Dynamoid provided (100 read, 20 write) and then manual tuning if you wanted to make any changes from there. And that's for every table. This was especially frustrating because you can only scale up to twice the current value (though you can do that as many times as you want)... but the real downer is you can only scale down 20%, and you can only do that once per day. So obviously if my defaults didn't work for you, you had to go through a couple of days of readjustment, and who wants that?

Now you can specify performance options for each table you create, using the new `table` Dynamoid syntax:

```ruby
class Tweet
  include Dynamoid::Document

  table name: :twitters, key: :tweet_id, read_capacity: 200, write_capacity: 200
end
```

As a bonus you can also change the hash key and even the table name. Though the table name will still be placed in your namespace -- so if your namespace is `dynamoid`, your table will be `dynamoid_twitters`, in the above example.

### Consistent Querying

Consistency in enormous databases can be a troublesome question to address. I've read [that DynamoDB's consistent pricing](http://nosql.mypopescu.com/post/18844539755/why-dynamodb-consistent-reads-cost-twice-or-whats) is too high and I agree with Alex's points: but we live in a universe where DynamoDB consistent reading is reality, so we may as well make the best of it.

That said, thanks to [Anantha Kumaran](https://github.com/ananthakumaran), Dynamoid can now take full advantage of DynamoDB's consistent read feature. Issuing queries like this:

```ruby
Address.where(:city => 'Chicago').consistent.all
Address.find(1, :consistent => true)
```

Will retrieve all results, even the most recently-written ones. I gotta say, having people you don't even know commit to projects is one of the joys of open source programming, and this feature was written entirely by Anantha (though refactored a bit by yours truly).

### Future Functionality

I had a suggestion from [Aaron Namba](http://twitter.com/aaronnamba) to implement a rake task that would create tables. I think that's a great idea; expanding on it, a task to reprovision existing tables would also be pretty cool. Also, Mongoid offers embedded relations -- it should be no problem to offer those in DynamoDB through Dynamoid as well. The only issue, of course, is indexing the children IDs from inside their parents... but we already perform indexing, so it wouldn't be that bad.

Speaking of indexing, being able to index an association attribute would be pretty keen. So then you could go `user.addresses.where(:city => 'Chicago').all` and have it perform a quick lookup on a denormalized index table, rather than manually find all addresses for the user and then use Ruby to filter them. I'm not sure about this functionality, though, for the same reason that I'm unsure about adding geolocation.

Geolocation, you say? Yes indeed. Initially I had specced out a [geohash-style](http://en.wikipedia.org/wiki/Geohash) geolocation functionality that would allow models to do single-field location and distance finding. The longer I pondered the problem, though, the less compelling this answer seemed to me. Amazing pieces of software have already been developed (like [elasticsearch](http://www.elasticsearch.org/)) that are dedicated only to indexing (both text and geolocation). They do it faster and easier than DynamoDB probably ever could, and even Amazon has acknowledged this with the creation of their [CloudSearch](http://aws.amazon.com/cloudsearch/) service.

So I'm not sure complicated indexing will ever be on the table for Dynamoid. DynamoDB has some strengths and some really glaring weakness; and one of those weaknesses is indexing. Denormalized data is a pain to manage, and even though Dynamoid takes care of it all for you behind the scenes, complicated index tables make your application difficult to understand and painful to manage.

Unless I hear compelling arguments otherwise, I'll probably be relying on elasticsearch for my future Dynamoid applications. But the two of them should go together like peanut butter and chocolate; I'm working on a project now that should make significant use of both of them, so look for a future blog post detailing the two of them working together!
