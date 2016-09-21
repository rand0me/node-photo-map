'use strict';

const http = require('http');
const path = require('path');

// configuration
const config = require('./config/environment.json');
const isRelease = process.argv.indexOf('release') !== -1;
config.publicDirectoryPath = path.join(__dirname, 'public');
config.server.port = process.env.OPENSHIFT_NODEJS_PORT || config.server.port || 3000;
config.server.ip = process.env.OPENSHIFT_NODEJS_IP || config.server.ip || "0.0.0.0";
config.isRelease = isRelease ? config.isRelease : isRelease;

// catberry application
const catberry = require('catberry');
const cat = catberry.create(config); // the Catberry application object
cat.events.on('ready', () => {
	const logger = cat.locator.resolve('logger');
	logger.info(`Ready to handle incoming requests on ${config.server.ip}:${config.server.port}`);
});

// register Catberry plugins needed on the server
const templateEngine = require('catberry-handlebars');
templateEngine.register(cat.locator);

const loggerPlugin = require('catberry-logger');
loggerPlugin.register(cat.locator);

const uhrPlugin = require('catberry-uhr');
uhrPlugin.register(cat.locator);

// web server
const express = require('express');
const app = express();

const serveStatic = require('serve-static');
app.use(serveStatic(config.publicDirectoryPath));

app.use(cat.getMiddleware()); // Catberry app as a middleware

const errorhandler = require('errorhandler');
app.use(errorhandler());

http
	.createServer(app)
	.listen(config.server.port, config.server.ip);
