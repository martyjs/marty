[![Build Status](https://travis-ci.org/jhollingworth/marty.svg?branch=master)](https://travis-ci.org/jhollingworth/marty)


[Marty](http://martyjs.org) helps you build web applications that follow the [Flux architecture](http://facebook.github.io/flux/docs/overview.html).

## Quick start

```
make build        # rebuild source
make test         # lint & run tests
make docs         # show documentation on http://localhost:4000
```

## Releasing

```
make release           # inc's patch, builds, creates tag, pushes to github and then publishes to npm
make release inc={inc} # specify what to version part to increment (major, premajor, minor, preminor, patch, prepatch, prerelease)
make release-docs      # builds documentation and copies into ../marty-gh-pages
```

##Browser Support

[![Sauce Test Status](https://saucelabs.com/browser-matrix/jhollingworth.svg)](https://saucelabs.com/u/jhollingworth)


## Maintainers

* [James Hollingworth](http://github.com/jhollingworth)

## License

* [MIT](https://raw.github.com/jhollingworth/marty/master/LICENSE)