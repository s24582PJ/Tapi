import express from 'express';
import fs from 'fs';
import {join, dirname} from 'path';
import csv from 'csv-parser';
import {fileURLToPath} from 'url';

import {stringify} from "csv-stringify/sync";

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

const saveTeamsToCSV = (teams) => {
    return new Promise((resolve, reject) => {
        const csvData = stringify(teams, {header: true});
        fs.writeFile(csvFilePath, csvData, (error) => {
            if (error) {
                console.error('Błąd przy zapisie CSV:', error);
                reject(error);
            } else {
                console.log('Zapisano dane do CSV');
                resolve();
            }
        });
    });
};

router.get('/teams', async (req, res) => {
    try {
        const teams = await loadTeamsFromCSV();
        const city = req.query.city?.toLowerCase();

        const filteredTeams = city ? teams.filter(t => t.CITY.toLowerCase() === city) : teams;

        if (city && filteredTeams.length === 0) {
            return res.status(404).set({
                'Operation-Status': 'Failed',
                'Resource-Status': 'Not Found',
                'Request-Type': 'GET',
            }).send(`Nie znaleziono drużyn w mieście: ${city}`);
        }

        res.set({
            'Operation-Status': 'Success',
            'Resource-Status': 'Retrieved',
            'Request-Type': 'GET',
        }).status(200).json({
            teams: filteredTeams,
            _links: {
                self: {href: '/api/teams', method: 'GET'},
                add: {href: '/api/teams/add', method: 'POST'},
                delete: {href: `/api/teams/delete/{id}`, method: 'DELETE'}
            }
        });
    } catch (error) {
        res.status(500).send('Błąd przy wczytywaniu danych z pliku CSV');
    }
});

router.get('/teams/:id', async (req, res) => {
    const teamId = req.params.id;

    try {
        const teams = await loadTeamsFromCSV();
        const team = teams.find(t => t.TEAM_ID === teamId);

        if (!team) {
            return res.status(404).set({
                'Operation-Status': 'Failed',
                'Resource-Status': 'Not Found',
                'Request-Type': 'GET'
            }).send('Drużyna o podanym TEAM_ID nie została znaleziona.');
        }

        res.set({
            'Operation-Status': 'Success',
            'Resource-Status': 'Retrieved',
            'Request-Type': 'GET',
        }).status(200).json({
            team,
            _links: {
                self: {href: `/api/teams/${teamId}`, method: 'GET'},
                update: {href: `/api/teams/update/${teamId}`, method: 'PUT'},
                delete: {href: `/api/teams/delete/${teamId}`, method: 'DELETE'}
            }
        });
    } catch (error) {
        res.status(500).send('Błąd podczas wczytywania drużyny.');
    }
});

router.put('/teams/:id', async (req, res) => {
    const teamId = req.params.id;
    const {owner} = req.body;

    if (!owner) {
        return res.status(400).send('Pole "owner" jest wymagane');
    }

    try {
        const teams = await loadTeamsFromCSV();
        const teamIndex = teams.findIndex(t => t.TEAM_ID === teamId);

        if (teamIndex === -1) {
            return res.status(404).set({
                'Operation-Status': 'Failed',
                'Resource-Status': 'Not Found',
                'Request-Type': 'PUT'
            }).send(`Drużyna o TEAM_ID ${teamId} nie została znaleziona`);
        }

        teams[teamIndex].OWNER = owner;
        await saveTeamsToCSV(teams);

        res.set({
            'Operation-Status': 'Success',
            'Resource-Status': 'Updated',
            'Request-Type': 'PUT',
        }).status(200).json({
            updatedTeam: teams[teamIndex],
            _links: {
                self: {href: `/api/teams/${teamId}`, method: 'GET'},
                update: {href: `/api/teams/update/${teamId}`, method: 'PUT'},
                allTeams: {href: '/api/teams', method: 'GET'}
            }
        });
    } catch (error) {
        res.status(500).send('Błąd przy aktualizacji właściciela drużyny');
    }
});

