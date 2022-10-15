<h1 align="center">Collections Deep Equal</h1>
<h3 align="center">Collections like JavaScript’s native Maps and Sets, but using value equality (<a href="https://nodejs.org/api/util.html#util_util_isdeepstrictequal_val1_val2"><code>util.isDeepStrictEqual()</code></a>) instead of reference equality</h3>
<p align="center">
<a href="https://github.com/leafac/collections-deep-equal"><img alt="Source" src="https://img.shields.io/badge/Source---"></a>
<a href="https://www.npmjs.com/package/collections-deep-equal"><img alt="Package" src="https://badge.fury.io/js/collections-deep-equal.svg"></a>
<a href="https://github.com/leafac/collections-deep-equal/actions"><img alt="Continuous Integration" src="https://github.com/leafac/collections-deep-equal/workflows/.github/workflows/main.yml/badge.svg"></a>
</p>

## Problem

Native JavaScript [Maps](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) and [Sets](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) use a notion of equality in which an object is considered equal to itself but not to another object with the same keys and values:

```js
const object = { name: "Leandro", age: 29 };
const deepEqualObject = { name: "Leandro", age: 29 };
assert(object === object);
assert(object !== deepEqualObject);
assert.deepEqual(object, deepEqualObject);

const map = new Map();
map.set(object, "value");
assert(map.get(object) === "value");
assert(map.get(deepEqualObject) === undefined); // Sometimes you wish this to be "value"

const set = new Set();
set.add(object);
assert(set.has(object));
assert(!set.has(deepEqualObject)); // Sometimes you wish this to hold
```

One the one hand, this is good, because `object` and `deepEqualObject` are **not** the same object. We may, for example, modify `object` such that `deepEqualObject` would no longer be deep equal to it:

```js
object.age = 30;
assert.notDeepEqual(object, deepEqualObject);
assert(object.age === 30);
assert(deepEqualObject.age === 29);
```

On the other hand, this is annoying, because you may know that you’re never mutating objects like that, and yet JavaScript doesn’t give you a way to customize the notion of equality used by Maps and Sets.

## Solution

