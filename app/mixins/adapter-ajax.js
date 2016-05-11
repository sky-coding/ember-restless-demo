import Ember from 'ember';

export default Ember.Mixin.create({

  authentication: Ember.inject.service(),

  ajax: Ember.computed(function () {
    var authentication = this.get('authentication');
    var adapter = Ember.getOwner(this).lookup('adapter:application');
    return function (url, type, options) {
      var token = authentication.get('token');

      url = `${adapter.urlPrefix()}/${url}`;
      if (token) options = Ember.$.extend({}, options, {headers: {token: token}});
      return adapter.ajax(url, type, options);
    };
  })
});
