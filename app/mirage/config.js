import Mirage from 'ember-cli-mirage';

export default function () {

  this.urlPrefix = '';
  this.namespace = 'api';
  this.timing = 800;

  this.post('login', function (db, request) {
    if (shouldRandomlyFail()) return new Mirage.Response(500, {message: 'random failure'});

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
    if (shouldRandomlyFail()) return new Mirage.Response(500, {message: 'random failure'});

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
    if (shouldRandomlyFail()) return new Mirage.Response(500, {message: 'random failure'});

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
    if (shouldRandomlyFail()) return new Mirage.Response(500, {message: 'random failure'});

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
    if (shouldRandomlyFail()) return new Mirage.Response(500, {message: 'random failure'});

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

    db['users'].remove(user.id);
    db['users'].insert(user);
  });

  this.post('orders/:id/confirm', function (db, request) {
    if (shouldRandomlyFail()) return new Mirage.Response(500, {message: 'random failure'});

    var id = request.params.id;
    var token = request.requestHeaders['token'];

    var user = db['users'].where({token: token})[0];
    if (!user) return new Mirage.Response(400, {message: 'user not found'});

    var order = user.orders.filter(function (order) { return order.id == id; })[0];
    if (!order) return new Mirage.Response(400, {message: 'order not found'});

    if (order.status == 'confirmed') return new Mirage.Response(400, {message: 'order already confirmed'});

    order.status = 'confirmed';

    user.ordersConfirmed++;

    db['users'].remove(user.id);
    db['users'].insert(user);
  });

  function shouldRandomlyFail() {
    return Math.floor(Math.random() * 10) == 7;
  }
}

