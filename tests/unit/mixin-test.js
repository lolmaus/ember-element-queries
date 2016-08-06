/* jshint expr:true */
import { expect } from 'chai';
import {
  describe,
  it
} from 'mocha';
import Ember from 'ember';
import EqMixin from 'ember-element-query/mixin';

describe('EqMixin', function() {

  it('eqBreakpointsAsc', function() {
    const EqObject =  Ember.Component.extend(EqMixin);

    const subject = EqObject.create({
      eqSlices: {
        0:    'xxs',
        200:  'xs',
        400:  's',
        600:  'm',
        800:  'l',
        1000: 'xl',
        1200: 'xxl',
        1400: 'xxxl',
      }
    });

    const eqBreakpointsAsc = subject.get('eqBreakpointsAsc');

    expect(eqBreakpointsAsc).eql([0, 200, 400, 600, 800, 1000, 1200, 1400]);
  });


  it('eqBreakpointsDesc', function() {
    const EqObject =  Ember.Component.extend(EqMixin);

    const subject = EqObject.create({
      eqSlices: {
        0:    'xxs',
        200:  'xs',
        400:  's',
        600:  'm',
        800:  'l',
        1000: 'xl',
        1200: 'xxl',
        1400: 'xxxl',
      }
    });

    const eqBreakpointsDesc = subject.get('eqBreakpointsDesc');

    expect(eqBreakpointsDesc).eql([1400, 1200, 1000, 800, 600, 400, 200, 0]);
  });


  it('eqBPCurrent', function() {
    const EqObject =  Ember.Component.extend(EqMixin);

    const subject = EqObject.create({
      eqWidth: 450,
      eqSlices: {
        0:    'xxs',
        200:  'xs',
        400:  's',
        600:  'm',
        800:  'l',
        1000: 'xl',
        1200: 'xxl',
        1400: 'xxxl',
      }
    });

    const eqBPCurrent = subject.get('eqBPCurrent');

    expect(eqBPCurrent).equal(400);
  });


  it('eqBPCurrentIndex', function() {
    const EqObject =  Ember.Component.extend(EqMixin);

    const subject = EqObject.create({
      eqWidth: 450,
      eqSlices: {
        0:    'xxs',
        200:  'xs',
        400:  's',
        600:  'm',
        800:  'l',
        1000: 'xl',
        1200: 'xxl',
        1400: 'xxxl',
      }
    });

    const eqBPCurrentIndex = subject.get('eqBPCurrentIndex');

    expect(eqBPCurrentIndex).equal(2);
  });


  it('eqBPsFrom', function() {
    const EqObject =  Ember.Component.extend(EqMixin);

    const subject = EqObject.create({
      eqWidth: 450,
      eqSlices: {
        0:    'xxs',
        200:  'xs',
        400:  's',
        600:  'm',
        800:  'l',
        1000: 'xl',
        1200: 'xxl',
        1400: 'xxxl',
      }
    });

    const eqBPsFrom = subject.get('eqBPsFrom');

    expect(eqBPsFrom).eql([0, 200, 400]);
  });


  it('eqBPsTo', function() {
    const EqObject =  Ember.Component.extend(EqMixin);

    const subject = EqObject.create({
      eqWidth: 450,
      eqSlices: {
        0:    'xxs',
        200:  'xs',
        400:  's',
        600:  'm',
        800:  'l',
        1000: 'xl',
        1200: 'xxl',
        1400: 'xxxl',
      }
    });

    const eqBPsTo = subject.get('eqBPsTo');

    expect(eqBPsTo).eql([400, 600, 800, 1000, 1200, 1400]);
  });


  it('eqBPsBetween', function() {
    const EqObject =  Ember.Component.extend(EqMixin);

    const subject = EqObject.create({
      eqWidth: 450,
      eqSlices: {
        0:    'xxs',
        200:  'xs',
        400:  's',
        600:  'm',
        800:  'l',
      }
    });

    const eqBPsBetween = subject.get('eqBPsBetween');

    expect(eqBPsBetween).eql([
      [0, 400],
      [0, 600],
      [0, 800],
      [200, 400],
      [200, 600],
      [200, 800],
      [400, 400],
      [400, 600],
      [400, 800],
    ]);
  });


  it('eqSliceCurrent', function() {
    const EqObject =  Ember.Component.extend(EqMixin);

    const subject = EqObject.create({
      eqWidth: 450,
      eqSlices: {
        0:    'xxs',
        200:  'xs',
        400:  's',
        600:  'm',
        800:  'l',
        1000: 'xl',
        1200: 'xxl',
        1400: 'xxxl',
      }
    });

    const eqSliceCurrent = subject.get('eqSliceCurrent');

    expect(eqSliceCurrent).eql('s');
  });


  it('eqSlicesFrom', function() {
    const EqObject =  Ember.Component.extend(EqMixin);
    const subject = EqObject.create({
      eqWidth: 450,
      eqSlices: {
        0:    'xxs',
        200:  'xs',
        400:  's',
        600:  'm',
        800:  'l',
        1000: 'xl',
        1200: 'xxl',
        1400: 'xxxl',
      }
    });

    const eqSlicesFrom = subject.get('eqSlicesFrom');

    expect(eqSlicesFrom).eql(['xxs', 'xs', 's']);
  });


  it('eqSlicesTo', function() {
    const EqObject =  Ember.Component.extend(EqMixin);
    const subject = EqObject.create({
      eqWidth: 450,
      eqSlices: {
        0:    'xxs',
        200:  'xs',
        400:  's',
        600:  'm',
        800:  'l',
        1000: 'xl',
        1200: 'xxl',
        1400: 'xxxl',
      }
    });

    const eqSlicesTo = subject.get('eqSlicesTo');

    expect(eqSlicesTo).eql(['s', 'm', 'l', 'xl', 'xxl', 'xxxl']);
  });


  it('eqSlicesBetween', function() {
    const EqObject =  Ember.Component.extend(EqMixin);

    const subject = EqObject.create({
      eqWidth: 450,
      eqSlices: {
        0:    'xxs',
        200:  'xs',
        400:  's',
        600:  'm',
        800:  'l',
      }
    });

    const eqSlicesBetween = subject.get('eqSlicesBetween');

    expect(eqSlicesBetween).eql([
      'xxs-s',
      'xxs-m',
      'xxs-l',
       'xs-s',
       'xs-m',
       'xs-l',
        's-s',
        's-m',
        's-l',
    ]);
  });


  it('eqSlicesFromAttr', function() {
    const EqObject =  Ember.Component.extend(EqMixin);
    const subject = EqObject.create({
      eqWidth: 450,
      eqSlices: {
        0:    'xxs',
        200:  'xs',
        400:  's',
        600:  'm',
        800:  'l',
        1000: 'xl',
        1200: 'xxl',
        1400: 'xxxl',
      }
    });

    const eqSlicesFromAttr = subject.get('eqSlicesFromAttr');

    expect(eqSlicesFromAttr).eql('xxs xs s');
  });


  it('eqSlicesToAttr', function() {
    const EqObject =  Ember.Component.extend(EqMixin);
    const subject = EqObject.create({
      eqWidth: 450,
      eqSlices: {
        0:    'xxs',
        200:  'xs',
        400:  's',
        600:  'm',
        800:  'l',
        1000: 'xl',
        1200: 'xxl',
        1400: 'xxxl',
      }
    });

    const eqSlicesToAttr = subject.get('eqSlicesToAttr');

    expect(eqSlicesToAttr).eql('s m l xl xxl xxxl');
  });


  it('eqSlicesBetweenAttr', function() {
    const EqObject =  Ember.Component.extend(EqMixin);

    const subject = EqObject.create({
      eqWidth: 450,
      eqSlices: {
        0:    'xxs',
        200:  'xs',
        400:  's',
        600:  'm',
        800:  'l',
      }
    });

    const eqSlicesBetweenAttr = subject.get('eqSlicesBetweenAttr');

    expect(eqSlicesBetweenAttr).equal(
      'xxs-s xxs-m xxs-l xs-s xs-m xs-l s-s s-m s-l'
    );
  });


  it('eqTransitionEventName', function() {
    const EqObject =  Ember.Component.extend(EqMixin);

    const subject = EqObject.create();

    const eqTransitionEventName = subject.get('eqTransitionEventName');

    expect([
      'transitionend',
      'oTransitionEnd',
      'webkitTransitionEnd'
    ]).contains(eqTransitionEventName);
  });







  it('eqSliceForBP', function() {
    const EqObject =  Ember.Component.extend(EqMixin);
    const subject = EqObject.create({
      eqSlices: {
        0:    'xxs',
        200:  'xs',
        400:  's',
        600:  'm',
        800:  'l',
        1000: 'xl',
        1200: 'xxl',
        1400: 'xxxl',
      }
    });

    const slice = subject.eqSliceForBP(400);

    expect(slice).equal('s');
  });


  it('eqSlicesForBPs', function() {
    const EqObject =  Ember.Component.extend(EqMixin);
    const subject = EqObject.create({
      eqSlices: {
        0:    'xxs',
        200:  'xs',
        400:  's',
        600:  'm',
        800:  'l',
        1000: 'xl',
        1200: 'xxl',
        1400: 'xxxl',
      }
    });

    const slices = subject.eqSlicesForBPs([400, 800]);

    expect(slices).eql(['s', 'l']);
  });


  it('updateEqWidth (implementation test)', function() {
    const EqObject = Ember.Component.extend(EqMixin);
    const subject = EqObject.create();

    subject.set('element', {offsetWidth: 372});

    subject.eqUpdateSizes();

    const width = subject.get('eqWidth');

    expect(width).equal(372);
  });
});
