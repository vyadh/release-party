# CachingAsyncIterable

A utility class that wraps an `AsyncGenerator` or `AsyncIterator` to allow multiple iterations over the same data source, caching values as they are consumed.

## Overview

The `CachingAsyncIterable` class solves a common problem with async generators and iterators: they can only be iterated once. This class allows you to iterate multiple times, with each iteration potentially consuming a different number of values. Values are cached in memory as they are fetched from the underlying generator.

## Features

- **Multiple iterations**: Iterate over the same source multiple times
- **Partial iterations**: Each iteration can consume as many or as few values as needed
- **Lazy fetching**: New values are only fetched from the source when needed
- **Memory efficient**: Only caches values that have been consumed
- **Type-safe**: Full TypeScript support with generics

## Usage

### Basic Example

```typescript
import { CachingAsyncIterable } from './src/caching-async-iterable'

async function* generateNumbers() {
  for (let i = 0; i < 10; i++) {
    yield i
  }
}

const caching = new CachingAsyncIterable(generateNumbers())

// First iteration - fetch some values
for await (const num of caching) {
  console.log(num) // 0, 1, 2, 3, 4
  if (num >= 4) break
}

// Second iteration - gets cached values + more if needed
for await (const num of caching) {
  console.log(num) // 0, 1, 2, 3, 4, 5, 6
  if (num >= 6) break
}

// Third iteration - uses cached values (no new fetches)
for await (const num of caching) {
  console.log(num) // 0, 1, 2, 3, 4, 5, 6
  if (num >= 6) break
}
```

## Implementation Notes

- The cache grows as more values are consumed; it never shrinks
- Once the source is exhausted, all subsequent iterations only use cached values
- Multiple concurrent iterations are supported and share the same cache
- Each iteration is independent and maintains its own position
- The underlying source is consumed lazily, only fetching values when needed
