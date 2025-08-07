/**
 * CORS Configuration Guide for FUMA Backend
 * 
 * If you're experiencing CORS errors, add this configuration to your backend server:
 */

// For Express.js backend (most common):
const cors = require('cors');

// Basic CORS configuration
app.use(cors({
    origin: [
        'http://localhost:3001',
        'http://127.0.0.1:3001',
        'http://localhost:3000',
        'http://127.0.0.1:3000'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Accept',
        'Origin',
        'X-Requested-With'
    ],
    credentials: true
}));

// Alternative: Allow all origins (development only)
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: false
}));

// For manual CORS headers (if not using cors middleware):
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3001');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// For Node.js with built-in http module:
const http = require('http');

const server = http.createServer((req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Your API logic here
});

// For other frameworks:

// Fastify:
await fastify.register(require('@fastify/cors'), {
    origin: ['http://localhost:3001', 'http://127.0.0.1:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true
});

// Koa:
const cors = require('@koa/cors');
app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true
}));

// Django (settings.py):
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

// Flask:
from flask_cors import CORS

CORS(app, origins=['http://localhost:3001'], supports_credentials=True)

/**
 * Common CORS Issues and Solutions:
 * 
 * 1. "Access-Control-Allow-Origin" error:
 *    - Ensure your backend allows the frontend's origin
 *    - Don't use wildcard (*) with credentials: true
 * 
 * 2. "Access-Control-Allow-Headers" error:
 *    - Add the specific headers your frontend sends
 *    - Common headers: Content-Type, Authorization, Accept
 * 
 * 3. "Access-Control-Allow-Methods" error:
 *    - Ensure all HTTP methods are allowed
 *    - Include OPTIONS for preflight requests
 * 
 * 4. Preflight request failures:
 *    - Handle OPTIONS requests properly
 *    - Return 200 status for preflight requests
 * 
 * 5. Credentials issues:
 *    - Set credentials: true on both frontend and backend
 *    - Cannot use wildcard origin with credentials
 */

export const corsConfig = {
    development: {
        origin: [
            'http://localhost:3001',
            'http://127.0.0.1:3001',
            'http://localhost:3000',
            'http://127.0.0.1:3000'
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
        credentials: true
    },
    production: {
        origin: process.env.FRONTEND_URL || 'https://yourdomain.com',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
        credentials: true
    }
};