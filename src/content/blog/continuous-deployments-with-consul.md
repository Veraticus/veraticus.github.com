---
title: "Continuous Deployments with Consul"
date: 2014-10-21 17:13:30 -0500
tags: [servers]
---
I've fallen in love with [consul](http://www.consul.io/). At first glance, it's a bit like [zookeeper](http://zookeeper.apache.org/) or [etcd](https://github.com/coreos/etcd) -- it handles service discovery, health checking, and even features a very simple k/v store. But consul does much more than merely expose a lovely DNS interface: one of its more powerful features is its ability to do cluster orchestration, efficiently and effectively propagating messages to all nodes. One of my client projects runs on a dozen servers across two applications; here's how I integrated CircleCI, chef, and consul together to make any GitHub commit run a deploy only to the targeted application, without needing to know any application server's name or IP address.


## Your servers

This setup assumes you have your servers connect to chef for both provisioning and deployment; additionally, that your servers are named at least partially after the applications they serve. (I find this to be good practice anyway -- as cute as it is to have server names themed from Teenage Mutant Ninja Turtles, in practice you just end up getting confused about what they do.) All the servers should be able to communicate together on a secure network. That's what you'll run consul on!

## consul

First, you need to [install consul](http://www.consul.io/intro/getting-started/install.html) on your servers and get them [communicating together properly](http://www.consul.io/intro/getting-started/join.html). As you can tell from my links, the consul documentation is extremely well-equipped to get you a fully functional consul cluster: just follow it and you'll be fine. Once it's all installed, you'll want to drop a watch like this in your app server's consul config directory:

```json
{
  "name": "run-deploy",
  "handler": "sudo /usr/bin/chef-client",
  "type": "event"
}
```

Note the sudo above: chef-client must be run as root, but this shouldn't be too big of a concern. Just make sure that your consul service is running as a sudoer that can execute only that one command and you'll be fine.

## CircleCI

Getting CircleCI set up properly with your GitHub repository is covered in great detail [at CircleCI's documentation](https://circleci.com/docs/configuration). Make sure your tests pass on CircleCI before you continue.

In order for this to work, CircleCI will have to be able to propagate that event to all your servers. The easiest way for it to do this is to have it SSH into one server and run the `consul event` command. From there, consul takes over to make sure all the appropriate servers receive the message. So let's create an SSH key for our CircleCI user.

```bash
ssh-keygen -t rsa -C "continuous_deployment@example.com"
```

Add the resulting private key to CircleCI and create a corresponding user on one of the central servers of your cluster. In my setup, I have three separate instances all running consul in server mode: I assigned one of them the DNS `consul.example.com` and created a user there to accept Circle's SSH key. Notably this user does not need any sort of permissions at all, so leave them off the sudoers.

## Your project

Now you need to change your circle.yml in your project, so that after a build CircleCI will initiate the deploy. This is pretty simple:

```yaml
deployment:
  production:
    branch: production
    commands:
      - ssh example@ip "consul event -node <app_name> -name run-deploy"
```

Note the `<app_name>` filter there for nodes. I find it a good practice to name a node after the application running on it; so I might have one called `app1-web` and another `app2-worker`. This is helpful for performing consul node filtering: by providing `-node <app_name>`, you're ensuring that the consul event is only propagated to servers that actually run the targeted application.

The next time you push a commit, CircleCI will automatically SSH into your server and execute that event. Your application servers with the watches on them will run `chef-client` and pull down the latest code, automatically deploying the most recent version of your application.

This is obviously a fairly simple application of consul, but I found it extremely easy to setup and drop into my existing application provisioning and deployment process. consul provides a lot of automation and power, however, and you'll find it perfect for helping to bridge the small gaps in your provisioning system.
