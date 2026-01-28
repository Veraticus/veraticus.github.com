---
title: "Working Around DynamoDB's Limitations"
date: 2012-03-01 12:54
tags: [dynamodb, dynamoid]
---

I've been giving a lot of thought recently to working around DynamoDB's built-in limitations. Like most good web products (and I do believe DynamoDB is good), it uses a [less is better](http://uxmag.com/articles/less-is-better) approach: but in a database, less is surprising and can make it difficult for people to transition from their existing, fully-featured solutions to a cheaper, faster, but simpler product.

Nevertheless, I think you can still do a lot with DynamoDB, and I think the key is using tools targeted specifically towards its shortcomings: lack of indexing and transactional support. Today I'll talk a little about overcoming the indexing problem, since I'm still noodling around the transaction issue.


Amazon itself recommends non-flattened data in place of traditional indexes: replicate the data you're modeling in many tables, and search those tables by the hash and range key to find the data you want. This is kind of a pain to do manually, but (shameless self-promotion!) happens automatically with awesome gems like [Dynamoid](https://github.com/Veraticus/Dynamoid).

There are, of course, downsides. A single table with multiple indexes can potentially become dozens of tables... but happily DynamoDB allows each account 256 tables by default, and you can request even more capacity by just asking them. Another is making sure that data remains consistent across all your index tables, which is a pain to do by hand but relatively easy when automated.

This still doesn't allow really complex indexed operations -- you can find by email and name, for example, but you can't find by geolocation. For problems like this, we return to the idea of using existing tools: and for Rails, using Solr through the excellent [Sunspot](https://github.com/sunspot/sunspot) Gem would be my solution of choice. It provides easy and quick geospatial indexing, and indeed, searching on any kind or combination of indexes... far more than DynamoDB can easily provide or accomplish alone.

Unfortunately, it does require another database (of sorts) in addition to DynamoDB... and I can see the potential for geospatial indexing using DynamoDB's range keys in clever ways. But using existing tools to supplement the shortcomings of others is a pretty classy strategy, and would work really well in DynamoDB's case.
