;(function(){
	var email, fail = {send: function(opt, cb){ cb && cb("You do not have email installed.") } };
	if(!process.env.EMAIL){ return module.exports = fail }
	try{ email = require('emailjs') }catch(e){};
	if(!email){ return module.exports = fail }
	return module.exports = email.server.connect({
	  user: process.env.EMAIL,
	  password: process.env.EMAIL_KEY,
	  host: process.env.EMAIL_HOST || "smtp.gmail.com",
	  ssl: process.env.EMAIL_SSL || true
	});
}());