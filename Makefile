BIN = ./node_modules/.bin

.PHONY: bootstrap bootstrap-js bootstrap-ruby start docs release-docs build;

SRC = $(shell find ./lib ./*.js -type f -name '*.js')
ES6_SRC = $(shell find ./lib ./marty.js -type f -name '*.js')

bootstrap: bootstrap-js bootstrap-ruby

bootstrap-js: package.json
	@npm install

bootstrap-ruby: docs/Gemfile
	@which bundle > /dev/null || gem install bundler
	@cd docs && bundle install

release:
	@inc=$(inc) sh ./build/release.sh

build:
	@mkdir -p dist
	@$(BIN)/browserify  --transform babelify --plugin bundle-collapser/plugin --require ./marty.js --exclude react --standalone Marty > dist/marty.js
	@cat dist/marty.js | $(BIN)/uglifyjs -m -c "comparisons=false,keep_fargs=true,unsafe=true,unsafe_comps=true,warnings=false" -b "ascii_only=true,beautify=false" -o dist/marty.min.js
	@gzip --best dist/marty.min.js -c > dist/marty.min.js.gz

docs:
	@cd docs && bundle exec jekyll serve -w

release-docs:
	@sh ./build/release-docs.sh

prerelease-docs:
	@sh ./build/prerelease-docs.sh
