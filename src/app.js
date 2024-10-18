
import express from "express";

import teamRoutes from "./routes/teams/teams.js";

const app = express();
const port = 3000;

app.use('/api/', teamRoutes);


app.get('/', (req, res) => {
    res.send('Witamy w API drużyn NBA!');
});


app.listen(port, () => {
    console.log(`Serwer działa na porcie ${port}`);
});
