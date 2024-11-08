import express from 'express';
import fs from 'fs';
import path, {dirname} from 'path';
import csv from 'csv-parser';
import {fileURLToPath} from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = express.Router();
const filePath = path.join(__dirname, '../../../dane/games.csv');

const loadGamesFromCSV = () => {
    return new Promise((resolve, reject) => {
        const games = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => games.push(row))
            .on('end', () => resolve(games))
            .on('error', (error) => reject(error));
    });
};

const saveGamesToCSV = (games) => {
    return new Promise((resolve, reject) => {
        const csvData = games.map(game => ({
            GAME_DATE_EST: game.GAME_DATE_EST,
            GAME_ID: game.GAME_ID,
            GAME_STATUS_TEXT: game.GAME_STATUS_TEXT,
            HOME_TEAM_ID: game.HOME_TEAM_ID,
            VISITOR_TEAM_ID: game.VISITOR_TEAM_ID,
            SEASON: game.SEASON,
            TEAM_ID_home: game.TEAM_ID_home,
            PTS_home: game.PTS_home,
            FG_PCT_home: game.FG_PCT_home,
            FT_PCT_home: game.FT_PCT_home,
            FG3_PCT_home: game.FG3_PCT_home,
            AST_home: game.AST_home,
            REB_home: game.REB_home,
            TEAM_ID_away: game.TEAM_ID_away,
            PTS_away: game.PTS_away,
            FG_PCT_away: game.FG_PCT_away,
            FT_PCT_away: game.FT_PCT_away,
            FG3_PCT_away: game.FG3_PCT_away,
            AST_away: game.AST_away,
            REB_away: game.REB_away,
            HOME_TEAM_WINS: game.HOME_TEAM_WINS
        }));

        const csvString = [
            'GAME_DATE_EST,GAME_ID,GAME_STATUS_TEXT,HOME_TEAM_ID,VISITOR_TEAM_ID,SEASON,TEAM_ID_home,PTS_home,FG_PCT_home,FT_PCT_home,FG3_PCT_home,AST_home,REB_home,TEAM_ID_away,PTS_away,FG_PCT_away,FT_PCT_away,FG3_PCT_away,AST_away,REB_away,HOME_TEAM_WINS',
            ...csvData.map(game => `${game.GAME_DATE_EST},${game.GAME_ID},${game.GAME_STATUS_TEXT},${game.HOME_TEAM_ID},${game.VISITOR_TEAM_ID},${game.SEASON},${game.TEAM_ID_home},${game.PTS_home},${game.FG_PCT_home},${game.FT_PCT_home},${game.FG3_PCT_home},${game.AST_home},${game.REB_home},${game.TEAM_ID_away},${game.PTS_away},${game.FG_PCT_away},${game.FT_PCT_away},${game.FG3_PCT_away},${game.AST_away},${game.REB_away},${game.HOME_TEAM_WINS}`)
        ].join('\n');

        fs.writeFile(filePath, csvString, 'utf8', (error) => {
            if (error) reject(error);
            else resolve();
        });
    });
};

router.get('/games', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Powered-By', 'Express');
    res.setHeader('Content-Type', 'application/json');  

    try {
        const games = await loadGamesFromCSV();
        const limitedGames = games.slice(0, 20);
        res.status(200).json(limitedGames);
    } catch (error) {
        console.error('Błąd przy wczytywaniu danych z pliku CSV:', error);
        res.status(500).send('Błąd przy wczytywaniu danych z pliku CSV');
    }
});

router.get('/games/:id', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Powered-By', 'Express');
    res.setHeader('Content-Type', 'application/json');

    const gameId = req.params.id;

    try {
        const games = await loadGamesFromCSV();
        const game = games.find(g => g.GAME_ID === gameId);

        if (!game) {
            return res.status(404).send('Mecz o podanym GAME_ID nie został znaleziony.');
        }

        res.status(200).json({
            game,
            _links: {
                self: { href: `/api/games/${gameId}`, method: 'GET' },
                update: { href: `/api/games/update/${gameId}`, method: 'PATCH' },
                delete: { href: `/api/games/delete/${gameId}`, method: 'DELETE' },
                allGames: { href: '/api/games', method: 'GET' }
            }
        });
    } catch (error) {
        console.error('Błąd podczas wczytywania meczu:', error);
        res.status(500).send('Błąd podczas wczytywania meczu.');
    }
});

router.post('/games/add', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Resource-Created', 'Game');
    res.setHeader('X-Powered-By', 'Express');

    const newGame = req.body;

    if (!newGame.GAME_DATE_EST || !newGame.GAME_ID || !newGame.GAME_STATUS_TEXT || !newGame.HOME_TEAM_ID || !newGame.VISITOR_TEAM_ID) {
        return res.status(400).send('Brakuje wymaganego pola: GAME_DATE_EST, GAME_ID, GAME_STATUS_TEXT, HOME_TEAM_ID, VISITOR_TEAM_ID.');
    }

    try {
        const games = await loadGamesFromCSV();

        const existingGame = games.find(game => game.GAME_ID === newGame.GAME_ID);
        if (existingGame) {
            return res.status(400).send('Mecz o podanym GAME_ID już istnieje.');
        }

        games.push(newGame);
        await saveGamesToCSV(games);

        res.status(201).json({
            message: 'Mecz został dodany pomyślnie.',
            _links: {
                self: { href: `/api/games/${newGame.GAME_ID}`, method: 'GET' },
                allGames: { href: '/api/games', method: 'GET' }
            }
        });
    } catch (error) {
        console.error('Błąd podczas dodawania meczu:', error);
        res.status(500).send('Błąd przy dodawaniu meczu.');
    }
});

