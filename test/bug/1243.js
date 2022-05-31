/**
 * Heroku CLI REQUIRED!
 * 
 * NOTE: Does not work with npm installed heroku-cli
 *  - Uninstall with: npm uninstall heroku -g
 *  - Install Heroku with: curl https://cli-assets.heroku.com/install.sh | sh
 * 
 * 1. Login Heroku with: heroku login
 * 2. After login you can run test
 *    like: $ mocha test/bug/1243.js 
 * 
*/

const expect = require('../expect');
const path = require('path');
const http = require("https");

const outputData = false;

function request(hostname, done){
  http.get('https://'+hostname+'/',{
    timeout: 1000 * 60 * 5
  }, (res) => {
    done(res.statusCode);
  });
}
 
function spawn(cmd, done) {

  const spawn = require('child_process').spawn;
  let args = cmd.split(" ");
  cmd = args.shift();

  const s = spawn(cmd, args);
  let stderrOUT = "";

  s.stdout.on('data', (data) => {
    saveData(data.toString());
  });

  s.stderr.on('data', (data) => {
    saveData(data.toString());
  });

  function saveData(out){
    stderrOUT += out.toString();
    if(outputData) console.log(out.toString());
  }

  s.on('exit', (code) => {
    done(stderrOUT);
  });
}
  
 function makeid(length) {
   let result = '';
   let characters = 'abcdefghijklmnopqrstuvwxyz';
   let charactersLength = characters.length;
   for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() *
      charactersLength));
   }
   return result;
 }
 
 describe('Heroku deploy', function() {
   const heroku_name = 'test-gun-' + makeid(5);
   const dir_cwd = path.join(__dirname, "../..");

  it('create herokuapp '+ heroku_name, function(done) {
    this.timeout(15 * 1000);
    let c = 'heroku create ' + heroku_name;
    spawn(c, (stdout) => {
      if (stdout.indexOf("done") > -1) {
        done();
    }
    })
  })
 
  it('add git remote', function(done) {
    this.timeout(15 * 1000);
    let c = 'heroku git:remote -a '+ heroku_name;
    spawn(c, (stdout) => {            
      if (stdout.indexOf("set git") > -1) {
          done();
      }
    })
  })
 
  it('git push heroku', function(done) {
    this.timeout(1000 * 60 * 2); // 2 min
    let c = 'git push heroku master --force';
    spawn(c, (stdout) => {
      if (stdout.indexOf("deployed to Heroku") > -1) {
        done();
      }
    })
  })  

  it('fetch heroku app https', function(done) {
    this.timeout(1000 * 60 * 5); // 2 min
    request(heroku_name+".herokuapp.com",( statusCode )=>{
      expect(statusCode).to.be(200);
      done();
    })
  })  
 
   it('destroy herokuapp ' + heroku_name, function(done) {
    this.timeout(15 * 1000);

    let c = 'heroku apps:destroy ' + heroku_name + ' --confirm=' + heroku_name;
    spawn(c, (stdout) => {
      if (stdout.indexOf("done") > -1) {
        done();
      }
    })
   })
 })