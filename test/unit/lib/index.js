define(function(require) {
  'use strict';

  var index = require('../../../lib/index');

  describe('Api', function() {
    it('exists', function() {
      assert.ok(index);
    });

    describe('Errors', function() {
      describe('TransitionStateError', function() {
        it('exists', function() {
          assert.ok(index.TransitionStateError);
        });

        it('is valid subclass', function() {
          assert.ok(new index.TransitionStateError() instanceof Error);
        });
      });

      describe('DOMException', function() {
        it('exists', function() {
          assert.ok(index.DOMException);
        });

        it('is valid subclass', function() {
          assert.ok(new index.DOMException() instanceof Error);
        });
      });
    });

    describe('OuterHTML', function() {
      it('exists', function() {
        assert.ok(index.outerHTML);
      });

      it('is valid type', function() {
        assert.equal(typeof index.outerHTML, 'function');
      });

      it('errors when called without a valid element', function() {
        assert.throws(function() {
          index.outerHTML();
        });
      });
    });

    describe('InnerHTML', function() {
      it('exists', function() {
        assert.ok(index.innerHTML);
      });

      it('is valid type', function() {
        assert.equal(typeof index.innerHTML, 'function');
      });

      it('errors when called without a valid element', function() {
        assert.throws(function() {
          index.innerHTML();
        });
      });
    });

    describe('Element', function() {
      it('exists', function() {
        assert.ok(index.element);
      });

      it('is valid type', function() {
        assert.equal(typeof index.element, 'function');
      });

      it('errors when called without a valid element', function() {
        assert.throws(function() {
          index.element();
        });
      });
    });
  });
});
