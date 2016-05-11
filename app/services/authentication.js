import Ember from 'ember';
import AdapterAjaxMixin from '../mixins/adapter-ajax';

export default Ember.Service.extend(AdapterAjaxMixin, {
  loggedIn: false,
  token: null,

  login(credentials) {
    return this.get('ajax')('login', 'POST', {data: credentials}).then((response) => {

      this.set('loggedIn', true);
      this.set('token', response.data.token);

    }, (e) => { return Ember.RSVP.reject(e); });
  },

  logout() {
    this.set('loggedIn', false);
    this.set('token', null);
  }

});
