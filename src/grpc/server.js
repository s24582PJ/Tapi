import grpc from 'grpc';
import protoLoader from '@grpc/proto-loader';
import { playerService } from './nbaResolvers.js';
import { teamService } from './nbaResolvers.js';
import { gameService } from './nbaResolvers.js';

const PROTO_PATH_PLAYERS = __dirname + '/proto/players.proto';
const PROTO_PATH_TEAMS = __dirname + '/proto/teams.proto';
const PROTO_PATH_GAMES = __dirname + '/proto/games.proto';

const packageDefinitionPlayers = protoLoader.loadSync(PROTO_PATH_PLAYERS, {});
const packageDefinitionTeams = protoLoader.loadSync(PROTO_PATH_TEAMS, {});
const packageDefinitionGames = protoLoader.loadSync(PROTO_PATH_GAMES, {});

const nbaProtoPlayers = grpc.loadPackageDefinition(packageDefinitionPlayers).nba;
const nbaProtoTeams = grpc.loadPackageDefinition(packageDefinitionTeams).nba;
const nbaProtoGames = grpc.loadPackageDefinition(packageDefinitionGames).nba;

const server = new grpc.Server();

server.addService(nbaProtoPlayers.PlayerService.service, playerService);
server.addService(nbaProtoTeams.TeamService.service, teamService);
server.addService(nbaProtoGames.GameService.service, gameService);

const PORT = process.env.PORT || 50051;
server.bind(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure());
console.log(`gRPC server running at http://localhost:${PORT}`);
server.start(); 