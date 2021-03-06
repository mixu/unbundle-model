var MiniEventEmitter = require('miniee');

function Model(attr) {
  this.reset();
  attr && this.set(attr);
};

MiniEventEmitter.mixin(Model);

Model.prototype.reset = function() {
  this._data = {};
  this.length = 0;
  this.emit('reset', this);
  this.emit('all', 'reset', this);
};

Model.prototype.get = function(key) {
  return this._data[key];
};

Model.prototype.set = function(key, value) {
  var self = this, oldValue;
  // support set({ foo: 'bar' })
  if(arguments.length == 1 && key === Object(key)) {
    Object.keys(key).forEach(function(name) {
      self.set(name, key[name]);
    });
    return;
  }
  oldValue = this.get(key);
  if(!this._data.hasOwnProperty(key)) { this.length++; }
  this._data[key] = (typeof value == 'undefined' ? true : value);
  this.emit('change', key, value, oldValue, this);
  this.emit('all', 'change', key, value, oldValue, this);
};

Model.prototype.has = function(key) {
  return this._data.hasOwnProperty(key);
};

Model.prototype.remove = function(key) {
  this.emit('change', key, undefined, this.get(key));
  this.emit('all', 'change', key, undefined, this.get(key));
  this._data.hasOwnProperty(key) && this.length--;
  delete this._data[key];
};

Model.prototype.toJSON = function() {
  return this._data;
};

Model.prototype.serialize = function() {
  return ['Model', this._data];
};

Model.prototype.deserialize = function(attr) {
  this.set(attr);
};

module.exports = Model;
