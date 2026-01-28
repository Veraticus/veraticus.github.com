---
title: "The Numbers Behind Consulting in 2014"
date: 2015-01-06 14:10:38 -0600
tags: [business, consulting]
---
I've always loved reading behind-the-scenes articles about people's businesses: where their money came from, where it went, and what they learned from operating their companies. Since I recently finished closing the books on my business for 2014, I thought I'd make that sort of post for my own company -- real numbers and real thoughts from a real business.


My consultancy, [Symonds &amp; Son](https://symondsandson.com), has had a successful year. In 2014 we grossed almost quadruple what we did in 2013 -- which makes sense, since it was pretty me just me and some part-time contractors back then. While I very much hope we experience similar success in 2015, I'm not exactly projecting continued growth of that magnitude -- I think it's likely Symonds &amp; Son will finish next year in a similar place to this one, given my clients' burn rates and my excellent client retention numbers. But I'm getting ahead of myself... let's start digging into the nitty gritty of my books.

## Expenses

Symonds & Son has three full-time employees: me, my mother, and my father. If you're curious how that works I made an [earlier post about working with your family](http://joshsymonds.com/blog/2014/03/12/interviewing-symonds-and-son/). We paid twelve contractors in 2014 for work as diverse as Rails application development, devops chef help, postgresql optimizations, iOS app creation, web and app design, and lots of accounting. Almost all (more than 96%) of our 2014 expenses were payroll and contractor payments:

<div id="expenses_overview" style="min-width: 310px; height: 400px; max-width: 800px; margin: 0 auto 20px auto"></div>

<script>
$(function () {
    $('#expenses_overview').highcharts({
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false
        },
        title: {
            text: 'Symonds & Son 2014 Expenses'
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f}%',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                }
            }
        },
        series: [{
            type: 'pie',
            name: 'Expenses',
            data: [
                {
                  name: 'Contractors & Payroll',
                  y: 96.5,
                  sliced: true,
                  selected: true
                },
                ['Hardware', 1.8],
                ['Software', 0.9],
                ['Operations', 0.7],
                ['Marketing', 0.2]
            ]
        }]
    });
});
</script>

Operations is how I've bucketed AWS, DigitalOcean, CircleCI, RackSpace, CodeClimate and GitHub subscriptions. Software, by contrast, is one-time license payments (for Adobe Photoshop, for example), and hardware is all my visits to the nearest Apple store or authorizing hardware purchases for contractors/employees.

See that 0.2% marketing expense? That was a very modest Google AdWords campaign. The result of that campaign was a reasonably good client lead that we were unable to follow up on, due to my inability to staff up quickly enough to satisfy it. In general, figuring out how to properly market Symonds &amp; Son has been my biggest challenge... but more on that below.

The 96.5% contractors &amp; payroll number might initially appear surprising, but I think in a consultancy it makes sense. My entire business relies on the strength of my employees -- I'm literally converting hours into software, when you get down to it, and my clients expect excellent quality and superior craftsmanship from my company. Also there's a fair amount of stuff that's just not in my core competency: though I manage my business as best I can, I do not do our taxes or bookkeeping, and I'm happy to pay a really excellent accountant to do it for me.

Ultimately consultancies are about people, and I'm proud to say that my expenses reflect the value of my contractors.

But that sounds a little trite. This post is about showing the numbers, so let me prove how much I value the skills of those I pay. Here's a chart showing how my money was divided among contractors and payroll, by skill:

<div id="skill_expenses" style="min-width: 310px; height: 400px; max-width: 800px; margin: 0 auto 20px auto"></div>

<script>
$(function () {
    $('#skill_expenses').highcharts({
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false
        },
        title: {
            text: 'Symonds & Son 2014 Contractor/Payroll Expenses by Skill'
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f}%',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                }
            }
        },
        series: [{
            type: 'pie',
            name: 'Expenses',
            data: [
                {
                  name: 'Rails',
                  y: 65.5,
                  sliced: true,
                  selected: true
                },
                ['chef', 18.2],
                ['elasticsearch', 3.6],
                ['postgresql', 4.5],
                ['iOS', 4.5],
                ['Design', 1.8],
                ['Marketing', 0.9],
                ['Accounting', 0.5],
                ['Legal', 0.4]
            ]
        }]
    });
});
</script>

By necessity, Rails includes a fair amount of JavaScript/HTML/CSS stuff that it would be pretty difficult to break out.

Marketing here is a social media marketer who's helping me with branding and strategy -- a separate expense from directly paying for advertising, and one that has been more useful anyway, in my opinion. Perhaps most surprising from a personal perspective is costs spent on chef: those expenditures are internal, buying the time of some really excellent talent from the chef community to improve and build on my infrastructure cookbooks.

One of my goals for 2015 is to acquire new infrastructure clients and package my existing infrastructure services as a software product, which we're tentatively calling Cornerstone. More on that below, as well.

## Revenue

