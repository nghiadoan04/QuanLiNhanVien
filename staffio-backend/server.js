require('dotenv').config();
const express = require('express');
const corsConfig = require('./src/config/cors');
const { sequelize } = require('./src/models');
const routes = require('./src/routes');
const errorMiddleware = require('./src/middlewares/error.middleware');

const app = express();
const PORT = process.env.PORT || 8080;

// Middlewares
app.use(corsConfig);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Error handler (must be last)
app.use(errorMiddleware);

// Start server
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    await sequelize.sync({ alter: false });
    console.log('Database synced.');

    app.listen(PORT, () => {
      console.log(`Staffio server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

startServer();
