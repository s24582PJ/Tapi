export const typeDefs = `#graphql
    scalar PositiveInt

    type Team {
        LEAGUE_ID: String
        TEAM_ID: PositiveInt
        MIN_YEAR: String
        MAX_YEAR: String
        ABBREVIATION: String
        NICKNAME: String
        YEARFOUNDED: String
        CITY: String
        ARENA: String
        ARENACAPACITY: String
        OWNER: String
        GENERALMANAGER: String
        HEADCOACH: String
        DLEAGUEAFFILIATION: String
    }

    type Player {
        PLAYER_NAME: String!
        TEAM_ID: String!
        PLAYER_ID: String!
        SEASON: String!
    }

    type Game {
        GAME_DATE_EST: String!
        GAME_ID: String!
        GAME_STATUS_TEXT: String
        HOME_TEAM_ID: String!
        VISITOR_TEAM_ID: String!
        SEASON: String!
        TEAM_ID_home: String!
        PTS_home: String
        FG_PCT_home: String
        FT_PCT_home: String
        FG3_PCT_home: String
        AST_home: String
        REB_home: String
        TEAM_ID_away: String!
        PTS_away: String
        FG_PCT_away: String
        FT_PCT_away: String
        FG3_PCT_away: String
        AST_away: String
        REB_away: String
        HOME_TEAM_WINS: String
    }

    input TeamInput {
        LEAGUE_ID: String!
        TEAM_ID: String!
        MIN_YEAR: String
        MAX_YEAR: String
        ABBREVIATION: String!
        NICKNAME: String!
        YEARFOUNDED: String
        CITY: String!
        ARENA: String
        ARENACAPACITY: String
        OWNER: String
        GENERALMANAGER: String
        HEADCOACH: String
        DLEAGUEAFFILIATION: String
    }

    input PlayerInput {
        PLAYER_NAME: String!
        TEAM_ID: String!
        PLAYER_ID: String!
        SEASON: String!
    }

    input GameInput {
        GAME_DATE_EST: String!
        GAME_ID: String!
        GAME_STATUS_TEXT: String
        HOME_TEAM_ID: String!
        VISITOR_TEAM_ID: String!
        SEASON: String!
        TEAM_ID_home: String!
        PTS_home: String
        FG_PCT_home: String
        FT_PCT_home: String
        FG3_PCT_home: String
        AST_home: String
        REB_home: String
        TEAM_ID_away: String!
        PTS_away: String
        FG_PCT_away: String
        FT_PCT_away: String
        FG3_PCT_away: String
        AST_away: String
        REB_away: String
        HOME_TEAM_WINS: String
    }

    input FilterInput {
        field: String!
        operation: String!
        value: String!
    }

    input SortInput {
        field: String!
        order: String!
    }

    input PageInput {
        limit: Int!
        offset: Int!
    }

    type DeleteResponse {
        success: Boolean!
        message: String
        code: String!
    }

    type ErrorResponse {
        message: String
        code: String
    }

    union TeamResult = Team | ErrorResponse
    union PlayerResult = Player | ErrorResponse
    union GameResult = Game | ErrorResponse

    type Query {
        teams(filter: [FilterInput], sort: SortInput, page: PageInput): [Team]
        players(filter: [FilterInput], sort: SortInput, page: PageInput): [Player]
        games(filter: [FilterInput], sort: SortInput, page: PageInput): [Game]
        team(TEAM_ID: String!): TeamResult
        player(PLAYER_ID: String!): PlayerResult
        game(GAME_ID: String!): GameResult
    }

    type Mutation {
        createTeam(teamInput: TeamInput): Team
        updateTeam(TEAM_ID: String!, teamInput: TeamInput): Team
        deleteTeam(TEAM_ID: String!): DeleteResponse

        createPlayer(playerInput: PlayerInput): Player
        updatePlayer(PLAYER_ID: String!, playerInput: PlayerInput): Player
        deletePlayer(PLAYER_ID: String!): DeleteResponse

        createGame(gameInput: GameInput): Game
        updateGame(GAME_ID: String!, gameInput: GameInput): Game
        deleteGame(GAME_ID: String!): DeleteResponse
    }
`;
