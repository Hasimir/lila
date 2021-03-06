var m = require('mithril');
var chessground = require('chessground');
var round = require('../round');
var status = require('../status');
var opposite = chessground.util.opposite;
var renderClock = require('../clock/view');
var renderReplay = require('../replay/view');
var renderStatus = require('./status');
var renderUser = require('./user');
var button = require('./button');
var c = require('chess.js');

function compact(x) {
  if (Object.prototype.toString.call(x) === '[object Array]') {
    var elems = x.filter(function(n) {
      return n !== undefined
    });
    return elems.length > 0 ? elems : null;
  }
  return x;
}

function renderPlayer(ctrl, player) {
  return player.ai ? m('div.username.on-game', [
    ctrl.trans('aiNameLevelAiLevel', 'Stockfish', player.ai),
    m('span.status')
  ]) : m('div', {
      class: 'username ' + player.color + (player.onGame ? ' on-game' : '')
    },
    renderUser(ctrl, player)
  );
}

var loader = m('div.loader', m('span'));

function renderKing(ctrl, color) {
  return m('div.no-square', (ctrl.vm.reloading || ctrl.vm.redirecting) ? loader : m('div.cg-piece.king.' + color));
}

function renderResult(ctrl) {
  var winner = round.getPlayer(ctrl.data, ctrl.data.game.winner);
  return winner ? m('div.player.' + winner.color, [
      renderKing(ctrl, winner.color),
      m('p', [
        renderStatus(ctrl),
        m('br'),
        ctrl.trans(winner.color == 'white' ? 'whiteIsVictorious' : 'blackIsVictorious')
      ])
    ]) :
    m('div.player', [
      (ctrl.vm.reloading || ctrl.vm.redirecting) ? m('div.no-square', loader) : null,
      m('p', renderStatus(ctrl))
    ]);
}

function renderTableEnd(ctrl) {
  var d = ctrl.data;
  var buttons = compact(ctrl.vm.redirecting ? null : (
    button.backToTournament(ctrl) || button.joinRematch(ctrl) || [
      button.answerOpponentRematch(ctrl) || button.cancelRematch(ctrl) || button.rematch(ctrl),
      button.newGame(ctrl)
    ]));
  return [
    buttons ? m('div.control.buttons', buttons) : null,
    renderReplay(ctrl.replay)
  ];
}

function renderTableWatch(ctrl) {
  var d = ctrl.data;
  var buttons = compact(ctrl.vm.redirecting ? null : [
    button.viewRematch(ctrl),
    button.viewTournament(ctrl)
  ]);
  return [
    buttons ? m('div.control.buttons', buttons) : null,
    renderReplay(ctrl.replay),
    renderPlayer(ctrl, d.player)
  ];
}

function renderTablePlay(ctrl) {
  var d = ctrl.data;
  var buttons = compact([
    button.forceResign(ctrl),
    button.threefoldClaimDraw(ctrl),
    button.cancelDrawOffer(ctrl),
    button.answerOpponentDrawOffer(ctrl),
    button.cancelTakebackProposition(ctrl),
    button.answerOpponentTakebackProposition(ctrl), (round.mandatory(d) && round.nbMoves(d, d.player.color) === 0) ? m('div[data-icon=j]',
      ctrl.trans('youHaveNbSecondsToMakeYourFirstMove', 30)
    ) : null
  ]);
  return [
    m('div.control.icons', [
      button.standard(ctrl, round.abortable, 'L', 'abortGame', 'abort'),
      button.standard(ctrl, round.takebackable, 'i', 'proposeATakeback', 'takeback-yes'),
      button.standard(ctrl, round.drawable, '2', 'offerDraw', 'draw-yes'),
      button.standard(ctrl, round.resignable, 'b', 'resign', 'resign')
    ]),
    buttons ? m('div.control.buttons', buttons) : null,
    renderReplay(ctrl.replay),
    m('div.whos_turn',
      ctrl.trans(d.game.player == d.player.color ? 'yourTurn' : 'waitingForOpponent'))
  ];
}

module.exports = function(ctrl) {
  var clockRunningColor = ctrl.isClockRunning() ? ctrl.data.game.player : null;
  return m('div.table_wrap', [
    (ctrl.clock && !ctrl.data.blindMode) ? renderClock(ctrl.clock, opposite(ctrl.data.player.color), "top", clockRunningColor) : null,
    m('div', {
      class: 'table' + (status.finished(ctrl.data) ? ' finished' : '')
    }, [
      renderPlayer(ctrl, ctrl.data.opponent),
      m('div.table_inner',
        ctrl.data.player.spectator ? renderTableWatch(ctrl) : (
          round.playable(ctrl.data) ? renderTablePlay(ctrl) : renderTableEnd(ctrl)
        )
      )
    ]), (ctrl.clock && !ctrl.data.blindMode) ? [
      renderClock(ctrl.clock, ctrl.data.player.color, "bottom", clockRunningColor),
      button.moretime(ctrl)
    ] : null
  ])
}
