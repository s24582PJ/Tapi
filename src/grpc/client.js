import grpc from 'grpc';
import protoLoader from '@grpc/proto-loader';

const PROTO_PATH = __dirname + '/proto/nba.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const nbaProto = grpc.loadPackageDefinition(packageDefinition).nba;

const client = new nbaProto.PlayerService('localhost:50051', grpc.credentials.createInsecure());

// Przykład wywołania metody GetPlayers
client.GetPlayers({ player_name: 'John' }, (error, response) => {
    if (!error) {
        console.log('Players:', response);
    } else {
        console.error(error);
    }
});