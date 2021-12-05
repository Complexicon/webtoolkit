const express = require('express');
const { urlencoded, json, Router } = express;

const { createServer } = require('http');
const { join, resolve, extname } = require('path');

const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
const { existsSync } = require('fs');

const logger = require('./log').build('{magenta webtoolkit}');

function wtk(routeFolder, options) {

	const { favicon, notFoundHTML } = options || { favicon: false, notFoundHTML: false};

	if (!routeFolder) {
		logger.error('a folder containing routes is nessecary!');
		return false;
	}

	if (!existsSync(routeFolder)) {
		logger.error('the route folder does not exist!');
		return false;
	}

	const app = express();
	const server = createServer(app);
	const io = new Server(server, { allowEIO3: true });

	const routes = resolve(routeFolder);

	logger.infoT('welcome to {magenta.bold webtoolkit} v1.7!');

	// middlewares

	const morganwrap = require('./log').build('{magenta request}').info;

	app.use(require('morgan')('dev', { stream: { write: msg => morganwrap(msg.trimEnd()) } }));
	favicon && app.use(require('serve-favicon')(resolve(favicon)));
	app.use(cookieParser());
	app.use(urlencoded({ extended: true }));
	app.use(json());

	const files = require('fs').readdirSync(routes);

	let activeRoutes = [];

	const moduleLoader = require;

	for (const file of files) {
		if (extname(file) !== '.js') continue;

		const route = moduleLoader(join(routes, file));

		if (route.disabled) continue;

		if (!route.router || !route.routePath) {
			logger.warnT(`{red file} {red.bold ${file}} {red is not a valid route file! skipping.}`);
			continue;
		}

		if (activeRoutes.includes(route.routePath)) {
			logger.warnT(`{red file} {red.bold ${file}} {red tried to register route that already exists}:`, route.routePath, 'skipping...');
			continue;
		} else activeRoutes.push(route.routePath);

		const newRouter = Router();
		route.router(newRouter);

		app.use(route.routePath, newRouter);

		logger.info('file', file, 'registered router for', route.routePath)
		if (route.socketio) {
			io.of(route.routePath).on('connection', route.socketio);
			logger.info('file', file, 'registered socketio for namespace', route.routePath);
		}
	}

	if (notFoundHTML)
		app.get('*', (_, res) => res.status(404).sendFile(resolve(notFoundHTML)));
	else
		app.get('*', (_, res) => res.status(404).send('<b>404 Not Found!</b>'));

	return { app, io, server };

}

module.exports = wtk;
module.exports.Utils = { log: require('./log'), };
module.exports.Route = require('./Route');