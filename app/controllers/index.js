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
      
      // login
      this.get('authentication').login(this.get('credentials'))
        .catch((e) => {
          this.set('message', 'Authentication failed. Please try again.');
          return Ember.RSVP.reject(e);
        })

        // load user
        .then(() => {
          return this.get('user').load()
            .catch((e) => {
              this.get('authentication').logout();
              
              this.set('message', 'Authentication succeeded but failed loading user. Please try again.');
              return Ember.RSVP.reject(e);
            });
        })

        // load active order
        .then(() => {
          return this.get('activeOrder').load()
            .catch((e) => {
              this.get('user').unload();
              this.get('authentication').logout();

              this.set('message', 'Authentication succeeded but failed loading active order. Please try again.');
              return Ember.RSVP.reject(e);
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

      return this.get('user').load()
        .catch((e) => {
          this.set('message', 'User refresh failed.');
          return Ember.RSVP.reject(e);
        })

        .then(() => {
          return this.get('activeOrder').load()
            .catch((e) => {
              this.set('message', 'User refresh succeeded but order refresh failed.');
              return Ember.RSVP.reject(e);
            });
        }, (e) => { return Ember.RSVP.reject(e); })

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
              this.set('loading', false);
            }, (e) => {
              this.set('message', 'Update succeeded but order refresh failed. Please refresh manually to verify.');
              this.set('loading', false);
              return Ember.RSVP.reject(e);
            });
        }, (e) => {
          this.set('message', 'Update failed.');
          this.set('loading', false);
          return Ember.RSVP.reject(e);
        });
    },

    confirm() {
      if (this.get('loading')) return;
      this.set('loading', true);
      this.set('message', null);

      return this.get('activeOrder').confirm()
        .catch((e) => {
          this.set('message', 'Confirm failed.');
          return Ember.RSVP.reject(e);
        })

        .then(() => {
          return this.get('user').load()
            .catch((e) => {
              this.set('message', 'Confirm succeeded, but user refresh failed. Please refresh manually to verify.');
              return Ember.RSVP.reject(e);
            });
        }, (e) => { return Ember.RSVP.reject(e); })

        .then(() => {
          return this.get('activeOrder').load()
            .catch((e) => {
              this.set('message', 'Confirm and user refresh succeeded, but order refresh failed. Please refresh manually to verify.');
              return Ember.RSVP.reject(e);
            });
        }, (e) => { return Ember.RSVP.reject(e); })

        .finally(() => {
          this.set('loading', false);
        });
    }
  }

});
