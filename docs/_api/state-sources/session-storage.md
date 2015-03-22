---
layout: page
title: Session Storage State Source
id: state-source-session
section: State Sources
---

Provides a simple way of storing state in session storage.

{% sample %}
classic
=======
var FooStorage = Marty.createStateSource({
  id: 'FooStorage',
  namespace: 'foos',
  type: 'sessionStorage',
  saveFoo: function (foo) {
    this.set('bar', foo);
  },
  getFoo: function (id) {
    return this.get(id);
  }
});

es6
===
class FooStorage extends Marty.SessionStorageStateSource {
  constructor(options) {
    super(options);
    this.namespace = 'foos';
  }
  saveFoo(foo) {
    this.set('bar', foo);
  }
  getFoo(id) {
    return this.get(id);
  }
}
{% endsample %}

<h2 id="namespace">namespace</h2>

An (optional) prefix for keys.

<h2 id="get">get(key)</h2>

Gets the item in the storage with the given key. If the item exists, it will deserialize it.

<h2 id="set">set(key, obj)</h2>

Serializes the object to a JSON string before and then inserts into the storage with the given key.