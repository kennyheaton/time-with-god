global.message = 'Hello, world.';

exports.hello = {
    get: function() {
      return { message: global.message };
    },
    put: function (param) {
      global.message = param.message;
      return { status: 'OK' }
    }
  };

