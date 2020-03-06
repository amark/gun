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
		//window.BigText = Gun.text.random(1024, 'abcdef');
		//window.MedText = Gun.text.random(200, 'abcdef');
		//window.jsonText = JSON.stringify(window.BigText);
		//window.radText = Radisk.encode(window.BigText);

		window.namez = ["Adalard","Adora","Aia","Albertina","Alfie","Allyn","Amabil","Ammamaria","Andy","Anselme","Ardeen","Armand","Ashelman","Aube","Averyl","Baker","Barger","Baten","Bee","Benia","Bernat","Bevers","Bittner","Bobbe","Bonny","Boyce","Breech","Brittaney","Bryn","Burkitt","Cadmann","Campagna","Carlee","Carver","Cavallaro","Chainey","Chaunce","Ching","Cianca","Claudina","Clyve","Colon","Cooke","Corrina","Crawley","Cullie","Dacy","Daniela","Daryn","Deedee","Denie","Devland","Dimitri","Dolphin","Dorinda","Dream","Dunham","Eachelle","Edina","Eisenstark","Elish","Elvis","Eng","Erland","Ethan","Evelyn","Fairman","Faus","Fenner","Fillander","Flip","Foskett","Fredette","Fullerton","Gamali","Gaspar","Gemina","Germana","Gilberto","Giuditta","Goer","Gotcher","Greenstein","Grosvenor","Guthrey","Haldane","Hankins","Harriette","Hayman","Heise","Hepsiba","Hewie","Hiroshi","Holtorf","Howlond","Hurless","Ieso","Ingold","Isidora","Jacoba","Janelle","Jaye","Jennee","Jillana","Johnson","Josy","Justinian","Kannan","Kast","Keeley","Kennett","Kho","Kiran","Knowles","Koser","Kroll","LaMori","Lanctot","Lasky","Laverna","Leff","Leonanie","Lewert","Lilybel","Lissak","Longerich","Lou","Ludeman","Lyman","Madai","Maia","Malvina","Marcy","Maris","Martens","Mathilda","Maye","McLain","Melamie","Meras","Micco","Millburn","Mittel","Montfort","Moth","Mutz","Nananne","Nazler","Nesta","Nicolina","Noellyn","Nuli","Ody","Olympie","Orlena","Other","Pain","Parry","Paynter","Pentheas","Pettifer","Phyllida","Plath","Posehn","Proulx","Quinlan","Raimes","Ras","Redmer","Renelle","Ricard","Rior","Rocky","Ron","Rosetta","Rubia","Ruttger","Salbu","Sandy","Saw","Scholz","Secor","September","Shanleigh","Shenan","Sholes","Sig","Sisely","Soble","Spanos","Stanwinn","Stevie","Stu","Suzanne","Tacy","Tanney","Tekla","Thackeray","Thomasin","Tilla","Tomas","Tracay","Tristis","Ty","Urana","Valdis","Vasta","Vezza","Vitoria","Wait","Warring","Weissmann","Whetstone","Williamson","Wittenburg","Wymore","Yoho","Zamir","Zimmermann"];
		window.radix = window.radix || Radix();
		window.arr = []; var i = 1000; while(--i){ arr.push(Math.random()) }
		window.arrs = arr.slice(0).sort();
		window.ALLZ = window.ALLZ || {};
		window.namez.forEach(function(v,i){ ALLZ[v] = i });
	});
	/* TEMPORARY COPY OF RADIX UNIT TESTS TO BOOST SPEED */
	/* THESE ARE PROBABLY STALE AND NEED TO BE COPIED FROM UNIT TESTS AGAIN */
	/*stool.add('map', function(){
		Gun.obj.map(ALLZ, function(v,i){
			v;
		});
	});
	stool.add('for', function(){
		for(var k in ALLZ){
			ALLZ[k];
		}
	});
	stool.add('for', function(){
		Object.keys(ALLZ).forEach(function(k){
			ALLZ[k];
		})
	});
	return;*/
	stool.add('1', function(){
        var rad = Radix();
        rad('asdf.pub', 'yum');
        rad('ablah', 'cool');
        rad('ab', {yes: 1});
        rad('node/circle.bob', 'awesome');

        (JSON.stringify(rad('asdf.')) !== JSON.stringify({pub: {'': 'yum'}})) && bada;
        (rad('nv/foo.bar') != undefined) && badb;
        (JSON.stringify(rad('ab')) != JSON.stringify({yes: 1})) && badc
        (JSON.stringify(rad()) != JSON.stringify({"a":{"sdf.pub":{"":"yum"},"b":{"lah":{"":"cool"},"":{"yes":1}}},"node/circle.bob":{"":"awesome"}})) && badd;
	});
	stool.add('2', function(){
        var all = {};
        namez.forEach(function(v,i){
            v = v.toLowerCase();
            all[v] = v;
            ALLZ[v] = i;
            radix(v, i)
        });
        (Gun.obj.empty(all) === true) && bad3;
        Radix.map(radix, function(v,k){
            delete all[k];
        });
        (Gun.obj.empty(all) !== true) && bad4;
	});
	stool.add('fast?', function(){
		ALLZ['rubia'];
	});
	stool.add('fastest?', function(){
		namez.indexOf('Rubia');
	});
	stool.add('3', function(){
        var all = {};
        namez.forEach(function(v,i){
            v = v.toLowerCase();
            all[v] = v;
            //rad(v, i)
        });
        (Gun.obj.empty(all) === true) && bad5;
        Radix.map(radix, function(v,k){
            delete all[k];
        });
        (Gun.obj.empty(all) !== true) && bad6;
	});
	stool.add('4', function(){
        var all = {}, start = 'Warring'.toLowerCase(), end = 'Zamir'.toLowerCase();
        namez.forEach(function(v,i){
            v = v.toLowerCase();
            if(v < start){ return }
            if(end < v){ return }
            all[v] = v;
            //rad(v, i)
        });
        (Gun.obj.empty(all) === true) && bad7;
        Radix.map(radix, function(v,k, a,b){
            //if(!all[k]){ throw "out of range!" }
            delete all[k];
        }, {start: start, end: end});
        (Gun.obj.empty(all) !== true) && bad8;
	});
	stool.add('5', function(){
        var all = {}, start = 'Warrinf'.toLowerCase(), end = 'Zamis'.toLowerCase();
        namez.forEach(function(v,i){
            v = v.toLowerCase();
            if(v < start){ return }
            if(end < v){ return }
            all[v] = v;
            //rad(v, i)
        });
        (Gun.obj.empty(all) === true) && bad9;
        Radix.map(radix, function(v,k, a,b){
            //if(!all[k]){ throw "out of range!" }
            delete all[k];
        }, {start: start, end: end});
        (Gun.obj.empty(all) !== true) && bad10;
	});
	stool.add('reverse item', function(){
        Radix.map(radix, function(v,k, a,b){
            (k !== 'ieso') && badri;
            (v !== 96) && badri2;
            return true;
        }, {reverse: 1, end: 'iesogon'});
	});
	stool.add('6', function(){
        var r = Radix(), tmp;
        r('alice', 1);r('bob', 2);r('carl', 3);r('carlo',4);
        r('dave', 5);r('zach',6);r('zachary',7);
        var by = ['alice','bob','carl','carlo','dave','zach','zachary'];
        Gun.obj.map(by, function(k,i){
            r(k,i);
        });
        Radix.map(r, function(v,k, a,b){
        	(by.pop() !== k) && bad11;
          tmp = v;
        }, {reverse: 1});
        (tmp !== 1) && bad12;
        (by.length !== 0) && bad13;
        Radix.map(r, function(v,k, a,b){
            tmp = v;
        });
        (tmp !== 7) && bad14;
	});
	return;
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