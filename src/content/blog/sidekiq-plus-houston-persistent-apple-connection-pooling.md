---
title: "Sidekiq + Houston: Persistent Apple Connection Pooling"
date: 2013-07-01 21:24
tags: [ruby, gems]
---
> **I updated the code here based on my production experiences with it in a new post, [Sidekiq + Houston: Production Ready](http://joshsymonds.com/blog/2013/10/17/sidekiq-plus-houston-production-ready/). Check it out after reading this article.**

Having not updated [rapnd](http://github.com/Veraticus/rapnd) in a good long while, I was looking for well-supported, up-to-date solution for persisting long-running connections to Apple's push notification service through a worker. I didn't run into anything offhand, and also haven't posted a helpful code snippet in awhile, so this is how I connected [Houston](https://github.com/nomad/houston) and [Sidekiq](https://github.com/mperham/sidekiq) to Apple's Push Notification service.


From Houston's documentation, we can easily set up a persistent connection with code like this:

```ruby
uri, certificate = if Rails.env.production?
  [
    Houston::APPLE_PRODUCTION_GATEWAY_URI,
    File.read("/path/to/production_key.pem")
  ]
else
  [
    Houston::APPLE_DEVELOPMENT_GATEWAY_URI,
    File.read("/path/to/development_key.pem")
  ]
end

connection = Houston::Connection.new(uri, certificate, nil)
connection.open
```

Maintaining a persistent connection pool with Sidekiq workers is easy thanks to Sidekiq's integration with [Connection Pool](https://github.com/mperham/connection_pool). We can set that up fairly easily like so:

```ruby
APN_POOL = ConnectionPool.new(:size => 2, :timeout => 300) do
  # above code
end
```

I didn't want more than two connections since that should suffice for initial load; and a timeout of 5 minutes seemed reasonable enough for me. Ultimately, my worker ended up looking like this:

```ruby
class NotifierWorker
  include Sidekiq::Worker

  APN_POOL = ConnectionPool.new(:size => 2, :timeout => 300) do
    uri, certificate = if Rails.env.production?
      [
        Houston::APPLE_PRODUCTION_GATEWAY_URI,
        File.read("/path/to/production_key.pem")
      ]
    else
      [
        Houston::APPLE_DEVELOPMENT_GATEWAY_URI,
        File.read("/path/to/development_key.pem")
      ]
    end

    connection = Houston::Connection.new(uri, certificate, nil)
    connection.open

    connection
  end

  def perform(message, token)
    APN_POOL.with do |connection|
      notification = Houston::Notification.new(device: token)
      notification.alert = message
      connection.write(notification.message)
    end
  end

end
```
