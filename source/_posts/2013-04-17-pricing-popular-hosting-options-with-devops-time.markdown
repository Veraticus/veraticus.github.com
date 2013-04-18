---
layout: post
title: "Pricing Popular Hosting Options (With Devops Time)"
date: 2013-04-17 18:16
comments: true
categories: [rails, servers]
---
Recently I compared the major Rails hosting providers -- but as opposed to most price breakdowns I've read on the Internet, I opted to include provisional hourly devops time to set up and perform maintenance on the servers. For the purposes of this comparison, I only selected four providers: AWS, RackSpace, BlueBox and Heroku, and I'm assuming you use all their services (rather than combining two, say Heroku Postgres with AWS EC2 instances). I found the resulting price breakdown instructive, though interpreting them (and disagreeing with the provided hours) are left as an exercise for the reader.

<!-- more -->

## Comparisons

Any of these configurations should be adequate to support roughly a million requests a month (assuming throughput of 5 requests a second), provided most of the requests served aren't that complicated. We'll go for a medium database instance and aggressively cache as much as possible, thus we'll also need to provide memcached room somewhere. 

The big differentiator in my comparison (as opposed to others') is certainly a devops contractor at $150 an hour. I'll include the hours as I would estimate them personally, but for other people it might take longer or shorter -- and the price could go up if there's a ton of other software to go in the server. (For example, this theoretical application would probably eventually want redis and some sort of asynchronous worker system.)

So let's get down to the details!

### Amazon Web Services

<table>
  <tr>
    <th style='width: 72%;'>Service</th>
    <th>Setup</th>
    <th>Monthly</th>
  </tr>
  <tr>
    <td>
      <h4>1 medium EC2 instance (1 year contract, medium utilization)</h4>
      6 unicorn workers<br/>
      1 nginx reverse proxy<br/>
      memcached
    </td>
    <td>$277.00</td>
    <td>$30.74</td>
  </tr>
  <tr>
    <td>
      <h4>1 medium RDS instance (1 year contract, medium utilization)</h4>
    </td>
    <td>$500.00</td>
    <td>$40.26</td>
  </tr>
  <tr>
    <td>
      <h4>Devops Time</h4>
      10 hours setup<br />
      5 hours maintenance
    </td>
    <td>$1500.00</td>
    <td>$750.00</td>
  </tr>
  <tr class='highlighted'>
    <th>Total</th>
    <th>$2277.00</th>
    <th>$821.00</th>
  </tr>
  <tr class='highlighted'>
    <th>First Year</th>
    <th colspan='2'>$12129.00</th>
  </tr>
</table>

No surprises here: if you're using AWS, the hardware is ridiculously cheap. Most of your cost is going to be engineering time to get the instance up and running and then perform maintenance and add additional features to it. That said, I've had an EC2 instance going for about 8 months now with no maintenance at all on my part (laziness!), so if you don't need any additional server setup you can probably omit the maintenance time, for a monthly cost of $71.00 and a yearly cost of $3129.00.

### RackSpace

<table>
  <tr>
    <th style='width: 72%;'>Service</th>
    <th>Setup</th>
    <th>Monthly</th>
  </tr>
  <tr>
    <td>
      <h4>1 medium managed cloud instance</h4>
      6 unicorn workers<br/>
      1 nginx reverse proxy<br/>
      memcached
    </td>
    <td>$0.00</td>
    <td>$262.80</td>
  </tr>
  <tr>
    <td>
      <h4>1 medium cloud database instance</h4>
    </td>
    <td>$0.00</td>
    <td>$321.20</td>
  </tr>
  <tr>
    <td>
      <h4>Devops Time</h4>
      10 hours setup<br />
      2 hours maintenance
    </td>
    <td>$750.00</td>
    <td>$300.00</td>
  </tr>
  <tr class='highlighted'>
    <th>Total</th>
    <th>$750.00</th>
    <th>$884.00</th>
  </tr>
  <tr class='highlighted'>
    <th>First Year</th>
    <th colspan='2'>$11358.00</th>
  </tr>
</table>

RackSpace's managed cloud offerings are more expensive than AWS, but the theory is you can omit server-related maintenance (since they'll keep services running and your servers themselves operational) and that's reflected in a lowered monthly devops cost. They don't do maintenance or improvements on your application proper, however, so I built a rather modest two hours a month in for simple tasks like upgrading Rails or performing minor server optimizations. You can once again probably ignore the monthly devops cost if you like, but that won't have nearly the impact on the final price that it did for AWS, with a new monthly of $584.00 and a final year total of $7758.00.

