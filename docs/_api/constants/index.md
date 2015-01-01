---
layout: page
title: Constants API
id: api-constants
section: Constants
---

<h2 id="createConstantsArray">Marty.createConstants(<i>Array</i>)</h2>

{% highlight js %}
var Constants = Marty.createConstants([
  'RECEIVE_USERS',
  'DELETE_USER'
]);

//returns
{
  RECEIVE_USERS: function RECEIVE_USERS_CREATOR() { ... },
  DELETE_USER: function DELETE_USER_CREATOR() { ... }
}
{% endhighlight %}


<h2 id="createConstantsObj">Marty.createConstants(<i>Object</i>)</h2>

{% highlight js %}
var Constants = Marty.createConstants([
  Users: ['RECEIVE_USERS', 'DELETE_USER'],
  Foos: {
    Bars: ['ADD_BAR']
  }
]);

//returns
{
  Users: {
    RECEIVE_USERS: function RECEIVE_USERS_CREATOR() { ... },
    DELETE_USER: function DELETE_USER_CREATOR() { ... }
  },
  Foos: {
    Bars: {
      ADD_BAR: function ADD_BAR_CREATOR() { ... }
    }
  }
}
{% endhighlight %}