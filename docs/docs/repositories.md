---
layout: docs
title: Repositories
description: Retrieving, storing and updating data either locally or remotely.
id: repositories
group: docs
header_colour: D9544D
order: 5
---

Flux dictates that state is kept in stores, however it does not specify how that state should be retrieved or persisted from outside the application. Repositories are Marty's suggested way of doing this. A repository is an abstraction on how to retrieve and persist data. The concept of a repository comes from [The Repository Pattern](http://msdn.microsoft.com/en-us/library/ff649690.aspx).

By default, Marty does not dictate what a Repository does or in what way. Several mixins are available to help you with common repository types.

{% highlight js %}
var UserRepository = Marty.createRepository({
  mixins: [httpApi({ baseUrl: "/api/users" })],
  getAll: function () {
    return this.get("/")
      .then(function (res) {
        UserActionCreators.receiveAll(res.content);
      });
  },
  createUser: function (user) {
    return this.post({ url: '/users', data: user })
      .then(function (res) {
        UserActionCreators.receiveUser(res.content);
      });
  }
});
{% endhighlight %}

<h3 id="daoVsRepository">Repository vs DAO</h3>

On the surface a repository may just sound like a DAO (Database Abstraction Object). A DAO is closer to the database and is often table-centric, whereas a repository is closer to the domain and deals with [Aggregate Roots](http://stackoverflow.com/questions/1958621/whats-an-aggregate-root). A repository could be implemented using DAOs, but you would never do the opposite.

<h2 id="api">API</h2>

<h3 id="createRepository">createRepository(props)</h3>

To create a new repository, you call <code>Marty.createRepository</code> passing in a set of properties. It returns your repository as a singleton.

{% highlight js %}
var UserRepository = Marty.createRepository({
  createUser: function (user) {
    return $.get("/users");
  }
});
{% endhighlight %}

<h3 id="mixins">mixins</h3>

An (optional) array of mixins that can be passed in through the createRepository method.

<h3 id="name">name</h3>

An (optional) display name for the repository. Used for richer debugging.

<h3 id="type">type</h3>

An (optional) type for the repository (e.g. 'http'). Used for richer debugging.