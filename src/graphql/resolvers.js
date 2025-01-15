import data from "../../dane/dane.json" assert { type: 'json' };
import { applyFilters, validateTeamId, validatePlayerId, validateGameId } from "./helpers.js";

export const resolvers = {
    Query: {
        teams: (_, { filter, sort, page }) => {
            let result = data.teams;

            result = result.map(team => ({
                ...team,
                TEAM_ID: team.TEAM_ID ? team.TEAM_ID.toString() : null,
                MIN_YEAR: team.MIN_YEAR ? team.MIN_YEAR.toString() : null,
                MAX_YEAR: team.MAX_YEAR ? team.MAX_YEAR.toString() : null,
                YEARFOUNDED: team.YEARFOUNDED ? team.YEARFOUNDED.toString() : null,
                ARENACAPACITY: team.ARENACAPACITY ? team.ARENACAPACITY.toString() : null
            }));

            if (filter) {
                result = result.filter((item) => applyFilters(item, filter));
            }

            if (sort) {
                const { field, order } = sort;
                result = result.sort((a, b) => {
                    if (a[field] < b[field]) return order === "ASC" ? -1 : 1;
                    if (a[field] > b[field]) return order === "ASC" ? 1 : -1;
                    return 0;
                });
            }

            if (page) {
                const { limit, offset } = page;
                result = result.slice(offset, offset + limit);
            }

            return result;
        },
        players: (_, { filter, sort, page }) => {
            let result = data.players;

            console.log('Raw players data:', JSON.stringify(result, null, 2));
            console.log('Filter:', JSON.stringify(filter, null, 2));

            result = result.map(player => ({
                ...player,
                PLAYER_ID: player.PLAYER_ID ? player.PLAYER_ID.toString() : null,
                TEAM_ID: player.TEAM_ID ? player.TEAM_ID.toString() : null
            }));

            if (filter) {
                result = result.filter((item) => applyFilters(item, filter));
            }

            if (sort) {
                const { field, order } = sort;
                result = result.sort((a, b) => {
                    if (a[field] < b[field]) return order === "ASC" ? -1 : 1;
                    if (a[field] > b[field]) return order === "ASC" ? 1 : -1;
                    return 0;
                });
            }

            if (page) {
                const { limit, offset } = page;
                result = result.slice(offset, offset + limit);
            }

            return result;
        },
        games: (_, { filter, sort, page }) => {
            let result = data.games;

            result = result.map(game => ({
                ...game,
                GAME_ID: game.GAME_ID ? game.GAME_ID.toString() : null,
                HOME_TEAM_ID: game.HOME_TEAM_ID ? game.HOME_TEAM_ID.toString() : null,
                VISITOR_TEAM_ID: game.VISITOR_TEAM_ID ? game.VISITOR_TEAM_ID.toString() : null,
                TEAM_ID_home: game.TEAM_ID_home ? game.TEAM_ID_home.toString() : null,
                TEAM_ID_away: game.TEAM_ID_away ? game.TEAM_ID_away.toString() : null,
                PTS_home: game.PTS_home ? game.PTS_home.toString() : null,
                PTS_away: game.PTS_away ? game.PTS_away.toString() : null
            }));

            if (filter) {
                result = result.filter((item) => applyFilters(item, filter));
            }

            if (sort) {
                const { field, order } = sort;
                result = result.sort((a, b) => {
                    if (a[field] < b[field]) return order === "ASC" ? -1 : 1;
                    if (a[field] > b[field]) return order === "ASC" ? 1 : -1;
                    return 0;
                });
            }

            if (page) {
                const { limit, offset } = page;
                result = result.slice(offset, offset + limit);
            }

            return result;
        },
        team: (_, { TEAM_ID }) => {
            if (!validateTeamId(TEAM_ID)) {
                return {
                    __typename: "ErrorResponse",
                    message: "Invalid Team ID format",
                    code: "400"
                };
            }
            const team = data.teams.find((t) => t.TEAM_ID === parseInt(TEAM_ID));
            if (!team) {
                return {
                    __typename: "ErrorResponse",
                    message: "Team not found",
                    code: "404"
                };
            }
            return {
                __typename: "Team",
                ...team,
                TEAM_ID: team.TEAM_ID.toString(),
                MIN_YEAR: team.MIN_YEAR ? team.MIN_YEAR.toString() : null,
                MAX_YEAR: team.MAX_YEAR ? team.MAX_YEAR.toString() : null,
                YEARFOUNDED: team.YEARFOUNDED ? team.YEARFOUNDED.toString() : null,
                ARENACAPACITY: team.ARENACAPACITY ? team.ARENACAPACITY.toString() : null
            };
        },
        player: (_, { PLAYER_ID }) => {
            if (!validatePlayerId(PLAYER_ID)) {
                return {
                    __typename: "ErrorResponse",
                    message: "Invalid Player ID format",
                    code: "400"
                };
            }

            const player = data.players.find(p => p.PLAYER_ID === parseInt(PLAYER_ID));
            
            if (!player) {
                return {
                    __typename: "ErrorResponse",
                    message: "Player not found",
                    code: "404"
                };
            }

            return {
                __typename: "Player",
                ...player,
                PLAYER_ID: player.PLAYER_ID.toString(),
                TEAM_ID: player.TEAM_ID.toString()
            };
        },
        game: (_, { GAME_ID }) => {
            if (!validateGameId(GAME_ID)) {
                return {
                    __typename: "ErrorResponse",
                    message: "Invalid Game ID format",
                    code: "400"
                };
            }

            const gameIdNumber = parseInt(GAME_ID);
            const game = data.games.find((g) => g.GAME_ID === gameIdNumber);

            if (!game) {
                return {
                    __typename: "ErrorResponse",
                    message: "Game not found",
                    code: "404"
                };
            }

            return {
                __typename: "Game",
                ...game,
                GAME_ID: game.GAME_ID.toString(),
                HOME_TEAM_ID: game.HOME_TEAM_ID.toString(),
                VISITOR_TEAM_ID: game.VISITOR_TEAM_ID.toString(),
                TEAM_ID_home: game.TEAM_ID_home.toString(),
                TEAM_ID_away: game.TEAM_ID_away.toString(),
                PTS_home: game.PTS_home.toString(),
                PTS_away: game.PTS_away.toString(),
                SEASON: game.SEASON.toString(),
                HOME_TEAM_WINS: game.HOME_TEAM_WINS.toString()
            };
        }
    },
    Mutation: {
        createTeam: (_, { teamInput }) => {
            const TEAM_ID = parseInt(teamInput.TEAM_ID);
            if (!validateTeamId(TEAM_ID)) {
                throw new Error("Invalid Team ID format");
            }
            const newTeam = {
                ...teamInput,
                TEAM_ID: TEAM_ID,
                MIN_YEAR: parseInt(teamInput.MIN_YEAR),
                MAX_YEAR: parseInt(teamInput.MAX_YEAR),
                YEARFOUNDED: parseInt(teamInput.YEARFOUNDED),
                ARENACAPACITY: parseInt(teamInput.ARENACAPACITY)
            };
            data.teams.push(newTeam);
            return {
                ...newTeam,
                TEAM_ID: newTeam.TEAM_ID.toString(),
                MIN_YEAR: newTeam.MIN_YEAR.toString(),
                MAX_YEAR: newTeam.MAX_YEAR.toString(),
                YEARFOUNDED: newTeam.YEARFOUNDED.toString(),
                ARENACAPACITY: newTeam.ARENACAPACITY.toString()
            };
        },
        updateTeam: (_, { TEAM_ID, teamInput }) => {
            if (!validateTeamId(TEAM_ID)) {
                throw new Error("Invalid Team ID format");
            }
            const teamIndex = data.teams.findIndex((t) => t.TEAM_ID === TEAM_ID);
            if (teamIndex === -1) throw new Error("Team not found");
            data.teams[teamIndex] = { ...teamInput };
            return data.teams[teamIndex];
        },
        deleteTeam: (_, { TEAM_ID }) => {
            if (!validateTeamId(TEAM_ID)) {
                return { success: false, message: "Invalid Team ID format", code: "400" };
            }
            const teamIndex = data.teams.findIndex((t) => t.TEAM_ID === TEAM_ID);
            if (teamIndex === -1) {
                return { success: false, message: "Team not found", code: "404" };
            }
            data.teams.splice(teamIndex, 1);
            return { success: true, message: "Team deleted", code: "200" };
        },
        createPlayer: (_, { playerInput }) => {
            const PLAYER_ID = parseInt(playerInput.PLAYER_ID);
            const TEAM_ID = parseInt(playerInput.TEAM_ID);
            if (!validatePlayerId(PLAYER_ID.toString())) {
                throw new Error("Invalid Player ID format");
            }
            const newPlayer = {
                ...playerInput,
                PLAYER_ID: PLAYER_ID,
                TEAM_ID: TEAM_ID
            };
            data.players.push(newPlayer);
            return {
                ...newPlayer,
                PLAYER_ID: newPlayer.PLAYER_ID.toString(),
                TEAM_ID: newPlayer.TEAM_ID.toString()
            };
        },
        updatePlayer: (_, { PLAYER_ID, playerInput }) => {
            if (!validatePlayerId(PLAYER_ID)) {
                throw new Error("Invalid Player ID format");
            }
            const playerIndex = data.players.findIndex((p) => p.PLAYER_ID === PLAYER_ID);
            if (playerIndex === -1) throw new Error("Player not found");
            data.players[playerIndex] = { ...playerInput };
            return data.players[playerIndex];
        },
        deletePlayer: (_, { PLAYER_ID }) => {
            if (!validatePlayerId(PLAYER_ID)) {
                return { success: false, message: "Invalid Player ID format", code: "400" };
            }
            const playerIndex = data.players.findIndex((p) => p.PLAYER_ID === PLAYER_ID);
            if (playerIndex === -1) {
                return { success: false, message: "Player not found", code: "404" };
            }
            data.players.splice(playerIndex, 1);
            return { success: true, message: "Player deleted", code: "200" };
        },
        createGame: (_, { gameInput }) => {
            const GAME_ID = parseInt(gameInput.GAME_ID);
            if (!validateGameId(GAME_ID.toString())) {
                throw new Error("Invalid Game ID format");
            }
            const newGame = {
                ...gameInput,
                GAME_ID: GAME_ID,
                HOME_TEAM_ID: parseInt(gameInput.HOME_TEAM_ID),
                VISITOR_TEAM_ID: parseInt(gameInput.VISITOR_TEAM_ID),
                TEAM_ID_home: parseInt(gameInput.TEAM_ID_home),
                TEAM_ID_away: parseInt(gameInput.TEAM_ID_away)
            };
            data.games.push(newGame);
            return {
                ...newGame,
                GAME_ID: newGame.GAME_ID.toString(),
                HOME_TEAM_ID: newGame.HOME_TEAM_ID.toString(),
                VISITOR_TEAM_ID: newGame.VISITOR_TEAM_ID.toString(),
                TEAM_ID_home: newGame.TEAM_ID_home.toString(),
                TEAM_ID_away: newGame.TEAM_ID_away.toString()
            };
        },
        updateGame: (_, { GAME_ID, gameInput }) => {
            if (!validateGameId(GAME_ID)) {
                throw new Error("Invalid Game ID format");
            }
            const gameIndex = data.games.findIndex((g) => g.GAME_ID === GAME_ID);
            if (gameIndex === -1) throw new Error("Game not found");
            data.games[gameIndex] = { ...gameInput };
            return data.games[gameIndex];
        },
        deleteGame: (_, { GAME_ID }) => {
            if (!validateGameId(GAME_ID)) {
                return { success: false, message: "Invalid Game ID format", code: "400" };
            }
            const gameIndex = data.games.findIndex((g) => g.GAME_ID === GAME_ID);
            if (gameIndex === -1) {
                return { success: false, message: "Game not found", code: "404" };
            }
            data.games.splice(gameIndex, 1);
            return { success: true, message: "Game deleted", code: "200" };
        }
    }
};
