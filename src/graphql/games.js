import { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLList, GraphQLInputObjectType } from 'graphql';
import { loadGamesFromCSV, saveGamesToCSV } from '../routes/teams/games.js'; 

const GameType = new GraphQLObjectType({
    name: 'Game',
    fields: () => ({
        GAME_DATE_EST: { type: Date },
        GAME_ID: { type: GraphQLString },
        GAME_STATUS_TEXT: { type: GraphQLString },
        HOME_TEAM_ID: { type: GraphQLString },
        VISITOR_TEAM_ID: { type: GraphQLString },
        SEASON: { type: GraphQLString },
        PTS_home: { type: GraphQLInt },
        PTS_away: { type: GraphQLInt }
    })
});


const GameInputType = new GraphQLInputObjectType({
    name: 'GameInput',
    fields: () => ({
        GAME_DATE_EST: { type: Date },
        GAME_ID: { type: GraphQLString },
        GAME_STATUS_TEXT: { type: GraphQLString },
        HOME_TEAM_ID: { type: GraphQLString },
        VISITOR_TEAM_ID: { type: GraphQLString },
        SEASON: { type: GraphQLString },
        PTS_home: { type: GraphQLInt },
        PTS_away: { type: GraphQLInt }
    })
});


const GameFilterType = new GraphQLInputObjectType({
    name: 'GameFilter',
    fields: () => ({
        GAME_ID: { type: GraphQLString },
        HOME_TEAM_ID: { type: GraphQLString },
        VISITOR_TEAM_ID: { type: GraphQLString },
    
        SEASON: { type: GraphQLString }, 
    })
});

const GameQuery = {
    type: new GraphQLList(GameType),
    args: {
        filter: { type: GameFilterType },
        sort: { type: GraphQLString },
        page: { type: GraphQLInt },
        limit: { type: GraphQLInt }
    },
    resolve(parent, args) {
        return loadGamesFromCSV().then(games => {
            let filteredGames = games;

            if (args.filter) {
                if (args.filter.GAME_ID) {
                    filteredGames = filteredGames.filter(game => game.GAME_ID === args.filter.GAME_ID);
                }
                if (args.filter.HOME_TEAM_ID) {
                    filteredGames = filteredGames.filter(game => game.HOME_TEAM_ID === args.filter.HOME_TEAM_ID);
                }
                if (args.filter.VISITOR_TEAM_ID) {
                    filteredGames = filteredGames.filter(game => game.VISITOR_TEAM_ID === args.filter.VISITOR_TEAM_ID);
                }
                if (args.filter.SEASON) {
                    filteredGames = filteredGames.filter(game => game.SEASON === args.filter.SEASON);
                }
            }

            if (args.sort) {
                const [field, order] = args.sort.split(':');
                filteredGames = filteredGames.sort((a, b) => {
                    if (order === 'desc') {
                        return a[field] < b[field] ? 1 : -1;
                    }
                    return a[field] > b[field] ? 1 : -1;
                });
            }

            const page = args.page || 1;
            const limit = args.limit || 10;
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedGames = filteredGames.slice(startIndex, endIndex);

            return paginatedGames;
        });
    }
};


const GameMutation = {
    type: GameType,
    args: {
        gameInput: { type: GameInputType }
    },
    async resolve(parent, args) {
        const fs = require('fs').promises;
        const path = require('path');
        const csvWriter = require('csv-write-stream');

        try {
            const existingGames = await loadGamesFromCSV();
            const gameExists = existingGames.some(game => game.GAME_ID === args.gameInput.GAME_ID);

            if (gameExists) {
                throw new Error('Mecz o tym ID już istnieje');
            }

            const newGame = args.gameInput;
            existingGames.push(newGame);

            const writer = csvWriter();
            const writeStream = fs.createWriteStream(path.resolve(__dirname, '../data/games.csv'));
            writer.pipe(writeStream);
            existingGames.forEach(game => writer.write(game));
            writer.end();

            return newGame;
        } catch (error) {
            throw new Error(`Błąd podczas dodawania meczu: ${error.message}`);
        }
    }
};

const UpdateGameMutation = {
    type: GameType,
    args: {
        gameId: { type: GraphQLString },
        gameInput: { type: GameInputType }
    },
    async resolve(parent, args) {
        const fs = require('fs').promises;
        const path = require('path');
        const csvWriter = require('csv-write-stream');

        try {
            const existingGames = await loadGamesFromCSV();
            const gameIndex = existingGames.findIndex(game => game.GAME_ID === args.gameId);

            if (gameIndex === -1) {
                throw new Error('Mecz o podanym GAME_ID nie istnieje');
            }

            const updatedGame = { ...existingGames[gameIndex], ...args.gameInput };
            existingGames[gameIndex] = updatedGame;

            const writer = csvWriter();
            const writeStream = fs.createWriteStream(path.resolve(__dirname, '../data/games.csv'));
            writer.pipe(writeStream);
            existingGames.forEach(game => writer.write(game));
            writer.end();

            return updatedGame;
        } catch (error) {
            throw new Error(`Błąd podczas aktualizacji meczu: ${error.message}`);
        }
    }
};

const DeleteGameMutation = {
    type: GameType,
    args: {
        gameId: { type: GraphQLString }
    },
    async resolve(parent, args) {
        const fs = require('fs').promises;
        const path = require('path');
        const csvWriter = require('csv-write-stream');

        try {
            const existingGames = await loadGamesFromCSV();
            const gameIndex = existingGames.findIndex(game => game.GAME_ID === args.gameId);

            if (gameIndex === -1) {
                throw new Error('Mecz o podanym GAME_ID nie istnieje');
            }

            const deletedGame = existingGames.splice(gameIndex, 1)[0];

            const writer = csvWriter();
            const writeStream = fs.createWriteStream(path.resolve(__dirname, '../data/games.csv'));
            writer.pipe(writeStream);
            existingGames.forEach(game => writer.write(game));
            writer.end();

            return deletedGame;
        } catch (error) {
            throw new Error(`Błąd podczas usuwania meczu: ${error.message}`);
        }
    }
};

export { GameQuery, GameMutation, UpdateGameMutation, DeleteGameMutation }; 