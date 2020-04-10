import { a as _classCallCheck, k as _objectSpread2, d as _inherits, f as _possibleConstructorReturn, h as _getPrototypeOf, _ as _createClass, s as sync, o as _toConsumableArray, w as update, r as reset } from './reducer-ccb19701.js';
import { S as Sync } from './base-c99f5be2.js';
import { M as Master } from './master-f9c0602c.js';
import io from 'socket.io-client';

/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */
/**
 * InMemory data storage.
 */
class InMemory extends Sync {
    /**
     * Creates a new InMemory storage.
     */
    constructor() {
        super();
        this.state = new Map();
        this.initial = new Map();
        this.metadata = new Map();
        this.log = new Map();
    }
    /**
     * Create a new game.
     */
    createGame(gameID, opts) {
        this.initial.set(gameID, opts.initialState);
        this.setState(gameID, opts.initialState);
        this.setMetadata(gameID, opts.metadata);
    }
    /**
     * Write the game metadata to the in-memory object.
     */
    setMetadata(gameID, metadata) {
        this.metadata.set(gameID, metadata);
    }
    /**
     * Write the game state to the in-memory object.
     */
    setState(gameID, state, deltalog) {
        if (deltalog && deltalog.length > 0) {
            const log = this.log.get(gameID) || [];
            this.log.set(gameID, log.concat(deltalog));
        }
        this.state.set(gameID, state);
    }
    /**
     * Fetches state for a particular gameID.
     */
    fetch(gameID, opts) {
        let result = {};
        if (opts.state) {
            result.state = this.state.get(gameID);
        }
        if (opts.metadata) {
            result.metadata = this.metadata.get(gameID);
        }
        if (opts.log) {
            result.log = this.log.get(gameID) || [];
        }
        if (opts.initialState) {
            result.initialState = this.initial.get(gameID);
        }
        return result;
    }
    /**
     * Remove the game state from the in-memory object.
     */
    wipe(gameID) {
        this.state.delete(gameID);
        this.metadata.delete(gameID);
    }
    /**
     * Return all keys.
     */
    listGames(opts) {
        if (opts && opts.gameName !== undefined) {
            let gameIDs = [];
            this.metadata.forEach((metadata, gameID) => {
                if (metadata.gameName === opts.gameName) {
                    gameIDs.push(gameID);
                }
            });
            return gameIDs;
        }
        return [...this.metadata.keys()];
    }
}

/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */
var Transport = function Transport(_ref) {
  var store = _ref.store,
      gameName = _ref.gameName,
      playerID = _ref.playerID,
      gameID = _ref.gameID,
      numPlayers = _ref.numPlayers;

  _classCallCheck(this, Transport);

  this.store = store;
  this.gameName = gameName || 'default';
  this.playerID = playerID || null;
  this.gameID = gameID || 'default';
  this.numPlayers = numPlayers || 2;
};

/**
 * Returns null if it is not a bot's turn.
 * Otherwise, returns a playerID of a bot that may play now.
 */

function GetBotPlayer(state, bots) {
  if (state.ctx.gameover !== undefined) {
    return null;
  }

  if (state.ctx.stage) {
    for (var _i = 0, _Object$keys = Object.keys(bots); _i < _Object$keys.length; _i++) {
      var key = _Object$keys[_i];

      if (key in state.ctx.stage) {
        return key;
      }
    }
  } else if (state.ctx.currentPlayer in bots) {
    return state.ctx.currentPlayer;
  }

  return null;
}
/**
 * Creates a local version of the master that the client
 * can interact with.
 */

function LocalMaster(_ref) {
  var game = _ref.game,
      bots = _ref.bots;
  var clientCallbacks = {};
  var initializedBots = {};

  if (game && game.ai && bots) {
    for (var playerID in bots) {
      var bot = bots[playerID];
      initializedBots[playerID] = new bot({
        game: game,
        enumerate: game.ai.enumerate,
        seed: game.seed
      });
    }
  }

  var send = function send(_ref2) {
    var type = _ref2.type,
        playerID = _ref2.playerID,
        args = _ref2.args;
    var callback = clientCallbacks[playerID];

    if (callback !== undefined) {
      callback.apply(null, [type].concat(_toConsumableArray(args)));
    }
  };

  var sendAll = function sendAll(arg) {
    for (var _playerID in clientCallbacks) {
      var _arg = arg(_playerID),
          type = _arg.type,
          args = _arg.args;

      send({
        type: type,
        playerID: _playerID,
        args: args
      });
    }
  };

  var master = new Master(game, new InMemory(), {
    send: send,
    sendAll: sendAll
  }, false);

  master.connect = function (gameID, playerID, callback) {
    clientCallbacks[playerID] = callback;
  };

  master.subscribe(function (_ref3) {
    var state = _ref3.state,
        gameID = _ref3.gameID;

    if (!bots) {
      return;
    }

    var botPlayer = GetBotPlayer(state, initializedBots);

    if (botPlayer !== null) {
      setTimeout(async function () {
        var botAction = await initializedBots[botPlayer].play(state, botPlayer);
        await master.onUpdate(botAction.action, state._stateID, gameID, botAction.action.payload.playerID);
      }, 100);
    }
  });
  return master;
}
/**
 * Local
 *
 * Transport interface that embeds a GameMaster within it
 * that you can connect multiple clients to.
 */

