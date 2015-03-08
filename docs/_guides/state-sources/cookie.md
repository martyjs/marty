---
layout: page
title: JSON Storage State Source
id: json-storage-state-source
section: State Sources
---

The Cookie State Source allows you to persist key/values to the cookie.

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

UserCookies.login('foo');

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

UserCookies.login('foo')
{% endsample %}