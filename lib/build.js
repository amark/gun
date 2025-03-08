var fs = require('fs');
var nodePath = require('path');

var dir = __dirname + '/../';

function read(path) {
  return fs.readFileSync(nodePath.join(dir, path)).toString();
}

function write(path, data) {
  return fs.writeFileSync(nodePath.join(dir, path), data);
}

// The order of modules matters due to dependencies
const seaModules = [
  'root',
  'https', 
  'base64',
  'array',
  'buffer',
  'shim',
  'settings',
  'sha256',
  'sha1',
  'work',
  'pair',
  'sign',
  'verify',
  'aeskey',
  'encrypt',
  'decrypt',
  'secret',
  'certify',
  'sea',
  'user',
  'then',
  'create',
  'auth',
  'recall',
  'share',
  'index'
];

function normalizeContent(code) {
  // Remove IIFE wrapper if present
  code = code.replace(/^\s*;?\s*\(\s*function\s*\(\s*\)\s*\{/, '');
  code = code.replace(/\}\s*\(\s*\)\s*\)?\s*;?\s*$/, '');
  
  // Split into lines and remove common indentation
  const lines = code.split('\n');
  let minIndent = Infinity;
  
  // Find minimum indentation (ignoring empty lines)
  lines.forEach(line => {
    if (line.trim().length > 0) {
      const indent = line.match(/^\s*/)[0].length;
      minIndent = Math.min(minIndent, indent);
    }
  });
  
  // Remove common indentation
  const cleanedLines = lines.map(line => {
    if (line.trim().length > 0) {
      return line.slice(minIndent);
    }
    return '';
  });
  
  return cleanedLines.join('\n').trim();
}

function buildSea(arg) {
  if (arg !== 'sea') {
    console.error('Only "sea" argument is supported');
    process.exit(1);
  }

  // Start with the USE function definition
  let output = `;(function(){

  /* UNBUILD */
  function USE(arg, req){
    return req? require(arg) : arg.slice? USE[R(arg)] : function(mod, path){
      arg(mod = {exports: {}});
      USE[R(path)] = mod.exports;
    }
    function R(p){
      return p.split('/').slice(-1).toString().replace('.js','');
    }
  }
  if(typeof module !== "undefined"){ var MODULE = module }
  /* UNBUILD */\n\n`;

  // Add each module wrapped in USE()
  seaModules.forEach(name => {
    try {
      let code = read('sea/' + name + '.js');
      
      // Clean up the code
      code = normalizeContent(code);
      
      // Replace require() with USE(), but skip any requires within UNBUILD comments
      let inUnbuild = false;
      const lines = code.split('\n').map(line => {
        if (line.includes('/* UNBUILD */')) {
          inUnbuild = !inUnbuild;
          return line;
        }
        if (!inUnbuild) {
          return line.replace(/require\(/g, 'USE(');
        }
        return line;
      });
      code = lines.join('\n');
      
      // Add module with consistent indentation
      output += `  ;USE(function(module){\n`;
      output += code.split('\n').map(line => line.length ? '    ' + line : '').join('\n');
      output += `\n  })(USE, './${name}');\n\n`;
    } catch(e) {
      console.error('Error processing ' + name + '.js:', e);
    }
  });

  // Close IIFE
  output += '}());';

  // Write output
  write('sea.js', output);
  console.log('Built sea.js');
}

if (require.main === module) {
  const arg = process.argv[2];
  buildSea(arg);
}

module.exports = buildSea;
