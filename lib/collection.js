// if node
var MiniEventEmitter = require('miniee');
// end

function Collection(models) {
  this.reset();
  models && this.add(models);
}

MiniEventEmitter.mixin(Collection);

Collection.prototype.reset = function() {
  var self = this;
  if(this._items) {
    this._items.forEach(function(model) {
      model.removeListener('change', self._modelChange);
    });
  }
  this._items = [];
  this._byId = {};
  this.length = 0;
  this.emit('reset');
};

Collection.prototype.add = function(model, at) {
  var self = this, modelId;
  if(Array.isArray(model)) {
    return model.forEach(function(m) { self.add(m, at); });
  }
  this._items.splice((isNaN(at) ? this._items.length : at), 0, model);
  this.length = this._items.length;
  modelId = model.get('id');
  if (typeof modelId != 'undefined') {
    this._byId[modelId] = model;
  }
  this.emit('add', model, this);
  model.on('change', this._modelChange);
};

Collection.prototype.remove = function(model){
  var index = this._items.indexOf(model), modelId;
  if (index > -1) {
    modelId = model.get('id');
    this._items.splice(index, 1);
    this.length = this._items.length;
    if (typeof modelId != 'undefined') {
      delete this._byId[modelId];
    }
    this.emit('remove', model, this);
    model.removeListener('change', this._modelChange);
  }
};

Collection.prototype.at = function(index) {
  return this._items[index];
};

Collection.prototype.get = function(id) {
  return this._byId[id];
};

['filter', 'forEach', 'every', 'map', 'some'].forEach(function(name) {
  Collection.prototype[name] = function() {
    return Array.prototype[name].apply(this._items, arguments);
  }
});

Collection.prototype.sort = function(comparator) {
  this._items.sort(comparator || this.orderBy);
};

Collection.prototype._modelChange = function(key, value, oldValue, model) {
  this.emit(key, value, oldValue, model);
};

module.exports = Collection;