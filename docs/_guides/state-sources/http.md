---
layout: page
title: HTTP State Source
id: http-state-source
section: State Sources
---

The HTTP state source makes it easy to talk to remote servers over HTTP. We use the [fetch](https://github.com/github/fetch) polyfill for making requests but you can use easily roll your own if you like.

All requests return a [promise](https://promisesaplus.com/) that allow you to easily define what happens when a request has finished.

{% sample %}
classic
=======
var UsersAPI = Marty.createStateSource({
  type: 'http',
  id: 'UsersAPI',
  baseUrl: 'http://foo.com'
  getAll: function (users) {
    return this.get('/users').then(function (res) {
      this.dispatch(UserConstants.RECIEVE_ALL, res.body);
    }.bind(this));
  },
  createUser: function (user) {
    this.post({ url: '/users', body: user }).then(function (res) {
      this.dispatch(UserConstants.RECIEVE_USER, res.body);
    }.bind(this));
  }
});

es6
===
class UsersAPI extends Marty.HttpStateSource {
  constructor(options) {
    super(options);
    this.baseUrl = 'http://foo.com';
  }
  getAll(users) {
    return this
      .get('/users')
      .then((res) => this.dispatch(UserConstants.RECIEVE_ALL, res.body));
  }
  createUser user) {
    this.post({ url: '/users', body: user })
        .then((res) => this.dispatch(UserConstants.RECIEVE_USER, res.body));
  }
}
{% endsample %}

If the request is successful then the promise resolves with a response object. If the response content type is ``application/json`` then Marty will attempt to deserialize the body which is accessible at ``res.body``.

{% sample %}
classic
=======
this.get('/foo').then(function(res) {
  console.log(res.body);
  console.log(res.headers.get('Content-Type'));
  console.log(res.headers.get('Date'));
  console.log(res.status);
  console.log(res.statusText);
})

es6
===
this.get('/foo').then((res) => {
  console.log(res.body);
  console.log(res.headers.get('Content-Type'));
  console.log(res.headers.get('Date'));
  console.log(res.status);
  console.log(res.statusText);
})
{% endsample %}