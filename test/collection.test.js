var assert = require('assert'),

    Model = require('../lib/model.js'),
    Collection = require('../lib/collection.js');

exports['can add a model into the collection, adding causes add event'] = function(done) {
  var collection = new Collection(),
      model = new Model();
  assert.equal(0, collection.length);
  collection.on('add', function(m, c, options) {
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
      models = [ new Model({ a: 'a' }), new Model({ a: 'b' }), new Model({a: 'c'}) ],
      events = [],
      expected = [
        { model: models[0], o: { index: 0 } },
        { model: models[1], o: { index: 1 } },
        { model: models[2], o: { index: 2 } }
        ];
  collection.on('add', function(model, coll, options) {
    assert.equal(coll, collection);
    events.push({ model: model, o: options });
  });
  collection.add(models);
  assert.equal(3, collection.length);
  [0, 1, 2].forEach(function(i){
    assert.equal(models[i], collection.at(i));
  });
  assert.deepEqual(events, expected);
  done();
};

exports['can remove a model from the collection, removing causes a remove event and reindexes'] = function(done) {
  var collection = new Collection(),
      models = [ new Model(), new Model(), new Model ],
      calls = 0,
      events = [],
      expected = [
        { model: models[0], o: { index: 0 } },
        { model: models[1], o: { index: 0 } },
        { model: models[2], o: { index: 0 } }
        ];
  collection.add(models);
  collection.on('remove', function(model, coll, options) {
    assert.equal(coll, collection);
    events.push({ model: model, o: options });
    calls++;
  });
  for(var i = 0; i < 3; i++) {
    collection.remove(models[0]);
    models = models.slice(1);
    assert.equal(models.length, collection.length);
    models.forEach(function(m, index) {
      assert.equal(m, collection.at(index));
    })
  }
  assert.equal(3, calls);
  assert.deepEqual(events, expected);
  done();
};

exports['can reset the collection, and get reset event'] = function(done) {
  var collection = new Collection(),
      models = [ new Model(), new Model(), new Model ],
      calls = 0;
  collection.add(models);
  assert.equal(3, collection.length);
  collection.on('reset', function(coll) {
    assert.equal(coll, collection);
    calls++;
  });
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
      models = [ new Model({ name: 'z'}), new Model({ name: 'c' }), new Model({ name: 'a' }) ],
      calls = 0;
  collection.add(models);
  // sort should generate "reset"
  collection.on('reset', function(coll) {
    assert.equal(coll, collection);
    calls++;
  });
  collection.sort(function(a, b) {
    return a.get('name').localeCompare(b.get('name'));
  });
  assert.equal(models[2], collection.at(0));
  assert.equal(models[1], collection.at(1));
  assert.equal(models[0], collection.at(2));
  assert.equal(calls, 1);
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
