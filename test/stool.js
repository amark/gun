(function(){

var stool = {};
var suite;

function abort() {
	if (!suite || (suite && !suite.running)) return;

	suite.abort();
	var results = document.getElementsByClassName('result');
	for (var i = 0; i < results.length; i++) {
		if (results[i].classList.contains('running'))
			results[i].innerText = 'aborted';
	}
	return stool;
}
stool.abort = abort;

function clear() {
	if (suite && suite.running) abort();

	var results = document.getElementsByClassName('result');
	for (var i = 0; i < results.length; i++) {
		results[i].innerText = '';
		results[i].classList.remove('running');
	}
	return stool;
}
stool.clear = clear;

function run() {
	abort();

	var titles = document.getElementsByClassName('title');
	var cases = document.getElementsByClassName('case');
	var results = document.getElementsByClassName('result');
	var common = document.getElementById('common');

	suite = new Benchmark.Suite;
	suite.on('complete', function() {
		console.log(this);
		document.body.classList.remove('running');
	});

	document.body.classList.add('running');

	for (var i = 0; i < cases.length; i++) {
		results[i].classList.add('running');
		results[i].innerText = 'queued';
		suite.add(titles[i].value, cases[i].value, {
			'setup': common.value,
			'onCycle': (function (result) {
				return function(event) {
					if (event.target.aborted) return;
					result.innerText = Math.round(event.target.hz).toLocaleString() + ' ops/sec';
				};
			})(results[i]),
			'onComplete': (function (result) {
				return function(event) {
					if (event.target.aborted) return;
					result.innerText = Math.round(event.target.hz).toLocaleString() + ' ops/sec';
					result.classList.remove('running');
				};
			})(results[i])
		});
	}

	suite.run({ 'async': true });
	return stool;
}
stool.run = run;

function add(title, code) {
	var html = '<td><button class="remove" tabindex="-1">Remove</button></td><td class="inputs"><input type="text" class="title input" placeholder="Label"><textarea rows="6" class="case input" placeholder="Code"></textarea></td><td class="result"></td>'
	var s = document.getElementById('suite');
	var tr = document.createElement('tr');
	tr.innerHTML = html;
	tr.getElementsByClassName('remove')[0].onclick = (function (tr) {
		return function () {
			tr.remove();
			clear();
		};
	})(tr);

	var inputs = tr.getElementsByClassName('input');
	for (var i = 0; i < inputs.length; i++) {
		inputs[i].onkeydown = function () {
			abort();
			var shareResult = document.getElementById('share-result');
			shareResult.href = shareResult.innerText = '';
		}
	}
	if(code){
		code = stool.text(code);
		tr.getElementsByClassName('title')[0].value = title;
		tr.getElementsByClassName('case')[0].value = code;
	}
	s.appendChild(tr);

	clear();

	return code? stool : tr;
}
stool.add = add;

function setup(code){
	var common = document.getElementById('common');
	common.value = stool.text(code);
	return stool;
}
stool.setup = setup;

function share() {
	var body = {
		'public': true,
		'files': {}
	}

	var titles = document.getElementsByClassName('title');
	var cases = document.getElementsByClassName('case');
	var common = document.getElementById('common');

	for (var i = 0; i < cases.length; i++) {
		if (cases[i].value)
			body.files[titles[i].value || '__empty' + i] = {'content': cases[i].value};
	}

	if (common.value)
		body.files['__common'] = {'content': common.value};

	if (Object.keys(body.files).length == 0)
		return;

	var req = new XMLHttpRequest();
	req.open('post', 'https://api.github.com/gists', true);
	req.onload = function() {
		var result = JSON.parse(req.responseText);
		var shareResult = document.getElementById('share-result');
		var location  = window.location.toString().replace(/#.*$/, '');
		shareResult.href = shareResult.innerText = location + '#' + result.id;
	}
	req.send(JSON.stringify(body));
	return stool;
}
stool.share = share;

function parse(id) {
	if (!id && !window.location.hash.length) return false;

	id = id || window.location.hash.substring(1);
	var req = new XMLHttpRequest();
	req.open('get', 'https://api.github.com/gists/' + id, true);
	req.onload = function() {
		var result = JSON.parse(req.responseText);
		var files = result.files;
		for (var file in files) {
			if (file == '__common') {
				document.getElementById('common').value = files[file].content;
			} else {
				var tr = add();
				tr.getElementsByClassName('title')[0].value = file;
				tr.getElementsByClassName('case')[0].value = files[file].content;
			}
		}
	}
	req.send();

	var shareResult = document.getElementById('share-result');
	shareResult.href = shareResult.innerText = window.location;

	return true;
}
stool.parse = parse;

stool.text = function(code){
	if(typeof code === 'function'){
		return code.toString().slice(12).slice(0,-1);
	} else {
		return code;
	}
}

document.getElementById('add').onclick = function() {
	add();
	return false;
}
document.getElementById('run').onclick = run;
document.getElementById('abort').onclick = abort;
document.getElementById('share').onclick = share;

if (!parse()) {
	//add();
	//add();
}
window.stool = stool; // export!
}());