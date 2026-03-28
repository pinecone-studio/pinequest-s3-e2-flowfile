import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { graphqlTypePaths } from './schema';
import { createGraphqlContext } from './context';

export const graphqlServerConfig: ApolloDriverConfig = {
  driver: ApolloDriver,
  path: '/graphql',
  playground: true,
  typePaths: graphqlTypePaths,
  context: createGraphqlContext,
};