var LocalTransport =
/*#__PURE__*/
function (_Transport) {
  _inherits(LocalTransport, _Transport);

  /**
   * Creates a new Mutiplayer instance.
   * @param {object} socket - Override for unit tests.
   * @param {object} socketOpts - Options to pass to socket.io.
   * @param {string} gameID - The game ID to connect to.
   * @param {string} playerID - The player ID associated with this client.
   * @param {string} gameName - The game type (the `name` field in `Game`).
   * @param {string} numPlayers - The number of players.
   * @param {string} server - The game server in the form of 'hostname:port'. Defaults to the server serving the client if not provided.
   */
  function LocalTransport(_ref4) {
    var _this;

    var master = _ref4.master,
        game = _ref4.game,
        store = _ref4.store,
        gameID = _ref4.gameID,
        playerID = _ref4.playerID,
        gameName = _ref4.gameName,
        numPlayers = _ref4.numPlayers;

    _classCallCheck(this, LocalTransport);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(LocalTransport).call(this, {
      store: store,
      gameName: gameName,
      playerID: playerID,
      gameID: gameID,
      numPlayers: numPlayers
    }));
    _this.master = master;
    _this.game = game;
    _this.isConnected = true;
    return _this;
  }
  /**
   * Called when another player makes a move and the
   * master broadcasts the update to other clients (including
   * this one).
   */


  _createClass(LocalTransport, [{
    key: "onUpdate",
    value: async function onUpdate(gameID, state, deltalog) {
      var currentState = this.store.getState();

      if (gameID == this.gameID && state._stateID >= currentState._stateID) {
        var action = update(state, deltalog);
        this.store.dispatch(action);
      }
    }
    /**
     * Called when the client first connects to the master
     * and requests the current game state.
     */

  }, {
    key: "onSync",
    value: function onSync(gameID, syncInfo) {
      if (gameID == this.gameID) {
        var action = sync(syncInfo);
        this.store.dispatch(action);
      }
    }
    /**
     * Called when an action that has to be relayed to the
     * game master is made.
     */

  }, {
    key: "onAction",
    value: function onAction(state, action) {
      this.master.onUpdate(action, state._stateID, this.gameID, this.playerID);
    }
    /**
     * Connect to the master.
     */

  }, {
    key: "connect",
    value: function connect() {
      var _this2 = this;

      this.master.connect(this.gameID, this.playerID, function (type) {
        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        if (type == 'sync') {
          _this2.onSync.apply(_this2, args);
        }

        if (type == 'update') {
          _this2.onUpdate.apply(_this2, args);
        }
      });
      this.master.onSync(this.gameID, this.playerID, this.numPlayers);
    }
    /**
     * Disconnect from the master.
     */

  }, {
    key: "disconnect",
    value: function disconnect() {}
    /**
     * Subscribe to connection state changes.
     */

  }, {
    key: "subscribe",
    value: function subscribe() {}
  }, {
    key: "subscribeGameMetadata",
    value: function subscribeGameMetadata(_metadata) {} // eslint-disable-line no-unused-vars

    /**
     * Updates the game id.
     * @param {string} id - The new game id.
     */

  }, {
    key: "updateGameID",
    value: function updateGameID(id) {
      this.gameID = id;
      var action = reset(null);
      this.store.dispatch(action);
      this.connect();
    }
    /**
     * Updates the player associated with this client.
     * @param {string} id - The new player id.
     */

  }, {
    key: "updatePlayerID",
    value: function updatePlayerID(id) {
      this.playerID = id;
      var action = reset(null);
      this.store.dispatch(action);
      this.connect();
    }
  }]);

  return LocalTransport;
}(Transport);
var localMasters = new Map();
function Local(opts) {
  return function (transportOpts) {
    var master;

    if (localMasters.has(transportOpts.gameKey) & !opts) {
      master = localMasters.get(transportOpts.gameKey);
    } else {
      master = new LocalMaster({
        game: transportOpts.game,
        bots: opts && opts.bots
      });
      localMasters.set(transportOpts.gameKey, master);
    }

    return new LocalTransport(_objectSpread2({
      master: master
    }, transportOpts));
  };
}

/**
 * SocketIO
 *
 * Transport interface that interacts with the Master via socket.io.
 */

