import Ember from 'ember';
import AdapterAjaxMixin from 'ember-service/mixins/adapter-ajax';
import { module, test } from 'qunit';

module('Unit | Mixin | adapter ajax');

// Replace this with your real tests.
test('it works', function(assert) {
  let AdapterAjaxObject = Ember.Object.extend(AdapterAjaxMixin);
  let subject = AdapterAjaxObject.create();
  assert.ok(subject);
});
