---
title: "Dynamic Error Pages"
date: 2012-06-28 15:09
tags: [rails]
---
> **This post has been superseded by [Dynamic Error Pages, Corrected](http://joshsymonds.com/blog/2012/08/13/dynamic-error-pages-corrected/). Check that out first.**

One of the coolest features of Rails 3.2 is [tagged logging](http://api.rubyonrails.org/classes/ActiveSupport/TaggedLogging.html). Using the UUID tagged logger, you can give each individual request a UUID reference number in order to track individual errors, find them, and smoosh them. It's generally pretty awesome.

But it'd be even awesomer if actual errors in your application referenced this UUID, wouldn't it? Maybe even emailed it to you in exception_notification? Presented it to your users so they could say directly, "I encountered error 123xyz," rather than force you to look through a huge amount of backlog to find their specific exception?

Happily, you can do just this!


## Rescue_from Madness

Doing so requires abusing rescue_from a little bit, though. Set up something like this in your application_controller.rb:

```ruby
unless Rails.application.config.consider_all_requests_local
  rescue_from Exception, with: :render_500
  rescue_from ActionController::RoutingError, with: :render_404
  rescue_from ActionController::UnknownController, with: :render_404
  rescue_from ActionController::UnknownAction, with: :render_404
  rescue_from ActiveRecord::RecordNotFound, with: :render_404
end
```

This will prevent any error from rendering the default Rails error pages. Instead we'll set up our own error pages like so:

```ruby
  def render_500(exception)
    render_exception(500, exception.message, exception)
  end


  def render_404(exception)
    render_exception(404, 'Page not found', exception)
  end


  def render_exception(status = 500, message = 'Server error', exception)
    @status = status
    @message = message
    Rails.logger.fatal "\n#{exception.class.to_s} (#{exception.message})"
    Rails.logger.fatal exception.backtrace.join("\n")
    render template: "errors/error", formats: [:html], layout: 'application', status: @status
  end
```

And finally, in your view, actually include the request's unique identifier:

```ruby
  <h1><%= @message.split(/\s/).collect(&:capitalize).join(' ') %> <small><%= @status %></small></h1>
  <h3>Error Code: <%= request.env['action_dispatch.request_id'] %> </h3>
```

Dynamic error pages like what I'm suggesting are powerful but also dangerous. Static error pages are simpler and more maintainable: if the code executing your error page has an error in it, then your server process will loop until finally throwing a system stack exception. But if you keep your dynamic error pages simple and well-tested, it's pretty unlikely that'll happen. Just be careful when using this system -- maybe even don't render the exception in your usual layout, but render it in an error-specific one -- to reduce the chance of your error pages also erroring, and you'll be golden.
