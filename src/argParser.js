module.exports = function parser(defaults = {}){

	const actualArgs = process.argv.slice(2);

	for(const arg of actualArgs) {
		if(arg.startsWith('--')) {

			const fullArg = arg.substring(2);
			if(fullArg.length < 1) continue;

			if(fullArg.includes('=')) {

				const [key, value] = fullArg.split('=');

				if(key && value) defaults[key] = value;
				else console.log(`invalid arg "--${key}=${value}"`);
				
				continue;

			}

			defaults[fullArg] = true;

		}
	}

	return defaults;

}

module.exports.argumentify = function argumentify(object) {
	const args = [];
	for(const key of Object.keys(object)) {
		if(object[key] === true) args.push(`--${key}`);
		else args.push(`--${key}=${object[key]}`);
	}
	return args;
}