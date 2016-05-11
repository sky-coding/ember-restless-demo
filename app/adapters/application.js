import DS from 'ember-data';

export default DS.JSONAPIAdapter.extend({
  // host: ENV.APP.API_URL,
  namespace: 'api'
});
