---
layout: post
title: "Dynamoid: An ORM for Amazon's DynamoDB"
date: 2012-02-22 15:00
comments: true
categories: [dynamoid, dynamodb]
---
[Dynamoid](http://github.com/Veraticus/Dynamoid) is (another) gem I developed, but I think it's a lot more exciting than [rapnd](http://github.com/Veraticus/rapnd)! I started work on it over Christmas but didn't really get a lot of opportunity to focus on it again until recently, when work become relatively less busy.

Dynamoid owes a lot to [Mongoid](https://github.com/mongoid/mongoid) -- it's essentially trying to be for DynamoDB what Mongoid is for MongoDB. Unfortunately, it doesn't really do a whole lot of exciting stuff yet...

But it will soon! The TODO list is particularly exciting:

* Association magic: The standard fare like belongs_to, has_many, habtm.
* Automatic value separation and joining: Values for DynamoDB keys are limited to 64KB, but with a clever framework we can get around that constraint with multiple keys conjoined together.
* Automatic key distribution: As per [Amazon's provisioned throughput guidelines](http://docs.amazonwebservices.com/amazondynamodb/latest/developerguide/BestPractices.html), keys that are frequently accessed incur a throughput penalty due to traffic concentration. Dynamoid will distribute keys that you specify across a number of duplicated keys, and will concatenate them together when read.
* Not-gimpy finders: Criteria like you're used to with ActiveRecord, so that you can do User.where(:name => 'Josh') rather than User.find_by_name('Josh').
* Range keys for models and indexes: To support queries like User.where(:created_at.gt => DateTime.now - 1.day)

I hope to have time over the next few days and the weekend to continue improving Dynamoid. Watch this space for further updates.