define(function(require, exports, module) {
  'use strict';

  var uuid = require('./uuid');

  var poolsCache = {};
  exports.cache = poolsCache;

  var count = 10000;
  exports.count = count;

  /**
   * Creates a pool to query new or reused values from.
   *
   * @param name
   * @param opts
   * @return {Object} pool
   */
  function createPool(name, opts) {
    var size = opts.size;
    var fill = opts.fill;
    var free = [];
    var allocated = [];
    var protect = [];

    // Prime the cache with n objects.
    for (var i = 0; i < size; i++) {
      free[i] = fill();
    }

    return {
      _free: free,
      _allocated: allocated,
      _protected: protect,
      _uuid: {},

      get: function() {
        var obj = null;
        var freeLength = free.length;
        var minusOne = freeLength - 1;

        if (freeLength) {
          obj = free[minusOne];
          free.length = minusOne;
        }
        else {
          obj = fill();
        }

        allocated.push(obj);

        return obj;
      },

      protect: function(value) {
        var idx = allocated.indexOf(value);

        // Move the value out of allocated, since we need to protect this from
        // being free'd accidentally.
        protect.push(idx === -1 ? value : allocated.splice(idx, 1)[0]);

        // If we're protecting an element object, push the uuid into a lookup
        // table.
        if (name === 'elementObject') {
          this._uuid[value.uuid] = value;
        }
      },

      unprotect: function(value) {
        var idx = protect.indexOf(value);

        if (idx !== -1) {
          var obj = protect.splice(idx, 1)[0];
          if (obj) { allocated.push(obj); }

          if (name === 'elementObject') {
            delete this._uuid[value.uuid];
          }
        }
      },

      freeAll: function() {
        var allocatedLength = allocated.length;
        var freeLength = free.length;

        free.push.apply(free, allocated.slice(0, size - freeLength));
        allocated.length = 0;
      },

      free: function(value) {
        var idx = allocated.indexOf(value);

        // Already freed.
        if (idx === -1) { return; }

        // Only put back into the free queue if we're under the size.
        if (free.length < size) {
          free.push(value);
        }

        allocated.splice(idx, 1);
      }
    };
  }

  exports.createPool = createPool;

  /**
   * initializePools
   *
   * @param COUNT
   * @return
   */
  function initializePools(COUNT) {
    poolsCache.attributeObject = createPool('attributeObject', {
      size: COUNT,

      fill: function() {
        return { name: '', value: '' };
      }
    });

    poolsCache.elementObject = createPool('elementObject', {
      size: COUNT,

      fill: function() {
        return {
          uuid: uuid(),
          childNodes: [],
          attributes: []
        };
      }
    });
  }

  exports.initializePools = initializePools;

  // Create 10k items of each type.
  initializePools(count);
});
