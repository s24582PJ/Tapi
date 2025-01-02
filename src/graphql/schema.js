import { GraphQLObjectType, GraphQLSchema, GraphQLScalarType, Kind } from 'graphql';
import { PlayerQuery, PlayerMutation, UpdatePlayerMutation, DeletePlayerMutation } from './players.js';
import { TeamQuery, TeamMutation, UpdateTeamMutation, DeleteTeamMutation } from './teams.js';
import { GameQuery, GameMutation, UpdateGameMutation, DeleteGameMutation } from './games.js';


const DateScalar = new GraphQLScalarType({
    name: 'Date',
    description: 'A date string in the format YYYY-MM-DD',
    parseValue(value) {
        return new Date(value); 
    },
    serialize(value) {
        return value.toISOString().split('T')[0]; 
    },
    parseLiteral(ast) {
        if (ast.kind === Kind.STRING) {
            return new Date(ast.value); 
        }
        return null; 
    }
});

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
    mutation: Mutation,
    scalars: {
        Date: DateScalar 
    }
}); 