import { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLList, GraphQLInputObjectType } from 'graphql';
import { loadGamesFromCSV, saveGamesToCSV } from '../routes/teams/games.js'; // Importuj funkcje do ładowania i zapisywania danych

const GameType = new GraphQLObjectType({
    name: 'Game',
    fields: () => ({
        GAME_DATE_EST: { type: GraphQLString },
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
        GAME_DATE_EST: { type: GraphQLString },
        GAME_ID: { type: GraphQLString },
        GAME_STATUS_TEXT: { type: GraphQLString },
        HOME_TEAM_ID: { type: GraphQLString },
        VISITOR_TEAM_ID: { type: GraphQLString },
        SEASON: { type: GraphQLString },
        PTS_home: { type: GraphQLInt },
        PTS_away: { type: GraphQLInt }
    })
});


const GameQuery = {
    type: new GraphQLList(GameType),
    resolve(parent, args) {
        return loadGamesFromCSV();
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