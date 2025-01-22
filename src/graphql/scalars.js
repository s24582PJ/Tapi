import { GraphScalarType } from 'graphql';

const PositiveInt = new GraphScalarType({
    name: 'PositiveInt',
    description: 'A positive integer value',
    parseValue(value) {
        const intValue = parseInt(value, 10);
        if (intValue <= 0) {
            throw new Error('Value must be a positive integer');
        }
        return intValue; 
    },
    serialize(value) {
        return value; 
    },
    parseLiteral(ast) {
        if (ast.kind === 'IntValue') {
            const intValue = parseInt(ast.value, 10);
            if (intValue <= 0) {
                throw new Error('Value must be a positive integer');
            }
            return intValue; 
        }
        throw new Error('Value must be a positive integer');
    },
});

export { PositiveInt }; 