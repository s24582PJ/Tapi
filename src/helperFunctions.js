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

// Proste sprawdzenie czy ID nie jest puste
export const validateTeamId = (teamId) => {
    return teamId && teamId.length > 0;
};

export const validatePlayerId = (playerId) => {
    return playerId && playerId.length > 0;
};

export const validateGameId = (gameId) => {
    return gameId && gameId.length > 0;
};

export const validateSeason = (season) => {
    return season && season.length > 0;
};
