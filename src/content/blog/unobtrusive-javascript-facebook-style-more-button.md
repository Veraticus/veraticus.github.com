---
title: Unobtrusive JavaScript Facebook-Style More Button
date: 2012-10-14 21:20
tags: [rails, coffee]
---
I spent awhile yesterday Googling for a Facebook-style more button with a graceful fallback: something where, if the user didn't have JavaScript, they'd still see something sensible... but if they did, they'd get a sweet fade-in of more content appended right to the content container. Oh, and I also didn't want to write separate views for JSON returns, so it had to deal with HTML returns and strip out the unnecessary bits.

I didn't find anything, so I took a crack at creating it myself. This is the result.


## How to Use It

Before coding I sat down and tried to figure out how this beast would work.

Because it was unobtrusive, it should work on standard links, replacing them with an AJAX-y alternative if they have appropriate attributes. I hit on a link that looked like this:

```ruby
<%= link_to 'More...'.html_safe, root_path(page: @page + 1),
    class: 'next_page', 'data-selector' => '.articles .article',
    'data-container' => '.articles'%>
```

If the link has `data-selector` and `data-container` attributes, it's supposed to be an AJAX more button. The selector tells the script what to look for in the new page; the container tells it where to append the newly found elements. With this use case in hand, I proceeded to coding.

## The Code

I apologize in advance if there's a cleaner way to do this. My CoffeeScript is pretty weak.

```coffeescript
$(document).ready ->
  $('[data-selector]').click (event) ->
    element = $(this)
    url = element.attr 'href'
    return false unless url
    container = $(element.attr 'data-container')
    selector = element.attr 'data-selector'
    more = true

    $.ajax
      url: url
      success: (data) ->
        elements = $($(data).find(selector))
        if elements.length == 0
          element.html('All content loaded')
                 .addClass('done')
                 .removeAttr('href')
        else
          container.append elements
          elements.css opacity: 0
          elements.imagesLoaded (event) ->
            elements.animate opacity: 1
            element.attr('href', $(data).find('[data-selector]').attr('href')).
                    html('More &raquo;')
            container.masonry 'appended', elements, true if element.attr('data-masonry')
              
      beforeSend: ->
        element.html('Loading more...')
               .addClass('loading')

    return false
```

This should be pretty straightforward: we find the URL of the next page from the href of the link itself, and also the container we're adding elements to and the selector. We make an AJAX request for the new page and parse it for the selector, appending each result to the container and fading them in once all the images have loaded. Afterwards, we update the URL to request the next new page of content if someone clicks on the "More" button again -- or we disable the "More" button if we found no content.

Overall pretty simple but I was satisfied with this solution. Oh, and there's a line there for integration into the really excellent [jQuery Masonry](http://masonry.desandro.com/) script, if you include a data-masonry attribute on your link element.
