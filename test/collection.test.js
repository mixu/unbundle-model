var assert = require('assert'),

    Model = require('../lib/model.js'),
    Collection = require('../lib/collection.js');

exports['can add a model into the collection, adding causes add event'] = function(done) {
  var collection = new Collection(),
      model = new Model();
  assert.equal(0, collection.length);
  collection.on('add', function(m, c) {
    assert.equal(model, m);
    assert.equal(collection, c);
    done();
  });
  collection.add(model);
  assert.equal(model, collection.at(0));
  assert.equal(1, collection.length);
};

exports['can add an array of models into the collection, causes add events'] = function(done) {
  var collection = new Collection(),
      models = [ new Model(), new Model(), new Model ],
      events = [];
  collection.on('add', function(m) {
    events.push(m);
    if(events.length == 3) {
      assert.deepEqual(models, events);
      done();
    }
  });
  collection.add(models);
  assert.equal(3, collection.length);
  [0, 1, 2].forEach(function(i){
    assert.equal(models[i], collection.at(i));
  });
};

exports['can remove a model from the collection, removing causes a remove event and reindexes'] = function(done) {
  var collection = new Collection(),
      models = [ new Model(), new Model(), new Model ],
      calls = 0;
  collection.add(models);
  collection.on('remove', function() { calls++ });
  for(var i = 0; i < 3; i++) {
    collection.remove(models[0]);
    models = models.slice(1);
    assert.equal(models.length, collection.length);
    models.forEach(function(m, index) {
      assert.equal(m, collection.at(index));
    })
  }
  assert.equal(3, calls);
  done();
};

exports['can reset the collection, and get reset event'] = function(done) {
  var collection = new Collection(),
      models = [ new Model(), new Model(), new Model ],
      calls = 0;
  collection.add(models);
  assert.equal(3, collection.length);
  collection.on('reset', function() { calls++; });
  collection.reset();
  assert.equal(0, collection.length);
  assert.equal(1, calls);
  done();
};

exports['can get model by index'] = function(done) {
  var collection = new Collection(),
      models = [ new Model({ id: 3}), new Model({ id: 1 }), new Model({ id: 2 }) ];
  collection.add(models);
  assert.equal(models[0], collection.at(0));
  assert.equal(models[1], collection.at(1));
  assert.equal(models[2], collection.at(2));
  done();
};

exports['can add model by index'] = function(done) {
  var collection = new Collection([ new Model({ id: 3}), new Model({ id: 1 }), new Model({ id: 2 }) ]),
      a = new Model({id: 4});
  collection.add(a, 0);
  assert.equal(a, collection.at(0));
  done();
};

exports['can get model by id'] = function(done) {
  var collection = new Collection(),
      models = [ new Model({ id: 3}), new Model({ id: 1 }), new Model({ id: 2 }) ];
  collection.add(models);
  assert.equal(models[0], collection.get(3));
  assert.equal(models[1], collection.get(1));
  assert.equal(models[2], collection.get(2));
  done();
};

exports['can iterate using forEach'] = function(done) {
  var collection = new Collection(),
      models = [ new Model({ id: 3}), new Model({ id: 1 }), new Model({ id: 2 }) ];
  collection.add(models);
  collection.forEach(function(model, index) {
    assert.equal(models[index], model);
  });
  done();
};

exports['can sort models by comparator'] = function(done) {
  var collection = new Collection(),
      models = [ new Model({ name: 'z'}), new Model({ name: 'c' }), new Model({ name: 'a' }) ];
  collection.add(models);
  collection.sort(function(a, b) {
    return a.get('name').localeCompare(b.get('name'));
  });
  assert.equal(models[2], collection.at(0));
  assert.equal(models[1], collection.at(1));
  assert.equal(models[0], collection.at(2));
  done();
}

exports['default sort orderBy'] = function(done) {
  var collection = new Collection(),
      models = [ new Model({ name: 'z'}), new Model({ name: 'c' }), new Model({ name: 'a' }) ];
  collection.orderBy = function(a, b) {
    return a.get('name').localeCompare(b.get('name'));
  };
  collection.add(models)
  collection.sort();
  assert.equal(models[2], collection.at(0));
  assert.equal(models[1], collection.at(1));
  assert.equal(models[0], collection.at(2));
  done();
};

exports['change events on the models are also emitted on the collection'] = function(done) {
  done();
};

// if this module is the script being run, then run the tests:
if (module == require.main) {
  var mocha = require('child_process').spawn('mocha', [ '--colors', '--ui', 'exports', '--reporter', 'spec', __filename ]);
  mocha.stdout.pipe(process.stdout);
  mocha.stderr.pipe(process.stderr);
}
