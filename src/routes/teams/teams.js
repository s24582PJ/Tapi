import express from 'express';
import fs from 'fs';
import { join, dirname } from 'path';
import csv from 'csv-parser';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const router = express.Router();
const __dirname = dirname(__filename);

const csvFilePath = join(__dirname, '../../../dane', 'teams.csv');


const loadTeamsFromCSV = () => {
    return new Promise((resolve, reject) => {
        const teams = [];
        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('data', (row) => {
                teams.push(row);
            })
            .on('end', () => {
                resolve(teams);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
};

router.get('/teams', async (req, res) => {
    try {
        const teams = await loadTeamsFromCSV();

        if (req.query.city) {
            const city = req.query.city.toLowerCase();
            const filteredTeams = teams.filter(t => t.CITY.toLowerCase() === city);

            if (filteredTeams.length > 0) {
                return res.json(filteredTeams);
            } else {
                return res.status(404).send(`Nie znaleziono drużyn w mieście: ${city}`);
            }
        }

        res.json(teams);
    } catch (error) {
        res.status(500).send('Błąd przy wczytywaniu danych z pliku CSV');
    }
});

router.get('/teams/:id', async (req, res) => {
    const teamId = req.params.id;
    try {
        const teams = await loadTeamsFromCSV();
        const team = teams.find(t => t.TEAM_ID === teamId);

        if (team) {
            res.json(team);
        } else {
            res.status(404).send(`Drużyna o TEAM_ID ${teamId} nie została znaleziona`);
        }
    } catch (error) {
        res.status(500).send('Błąd przy wczytywaniu danych z pliku CSV');
    }
});

export default router;
