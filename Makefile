VERSION := $(shell node -e "console.log(require('./package.json').version)")

install:
	@echo "begin to install deps"
	@tnpm i & (cd example && tnpm i)

build:
	@npm run buid

clean:
	@rm -rf node_modules
	@rm -rf ./example/node_modules
	@rm -rf src/node_modules

publish:
	@npm run build && tnpm publish
	@git tag ${VERSION}
	@git push --tag

.PHONY: install build clean

