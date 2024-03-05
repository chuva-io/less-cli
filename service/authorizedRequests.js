import api from "./api.js";
import { get_less_token } from "../utils/credentials.js";

/**
 * Makes an authorized GET request to the provided URL.
 * @param {Object} params - The function params.
 * @param {string} params.url - The URL to make the request to.
 * @param {Object} [params.headers] - The headers for the request.
 * @returns {Promise} The response from the API.
 * @throws {Error} If there is an error while making the request.
 */
export async function authorizedGet({ url, headers = {} }) {
  const LESS_TOKEN = await get_less_token();
  if (!headers['Authorization']) {
    headers['Authorization'] = `Bearer ${LESS_TOKEN}`;
  }

  return api.get(url, { headers });
}

/**
 * Makes an authorized POST request to the provided URL.
 * @param {Object} params - The function params.
 * @param {string} params.url - The URL to make the request to.
 * @param {Object} [params.data] - The data for the request.
 * @param {Object} [params.headers] - The headers for the request.
 * @returns {Promise} The response from the API.
 * @throws {Error} If there is an error while making the request.
 */
export async function authorizedPost({ url, data, headers = {} }) {
  const LESS_TOKEN = await get_less_token();
  if (!headers['Authorization']) {
    headers['Authorization'] = `Bearer ${LESS_TOKEN}`;
  }

  return api.post(url, data, { headers });
}

/**
 * Makes an authorized PUT request to the provided URL.
 * @param {Object} params - The function params.
 * @param {string} params.url - The URL to make the request to.
 * @param {Object} [params.data] - The data for the request.
 * @param {Object} [params.headers] - The headers for the request.
 * @returns {Promise} The response from the API.
 * @throws {Error} If there is an error while making the request.
 */
export async function authorizedPut({ url, data, headers = {} }) {
  const LESS_TOKEN = await get_less_token();
  if (!headers['Authorization']) {
    headers['Authorization'] = `Bearer ${LESS_TOKEN}`;
  }

  return api.put(url, data, { headers });
}

/**
 * Makes an authorized DELETE request to the provided URL.
 * @param {Object} params - The function params.
 * @param {string} params.url - The URL to make the request to.
 * @param {Object} [params.headers] - The headers for the request.
 * @returns {Promise} The response from the API.
 * @throws {Error} If there is an error while making the request.
 */
export async function authorizedDelete({ url, headers = {} }) {
  const LESS_TOKEN = await get_less_token();
  if (!headers['Authorization']) {
    headers['Authorization'] = `Bearer ${LESS_TOKEN}`;
  }

  return api.delete(url, { headers });
}
