# Collections Deep Equal

**Collections like JavaScript’s native Maps and Sets, but using value equality (deep-equal) instead of reference equality**

[**Source**](https://github.com/leafac/collections-deep-equal) • [**Package**](https://www.npmjs.com/package/collections-deep-equal) • ![.github/workflows/main.yml](https://github.com/leafac/collections-deep-equal/workflows/.github/workflows/main.yml/badge.svg)

# Problem

[Maps](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) and [Sets](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) in JavaScript use a notion of equality in an object is considered equal to itself, but not to another object with the exact same keys and values:

```js
const object = { name: "Leandro", age: 29 };
const deepEqualObject = { name: "Leandro", age: 29 };
assert(object === object);
assert(object !== deepEqualObject);
assert.deepEqual(object, deepEqualObject);

const map = new Map();
map.set(object, "value");
assert(map.get(object) === "value");
assert(map.get(deepEqualObject) === undefined);

const set = new Set();
set.add(object);
assert(set.has(object));
assert(!set.has(deepEqualObject));
```

One the one hand, this is good, because `object` and `deepEqualObject` really **aren’t** the same object. We may, for example, modify `object` and `deepEqualObject` would no longer be deep equal:

```js
object.age = 30;
assert.notDeepEqual(object, deepEqualObject);
assert(object.age === 30);
assert(deepEqualObject.age === 29);
```

On the other hand, this is annoying, because you may know that you’re never mutating objects like that, and yet JavaScript doesn’t give you a way to customize the notion of equality used by Maps and Sets.

# Solution

Collections Deep Equal provides `MapDeepEqual` and `SetDeepEqual`, which provide the same API as JavaScript’s native Maps and Sets, except that the notion of equality is [`deep-equal`](https://www.npmjs.com/package/deep-equal):

```js
import { MapDeepEqual, SetDeepEqual } from "collections-deep-equal";

const object = { name: "Leandro", age: 29 };
const deepEqualObject = { name: "Leandro", age: 29 };

const mapDeepEqual = new MapDeepEqual();
mapDeepEqual.set(object, "value");
assert(mapDeepEqual.get(object) === "value");
assert(mapDeepEqual.get(deepEqualObject) === "value");

const setDeepEqual = new SetDeepEqual();
setDeepEqual.add(object);
assert(setDeepEqual.has(object));
assert(setDeepEqual.has(deepEqualObject));
```

# Installation and Usage

Install with `npm`:

```console
$ npm install collections-deep-equal
```

The package comes with type definitions for [TypeScript](https://www.typescriptlang.org).

If you wish to replace JavaScript’s Maps and Sets seamlessly, rename on import:

```js
import {
  MapDeepEqual as Map,
  SetDeepEqual as Set
} from "collections-deep-equal";
```

# Caveats

## Performance

Collections Deep Equal hasn’t been benchmarked , but it probably is orders of magnitude slower than the native collections, because for every access it iterates over all keys calling `deepEqual()`. It’s a straightforward, if naive, implementation.

# Mutation

If you mutate objects, then the collections using them change as well:

```js
const object = { name: "Leandro", age: 29 };
const deepEqualObject = { name: "Leandro", age: 29 };

const mapDeepEqual = new MapDeepEqual();
mapDeepEqual.set(object, "value");
object.age = 30;
assert(!map.has(deepEqualObject));
deepEqualObject.age = 30;
assert(map.has(deepEqualObject));
```

# Additional Features

## `merge()`

```js
assert.deepEqual(
  new MapDeepEqual([
    ["a", new SetDeepEqual([1])],
    ["b", new SetDeepEqual([2])]
  ]).merge(
    new MapDeepEqual([
      ["b", new SetDeepEqual([3])],
      ["c", new SetDeepEqual([4])]
    ])
  ),
  new MapDeepEqual([
    ["a", new SetDeepEqual([1])],
    ["b", new SetDeepEqual([2, 3])],
    ["c", new SetDeepEqual([4])]
  ])
);
```

## `toJSON()`

```js
assert(JSON.stringify(new MapDeepEqual([["a", 1]])) === `[["a", 1]]`);
assert(JSON.stringify(new SetDeepEqual([1, 2])) === `[1, 2]`);
```

# Related Work

## People Discussing the Issue

- https://2ality.com/2015/01/es6-maps-sets.html#why-can’t-i-configure-how-maps-and-sets-compare-keys-and-values%3F
- https://stackoverflow.com/questions/21838436/map-using-tuples-or-objects
- https://esdiscuss.org/topic/maps-with-object-keys
- https://medium.com/@modernserf/the-tyranny-of-triple-equals-de46cc0c5723

## Other Libraries That Implementation Alternative Collections

- https://immutable-js.github.io/immutable-js/
- https://github.com/swannodette/mori
- https://www.npmjs.com/package/typescript-collections
- https://github.com/emmanueltouzery/prelude-ts
- https://github.com/frptools/collectable
- https://www.collectionsjs.com

The advantages of Collections Deep Equal over these libraries are:

1. You don’t have to buy into completely new data structures like Immutable.js’s Records. These other data structures may be more difficult to inspect in debuggers; they may not work well with other libraries, forcing you to convert back and forth; and they may annoying to type in TypeScript.

2. The notion of equality is determined by the data structures, not by the elements. In most of these libraries, elements are forced to implement `equals()` and `hash()`, which makes sense in a object-oriented style, but not in a functional style.

3. Immutability is possible and encouraged, but not enforced. For better and for worse.

## Other Approaches to Immutability

- https://github.com/immerjs/immer
- https://github.com/rtfeldman/seamless-immutable
- https://github.com/aearly/icepick
- https://github.com/substack/deep-freeze

These libraries don’t provide new data structures. They’re just facilitating the use of immutable data structures, which may pave the way to a new notion of equality.

## Very Similar Approaches

- https://github.com/Jamesernator/es6-array-map
- https://github.com/alastairpatrick/valuecollection
- https://www.npmjs.com/package/@strong-roots-capital/map-objects

These libraries are very similar to Collections Deep Equal in spirit, but their implementations are either incomplete, or they lack type definitions, and so forth.

## Definitive Solutions

- https://github.com/tc39/proposal-record-tuple
- https://github.com/sebmarkbage/ecmascript-immutable-data-structures
- https://github.com/DavidBruant/Map-Set.prototype.toJSON

Proposals to change the JavaScript language in ways that would make this package obsolete.
