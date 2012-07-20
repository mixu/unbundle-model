var assert = require('assert'),

    Model = require('../lib/model.js');

exports['can set values using hash'] = function(done) {
  var model = new Model();
  assert.equal(0, model.length);
  model.set({ foo: 'bar', abc: 'def' });
  assert.equal('bar', model.get('foo'));
  assert.equal('def', model.get('abc'));
  assert.equal(2, model.length);
  done();
};

exports['can set single value'] = function(done) {
  var model = new Model();
  assert.equal(0, model.length);
  model.set('foo', 'bar');
  assert.equal('bar', model.get('foo'));
  assert.equal(1, model.length);
  done();
};

exports['can check whether a key is set'] = function(done) {
  var model = new Model();
  assert.ok(!model.has('foo'));
  model.set('foo', 'bar');
  assert.ok(model.has('foo'));
  done();
};

exports['can remove a key'] = function(done) {
  var model = new Model();
  model.set('foo', 'bar');
  assert.ok(model.has('foo'));
  model.remove('foo');
  assert.ok(!model.has('foo'));
  done();
};

exports['can set to null and check whether null key is set'] = function(done) {
  var model = new Model();
  model.set('foo', null);
  assert.equal(null, model.get('foo'));
  assert.ok(model.has('foo'));
  done();
};

exports['with only one argument, use true'] = function(done) {
  var model = new Model();
  model.set('foo');
  assert.equal(true, model.get('foo'));
  assert.ok(model.has('foo'));
  done();
};

exports['setting a value emits a change event'] = function(done) {
  var model = new Model();
  model.on('change', function(key, value, oldValue) {
    assert.equal('foo', key);
    assert.equal('bar', value)
    assert.equal(undefined, oldValue);
    done();
  });
  model.set('foo', 'bar');
};

exports['removing a value emits a change event'] = function(done) {
  var model = new Model();
  model.set('foo', 'bar');
  model.on('change', function(key, value, oldValue) {
    assert.equal('foo', key);
    assert.equal(undefined, value)
    assert.equal('bar', oldValue);
    done();
  });
  model.remove('foo');
};

exports['calling reset empties length and values, and emits a reset event'] = function(done) {
  var count = 0;
  var model = new Model({ abc: 'def'});
  assert.equal('def', model.get('abc'));
  assert.equal(1, model.length);
  model.on('reset', function() {
    count++;
  });
  model.reset();
  assert.ok(!model.has('foo'));
  assert.equal(0, model.length);
  assert.equal(1, count);
  done();
};

// if this module is the script being run, then run the tests:
if (module == require.main) {
  var mocha = require('child_process').spawn('mocha', [ '--colors', '--ui', 'exports', '--reporter', 'spec', __filename ]);
  mocha.stdout.pipe(process.stdout);
  mocha.stderr.pipe(process.stderr);
}
