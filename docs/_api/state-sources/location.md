---
layout: page
title: Location State Source
id: location-state-source
section: State Sources
---

Provides a simple way of accessing your current location.

{% sample %}
classic
=======
var Location = Marty.createStateSource({
  id: 'Location',
  type: 'location'
});

var location = Location.getLocation();

console.log(location.url, location.query.foo);
es6
===
class Location extends Marty.LocationStateSource {
}

var location = Location.getLocation();

console.log(location.url, location.query.foo);
{% endsample %}

<h2 id="get">getLocation()</h2>

Returns information about the current location:

* **url** e.g. http://foo.com/bar?baz=bam
* **path** e.g. /bar
* **hostname** e.g. foo.com
* **query** e.g. ``{ baz: 'bam' }``
* **protocol** e.g. http