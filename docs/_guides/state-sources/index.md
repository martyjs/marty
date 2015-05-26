---
layout: page
title: State Sources
id: state-sources
section: State Sources
---

State sources are how you get state into and out of your application. State can come from many different places (e.g. API's, Web sockets, Local Storage), State sources encapsulate a lot of complexities in connecting to these sources and provides a uniform, easy to test interface for the rest of your application to use.

{% sample %}
classic
=======
var UserAPI = Marty.createStateSource({
  type: 'http',
  baseUrl: 'http://foo.com',
  getUsers: function () {
    return this.get('/users').then(function (res) {
      if (res.ok) {
        return res.json();
      }

      throw new Error('Failed to get user', res);
    });
  },
  createUser: function (user) {
    return this.post('/users', { body: user }).then(function (res) {
      if (res.ok) {
        return res.json();
      }

      throw new Error('Failed to create user', res);
    });
  }
});
es6
===
class UserAPI extends Marty.HttpStateSource {
  constructor(options) {
    super(options);
    this.baseUrl = 'http://foo.com';
  }
  getUsers() {
    return this.get('/users').then(res => {
      if (res.ok) {
        return res.json();
      }

      throw new Error('Failed to get user', res);
    });
  }
  createUser(user) {
    return this.post('/users', { body: user }).then(res => {
      if (res.ok) {
        return res.json();
      }

      throw new Error('Failed to create user', res);
    });
  }
}
{% endsample %}

Marty comes with a number of state sources out of the box:

* [HTTP](/api/state-sources/http.html)
* [JSON storage](/api/state-sources/json-storage.html)
* [Local storage](/api/state-sources/local-storage.html)
* [Session storage](/api/state-sources/session-storage.html)
* [Location](/api/state-sources/location.html)
* [Cookie](/api/state-sources/cookie.html)
