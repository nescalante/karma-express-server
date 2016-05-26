
'use strict';

const express = require('express');
const http = require('http');
const https = require('https');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

/**
 * Creates an express server and passes `app` and `logger` to karma
 * configuration for further extension.
 */
module.exports = {
  'framework:expressServer': [
    'factory',
    function(args, configOverrides, logger) {
      // default config
      configOverrides = configOverrides || {};
      configOverrides = configOverrides.expressServer || {};
      let configDefaults = {
        accessControlAllowOrigin: 'http://localhost:9876',
        accessControlAllowCredentials: 'true',
        accessControlAllowMethods: 'GET, PUT, POST, DELETE, OPTIONS',
        accessControlMaxAge: '3600',
        accessControlAllowHeaders: 'x-requested-with, Content-Type, ' +
          'Content-Length, Content-Range, Content-Encoding',
        serverOptions: {},
        serverPort: 9877,
        extensions: []
      };
      let config = {};
      Object.assign(config, configDefaults, configOverrides);

      // construct express server
      let log = logger.create('karma-express-server');
      log.info('Starting express server...');
      let app = express();
      app.use(bodyParser.json());
      app.use(function(req, res, next) {
        res.set('Access-Control-Allow-Credentials',
            config.accessControlAllowCredentials.toString());
        res.set('Access-Control-Allow-Methods',
            config.accessControlAllowMethods);
        res.set('Access-Control-Max-Age', config.accessControlMaxAge);
        res.set('Access-Control-Allow-Headers', accessControlAllowHeaders);
        res.set('Access-Control-Allow-Origin', accessControlAllowOrigin);
        next();
      });

      // extend express application
      config.extensions.forEach(function(extension) {
        extension(app, logger);
      });

      // start express server
      let httpsServer = https.createServer(config.serverOptions, app)
          .listen(config.serverPort, function() {
        log.info('Listening on port %d...', config.serverPort);
      });
    }
  ]
};
