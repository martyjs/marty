---
layout: page
title: HTTP State Source
id: http-state-source
section: State Sources
---

The HTTP state source makes it easy to talk to remote servers over HTTP. We use the [fetch](https://github.com/github/fetch) polyfill for making requests but you can use easily roll your own if you like.

All requests return a [promise](https://promisesaplus.com/) that allow you to easily define what happens when a request has finished.

{% highlight js %}
var UsersAPI = Marty.createStateSource({
  type: "http",
  baseUrl: 'http://foo.com'
  getAll: function (users) {
    return this.get('/users').then(function (res) {
      UserActionCreators.receiveAll(res.body);
    });
  },
  createUser: function (user) {
    this.post({ url: '/users', body: user })
        .then(function (res) {
          UserActionCreators.receiveUser(res.body);
        });
  }
});
{% endhighlight %}

If the request is successful then the promise resolves with a response object. If the response content type is ``application/json`` then Marty will attempt to deserialize the body which is accessible at ``res.body``.

{% highlight js %}
this.get('/foo').then(function(res) {
  console.log(res.body);
  console.log(res.headers.get('Content-Type'));
  console.log(res.headers.get('Date'));
  console.log(res.status);
  console.log(res.statusText);
})
{% endhighlight %}