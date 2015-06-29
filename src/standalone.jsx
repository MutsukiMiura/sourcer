/** @jsx React.DOM */
var React = require('react');
var FieldTag = require('./views/FieldTag');

var worker = new Worker("dist/arena.js");
var frames = [];
var frame = 0;
var endOfGame = false;

var thinking = null;

var timeout = function() {
  console.log("timeout", thinking);
  endOfGame = true;
  worker.terminate();
};

var handler = null;

worker.addEventListener('message', function(e) {
  if(e.data.command === "PreThink") {
    thinking = e.data.index;
    handler = setTimeout(timeout, 10); // 10 milliseconds think timeout
  } else if(e.data.command === "PostThink") {
    thinking = null;
    clearTimeout(handler);
  } else if(e.data.command === "EndOfGame") {
    endOfGame = true;
  } else {
    frames.push(e.data.field);
  }
});

worker.postMessage({
  sources: [$("#player1").val(), $("#player2").val()]
});

var ScreenTag = React.createClass({
  render: function() {
    var width = this.props.width;
    var height = this.props.height;

    if(endOfGame) {
      var onValueChanged = function(newFrame) {
        frame = Math.floor(newFrame);
      };
      return (
        <svg width={width} height={height} viewBox={(-width / 2) + " 0 " + width + " " + height}>
          <FieldTag field={this.state.field} width={width} height={height} frameLength={frames.length} onValueChanged={onValueChanged} />
        </svg>
      );
    } else {
      return <p>Loading...</p>
    }
  },

  tick : function(){
    requestAnimationFrame(this.tick);

    if(endOfGame) {
      if(frame < frames.length) {
        this.setState({
          field: frames[frame]
        });
        frame++;
      }
    }
  },

  componentWillMount : function(){
    requestAnimationFrame( this.tick );
  }
});

var output = document.getElementById("screen");
React.render(<ScreenTag width="512" height="384" /> , output);