var SocketIOTransport =
/*#__PURE__*/
function (_Transport) {
  _inherits(SocketIOTransport, _Transport);

  /**
   * Creates a new Mutiplayer instance.
   * @param {object} socket - Override for unit tests.
   * @param {object} socketOpts - Options to pass to socket.io.
   * @param {string} gameID - The game ID to connect to.
   * @param {string} playerID - The player ID associated with this client.
   * @param {string} gameName - The game type (the `name` field in `Game`).
   * @param {string} numPlayers - The number of players.
   * @param {string} server - The game server in the form of 'hostname:port'. Defaults to the server serving the client if not provided.
   */
  function SocketIOTransport() {
    var _this;

    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        socket = _ref.socket,
        socketOpts = _ref.socketOpts,
        store = _ref.store,
        gameID = _ref.gameID,
        playerID = _ref.playerID,
        gameName = _ref.gameName,
        numPlayers = _ref.numPlayers,
        server = _ref.server;

    _classCallCheck(this, SocketIOTransport);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(SocketIOTransport).call(this, {
      store: store,
      gameName: gameName,
      playerID: playerID,
      gameID: gameID,
      numPlayers: numPlayers
    }));
    _this.server = server;
    _this.socket = socket;
    _this.socketOpts = socketOpts;
    _this.isConnected = false;

    _this.callback = function () {};

    _this.gameMetadataCallback = function () {};

    return _this;
  }
  /**
   * Called when an action that has to be relayed to the
   * game master is made.
   */


  _createClass(SocketIOTransport, [{
    key: "onAction",
    value: function onAction(state, action) {
      this.socket.emit('update', action, state._stateID, this.gameID, this.playerID);
    }
    /**
     * Connect to the server.
     */

  }, {
    key: "connect",
    value: function connect() {
      var _this2 = this;

      if (!this.socket) {
        if (this.server) {
          var server = this.server;

          if (server.search(/^https?:\/\//) == -1) {
            server = 'http://' + this.server;
          }

          if (server.substr(-1) != '/') {
            // add trailing slash if not already present
            server = server + '/';
          }

          this.socket = io(server + this.gameName, this.socketOpts);
        } else {
          this.socket = io('/' + this.gameName, this.socketOpts);
        }
      } // Called when another player makes a move and the
      // master broadcasts the update to other clients (including
      // this one).


      this.socket.on('update', function (gameID, state, deltalog) {
        var currentState = _this2.store.getState();

        if (gameID == _this2.gameID && state._stateID >= currentState._stateID) {
          var action = update(state, deltalog);

          _this2.store.dispatch(action);
        }
      }); // Called when the client first connects to the master
      // and requests the current game state.

      this.socket.on('sync', function (gameID, syncInfo) {
        if (gameID == _this2.gameID) {
          var action = sync(syncInfo);

          _this2.gameMetadataCallback(syncInfo.filteredMetadata);

          _this2.store.dispatch(action);
        }
      }); // Initial sync to get game state.

      this.socket.emit('sync', this.gameID, this.playerID, this.numPlayers); // Keep track of connection status.

      this.socket.on('connect', function () {
        _this2.isConnected = true;

        _this2.callback();
      });
      this.socket.on('disconnect', function () {
        _this2.isConnected = false;

        _this2.callback();
      });
    }
    /**
     * Disconnect from the server.
     */

  }, {
    key: "disconnect",
    value: function disconnect() {
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
      this.callback();
    }
    /**
     * Subscribe to connection state changes.
     */

  }, {
    key: "subscribe",
    value: function subscribe(fn) {
      this.callback = fn;
    }
  }, {
    key: "subscribeGameMetadata",
    value: function subscribeGameMetadata(fn) {
      this.gameMetadataCallback = fn;
    }
    /**
     * Updates the game id.
     * @param {string} id - The new game id.
     */

  }, {
    key: "updateGameID",
    value: function updateGameID(id) {
      this.gameID = id;
      var action = reset(null);
      this.store.dispatch(action);

      if (this.socket) {
        this.socket.emit('sync', this.gameID, this.playerID, this.numPlayers);
      }
    }
    /**
     * Updates the player associated with this client.
     * @param {string} id - The new player id.
     */

  }, {
    key: "updatePlayerID",
    value: function updatePlayerID(id) {
      this.playerID = id;
      var action = reset(null);
      this.store.dispatch(action);

      if (this.socket) {
        this.socket.emit('sync', this.gameID, this.playerID, this.numPlayers);
      }
    }
  }]);

  return SocketIOTransport;
}(Transport);
function SocketIO() {
  var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      server = _ref2.server,
      socketOpts = _ref2.socketOpts;

  return function (transportOpts) {
    return new SocketIOTransport(_objectSpread2({
      server: server,
      socketOpts: socketOpts
    }, transportOpts));
  };
}

export { Local as L, SocketIO as S };
