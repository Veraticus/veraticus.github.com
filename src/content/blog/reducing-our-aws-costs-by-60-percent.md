---
title: "Reducing Our AWS Costs by 60%"
date: 2012-04-12 13:30
tags: [rails, servers]
---
Hipstamatic's Rails application is deployed to Amazon's Elastic Cloud, and we make extensive use of Amazon's Web Services in keeping it nimble and performant. Last month, I dedicated two weeks to increasing the responsiveness of the application while simultaneously improving its performance. As a result of the changes I implemented, our AWS costs for this month will be 60% lower than they were last month. This is a pretty dramatic drop, and I wanted to discuss the tools and techniques I used to make it happen.


## Improve Database Performance

One of the biggest cost savings I implemented was scaling back our RDS instance. We use a multi-AZ deployment to ensure constant availability; unfortunately, multi-AZ instances are extremely expensive, and I knew that if we could decrease the size of our instance we could save quite a bit of money. Targeting this part of our infrastructure proved very fruitful for lowering costs, and here's what I did to decrease load on our database:

### Find Slow Queries

Step through everything your app does with [bullet](https://github.com/flyerhzm/bullet) and Rails 3.2's [slow query explainer](http://weblog.rubyonrails.org/2011/12/6/what-s-new-in-edge-rails-explain/). Really get into the nitty-gritty here: run your resque jobs, go to every single controller action, and run all the model code you can get your hands on. Make sure you have a lot of data loaded into your database when you do this, or else queries that might be slow won't show up since they aren't running under actual load conditions. I added hundreds of thousands of records using FactoryGirl like this (from the Rails console):

```ruby
require 'factory_girl'
require '.test/factories.rb' # or wherever your factory file is located
200000.times do
  Factory.create(:photo)
end
```

Repeat as needed. Remember your production system will likely have millions of records; get as close as you can to this without overwhelming your development machine.

### Index Lots

Index the crap out of everything. It's nearly impossible to have too many indexes in a relational database, and every field you execute a query on should be indexed. Usually under production load conditions you'll rapidly discover that various fields that aren't indexed together should be, but examining the individual queries your application makes and ensuring they're all indexed is an awesome (though boring) use of your time.

I used [lol_dba](https://github.com/plentz/lol_dba) to get a starting point for indexes I wanted to add, but honestly you'll have to get into your code yourself to find out what really needs indexing. Automated tools can't really replace actual hands-on experience... at least, not in this case.

### Don't Use Your Database    

Sticking something into the database isn't always the right solution to a problem. I discussed [in a previous post](http://joshsymonds.com/blog/2012/03/25/elasticsearch-and-percolation-in-rails/) the problems we encountered in implementing a database-driven solution for something that should never have touched the database. Extremely large join tables in particular have awful performance, and the indexes on them can rapidly grow to a really ridiculous size. Before putting something in the database, consider if there isn't another tool to do that job. In particular, think about:

*   ####memcached
  
    If you want to rapidly retrieve data and it's in key-value form, and persistence doesn't really matter, use memcached instead. Be severe when you consider if something needs persistence. Do you really need to keep *every* message you pass to a client, or would keeping a count of them be sufficient?
    
*   ####redis

    Redis gives you the benefits of a semi-persistent datastore with some really nice data structures. If you need lists, sets, or ordered sets -- especially if these data structures are going to end up being extremely large or called very frequently -- use redis.
    
*   ####elasticsearch

    For geospatial, filter-based, and/or full-text indexing, relational database performance has nothing on dedicated indexing tools. I can't say enough nice things about elasticsearch in general and [tire](https://github.com/karmi/tire) in particular. elasticsearch is easy to set up, has a fraction of the overhead of a database, and several times its speed. If you're performing a complicated, variated SQL query, consider if that query could be run on an indexing engine instead.
    
## Use More Caching

I touched on this in [my scaling post](http://joshsymonds.com/blog/2012/04/06/how-i-scaled-hipstamatic/) but I want to restate it here: caching allows you to reduce load on every part of your application. (Except the cache I guess...) With proper caching you can remove web servers, application servers, and database servers from your setup. In addition to scaling down our database instance, we removed two entire extra-large EC2 instances because of better caching.

Figure out what to cache first and foremost by investigating your metrics. New Relic, Google analytics, even munin and monit will all provide you clues as to where users are going. I'd be willing to bet money almost all of your traffic is directed to the same five or ten extremely popular sources. Extract partials from those pages, or just cache them in their entirety: then serve the results instead of hitting your database (or ideally even before hitting your application servers).

The most important key to our caching strategy are definitely Rails sweepers. Rails sweepers keep caching DRY: instead of expiring caches manually over and over in your models and controllers, do it in one centralized place. Just keep in mind that sometimes Rails' helper methods won't find the proper cache, especially if you use multiple domains for one application. In that case specify the fragment you need to expire directly, like so:

```ruby
def after_save(object)
  [:domain1, :domain2, :domain3].each do |domain|
    expire_fragment "views/#{domain}/objects/#{object.id}"
  end
end
```


I have this extracted out on a per-environment basis, specifying the domains to expire in our environment files. It works out really well.

## Be Responsive

One of the great things about being deployed to the cloud is that you can -- and should! -- scale up and down frequently. I usually have fifteen stopped EC2 instances sitting around, waiting to be added to my stack: with only a quick bootup, they'll be available to handle web or application traffic, or even add more resque workers and extra redis or memcached instances. These tools are highly dynamic and most of them can be scaled up and down quite easily, and stopped EC2 instances cost you nearly nothing (as long as the provisioned EBS drive is relatively small). And their cost is really very affordable when you consider how agile they allow you to be.

The key to being responsive is to communicate with your business. Is there a press release dropping that day? Time to scale up. New product coming soon? Bring those application servers online. Monitor your metrics carefully when you're at heightened capacity; when it looks like traffic has slowed, feel free to scale back down. But always be wary -- getting featured in a big publication can crush your servers unexpectedly. Ensure that you either have automated tools or great alerts letting you know when you're getting hammered, and don't be afraid to bring more servers online in a hurry. Overscaling in the short-term is a great idea: even the biggest EC2 instances cost only a few dollars an hour, and the peace of mind they give you is priceless.

Using these methods me allowed me to streamline our stack really significantly. Not only are we faster than we were just three months ago; we're saving a boatload of money each month. And being more awesome while spending less money is definitely a win/win.
