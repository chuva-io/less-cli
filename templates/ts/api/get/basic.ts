import { Api } from '@less-ifc/types';

export const process: Api.Handler = async (request: Api.Request, response: Api.Response) => {
  response.body = "Hello world!";
  return response;
}
