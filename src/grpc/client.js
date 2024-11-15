import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

const packageDefination = protoLoader.loadSync('./proto/student.proto');
const proto = grpc.loadPackageDefinition(packageDefination);

const client = new proto.school.StudentService("127.0.0.1:9000", grpc.ChannelCredentials.createInsecure(), (err) => console.log(err));


client.GetStudent(null, (err,res) => console.log(res));