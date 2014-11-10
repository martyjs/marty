---
layout: docs
title: Action Creators
id: action-creators
group: docs
header_colour: D65D28
order: 3
---

{% highlight js %}
var UserActionCreators = Marty.createActionCreators({
  receiveAll: function (users) {
    this.dispatch(Constants.RECEIVE_USERS, users);
  }
});
{% endhighlight %}

##Server actions

Avoid cyclical dependencies.