**Collections Deep Equal** provides Maps and Sets which have the same API as native Maps and Sets, except that their notion of equality is [`util.isDeepStrictEqual()`](https://nodejs.org/api/util.html#util_util_isdeepstrictequal_val1_val2):

```js
import { Map, Set } from "collections-deep-equal";

const object = { name: "Leandro", age: 29 };
const deepEqualObject = { name: "Leandro", age: 29 };

const map = new Map();
assert(map.get(deepEqualObject) === "value");

const set = new Set();
assert(set.has(deepEqualObject));
```

## Installation

Install with `npm`:

```console
$ npm install collections-deep-equal
```

The package comes with type definitions for [TypeScript](https://www.typescriptlang.org).

If you wish to use only **Collections Deep Equal** and not native Maps and Sets, import the library:

```js
import { Map, Set } from "collections-deep-equal";
```

If you wish to use both **Collections Deep Equal** as well as native Maps and Sets in the same module, rename on import:

```js
import {
  Map as MapDeepEqual,
  Set as SetDeepEqual,
} from "collections-deep-equal";
```

## Caveats

### Performance

**Collections Deep Equal** hasn’t been benchmarked, but it should be orders of magnitude slower than the native collections, because for every access it iterates over all keys and calls `deepEqual()` on them. It’s a straightforward, if naive, implementation.

### Mutation

If you mutate objects, then the collections using them change as well:

```js
const object = { name: "Leandro", age: 29 };
const deepEqualObject = { name: "Leandro", age: 29 };

const map = new Map();
map.set(object, "value");
object.age = 30;
assert(!map.has(deepEqualObject));
deepEqualObject.age = 30;
assert(map.has(deepEqualObject));
```

## Additional Features

### `merge()`

```js
assert.deepEqual(
  new Map([
    ["a", new Set([1])],
    ["b", new Set([2])],
  ]).merge(
    new Map([
      ["b", new Set([3])],
      ["c", new Set([4])],
    ])
  ),
  new Map([
    ["a", new Set([1])],
    ["b", new Set([2, 3])],
    ["c", new Set([4])],
  ])
);

assert.deepEqual(new Set([1]).merge(new Set([2])), new Set([1, 2]));
```

### `toJSON()`

```js
assert(JSON.stringify(new Map([["a", 1]])) === `[["a",1]]`);
assert(JSON.stringify(new Set([1, 2])) === `[1,2]`);
```

## Related Work

### People Discussing the Issue

- https://2ality.com/2015/01/es6-maps-sets.html#why-can’t-i-configure-how-maps-and-sets-compare-keys-and-values%3F
- https://stackoverflow.com/questions/21838436/map-using-tuples-or-objects
- https://esdiscuss.org/topic/maps-with-object-keys
- https://medium.com/@modernserf/the-tyranny-of-triple-equals-de46cc0c5723

### Other Libraries That Implementation Alternative Collections

- https://immutable-js.github.io/immutable-js/
- http://swannodette.github.io/mori/
- https://www.npmjs.com/package/typescript-collections
- https://www.npmjs.com/package/prelude-ts
- https://www.npmjs.com/package/collectable
- https://www.collectionsjs.com

The advantages of **Collections Deep Equal** over these libraries are:

1. You don’t have to buy into completely new data structures like Immutable.js’s Records. These other data structures may have different APIs and therefore have a bit of a learning curve; they may be more difficult to inspect in debuggers; they may not work well with other libraries, forcing you to convert back and forth; and they may annoying to use in TypeScript.

2. The notion of equality is determined by the data structures, not by the elements. In most of these libraries, elements are forced to implement `equals()` and `hash()`, which makes sense in a object-oriented style, but not in a functional style.

3. Immutability is possible and encouraged, but not enforced. For better and for worse.

4. **Collections Deep Equal** is [so simple](source/index.ts) that you could maintain it yourself if it’s abandoned, like some of the packages above seem to have been. But don’t worry, **Collections Deep Equal** is being used in [my dissertation](https://github.com/leafac/yocto-cfa), so it’ll stick around.

### Other Approaches to Immutability

- https://immerjs.github.io/immer/docs/introduction
- https://www.npmjs.com/package/seamless-immutable
- https://www.npmjs.com/package/icepick
- https://www.npmjs.com/package/deep-freeze

These libraries don’t provide new data structures. They’re just facilitating the use of immutable data structures, which may pave the way to a new notion of equality.

### Very Similar But Incomplete Approaches

- https://www.npmjs.com/package/es6-array-map
- https://www.npmjs.com/package/valuecollection
- https://www.npmjs.com/package/@strong-roots-capital/map-objects

These libraries are very similar to **Collections Deep Equal** in spirit, but their implementations are either incomplete, or they lack type definitions, and so forth.

### Definitive Solutions

- https://github.com/tc39/proposal-record-tuple
- https://github.com/sebmarkbage/ecmascript-immutable-data-structures
- https://github.com/DavidBruant/Map-Set.prototype.toJSON

Proposals to change the JavaScript language in ways that would make this package obsolete.

## Changelog

### 3.0.1 · 2022-10-15

- Hotfix of 3.0.0 release, which didn’t include the `build/` files 🤦‍♂️

### 3.0.0 · 2022-10-15

- Modernized the codebase & turned it into an [ESM-only package](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).

### 2.0.0 · 2020-06-26

- The names of the exports are now `Map` and `Set`, with the intent of overriding the native implementation on import.

### 1.1.0 · 2020-03-24

- Use [`util.isDeepStrictEqual()`](https://nodejs.org/api/util.html#util_util_isdeepstrictequal_val1_val2) instead of [`deep-equal`](https://www.npmjs.com/package/deep-equal).

### 1.0.1 · 2020-03-23

- Better `README` formatting.

### 1.0.0 · 2020-03-04

- Initial release with `MapDeepEqual` and `SetDeepEqual`.
