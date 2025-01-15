import data from "../dane/dane.json" assert { type: "json" };
import { applyFilters } from "./helperFunctions.js";

const mapTeam = (team) => {
    return {
        team_id: team.TEAM_ID,
        nickname: team.NICKNAME,
        city: team.CITY,
        arena: team.ARENA,
        owner: team.OWNER,
        league_id: team.LEAGUE_ID,
        min_year: team.MIN_YEAR,
        max_year: team.MAX_YEAR,
        abbreviation: team.ABBREVIATION,
        yearfounded: team.YEARFOUNDED,
        arenacapacity: team.ARENACAPACITY,
        generalmanager: team.GENERALMANAGER,
        headcoach: team.HEADCOACH,
        dleagueaffiliation: team.DLEAGUEAFFILIATION
    };
};

export const teamResolvers = {
    CreateTeam: (req, res) => {
        const newTeam = { ...req.request.team };
        data.teams.push(newTeam);
        const team = mapTeam(newTeam);
        res(null, { team });
    },

    GetTeams: (req, res) => {
        const { filter, sort, page } = req.request || {};
        let result = data.teams;
        
        if (filter) {
            result = result.filter((item) => applyFilters(item, filter));
        }

        if (sort) {
            const { field, order } = sort;
            result = result.sort((a, b) => {
                if (a[field] < b[field]) return order === "ASC" ? -1 : 1;
                if (a[field] > b[field]) return order === "ASC" ? 1 : -1;
                return 0;
            });
        }

        if (page) {
            const { limit, offset } = page;
            result = result.slice(offset, offset + limit);
        }

        const teams = result.map((team) => mapTeam(team));
        res(null, { teams });
    },

    GetTeam: (req, res) => {
        const teamId = req.request.team_id;
        const team = data.teams.find((t) => t.TEAM_ID === teamId);
        if (!team) {
            res({ code: 5, message: "Team not found" }, null);
            return;
        }
        const result = mapTeam(team);
        res(null, result);
    },

    UpdateTeam: (req, res) => {
        const teamIndex = data.teams.findIndex((t) => t.TEAM_ID === req.request.team_id);
        if (teamIndex === -1) {
            res({ code: 5, message: "Team not found" }, null);
            return;
        }
        
        data.teams[teamIndex] = { ...data.teams[teamIndex], ...req.request.team };
        const team = mapTeam(data.teams[teamIndex]);
        res(null, team);
    },

    DeleteTeam: (req, res) => {
        const teamIndex = data.teams.findIndex((t) => t.TEAM_ID === req.request.team_id);

        if (teamIndex === -1) {
            res(null, { success: false, message: "Not Found", code: "404" });
        } else {
            data.teams.splice(teamIndex, 1);
            res(null, { success: true, message: "Deleted", code: "204" });
        }
    },
};
