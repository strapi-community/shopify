#!/bin/zsh
# Please use this command to extract GQL types from the server in monorepo
../../node_modules/.bin/graphql-codegen --config ./.graphqlrc.ts --watch ./
