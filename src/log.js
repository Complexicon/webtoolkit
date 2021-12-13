const TEMPLATE_REGEX = /(?:\\(u(?:[a-f\d]{4}|{[a-f\d]{1,6}})|x[a-f\d]{2}|.))|(?:{(~)?(\w+(?:\([^)]*\))?(?:\.\w+(?:\([^)]*\))?)*)(?:[ \t]|(?=\r?\n)))|(})|((?:.|[\r\n\f])+?)/gi;
const STYLE_REGEX = /(?:^|\.)(\w+)(?:\(([^)]*)\))?/g;

const ESCAPES = new Map([
	['n', '\n'],
	['r', '\r'],
	['t', '\t'],
	['b', '\b'],
	['f', '\f'],
	['v', '\v'],
	['0', '\0'],
	['\\', '\\'],
	['e', '\u001B'],
	['a', '\u0007'],
]);

const c = require('picocolors');

function unescape(c) {
	const u = c[0] === 'u';
	const bracket = c[1] === '{';

	if ((u && !bracket && c.length === 5) || (c[0] === 'x' && c.length === 3)) {
		return String.fromCharCode(Number.parseInt(c.slice(1), 16));
	}

	if (u && bracket) {
		return String.fromCodePoint(Number.parseInt(c.slice(2, -1), 16));
	}

	return ESCAPES.get(c) || c;
}

function parseStyle(style) {
	STYLE_REGEX.lastIndex = 0;

	const results = [];
	let matches;

	while ((matches = STYLE_REGEX.exec(style)) !== null) {
		results.push(matches[1]);
	}

	return results;
}

function buildStyle(styles) {
	let current = [];
	for (const layer of styles) {
		for (const styleName of layer.styles) {
			if (!(styleName in c)) throw new Error(`Unknown style: ${styleName}`);
			current.push(c[styleName]);
		}
	}
	return current;
}

function template(string) {
	const styles = [];
	const chunks = [];
	let chunk = [];

	// eslint-disable-next-line max-params
	string.replace(TEMPLATE_REGEX, (_, escapeCharacter, inverse, style, close, character) => {
		if (escapeCharacter) {
			chunk.push(unescape(escapeCharacter));
		} else if (style) {
			const string = chunk.join('');
			chunk = [];
			chunks.push(styles.length === 0 ? string : buildStyle(styles).reduce((prev, style) => style(prev), string));
			styles.push({ inverse, styles: parseStyle(style) });
		} else if (close) {
			if (styles.length === 0) {
				throw new Error('Found extraneous } in template literal');
			}

			chunks.push(buildStyle(styles).reduce((prev, style) => style(prev), chunk.join('')));
			chunk = [];
			styles.pop();
		} else {
			chunk.push(character);
		}
	});

	chunks.push(chunk.join(''));

	if (styles.length > 0) {
		throw new Error(`template literal is missing ${styles.length} closing bracket${styles.length === 1 ? '' : 's'} (\`}\`)`);
	}

	return chunks.join('');
}

function log(prefix, ...message) {
	console.log(`[${template(Array.isArray(prefix) ? prefix.join('][') : prefix)}]:`, ...message);
}

log.build = function (prefix) {
	prefix = prefix || require('path').basename(log.build.caller.arguments[3]);
	function info(...message) { log([...(Array.isArray(prefix) ? prefix : [prefix]), '{cyan info}'], ...message) };
	function warn(...message) { log([...(Array.isArray(prefix) ? prefix : [prefix]), '{yellow warn}'], ...message) };
	function error(...message) { log([...(Array.isArray(prefix) ? prefix : [prefix]), '{red error}'], ...message) };
	return {
		info,
		infoT(...message) { info(...(message.map(v => typeof v === 'string' ? template(v) : v))) },
		warn,
		warnT(...message) { warn(...(message.map(v => typeof v === 'string' ? template(v) : v))) },
		error,
		errorT(...message) { error(...(message.map(v => typeof v === 'string' ? template(v) : v))) }
	}
}

module.exports = log;
module.exports.color = template;