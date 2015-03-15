---
layout: page
title: Container API
id: api-container
section: Container
---

Responsible for knowing about all types within Marty and instantiating new instances of them.

<h2 id="register">register(class)</h2>

Registers an instance of the class.

<h2 id="get">get(type, id)</h2>

Returns the registered class with that type and Id if present.

<h2 id="getAll">getAll(type)</h2>

Returns all registered classes with that type.

<h2 id="getDefault">getDefault(type, id)</h2>

Returns the default instance of the class with that type and Id if present.

<h2 id="getAllDefaults">getAllDefaults(type)</h2>

Returns the default instances for all classes with that type.

<h2 id="resolve">resolve(type, id, [options])</h2>

Creates a new instance of the class with the given type and Id, passing in any options to the constructor.