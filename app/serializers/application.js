import Ember from 'ember';
import DS from 'ember-data';



export default DS.JSONSerializer.extend({
  normalizeResponse: function (store, primaryModelClass, payload, id, requestType) {
    return this._super(store, primaryModelClass, payload.data, id, requestType);
  },

  serialize: function(record, options) {
    return Ember.$.extend(this._super(...arguments), { id: record.id });
  }
});
