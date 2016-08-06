import Ember from 'ember';

const {
  Evented,
  Service
} = Ember;

/**
 *
 * A service to trigger and subscribe for an update of element queries.
 *
 * The `e-q` component includes this mixin.
 *
 * @class EEQ.Service
 * @module ember-element-query
 * @extends Ember.Service
 * @uses Ember.Evented
 * @ember Service
 * @example
 * {
 *   eq: Ember.extend.service(),
 *   foo () {
 *     this.get('eq').update()
 *   }
 * }
 * */

/**
 * Triggers the update of element queries.
 *
 * @event shouldUpdate
 * */

/**
 * Fired after update has been made.
 *
 * @event afterUpdate
 * */

export default Service.extend(Evented, {


  /**
   * Triggers the update of element queries.
   *
   * Shortcut for `this.trigger('update')`.
   *
   * @method update
   * */
  update () {
    this.trigger('shouldUpdate');
  }
});
