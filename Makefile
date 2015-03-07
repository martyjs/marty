BIN = ./node_modules/.bin

.PHONY: bootstrap bootstrap-js bootstrap-ruby start test docs release-docs;

SRC = $(shell find ./lib ./index.js ./test -type f -name '*.js')

test: lint
	@./build/test.sh

test-watch: lint
	@./build/test-watch.sh

bootstrap: bootstrap-js bootstrap-ruby

bootstrap-js: package.json
	@npm install

bootstrap-ruby: docs/Gemfile
	@which bundle > /dev/null || gem install bundler
	@cd docs && bundle install

lint: bootstrap-js
	@$(BIN)/jsxcs $(SRC);
	@$(BIN)/jsxhint $(SRC);

release: test
	@inc=$(inc) sh ./build/release.sh

build: lint
	@mkdir -p dist
	@$(BIN)/browserify --plugin bundle-collapser/plugin --require ./index.js --standalone Marty > dist/marty.js
	@cat dist/marty.js | $(BIN)/uglifyjs -m -c "comparisons=false,keep_fargs=true,unsafe=true,unsafe_comps=true,warnings=false" -b "ascii_only=true,beautify=false" -o dist/marty.min.js
	@gzip --best dist/marty.min.js -c > dist/marty.min.js.gz

docs: bootstrap-ruby
	@cd docs && bundle exec jekyll serve -w

release-docs: bootstrap-ruby
	@cd docs && bundle exec rake release