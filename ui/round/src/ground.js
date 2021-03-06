var chessground = require('chessground');
var round = require('./round');
var util = require('./util');

function makeConfig(data, fen, flip) {
  return {
    fen: fen,
    orientation: flip ? data.opponent.color : data.player.color,
    turnColor: data.game.player,
    lastMove: util.str2move(data.game.lastMove),
    check: data.game.check,
    coordinates: data.pref.coords !== 0,
    highlight: {
      lastMove: data.pref.highlight,
      check: data.pref.highlight,
      dragOver: true
    },
    movable: {
      free: false,
      color: round.isPlayerPlaying(data) ? data.player.color : null,
      dests: round.parsePossibleMoves(data.possibleMoves),
      showDests: data.pref.destination
    },
    animation: {
      enabled: true,
      duration: data.pref.animationDuration
    },
    premovable: {
      enabled: data.pref.enablePremove,
      showDests: data.pref.destination,
      events: {
        set: m.redraw,
        unset: m.redraw
      }
    },
    draggable: {
      showGhost: data.pref.highlight
    },
    events: {
      capture: $.sound.take
    }
  };
}

function make(data, fen, userMove) {
  var config = makeConfig(data, fen);
  config.movable.events = {
    after: userMove
  };
  config.viewOnly = data.player.spectator;
  return new chessground.controller(config);
}

function reload(ground, data, fen, flip) {
  ground.set(makeConfig(data, fen, flip));
}

function promote(ground, key, role) {
  var pieces = {};
  var piece = ground.data.pieces[key];
  if (piece && piece.role == 'pawn') {
    pieces[key] = {
      color: piece.color,
      role: role
    };
    ground.setPieces(pieces);
  }
}

function end(ground) {
  ground.stop();
}

module.exports = {
  make: make,
  reload: reload,
  promote: promote,
  end: end
};
