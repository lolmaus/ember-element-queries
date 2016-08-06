Change Log
==========

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).



2.0.0 Roadmap
-------------

- [x] Component yield value returns a hash with many useful properties (`eqYieldable`).
- [x] Support IE11 event mechanism (#2).
- [x] Support Ember Fastboot.
- [ ] Make `eq-to()` and `eq-between()` non-inclusive on the right side. (#3)
- [ ] Demo website



Unreleased
----------

### Changed :warning:
- `updateEqWidth` renamed to `eqUpdateSizes` with a different return value.
- Component yield arguments changed to `eqYieldable` (see API docs).
- Migrated from native `Event` to `Ember.Evented`:
  - The target for EQ events is now an `eq` Ember service, rather than window.
  - The event name is `shouldUpdate`, it will trigger recalculation on all element query components.
  - There's a convenience method `update` on the service that triggers that event.



[1.0.1]
-------

### Fixed
- Removed stray `console.log`.



[1.0.0]
-------

Initial release
