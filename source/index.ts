export { MapDeepEqual as Map, SetDeepEqual as Set };

import * as util from "util";

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
