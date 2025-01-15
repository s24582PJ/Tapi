export const applyFilters = (item, filters) => {
    for (const { field, operation, value } of filters) {
        const itemValue = item[field];

        // Konwersja wartości na odpowiedni typ
        let compareValue = value;
        let compareItemValue = itemValue;

        // Konwersja wartości numerycznych
        if (field.includes('PCT') || field.includes('PTS') || 
            field.includes('REB') || field.includes('AST') || 
            field === 'SEASON') {
            compareValue = parseFloat(value);
            compareItemValue = parseFloat(itemValue);
        }

        // Konwersja dat
        if (field === 'GAME_DATE_EST') {
            compareValue = new Date(value);
            compareItemValue = new Date(itemValue);
        }

        switch (operation) {
            case "EQUAL":
                if (compareItemValue !== compareValue) return false;
                break;
            case "NOT_EQUAL":
                if (compareItemValue === compareValue) return false;
                break;
            case "CONTAINS":
                if (!String(itemValue).toLowerCase().includes(String(value).toLowerCase())) return false;
                break;
            case "NOT_CONTAINS":
                if (String(itemValue).toLowerCase().includes(String(value).toLowerCase())) return false;
                break;
            case "GREATER":
                if (compareItemValue <= compareValue) return false;
                break;
            case "GREATER_OR_EQUAL":
                if (compareItemValue < compareValue) return false;
                break;
            case "LESS":
                if (compareItemValue >= compareValue) return false;
                break;
            case "LESS_OR_EQUAL":
                if (compareItemValue > compareValue) return false;
                break;
            case "STARTS_WITH":
                if (!String(itemValue).toLowerCase().startsWith(String(value).toLowerCase())) return false;
                break;
            case "ENDS_WITH":
                if (!String(itemValue).toLowerCase().endsWith(String(value).toLowerCase())) return false;
                break;
            case "IN_SEASON":
                if (itemValue !== value) return false;
                break;
            default:
                throw new Error(`Unsupported filter operation: ${operation}`);
        }
    }
    return true;
};

export const validateTeamId = (teamId) => {
    const stringId = typeof teamId === 'number' ? teamId.toString() : teamId;
    return /^\d+$/.test(stringId);
};

export const validatePlayerId = (playerId) => {
    const stringId = typeof playerId === 'number' ? playerId.toString() : playerId;
    return /^\d+$/.test(stringId);
};

export const validateGameId = (gameId) => {
    const stringId = typeof gameId === 'number' ? gameId.toString() : gameId;
    return /^\d+$/.test(stringId);
};