router.patch('/games/update/:id', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Action', 'Game Partial Update');
    res.setHeader('X-Powered-By', 'Express');

    const gameId = req.params.id;
    const updates = req.body;

    try {
        const games = await loadGamesFromCSV();
        const gameIndex = games.findIndex(g => g.GAME_ID === gameId);

        if (gameIndex === -1) {
            return res.status(404).send('Mecz o podanym GAME_ID nie istnieje.');
        }

        const updatedGame = { ...games[gameIndex], ...updates };
        games[gameIndex] = updatedGame;

        await saveGamesToCSV(games);

        res.status(200).json({
            message: 'Mecz został zaktualizowany pomyślnie.',
            updatedGame: updatedGame,
            _links: {
                self: { href: `/api/games/${gameId}`, method: 'GET' },
                allGames: { href: '/api/games', method: 'GET' }
            }
        });
    } catch (error) {
        console.error('Błąd podczas aktualizacji meczu:', error);
        res.status(500).send('Błąd przy aktualizacji meczu.');
    }
});

router.put('/games/update/:id', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Action', 'Game Full Update');
    res.setHeader('X-Powered-By', 'Express');

    const gameId = req.params.id;
    const newGameData = req.body;

    try {
        const games = await loadGamesFromCSV();
        const gameIndex = games.findIndex(g => g.GAME_ID === gameId);

        if (gameIndex === -1) {
            return res.status(404).send('Mecz o podanym GAME_ID nie istnieje.');
        }

        games[gameIndex] = { ...newGameData, GAME_ID: gameId };

        await saveGamesToCSV(games);

        res.status(200).json({
            message: 'Mecz został w pełni zaktualizowany pomyślnie.',
            updatedGame: games[gameIndex],
            _links: {
                self: { href: `/api/games/${gameId}`, method: 'GET' },
                allGames: { href: '/api/games', method: 'GET' }
            }
        });
    } catch (error) {
        console.error('Błąd podczas pełnej aktualizacji meczu:', error);
        res.status(500).send('Błąd przy pełnej aktualizacji meczu.');
    }
});

router.delete('/games/delete/:id', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Action', 'Game Deletion');
    res.setHeader('X-Powered-By', 'Express');

    const gameId = req.params.id;

    try {
        const games = await loadGamesFromCSV();
        const gameIndex = games.findIndex(g => g.GAME_ID === gameId);

        if (gameIndex === -1) {
            return res.status(404).send(`Mecz o GAME_ID ${gameId} nie został znaleziony.`);
        }

        games.splice(gameIndex, 1);
        await saveGamesToCSV(games);

        res.status(200).json({
            message: `Mecz o GAME_ID ${gameId} został usunięty.`,
            _links: {
                allGames: { href: '/api/games', method: 'GET' },
                addGame: { href: '/api/games/add', method: 'POST' }
            }
        });
    } catch (error) {
        console.error('Błąd podczas usuwania meczu:', error);
        res.status(500).send('Błąd przy usuwaniu meczu.');
    }
});

router.get('/games/details/:id', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Powered-By', 'Express');
    res.setHeader('Content-Type', 'application/json');

    const gameId = req.params.id;

    try {
        const games = await loadGamesFromCSV();
        const game = games.find(g => g.GAME_ID === gameId);

        if (!game) {
            return res.status(404).send('Mecz o podanym GAME_ID nie został znaleziony.');
        }

        const homeTeamId = game.HOME_TEAM_ID;
        const visitorTeamId = game.VISITOR_TEAM_ID;

        const homeTeam = await loadTeamDetails(homeTeamId); 
        const visitorTeam = await loadTeamDetails(visitorTeamId);

        if (!homeTeam || !visitorTeam) {
            return res.status(404).send('Jedna z drużyn o podanym ID nie została znaleziona.');
        }

        res.status(200).json({
            game,
            homeTeam,
            visitorTeam,
            _links: {
                self: { href: `/api/games/details/${gameId}`, method: 'GET' },
                update: { href: `/api/games/update/${gameId}`, method: 'PATCH' },
                delete: { href: `/api/games/delete/${gameId}`, method: 'DELETE' },
                allGames: { href: '/api/games', method: 'GET' },
                homeTeam: { href: `/api/teams/${homeTeamId}`, method: 'GET' },
                visitorTeam: { href: `/api/teams/${visitorTeamId}`, method: 'GET' }
            }
        });
    } catch (error) {
        console.error('Błąd podczas wczytywania meczu:', error);
        res.status(500).send('Błąd podczas wczytywania meczu.');
    }
});

async function loadTeamDetails(teamId) {
    try {
        const teams = await loadTeamsFromCSV();
        return teams.find(t => t.TEAM_ID === teamId);
    } catch (error) {
        console.error('Błąd podczas wczytywania drużyn:', error);
        return null;
    }
}


export default router;
