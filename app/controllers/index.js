import Ember from 'ember';

export default Ember.Controller.extend({
  authentication: Ember.inject.service(),
  user: Ember.inject.service(),
  activeOrder: Ember.inject.service(),

  loading: false,
  message: null,

  updateButtonDisabled: Ember.computed('activeOrder.record.hasDirtyAttributes', function() {
    return this.get('loading') || !this.get('activeOrder.record.hasDirtyAttributes');
  }),

  credentials: {
    // user in Mirage database
    username: 'foo',
    password: 'bar'
  },

  actions: {
    login() {
      if (this.get('loading')) return;
      this.set('loading', true);
      this.set('message', null);

      let fail = (error, message) => {
        if (error && error.message) console.warn(error.message);
        if (message) this.set('message', message);
        return Ember.RSVP.reject();
      };

      this.get('authentication').login(this.get('credentials'))
        .catch((e) => { return fail(e, 'Authentication failed. Please try again.'); })

        .then(() => {
          return this.get('user').load()
            .catch((e) => {
              this.get('authentication').logout();
              return fail(e, 'Authentication succeeded but failed loading user. Please try again.');
            });
        })

        .then(() => {
          return this.get('activeOrder').load()
            .catch((e) => {
              this.get('user').unload();
              this.get('authentication').logout();
              return fail(e, 'Authentication succeeded but failed loading active order. Please try again.');
            });
        })

        .finally(() => {
          this.set('loading', false);
        })
      ;
    },

    logout() {
      if (this.get('loading')) return;
      this.set('message', null);

      this.get('user').unload();
      this.get('activeOrder').unload();
      this.get('authentication').logout();
    },

    refresh() {
      if (this.get('loading')) return;
      this.set('loading', true);
      this.set('message', null);

      return this.get('activeOrder').load()
        .catch((e) => { this.set('message', 'Refresh failed.'); } )
        .finally(() => {
          this.set('loading', false);
        });
    },

    update() {
      if (this.get('loading')) return;
      this.set('loading', true);
      this.set('message', null);

      return this.get('activeOrder').update()
        .then(() => {
          this.get('activeOrder').load()
            .then(() => {
              console.log('refresh finished!');
              this.set('loading', false);
            }, (e) => {
              console.log(e);
              this.set('message', 'Update succeeded but refresh failed. Please refresh manually to verify.');
              this.set('loading', false);
            })
        }, (e) => {
          console.log(e);
          this.set('message', 'Update failed.');
          this.set('loading', false);
        })
    },

    confirm() {

    }
  }

});
