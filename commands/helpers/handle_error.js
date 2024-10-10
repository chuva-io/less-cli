import chalk from 'chalk';

// Helper function to handle errors
export default function handleError(message) {
    console.error(chalk.redBright('Error:'), message || 'An error occurred');
    process.exitCode = 1;
}
