import { GraphQLObjectType, GraphQLString, GraphQLList, GraphQLInputObjectType, GraphQLInt } from 'graphql';
import { loadPlayersFromCSV, savePlayersToCSV } from '../routes/teams/players.js'; 


const PlayerType = new GraphQLObjectType({
    name: 'Player',
    fields: () => ({
        PLAYER_NAME: { type: GraphQLString },
        TEAM_ID: { type: GraphQLString },
        PLAYER_ID: { type: GraphQLString },
        SEASON: { type: GraphQLString }
    })
});


const PlayerInputType = new GraphQLInputObjectType({
    name: 'PlayerInput',
    fields: () => ({
        PLAYER_NAME: { type: GraphQLString },
        TEAM_ID: { type: GraphQLString },
        PLAYER_ID: { type: GraphQLString },
        SEASON: { type: GraphQLString }
    })
});


const PlayerFilterType = new GraphQLInputObjectType({
    name: 'PlayerFilter',
    fields: () => ({
        PLAYER_NAME: { type: GraphQLString },
        TEAM_ID: { type: GraphQLString },
        SEASON: { type: GraphQLString },
        PLAYER_ID: { type: GraphQLString },
    })
});


const PlayerQuery = {
    type: new GraphQLList(PlayerType),
    args: {
        filter: { type: PlayerFilterType },
        sort: { type: GraphQLString },
        page: { type: GraphQLInt },
        limit: { type: GraphQLInt }
    },
    resolve(parent, args) {
        return loadPlayersFromCSV().then(players => {
            let filteredPlayers = players;

            if (args.filter) {
                if (args.filter.PLAYER_NAME) {
                    filteredPlayers = filteredPlayers.filter(player => player.PLAYER_NAME.includes(args.filter.PLAYER_NAME));
                }
                if (args.filter.TEAM_ID) {
                    filteredPlayers = filteredPlayers.filter(player => player.TEAM_ID === args.filter.TEAM_ID);
                }
                if (args.filter.SEASON) {
                    filteredPlayers = filteredPlayers.filter(player => player.SEASON === args.filter.SEASON);
                }
                if (args.filter.PLAYER_ID) {
                    filteredPlayers = filteredPlayers.filter(player => player.PLAYER_ID === args.filter.PLAYER_ID);
                }
            }

            if (args.sort) {
                const [field, order] = args.sort.split(':');
                filteredPlayers = filteredPlayers.sort((a, b) => {
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
            const paginatedPlayers = filteredPlayers.slice(startIndex, endIndex);

            return paginatedPlayers;
        });
    }
};


const PlayerMutation = {
    type: PlayerType,
    args: {
        playerInput: { type: PlayerInputType }
    },
    async resolve(parent, args) {
        const fs = require('fs').promises;
        const path = require('path');
        const csvWriter = require('csv-write-stream');

        try {
            const existingPlayers = await loadPlayersFromCSV();
            const playerExists = existingPlayers.some(player => player.PLAYER_ID === args.playerInput.PLAYER_ID);

            if (playerExists) {
                throw new Error('Gracz o tym ID już istnieje');
            }

            const newPlayer = args.playerInput;
            existingPlayers.push(newPlayer);

            const writer = csvWriter();
            const writeStream = fs.createWriteStream(path.resolve(__dirname, '../data/players.csv'));
            writer.pipe(writeStream);
            existingPlayers.forEach(player => writer.write(player));
            writer.end();

            return newPlayer;
        } catch (error) {
            throw new Error(`Błąd podczas dodawania gracza: ${error.message}`);
        }
    }
};


const UpdatePlayerMutation = {
    type: PlayerType,
    args: {
        playerId: { type: GraphQLString },
        playerInput: { type: PlayerInputType }
    },
    async resolve(parent, args) {
        const fs = require('fs').promises;
        const path = require('path');
        const csvWriter = require('csv-write-stream');

        try {
            const existingPlayers = await loadPlayersFromCSV();
            const playerIndex = existingPlayers.findIndex(player => player.PLAYER_ID === args.playerId);

            if (playerIndex === -1) {
                throw new Error('Gracz o podanym PLAYER_ID nie istnieje');
            }

            const updatedPlayer = { ...existingPlayers[playerIndex], ...args.playerInput };
            existingPlayers[playerIndex] = updatedPlayer;

            const writer = csvWriter();
            const writeStream = fs.createWriteStream(path.resolve(__dirname, '../data/players.csv'));
            writer.pipe(writeStream);
            existingPlayers.forEach(player => writer.write(player));
            writer.end();

            return updatedPlayer;
        } catch (error) {
            throw new Error(`Błąd podczas aktualizacji gracza: ${error.message}`);
        }
    }
};


const DeletePlayerMutation = {
    type: PlayerType,
    args: {
        playerId: { type: GraphQLString }
    },
    async resolve(parent, args) {
        const fs = require('fs').promises;
        const path = require('path');
        const csvWriter = require('csv-write-stream');

        try {
            const existingPlayers = await loadPlayersFromCSV();
            const playerIndex = existingPlayers.findIndex(player => player.PLAYER_ID === args.playerId);

            if (playerIndex === -1) {
                throw new Error('Gracz o podanym PLAYER_ID nie istnieje');
            }

            const deletedPlayer = existingPlayers.splice(playerIndex, 1)[0];

            const writer = csvWriter();
            const writeStream = fs.createWriteStream(path.resolve(__dirname, '../data/players.csv'));
            writer.pipe(writeStream);
            existingPlayers.forEach(player => writer.write(player));
            writer.end();

            return deletedPlayer;
        } catch (error) {
            throw new Error(`Błąd podczas usuwania gracza: ${error.message}`);
        }
    }
};

export { PlayerQuery, PlayerMutation, UpdatePlayerMutation, DeletePlayerMutation }; 