// Generated by CoffeeScript 1.9.3
(function() {
  var SourcerAi,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  SourcerAi = (function() {
    function SourcerAi() {
      this.think = bind(this.think, this);
      this.port = bind(this.port, this);
    }

    SourcerAi.prototype.port = function(ctrl) {
      return this.think(ctrl);
    };

    SourcerAi.prototype.think = function(ctrl) {
      if (ctrl.altitude() < 100) {
        return ctrl.ascent();
      }
    };

    return SourcerAi;

  })();

  module.exports = new SourcerAi().port;

}).call(this);
