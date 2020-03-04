export { MyMap as Map, MySet as Set };

import deepEqual from "deep-equal";

class MyMap<K, V> extends Map<K, V> {
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

  merge(other: MyMap<K, V>): this {
    [...other].forEach(([key, otherValue]) => {
      const thisValue = this.get(key);
      if (thisValue === undefined) return this.set(key, otherValue);
      if (typeof (thisValue as any).merge === "function")
        return this.set(
          key,
          new (thisValue as any).constructor(thisValue).merge(otherValue)
        );
      throw new Error(`Merge conflict: ${JSON.stringify(key)}`);
    });
    return this;
  }

  toJSON(): [K, V][] {
    return [...this];
  }
}

class MySet<T> extends Set<T> {
  add(value: T): this {
    return super.add(canonicalize(this, value));
  }

  delete(value: T): boolean {
    return super.delete(canonicalize(this, value));
  }

  has(value: T): boolean {
    return super.has(canonicalize(this, value));
  }

  merge(other: MySet<T>): this {
    [...other].forEach(otherValue => this.add(otherValue));
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
    [...collection.keys()].find(anElement => deepEqual(element, anElement)) ??
    element
  );
}
