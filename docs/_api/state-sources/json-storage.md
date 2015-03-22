---
layout: page
title: JSON Storage State Source
id: state-source-json
section: State Sources
---

Provides a simple way of storing JSON objects in local or session storage.

{% sample %}
classic
=======
var UserStorage = Marty.createStateSource({
  id: 'UserStorage',
  namespace: 'users',
  type: 'jsonStorage',
  createUser: function (user) {
    this.set(user.id, user)
  },
  getUser: function (id) {
    return this.get(id);
  }
});

es6
===
class UserStorage extends Marty.JSONStorageStateSource {
  constructor(options) {
    super(options);
    this.namespace = 'users';
  }
  createUser(user) {
    this.set(user.id, user);
  }
  getUser(id) {
    return this.get(id);
  }
}
{% endsample %}

<h2 id="storage">storage</h2>

The web storage to use, can be [localStorage](https://developer.mozilla.org/en/docs/Web/Guide/API/DOM/Storage#localStorage) or [sessionStorage](https://developer.mozilla.org/en/docs/Web/Guide/API/DOM/Storage#sessionStorage). Default is [localStorage](https://developer.mozilla.org/en/docs/Web/Guide/API/DOM/Storage#localStorage).

<h2 id="namespace">namespace</h2>

An (optional) prefix for keys.

<h2 id="get">get(key)</h2>

Gets the item in the storage with the given key. If the item exists, it will deserialize it.

<h2 id="set">set(key, obj)</h2>

Serializes the object to a JSON string before and then inserts into the storage with the given key.