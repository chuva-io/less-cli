import { logError } from './logger.js';

/**
* Validates the project name.
*
* @param {string} name - The project name to validate.
* @throws {Error} If the project name is not provided.
* @throws {Error} If the project name does not satisfy the pattern [a-z][-a-z0-9]*.
*/
export function validateProjectName(name) {
  const regex = /^[a-z][-a-z0-9]*$/;

  if (!name) {
    logError('Error: project name option is required');
    process.exit(1);
  }

  if (!regex.test(name)) {
    logError('Error: project name option does not satisfy the pattern [a-z][-a-z0-9]*');
    process.exit(1);
  }
};

/**
* Validates the static name.
*
* @param {string} name - The static name to validate.
* @throws {Error} If the static name is not provided.
* @throws {Error} If the static name does not satisfy the pattern [a-z][-a-z0-9]*.
*/
export function validateStaticName(name) {
  const regex = /^[a-z][-a-z0-9]*$/;

  if (!name) {
    logError('Error: static name option is required');
    process.exit(1);
  }

  if (!regex.test(name)) {
    logError('Error: static name option does not satisfy the pattern [a-z][-a-z0-9]*');
    process.exit(1);
  }
}

/**
* Validates the custom domain.
*
* @param {string} customDomain - The custom domain to validate.
* @throws {Error} If the custom domain is not provided.
* @throws {Error} If the custom domain does not satisfy the pattern (?!https?:\/\/)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$.
* @throws {Error} If the custom domain is not a valid domain format.
*/
export function validateCustomDomain(customDomain) {
  // Check if the `customDomain` parameter is a string and not an empty string
  if (typeof customDomain !== 'string' || customDomain.trim().length === 0) {
    logError('Error: The custom domain option must be a non-empty string');
    process.exit(1);
  }

  // Check if the `customDomain` parameter satisfies the regular expression pattern
  if (!/^(?!https?:\/\/)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(customDomain)) {
    logError('Error: The custom domain option must satisfy regular expression pattern: (?!https?:\/\/)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');
    logError('Error: Example: example.com, subdomain.example.com, sub.subdomain.example.com');
    process.exit(1);
  }
};
