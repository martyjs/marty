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
  RECEIVE_USERS: 'RECEIVE_USERS',
  RECEIVE_USERS_STARTING: 'RECEIVE_USERS_STARTING',
  RECEIVE_USERS_DONE: 'RECEIVE_USERS_DONE',
  RECEIVE_USERS_FAILED: 'RECEIVE_USERS_FAILED',
  DELETE_USER: 'DELETE_USER',
  DELETE_USER_STARTING: 'DELETE_USER_STARTING',
  DELETE_USER_DONE: 'DELETE_USER_DONE',
  DELETE_USER_FAILED: 'DELETE_USER_FAILED',
}
{% endhighlight %}


<h2 id="createConstantsObj">Marty.createConstants(<i>Object</i>)</h2>

{% highlight js %}
var Constants = Marty.createConstants({
  Users: ['RECEIVE_USERS', 'DELETE_USER'],
  Foos: {
    Bars: ['ADD_BAR']
  }
});

//returns
{
  Users: {
    RECEIVE_USERS: 'RECEIVE_USERS',
    RECEIVE_USERS_STARTING: 'RECEIVE_USERS_STARTING',
    RECEIVE_USERS_DONE: 'RECEIVE_USERS_DONE',
    RECEIVE_USERS_FAILED: 'RECEIVE_USERS_FAILED',
    DELETE_USER: 'DELETE_USER',
    DELETE_USER_STARTING: 'DELETE_USER_STARTING',
    DELETE_USER_DONE: 'DELETE_USER_DONE',
    DELETE_USER_FAILED: 'DELETE_USER_FAILED',
  },
  Foos: {
    Bars: {
      ADD_BAR: 'ADD_BAR',
      ADD_BAR_STARTING: 'ADD_BAR_STARTING',
      ADD_BAR_DONE: 'ADD_BAR_DONE',
      ADD_BAR_FAILED: 'ADD_BAR_FAILED',
    }
  }
}
{% endhighlight %}
