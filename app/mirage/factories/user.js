/*
  This is an example factory definition.

  Create more files in this directory to define additional factories.
*/
import Mirage/*, {faker} */ from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  id: '1234',
  username: 'foo',
  password: 'bar',
  token: 'baz', // here for simplicity
  ordersConfirmed: 0,

  orders: [
    {
      id: '123',
      item: 'backend developers',
      quantity: '12',
      price: '0.10',
      status: 'unconfirmed',
      isActive: true
    }
  ]
});
