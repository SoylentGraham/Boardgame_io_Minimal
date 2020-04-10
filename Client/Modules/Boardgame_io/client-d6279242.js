import { A as ActionCreators, _ as _createClass, k as _objectSpread2, a as _classCallCheck, G as Game, C as CreateGameReducer, r as reset, u as undo, l as redo, M as MAKE_MOVE, n as GAME_EVENT, o as _toConsumableArray, R as RESET, U as UPDATE, p as SYNC } from './reducer-ccb19701.js';
import { compose, applyMiddleware, createStore } from '../Redux/redux.js';
import { D as Debug } from './Debug-d5432f0c.js';
import { I as InitializeGame } from './initialize-1f204261.js';

/**
 * createDispatchers
 *
 * Create action dispatcher wrappers with bound playerID and credentials
 */

function createDispatchers(storeActionType, innerActionNames, store, playerID, credentials, multiplayer) {
  return innerActionNames.reduce(function (dispatchers, name) {
    dispatchers[name] = function () {
      var assumedPlayerID = playerID; // In singleplayer mode, if the client does not have a playerID
      // associated with it, we attach the currentPlayer as playerID.

      if (!multiplayer && (playerID === null || playerID === undefined)) {
        var state = store.getState();
        assumedPlayerID = state.ctx.currentPlayer;
      }

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      store.dispatch(ActionCreators[storeActionType](name, args, assumedPlayerID, credentials));
    };

    return dispatchers;
  }, {});
} // Creates a set of dispatchers to make moves.


var createMoveDispatchers = createDispatchers.bind(null, 'makeMove'); // Creates a set of dispatchers to dispatch game flow events.

var createEventDispatchers = createDispatchers.bind(null, 'gameEvent'); // Creates a set of dispatchers to dispatch actions to plugins.

var createPluginDispatchers = createDispatchers.bind(null, 'plugin');
/**
 * Implementation of Client (see below).
 */

