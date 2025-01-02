import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import { PlayerQuery, PlayerMutation, UpdatePlayerMutation, DeletePlayerMutation } from './players.js';
import { TeamQuery, TeamMutation, UpdateTeamMutation, DeleteTeamMutation } from './teams.js';
import { GameQuery, GameMutation, UpdateGameMutation, DeleteGameMutation } from './games.js';

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        ...PlayerQuery,
        ...TeamQuery,
        ...GameQuery
    }
});

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        ...PlayerMutation,
        ...UpdatePlayerMutation,
        ...DeletePlayerMutation,
        ...TeamMutation,
        ...UpdateTeamMutation,
        ...DeleteTeamMutation,
        ...GameMutation,
        ...UpdateGameMutation,
        ...DeleteGameMutation
    }
});

export default new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
}); 