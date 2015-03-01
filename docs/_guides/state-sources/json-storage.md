---
layout: page
title: JSON Storage State Source
id: json-storage-state-source
section: State Sources
---

The JSON Storage State Source allows you to persist objects to [localStorage](https://developer.mozilla.org/en/docs/Web/Guide/API/DOM/Storage#localStorage) or [sessionStorage](https://developer.mozilla.org/en/docs/Web/Guide/API/DOM/Storage#sessionStorage), handling serialisation for you.

{% sample %}
classic
=======
var UserStorage = Marty.createStateSource({
  type: 'jsonStorage',
  storage: window.sessionStorage,
  saveUser: function (user) {
    this.set(user.id, user);
  },
  getUser: function (userId) {
    return this.get(userId);
  }
});

UserStorage.saveUser({id: 123, name: 'Foo'});

es6
===
class UserStorage extends Marty.JSONStorageStateSource {
  constructor(options) {
    super(options);
    this.storage = sessionStorage;
  }
  saveUser(user) {
    this.set(user.id, user);
  }
  getUser(userId) {
    return this.get(userId);
  }
}

UserStorage.saveUser({id: 123, name: 'Foo'});
{% endsample %}