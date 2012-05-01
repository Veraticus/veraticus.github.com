---
layout: post
title: "Rails 3: Arel, Arel_Table, and Squeel"
date: 2012-03-10 10:17
comments: true
categories: [ruby, rails]
---
Rails 3 provides a lot of really neat functionality, and one of the pieces that looked coolest was Arel -- ActiveRecord's own relational algebra. Finally, we could get rid of SQL in queries and use a clear, syntactic DSL to manage our queries!

Well, in reality, that isn't quite what happened. ActiveRecord's Arel functionality does provide some neat criteria chaining methods, but unfortunately you either end of typing a lot of raw SQL:

<!-- more -->

```ruby
Model.select("sum(model.column) as 'model_sum'").order("created_at
DESC").where("models.created_at > ?", DateTime.now - 1.day)
```

Or using unpleasant workarounds to address the underlying Arel for the model:

```ruby
Model.where(Model.arel_table[:title].matches('%foo%'))
```

This is just kinda ugly. Happily, there's a Gem that addresses this problem called [squeel](https://github.com/ernie/squeel) that makes Arel what, in my mind, it should be. It provides an elegant, simple syntax for creating and managing queries that is sensibly divorced both from the underlying Arel and raw SQL of the database:

```ruby
Model.where{ {name == 'Josh' | created_at <= DateTime.now} }
```

Much easier to understand! The double-curly braces does kind of suck (this is because it's a hash inside a proc) but it's still a fair but more understandable than the default Arel stuff.