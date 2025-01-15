import data from "../dane/dane.json" assert { type: "json" };
import { applyFilters } from "./helperFunctions.js";

const mapGame = (game) => {
    return {
        game_date_est: game.GAME_DATE_EST,
        game_id: game.GAME_ID,
        game_status_text: game.GAME_STATUS_TEXT,
        home_team_id: game.HOME_TEAM_ID,
        visitor_team_id: game.VISITOR_TEAM_ID,
        season: game.SEASON,
        pts_home: game.PTS_home,
        pts_away: game.PTS_away,
        fg_pct_home: game.FG_PCT_home,
        ft_pct_home: game.FT_PCT_home,
        fg3_pct_home: game.FG3_PCT_home,
        ast_home: game.AST_home,
        reb_home: game.REB_home,
        team_id_away: game.TEAM_ID_away,
        fg_pct_away: game.FG_PCT_away,
        ft_pct_away: game.FT_PCT_away,
        fg3_pct_away: game.FG3_PCT_away,
        ast_away: game.AST_away,
        reb_away: game.REB_away,
        home_team_wins: game.HOME_TEAM_WINS
    };
};

export const gameResolvers = {
    CreateGame: (req, res) => {
        const newGame = { ...req.request.game };
        data.games.push(newGame);
        const game = mapGame(newGame);
        res(null, { game });
    },

    GetGames: (req, res) => {
        const { filter, sort, page } = req.request || {};
        let result = data.games;
        
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

        const games = result.map((game) => mapGame(game));
        res(null, { games });
    },

    GetGame: (req, res) => {
        const gameId = req.request.game_id;
        const game = data.games.find((g) => g.GAME_ID === gameId);
        if (!game) {
            res({ code: 5, message: "Game not found" }, null);
            return;
        }
        const result = mapGame(game);
        res(null, result);
    },

    UpdateGame: (req, res) => {
        const gameIndex = data.games.findIndex((g) => g.GAME_ID === req.request.game_id);
        if (gameIndex === -1) {
            res({ code: 5, message: "Game not found" }, null);
            return;
        }
        
        data.games[gameIndex] = { ...data.games[gameIndex], ...req.request.game };
        const game = mapGame(data.games[gameIndex]);
        res(null, game);
    },

    DeleteGame: (req, res) => {
        const gameIndex = data.games.findIndex((g) => g.GAME_ID === req.request.game_id);

        if (gameIndex === -1) {
            res(null, { success: false, message: "Not Found", code: "404" });
        } else {
            data.games.splice(gameIndex, 1);
            res(null, { success: true, message: "Deleted", code: "204" });
        }
    },
};
