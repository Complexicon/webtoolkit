#!/usr/bin/env node
const args = (()=>{

	const defaults = { port: 3000, host: '127.0.0.1', routes: 'routes',  };

	const actualArgs = process.argv.slice(2);

	for(const arg of actualArgs){
		if(arg.startsWith('--') && arg.includes('=')){
			const [p, v] = arg.substr(2).split('=');
			if(!(p && v)) process.exit(1);
			defaults[p] = v;
		}
	}

	return defaults;

})();

const log = require('./log').build('{magenta.bold wtk-cli}');

process.on('uncaughtException', error => {
	log.error(error.message);
	log.error(error.stack)
})

const wtk = require('./lib')(args.routes);

if(wtk){
	wtk.server.listen(args.port, args.host, ()=>{
		log.infoT(`server running at {bold.underline.cyan http://${args.host}:${args.port}}`);
	})
}