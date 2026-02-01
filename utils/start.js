#!/usr/bin/env node

/**
 * Startup script that checks ngrok setup before starting server
 */

const { execSync } = require('child_process');

console.log('\n🚀 Starting Hackathon Server...\n');

// Check if ngrok authtoken is set
const hasAuthtoken = process.env.NGROK_AUTHTOKEN;

if (!hasAuthtoken) {
  console.log('⚠️  NGROK AUTHTOKEN NOT SET');
  console.log('══════════════════════════════════════════════════════════');
  console.log('The server will run on localhost only.');
  console.log('\nTo enable remote multiplayer (recommended):');
  console.log('1. Sign up at https://ngrok.com (free)');
  console.log('2. Get your authtoken from the dashboard');
  console.log('3. Set environment variable:');
  console.log('   export NGROK_AUTHTOKEN="your_token_here"');
  console.log('4. Run npm start again');
  console.log('\nSee NGROK_SETUP.md for detailed instructions.');
  console.log('══════════════════════════════════════════════════════════\n');
} else {
  console.log('✅ Ngrok authtoken detected!');
  console.log('   Remote multiplayer will be available.\n');
}

// Start the actual server
try {
  execSync('node server.js', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}