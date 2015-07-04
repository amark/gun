function spam(){
	spam.start = true; spam.lock = false;
	if(spam.count >= 100){ return }
	var $f = $('form');
	$('.what', $f).value = ++spam.count;
	$f.onsubmit();
	setTimeout(spam, 0);
}; spam.count = 0; spam.lock = true;

alert("ADD THIS LINE TO THE TOP OF THE MAP.VAL CALLBACK: `if(!spam.lock && !spam.start){ spam() }`");