---
layout: docs
title: HTTP API
description: How you can use Marty to talk to the server
id: http-api
group: docs
header_colour: D9544D
order: 5
---

{% highlight js %}
var UsersAPI = Marty.createHttpAPI({
  baseUrl: 'http://foo.com'
  getAll: function (users) {
    this.get('/users').end(function (res) {
      UserActionCreators.receiveAll(res.json);
    });
  }
});
{% endhighlight %}