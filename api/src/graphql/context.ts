import type { Request, Response } from 'express';

export interface GraphqlContext {
  req: Request;
  res: Response;
}

export const createGraphqlContext = ({
  req,
  res,
}: GraphqlContext): GraphqlContext => ({
  req,
  res,
});
