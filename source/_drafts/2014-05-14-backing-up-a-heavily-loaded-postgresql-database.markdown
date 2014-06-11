---
layout: post
title: "Backing Up a Heavily Loaded PostgreSQL Database"
date: 2014-05-14 14:34:51 -0500
comments: true
categories: [server, postgres]
---
[PostgreSQL](http://www.postgresql.org/) is the best relational database around. Fast, configurable, and extensible, it scratches pretty much every itch any database-backed application might have. A client of mine uses their postgres database in an extremely write-heavy, high-access environment. Though it has streaming replication set up, backing up this database has proved to be a consistently challenging proposition: the disks it's operating on are always under a lot of IO load, and the databases are enormously huge. so a pg_dump that pages all data into memory destroys performance.

<!-- more -->

## pg_dump

The standard method of backing up

If you're curious to learn more, the [postgres documentation on backups](http://www.postgresql.org/docs/9.3/static/backup.html) has an excellent discussion of each of these methods in-depth.
