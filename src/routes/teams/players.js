import express from 'express';
import fs from 'fs';
import path, {dirname} from 'path';
import csv from 'csv-parser';
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = express.Router();
const filePath = path.join(__dirname, '../../../dane/players.csv');

const loadPlayersFromCSV = () => {
    return new Promise((resolve, reject) => {
        const players = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => players.push(row))
            .on('end', () => resolve(players))
            .on('error', (error) => reject(error));
    });
};

const savePlayersToCSV = (players) => {
    return new Promise((resolve, reject) => {
        const csvData = players.map(player => ({
            PLAYER_NAME: player.PLAYER_NAME,
            TEAM_ID: player.TEAM_ID,
            PLAYER_ID: player.PLAYER_ID,
            SEASON: player.SEASON,
        }));

        const csvString = [
            'PLAYER_NAME,TEAM_ID,PLAYER_ID,SEASON',
            ...csvData.map(player => `${player.PLAYER_NAME},${player.TEAM_ID},${player.PLAYER_ID},${player.SEASON}`)
        ].join('\n');

        fs.writeFile(filePath, csvString, 'utf8', (error) => {
            if (error) reject(error);
            else resolve();
        });
    });
};

router.get('/players', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Powered-By', 'Express');
    res.setHeader('Content-Type', 'application/json');

    try {
        const players = await loadPlayersFromCSV();

        if (req.query.team_id) {
            const teamId = req.query.team_id;
            const filteredPlayers = players.filter(player => player.TEAM_ID === teamId);

            if (filteredPlayers.length > 0) {
                return res.status(200).json(filteredPlayers);
            } else {
                return res.status(404).send(`Nie znaleziono graczy w drużynie o TEAM_ID: ${teamId}`);
            }
        }

        res.status(200).json(players);
    } catch (error) {
        console.error('Błąd przy wczytywaniu danych z pliku CSV:', error);
        res.status(500).send('Błąd przy wczytywaniu danych z pliku CSV');
    }
});

router.get('/players/:id', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Powered-By', 'Express');
    res.setHeader('Content-Type', 'application/json');

    const playerId = req.params.id;

    try {
        const players = await loadPlayersFromCSV();
        const player = players.find(p => p.PLAYER_ID === playerId);

        if (!player) {
            return res.status(404).send('Gracz o podanym PLAYER_ID nie został znaleziony.');
        }

        res.status(200).json({
            player,
            _links: {
                self: { href: `/api/players/${playerId}`, method: 'GET' },
                update: { href: `/api/players/update/${playerId}`, method: 'PATCH' },
                delete: { href: `/api/players/delete/${playerId}`, method: 'DELETE' },
                allPlayers: { href: '/api/players', method: 'GET' }
            }
        });
    } catch (error) {
        console.error('Błąd podczas wczytywania gracza:', error);
        res.status(500).send('Błąd podczas wczytywania gracza.');
    }
});

router.post('/players/add', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Resource-Created', 'Player');
    res.setHeader('X-Powered-By', 'Express');

    const newPlayer = req.body;

    if (!newPlayer.PLAYER_NAME || !newPlayer.TEAM_ID || !newPlayer.PLAYER_ID || !newPlayer.SEASON) {
        return res.status(400).send('Brakuje wymaganego pola: PLAYER_NAME, TEAM_ID, PLAYER_ID lub SEASON.');
    }

    try {
        const players = await loadPlayersFromCSV();

        const existingPlayer = players.find(player => player.PLAYER_ID === newPlayer.PLAYER_ID);
        if (existingPlayer) {
            return res.status(400).send('Gracz o podanym PLAYER_ID już istnieje.');
        }

        players.push(newPlayer);
        await savePlayersToCSV(players);

        res.status(201).json({
            message: 'Gracz został dodany pomyślnie.',
            _links: {
                self: { href: `/api/players/${newPlayer.PLAYER_ID}`, method: 'GET' },
                allPlayers: { href: '/api/players', method: 'GET' }
            }
        });
    } catch (error) {
        console.error('Błąd podczas dodawania gracza:', error);
        res.status(500).send('Błąd przy dodawaniu gracza.');
    }
});

router.patch('/players/update/:id', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Action', 'Player Partial Update');
    res.setHeader('X-Powered-By', 'Express');

    const playerId = req.params.id;
    const updates = req.body;

    try {
        const players = await loadPlayersFromCSV();
        const playerIndex = players.findIndex(p => p.PLAYER_ID === playerId);

        if (playerIndex === -1) {
            return res.status(404).send('Gracz o podanym PLAYER_ID nie istnieje.');
        }

        const updatedPlayer = { ...players[playerIndex], ...updates };
        players[playerIndex] = updatedPlayer;

        await savePlayersToCSV(players);

        res.status(200).json({
            message: 'Gracz został zaktualizowany pomyślnie.',
            updatedPlayer: updatedPlayer,
            _links: {
                self: { href: `/api/players/${playerId}`, method: 'GET' },
                allPlayers: { href: '/api/players', method: 'GET' }
            }
        });
    } catch (error) {
        console.error('Błąd podczas aktualizacji gracza:', error);
        res.status(500).send('Błąd przy aktualizacji gracza.');
    }
});

router.put('/players/update/:id', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Action', 'Player Full Update');
    res.setHeader('X-Powered-By', 'Express');

    const playerId = req.params.id;
    const newPlayerData = req.body;

    try {
        const players = await loadPlayersFromCSV();
        const playerIndex = players.findIndex(p => p.PLAYER_ID === playerId);

        if (playerIndex === -1) {
            return res.status(404).send('Gracz o podanym PLAYER_ID nie istnieje.');
        }

        players[playerIndex] = { ...newPlayerData, PLAYER_ID: playerId };

        await savePlayersToCSV(players);

        res.status(200).json({
            message: 'Gracz został w pełni zaktualizowany pomyślnie.',
            updatedPlayer: players[playerIndex],
            _links: {
                self: { href: `/api/players/${playerId}`, method: 'GET' },
                allPlayers: { href: '/api/players', method: 'GET' }
            }
        });
    } catch (error) {
        console.error('Błąd podczas pełnej aktualizacji gracza:', error);
        res.status(500).send('Błąd przy pełnej aktualizacji gracza.');
    }
});

    router.delete('/players/delete/:id', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Action', 'Player Deletion');
    res.setHeader('X-Powered-By', 'Express');

    const playerId = req.params.id;

    try {
        const players = await loadPlayersFromCSV();
        const playerIndex = players.findIndex(p => p.PLAYER_ID === playerId);

        if (playerIndex === -1) {
            return res.status(404).set({
                'Operation-Status': 'Failed',
                'Resource-Status': 'Not Found',
                'Request-Type': 'DELETE'
            }).send(`Gracz o PLAYER_ID ${playerId} nie został znaleziony.`);
        }

        players.splice(playerIndex, 1);
        await savePlayersToCSV(players);

        res.set({
            'Operation-Status': 'Success',
            'Resource-Status': 'Deleted',
            'Request-Type': 'DELETE',}).status(200).json({
            message: `Gracz o PLAYER_ID ${playerId} został usunięty.`,
            _links: {
                allPlayers: { href: '/api/players', method: 'GET' },
                addPlayer: { href: '/api/players/add', method: 'POST' }
            }
        });
    } catch (error) {
        console.error('Błąd podczas usuwania gracza:', error);
        res.status(500).send('Błąd przy usuwaniu gracza.');
    }
});

export default router;