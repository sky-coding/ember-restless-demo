import Ember from 'ember';
import AdapterAjaxMixin from '../mixins/adapter-ajax';

export default Ember.Service.extend(AdapterAjaxMixin, {
  record: null,

  load() {
    return this.get('ajax')('user', 'GET').then((response) => {

      // no need for Ember Data here
      var user = Ember.Object.create({
        id: response.data.id,
        username: response.data.username,
        ordersConfirmed: response.data.ordersConfirmed
      });

      this.set('record', user);

      return this.get('record');

    }, (e) => { return Ember.RSVP.reject(e); });
  },

  unload() {
    this.set('record', null);
  }

});
