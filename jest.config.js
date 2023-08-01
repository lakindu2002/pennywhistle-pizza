module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    moduleNameMapper: {
        "^@pizza/entities$": "<rootDir>/src/entities/index.ts"
    }
};
