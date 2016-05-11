import Ember from 'ember';
import AdapterAjaxMixin from '../mixins/adapter-ajax';

export default Ember.Service.extend(AdapterAjaxMixin, {
  store: Ember.inject.service(),
  user: Ember.inject.service(),

  record: null,

  load() {
    let user = this.get('user.record');
    if (!user) return Ember.RSVP.reject({message: 'active order cannot be loaded without a loaded user'});

    return this.get('ajax')(`user/${user.id}/getActiveOrder`, 'GET')
      .then((response) => {
        return response.data.activeOrder;
      }, (e) => { return Ember.RSVP.reject(e); })


      .then((id) => {
        return this.get('ajax')(`orders/${id}`, 'GET')
          .then((response) => {
            // delete existing record and load updated record. clears dirty attributes.

            var existingRecord = this.get('record');
            if (existingRecord) this.get('store').unloadRecord(existingRecord);

            let data = {
              id: id, // attach order id to record
              item: response.data.item,
              quantity: response.data.quantity,
              price: response.data.price,
              status: response.data.status
            };

            var normalizedOrder = this.get('store').normalize('order', data); // normalize to JSON API document for .push()
            this.set('record', this.get('store').push(normalizedOrder)); // save reference to record

            return this.get('record');

          }, (e) => { return Ember.RSVP.reject(e); });
      }, (e) => { return Ember.RSVP.reject(e); })
    ;
  },

  unload() {
    var existingRecord = this.get('record');
    if (existingRecord) this.get('store').unloadRecord(existingRecord);
    this.set('record', null);
  },

  update() {
    let activeOrder = this.get('record');
    if (!activeOrder) return Ember.RSVP.reject({message: 'must load active order before updating'});

    let data = {
      item: activeOrder.get('item'),
      quantity: activeOrder.get('quantity'),
      price: activeOrder.get('price')
      // status: activeOrder.get('status')  // API disallows status on PATCH
    };

    return this.get('ajax')(`orders/${activeOrder.id}`, 'PATCH', { data: data })
      .then((response) => {
        // response returns no data.
        // assume server persisted all properties and clear dirty flags on model by reloading record.
        var normalizedOrder = this.get('store').normalize('order', activeOrder.serialize()); // normalize to JSON API document for .push()
        this.get('store').unloadRecord(activeOrder);
        this.set('record', this.get('store').push(normalizedOrder)); // save reference to record
        return this.get('record');

      }, (e) => {
        return Ember.RSVP.reject(e);
      })

      ;
  },

  confirm() {
    // TODO: ajax
  }

});