router.post('/teams/add', async (req, res) => {
    const newTeam = req.body;

    if (!newTeam.TEAM_ID || !newTeam.LEAGUE_ID || !newTeam.CITY || !newTeam.NICKNAME) {
        return res.status(400).send('Brakuje wymaganego pola: TEAM_ID, LEAGUE_ID, CITY lub NICKNAME.');
    }

    try {
        const teams = await loadTeamsFromCSV();
        const existingTeam = teams.find(team => team.TEAM_ID === newTeam.TEAM_ID);

        if (existingTeam) {
            return res.status(400).send('Drużyna o podanym TEAM_ID już istnieje.');
        }

        teams.push(newTeam);
        await saveTeamsToCSV(teams);

        res.set({
            'Operation-Status': 'Success',
            'Resource-Status': 'Created',
            'Request-Type': 'POST',
        }).status(201).json({
            message: 'Drużyna została dodana pomyślnie.',
            _links: {
                self: {href: `/api/teams/${newTeam.TEAM_ID}`, method: 'GET'},
                allTeams: {href: '/api/teams', method: 'GET'}
            }
        });
    } catch (error) {
        res.status(500).send('Błąd przy dodawaniu drużyny.');
    }
});

router.delete('/teams/:id', async (req, res) => {
    const teamId = req.params.id;

    try {
        const teams = await loadTeamsFromCSV();
        const teamIndex = teams.findIndex(team => team.TEAM_ID === teamId);

        if (teamIndex === -1) {
            return res.status(404).set({
                'Operation-Status': 'Failed',
                'Resource-Status': 'Not Found',
                'Request-Type': 'DELETE'
            }).send(`Drużyna o TEAM_ID ${teamId} nie została znaleziona`);
        }

        teams.splice(teamIndex, 1);
        await saveTeamsToCSV(teams);

        res.set({
            'Operation-Status': 'Success',
            'Resource-Status': 'Deleted',
            'Request-Type': 'DELETE',
        }).status(200).json({
            message: `Drużyna o TEAM_ID ${teamId} została usunięta.`,
            _links: {
                allTeams: {href: '/api/teams', method: 'GET'},
                addTeam: {href: '/api/teams/add', method: 'POST'}
            }
        });
    } catch (error) {
        res.status(500).send('Błąd przy usuwaniu drużyny.');
    }
});

router.patch('/teams/:teamId', async (req, res) => {
    const teamId = req.params.teamId;
    const updates = req.body;

    const forbiddenFields = ['TEAM_ID', 'MIN_YEAR', 'LEAGUE_ID'];
    const hasForbiddenField = forbiddenFields.some(field => updates.hasOwnProperty(field));

    if (hasForbiddenField) {
        return res.status(400).set({
            'Operation-Status': 'Failed',
            'Resource-Status': 'Not Updated',
            'Request-Type': 'PATCH'
        }).send('Nie można zaktualizować pól: TEAM_ID, MIN_YEAR i LEAGUE_ID.');
    }

    if (!updates || Object.keys(updates).length === 0) {
        return res.status(400).set({
            'Operation-Status': 'Failed',
            'Resource-Status': 'Not Updated',
            'Request-Type': 'PATCH'
        }).send('Nie podano żadnych pól do aktualizacji.');
    }

    try {
        const teams = await loadTeamsFromCSV();
        const teamIndex = teams.findIndex(team => team.TEAM_ID === teamId);

        if (teamIndex === -1) {
            return res.status(404).set({
                'Operation-Status': 'Failed',
                'Resource-Status': 'Not Found',
                'Request-Type': 'PATCH'
            }).send('Drużyna o podanym TEAM_ID nie istnieje.');
        }

        const updatedTeam = {...teams[teamIndex], ...updates};
        teams[teamIndex] = updatedTeam;

        await saveTeamsToCSV(teams);

        res.set({
            'Operation-Status': 'Success',
            'Resource-Status': 'Updated',
            'Request-Type': 'PATCH'
        }).status(200).json({
            message: 'Drużyna została zaktualizowana pomyślnie.',
            updatedTeam: updatedTeam,
            _links: {
                self: {href: `/api/teams/${teamId}`, method: 'GET'},
                allTeams: {href: '/api/teams', method: 'GET'},
                delete: {href: `/api/teams/delete/${teamId}`, method: 'DELETE'}
            }
        });
    } catch (error) {
        console.error('Błąd podczas aktualizacji drużyny:', error);
        res.status(500).set({
            'Operation-Status': 'Failed',
            'Resource-Status': 'Error',
            'Request-Type': 'PATCH'
        }).send('Błąd przy aktualizacji drużyny.');
    }
});
export default router;
