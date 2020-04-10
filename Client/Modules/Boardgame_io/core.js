export { q as ActivePlayers, I as INVALID_MOVE, t as Stage, T as TurnOrder } from './reducer-ccb19701.js';
import 'https://unpkg.com/immer@0.8.0/dist/immer.module.js';

/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */
/**
 * PlayerView reducers.
 */
const PlayerView = {
    /**
     * STRIP_SECRETS
     *
     * Reducer which removes a key named `secret` and
     * removes all the keys in `players`, except for the one
     * corresponding to the current playerID.
     */
    STRIP_SECRETS: (G, ctx, playerID) => {
        let r = { ...G };
        if (r.secret !== undefined) {
            delete r.secret;
        }
        if (r.players) {
            r.players = {
                [playerID]: r.players[playerID],
            };
        }
        return r;
    },
};

export { PlayerView };
