import DS from 'ember-data';

export default DS.Model.extend({
  item: DS.attr(),
  quantity: DS.attr(),
  price: DS.attr(),
  status: DS.attr()
});
