BIN = ./node_modules/.bin

.PHONY: bootstrap start clean test;

SRC = $(shell find ./lib ./index.js ./test -type f -name '*.js')

test: lint
	@$(BIN)/karma start --single-run

test-watch:
	@$(BIN)/karma start

lint: bootstrap clean
	@$(BIN)/jsxcs $(SRC);
	@$(BIN)/jsxhint $(SRC);

release: lint
	@git checkout master
	@$(BIN)/browserify --require ./index.js --standalone Marty > dist/marty.js
	@cat dist/marty.js | $(BIN)/uglifyjs > dist/marty.min.js
	@git add dist && git commit -m "Rebuilt"
	@npm version patch
	@git push origin master && git push --tags
	@npm publish

clean:

bootstrap: package.json
	@npm install;