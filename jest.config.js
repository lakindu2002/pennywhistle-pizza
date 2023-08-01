module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    moduleNameMapper: {
        "^@pizza/entities$": "<rootDir>/src/entities/index.ts",
        "^@pizza/api/controllers/(.*)$": "<rootDir>/src/api/controllers/$1",
        "^@pizza/api/services$": "<rootDir>/src/api/services/index.ts",
        "^@pizza/utils$": "<rootDir>/src/utils/index.ts",
        "^@pizza/database$": "<rootDir>/src/database/index.ts",
        "^@pizza/logger$": "<rootDir>/src/logger/index.ts",
        "^@pizza/api/routes$": "<rootDir>/src/api/routes/index.ts",
        "^@pizza/swagger$": "<rootDir>/src/swagger/index.ts",
    }
};
