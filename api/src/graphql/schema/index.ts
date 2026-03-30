import { join } from 'path';

export const graphqlTypePaths = [
  join(process.cwd(), 'src/graphql/schema/**/*.graphql'),
];
