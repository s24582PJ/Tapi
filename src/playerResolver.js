import data from "../dane/dane.json" assert { type: "json" };
import { applyFilters } from "./helperFunctions.js";

const mapPlayer = (player) => {
    return {
        player_name: player.PLAYER_NAME,
        team_id: player.TEAM_ID,
        player_id: player.PLAYER_ID,
        season: player.SEASON
    };
};

export const playerResolvers = {
    CreatePlayer: (req, res) => {
        const newPlayer = { ...req.request.player };
        data.players.push(newPlayer);
        const player = mapPlayer(newPlayer);
        res(null, { player });
    },

    GetPlayers: (req, res) => {
        const { filter, sort, page } = req.request || {};
        let result = data.players;
        
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

        const players = result.map((player) => mapPlayer(player));
        res(null, { players });
    },

    GetPlayer: (req, res) => {
        const playerId = req.request.player_id;
        const player = data.players.find((p) => p.PLAYER_ID === playerId);
        if (!player) {
            res({ code: 5, message: "Player not found" }, null);
            return;
        }
        const result = mapPlayer(player);
        res(null, result);
    },

    UpdatePlayer: (req, res) => {
        const playerIndex = data.players.findIndex((p) => p.PLAYER_ID === req.request.player_id);
        if (playerIndex === -1) {
            res({ code: 5, message: "Player not found" }, null);
            return;
        }
        
        data.players[playerIndex] = { ...data.players[playerIndex], ...req.request.player };
        const player = mapPlayer(data.players[playerIndex]);
        res(null, player);
    },

    DeletePlayer: (req, res) => {
        const playerIndex = data.players.findIndex((p) => p.PLAYER_ID === req.request.player_id);

        if (playerIndex === -1) {
            res(null, { success: false, message: "Not Found", code: "404" });
        } else {
            data.players.splice(playerIndex, 1);
            res(null, { success: true, message: "Deleted", code: "204" });
        }
    },
};
