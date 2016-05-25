(function(){
var console = window.console || {log: function(s){alert(s)}};
var stool = {}; // rewritten entirely to use jQuery.
var suite;

function abort() {
	if (!suite || (suite && !suite.running)) return;

	suite.abort();
	$('.result').each(function(){
		if($(this).is('.running')){
			$(this).text('aborted');
		}
	});
	return stool;
}
stool.abort = abort;

function clear() {
	if (suite && suite.running) abort();

	$('.results').each(function(){
		$(this).text('').removeClass('running');
	});
	return stool;
}
stool.clear = clear;

function run() {
	abort();

	var titles = $('.title');
	var cases = $('.case');
	var results = $('.result');
	var common = $('#common');

	suite = new Benchmark.Suite;
	suite.on('complete', function() {
		$('body').removeClass('running');
	});

	$('body').addClass('running');

	results.each(function(i){
		var result = $(this).addClass('running').text('queued');
		suite.add(titles[i].value, cases[i].value, {
			'setup': common.val(),
			'onError': function(a,b,c){ console.log(a.message.message) },
			'onCycle': (function (result) {
				return function(event) {
					if (event.target.aborted) return;
					result.text(Math.round(event.target.hz).toLocaleString() + ' ops/sec');
				};
			})(result),
			'onComplete': (function (result) {
				return function(event) {
					if (event.target.aborted) return;
					result.text(Math.round(event.target.hz).toLocaleString() + ' ops/sec');
					result.removeClass('running');
				};
			})(result)
		});
	});

	suite.run({ 'async': true });
	return stool;
}
stool.run = run;

//wat;
function add(title, code) {
	var html = '<td><button class="remove" tabindex="-1">Remove</button></td><td class="inputs"><input type="text" class="title input" placeholder="Label"><textarea rows="6" class="case input" placeholder="Code"></textarea></td><td class="result"></td>'
	var s = $('#suite');
	var tr = $('<tr>');
	tr.html(html);
	tr.find('.remove')[0].onclick = (function (tr) {
		return function () {
			tr.remove();
			clear();
		};
	})(tr);

	var inputs = tr.find('.input').each(function(){
		this.onkeydown = function () {
			abort();
			var shareResult = $('#share-result').text('');
			shareResult.attr('href', '');
		}
	});
	if(code){
		code = stool.text(code);
		tr.find('.title').val(title);
		tr.find('.case').val(code);
	}
	s.append(tr);

	clear();

	return code? stool : tr;
}
stool.add = add;

function setup(code){
	var common = $('#common');
	common.val(stool.text(code));
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