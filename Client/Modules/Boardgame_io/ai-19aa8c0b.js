import { _ as _createClass, a as _classCallCheck, b as _defineProperty, m as makeMove, g as gameEvent, c as alea, d as _inherits, f as _possibleConstructorReturn, h as _getPrototypeOf, C as CreateGameReducer, i as _typeof } from './reducer-ccb19701.js';

/**
 * Base class that bots can extend.
 */

var Bot =
/*#__PURE__*/
function () {
  function Bot(_ref) {
    var _this = this;

    var enumerate = _ref.enumerate,
        seed = _ref.seed;

    _classCallCheck(this, Bot);

    _defineProperty(this, "enumerate", function (G, ctx, playerID) {
      var actions = _this.enumerateFn(G, ctx, playerID);

      return actions.map(function (a) {
        if (a.payload !== undefined) {
          return a;
        }

        if (a.move !== undefined) {
          return makeMove(a.move, a.args, playerID);
        }

        if (a.event !== undefined) {
          return gameEvent(a.event, a.args, playerID);
        }
      });
    });

    this.enumerateFn = enumerate;
    this.seed = seed;
    this.iterationCounter = 0;
    this._opts = {};
  }

  _createClass(Bot, [{
    key: "addOpt",
    value: function addOpt(_ref2) {
      var key = _ref2.key,
          range = _ref2.range,
          initial = _ref2.initial;
      this._opts[key] = {
        range: range,
        value: initial
      };
    }
  }, {
    key: "getOpt",
    value: function getOpt(key) {
      return this._opts[key].value;
    }
  }, {
    key: "setOpt",
    value: function setOpt(key, value) {
      if (key in this._opts) {
        this._opts[key].value = value;
      }
    }
  }, {
    key: "opts",
    value: function opts() {
      return this._opts;
    }
  }, {
    key: "random",
    value: function random(arg) {
      var number;

      if (this.seed !== undefined) {
        var r = null;

        if (this.prngstate) {
          r = new alea('', {
            state: this.prngstate
          });
        } else {
          r = new alea(this.seed, {
            state: true
          });
        }

        number = r();
        this.prngstate = r.state();
      } else {
        number = Math.random();
      }

      if (arg) {
        // eslint-disable-next-line unicorn/explicit-length-check
        if (arg.length) {
          var id = Math.floor(number * arg.length);
          return arg[id];
        } else {
          return Math.floor(number * arg);
        }
      }

      return number;
    }
  }]);

  return Bot;
}();

/**
 * The number of iterations to run before yielding to
 * the JS event loop (in async mode).
 */

var CHUNK_SIZE = 25;
/**
 * Bot that uses Monte-Carlo Tree Search to find promising moves.
 */

