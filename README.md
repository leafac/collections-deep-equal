# People talking about the problem

https://2ality.com/2015/01/es6-maps-sets.html#why-can’t-i-configure-how-maps-and-sets-compare-keys-and-values%3F
https://stackoverflow.com/questions/21838436/map-using-tuples-or-objects
https://esdiscuss.org/topic/maps-with-object-keys
https://medium.com/@modernserf/the-tyranny-of-triple-equals-de46cc0c5723

# Libraries with alternative implementations of collections

https://immutable-js.github.io/immutable-js/
https://github.com/swannodette/mori
https://www.npmjs.com/package/typescript-collections
https://github.com/emmanueltouzery/prelude-ts
https://github.com/frptools/collectable
https://www.collectionsjs.com

https://github.com/immerjs/immer (doesn’t even give you new collections)

All but collectionsjs require `equals` and `hash` to be implemented by the elements in the collection, only the last allows for the collection to be aware of the comparator.

Just freeze objects, but don’t solve the equality problem.
https://github.com/rtfeldman/seamless-immutable
https://github.com/aearly/icepick
https://github.com/substack/deep-freeze

People subclassing collections
https://github.com/Jamesernator/es6-array-map
https://github.com/alastairpatrick/valuecollection#readme
https://www.npmjs.com/package/@strong-roots-capital/map-objects

# The definitive solution

https://github.com/tc39/proposal-record-tuple

# Other

https://github.com/DavidBruant/Map-Set.prototype.toJSON

The proposal has been rejected, but it’s such a good default!

https://github.com/sebmarkbage/ecmascript-immutable-data-structures
