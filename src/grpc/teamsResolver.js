import { loadTeamsFromCSV, saveTeamsToCSV } from '../routes/teams/teams.js';

const teamService = {
    GetTeams: async (call) => {
        const teams = await loadTeamsFromCSV();
        
        if (call.request.nickname) {
            return teams.filter(team => team.NICKNAME.includes(call.request.nickname));
        }
        return teams;
    },
    AddTeam: async (call) => {
        const newTeam = call.request;

     
        if (!newTeam.team_id || !newTeam.nickname || !newTeam.city || !newTeam.arena || !newTeam.owner) {
            throw new Error('Wszystkie wymagane pola muszą być wypełnione');
        }

        const existingTeams = await loadTeamsFromCSV();
        const teamExists = existingTeams.some(team => team.TEAM_ID === newTeam.team_id);

        if (teamExists) {
            throw new Error('Drużyna o tym ID już istnieje');
        }

        existingTeams.push(newTeam);
        await saveTeamsToCSV(existingTeams); 
        return newTeam;
    },
    UpdateTeam: async (call) => {
        const updatedTeam = call.request;
        const existingTeams = await loadTeamsFromCSV();
        const teamIndex = existingTeams.findIndex(team => team.TEAM_ID === updatedTeam.team_id);

        if (teamIndex === -1) {
            throw new Error('Drużyna o podanym TEAM_ID nie istnieje');
        }

        existingTeams[teamIndex] = updatedTeam;
        await saveTeamsToCSV(existingTeams);
        return updatedTeam;
    },
    DeleteTeam: async (call) => {
        const teamId = call.request;
        const existingTeams = await loadTeamsFromCSV();
        const teamIndex = existingTeams.findIndex(team => team.TEAM_ID === teamId);

        if (teamIndex === -1) {
            throw new Error('Drużyna o podanym TEAM_ID nie istnieje');
        }

        const deletedTeam = existingTeams.splice(teamIndex, 1)[0];
        await saveTeamsToCSV(existingTeams); 
        return deletedTeam;
    }
};

export default teamService; 