var MCTSBot =
/*#__PURE__*/
function (_Bot) {
  _inherits(MCTSBot, _Bot);

  function MCTSBot(_ref) {
    var _this;

    var enumerate = _ref.enumerate,
        seed = _ref.seed,
        objectives = _ref.objectives,
        game = _ref.game,
        iterations = _ref.iterations,
        playoutDepth = _ref.playoutDepth,
        iterationCallback = _ref.iterationCallback;

    _classCallCheck(this, MCTSBot);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(MCTSBot).call(this, {
      enumerate: enumerate,
      seed: seed
    }));

    if (objectives === undefined) {
      objectives = function objectives() {
        return {};
      };
    }

    _this.objectives = objectives;

    _this.iterationCallback = iterationCallback || function () {};

    _this.reducer = CreateGameReducer({
      game: game
    });
    _this.iterations = iterations;
    _this.playoutDepth = playoutDepth;

    _this.addOpt({
      key: 'async',
      initial: false
    });

    _this.addOpt({
      key: 'iterations',
      initial: typeof iterations === 'number' ? iterations : 1000,
      range: {
        min: 1,
        max: 2000
      }
    });

    _this.addOpt({
      key: 'playoutDepth',
      initial: typeof playoutDepth === 'number' ? playoutDepth : 50,
      range: {
        min: 1,
        max: 100
      }
    });

    return _this;
  }

  _createClass(MCTSBot, [{
    key: "createNode",
    value: function createNode(_ref2) {
      var state = _ref2.state,
          parentAction = _ref2.parentAction,
          parent = _ref2.parent,
          playerID = _ref2.playerID;
      var G = state.G,
          ctx = state.ctx;
      var actions = [];
      var objectives = [];

      if (playerID !== undefined) {
        actions = this.enumerate(G, ctx, playerID);
        objectives = this.objectives(G, ctx, playerID);
      } else if (ctx.activePlayers) {
        for (var _playerID in ctx.activePlayers) {
          actions = actions.concat(this.enumerate(G, ctx, _playerID));
          objectives = objectives.concat(this.objectives(G, ctx, _playerID));
        }
      } else {
        actions = actions.concat(this.enumerate(G, ctx, ctx.currentPlayer));
        objectives = objectives.concat(this.objectives(G, ctx, ctx.currentPlayer));
      }

      return {
        // Game state at this node.
        state: state,
        // Parent of the node.
        parent: parent,
        // Move used to get to this node.
        parentAction: parentAction,
        // Unexplored actions.
        actions: actions,
        // Current objectives.
        objectives: objectives,
        // Children of the node.
        children: [],
        // Number of simulations that pass through this node.
        visits: 0,
        // Number of wins for this node.
        value: 0
      };
    }
  }, {
    key: "select",
    value: function select(node) {
      // This node has unvisited children.
      if (node.actions.length > 0) {
        return node;
      } // This is a terminal node.


      if (node.children.length == 0) {
        return node;
      }

      var selectedChild = null;
      var best = 0.0;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = node.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var child = _step.value;
          var childVisits = child.visits + Number.EPSILON;
          var uct = child.value / childVisits + Math.sqrt(2 * Math.log(node.visits) / childVisits);

          if (selectedChild == null || uct > best) {
            best = uct;
            selectedChild = child;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return this.select(selectedChild);
    }
  }, {
    key: "expand",
    value: function expand(node) {
      var actions = node.actions;

      if (actions.length == 0 || node.state.ctx.gameover !== undefined) {
        return node;
      }

      var id = this.random(actions.length);
      var action = actions[id];
      node.actions.splice(id, 1);
      var childState = this.reducer(node.state, action);
      var childNode = this.createNode({
        state: childState,
        parentAction: action,
        parent: node
      });
      node.children.push(childNode);
      return childNode;
    }
  }, {
    key: "playout",
    value: function playout(node) {
      var _this2 = this;

      var state = node.state;
      var playoutDepth = this.getOpt('playoutDepth');

      if (typeof this.playoutDepth === 'function') {
        playoutDepth = this.playoutDepth(state.G, state.ctx);
      }

      var _loop = function _loop(i) {
        var _state = state,
            G = _state.G,
            ctx = _state.ctx;
        var playerID = ctx.currentPlayer;

        if (ctx.activePlayers) {
          playerID = Object.keys(ctx.activePlayers)[0];
        }

        var moves = _this2.enumerate(G, ctx, playerID); // Check if any objectives are met.


        var objectives = _this2.objectives(G, ctx);

        var score = Object.keys(objectives).reduce(function (score, key) {
          var objective = objectives[key];

          if (objective.checker(G, ctx)) {
            return score + objective.weight;
          }

          return score;
        }, 0.0); // If so, stop and return the score.

        if (score > 0) {
          return {
            v: {
              score: score
            }
          };
        }

        if (!moves || moves.length == 0) {
          return {
            v: undefined
          };
        }

        var id = _this2.random(moves.length);

        var childState = _this2.reducer(state, moves[id]);

        state = childState;
      };

      for (var i = 0; i < playoutDepth && state.ctx.gameover === undefined; i++) {
        var _ret = _loop();

        if (_typeof(_ret) === "object") return _ret.v;
      }

      return state.ctx.gameover;
    }
  }, {
    key: "backpropagate",
    value: function backpropagate(node) {
      var result = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      node.visits++;

      if (result.score !== undefined) {
        node.value += result.score;
      }

      if (result.draw === true) {
        node.value += 0.5;
      }

      if (node.parentAction && result.winner === node.parentAction.payload.playerID) {
        node.value++;
      }

      if (node.parent) {
        this.backpropagate(node.parent, result);
      }
    }
  }, {
    key: "play",
    value: function play(state, playerID) {
      var _this3 = this;

      var root = this.createNode({
        state: state,
        playerID: playerID
      });
      var numIterations = this.getOpt('iterations');

      if (typeof this.iterations === 'function') {
        numIterations = this.iterations(state.G, state.ctx);
      }

      var getResult = function getResult() {
        var selectedChild = null;
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = root.children[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var child = _step2.value;

            if (selectedChild == null || child.visits > selectedChild.visits) {
              selectedChild = child;
            }
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
              _iterator2["return"]();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        var action = selectedChild && selectedChild.parentAction;
        var metadata = root;
        return {
          action: action,
          metadata: metadata
        };
      };

      return new Promise(function (resolve) {
        var iteration = function iteration() {
          for (var i = 0; i < CHUNK_SIZE && _this3.iterationCounter < numIterations; i++) {
            var leaf = _this3.select(root);

            var child = _this3.expand(leaf);

            var result = _this3.playout(child);

            _this3.backpropagate(child, result);

            _this3.iterationCounter++;
          }

          _this3.iterationCallback({
            iterationCounter: _this3.iterationCounter,
            numIterations: numIterations,
            metadata: root
          });
        };

        _this3.iterationCounter = 0;

        if (_this3.getOpt('async')) {
          var asyncIteration = function asyncIteration() {
            if (_this3.iterationCounter < numIterations) {
              iteration();
              setTimeout(asyncIteration, 0);
            } else {
              resolve(getResult());
            }
          };

          asyncIteration();
        } else {
          while (_this3.iterationCounter < numIterations) {
            iteration();
          }

          resolve(getResult());
        }
      });
    }
  }]);

  return MCTSBot;
}(Bot);

/**
 * Bot that picks a move at random.
 */

var RandomBot =
/*#__PURE__*/
function (_Bot) {
  _inherits(RandomBot, _Bot);

  function RandomBot() {
    _classCallCheck(this, RandomBot);

    return _possibleConstructorReturn(this, _getPrototypeOf(RandomBot).apply(this, arguments));
  }

  _createClass(RandomBot, [{
    key: "play",
    value: function play(_ref, playerID) {
      var G = _ref.G,
          ctx = _ref.ctx;
      var moves = this.enumerate(G, ctx, playerID);
      return Promise.resolve({
        action: this.random(moves)
      });
    }
  }]);

  return RandomBot;
}(Bot);

/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */
/**
 * Make a single move on the client with a bot.
 *
 * @param {...object} client - The game client.
 * @param {...object} bot - The bot.
 */

async function Step(client, bot) {
  var state = client.store.getState();
  var playerID = state.ctx.currentPlayer;

  if (state.ctx.activePlayers) {
    playerID = Object.keys(state.ctx.activePlayers)[0];
  }

  var _ref = await bot.play(state, playerID),
      action = _ref.action,
      metadata = _ref.metadata;

  if (action) {
    action.payload.metadata = metadata;
    client.store.dispatch(action);
  }

  return action;
}
/**
 * Simulates the game till the end or a max depth.
 *
 * @param {...object} game - The game object.
 * @param {...object} bots - An array of bots.
 * @param {...object} state - The game state to start from.
 */

async function Simulate(_ref2) {
  var game = _ref2.game,
      bots = _ref2.bots,
      state = _ref2.state,
      depth = _ref2.depth;
  if (depth === undefined) depth = 10000;
  var reducer = CreateGameReducer({
    game: game,
    numPlayers: state.ctx.numPlayers
  });
  var metadata = null;
  var iter = 0;

  while (state.ctx.gameover === undefined && iter < depth) {
    var playerID = state.ctx.currentPlayer;

    if (state.ctx.activePlayers) {
      playerID = Object.keys(state.ctx.activePlayers)[0];
    }

    var bot = bots instanceof Bot ? bots : bots[playerID];
    var t = await bot.play(state, playerID);

    if (!t.action) {
      break;
    }

    metadata = t.metadata;
    state = reducer(state, t.action);
    iter++;
  }

  return {
    state: state,
    metadata: metadata
  };
}

export { Bot as B, MCTSBot as M, RandomBot as R, Step as S, Simulate as a };
