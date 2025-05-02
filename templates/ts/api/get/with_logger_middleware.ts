import { Api } from '@less-ifc/types';

// Example of a middleware function that logs requests
const logger_middleware: Api.Middleware = async (request: Api.Request, response: Api.Response, next: Api.NextFunction) => {
  console.log('[LOGGER MIDDLEWARE] Processing request');
  console.log('[LOGGER MIDDLEWARE] Request headers:', request.headers);
  console.log('[LOGGER MIDDLEWARE] Request path params:', request.params);
  console.log('[LOGGER MIDDLEWARE] Request query params:', request.query);
  console.log('[LOGGER MIDDLEWARE] Request body:', request.body);

  // You can also modify the request or response objects here if needed
  // For example, you can add a custom header to the response
  response.headers['X-Custom-Header'] = 'CustomValue';

  // Or you can add the authenticated user to the request object
  request.user = { id: '001', name: 'Amilcar Cabral' };

  // You can also return early from the middleware if you want to stop the request from reaching the main handler
  // Uncomment the line below to stop the request
  // return response;

  next();
}

// Array of middleware functions to run before the main handler
export const middlewares: Api.Middlewares = [
  logger_middleware
];

// When someone accesses this API endpoint this function will be called.
export const process: Api.Handler = async (request: Api.Request, response: Api.Response) => {
  /**
   * This contains the query params.
   * 
   * Add "?status=sold" to the route to only return sold pets.
   */
  const { status } = request.query;

  // Mock pets data.
  const pets = [
    { id: 1, name: 'Dog', status: 'available' },
    { id: 2, name: 'Cat', status: 'pending' },
    { id: 3, name: 'Fish', status: 'sold' },
  ]
  // Filter based on the `status` query parameter.
  .filter(pet => status ? pet.status === status : true); 

  response.body = JSON.stringify(pets);

  return response;
}