var _ClientImpl =
/*#__PURE__*/
function () {
  function _ClientImpl(_ref) {
    var _this = this;

    var game = _ref.game,
        debug = _ref.debug,
        numPlayers = _ref.numPlayers,
        multiplayer = _ref.multiplayer,
        gameID = _ref.gameID,
        playerID = _ref.playerID,
        credentials = _ref.credentials,
        enhancer = _ref.enhancer;

    _classCallCheck(this, _ClientImpl);

    this.game = Game(game);
    this.playerID = playerID;
    this.gameID = gameID;
    this.credentials = credentials;
    this.multiplayer = multiplayer;
    this.debug = debug;
    this.gameStateOverride = null;
    this.subscribers = {};
    this._running = false;
    this.reducer = CreateGameReducer({
      game: this.game,
      isClient: multiplayer !== undefined,
      numPlayers: numPlayers
    });
    this.initialState = null;

    if (!multiplayer) {
      this.initialState = InitializeGame({
        game: this.game,
        numPlayers: numPlayers
      });
    }

    this.reset = function () {
      _this.store.dispatch(reset(_this.initialState));
    };

    this.undo = function () {
      _this.store.dispatch(undo());
    };

    this.redo = function () {
      _this.store.dispatch(redo());
    };

    this.store = null;
    this.log = [];
    /**
     * Middleware that manages the log object.
     * Reducers generate deltalogs, which are log events
     * that are the result of application of a single action.
     * The master may also send back a deltalog or the entire
     * log depending on the type of request.
     * The middleware below takes care of all these cases while
     * managing the log object.
     */

    var LogMiddleware = function LogMiddleware(store) {
      return function (next) {
        return function (action) {
          var result = next(action);
          var state = store.getState();

          switch (action.type) {
            case MAKE_MOVE:
            case GAME_EVENT:
              {
                var deltalog = state.deltalog;
                _this.log = [].concat(_toConsumableArray(_this.log), _toConsumableArray(deltalog));
                break;
              }

            case RESET:
              {
                _this.log = [];
                break;
              }

            case UPDATE:
              {
                var id = -1;

                if (_this.log.length > 0) {
                  id = _this.log[_this.log.length - 1]._stateID;
                }

                var _deltalog = action.deltalog || []; // Filter out actions that are already present
                // in the current log. This may occur when the
                // client adds an entry to the log followed by
                // the update from the master here.


                _deltalog = _deltalog.filter(function (l) {
                  return l._stateID > id;
                });
                _this.log = [].concat(_toConsumableArray(_this.log), _toConsumableArray(_deltalog));
                break;
              }

            case SYNC:
              {
                _this.initialState = action.initialState;
                _this.log = action.log || [];
                break;
              }
          }

          return result;
        };
      };
    };
    /**
     * Middleware that intercepts actions and sends them to the master,
     * which keeps the authoritative version of the state.
     */


    var TransportMiddleware = function TransportMiddleware(store) {
      return function (next) {
        return function (action) {
          var baseState = store.getState();
          var result = next(action);

          if (action.clientOnly != true) {
            _this.transport.onAction(baseState, action);
          }

          return result;
        };
      };
    };
    /**
     * Middleware that intercepts actions and invokes the subscription callback.
     */


    var SubscriptionMiddleware = function SubscriptionMiddleware() {
      return function (next) {
        return function (action) {
          var result = next(action);

          _this.notifySubscribers();

          return result;
        };
      };
    };

    if (enhancer !== undefined) {
      enhancer = compose(applyMiddleware(SubscriptionMiddleware, TransportMiddleware, LogMiddleware), enhancer);
    } else {
      enhancer = applyMiddleware(SubscriptionMiddleware, TransportMiddleware, LogMiddleware);
    }

    this.store = createStore(this.reducer, this.initialState, enhancer);
    this.transport = {
      isConnected: true,
      onAction: function onAction() {},
      subscribe: function subscribe() {},
      subscribeGameMetadata: function subscribeGameMetadata(_metadata) {},
      // eslint-disable-line no-unused-vars
      connect: function connect() {},
      disconnect: function disconnect() {},
      updateGameID: function updateGameID() {},
      updatePlayerID: function updatePlayerID() {}
    };

    if (multiplayer) {
      // typeof multiplayer is 'function'
      this.transport = multiplayer({
        gameKey: game,
        game: this.game,
        store: this.store,
        gameID: gameID,
        playerID: playerID,
        gameName: this.game.name,
        numPlayers: numPlayers
      });
    }

    this.createDispatchers();
    this.transport.subscribeGameMetadata(function (metadata) {
      _this.gameMetadata = metadata;
    });
    this._debugPanel = null;
  }

  _createClass(_ClientImpl, [{
    key: "notifySubscribers",
    value: function notifySubscribers() {
      var _this2 = this;

      Object.values(this.subscribers).forEach(function (fn) {
        return fn(_this2.getState());
      });
    }
  }, {
    key: "overrideGameState",
    value: function overrideGameState(state) {
      this.gameStateOverride = state;
      this.notifySubscribers();
    }
  }, {
    key: "start",
    value: function start() {
      this.transport.connect();
      this._running = true;
      var debugImpl = null;

      if (process.env.NODE_ENV !== 'production') {
        debugImpl = Debug;
      }

      if (this.debug && this.debug.impl) {
        debugImpl = this.debug.impl;
      }

      if (debugImpl !== null && this.debug !== false && this._debugPanel == null && typeof document !== 'undefined') {
        var target = document.body;

        if (this.debug && this.debug.target !== undefined) {
          target = this.debug.target;
        }

        if (target) {
          this._debugPanel = new debugImpl({
            target: target,
            props: {
              client: this
            }
          });
        }
      }
    }
  }, {
    key: "stop",
    value: function stop() {
      this.transport.disconnect();
      this._running = false;

      if (this._debugPanel != null) {
        this._debugPanel.$destroy();

        this._debugPanel = null;
      }
    }
  }, {
    key: "subscribe",
    value: function subscribe(fn) {
      var _this3 = this;

      var id = Object.keys(this.subscribers).length;
      this.subscribers[id] = fn;
      this.transport.subscribe(function () {
        return _this3.notifySubscribers();
      });

      if (this._running || !this.multiplayer) {
        fn(this.getState());
      } // Return a handle that allows the caller to unsubscribe.


      return function () {
        delete _this3.subscribers[id];
      };
    }
  }, {
    key: "getInitialState",
    value: function getInitialState() {
      return this.initialState;
    }
  }, {
    key: "getState",
    value: function getState() {
      var state = this.store.getState();

      if (this.gameStateOverride !== null) {
        state = this.gameStateOverride;
      } // This is the state before a sync with the game master.


      if (state === null) {
        return state;
      } // isActive.


      var isActive = true;
      var isPlayerActive = this.game.flow.isPlayerActive(state.G, state.ctx, this.playerID);

      if (this.multiplayer && !isPlayerActive) {
        isActive = false;
      }

      if (!this.multiplayer && this.playerID !== null && this.playerID !== undefined && !isPlayerActive) {
        isActive = false;
      }

      if (state.ctx.gameover !== undefined) {
        isActive = false;
      } // Secrets are normally stripped on the server,
      // but we also strip them here so that game developers
      // can see their effects while prototyping.


      var G = this.game.playerView(state.G, state.ctx, this.playerID); // Combine into return value.

      var ret = _objectSpread2({}, state, {
        isActive: isActive,
        G: G,
        log: this.log
      });

      var isConnected = this.transport.isConnected;
      ret = _objectSpread2({}, ret, {
        isConnected: isConnected
      });
      return ret;
    }
  }, {
    key: "createDispatchers",
    value: function createDispatchers() {
      this.moves = createMoveDispatchers(this.game.moveNames, this.store, this.playerID, this.credentials, this.multiplayer);
      this.events = createEventDispatchers(this.game.flow.enabledEventNames, this.store, this.playerID, this.credentials, this.multiplayer);
      this.plugins = createPluginDispatchers(this.game.pluginNames, this.store, this.playerID, this.credentials, this.multiplayer);
    }
  }, {
    key: "updatePlayerID",
    value: function updatePlayerID(playerID) {
      this.playerID = playerID;
      this.createDispatchers();
      this.transport.updatePlayerID(playerID);
      this.notifySubscribers();
    }
  }, {
    key: "updateGameID",
    value: function updateGameID(gameID) {
      this.gameID = gameID;
      this.createDispatchers();
      this.transport.updateGameID(gameID);
      this.notifySubscribers();
    }
  }, {
    key: "updateCredentials",
    value: function updateCredentials(credentials) {
      this.credentials = credentials;
      this.createDispatchers();
      this.notifySubscribers();
    }
  }]);

  return _ClientImpl;
}();
/**
 * Client
 *
 * boardgame.io JS client.
 *
 * @param {...object} game - The return value of `Game`.
 * @param {...object} numPlayers - The number of players.
 * @param {...object} multiplayer - Set to a falsy value or a transportFactory, e.g., SocketIO()
 * @param {...object} gameID - The gameID that you want to connect to.
 * @param {...object} playerID - The playerID associated with this client.
 * @param {...string} credentials - The authentication credentials associated with this client.
 *
 * Returns:
 *   A JS object that provides an API to interact with the
 *   game by dispatching moves and events.
 */


function Client(opts) {
  return new _ClientImpl(opts);
}

export { Client as C };
