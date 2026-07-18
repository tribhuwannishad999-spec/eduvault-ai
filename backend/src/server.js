// backend/src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Express App Initialization
const app = express();

// ==========================================
// 1. SECURITY & MIDDLEWARES
// ==========================================
// Helmet helps secure Express apps by setting various HTTP headers
app.use(helmet());

// CORS configuration for production frontend domain
const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Body Parser Middleware
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// HTTP Request Logger
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Global Rate Limiter to prevent DDoS attacks
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests from this IP, please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', globalLimiter);

// ==========================================
// 2. ROUTE IMPORTS (To be created next)
// ==========================================
// We will import and mount our specific routes here in the upcoming steps.
// Example:
// const authRoutes = require('./routes/auth.routes');
// app.use('/api/auth', authRoutes);

// Health Check Route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'EduVault AI Core Engine is running smoothly.',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// ==========================================
// 3. GLOBAL ERROR HANDLER
// ==========================================
// 404 Route Not Found
app.use((req, res, next) => {
    res.status(404).json({ error: `Route not found: ${req.originalUrl}` });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(`[ERROR] ${err.message}`);
    console.error(err.stack);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ==========================================
// 4. SERVER INITIALIZATION
// ==========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`🚀 EduVault AI Server initialized!`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔌 Port: ${PORT}`);
    console.log(`========================================`);
});
