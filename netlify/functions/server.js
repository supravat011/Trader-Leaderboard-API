import serverless from 'serverless-http';
import app from '../../src/app.js';

// Set Netlify environment flag
process.env.NETLIFY = 'true';

// Export the serverless-wrapped Express app
export const handler = serverless(app);

