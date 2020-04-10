//const Server = require('boardgame.io/server').Server;
const { Server, FlatFile } = require('boardgame.io/server');
//const { TicTacToe } = require('./game');

const db_flatfile = new FlatFile({
				 dir: './storage/directory',
				 logging: true,
				// ttl: (optional, see node-persist docs),
				});


const TicTacToe = {
setup: () => ({ cells: Array(9).fill(null) }),
	
moves: {
clickCell: (G, ctx, id) => {
	if (G.cells[id] === null) {
		G.cells[id] = ctx.currentPlayer;
	}
},
},
	
endIf: (G, ctx) => {
	if (IsVictory(G.cells)) {
		return { winner: ctx.currentPlayer };
	}
	if (IsDraw(G.cells)) {
		return { draw: true };
	}
},
};


const server = Server({
					  games: [TicTacToe],
					  
					  db: db_flatfile,
					  });

server.run(8000);

