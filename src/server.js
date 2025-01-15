import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { gameResolvers } from "./gamesResolver.js";
import { teamResolvers } from "./teamsResolver.js";
import { playerResolvers } from "./playerResolver.js";

const gamePackageDefinition = protoLoader.loadSync("src/proto/games.proto");
const playerPackageDefinition = protoLoader.loadSync("src/proto/players.proto");
const teamPackageDefinition = protoLoader.loadSync("src/proto/teams.proto");

const gameProto = grpc.loadPackageDefinition(gamePackageDefinition);
const teamProto = grpc.loadPackageDefinition(teamPackageDefinition);
const playerProto = grpc.loadPackageDefinition(playerPackageDefinition);

const server = new grpc.Server();

server.addService(gameProto.nba.GameService.service, gameResolvers);
server.addService(teamProto.nba.TeamService.service, teamResolvers);
server.addService(playerProto.nba.PlayerService.service, playerResolvers);

server.bindAsync(
    "127.0.0.1:4000",
    grpc.ServerCredentials.createInsecure(),
    (err) => {
        if (err) {
            console.error('Failed to start server:', err);
            return;
        }
        console.log('gRPC server running at http://127.0.0.1:4000');
    }
);
