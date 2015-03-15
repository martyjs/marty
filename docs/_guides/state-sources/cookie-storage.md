---
layout: page
title: Cookie State Source
id: cookie-state-source
section: State Sources
---

The Cookie State Source allows you to read, write and delete cookies

{% sample %}
classic
=======
var FooCookies = Marty.createStateSource({
  id: 'FooCookies',
  type: 'cookie',
  saveFoo: function (foo) {
    this.set('foo', foo);
  },
  getFoo: function () {
    return this.get('foo');
  }
});

FooStorage.saveFoo('Foo');

es6
===
class FooCookies extends Marty.CookieStateSource {
  saveFoo(foo) {
    this.set('foo', foo);
  }
  getFoo() {
    return this.get('foo');
  }
}

FooStorage.saveFoo('Foo');
{% endsample %}