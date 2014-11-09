---
layout: docs
title: HTTP API
id: http-api
group: docs
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