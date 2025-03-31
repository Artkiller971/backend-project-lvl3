install:
	npm ci

publish:
	npm install --dry-run

lint:
	npx eslint .

test:
	DEBUG=page-loader,axios NODE_DEBUG=nock:* npm test