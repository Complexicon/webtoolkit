const { Utils, Route } = require('webtoolkit');
const { log } = Utils;
const logger = log.build('main.js')

module.exports = new Route('/', true).setupRoutes(async(app) => {
	logger.info('test');
	app.get('*', (req, res) => res.send('hey'));
})