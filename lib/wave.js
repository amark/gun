var global = typeof global !== 'undefined' ? global : window;
global.edide = {};

"use strict";edide.global = (function _global (edide) {
return typeof global !== 'undefined' ? global : window;
return this;
}).call({}, edide);
"use strict";edide.editorModule = (function _editorModule (edide) {
var ref;
return typeof file !== "undefined" && file !== null ? (ref = file.modules) != null ? ref.all : void 0 : void 0;
return this;
}).call({}, edide);
"use strict";edide.logProd = (function _logProd (edide) {
return (...args) => {
  var console, ref;
  ({console} = (ref = edide.editorModule) != null ? ref : window);
  return console.log(...args);
};
return this;
}).call({}, edide);
"use strict";edide.var = (function _var (edide) {
var currentReact, debugging, dependees, dependsOn, depsRequired, inInitCall, infinityCheck, initSetter, newVar, parent, setLinks, setters, updateVar, values;
values = new Map; // //edide.keep ?
setters = new Map; // varName => setter:func
dependees = new Map; // varName => deps:
setLinks = new Map; // for reactiveGraph, show setters inside reactive/setter:s
debugging = false; //edide.editorModule?
depsRequired = new Map; // varName : dependsOn
inInitCall = false; // TODO use dependsOn? instead
dependsOn = new Set(); // remove
initSetter = (name, setter) => {
  var debugName, err, parent, ref, val;
  debugName = (ref = setter.type) != null ? ref : name;
  if ((setters.get(name)) != null) {
    throw Error(`Reactive for '${debugName}' already exists`);
  }
  setters.set(name, setter);
  if (inInitCall) {
    throw Error(`can't create reactive setter (for '${debugName}') inside reactive context`);
  }
  inInitCall = name;
  dependsOn.clear(); // TODO clear => new Set
  try {
    val = setter(); // TODO: some day add revar and unvar as params; helps with multiple reactives to keep the separated
  } catch (error) {
    err = error;
    inInitCall = false;
    err.message = `Reactive initialization of '${debugName}' failed: ${err.message}`;
    throw err;
  }
  parent = null;
  dependsOn.forEach((depName) => {
    var deps;
    if ((deps = dependees.get(depName)) == null) {
      dependees.set(depName, deps = new Set);
    }
    return deps.add(name);
  });
  inInitCall = false;
  return val;
};
infinityCheck = new Set; //edide.keep
parent = null;
updateVar = function(name, val) {
  var ref, ref1, type;
  if (arguments.length === 1) {
    val = setters.get(name)();
    if (debugging && (type = setters.get(name).type)) {
      edide.logProd(`running ${(setters.get(name).type)}`);
    }
  }
  if (typeof name !== 'string') { // symbol ~ react function
    return;
  }
  if (values.get(name) === val) { // can't reset same value
    return;
  }
  if (infinityCheck.has(name)) {
    infinityCheck.forEach((k) => {
      return edide.logProd(k);
    });
    edide.logProd(name);
    if ((ref = edide.editorModule) != null) {
      if (typeof ref.reactiveGraph === "function") {
        ref.reactiveGraph();
      }
    }
    throw Error("Inifinite loop in \:var dependencies");
  }
  if (debugging) {
    edide.logProd(`updating ${name}`);
  }
  values.set(name, val);
  if (!inInitCall) {
    infinityCheck.add(name);
    if ((ref1 = dependees.get(name)) != null) {
      ref1.forEach((depName) => {
        return updateVar(depName);
      });
    }
    infinityCheck.delete(name);
  }
  return val;
};
currentReact = [];
newVar = function(name, setter) {
  var context, contextSet, err;
  if (arguments.length === 1) {
    if (typeof name === 'string') {
      if (inInitCall) {
        dependsOn.add(name);
      }
      return values.get(name);
    } else {
      setter = name;
      name = Symbol();
      values.set(name, name); // for debugging (showing react/dom funcs in graph)
    }
  }
  if (currentReact.length) { // and debugging
    context = currentReact[currentReact.length - 1];
    if (!(contextSet = setLinks.get(context))) {
      setLinks.set(context, contextSet = new Set);
    }
    contextSet.add(name);
  }
  currentReact.push(name);
  if (typeof setter === 'function') {
    setter = initSetter(name, setter); // setter becomes value
  }
  if (typeof name === 'string') {
    try {
      updateVar(name, setter);
    } catch (error) {
      err = error;
      infinityCheck.clear();
      throw err;
    }
  }
  currentReact.pop();
  return setter;
};
Object.assign(newVar, {dependees, values, setters, setLinks});
return newVar;
return this;
}).call({}, edide);
"use strict";edide.strRandom = (function _strRandom (edide) {
return (limit = 20) => {
  return (Math.random() + '').slice(2, +(limit + 1) + 1 || 9e9);
};
return this;
}).call({}, edide);
"use strict";edide.reactive = (function _reactive (edide) {
return (initialVars = {}) => {
  var handler, id, key, react, revar, todoMap, unvar, val;
  id = edide.strRandom();
  handler = {
    get: (map, prop) => {
      var ref;
      if ((ref = edide.editorModule) != null ? ref.editor_inspector.inspectingNow : void 0) {
        console.log('IN inspector? Find out is it possible to end up here form inside setter');
        return edide.var.values.get(`${id}.${prop}`);
      }
      return edide.var(`${id}.${prop}`);
    },
    set: (map, prop, value) => {
      edide.var(`${id}.${prop}`, value);
      return true; // Proxy set must return true if set is successfull; In the future use Reflect.set, which returns true automatically?
    }
  };
  revar = new Proxy((todoMap = new Map), handler); // NOTE: map is not used yet
  unvar = new Proxy(todoMap, {
    get: (map, prop) => {
      return edide.var.values.get(`${id}.${prop}`);
    },
    set: (map, prop, value) => {
      return edide.var.values.set(`${id}.${prop}`, value);
    }
  });
  for (key in initialVars) {
    val = initialVars[key];
    revar[key] = val;
  }
  react = (nameOrFunc, func) => {
    if (func != null) {
      func.type = nameOrFunc;
    } else {
      func = nameOrFunc;
      func.type = 'react'; // for debugging
    }
    return edide.var(func);
  };
  return {
    react,
    revar,
    unvar,
    un: unvar,
    re: revar // , dom
  };
};
return this;
}).call({}, edide);
"use strict";edide.mmState = (function _mmState (edide) {Object.defineProperty(this, 'module_name', {value:'mmState'});
this.defaults = {
  playing: false,
  recorderOn: false,
  sheet: '',
  diffText: '',
  note: null, // currently playing note
  bpm: 400, // -> beatDelay
  blur: 0,
  itch: 0,
  instrument: 'guitar-electric',
  scale: 'pentatonicMinor',
  highlight: null,
  keyboardInd: 0 // TODO --> keyboard
};
this.react = null;
this.init = (startingProps = {}) => {
  if (this.react != null) {
    return this;
  }
  ({react: this.react, revar: this.revar, unvar: this.unvar} = edide.reactive(Object.assign({}, this.defaults, startingProps)));
  return this;
};
return this;
}).call({}, edide);
"use strict";edide.mmEffects = (function _mmEffects (edide) {Object.defineProperty(this, 'module_name', {value:'mmEffects'});
({revar: this.revar} = edide.mmState.init());
this.maxLowpass = 10000;
this.maxDistortion = 3;
this.revar.lowpass = () => {
  var blur;
  ({blur} = this.revar);
  return this.maxLowpass - blur * (this.maxLowpass - 200);
};
this.revar.distortion = () => {
  var itch;
  ({itch} = this.revar);
  return this.maxDistortion * itch;
};
return this;
}).call({}, edide);
"use strict";edide.musicScales = (function _musicScales (edide) {Object.defineProperty(this, 'module_name', {value:'musicScales'});
this.full = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
this.scaleSteps = {
  pentatonicMinor: [
    0,
    3,
    2,
    2,
    3 // hidden 2
  ],
  naturalMajor: [
    0,
    2,
    2,
    1,
    2,
    2,
    2 // hidden to beginning: 1
  ],
  naturalMinor: [
    0,
    2,
    1,
    2,
    2,
    1,
    2 // hidden to beginning: 2
  ]
};
this.triadSteps = {
  major: [
    0,
    4,
    3 // positive valence
  ],
  minor: [0, 3, 4]
};
this.triadCombinations = {
  protagonism: 'M2M',
  outerSpace: 'M6M',
  fantastical: 'M8M',
  sadness: 'M4m',
  romantic: 'M5m', // and middle eastern
  wonder: 'm5M', // and trancendence
  mystery: 'm2M', // and dark comedy
  dramatic: 'm11M',
  antagonismDanger: 'm6m', // less character based
  antagonismEvil: 'm8m' // cahracter based
};
return this;
}).call({}, edide);
"use strict";edide.noteFreq = (function _noteFreq (edide) {Object.defineProperty(this, 'module_name', {value:'noteFreq'});
var a4;
this.notes = [['C0', 16.35, 2109.89], ['C#0', 17.32, 1991.47], ['D0', 18.35, 1879.69], ['D#0', 19.45, 1774.20], ['E0', 20.60, 1674.62], ['F0', 21.83, 1580.63], ['F#0', 23.12, 1491.91], ['G0', 24.50, 1408.18], ['G#0', 25.96, 1329.14], ['A0', 27.50, 1254.55], ['A#0', 29.14, 1184.13], ['B0', 30.87, 1117.67], ['C1', 32.70, 1054.94], ['C#1', 34.65, 995.73], ['D1', 36.71, 939.85], ['D#1', 38.89, 887.10], ['E1', 41.20, 837.31], ['F1', 43.65, 790.31], ['F#1', 46.25, 745.96], ['G1', 49.00, 704.09], ['G#1', 51.91, 664.57], ['A1', 55.00, 627.27], ['A#1', 58.27, 592.07], ['B1', 61.74, 558.84], ['C2', 65.41, 527.47], ['C#2', 69.30, 497.87], ['D2', 73.42, 469.92], ['D#2', 77.78, 443.55], ['E2', 82.41, 418.65], ['F2', 87.31, 395.16], ['F#2', 92.50, 372.98], ['G2', 98.00, 352.04], ['G#2', 103.83, 332.29], ['A2', 110.00, 313.64], ['A#2', 116.54, 296.03], ['B2', 123.47, 279.42], ['C3', 130.81, 263.74], ['C#3', 138.59, 248.93], ['D3', 146.83, 234.96], ['D#3', 155.56, 221.77], ['E3', 164.81, 209.33], ['F3', 174.61, 197.58], ['F#3', 185.00, 186.49], ['G3', 196.00, 176.02], ['G#3', 207.65, 166.14], ['A3', 220.00, 156.82], ['A#3', 233.08, 148.02], ['B3', 246.94, 139.71], ['C4', 261.63, 131.87], ['C#4', 277.18, 124.47], ['D4', 293.66, 117.48], ['D#4', 311.13, 110.89], ['E4', 329.63, 104.66], ['F4', 349.23, 98.79], ['F#4', 369.99, 93.24], ['G4', 392.00, 88.01], ['G#4', 415.30, 83.07], ['A4', 440.00, 78.41], ['A#4', 466.16, 74.01], ['B4', 493.88, 69.85], ['C5', 523.25, 65.93], ['C#5', 554.37, 62.23], ['D5', 587.33, 58.74], ['D#5', 622.25, 55.44], ['E5', 659.25, 52.33], ['F5', 698.46, 49.39], ['F#5', 739.99, 46.62], ['G5', 783.99, 44.01], ['G#5', 830.61, 41.54], ['A5', 880.00, 39.20], ['A#5', 932.33, 37.00], ['B5', 987.77, 34.93], ['C6', 1046.50, 32.97], ['C#6', 1108.73, 31.12], ['D6', 1174.66, 29.37], ['D#6', 1244.51, 27.72], ['E6', 1318.51, 26.17], ['F6', 1396.91, 24.70], ['F#6', 1479.98, 23.31], ['G6', 1567.98, 22.00], ['G#6', 1661.22, 20.77], ['A6', 1760.00, 19.60], ['A#6', 1864.66, 18.50], ['B6', 1975.53, 17.46], ['C7', 2093.00, 16.48], ['C#7', 2217.46, 15.56], ['D7', 2349.32, 14.69], ['D#7', 2489.02, 13.86], ['E7', 2637.02, 13.08], ['F7', 2793.83, 12.35], ['F#7', 2959.96, 11.66], ['G7', 3135.96, 11.00], ['G#7', 3322.44, 10.38], ['A7', 3520.00, 9.80], ['A#7', 3729.31, 9.25], ['B7', 3951.07, 8.73], ['C8', 4186.01, 8.24], ['C#8', 4434.92, 7.78], ['D8', 4698.63, 7.34], ['D#8', 4978.03, 6.93], ['E8', 5274.04, 6.54], ['F8', 5587.65, 6.17], ['F#8', 5919.91, 5.83], ['G8', 6271.93, 5.50], ['G#8', 6644.88, 5.19], ['A8', 7040.00, 4.90], ['A#8', 7458.62, 4.63], ['B8', 7902.13, 4.37]];
this.findNote = (name) => {
  var ind;
  ind = this.notes.findIndex((arr) => {
    return arr[0] === name;
  });
  if (ind === -1) {
    return edide.logProd(`can't find: ${name}`);
  }
  return [ind, name, this.notes[ind][1]];
};
a4 = this.findNote('A4');
this.diffToA4 = (name) => {
  var note;
  note = this.findNote(name);
  return note[0] - a4[0];
};
this.diff = (n1, n2) => {
  return this.findNote(n2)[0] - this.findNote(n1)[0];
};
return this;
}).call({}, edide);
"use strict";edide.mathOp = (function _mathOp (edide) {Object.defineProperty(this, 'module_name', {value:'mathOp'});
this.sum = function(a, b) {
  return a + b;
};
this.multiply = function(a, b) {
  return a * b;
};
return this;
}).call({}, edide);
"use strict";edide.mmKeyboard = (function _mmKeyboard (edide) {Object.defineProperty(this, 'module_name', {value:'mmKeyboard'});
var A, a, char, chari, i, j, len, len1, noncaps, qwertyChar, qwertyRows, revar, row, rowi, space, unvar;
({revar, unvar} = edide.mmState.init());
revar.scaleSteps = () => {
  return edide.musicScales.scaleSteps[revar.scale];
};
this.special = {
  rest: '.',
  long: '=',
  comment: '#',
  var: ':',
  confStart: '{',
  confEnd: '}'
};
this.specialKeyCodes = new Set(Object.values(this.special).map((s) => {
  return s.charCodeAt(0);
}));
this.specialChars = new Set(Object.values(this.special));
this.isPauseKey = (keyCode) => {
  return this.specialKeyCodes.has(keyCode);
};
this.isSpecialChar = (char) => {
  return this.specialChars.has(char);
};
this.isPauseChar = this.isSpecialChar; // not really...
this.keyboards = ['qwerty', 'abc'];
a = 'a'.charCodeAt(0);
A = 'A'.charCodeAt(0);
space = ' '.charCodeAt(0);
this.isCaps = (key) => {
  return A <= key && key < a;
};
this.capsDiff = a - A;
noncaps = (key) => {
  if (this.isCaps(key)) {
    return key + this.capsDiff;
  } else {
    return key;
  }
};
this.getNoteInd = (key) => {
  var maxInstrumentNoteInd, noteBaseInd, noteInd, notes, startNote, step;
  ({startNote, notes, step} = revar.instrumentConf);
  noteBaseInd = edide.noteFreq.findNote(startNote)[0];
  noteInd = this[this.keyboards[revar.keyboardInd]](noncaps(key), noteBaseInd);
  maxInstrumentNoteInd = noteBaseInd + notes * step;
  while (noteInd > maxInstrumentNoteInd) {
    noteInd -= 2 * 12;
  }
  return noteInd;
};
this.abc = (key, baseInd) => {
  var fromLowest, noteInd, stepsFromClosestOctave;
  fromLowest = key - a;
  stepsFromClosestOctave = fromLowest % revar.scaleSteps.length;
  noteInd = 0;
  noteInd += revar.scaleSteps.slice(0, +stepsFromClosestOctave + 1 || 9e9).reduce(edide.mathOp.sum);
  noteInd += 12 * Math.floor(fromLowest / revar.scaleSteps.length);
  return baseInd + noteInd;
};
qwertyRows = ['1234567890', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
qwertyChar = {};
for (rowi = i = 0, len = qwertyRows.length; i < len; rowi = ++i) {
  row = qwertyRows[rowi];
  for (chari = j = 0, len1 = row.length; j < len1; chari = ++j) {
    char = row[chari];
    qwertyChar[char.charCodeAt(0)] = [rowi, chari];
  }
}
this.qwerty = (key, baseInd) => {
  var charSteps, halfSteps, noteInd, octave, rowchar;
  if (!(rowchar = qwertyChar[key])) {
    return;
  }
  [row, char] = rowchar;
  octave = qwertyRows.length - 1 - row + Math.floor(char / unvar.scaleSteps.length);
  char = char % revar.scaleSteps.length;
  charSteps = revar.scaleSteps.slice(0, +char + 1 || 9e9).reduce((a, b) => {
    return a + b;
  });
  halfSteps = 12 * octave + charSteps;
  return noteInd = baseInd + halfSteps;
};
return this;
}).call({}, edide);
"use strict";edide.mmNote = (function _mmNote (edide) {Object.defineProperty(this, 'module_name', {value:'mmNote'});
this.fromChar = (char) => {
  return this.fromKeyCode(char.charCodeAt(0));
};
this.fromKeyCode = (key) => {
  var noteInd, ref;
  if (typeof (noteInd = edide.mmKeyboard.getNoteInd(key)) === 'number') {
    return (ref = edide.noteFreq.notes[noteInd]) != null ? ref[0] : void 0;
  }
};
return this;
}).call({}, edide);
"use strict";edide.clone = (function _clone (edide) {
return function(...objects) {
  if (Array.isArray(objects[0])) {
    return Object.assign([], ...objects);
  } else {
    return Object.assign({}, ...objects);
  }
};
return this;
}).call({}, edide);
"use strict";edide.strParsesToNumber = (function _strParsesToNumber (edide) {
return (str) => {
  return !Number.isNaN(parseInt(str));
};
return this;
}).call({}, edide);
"use strict";edide.mmConfigs = (function _mmConfigs (edide) {Object.defineProperty(this, 'module_name', {value:'mmConfigs'});
var defaultVars, mutatingProp, mutatingVars, vars;
vars = {}; // varName: config object
mutatingVars = {};
this.hasVar = (varName) => {
  var ref;
  return !!((ref = vars[varName]) != null ? ref : mutatingVars[varName]);
};
this.activateVar = (name, value) => {
  var configs;
  if (value != null) {
    configs = edide.clone(mutatingVars[name]);
    if (edide.strParsesToNumber(value)) {
      value = parseFloat(value);
    }
    configs[mutatingProp(configs)] = value;
    return this.activate(configs);
  } else {
    return this.activate(vars[name]);
  }
};
mutatingProp = (configs) => {
  var name, val;
  for (name in configs) {
    val = configs[name];
    if (val === '*') {
      return name;
    }
  }
  return false;
};
this.activate = (conf) => {
  if (conf.name != null) {
    return; // throw warning?
  }
  return Object.assign(edide.mmState.revar, conf);
};
this.addVar = (varName, config) => { // , activate=true
  if (mutatingProp(config)) {
    return mutatingVars[varName] = config;
  } else {
    return vars[varName] = config;
  }
};
defaultVars = {
  bass: {
    "instrument": "bass-electric"
  },
  cello: {
    "instrument": "cello"
  },
  guitar: {
    "instrument": "guitar-acoustic"
  },
  eguitar: {
    "instrument": "guitar-electric"
  },
  piano: {
    "instrument": "piano"
  },
  synth: {
    "instrument": "synth-simple"
  },
  xylophone: {
    "instrument": "xylophone"
  },
  pentatonic: {
    "scale": "pentatonicMinor"
  },
  major: {
    "scale": "naturalMajor"
  },
  minor: {
    "scale": "naturalMinor"
  }
};
this.init = () => {
  var conf, name, results;
  vars = {};
  results = [];
  for (name in defaultVars) {
    conf = defaultVars[name];
    results.push(this.addVar(name, conf, false));
  }
  return results;
};
this.init();
return this;
}).call({}, edide);
"use strict";edide.inEditor = (function _inEditor (edide) {
return typeof window === 'object' &&
       typeof window.serverModule === 'object'
return this;
}).call({}, edide);
"use strict";edide.edideNamespace = (function _edideNamespace (edide) {
return 'edide'
return this;
}).call({}, edide);
"use strict";edide.showError = (function _showError (edide) {
var showError;
showError = (err) => {
  if (edide.inEditor) {
    return edide.editorModule.editor_error.show(err);
  } else if (typeof edide.global.require === 'object' && (edide.global[edide.edideNamespace].prodErrorPrinter != null)) {
    return edide.global[edide.edideNamespace].prodErrorPrinter.showError(err);
  } else {
    return console.error(err);
  }
};
return (err) => {
  var error;
  if (err != null ? err.stack : void 0) {
    return showError(err); // create error to capture stack trace
  } else {
    try {
      throw Error(err);
    } catch (error1) {
      error = error1;
      return showError(error);
    }
  }
};
return this;
}).call({}, edide);
"use strict";edide.mmParserSpecial = (function _mmParserSpecial (edide) {Object.defineProperty(this, 'module_name', {value:'mmParserSpecial'});
this.config = (trackStr, ts = {}) => {
  var endInd, err, name;
  endInd = trackStr.search('}') || trackStr.length;
  try {
    ts.conf = JSON.parse(trackStr.slice(0, +endInd + 1 || 9e9));
    if (ts.conf.name != null) {
      ({name} = ts.conf);
      delete ts.conf.name;
      edide.mmConfigs.addVar(name, ts.conf);
    } else {
      edide.mmConfigs.activate(ts.conf); // add variable if exists
    }
  } catch (error) {
    err = error;
    ts.skip = true; // could be used to show error highlighting in editor
    edide.showError(err); // remove this if error highlighting implemented
  }
  return endInd;
};
this.var = (track, trackState) => {
  var i, value, varLength, varName, varStr;
  ({i} = trackState);
  varLength = track.slice(i + 1).indexOf(edide.mmKeyboard.special.var);
  if (varLength === -1) {
    return false;
  }
  varStr = track.slice(i + 1, +(i + varLength) + 1 || 9e9);
  [varName, value] = varStr.split(' ');
  if (!edide.mmConfigs.hasVar(varName)) {
    return false;
  }
  edide.mmConfigs.activateVar(varName, value);
  trackState.i += varLength + 2;
  return true;
};
return this;
}).call({}, edide);
"use strict";edide.onUnload = (function _onUnload (edide) {
var ref, ref1;
return (ref = (ref1 = edide.editorModule) != null ? ref1.unload.add : void 0) != null ? ref : () => {};
return this;
}).call({}, edide);
"use strict";edide.mmPipe = (function _mmPipe (edide) {Object.defineProperty(this, 'module_name', {value:'mmPipe'});
var dist, lowpass, react, revar, reverber, unvar;
({revar, unvar, react} = edide.mmState.init());
dist = lowpass = reverber = null;
this.initPipe = () => {
  lowpass = new Tone.Filter(unvar.lowpass, 'lowpass', -12);
  dist = new Tone.Distortion(unvar.distortion);
  this.output = lowpass;
  lowpass.toMaster();
  dist.connect(lowpass);
  revar.pipeReady = true;
  return edide.onUnload(() => {
    if (dist != null) {
      if (typeof dist.dipose === "function") {
        dist.dipose();
      }
    }
    return lowpass != null ? typeof lowpass.dispose === "function" ? lowpass.dispose() : void 0 : void 0;
  });
};
this.initInstrument = (instrument) => {
  instrument.connect(dist);
  edide.onUnload(() => {
    return instrument != null ? instrument.disconnect() : void 0;
  });
  return instrument;
};
react('pipe distortion', () => {
  var ref;
  revar.distortion;
  revar.lowpass;
  if (dist != null) {
    dist.distortion = revar.distortion;
  }
  return lowpass != null ? (ref = lowpass.frequency) != null ? ref.linearRampTo(revar.lowpass, 0) : void 0 : void 0;
});
return this;
}).call({}, edide);
"use strict";edide.moduleGate = (function _moduleGate (edide) {Object.defineProperty(this, 'module_name', {value:'moduleGate'});
if (!edide.inEditor) {
  return this;
}
this.all = typeof serverModule !== "undefined" && serverModule !== null ? serverModule.modules.all : void 0; // why not just use \:modules.all ?
this.root; // module that is edited in root
this.rootName;
this.active; // module that is currently being edited (can be root or in window)
this.activeName;
this.executing;
this.executingName;
return this;
}).call({}, edide);
"use strict";edide.rejectIfRecompiled = (function _rejectIfRecompiled (edide) {
if (!edide.inEditor) {
  return;
}
return (promise) => {
  var recompiled, rootModuleFunc, rootName;
  ({rootName} = edide.moduleGate);
  recompiled = false;
  edide.editorModule.editor_events.on('before_recompile', () => {
    return recompiled = true;
  });
  rootModuleFunc = edide.editorModule.modules.moduleFunc[rootName];
  return promise.then(function(arg) {
    if (recompiled || rootName !== edide.moduleGate.rootName) { // root module changed
      return Promise.reject(); // quiet rejection; no need to show error
    } else {
      return arg; // arg get wrapped in promise
    }
  });
};
return this;
}).call({}, edide);
"use strict";edide.promise = (function _promise (edide) {Object.defineProperty(this, 'module_name', {value:'promise'});
this.new = function(cb) {
  if (edide.inEditor) {
    return edide.rejectIfRecompiled(new Promise(cb)); // don't fire cb if code has been re-executed in the meantime
  } else {
    return new Promise(cb); //, edide.editorModule?.editor_error.show
  }
};
this.all = function(cbArray) {
  if (edide.inEditor) { // check that after resolved, still editing same module
    return edide.rejectIfRecompiled(Promise.all(cbArray));
  } else {
    return Promise.all(cbArray);
  }
};
this.resolve = Promise.resolve.bind(Promise);
this.reject = Promise.reject.bind(Promise);
return this;
}).call({}, edide);
"use strict";edide.qs = (function _qs (edide) {
return (selector) => {
  return document.querySelector(selector);
};
return this;
}).call({}, edide);
"use strict";edide.scriptContainer = (function _scriptContainer (edide) {
var createContainer, ref;
createContainer = () => {
  var s;
  s = document.createElement('div');
  s.id = 'scripts';
  return s;
};
return (ref = edide.qs('#scripts')) != null ? ref : document.body.appendChild(createContainer());
return this;
}).call({}, edide);
"use strict";edide.requireScript = (function _requireScript (edide) {
var base;
if ((base = edide.global).requireScriptPromises == null) {
  base.requireScriptPromises = new Map;
}
return (scriptSrc) => {
  var promise;
  if (promise = requireScriptPromises.get(scriptSrc)) {
    return promise;
  } else {
    requireScriptPromises.set(scriptSrc, promise = edide.promise.new((resolve) => {
      var el;
      console.log('adding promised', scriptSrc);
      el = document.createElement('script');
      edide.scriptContainer.appendChild(el);
      el.onload = resolve; //load_ready
      el.type = 'application/javascript';
      return el.src = scriptSrc;
    }));
    return promise.catch((err) => {
      edide.showError(err);
      return requireScriptPromises.delete(scriptSrc);
    });
  }
};
return this;
}).call({}, edide);
"use strict";edide.set = (function _set (edide) {
return (...args) => new Set(args)
return this;
}).call({}, edide);
"use strict";edide.membrameSynth = (function _membrameSynth (edide) {Object.defineProperty(this, 'module_name', {value:'membrameSynth'});
this.startNote = 'A0';
this.init = () => {
  var bd, compressor, distortion, gain, reverb;
  distortion = new Tone.Distortion({
    distortion: 0.1,
    oversample: "4x" // none, 2x, 4x
  });
  reverb = new Tone.Freeverb(0.75, 1000);
  gain = new Tone.Gain(0.5);
  compressor = new Tone.Compressor({
    ratio: 12,
    threshold: -24,
    release: 0.05,
    attack: 0.003,
    knee: 1
  });
  bd = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 4,
    envelope: {
      attack: 0.01,
      decay: 0.74,
      sustain: 0.71,
      release: 0.05,
      attackCurve: "exponential"
    }
  });
  bd.chain(gain, distortion, reverb, compressor);
  return [bd, compressor];
};
return this;
}).call({}, edide);
"use strict";edide.toneSynth = (function _toneSynth (edide) {Object.defineProperty(this, 'module_name', {value:'toneSynth'});
this.startNote = 'C3';
this.init = () => {
  var ss;
  return ss = new Tone.PolySynth(12, Tone.Synth, {
    oscillator: {
      type: 'sine'
    },
    envelope: {
      attack: 0.005,
      decay: 0.1,
      sustain: 0.3,
      release: 1
    }
  });
};
return this;
}).call({}, edide);
"use strict";edide.instrumentConfigs = (function _instrumentConfigs (edide) {Object.defineProperty(this, 'module_name', {value:'instrumentConfigs'});
var defaultUrl = 'https://nbrosowsky.github.io/tonejs-instruments/samples/'
var { revar, unvar, react } = edide.mmState
var defaultInstrument = 'electric-guitar'
this.initInstrument = async (resolve) => {
  await edide.requireScript('https://cdnjs.cloudflare.com/ajax/libs/tone/13.8.9/Tone.js')
  edide.mmPipe.initPipe()
}
this.createNew = () => {
  var {name} = unvar.instrumentConf
  var instrument, endOfPipe
  var instrumentConf = this.instruments[name]
  if (instrumentConf.module_name) {
    var res = instrumentConf.init()
    if (Array.isArray(res)) {
      instrument = res[0]
      endOfPipe = res[1]
    } else {
      instrument = endOfPipe = res
    }
  } else {
    var noteFiles = buildNotes(instrumentConf)
    var inst = new Tone.Sampler(noteFiles, { //edide.instrumentConfigssAll[name]
      "release" : 1,
      "baseUrl" : instrumentConf.url || defaultUrl + name + '/'
    })
    inst.soundFontInstrument = true
    instrument = endOfPipe = inst //[inst, inst]
  }
  edide.mmPipe.initInstrument(endOfPipe)
  return instrument
}
this.isReady = () => {
  var { current } = this
  return current && (typeof current.loaded == 'undefined' || current.loaded === true)
}
function buildNotes({startNote, notes, step, skipNotes}) {
  var [startInd] = edide.noteFreq.findNote(startNote)
  var noteFiles = {}
  if (Array.isArray(notes)) {
    notes.forEach(note => {
      noteFiles[note] = note.replace('#','s') + '.[mp3|ogg]'
    })
  } else {
    for (let i=0; i < notes*step; i+=step) {
      let note = edide.noteFreq.notes[startInd + i][0];
      if (skipNotes && skipNotes.has(note))
        continue
      noteFiles[note] = note.replace('#','s') + '.[mp3|ogg]'
    }
  }
  return noteFiles
}
this.instruments = {
  'bass-electric': {
    startNote: 'C#2',
    notes: 8, // 16
    step: 3
  },
  'cello': {
    startNote: 'C2',
    notes: 11,
    step: 2,
    skipNotes: edide.set('F#2', 'C4')
  },
  'drum-electric': edide.membrameSynth,
  'guitar-acoustic': {
    startNote:  'D1',
    notes: 26, // 36
    step: 2,
    skipNotes: edide.set('E4', 'F#4', 'G#4', 'A#4', 'C5', 'D5', 'E5')
  },           // umm, would be simpler to just add all notes
  'guitar-electric': {
    startNote: 'F#2',
    notes: 15, // 15
    step: 3,
  },
  'piano': {
    startNote: 'A1',
    notes: 30, // 29
    step: 2,
    volume: -6, // TODO implement this
    baseUrl: "https://tonejs.github.io/examples/audio/salamander/"
  },
  'synth-simple': edide.toneSynth,
  'xylophone': {
    startNote: 'G3',
    notes: ['G3', 'C4', 'G4', 'C5', 'G5', 'C6', 'G6', 'C7']
  }
}
for (let inst in this.instruments) {
  this.instruments[inst].name = inst
}
this.instrumentList = Object.values(this.instruments)
react('active instrument config', () => {
  revar.instrumentConf = this.instruments[revar.instrument]  // this.instrumentList[revar.instrumentInd]
})
return this;
}).call({}, edide);
"use strict";edide.cloneSibling = (function _cloneSibling (edide) {
return (srcObj) => {
  var o;
  o = Object.create(Object.getPrototypeOf(srcObj));
  Object.assign(o, srcObj);
  return o;
};
return this;
}).call({}, edide);
"use strict";edide.times = (function _times (edide) {
return (timesNum, action) => {
  while (timesNum-- > 0) {
    action(timesNum + 1);
  }
};
return this;
}).call({}, edide);
"use strict";edide.setTimeout = (function _setTimeout (edide) {
return function(arg1, arg2) {
  var fun, id, num;
  [fun, num] = typeof arg2 === 'function' ? [arg2, arg1] : [arg1, arg2];
  id = setTimeout(fun, num);
  edide.onUnload(() => {
    return clearTimeout(id);
  });
  return id;
};
return this;
}).call({}, edide);
"use strict";edide.sleep = (function _sleep (edide) {
var sleep;
sleep = (ms) => {
  var resolve, timeout;
  timeout = resolve = null;
  return edide.promise.new((res) => {
    resolve = res;
    return timeout = edide.setTimeout(ms, res);
  });
};
return sleep;
return this;
}).call({}, edide);
"use strict";edide.mmInstrument = (function _mmInstrument (edide) {Object.defineProperty(this, 'module_name', {value:'mmInstrument'});
var cloneOrCreateInstrument, getInstruments, instruments, play, react, revar, unvar, updateVolAndTune;
instruments = {}; // name: [instrument instances...]
({unvar, revar, react} = edide.mmState);
react('delay from bmp', () => {
  return revar.beatDelay = (1 / revar.bpm) * 60 * 1000;
});
react(() => {});
updateVolAndTune = (inst) => {
  var detune, volume;
  ({volume, detune} = unvar);
  if ((detune != null) && (inst.detune != null)) {
    inst.set("detune", detune);
  }
  if ((volume != null) && (inst.volume != null)) {
    return inst.set("volume", volume);
  }
};
react(() => {
  var inst, insts, j, len, name;
  revar.volume;
  revar.detune;
  for (name in instruments) {
    insts = instruments[name];
    for (j = 0, len = insts.length; j < len; j++) {
      inst = insts[j];
      updateVolAndTune(inst);
    }
  }
});
react('create first instrument', () => {
  var name, ref;
  if (!(name = (ref = revar.instrumentConf) != null ? ref.name : void 0)) { // e.g. illegal instrument name
    return edide.showError(`Unknown instrument: ${unvar.instrument}`);
  }
  if (revar.pipeReady && !instruments[name]) {
    'create initial instrument';
    return instruments[name] = [edide.instrumentConfigs.createNew()];
  }
});
cloneOrCreateInstrument = (name) => {
  var inst;
  inst = instruments[name][0].soundFontInstrument ? (inst = edide.cloneSibling(instruments[name][0]), inst.isPlaying = false, inst) : edide.instrumentConfigs.createNew();
  updateVolAndTune(inst);
  return inst;
};
getInstruments = (n) => {
  var all, free, name;
  ({name} = unvar.instrumentConf);
  all = instruments[name];
  free = all.filter((i) => {
    return !i.isPlaying;
  });
  edide.times(n - free.length, () => {
    var inst;
    free.push(inst = cloneOrCreateInstrument(name));
    return all.push(inst);
  });
  return free.slice(0, n);
};
this.playChord = (chord, noteLength = 1) => {};
this.playNote = (chord, noteLength = 1) => {
  var ind, inst, insts, j, len, ref;
  if (!Array.isArray(chord)) {
    chord = [chord];
  }
  ref = insts = getInstruments(chord.length);
  for (ind = j = 0, len = ref.length; j < len; ind = ++j) {
    inst = ref[ind];
    play(inst, chord[ind], noteLength);
  }
};
play = async(instrument, note, length) => {
  var err;
  instrument.isPlaying = note; // true
  try {
    instrument.triggerAttackRelease(note, (length * unvar.beatDelay) / 1000);
  } catch (error) {
    err = error;
    err.message = `Error in playing note ${note}, '${unvar.instrumentConf.name}' probably not loaded yet`;
    edide.showError(err);
  }
  revar.note = note;
  await edide.sleep(unvar.nextDelay);
  return instrument.isPlaying = false;
};
return this;
}).call({}, edide);
"use strict";edide.mmParser = (function _mmParser (edide) {Object.defineProperty(this, 'module_name', {value:'mmParser'});
var getNoteLength, processTrack, react, revar, unvar;
({revar, unvar, react} = edide.mmState);
getNoteLength = (row, noteInd) => {
  var char, length;
  length = 1;
  while (char = row[++noteInd]) {
    if (char === edide.mmKeyboard.special.long) {
      length++;
    } else {
      break;
    }
  }
  return length;
};
processTrack = (track, ccs, ts) => {
  var chord, keyCode, note;
  if (!track[ts.i]) {
    return;
  }
  if (ts.skip) { // comment or erroneous chars
    return;
  }
  switch (track[ts.i]) {
    case '{':
      return ts.i += edide.mmParserSpecial.config(track.slice(ts.i), ts); //  parseConfigs
    case '[':
      ccs.chord = [];
      ts.i++;
      return processTrack(track, ccs, ts);
    case ']':
      ({chord} = ccs);
      ccs.chord = null;
      ts.i++;
      if (chord.length) {
        edide.mmInstrument.playNote(chord, getNoteLength(track, ts.i));
        ccs.played = true;
      } else {
        processTrack(track, ccs, ts);
      }
      return;
    case edide.mmKeyboard.special.var:
      if (edide.mmParserSpecial.var(track, ts)) {
        processTrack(track, ccs, ts); // recursive, since next char could be another var, e.g. \:bass::minor:
      } else {
        ts.skip = true; // parse error
      }
      return;
    case edide.mmKeyboard.special.comment:
      return ts.skip = true;
  }
  if (!(keyCode = track.charCodeAt(ts.i))) {
    return;
  }
  ts.i++;
  if (note = edide.mmNote.fromKeyCode(keyCode)) {
    if (ccs.chord) {
      ccs.chord.push(note);
      processTrack(track, ccs, ts);
    } else {
      edide.mmInstrument.playNote(note, getNoteLength(track, ts.i));
      ccs.played = true;
    }
  } else if (edide.mmKeyboard.isPauseKey(keyCode)) {
    ccs.played = true; // "play silence"
  } else {
    processTrack(track, ccs, ts);
  }
};
this.splitSections = (str) => {
  var i, j, prevInd, ref, row, section, sections;
  str = str.replace('&\n', ''); // TODO fix row tracking with &\n
  sections = [];
  section = null;
  row = 0;
  prevInd = 0;
  for (i = j = 0, ref = str.length; (0 <= ref ? j <= ref : j >= ref); i = 0 <= ref ? ++j : --j) {
    if (!(str[i] === '\n' || i === str.length)) {
      continue;
    }
    if (str[i - 1] === '\n') {
      if (section != null) {
        sections.push(section);
      }
      section = null;
    }
    if (i > prevInd) {
      if (section == null) {
        section = {
          row: row,
          tracks: []
        };
      }
      section.tracks.push(str.slice(prevInd, i));
    }
    row++;
    prevInd = i + 1;
  }
  if (section != null) {
    sections.push(section);
  }
  sections.row = 0;
  return sections;
};
this.play = (song, sectionInd, trackStates) => {
  var ccs, section;
  if (!unvar.playing) {
    return;
  }
  revar.highlight = null;
  sectionInd = sectionInd || 0;
  if (typeof song === 'string') {
    song = this.splitSections(song);
  }
  section = song[sectionInd];
  if (!section) { // song finished
    return revar.playing = false;
  }
  if (!Array.isArray(trackStates)) {
    trackStates = section.tracks.map(() => {
      return {
        i: 0 // initi track indices on first call to section
      };
    });
  }
  ccs = {}; // chord, played  # TODO change back to chord: [C3, D3] and [].played = true
  section.tracks.forEach((track, tInd) => {
    var conf, i, iStart;
    if (conf = trackStates[tInd].conf) {
      return edide.mmConfigs.activate(conf);
    } else {
      trackStates[tInd].iStart = trackStates[tInd].i;
      processTrack(track, ccs, trackStates[tInd]);
      ({iStart, i} = trackStates[tInd]);
      if (i > iStart) {
        return revar.highlight = [song.row + section.row + tInd, iStart, i - 1];
      }
    }
  });
  if (ccs.played) {
    edide.setTimeout(() => {
      return this.play(song, sectionInd, trackStates);
    }, unvar.beatDelay);
  } else {
    edide.setTimeout(() => {
      return this.play(song, sectionInd + 1);
    });
  }
};
return this;
}).call({}, edide);
"use strict";edide.music = (function _music (edide) {Object.defineProperty(this, 'module_name', {value:'music'});
edide.global.music = this
edide.mmEffects
var { revar, unvar, react } = edide.mmState
var playQueue = []
this.play = (str) => {
  if (!unvar.pipeReady) return playQueue.push(str)
  revar.playing = true
  edide.mmParser.play(str)
}
this.stop = () => revar.playing = false
edide.instrumentConfigs.initInstrument()
var initialSettings = {
  "instrument": "synth-simple", //"piano"
}
react(() => {
  if(!revar.pipeReady) return
  edide.mmConfigs.activate(initialSettings)
  this.play(playQueue.join("\n\n")) // JSON.stringify(initialSettings)
}) // TEMP init instrument
return this;
}).call({}, edide);
"use strict";edide.wave = (function _wave (edide) {
var parent = {
  play: function(){
    edide.music.play(this.sheet)
    return this
  },
  stop: function(){
    edide.music.stop(this.sheet)
    return this
  },
  blur: function(val){
    edide.mmConfigs.activate({'blur': val})
    return this
  },
  itch: function(val){
    edide.mmConfigs.activate({'itch': val})
    return this
  },
  long: function(val){ // note delay in seconds
    edide.mmConfigs.activate({'beatDelay': val*1000})
    return this
  },
  pace: function(val) { // note delay in beats per minute
    edide.mmConfigs.activate({'bpm': val})
    return this
  },
  vary: function(val){
    edide.mmConfigs.activate({'detune': val})
    return this
  },
  loud: function(val){ // increase (>0) or decrease (<0) amplitude in decibels
    edide.mmConfigs.activate({'volume': val})
    return this
  },
}
return edide.global.wave = (str) => {
  var obj = Object.create(parent)
  obj.sheet = str
  return obj
}
return this;
}).call({}, edide);