### BlueBox

<table>
  <tr>
    <th style='width: 72%;'>Service</th>
    <th>Setup</th>
    <th>Monthly</th>
  </tr>
  <tr>
    <td>
      <h4>1 4GB cloud instance</h4>
      6 unicorn workers<br/>
      1 nginx reverse proxy<br/>
      memcached
    </td>
    <td>$0.00</td>
    <td>$385.00</td>
  </tr>
  <tr>
    <td>
      <h4>1 4GB cloud database instance</h4>
    </td>
    <td>$0.00</td>
    <td>$385.00</td>
  </tr>
  <tr>
    <td>
      <h4>Devops Time</h4>
      0 hours setup<br />
      0 hours maintenance
    </td>
    <td>$0.00</td>
    <td>$0.00</td>
  </tr>
  <tr class='highlighted'>
    <th>Total</th>
    <th>$0.00</th>
    <th>$770.00</th>
  </tr>
  <tr class='highlighted'>
    <th>First Year</th>
    <th colspan='2'>$9240.00</th>
  </tr>
</table>

BlueBox's claim to fame is that they perform server, application, and database setup, maintenance, and integration. Thus the need for a devops engineer is completely obviated (as reflected in the final totals). Obviously this price point is extremely attractive if you'd otherwise have to pay a server administrator and engineer, but if you have one on staff already then BlueBox's product is easily the most expensive. You're paying for their expertise much more than their hardware.

### Heroku

<table>
  <tr>
    <th style='width: 72%;'>Service</th>
    <th>Setup</th>
    <th>Monthly</th>
  </tr>
  <tr>
    <td>
      <h4>4 dynos</h4>
      12 unicorn workers<br/>
    </td>
    <td>$0.00</td>
    <td>$143.00</td>
  </tr>
  <tr>
    <td>
      <h4>memcached addon (500 MB)</h4>
    </td>
    <td>$0.00</td>
    <td>$40.00</td>
  </tr>
  <tr>
    <td><h4>Fugu database instance</h4></td>
    <td>$0.00</td>
    <td>$400.00</td>
  </tr>
  <tr>
    <td>
      <h4>Devops Time</h4>
      2 hours setup<br />
      0 hours maintenance
    </td>
    <td>$300.00</td>
    <td>$0.00</td>
  </tr>
    <tr class='highlighted'>
    <th>Total</th>
    <th>$300.00</th>
    <th>$583.00</th>
  </tr>
  <tr class='highlighted'>
    <th>First Year</th>
    <th colspan='2'>$7296.00</th>
  </tr>
</table>

I'm always somewhat mystified by Heroku's pricing -- their database offerings are incredibly expensive, especially compared to their incredibly cheap dynos. Anyway, they provide the least expensive option for purely hosting an application, but this cheapness comes with a hidden price. Being unable to control your production environment can be a frightening proposition and exposes you to potential hidden vagaries of Heroku's internals (such as the latest flap about their routing mesh). And the fact that their addons are third-party products means that if they go down, you have no ability to expedite their repair. I would deploy a small or medium app to Heroku (which might be perfect for this theoretical application), but for a bigger one I would definitely be hesitant.

## Conclusions

I don't think any of these prices are particularly surprising. For knowledgeable server engineers, AWS is indeed a tremendous bargain. For those with little or no infrastructure knowledge, Heroku or BlueBox would be a much better choice. And keep in mind these are the hours it would take me to set up these instances; the times might not be representative of another engineer. I think they're reasonable though, and that the comparison is an interesting one to draw, even if not a tremendous revelation.