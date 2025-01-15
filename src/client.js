import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

const gamePackageDefinition = protoLoader.loadSync("src/proto/games.proto");
const playerPackageDefinition = protoLoader.loadSync("src/proto/players.proto");
const teamPackageDefinition = protoLoader.loadSync("src/proto/teams.proto");


const gameProto = grpc.loadPackageDefinition(gamePackageDefinition);
const teamProto = grpc.loadPackageDefinition(teamPackageDefinition);
const playerProto = grpc.loadPackageDefinition(playerPackageDefinition);

const clientGame = new gameProto.nba.GameService(
    "127.0.0.1:4000",
    grpc.ChannelCredentials.createInsecure(),
    (err) => console.log(err)
);

const clientPlayer = new playerProto.nba.PlayerService(
    "127.0.0.1:4000",
    grpc.ChannelCredentials.createInsecure(),
    (err) => console.log(err)
);

const clientTeam = new teamProto.nba.TeamService(
    "127.0.0.1:4000",
    grpc.ChannelCredentials.createInsecure(),
    (err) => console.log(err)
);

export { clientGame, clientTeam, clientPlayer };
