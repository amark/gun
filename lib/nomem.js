function Nomem(){
  var opt = {}, u;
  opt.put = function(file, data, cb){ cb(null, -9) }; // dev/null!
  opt.get = function(file, cb){ cb(null) };
  return opt;
}
if(typeof window !== "undefined"){
  window.Nomem = Nomem;
} else {
	try{ module.exports = Nomem }catch(e){}
}