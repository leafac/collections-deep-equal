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
    assert.equal(map.size).toBe(1);
    assert.equal(map.get(object)).toBe("second value wins");
    assert.equal(map.get(deepEqualObject)).toBe("second value wins");
    const otherMap = new Map(map);
    assert.equal(map.size).toBe(1);
    assert.equal(otherMap.size).toBe(1);
    otherMap.set(otherObject, "different value");
    assert.equal(map.size).toBe(1);
    assert.equal(otherMap.size).toBe(2);
    assert.equal(otherMap.get(object)).toBe("second value wins");
    assert.equal(otherMap.get(otherObject)).toBe("different value");
  })();

  (() => {
    const otherMap = new Map(map);
    assert.equal(otherMap.size).toBe(1);
    assert.equal(otherMap.delete(object)).toBe(true);
    assert.equal(otherMap.delete(object)).toBe(false);
    assert.equal(map.size).toBe(1);
    assert.equal(otherMap.size).toBe(0);
  })();

  (() => {
    assert.equal(map.get(object)).toBe(map.get(deepEqualObject));
    assert.equal(map.get(otherObject)).toBeUndefined();
  })();

  (() => {
    assert.equal(map.has(object)).toBe(true);
    assert.equal(map.has(deepEqualObject)).toBe(true);
    assert.equal(map.has(otherObject)).toBe(false);
  })();

  (() => {
    const otherMap = new Map(map);
    assert.equal(otherMap.set(object, "new value")).toBe(otherMap);
    assert.equal(otherMap.size).toBe(1);
    assert.equal(otherMap.get(deepEqualObject)).toBe("new value");
    assert.equal(otherMap.set(otherObject, "new key")).toBe(otherMap);
    assert.equal(otherMap.size).toBe(2);
    assert.equal(otherMap.get(deepEqualOtherObject)).toBe("new key");
  })();

  describe("merge()", () => {
    (() => {
      const otherMap = new Map(map);
      const anotherMap = new Map([[otherObject, "value to be merged"]]);
      assert.equal(otherMap.merge(anotherMap)).toBe(otherMap);
      assert
        .equal(
          util.isDeepStrictEqual(
            otherMap,
            new Map([
              [object, "second value wins"],
              [otherObject, "value to be merged"],
            ])
          )
        )
        .toBe(true);
    })();

    (() => {
      const map = new Map([[object, new Set([1])]]);
      const otherMap = new Map([[deepEqualObject, new Set([2])]]);
      assert
        .equal(
          util.isDeepStrictEqual(
            map.merge(otherMap),
            new Map([[object, new Set([1, 2])]])
          )
        )
        .toBe(true);
    })();

    (() => {
      const map = new Map([[object, 1]]);
      const otherMap = new Map([[deepEqualObject, 2]]);
      assert
        .equal(() => {
          map.merge(otherMap);
        })
        .toThrowErrorMatchingInlineSnapshot(
          `"Merge conflict: Key: {\\"name\\":\\"Leandro\\",\\"age\\":29} This Value: 1 Other Value: 2"`
        );
    })();
  });

  (() => {
    assert
      .equal(JSON.stringify(map))
      .toMatchInlineSnapshot(
        `"[[{\\"name\\":\\"Leandro\\",\\"age\\":29},\\"second value wins\\"]]"`
      );
  })();

  (() => {
    const object = { name: "Leandro", age: 29 };
    const deepEqualObject = { name: "Leandro", age: 29 };
    const map = new Map([[object, "a value"]]);
    assert.equal(map.get(deepEqualObject)).toBe("a value");
    object.age = 30;
    assert.equal(map.get(object)).toBe("a value");
    assert.equal(map.get(deepEqualObject)).toBeUndefined();
    deepEqualObject.age = 30;
    assert.equal(map.get(object)).toBe("a value");
    assert.equal(map.get(deepEqualObject)).toBe("a value");
  })();

  const set = new Set([object, deepEqualObject]);
  (() => {
    assert.equal(set.size).toBe(1);
    const otherSet = new Set(set);
    assert.equal(set.size).toBe(1);
    assert.equal(otherSet.size).toBe(1);
    otherSet.add(otherObject);
    assert.equal(set.size).toBe(1);
    assert.equal(otherSet.size).toBe(2);
  })();

  (() => {
    const otherSet = new Set(set);
    assert.equal(otherSet.add(object)).toBe(otherSet);
    assert.equal(otherSet.size).toBe(1);
    assert.equal(otherSet.add(otherObject)).toBe(otherSet);
    assert.equal(otherSet.size).toBe(2);
  })();

  (() => {
    const otherSet = new Set(set);
    assert.equal(otherSet.size).toBe(1);
    assert.equal(otherSet.delete(object)).toBe(true);
    assert.equal(otherSet.delete(object)).toBe(false);
    assert.equal(set.size).toBe(1);
    assert.equal(otherSet.size).toBe(0);
  })();

  (() => {
    assert.equal(set.has(object)).toBe(true);
    assert.equal(set.has(deepEqualObject)).toBe(true);
    assert.equal(set.has(otherObject)).toBe(false);
  })();

  (() => {
    const otherSet = new Set(set);
    assert
      .equal(otherSet.merge(new Set([deepEqualObject, otherObject])))
      .toBe(otherSet);
    assert
      .equal(
        util.isDeepStrictEqual(
          otherSet,
          new Set([object, deepEqualOtherObject])
        )
      )
      .toBe(true);
  })();

  (() => {
    assert
      .equal(JSON.stringify(set))
      .toMatchInlineSnapshot(`"[{\\"name\\":\\"Leandro\\",\\"age\\":29}]"`);
  })();

  (() => {
    const object = { name: "Leandro", age: 29 };
    const deepEqualObject = { name: "Leandro", age: 29 };
    const set = new Set([object]);
    assert.equal(set.has(deepEqualObject)).toBe(true);
    object.age = 30;
    assert.equal(set.has(object)).toBe(true);
    assert.equal(set.has(deepEqualObject)).toBe(false);
    deepEqualObject.age = 30;
    assert.equal(set.has(object)).toBe(true);
    assert.equal(set.has(deepEqualObject)).toBe(true);
  })();
}
