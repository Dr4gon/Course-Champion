/**
 * Simple start script for the CourseChampion backend API
 *
 * This script runs the minimal version of the server (app.js)
 * which provides a browser-testable API endpoint.
 */

console.log('Starting CourseChampion API test server...');
console.log('Loading app.js...');

// Just require and run the app
require('./app.js');

console.log('\nTo test the API:');
console.log('1. Open your browser to http://localhost:3000/');
console.log('2. Click the "Test API Connection" button');
console.log('\nPress Ctrl+C to stop the server');