We had ten clients during 2014 and an additional four client possibilities that we failed to land, giving my company a conversion rate of 71%. That's really good, but as you'll see it's only part of the story. Here's how most of those clients found Symonds &amp; Son:

<div id="lead_generation" style="min-width: 310px; height: 400px; max-width: 800px; margin: 0 auto 20px auto"></div>

<script>
$(function () {
    $('#lead_generation').highcharts({
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false
        },
        title: {
            text: 'Symonds & Son 2014 Client Leads'
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b> ({point.y})'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f}% ({point.y})',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                }
            }
        },
        series: [{
            type: 'pie',
            name: 'Leads',
            data: [
                {
                  name: 'Blog Posts',
                  y: 10,
                  sliced: true,
                  selected: true
                },
                ['Friend Referrals', 3],
                ['Adwords', 1]
            ]
        }]
    });
});
</script>

Nearly all of my clients find me through the very blog you're reading right now. (Do you need Rails development, application scaling, or devops services? [Email me, I'm really good!](mailto:josh@joshsymonds.com?Subject=Hi&nbsp;Josh!))

Of those leads, we did not convert two friend referrals, one blog post, and the only Adwords potentials. Overwhelmingly, clients find and stick with me because of my writing. I think the success of my blog as a marketing mechanic is rather self-explanatory: if someone sees something I've written about that they really need help with, they're very likely to pursue me and almost usher themselves through my sales pipeline.

This has downsides though -- it's not really scalable. Increasing the reach of my blog is difficult since it's hard to properly advertise a (mostly) technical blog. In 2015 I hope to find more clients in need of devops and development services, particularly those I might not ordinarily reach with an article on consul or elasticsearch: say, a Vice President of Engineering or a Director of Technology who knows in general they need help, but not that they need cloud-scale chef deployments or expert Rails consulting.

As part of this shift I've spent some time redesigning and rebranding my own corporate website, trying to productize my core offerings as packages of services, rather than just services. Hopefully product clarity will allow Symonds &amp; Son to sell more of what we do best in the coming year. I'm looking to roll out this redesign by the end of February, so that will give me 10 months to test it.

I'm proud to say that of my 2014 clients, all except two will be continuing into 2015 with me, giving Symonds &amp; Son an 80% yearly retention rate. The ones who I've parted ways with I hope to see again; both are startups with funding issues. Considering the sample size is a bit small this doesn't necessarily mean anything, but I like to think that our clients appreciate the services we continue to provide to them.

Speaking of services, here's a rather interesting breakdown of Symonds &amp; Son revenue by technology service:

<div id="technology_service" style="min-width: 310px; height: 400px; max-width: 800px; margin: 0 auto 20px auto"></div>

<script>
$(function () {
    $('#technology_service').highcharts({
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false
        },
        title: {
            text: 'Symonds & Son 2014 Revenue by Service'
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f}%',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                }
            }
        },
        series: [{
            type: 'pie',
            name: 'Leads',
            data: [
                {
                  name: 'Rails Development',
                  y: 66.7,
                  sliced: true,
                  selected: true
                },
                ['Devops', 29.1],
                ['iOS', 4.2]
            ]
        }]
    });
});
</script>

Devops is always sort of a loose term -- here I mean recurring and one-time revenue from customers who are enjoying our really excellent chef cookbooks and infrastructure administration, and those who paid us to set up cloud installations for them. This includes postgresql and elasticsearch design and development by experts, for example, if you're correlating this to the expenses by skill chart from earlier.

And this revenue breakdown rather closely mirrors that chart, which after all makes sense: I'm trying to match customers' needs to the skills of my organizations, and if I were paying a ton for, say, elasticsearch but didn't have many customers utilizing my contractors with those skills, I'd have some expensive people sitting around doing nothing... far from optimal!

Though I'm really happy with the iOS apps Symonds &amp; Son developed in 2014, they unfortunately produce the least revenue of any of our services. And I'm not sure I want to change that much: in 2015, what I'd like to see is increased revenue from devops. I've very much enjoyed the operations contracts we've had, and we've invested a ton in our own cookbooks and development processes around those cookbooks -- a whole suite of software and processes that we're calling Cornerstone. Using Cornerstone more would be a tremendous victory (and would be super fun, besides).

## Looking Back &amp; Looking Forward

2014 was a really great year for Symonds &amp; Son. But that sets up a certain expectation of more success and more growth, when in truth it's impossible to predict what the coming year will bring. I personally view our present clients as extremely stable and loyal, so hopefully there's nowhere to go but up -- but overall I hope to chart a conservative course for my company, erring on the side of growing properly rather than overexpanding.

And that's what the internals of a small consultancy looks like! Hope you've found this interesting -- and if you're looking for Rails development or devops help, don't be afraid to [drop us a line](mailto:josh@joshsymonds.com?Subject=Hi&nbsp;Josh!). I think you'll be very pleased with our services.
