const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Your API Documentation',
      version: '1.0.0',
      description: 'Documentation for your API built with Node.js and Express',
    },
  },
  apis: ['./src/Controllers/**/*.js'], // Path to the API routes folder
};

const swaggerConfig= swaggerJsdoc(options);

module.exports = swaggerConfig;
