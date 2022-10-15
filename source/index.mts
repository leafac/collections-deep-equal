export { MapDeepEqual as Map, SetDeepEqual as Set };

import * as util from "node:util";

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
  /*
const object = { name: "Leandro", age: 29 };
const deepEqualObject = { name: "Leandro", age: 29 };
const otherObject = { name: "John", age: 35 };
const deepEqualOtherObject = { name: "John", age: 35 };

describe("MapDeepEqual", () => {
  const map = new Map([
    [object, "first value loses"],
    [deepEqualObject, "second value wins"],
  ]);

  test("new", () => {
    expect(map.size).toBe(1);
    expect(map.get(object)).toBe("second value wins");
    expect(map.get(deepEqualObject)).toBe("second value wins");
    const otherMap = new Map(map);
    expect(map.size).toBe(1);
    expect(otherMap.size).toBe(1);
    otherMap.set(otherObject, "different value");
    expect(map.size).toBe(1);
    expect(otherMap.size).toBe(2);
    expect(otherMap.get(object)).toBe("second value wins");
    expect(otherMap.get(otherObject)).toBe("different value");
  });

  test("delete()", () => {
    const otherMap = new Map(map);
    expect(otherMap.size).toBe(1);
    expect(otherMap.delete(object)).toBe(true);
    expect(otherMap.delete(object)).toBe(false);
    expect(map.size).toBe(1);
    expect(otherMap.size).toBe(0);
  });

  test("get()", () => {
    expect(map.get(object)).toBe(map.get(deepEqualObject));
    expect(map.get(otherObject)).toBeUndefined();
  });

  test("has()", () => {
    expect(map.has(object)).toBe(true);
    expect(map.has(deepEqualObject)).toBe(true);
    expect(map.has(otherObject)).toBe(false);
  });

  test("set()", () => {
    const otherMap = new Map(map);
    expect(otherMap.set(object, "new value")).toBe(otherMap);
    expect(otherMap.size).toBe(1);
    expect(otherMap.get(deepEqualObject)).toBe("new value");
    expect(otherMap.set(otherObject, "new key")).toBe(otherMap);
    expect(otherMap.size).toBe(2);
    expect(otherMap.get(deepEqualOtherObject)).toBe("new key");
  });

  describe("merge()", () => {
    test("different keys", () => {
      const otherMap = new Map(map);
      const anotherMap = new Map([[otherObject, "value to be merged"]]);
      expect(otherMap.merge(anotherMap)).toBe(otherMap);
      expect(
        util.isDeepStrictEqual(
          otherMap,
          new Map([
            [object, "second value wins"],
            [otherObject, "value to be merged"],
          ])
        )
      ).toBe(true);
    });

    test("mergeable values", () => {
      const map = new Map([[object, new Set([1])]]);
      const otherMap = new Map([[deepEqualObject, new Set([2])]]);
      expect(
        util.isDeepStrictEqual(
          map.merge(otherMap),
          new Map([[object, new Set([1, 2])]])
        )
      ).toBe(true);
    });

    test("non-mergeable values", () => {
      const map = new Map([[object, 1]]);
      const otherMap = new Map([[deepEqualObject, 2]]);
      expect(() => {
        map.merge(otherMap);
      }).toThrowErrorMatchingInlineSnapshot(
        `"Merge conflict: Key: {\\"name\\":\\"Leandro\\",\\"age\\":29} This Value: 1 Other Value: 2"`
      );
    });
  });

  test("toJSON()", () => {
    expect(JSON.stringify(map)).toMatchInlineSnapshot(
      `"[[{\\"name\\":\\"Leandro\\",\\"age\\":29},\\"second value wins\\"]]"`
    );
  });

  test("mutating a key", () => {
    const object = { name: "Leandro", age: 29 };
    const deepEqualObject = { name: "Leandro", age: 29 };
    const map = new Map([[object, "a value"]]);
    expect(map.get(deepEqualObject)).toBe("a value");
    object.age = 30;
    expect(map.get(object)).toBe("a value");
    expect(map.get(deepEqualObject)).toBeUndefined();
    deepEqualObject.age = 30;
    expect(map.get(object)).toBe("a value");
    expect(map.get(deepEqualObject)).toBe("a value");
  });
});

describe("SetDeepEqual", () => {
  const set = new Set([object, deepEqualObject]);
  test("new", () => {
    expect(set.size).toBe(1);
    const otherSet = new Set(set);
    expect(set.size).toBe(1);
    expect(otherSet.size).toBe(1);
    otherSet.add(otherObject);
    expect(set.size).toBe(1);
    expect(otherSet.size).toBe(2);
  });

  test("add()", () => {
    const otherSet = new Set(set);
    expect(otherSet.add(object)).toBe(otherSet);
    expect(otherSet.size).toBe(1);
    expect(otherSet.add(otherObject)).toBe(otherSet);
    expect(otherSet.size).toBe(2);
  });

  test("delete()", () => {
    const otherSet = new Set(set);
    expect(otherSet.size).toBe(1);
    expect(otherSet.delete(object)).toBe(true);
    expect(otherSet.delete(object)).toBe(false);
    expect(set.size).toBe(1);
    expect(otherSet.size).toBe(0);
  });

  test("has()", () => {
    expect(set.has(object)).toBe(true);
    expect(set.has(deepEqualObject)).toBe(true);
    expect(set.has(otherObject)).toBe(false);
  });

  test("merge()", () => {
    const otherSet = new Set(set);
    expect(otherSet.merge(new Set([deepEqualObject, otherObject]))).toBe(
      otherSet
    );
    expect(
      util.isDeepStrictEqual(otherSet, new Set([object, deepEqualOtherObject]))
    ).toBe(true);
  });

  test("toJSON()", () => {
    expect(JSON.stringify(set)).toMatchInlineSnapshot(
      `"[{\\"name\\":\\"Leandro\\",\\"age\\":29}]"`
    );
  });

  test("mutating an element", () => {
    const object = { name: "Leandro", age: 29 };
    const deepEqualObject = { name: "Leandro", age: 29 };
    const set = new Set([object]);
    expect(set.has(deepEqualObject)).toBe(true);
    object.age = 30;
    expect(set.has(object)).toBe(true);
    expect(set.has(deepEqualObject)).toBe(false);
    deepEqualObject.age = 30;
    expect(set.has(object)).toBe(true);
    expect(set.has(deepEqualObject)).toBe(true);
  });
});

*/
}