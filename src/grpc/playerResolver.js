import { loadPlayersFromCSV, savePlayersToCSV } from '../routes/teams/players.js';

const playerService = {
    GetPlayers: async (call) => {
        const players = await loadPlayersFromCSV();
      
        if (call.request.player_name) {
            return players.filter(player => player.PLAYER_NAME.includes(call.request.player_name));
        }
        return players;
    },
    AddPlayer: async (call) => {
        const newPlayer = call.request;

        if (!newPlayer.player_id || !newPlayer.player_name || !newPlayer.team_id || !newPlayer.season) {
            throw new Error('Wszystkie wymagane pola muszą być wypełnione');
        }

        const existingPlayers = await loadPlayersFromCSV();
        const playerExists = existingPlayers.some(player => player.PLAYER_ID === newPlayer.player_id);

        if (playerExists) {
            throw new Error('Gracz o tym ID już istnieje');
        }

        existingPlayers.push(newPlayer);
        await savePlayersToCSV(existingPlayers); 
        return newPlayer;
    },
    UpdatePlayer: async (call) => {
        const updatedPlayer = call.request;
        const existingPlayers = await loadPlayersFromCSV();
        const playerIndex = existingPlayers.findIndex(player => player.PLAYER_ID === updatedPlayer.player_id);

        if (playerIndex === -1) {
            throw new Error('Gracz o podanym PLAYER_ID nie istnieje');
        }

        existingPlayers[playerIndex] = updatedPlayer;
        await savePlayersToCSV(existingPlayers); 
        return updatedPlayer;
    },
    DeletePlayer: async (call) => {
        const playerId = call.request;
        const existingPlayers = await loadPlayersFromCSV();
        const playerIndex = existingPlayers.findIndex(player => player.PLAYER_ID === playerId);

        if (playerIndex === -1) {
            throw new Error('Gracz o podanym PLAYER_ID nie istnieje');
        }

        const deletedPlayer = existingPlayers.splice(playerIndex, 1)[0];
        await savePlayersToCSV(existingPlayers); 
        return deletedPlayer;
    }
};

export default playerService; 