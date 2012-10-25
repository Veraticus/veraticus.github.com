---
layout: post
title: "Seamless POST Logins with Rack Middleware"
date: 2012-10-10 18:47
comments: true
categories: [rails]
---
It's not uncommon to have login-required forms accessible to users who aren't logged in -- for example, maybe you're trying to encourage someone to start writing some content without having to bother logging in first. Of course, they have to log in before they can post, but what happens when they push that big "post" button? Or take another example: you have a button to thumbs-up some content. Only logged-in users should be able to thumbs-up any content, but you always want to display the button. But then what happens when someone who's not logged in presses the button? In most Rails applications, they'd be logged in, redirected back to the page they were referred from, and they'd have to click the thumbs-up again.

That sort of sucks. They already clicked it once. Why can't we remember that?

I ran into this problem myself today in the context of the thumbs-up button. After doing some research and realizing there was no great Rails 3 solution to the problem, I decided I would roll one myself. The result is some complicated but awesome Rack middleware that I think would be pretty handy for most Rails developers.

<!-- more -->

## Pre-Controller Setup

This method is rather login-agnostic; it should work if you're using [Devise](https://github.com/plataformatec/devise), [OmniAuth](https://github.com/intridea/omniauth), [both](https://github.com/plataformatec/devise/wiki/OmniAuth:-Overview), or neither. For the purposes of my examples, however, I'm using OmniAuth.

First, put some code wherever you redirect to force login. I do that when I see a `CanCan::AccessDenied` error, but you should do it wherever makes sense for you. Here's an example method very similar to the one I use.

```ruby
class ApplicationController

  private

  def redirect_to_login
    redirect_to login_path(return_to: request.path, return_post_params: params, return_method: request.method)
  end
end
```

`login_path` should redirect somewhere sensible: I chose sessions#new. Once there, we reset the session (to prevent any funny business) and then assign a bunch of attractive new session variables.

```ruby
class SessionsController < ApplicationController
  def new
    reset_session
    session[:return_to], session[:return_post_params], session[:return_method] = params[:return_to], params[:return_post_params], params[:return_method]

    redirect_to "/auth/facebook"
  end
end
```

Since I'm using OmniAuth and Facebook, this will result in the user being logged in. In the login callback -- I chose sessions#create -- we need to do some special detection and redirection.

```ruby
class SessionsController < ApplicationController
  def create
    user = User.create(request.env)

    if user
      session[:user_id] = user.id
      flash[:success] = "Hi <b>#{user.name}</b>, you are now logged in."

      if session[:return_method] != 'GET'
        redirect_to '/redirect_back'
      else
        redirect_to session[:return_to] || '/'
      end
    else
      redirect_to root_url, flash: {error: 'You could not be logged in.'}
    end
  end
end
```

The interesting portion is `redirect_to '/redirect_back'`. That's our middleware hook: when the session variables are set correctly, and you go to `/redirect_back`, the middleware will activate and do a POST to the application. So, in essence, `/redirect_back` stands in for whatever request you just tried to go. That's why this doesn't work with GET requests: with a GET, the new URL for the page will be `/redirect_back` regardless of what the page is, which looks pretty weird.

## The Middleware

```ruby
class RedirectBack

  def initialize(app)
    @app = app
  end

  def call(env)
    req = Rack::Request.new(env)

    if req.path == '/redirect_back' && req.session[:return_method] && req.session[:return_post_params] &&
      req.session[:return_to] && req.session[:user_id]

      env['CONTENT_TYPE'] = 'application/x-www-form-urlencoded'

      env['REQUEST_METHOD'] = req.session.delete(:return_method)
      env["rack.input"] = StringIO.new(Rack::Utils.build_nested_query(req.session[:return_post_params]))
      req.session.delete(:return_post_params).each do |param, val|
        req.params[param] = val
      end

      new_url = req.session.delete(:return_to)
      ['REQUEST_PATH', 'REQUEST_URI', 'PATH_INFO'].each do |req|
        env[req] = new_url
      end

      req.session[:redirected] = true
    end

    @app.call(env)
  end

end
```

The whole idea of this middleware is to reformat the path and add in all the appropriate params from the session variables, and then call the Rails application with it. Rails believes that -- despite the URL being `redirect_back` -- we've made a correctly-formatted post and processes it correctly, sending another redirect to the client when it's completed.

## Post-Controller Setup

The only problem is that, since we're dealing with forms here, Rails needs a CSRF token. Without it, it'll purge the session at the beginning of the request and we'll end up in a redirect loop.

However, remember how we `reset_session` at sessions#new? We can be confident that this session is not fixated; we cleaned it before entering the middleware, and the middleware only deals with session variables. Provided you don't use the cookie session storage mechanism (and you should not be), you can be sure enough of the user's identity to ignore the authenticity token on this one request.

We also need to ensure that Rails places a new, correct CSRF token into the session. Otherwise users' sessions will be deleted by the CSRF handlers upon their next post, which will seem to have an invalid, old token.

```ruby
class ApplicationController < ActionController::Base
  protect_from_forgery
  skip_before_filter :verify_authenticity_token, :if => :redirected?

  def redirected?
    if session[:redirected]
      flash.keep
      session[:return_to], session[:return_post_params], session[:return_method], session[:redirected] = nil
      self.form_authenticity_token
      return true
    end
  end
end
```

As a bonus we also clean out the session a little bit so that `/redirect_back` won't work again. 

And that's that! Now a user can initiate a POST and be automatically logged in, see the POST completed, and be redirected to the output -- all with just one little button press. Though the Rails 2 method of doing this was substantially easier, I think this middleware method has an elegance to it. And the usability certainly can't be beat.