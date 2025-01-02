import { GraphQLObjectType, GraphQLString, GraphQLList, GraphQLInputObjectType, GraphQLInt } from 'graphql';
import { loadTeamsFromCSV, saveTeamsToCSV } from '../routes/teams/teams.js'; 


const TeamType = new GraphQLObjectType({
    name: 'Team',
    fields: () => ({
        TEAM_ID: { type: GraphQLString },
        NICKNAME: { type: GraphQLString },
        CITY: { type: GraphQLString },
        ARENA: { type: GraphQLString },
        OWNER: { type: GraphQLString }
    })
});


const TeamInputType = new GraphQLInputObjectType({
    name: 'TeamInput',
    fields: () => ({
        TEAM_ID: { type: GraphQLString },
        NICKNAME: { type: GraphQLString },
        CITY: { type: GraphQLString },
        ARENA: { type: GraphQLString },
        OWNER: { type: GraphQLString }
    })
});


const TeamFilterType = new GraphQLInputObjectType({
    name: 'TeamFilter',
    fields: () => ({
        TEAM_ID: { type: GraphQLString },
        NICKNAME: { type: GraphQLString },
        CITY: { type: GraphQLString },
        OWNER: { type: GraphQLString },
    })
});


const TeamQuery = {
    type: new GraphQLList(TeamType),
    args: {
        filter: { type: TeamFilterType },
        sort: { type: GraphQLString },
        page: { type: GraphQLInt },
        limit: { type: GraphQLInt }
    },
    resolve(parent, args) {
        return loadTeamsFromCSV().then(teams => {
            let filteredTeams = teams;

            if (args.filter) {
                if (args.filter.TEAM_ID) {
                    filteredTeams = filteredTeams.filter(team => team.TEAM_ID === args.filter.TEAM_ID);
                }
                if (args.filter.NICKNAME) {
                    filteredTeams = filteredTeams.filter(team => team.NICKNAME.includes(args.filter.NICKNAME));
                }
                if (args.filter.CITY) {
                    filteredTeams = filteredTeams.filter(team => team.CITY.includes(args.filter.CITY));
                }
                if (args.filter.OWNER) {
                    filteredTeams = filteredTeams.filter(team => team.OWNER.includes(args.filter.OWNER));
                }
            }

            if (args.sort) {
                const [field, order] = args.sort.split(':');
                filteredTeams = filteredTeams.sort((a, b) => {
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
            const paginatedTeams = filteredTeams.slice(startIndex, endIndex);

            return paginatedTeams;
        });
    }
};


const TeamMutation = {
    type: TeamType,
    args: {
        teamInput: { type: TeamInputType }
    },
    async resolve(parent, args) {
        const fs = require('fs').promises;
        const path = require('path');
        const csvWriter = require('csv-write-stream');

        try {
            const existingTeams = await loadTeamsFromCSV();
            const teamExists = existingTeams.some(team => team.TEAM_ID === args.teamInput.TEAM_ID);

            if (teamExists) {
                throw new Error('Drużyna o tym ID już istnieje');
            }

            const newTeam = args.teamInput;
            existingTeams.push(newTeam);

            const writer = csvWriter();
            const writeStream = fs.createWriteStream(path.resolve(__dirname, '../data/teams.csv'));
            writer.pipe(writeStream);
            existingTeams.forEach(team => writer.write(team));
            writer.end();

            return newTeam;
        } catch (error) {
            throw new Error(`Błąd podczas dodawania drużyny: ${error.message}`);
        }
    }
};

const UpdateTeamMutation = {
    type: TeamType,
    args: {
        teamId: { type: GraphQLString },
        teamInput: { type: TeamInputType }
    },
    async resolve(parent, args) {
        const fs = require('fs').promises;
        const path = require('path');
        const csvWriter = require('csv-write-stream');

        try {
            const existingTeams = await loadTeamsFromCSV();
            const teamIndex = existingTeams.findIndex(team => team.TEAM_ID === args.teamId);

            if (teamIndex === -1) {
                throw new Error('Drużyna o podanym TEAM_ID nie istnieje');
            }

            const updatedTeam = { ...existingTeams[teamIndex], ...args.teamInput };
            existingTeams[teamIndex] = updatedTeam;

            const writer = csvWriter();
            const writeStream = fs.createWriteStream(path.resolve(__dirname, '../data/teams.csv'));
            writer.pipe(writeStream);
            existingTeams.forEach(team => writer.write(team));
            writer.end();

            return updatedTeam;
        } catch (error) {
            throw new Error(`Błąd podczas aktualizacji drużyny: ${error.message}`);
        }
    }
};


const DeleteTeamMutation = {
    type: TeamType,
    args: {
        teamId: { type: GraphQLString }
    },
    async resolve(parent, args) {
        const fs = require('fs').promises;
        const path = require('path');
        const csvWriter = require('csv-write-stream');

        try {
            const existingTeams = await loadTeamsFromCSV();
            const teamIndex = existingTeams.findIndex(team => team.TEAM_ID === args.teamId);

            if (teamIndex === -1) {
                throw new Error('Drużyna o podanym TEAM_ID nie istnieje');
            }

            const deletedTeam = existingTeams.splice(teamIndex, 1)[0];

            const writer = csvWriter();
            const writeStream = fs.createWriteStream(path.resolve(__dirname, '../data/teams.csv'));
            writer.pipe(writeStream);
            existingTeams.forEach(team => writer.write(team));
            writer.end();

            return deletedTeam;
        } catch (error) {
            throw new Error(`Błąd podczas usuwania drużyny: ${error.message}`);
        }
    }
};

export { TeamQuery, TeamMutation, UpdateTeamMutation, DeleteTeamMutation }; 