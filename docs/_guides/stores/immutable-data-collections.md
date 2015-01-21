---
layout: page
title: Immutable data collections
id: immutable-data-collections
section: Stores
---

Within a Flux application you want the stores to be the **only** place you can change state. This can be very difficult to achieve using the in built Javascript collections since they are mutable. This can make it very difficult to debug issues since any piece of code that touches that collection could be the cause.

The solution this is to use immutable data collections like [immutable.js](http://facebook.github.io/immutable-js/) or [mori](http://swannodette.github.io/mori/). Operations on immutable data structures do not mutate the instance itself but rather return a new instance with is the result of the mutation.

{% highlight js %}
var users = Immutable.List.of("foo");
var users2 = users.push("bar");

console.log(users) // ["foo"]
console.log(users2) // ["foo", "bar"]
{% endhighlight %}

Using immutable data collections help you sleep soundly with knowledge that nothing outside of stores will be able to change its state.

While immutable data collections are not required, we try to make it as easy to use as possible. For example, you can simple call this.state with the mutated collection and internally it will check if the collection has changed and handle notifying and listeners.

{% highlight js %}
var UsersStore = Marty.createStore({
  handlers: {
    addUser: Constants.RECEIVE_USER
  },
  getInitialState: function () {
    return Immutable.List();
  },
  addUser: function (user) {
    this.state = this.state.push(user);
  }
});
{% endhighlight %}
