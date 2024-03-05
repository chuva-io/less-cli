import fs from 'fs/promises';
import os from 'os';
import path from 'path';

import { logError } from './logger.js';

const token_error_message = '`LESS_TOKEN` not found in your environment variables. Please login using the `login` command and try again.';

// Define the path to the credentials file
const credentials_path = path.join(os.homedir(), '.less-cli', 'credentials');

/**
 * Set credentials in a JSON file.
 * @param {object} credentials - The credentials to be stored in the file.
 * @throws {Error} If an error occurs while writing to the file.
 */
export async function set_credentials(credentials) {
	try {
		// Ensure the directory exists
		await fs.mkdir(path.dirname(credentials_path), { recursive: true });

		// Write the credentials to the file
		await fs.writeFile(credentials_path, JSON.stringify(credentials), 'utf8');
	} catch (err) {
		logError(`Error writing to ${credentials_path}: ${err}`);
		process.exit(1);
	}
}

/**
 * Get stored credentials from a JSON file.
 * @returns {object} The stored credentials.
 * @throws {Error} If the file doesn't exist or an error occurs while reading from the file.
 */
export async function get_credentials() {
	try {
		// Check if the file exists
		await fs.access(credentials_path);

		// If the file exists, read from it
		const data = await fs.readFile(credentials_path, 'utf8');

		// Parse the credentials
		const credentials = JSON.parse(data);

		return credentials;
	} catch (err) {
		logError(token_error_message);
		process.exit(1);
	}
}

/**
 * Get a LESS token from environment variables or stored credentials.
 * @returns {string} The LESS token.
 * @throws {Error} If the file doesn't exist or an error occurs while reading from the file.
 */
export async function get_less_token() {
	try {
		let token = process.env.LESS_TOKEN;

		if (token) {
			return token;
		}

		const credentials = await get_credentials();

		if (!credentials?.LESS_TOKEN) {
			logError(token_error_message);
			process.exit(1);
		}

		return credentials?.LESS_TOKEN;
	} catch (err) {
		logError(token_error_message);
		process.exit(1);
	}
}
