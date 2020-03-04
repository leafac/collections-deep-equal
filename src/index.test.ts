import { MapDeepEqual, SetDeepEqual } from "./index";
import deepEqual from "deep-equal";

describe("MapDeepEqual", () => {
  const key = { name: "Leandro", age: 29 };
  const sameKey = { name: "Leandro", age: 29 };
  const otherKey = { name: "John", age: 35 };
  const sameOtherKey = { name: "John", age: 35 };
  const map = new MapDeepEqual([
    [key, "first value loses"],
    [sameKey, "second value wins"]
  ]);

  test("new", () => {
    expect(map.size).toBe(1);
    expect(map.get(key)).toBe("second value wins");
    expect(map.get(sameKey)).toBe("second value wins");
    const otherMap = new MapDeepEqual(map);
    expect(map.size).toBe(1);
    expect(otherMap.size).toBe(1);
    otherMap.set(otherKey, "different value");
    expect(map.size).toBe(1);
    expect(otherMap.size).toBe(2);
    expect(otherMap.get(key)).toBe("second value wins");
    expect(otherMap.get(otherKey)).toBe("different value");
  });

  test("delete()", () => {
    const otherMap = new MapDeepEqual(map);
    expect(otherMap.size).toBe(1);
    expect(otherMap.delete(key)).toBe(true);
    expect(otherMap.delete(key)).toBe(false);
    expect(map.size).toBe(1);
    expect(otherMap.size).toBe(0);
  });

  test("get()", () => {
    expect(map.get(key)).toBe(map.get(sameKey));
    expect(map.get(otherKey)).toBeUndefined();
  });

  test("has()", () => {
    expect(map.has(key)).toBe(true);
    expect(map.has(sameKey)).toBe(true);
    expect(map.has(otherKey)).toBe(false);
  });

  test("set()", () => {
    const otherMap = new MapDeepEqual(map);
    expect(otherMap.set(key, "new value")).toBe(otherMap);
    expect(otherMap.size).toBe(1);
    expect(otherMap.get(sameKey)).toBe("new value");
    expect(otherMap.set(otherKey, "new key")).toBe(otherMap);
    expect(otherMap.size).toBe(2);
    expect(otherMap.get(sameOtherKey)).toBe("new key");
  });

  describe("merge()", () => {
    test("different keys", () => {
      const otherMap = new MapDeepEqual(map);
      const anotherMap = new MapDeepEqual([[otherKey, "value to be merged"]]);
      expect(otherMap.merge(anotherMap)).toBe(otherMap);
      expect(
        deepEqual(
          otherMap,
          new MapDeepEqual([
            [key, "second value wins"],
            [otherKey, "value to be merged"]
          ])
        )
      ).toBe(true);
    });

    test("mergeable values", () => {
      const map = new MapDeepEqual([[key, new SetDeepEqual([1])]]);
      const otherMap = new MapDeepEqual([[sameKey, new SetDeepEqual([2])]]);
      expect(
        deepEqual(
          map.merge(otherMap),
          new MapDeepEqual([[key, new SetDeepEqual([1, 2])]])
        )
      ).toBe(true);
    });

    test("non-mergeable values", () => {
      const map = new MapDeepEqual([[key, new Set([1])]]);
      const otherMap = new MapDeepEqual([[sameKey, new Set([2])]]);
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
});
