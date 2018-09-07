;(function(){
	// Performance Testing Stress Development
	// Performance Testing Style Development
	// Performance Testing Speed Development
	// Performance Testing Superior Development
	// Performance Testing Snippet Development
	// Performance Testing Skilled Development
	// Performance Testing Steady Development
	// Performance Testing Stepwise Development
	// Performance Testing Strong Development
	// Performance Testing Specified Development
	// Performance Testing Stipulated Development
	// Performance Testing Systematic Development
	if(!this.stool){ return }
	setTimeout(function(){
		stool.run();
	},1);
	stool.setup(window.setup = function(){
		window.BigText = Gun.text.random(1024, 'abcdef');
		window.MedText = Gun.text.random(200, 'abcdef');
		window.jsonText = JSON.stringify(window.BigText);
		window.radText = Radisk.encode(window.BigText);
	});
	stool.add('JSON encode string', function(){
		JSON.stringify(window.BigText);
	});
	stool.add('RAD encode string', function(){
		Radisk.encode(window.BigText);
	});
	stool.add('JSON decode string', function(){
		JSON.parse(window.jsonText);
	});
	stool.add('RAD decode string', function(){
		Radisk.decode(window.radText);
	});
	return;
	stool.add('JSON null', function(){
		JSON.parse(JSON.stringify(null));
	});
	stool.add('RAD null', function(){
		Radisk.decode(Radisk.encode(null));
	});
	stool.add('JSON false', function(){
		JSON.parse(JSON.stringify(false));
	});
	stool.add('RAD false', function(){
		Radisk.decode(Radisk.encode(false));
	});
	stool.add('JSON true', function(){
		JSON.parse(JSON.stringify(true));
	});
	stool.add('RAD true', function(){
		Radisk.decode(Radisk.encode(true));
	});
	stool.add('JSON number', function(){
		JSON.parse(JSON.stringify(23));
	});
	stool.add('RAD number', function(){
		Radisk.decode(Radisk.encode(23));
	});
	stool.add('JSON text', function(){
		JSON.parse(JSON.stringify("hello world"));
	});
	stool.add('RAD text', function(){
		Radisk.decode(Radisk.encode("hello world"));
	});
	stool.add('JSON text big', function(){
		JSON.parse(JSON.stringify(window.BigText));
	});
	stool.add('RAD text big', function(){
		Radisk.decode(Radisk.encode(window.BigText));
	});
}());