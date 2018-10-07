let hapi = require('hapi');
let halacious = require('../');

let server = new hapi.Server();
server.connection({ port: 8080 });

server.register(require('vision'), err => {
  if (err) return console.log(err);
});

server.register(halacious, err => {
  if (err) console.log(err);
});

function User(id, firstName, lastName, googlePlusId) {
  this.id = id;
  this.firstName = firstName;
  this.lastName = lastName;
  this.googlePlusId = googlePlusId;
}

User.prototype.toHal = function(rep, next) {
  if (this.googlePlusId) {
    rep.link('home', `http://plus.google.com/${this.googlePlusId}`);
    rep.ignore('googlePlusId');
  }
  next();
};

server.route({
  method: 'get',
  path: '/users',
  config: {
    handler(req, reply) {
      reply({
        start: 0,
        count: 2,
        limit: 2,
        items: [
          new User(100, 'Brad', 'Leupen', '107835557095464780852'),
          new User(101, 'Mark', 'Zuckerberg'),
        ],
      });
    },
    plugins: {
      hal: {
        embedded: {
          item: {
            path: 'items',
            href: './{item.id}',
          },
        },
      },
    },
  },
});

server.start(err => {
  if (err) return console.log(err);
  console.log('Server started at %s', server.info.uri);
});
