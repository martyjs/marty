BIN = ./node_modules/.bin

.PHONY: bootstrap start clean test;

SRC = $(shell find ./lib ./index.js ./test -type f -name '*.js')

test: lint
	@$(BIN)/karma start --single-run

test-watch: lint
	@$(BIN)/karma start

lint: bootstrap clean
	@$(BIN)/jsxcs $(SRC);
	@$(BIN)/jsxhint $(SRC);

release: build
	@git add dist && git commit -m "Rebuilt"
	@npm version patch
	@git push origin master && git push --tags
	@npm publish

build: lint
	@$(BIN)/browserify --require ./index.js --exclude lodash --standalone Marty > dist/marty.js
	@cat dist/marty.js | $(BIN)/uglifyjs > dist/marty.min.js

clean:

bootstrap: package.json
	@npm install;