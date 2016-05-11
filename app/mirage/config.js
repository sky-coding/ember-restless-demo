import Mirage from 'ember-cli-mirage';

export default function () {

  this.urlPrefix = '';    // make this `http://localhost:8080`, for example, if your API is on a different server
  this.namespace = 'api';    // make this `api`, for example, if your API is namespaced
  this.timing = 400;      // delay for each request, automatically set to 0 during testing

  // var id = request.params.id;
  // var params = JSON.parse(request.requestBody).message;
  // return new Mirage.Response(400, { a: 'header' }, { message: 'title cannot be blank' });

  this.post('login', function (db, request) {
    var data = JSON.parse(request.requestBody);
    var username = data.username;
    var password = data.password;

    var user = db['users'].where({username: username, password: password})[0];
    if (!user) return new Mirage.Response(400, {message: 'login unsuccessful'});

    return {
      data: {
        token: user.token
      }
    };
  });

  this.get('user', function (db, request) {
    var token = request.requestHeaders['token'];

    var user = db['users'].where({token: token})[0];
    if (!user) return new Mirage.Response(400, {message: 'user not found'});

    return {
      data: {
        id: user.id,
        username: user.username,
        ordersConfirmed: user.ordersConfirmed
      }
    };
  });

  this.get('user/:id/getActiveOrder', function (db, request) {
    var id = request.params.id;
    var token = request.requestHeaders['token'];

    var user = db['users'].where({id: id, token: token})[0];
    if (!user) return new Mirage.Response(400, {message: 'user not found'});

    var activeOrder = user.orders.filter(function (order) { return !!order.isActive; })[0];
    if (!activeOrder) return new Mirage.Response(400, {message: 'active order not found'});

    return {
      data: {
        activeOrder: activeOrder.id
      }
    };
  });

  this.get('orders/:id', function (db, request) {
    var id = request.params.id;
    var token = request.requestHeaders['token'];

    var user = db['users'].where({token: token})[0];
    if (!user) return new Mirage.Response(400, {message: 'user not found'});

    var order = user.orders.filter(function (order) { return order.id == id; })[0];
    if (!order) return new Mirage.Response(400, {message: 'order not found'});

    return {
      data: {
        item: order.item,
        quantity: order.quantity,
        price: order.price,
        status: order.status
      }
    };
  });

  this.patch('orders/:id', function (db, request) {
    var id = request.params.id;
    var token = request.requestHeaders['token'];
    var data = JSON.parse(request.requestBody);

    var user = db['users'].where({token: token})[0];
    if (!user) return new Mirage.Response(400, {message: 'user not found'});

    var order = user.orders.filter(function (order) { return order.id == id; })[0];
    if (!order) return new Mirage.Response(400, {message: 'order not found'});

    if (data.status) return new Mirage.Response(400, {message: 'cannot patch status field'});

    order.item = data.item;
    order.quantity = data.quantity;
    order.price = data.price;

    // db['users'].update(user, {
    //   item: data.item,
    //   quantity: data.quantity,
    //   price: data.price
    // });

  });

  this.post('orders/:id/confirm', function (db, request) {
    var id = request.params.id;
    var token = request.requestHeaders['token'];

    var user = db['users'].where({token: token})[0];
    if (!user) return new Mirage.Response(400, {message: 'user not found'});

    var order = user.orders.filter(function (order) { return order.id == id; })[0];
    if (!order) return new Mirage.Response(400, {message: 'order not found'});

    if (order.status == 'confirmed') return new Mirage.Response(400, {message: 'order already confirmed'});

    order.status = 'confirmed';

    // db['users'].update(user, {
    //   status: 'confirmed'
    // });

    // db['users'].update(user, {
    //   status: 'confirmed'
    // });

    user.ordersConfirmed++;
  });


  // These comments are here to help you get started. Feel free to delete them.

  /*
   Config (with defaults).

   Note: these only affect routes defined *after* them!
   */
  // this.urlPrefix = '';    // make this `http://localhost:8080`, for example, if your API is on a different server
  // this.namespace = '';    // make this `api`, for example, if your API is namespaced
  // this.timing = 400;      // delay for each request, automatically set to 0 during testing

  /*
   Route shorthand cheatsheet
   */
  /*
   GET shorthands

   // Collections
   this.get('/contacts');
   this.get('/contacts', 'users');
   this.get('/contacts', ['contacts', 'addresses']);

   // Single objects
   this.get('/contacts/:id');
   this.get('/contacts/:id', 'user');
   this.get('/contacts/:id', ['contact', 'addresses']);
   */

  /*
   POST shorthands

   this.post('/contacts');
   this.post('/contacts', 'user'); // specify the type of resource to be created
   */

  /*
   PUT shorthands

   this.put('/contacts/:id');
   this.put('/contacts/:id', 'user'); // specify the type of resource to be updated
   */

  /*
   DELETE shorthands

   this.del('/contacts/:id');
   this.del('/contacts/:id', 'user'); // specify the type of resource to be deleted

   // Single object + related resources. Make sure parent resource is first.
   this.del('/contacts/:id', ['contact', 'addresses']);
   */

  /*
   Function fallback. Manipulate data in the db via

   - db.{collection}
   - db.{collection}.find(id)
   - db.{collection}.where(query)
   - db.{collection}.update(target, attrs)
   - db.{collection}.remove(target)

   // Example: return a single object with related models
   this.get('/contacts/:id', function(db, request) {
   var contactId = +request.params.id;

   return {
   contact: db.contacts.find(contactId),
   addresses: db.addresses.where({contact_id: contactId})
   };
   });

   */
}

/*
 You can optionally export a config that is only loaded during tests
 export function testConfig() {

 }
 */
