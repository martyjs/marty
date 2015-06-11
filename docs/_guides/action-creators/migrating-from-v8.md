---
layout: page
title: Migrating from Marty v0.8
id: migrating-action-creators-0.8
section: Action Creators
---

In Marty v0.8 and below we had a different way of defining an action creators type which has now been deprecated:

{% highlight js %}
var UserActionCreators = Marty.createActionCreators({
  updateEmail: UserConstants.UPDATE_EMAIL(function (userId, email) {
    this.dispatch(userId, email);
  }),
  deleteEmail: UserConstants.DELETE_EMAIL()
});
{% endhighlight %}

##Why was it deprecated?

There were 3 reasons:
1. Automatic error handling made debugging really difficult ([#127](https://github.com/martyjs/marty/issues/127)).
2. Automatically dispatched actions were confusing and not that helpful ([#157](https://github.com/martyjs/marty/issues/157), [#152](https://github.com/martyjs/marty/issues/152)).
3. It didn't play nicely with ES6 classes

We decided this code wasn't adding any value so we should move towards a simpler more explicit approach.

In v0.9 you will see warnings in your code to move to the new style and we will remove the code entirely in v0.10.

##How do I migrate my code to the new style?

All you need to do is move the constant to being the first argument of the dispatch function. If you utilizing auto dispatch constants then you will need to use ``marty/autoDispatch``.

{% highlight js %}
var autoDispatch = require('marty/autoDispatch');

var UserActionCreators = Marty.createActionCreators({
  updateEmail: function (userId, email) {
    this.dispatch(UserConstants.UPDATE_EMAIL, userId, email);
  }),
  deleteEmail: autoDispatch(UserConstants.DELETE_EMAIL)
});
{% endhighlight %}