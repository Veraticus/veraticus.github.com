---
layout: post
title: "Dynamic Error Pages, Corrected"
date: 2012-08-13 14:32
comments: true
categories: [rails]
---
Earlier today [@alan_meier](http://twitter.com/alain_meier) pointed out that in certain circumstances, my post on [dynamic error pages](http://joshsymonds.com/blog/2012/06/28/dynamic-error-pages/) leads to unexpected results: namely, though most errors are caught, 404s are not. I didn't experience this myself because most 404s, for me, result in an ActiveRecord::RecordNotFound error, since my application has a wildcard route at the very end. But if you don't then my post on dynamic error pages won't work for you very well. Here, then, is an explanation of the problem and how to fix it.

<!-- more -->

## The Problem

Summarized elegantly [here](https://github.com/rails/rails/issues/671):

> In Rails 2.3.x, one is able to stick this in ApplicationController to present the user with a custom 404 screen:

> `rescue_from(ActionController::RoutingError) { render :text => 'This is a custom 404.' }`

> Now in Rails 3, because routing is done as middleware (ActionDispatch), it seems that the ActionController::RoutingError that gets thrown by ActionDispatch no longer can be caught from ApplicationController -- the error is already thrown and ActionDispatch renders /templates/rescues/routing_error.erb before the controller can rescue_from the error.

Essentially, `rescue_from ActionController::RoutingError` is never rescued because it's raised in Rack, not the application itself.

## The Solution

Requires a couple changes on our parts. First, let's change our application_controller.rb:

```ruby
unless Rails.application.config.consider_all_requests_local
  rescue_from Exception, with: :render_500
  rescue_from ActionController::RoutingError, with: :render_404
  rescue_from ActionController::UnknownController, with: :render_404
  rescue_from AbstractController::ActionNotFound, with: :render_404 # To prevent Rails 3.2.8 deprecation warnings
  rescue_from ActiveRecord::RecordNotFound, with: :render_404
end
```

So far, just as usual. Now we define the actual actions:

```ruby
  def render_500
    render_exception(500, exception.message, exception)
  end


  def render_404(exception = nil)
    render_exception(404, 'Page not found', exception)
  end


  def render_exception(status = 500, message = 'Server error', exception)
    @status = status
    @message = message

    if exception
      Rails.logger.fatal "\n#{exception.class.to_s} (#{exception.message})"
      Rails.logger.fatal exception.backtrace.join("\n")
    else
      Rails.logger.fatal "No route matches [#{env['REQUEST_METHOD']}] #{env['PATH_INFO'].inspect}"
    end

    render template: "errors/error", formats: [:html], layout: 'application', status: @status
  end
```

Since we're going to be exposing `render_404` as an action, now, we have to make parameters into it optional: but we know that if `render_exception` doesn't receive an exception, it actually got a 404.

Finally, we need to add a globbed, wildcard route at the conclusion of our routes.rb. But if we just add one in, then engines and Gems that also rely on wildcard routes will fail. The solution is to do this through our application.rb, like so:

```ruby
module MyApplication
  class Application < Rails::Application

  ...

  # 404 catcher
  config.after_initialize do |app|
    app.routes.append{ match '*a', :to => 'application#render_404' } unless config.consider_all_requests_local
  end
end
```

Now it won't punch any Gem or engine routes, but will still redirect 404s correctly to our render_404 action.

Thanks to [@alan_meier](http://twitter.com/alain_meier) for bringing this problem to my attention, and I hope this correction helps some people out!