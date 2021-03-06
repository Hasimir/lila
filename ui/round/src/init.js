var title = require('./title');
var blur = require('./blur');
var round = require('./round');
var status = require('./status');
var keyboard = require('./replay/keyboard');

module.exports = function(ctrl) {

  var d = ctrl.data;

  title.init(ctrl);
  ctrl.setTitle();

  blur.init(ctrl);

  if (round.isPlayerPlaying(d) && round.nbMoves(d, d.player.color) === 0) $.sound.dong();

  if (round.isPlayerPlaying(d)) window.addEventListener('beforeunload', function(e) {
    if (!lichess.hasToReload && !ctrl.data.blind && round.playable(ctrl.data) && ctrl.data.clock) {
      ctrl.socket.send('bye');
      var msg = 'There is a game in progress!';
      (e || window.event).returnValue = msg;
      return msg;
    }
  });

  keyboard.init(ctrl);
};
