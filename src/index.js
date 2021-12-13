#!/usr/bin/env node
const argParser = require('./argParser');
const args = argParser({ port: 3000, host: '127.0.0.1', routes: 'routes', detached: false });

// TODO
if(args.detached) {
	delete args.detached
	const forkArgs = argParser.argumentify(args);
	console.log(forkArgs)
	return;
}

const log = require('./log').build('{magenta.bold wtk-cli}');

process.on('uncaughtException', error => {
	log.error(error.message);
	log.error(error.stack)
})

const wtk = require('./lib')(args.routes);

if(wtk) {
	wtk.server.listen(args.port, args.host, () => {
		log.infoT(`server running at {bold.underline.cyan http://${args.host}:${args.port}}`);
	})
}