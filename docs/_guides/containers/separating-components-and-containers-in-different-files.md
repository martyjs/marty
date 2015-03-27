---
layout: page
title: Separating Components and Containers in different files
id: separating-components-and-containers-in-different-files
section: Containers
---

NOTE: This applies to both ES6 and classic styles.

Say you have the following structure:

{% sample %}
// component.js
let React = require('react');

class User extends React.Component {
  // ...
}
module.exports = User;

// container.js
let Component = require('./component');
module.exports = Marty.createContainer(Component, {
  // ...
});
{% endsample %}

if your `Container` is doing more than the defaults, i.e., you're using some `JSX` on `done`, you will need to include `React` on that file too. It's clear if you're not using `JSX` as your code
will read something like:

{% highlight js %}
// container.js
module.exports = Marty.createContainer(Component, {
  // ...
  done(results) {
    var child1 = React.createElement('li', null, 'First Text Content');
    var child2 = React.createElement('li', null, 'Second Text Content');
    var root = React.createElement('ul', { className: 'my-list'  }, child1, child2);
    return root;
  }
  // ...
});
{% endhighlight %}

`React` is clearly a dependency there.

However, if you're using `JSX`, it might not be that clear as no `React` variable is visible.

{% highlight js %}
// container.js
module.exports = Marty.createContainer(Component, {
  // ...
  done(results) {
    return <ul className="my-list"><li>First Text Content</li><li>Second Text Content</li></ul>;
  }
  // ...
});
{% endhighlight %}

This isn't directly tied to `Marty` or `React` itself, it's just something that may happen if you're
not aware that eventually your JSX transformer will introduce that `React` variable there and your
application will fail claiming that `React` isn't defined in the current scope.
