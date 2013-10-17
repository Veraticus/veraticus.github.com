---
layout: post
title: "Sidekiq + Houston: Production Ready"
date: 2013-10-17 12:13
comments: true
categories: [ruby, gems]
---
Three months ago, I wrote [Sidekiq + Houston: Persistent Apple Connection Pooling](http://joshsymonds.com/blog/2013/07/01/sidekiq-plus-houston-persistent-apple-connection-pooling/). The code I included there initially worked great but over time all the APN connections I had established would break and not restart themselves appropriately. To correct this issue, I wrapped the APN connection itself in a class that was more resistant to failure. To help those who are using Sidekiq and Houston together in production, here's the code I used to do so.

<!-- more -->

Change the `NotifierWorker` to look like this:

```ruby
# app/workers/notifier_worker.rb
require 'apn_connection'

class NotifierWorker
  include Sidekiq::Worker

  APN_POOL = ConnectionPool.new(:size => 2, :timeout => 300) do
    APNConnection.new
  end

  def perform(message, recipient_ids, custom_data = nil)
    recipient_ids = Array(recipient_ids)

    APN_POOL.with do |connection|
      tokens = User.where(id: recipient_ids).collect {|u| u.devices.collect(&:token)}.flatten

      tokens.each do |token|
        notification = Houston::Notification.new(device: token)
        notification.alert = message
        notification.sound = 'default'
        notification.custom_data = custom_data
        connection.write(notification.message)
      end
    end
  end

end
```

Of course, the big change here is `require apn_connection` and the extraction of all the logic that had formerly established our connection with Apple. Now we do that in a new class, sensibly called `APNConnection`:

```ruby
# lib/apn_connection.rb
class APNConnection

  def initialize
    setup
  end

  def setup
    @uri, @certificate = if Rails.env.production?
      [
        Houston::APPLE_PRODUCTION_GATEWAY_URI,
        File.read("#{Rails.root}/config/keys/production_push.pem")
      ]
    else
      [
        Houston::APPLE_DEVELOPMENT_GATEWAY_URI,
        File.read("#{Rails.root}/config/keys/development_push.pem")
      ]
    end

    @connection = Houston::Connection.new(@uri, @certificate, nil)
    @connection.open
  end

  def write(data)
    begin
      raise "Connection is closed" unless @connection.open?
      @connection.write(data)
    rescue Exception => e
      attempts ||= 0
      attempts += 1

      if attempts < 5
        setup
        retry
      else
        raise e
      end
    end
  end

end
```

The main difference here is that the `write` method will raise an error if the connection has become closed -- this happens most frequently when you write a bad device token into the stream, which causes the APN service to disconnect you. Frustratingly the closure is detected on the request *following* the bad request, meaning that a perfectly good request encounters an error for no particularly good reason. The retry code here will attempt to reopen the connection to Apple five times and resend the message, until eventually it gives up.

Using this method I have a robust, failure-resistant push notification service in production that I (and my customers) are very pleased with indeed.