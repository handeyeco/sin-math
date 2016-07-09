;
(function(bless) {

  //This is the core and math sections of the sinful.js library
  //http://guipn.github.io/sinful.js/
  //https://github.com/guipn/sinful.js

  'use strict';

  var own = Object.getOwnPropertyNames,
    bind = Function.prototype.bind,
    liberate = bind.bind(Function.prototype.call),
    reduce = liberate(Array.prototype.reduce),
    slice = liberate(Array.prototype.slice);

  bless = bless || function(thing, name, content) {

    if (typeof thing[name] !== 'undefined') {
      throw new Error('Sinful: ' + name + ' is already defined.');
    }

    thing[name] = content;
  };

  // Fixing Floating-point math

  // Computes the multiplier necessary to make x >= 1,
  // effectively eliminating miscalculations caused by
  // finite precision.

  function multiplier(x) {

    var parts = x.toString().split('.');

    if (parts.length < 2) {
      return 1;
    }

    return Math.pow(10, parts[1].length);
  }


  // Given a variable number of arguments, returns the maximum
  // multiplier that must be used to normalize an operation involving
  // all of them.

  function correctionFactor() {

    return reduce(arguments, function(prev, next) {

      var mp = multiplier(prev),
        mn = multiplier(next);

      return mp > mn ? mp : mn;

    }, -Infinity);

  }

  [

    [Math, 'add', function() {

      var corrFactor = correctionFactor.apply(null, arguments);

      function cback(accum, curr, currI, O) {
        return accum + corrFactor * curr;
      }

      return reduce(arguments, cback, 0) / corrFactor;
    }],

    [Math, 'sub', function() {

      var corrFactor = correctionFactor.apply(null, arguments),
        first = arguments[0];

      function cback(accum, curr, currI, O) {
        return accum - corrFactor * curr;
      }

      delete arguments[0];

      return reduce(arguments,
        cback, first * corrFactor) / corrFactor;
    }],

    [Math, 'mul', function() {

      function cback(accum, curr, currI, O) {

        var corrFactor = correctionFactor(accum, curr);

        return (accum * corrFactor) * (curr * corrFactor) /
          (corrFactor * corrFactor);
      }

      return reduce(arguments, cback, 1);
    }],

    [Math, 'div', function() {

      function cback(accum, curr, currI, O) {

        var corrFactor = correctionFactor(accum, curr);

        return (accum * corrFactor) / (curr * corrFactor);
      }

      return reduce(arguments, cback);
    }]

  ].forEach(function(blessing) {
    bless(blessing.shift(), blessing.shift(), blessing.shift());
  });
})( /* Provide your own 'bless' to be used as above if custom behavior needed. */ );
