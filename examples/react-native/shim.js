if (typeof __dirname === 'undefined') global.__dirname = '/'
if (typeof __filename === 'undefined') global.__filename = ''

if (typeof Buffer === 'undefined') global.Buffer = require('buffer').Buffer

const isDev = typeof __DEV__ === 'boolean' && __DEV__
process.env['NODE_ENV'] = isDev ? 'development' : 'production'
if (typeof localStorage !== 'undefined') {
  localStorage.debug = isDev ? '*' : ''
}

global.location = {
  protocol: 'file:',
  host: '',
};

const { TextEncoder, TextDecoder } = require('text-encoding');

global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;