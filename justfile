[group("dev")]
format:
    npm run format


[group("ci")]
build: test
    npm run build

[group("ci")]
test:
    npm run type-check
    npm run lint
    npm run test

[group("ci")]
test-workflow:
    act \
      --platform ubuntu-latest=node:24-bullseye-slim \
      --job build


[group("proxy")]
proxy-start:
    NODE_DEBUG=net,http,https,tls \
    npx proxy -p 8080

[group("proxy")]
proxy-test owner repo : build
    HTTPS_PROXY=http://localhost:8080 \
    NODE_USE_ENV_PROXY=1 \
    node dist/index.js releases {{owner}} {{repo}}
