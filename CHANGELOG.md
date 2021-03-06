# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0] - 2020-06-26

### Changed

- The names of the exports are now `Map` and `Set`, with the intent of overriding the native implementation on import.

## [1.1.0] - 2020-03-24

### Changed

- Use [`util.isDeepStrictEqual()`](https://nodejs.org/api/util.html#util_util_isdeepstrictequal_val1_val2) instead of [`deep-equal`](https://www.npmjs.com/package/deep-equal).

## [1.0.1] - 2020-03-23

### Added

- Better `README` formatting.

## [1.0.0] - 2020-03-04

### Added

- Initial release with `MapDeepEqual` and `SetDeepEqual`.

[unreleased]: https://github.com/leafac/collections-deep-equal/compare/2.0.0...HEAD
[2.0.0]: https://github.com/leafac/collections-deep-equal/compare/1.1.0...2.0.0
[1.1.0]: https://github.com/leafac/collections-deep-equal/compare/1.0.1...1.1.0
[1.0.1]: https://github.com/leafac/collections-deep-equal/compare/1.0.0...1.0.1
[1.0.0]: https://github.com/leafac/collections-deep-equal/releases/tag/1.0.0
