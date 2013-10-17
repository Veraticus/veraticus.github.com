---
layout: post
title: "Helper Methods in Sprinkle"
date: 2013-10-14 16:03
comments: true
categories: [ruby, servers]
---
Recently I've been using [sprinkle](https://github.com/sprinkle-tool/sprinkle) a lot in a large client project. Sprinkle is server provisioning software, akin to [Chef](http://www.opscode.com/chef/) except much lighter. It's most directly akin to [rubber](https://github.com/rubber/rubber), but rubber's biggest advantage is its pre-built recipes: it's a little finicky to sensibly extend, and those only work well on EC2. Sprinkle is built for extension, customizability, and platform agnosticism, but comes with no recipes at all by default. Tradeoffs!

Sprinkle (and rubber) are very different from most other server provisioning software I've used -- on the one hand, by leveraging Capistrano for server communication (or SSH or Vlad if you prefer), it remains extremely light and focused on just provisioning. But on the other, it inherits most of Capistrano's downsides too: primary among them is that it's easy to repeat yourself if you're not careful. So I wanted to post a quick tip for other people using sprinkle on how to DRY it up just a little bit.

<!-- more -->

Let's say you have a helper method you want to include in all policies, packages, and verifiers. Make a module to contain it, something like this:

```ruby
# sprinkle/config/helpers.rb

module Sprinkle
  module Helpers

    def templates
      path = File.expand_path('../../', __FILE__)
      "#{path}/templates" # sprinkle/templates/
    end

  end
end
```

The problem is that to use this helper method in a lot of different places requires a little bit of work. You can't just do something like this:

```ruby
# sprinkle/policies/base.rb

policy :base, roles: :web do
  requires :build_essential if File.exists?("#{templates}/build_essential.txt")
                                             # No method error for templates
end

package :build_essential do
  file "/etc/build_essential.txt",
    contents: render("#{templates}/build_essential.txt"), # No method error for templates
    sudo: true

  verify do
    has_file "/etc/build_essential.txt"
    puts "#{templates}/build_essential.txt" # Contrived example since you'd never really
                                            # just puts something here, but this also
                                            # throws a no method error
  end
end
```

You need to include the `Helpers` module in each class: policy, packages, and verifiers. That's easy enough to do. After you define your helper, do something like this:

```ruby
# sprinkle/config/helpers.rb

class Sprinkle::Policy
  include Sprinkle::Helpers
end


module Sprinkle::Package
  class Package
    include Sprinkle::Helpers
  end
end

module Sprinkle
  class Verify
    include Sprinkle::Helpers
  end
end
```

Now your helpers will be available everywhere you expect, allowing you to use them anywhere but still define them in one place.

I'll post some more neat sprinkle tidbits in the future, but this by itself allowed me to significantly dry up my code and enjoy my sprinkle experience quite a lot more.