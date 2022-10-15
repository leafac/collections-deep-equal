import util from "node:util";
import assert from "node:assert/strict";

export { MapDeepEqual as Map, SetDeepEqual as Set };

class MapDeepEqual<K, V> extends Map<K, V> {
  delete(key: K): boolean {
    return super.delete(canonicalize(this, key));
  }

  get(key: K): V | undefined {
    return super.get(canonicalize(this, key));
  }

  has(key: K): boolean {
    return super.has(canonicalize(this, key));
  }

  set(key: K, value: V): this {
    return super.set(canonicalize(this, key), value);
  }

  merge(other: MapDeepEqual<K, V>): this {
    for (const [key, otherValue] of other) {
      const thisValue = this.get(key);
      if (thisValue === undefined) this.set(key, otherValue);
      else if (typeof (thisValue as any).merge === "function")
        this.set(
          key,
          new (thisValue as any).constructor(thisValue).merge(otherValue)
        );
      else
        throw new Error(
          `Merge conflict: Key: ${JSON.stringify(
            key
          )} This Value: ${JSON.stringify(
            thisValue
          )} Other Value: ${JSON.stringify(otherValue)}`
        );
    }
    return this;
  }

  toJSON(): [K, V][] {
    return [...this];
  }
}

class SetDeepEqual<T> extends Set<T> {
  add(value: T): this {
    return super.add(canonicalize(this, value));
  }

  delete(value: T): boolean {
    return super.delete(canonicalize(this, value));
  }

  has(value: T): boolean {
    return super.has(canonicalize(this, value));
  }

  merge(other: SetDeepEqual<T>): this {
    for (const otherValue of other) this.add(otherValue);
    return this;
  }

  toJSON(): T[] {
    return [...this];
  }
}

function canonicalize<T>(
  collection: { keys(): IterableIterator<T> },
  element: T
) {
  return (
    [...collection.keys()].find((anElement) =>
      util.isDeepStrictEqual(element, anElement)
    ) ?? element
  );
}

if (process.env.TEST === "collections-deep-equal") {
  const Map = MapDeepEqual;
  const Set = SetDeepEqual;

  const object = { name: "Leandro", age: 29 };
  const deepEqualObject = { name: "Leandro", age: 29 };
  const otherObject = { name: "John", age: 35 };
  const deepEqualOtherObject = { name: "John", age: 35 };

  const map = new Map([
    [object, "first value loses"],
    [deepEqualObject, "second value wins"],
  ]);

  (() => {
    assert.equal(map.size, 1);
    assert.equal(map.get(object), "second value wins");
    assert.equal(map.get(deepEqualObject), "second value wins");
    const otherMap = new Map(map);
    assert.equal(map.size, 1);
    assert.equal(otherMap.size, 1);
    otherMap.set(otherObject, "different value");
    assert.equal(map.size, 1);
    assert.equal(otherMap.size, 2);
    assert.equal(otherMap.get(object), "second value wins");
    assert.equal(otherMap.get(otherObject), "different value");
  })();

  (() => {
    const otherMap = new Map(map);
    assert.equal(otherMap.size, 1);
    assert.equal(otherMap.delete(object), true);
    assert.equal(otherMap.delete(object), false);
    assert.equal(map.size, 1);
    assert.equal(otherMap.size, 0);
  })();

  (() => {
    assert.equal(map.get(object), map.get(deepEqualObject));
    assert.equal(map.get(otherObject), undefined);
  })();

  (() => {
    assert.equal(map.has(object), true);
    assert.equal(map.has(deepEqualObject), true);
    assert.equal(map.has(otherObject), false);
  })();

  (() => {
    const otherMap = new Map(map);
    assert.equal(otherMap.set(object, "new value"), otherMap);
    assert.equal(otherMap.size, 1);
    assert.equal(otherMap.get(deepEqualObject), "new value");
    assert.equal(otherMap.set(otherObject, "new key"), otherMap);
    assert.equal(otherMap.size, 2);
    assert.equal(otherMap.get(deepEqualOtherObject), "new key");
  })();

  (() => {
    const otherMap = new Map(map);
    const anotherMap = new Map([[otherObject, "value to be merged"]]);
    assert.equal(otherMap.merge(anotherMap), otherMap);
    assert.deepEqual(
      otherMap,
      new Map([
        [object, "second value wins"],
        [otherObject, "value to be merged"],
      ])
    );
  })();

  (() => {
    const map = new Map([[object, new Set([1])]]);
    const otherMap = new Map([[deepEqualObject, new Set([2])]]);
    assert.deepEqual(map.merge(otherMap), new Map([[object, new Set([1, 2])]]));
  })();

  (() => {
    const map = new Map([[object, 1]]);
    const otherMap = new Map([[deepEqualObject, 2]]);
    try {
      map.merge(otherMap);
      assert.fail();
    } catch (error: any) {
      assert.equal(
        error.message,
        `Merge conflict: Key: {"name":"Leandro","age":29} This Value: 1 Other Value: 2`
      );
    }
  })();

  (() => {
    assert.equal(
      JSON.stringify(map),
      `[[{"name":"Leandro","age":29},"second value wins"]]`
    );
  })();

  (() => {
    const object = { name: "Leandro", age: 29 };
    const deepEqualObject = { name: "Leandro", age: 29 };
    const map = new Map([[object, "a value"]]);
    assert.equal(map.get(deepEqualObject), "a value");
    object.age = 30;
    assert.equal(map.get(object), "a value");
    assert.equal(map.get(deepEqualObject), undefined);
    deepEqualObject.age = 30;
    assert.equal(map.get(object), "a value");
    assert.equal(map.get(deepEqualObject), "a value");
  })();

  const set = new Set([object, deepEqualObject]);
  (() => {
    assert.equal(set.size, 1);
    const otherSet = new Set(set);
    assert.equal(set.size, 1);
    assert.equal(otherSet.size, 1);
    otherSet.add(otherObject);
    assert.equal(set.size, 1);
    assert.equal(otherSet.size, 2);
  })();

  (() => {
    const otherSet = new Set(set);
    assert.equal(otherSet.add(object), otherSet);
    assert.equal(otherSet.size, 1);
    assert.equal(otherSet.add(otherObject), otherSet);
    assert.equal(otherSet.size, 2);
  })();

  (() => {
    const otherSet = new Set(set);
    assert.equal(otherSet.size, 1);
    assert.equal(otherSet.delete(object), true);
    assert.equal(otherSet.delete(object), false);
    assert.equal(set.size, 1);
    assert.equal(otherSet.size, 0);
  })();

  (() => {
    assert.equal(set.has(object), true);
    assert.equal(set.has(deepEqualObject), true);
    assert.equal(set.has(otherObject), false);
  })();

  (() => {
    const otherSet = new Set(set);
    assert.deepEqual(
      otherSet.merge(new Set([deepEqualObject, otherObject])),
      otherSet
    );
    assert.deepEqual(otherSet, new Set([object, deepEqualOtherObject]));
  })();

  (() => {
    assert.equal(JSON.stringify(set), `[{"name":"Leandro","age":29}]`);
  })();

  (() => {
    const object = { name: "Leandro", age: 29 };
    const deepEqualObject = { name: "Leandro", age: 29 };
    const set = new Set([object]);
    assert.equal(set.has(deepEqualObject), true);
    object.age = 30;
    assert.equal(set.has(object), true);
    assert.equal(set.has(deepEqualObject), false);
    deepEqualObject.age = 30;
    assert.equal(set.has(object), true);
    assert.equal(set.has(deepEqualObject), true);
  })();
}
