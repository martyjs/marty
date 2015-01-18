---
layout: page
title: Local Storage State Source
id: local-storage-state-source
section: State Sources
---

The Local Storage State Source allows you to persist data to [localStorage](https://developer.mozilla.org/en/docs/Web/Guide/API/DOM/Storage#localStorage).

{% highlight js %}
var FooStorage = Marty.createStateSource({
  type: 'localStorage',
  saveFoo: function (foo) {
    this.set('foo', foo);
  },
  getFoo: function () {
    return this.get('foo');
  }
});

FooStorage.getFoo();
{% endhighlight %}