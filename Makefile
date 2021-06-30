install:
	npm install

publish:
	npm publish --dry-run

lint:
	npx eslint .

page-loader:
	node src/bin/pageLoader.js

test-coverage:
	npm test -- --coverage --coverageProvider=v8

test:
	DEBUG=page-loader*,axios,nock.common* npm test