---
layout: page
title: Component
id: component
section: Component
---

<div class="alert alert-info">
If you are using ES5, we recommend you use <a href="/guides/state-mixin/index.html"><code>State mixins</code></a>
</div>


``Marty.Component`` is a base class for React components that listen to Marty Stores (It inherits from ``React.Component``). This is Marty's solution to mixins not being supported with ES6 classes.

You can listen to a store (or a number of stores) by setting ``listenTo`` to either a store or an array of stores. When the component is created or any of the stores you are listening to change, then the components state will be set to the result of ``getState()``.

{% highlight js %}
class Foo extends Marty.Component {
  constructor(props, context) {
    super(props, context);
    this.listenTo = [BarStore, BazStore];
  }
  render() {
    return (
      <div className="foo">
        <Bar bar={this.state.bar} />
        <Baz baz={this.state.baz} />
      </div>
    );
  }
  getState() {
    return {
      bar: BarStore.getBar(this.props.barId),
      baz: BazStore.getFoo(this.props.bazId)
    };
  }
}
{% endhighlight %}