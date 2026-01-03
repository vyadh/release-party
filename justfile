format:
    npm run format

test:
    npm run type-check
    npm run lint

build: test
    npm run build

workflow:
    act \
      --platform ubuntu-latest=node:24-bullseye-slim \
      --job build
