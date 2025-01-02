import express from "express";
import cors from 'cors';
import { graphqlHTTP } from 'express-graphql';
import schema from './graphql/schema.js'; 

import teamRoutes from "./routes/teams/teams.js";
import players from "./routes/teams/players.js";
import games from "./routes/teams/games.js";

const app = express();

app.use(express.json());

const allowedOrigins = ['http://localhost:3000']; 
app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use((req, res, next) => {
    res.setHeader('X-Powered-By', 'Express');
    res.setHeader('Cache-Control', 'no-store');
    next();
});

app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true 
}));

app.use('/api/', teamRoutes, players, games);

app.get('/', (req, res) => {
    res.send('Witamy w API drużyn NBA!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});
