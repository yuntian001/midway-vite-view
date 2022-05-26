module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ["**/test/?(*.)+(spec|test).[jt]s?(x)" ],
  testPathIgnorePatterns: ['<rootDir>/test/fixtures'],
  coveragePathIgnorePatterns: ['<rootDir>/test/'],
  setupFilesAfterEnv: ['./jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
