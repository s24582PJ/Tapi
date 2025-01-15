export const applyFilters = (item, filter) => {
    // Sprawdzanie każdego pola filtra
    for (const [key, value] of Object.entries(filter)) {
        if (value === undefined || value === null || value === '') continue;

        const itemValue = item[key.toUpperCase()]; // Konwertujemy klucz na wielkie litery, bo tak mamy w danych
        if (itemValue === undefined) continue;

        // Dla wartości liczbowych
        if (typeof itemValue === 'number' && typeof value === 'number') {
            if (itemValue !== value) return false;
            continue;
        }

        // Dla stringów - porównanie niewrażliwe na wielkość liter
        const strItemValue = String(itemValue).toLowerCase();
        const strFilterValue = String(value).toLowerCase();
        
        if (!strItemValue.includes(strFilterValue)) {
            return false;
        }
    }
    return true;
};

export const validateTeamId = (teamId) => {
    // ID drużyny powinno być 10-cyfrowe
    return /^\d{10}$/.test(teamId);
};

export const validatePlayerId = (playerId) => {
    // ID gracza powinno być 10-cyfrowe
    return /^\d{10}$/.test(playerId);
};

export const validateGameId = (gameId) => {
    // ID meczu powinno być 8-cyfrowe
    return /^\d{8}$/.test(gameId);
};

export const validateSeason = (season) => {
    // Sezon powinien być 4-cyfrowy
    return /^\d{4}$/.test(season);
};
