var expect = global.expect || require('./expect');

describe('Time Extension', function(){
	it('requires gun/lib/time in nodejs without error', function(){
		var Gun = require('../gun');
		expect(typeof Gun).to.be('function');
		expect(typeof Gun.node).to.be('object');
		expect(typeof Gun.node.ify).to.be('function');
		
		expect(function(){
			require('../lib/time');
		}).to.not.throwException();

		expect(typeof Gun.chain.time).to.be('function');
	});

	it('chains time data onto node', function(){
		var Gun = require('../gun');
		require('../lib/time');
		var gun = Gun({radisk: false, localStorage: false});
		var t = gun.get('test_time');
		var res = t.time('sample_temporal_data');
		expect(res).to.be(t);
	});
});
