---
layout: page
title: Automatically register dependencies
id: automatically-register-dependencies
section: Application
---

It's easy to forget to register a type in the application after you create it. Fortunately if you're using [webpack](http://webpack.github.io/) or [browserify](http://browserify.org) we can automate the registration process.

<h2 id="browserify">browserify</h2>

You first need to install [bulk-require](https://github.com/substack/bulk-require) and the [bulkify](https://github.com/substack/bulkify) transformation (Don't forget to add the transform to your browserify config).

{% highlight bash %}
npm install --save-dev bulk-require bulkify
{% endhighlight %}

Then all you need to do is call `bulk-require` from within your application

{% highlight js %}
var bulk = require('bulk-require');

class Application extends Marty.Application {
  constructor(options) {
    super(options);

    let dependencies = bulk(__dirname, [
      'stores/*.js',
      'actions/*.js',
      'queries/*.js',
      'sources/*.js'
    ]);

    dependencies.forEach((dep) => this.register(dep));
}
{% endhighlight %}

<h2 id="webpack">webpack</h2>

Thanks to [webpack's dynamic require](http://webpack.github.io/docs/context.html) you don't need to install any dependencies. You just need to do this:

{% highlight js %}
// Dynamically require in everything within the 'actions', 'queries', 'sources' and 'stores' folders
var context = require.context("./", true, /(actions|queries|sources|stores)/);

class Application extends Marty.Application {
  constructor(options) {
    super(options);

    // Iterate through all the JS files in those folders
    context.keys().forEach((key) =>  {
      if (!/\.js/.test(key)) {
        // Generate an Id based on directory structure.
        var id = key.replace('./', '').replace(/\//g, '.');

        this.register(id, context(key));
      }
    });
  }
}

module.exports = Application;
{% endhighlight %}
