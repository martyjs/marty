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


<h2 id="hooks">Hooks</h2>

Hooks allows you to make changes to requests before they are sent and as well as when responses are received. This can be useful when you want to do things like automatically converting all JSON responses to immutable objects.

Hooks are object literals which have 3 optional keys: ``before``, ``after`` and ``priority``. If ``before`` is present then it will be called with the request as its argument. If ``after`` is present then it will be called after the response is recieved with the response as its argument. Setting a priority allows you to alter in what order the hook is executed (The smaller the number, the earlier it will be executed).


{% highlight js %}
var Marty = require('marty');

Marty.HttpStateSource.addHook({
  priority: 1,
  before: function (req) {
    req.headers['Foo'] = 'bar';
  },
  after: function (res) {
    return res.json();
  }
});
{% endhighlight %}