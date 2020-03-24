import { MapDeepEqual, SetDeepEqual } from "./index";
import { isDeepStrictEqual } from "util";

const object = { name: "Leandro", age: 29 };
const deepEqualObject = { name: "Leandro", age: 29 };
const otherObject = { name: "John", age: 35 };
const deepEqualOtherObject = { name: "John", age: 35 };

describe("MapDeepEqual", () => {
  const map = new MapDeepEqual([
    [object, "first value loses"],
    [deepEqualObject, "second value wins"]
  ]);

  test("new", () => {
    expect(map.size).toBe(1);
    expect(map.get(object)).toBe("second value wins");
    expect(map.get(deepEqualObject)).toBe("second value wins");
    const otherMap = new MapDeepEqual(map);
    expect(map.size).toBe(1);
    expect(otherMap.size).toBe(1);
    otherMap.set(otherObject, "different value");
    expect(map.size).toBe(1);
    expect(otherMap.size).toBe(2);
    expect(otherMap.get(object)).toBe("second value wins");
    expect(otherMap.get(otherObject)).toBe("different value");
  });

  test("delete()", () => {
    const otherMap = new MapDeepEqual(map);
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
    const otherMap = new MapDeepEqual(map);
    expect(otherMap.set(object, "new value")).toBe(otherMap);
    expect(otherMap.size).toBe(1);
    expect(otherMap.get(deepEqualObject)).toBe("new value");
    expect(otherMap.set(otherObject, "new key")).toBe(otherMap);
    expect(otherMap.size).toBe(2);
    expect(otherMap.get(deepEqualOtherObject)).toBe("new key");
  });

  describe("merge()", () => {
    test("different keys", () => {
      const otherMap = new MapDeepEqual(map);
      const anotherMap = new MapDeepEqual([
        [otherObject, "value to be merged"]
      ]);
      expect(otherMap.merge(anotherMap)).toBe(otherMap);
      expect(
        isDeepStrictEqual(
          otherMap,
          new MapDeepEqual([
            [object, "second value wins"],
            [otherObject, "value to be merged"]
          ])
        )
      ).toBe(true);
    });

    test("mergeable values", () => {
      const map = new MapDeepEqual([[object, new SetDeepEqual([1])]]);
      const otherMap = new MapDeepEqual([
        [deepEqualObject, new SetDeepEqual([2])]
      ]);
      expect(
        isDeepStrictEqual(
          map.merge(otherMap),
          new MapDeepEqual([[object, new SetDeepEqual([1, 2])]])
        )
      ).toBe(true);
    });

    test("non-mergeable values", () => {
      const map = new MapDeepEqual([[object, new Set([1])]]);
      const otherMap = new MapDeepEqual([[deepEqualObject, new Set([2])]]);
      expect(() => {
        map.merge(otherMap);
      }).toThrowErrorMatchingInlineSnapshot(
        `"Merge conflict: {\\"name\\":\\"Leandro\\",\\"age\\":29}"`
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
    const map = new MapDeepEqual([[object, "a value"]]);
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
  const set = new SetDeepEqual([object, deepEqualObject]);
  test("new", () => {
    expect(set.size).toBe(1);
    const otherSet = new SetDeepEqual(set);
    expect(set.size).toBe(1);
    expect(otherSet.size).toBe(1);
    otherSet.add(otherObject);
    expect(set.size).toBe(1);
    expect(otherSet.size).toBe(2);
  });

  test("add()", () => {
    const otherSet = new SetDeepEqual(set);
    expect(otherSet.add(object)).toBe(otherSet);
    expect(otherSet.size).toBe(1);
    expect(otherSet.add(otherObject)).toBe(otherSet);
    expect(otherSet.size).toBe(2);
  });

  test("delete()", () => {
    const otherSet = new SetDeepEqual(set);
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
    const otherSet = new SetDeepEqual(set);
    expect(
      otherSet.merge(new SetDeepEqual([deepEqualObject, otherObject]))
    ).toBe(otherSet);
    expect(
      isDeepStrictEqual(
        otherSet,
        new SetDeepEqual([object, deepEqualOtherObject])
      )
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
    const set = new SetDeepEqual([object]);
    expect(set.has(deepEqualObject)).toBe(true);
    object.age = 30;
    expect(set.has(object)).toBe(true);
    expect(set.has(deepEqualObject)).toBe(false);
    deepEqualObject.age = 30;
    expect(set.has(object)).toBe(true);
    expect(set.has(deepEqualObject)).toBe(true);
  });
});
