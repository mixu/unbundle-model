var MiniEventEmitter = require('miniee');

function Collection(models) {
  this.reset();
  models && this.add(models);
}

MiniEventEmitter.mixin(Collection);

Collection.prototype.reset = function() {
  var self = this;
  if(this._items) {
    this._items.forEach(function(model) {
      model.removeListener('all', self._modelChange);
    });
  }
  this._items = [];
  this._byId = {};
  this.length = 0;
  this.emit('reset', this);
};

Collection.prototype.add = function(model, at) {
  var self = this, modelId;
  if(Array.isArray(model)) {
    return model.forEach(function(m) { self.add(m, at); });
  }
  at = (isNaN(at) ? this._items.length : at);
  this._items.splice(at, 0, model);
  this.length = this._items.length;
  modelId = model.get('id');
  if (typeof modelId != 'undefined') {
    this._byId[modelId] = model;
  }
  this.emit('add', model, this, { index: at });
  model.on('all', function() {
    self._modelChange.apply(self, Array.prototype.slice.call(arguments));
  });
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
    this.emit('remove', model, this, { index: index });
    model.removeListener('change', this._modelChange);
  }
};

Collection.prototype.all = function() {
  return this._items;
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
  this.emit('reset', this);
};

Collection.prototype._modelChange = function(event, model, collection, options) {
  if ((event == 'add' || event == 'remove') && collection != this) return;
  if (event == 'destroy') {
    this.remove(model);
  }
  if (model && event === 'change:id') {
    delete this._byId[model.previous(model.idAttribute)];
    this._byId[model.id] = model;
  }
  this.emit.apply(this, Array.prototype.slice.call(arguments));
};

Collection.prototype.serialize = function() {
  return ['Collection', this._items];
};

Collection.prototype.deserialize = function(models) {
  this.add(models);
};

module.exports = Collection;
