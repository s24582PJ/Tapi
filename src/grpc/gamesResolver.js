import { loadGamesFromCSV, saveGamesToCSV } from '../routes/teams/games.js';

const gameService = {
    GetGames: async (call) => {
        const games = await loadGamesFromCSV();
     
        return games;
    },
    AddGame: async (call) => {
        const newGame = call.request;
        
        if (!newGame.game_id || !newGame.game_date_est || !newGame.home_team_id || !newGame.visitor_team_id || !newGame.season) {
            throw new Error('Wszystkie wymagane pola muszą być wypełnione');
        }

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(newGame.game_date_est)) {
            throw new Error('Nieprawidłowy format daty. Wymagany format: YYYY-MM-DD');
        }

        if (newGame.pts_home && !Number.isInteger(newGame.pts_home)) {
            throw new Error('Punkty drużyny gospodarzy muszą być liczbą całkowitą');
        }
        if (newGame.pts_away && !Number.isInteger(newGame.pts_away)) {
            throw new Error('Punkty drużyny gości muszą być liczbą całkowitą');
        }
        const existingGames = await loadGamesFromCSV();
        const gameExists = existingGames.some(game => game.GAME_ID === newGame.game_id);

        if (gameExists) {
            throw new Error('Mecz o tym ID już istnieje');
        }

        existingGames.push(newGame);
        await saveGamesToCSV(existingGames); 
        return newGame;
    },
    UpdateGame: async (call) => {
        const updatedGame = call.request;
        const existingGames = await loadGamesFromCSV();
        const gameIndex = existingGames.findIndex(game => game.GAME_ID === updatedGame.game_id);

        if (gameIndex === -1) {
            throw new Error('Mecz o podanym GAME_ID nie istnieje');
        }

        existingGames[gameIndex] = updatedGame;
        await saveGamesToCSV(existingGames);
        return updatedGame;
    },
    DeleteGame: async (call) => {
        const gameId = call.request;
        const existingGames = await loadGamesFromCSV();
        const gameIndex = existingGames.findIndex(game => game.GAME_ID === gameId);

        if (gameIndex === -1) {
            throw new Error('Mecz o podanym GAME_ID nie istnieje');
        }

        const deletedGame = existingGames.splice(gameIndex, 1)[0];
        await saveGamesToCSV(existingGames); 
        return deletedGame;
    }
};

export default gameService; 