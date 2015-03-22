---
layout: page
title: Cookie State Source
id: cookie-source-json
section: State Sources
---

Provides a simple way of accessing your cookies. Useful when creating [isomorphic applications]({% url /guides/isomorphism/index.html %}).

{% sample %}
classic
=======
var UserCookies = Marty.createStateSource({
  id: 'UserCookies',
  type: 'cookie',
  login: function (user) {
    this.set(user.id, true)
  },
  logout: function(id) {
    this.expire(id);
  }
  isLoggedIn: function (id) {
    return !!this.get(id);
  }
});

es6
===
class UserCookies extends Marty.CookieStateSource {
  constructor(options) {
    super(options);
  }
  login(user) {
    this.set(user.id, true)
  },
  logout(id) {
    this.expire(id);
  }
  isLoggedIn(id) {
    return !!this.get(id);
  }
}
{% endsample %}

<h2 id="get">get(key)</h2>

Gets the item from the cookie the given key.

<h2 id="set">set(key, value)</h2>

Sets the value to the cookie with the given key.

<h2 id="expire">expire(key)</h2>

Removes the key from the cookie.