import express from "express";

import teamRoutes from "./routes/teams/teams.js";
import players from "./routes/teams/players.js";
import games from "./routes/teams/games.js";

const app = express();

app.use(express.json());

app.use('/api/', teamRoutes, players, games);

app.get('/', (req, res) => {
    res.send('Witamy w API drużyn NBA!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});
