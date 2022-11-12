const { pathsToModuleNameMapper } = require('ts-jest/utils')
const { paths } = require('./tsconfig.json')
const moduleNameMapper = pathsToModuleNameMapper(paths, { prefix: '<rootDir>/' })

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: false,
  moduleNameMapper
}

