import * as Gun from 'gun';
import { AsyncStorage } from 'react-native';

const readNode = (key, cb) => {
	AsyncStorage.getItem(key || '', cb);
};

const read = (request, db) => {
	const { get } = request;

	const dedupid = request['#'];
	const key = get['#'];
	const field = get['.'];

	const done = (err, data) => {
		if (!data && !err) {
			db.on('in', {
				'@': dedupid,
				put: null,
				err: null,
			});
		} else {
			db.on('in', {
				'@': dedupid,
				put: Gun.graph.node(data),
				err,
			});
		}
	};

	const acknowledgeRet = (err, result) => {
		if (err) {
			done(err);
		} else if (result === null) {
			// Nothing found
			done(null);
		} else {
			const temp = JSON.parse(result);
			if (field) {
				done(null, temp[field] || null);
			} else {
				done(null, temp);
			}
		}
	};

	readNode(key || '', acknowledgeRet);
};

const write = (request, db) => {
	const { put: graph } = request;
	const keys = Object.keys(graph);
	const dedupid = graph['#'];

	const instructions = keys.map((key) => {
		return [key, JSON.stringify(graph[key] || {})];
	});

	AsyncStorage.multiMerge(instructions, (err) => {
		db.on('in', {
			'#': dedupid,
			ok: !err || err.length === 0,
			err,
		});
	});
};

// This returns a promise, it can be awaited!
const reset = () => AsyncStorage.clear();

export default {
	read,
	write,
	reset,
};
