var AWS = require('./core');

/**
 * @api private
 */
AWS.ParamValidator = AWS.util.inherit({
  validate: function validate(rules, params, context) {
    var cRules = (rules || {}).members || {};
    var payload = rules ? rules.xml : null;
    if (payload) {
      cRules = AWS.util.merge(cRules, (cRules[payload] || {}).members || {});
      delete cRules[payload];
    }

    return this.validateStructure(cRules, params || {}, context || 'params');
  },

  validateStructure: function validateStructure(rules, params, context) {
    this.validateType(context, params, ['object'], 'structure');

    for (var paramName in rules) {
      if (!rules.hasOwnProperty(paramName)) continue;
      var value = params[paramName];
      var notSet = value === undefined || value === null;
      if (rules[paramName].required && notSet) {
        this.fail('MissingRequiredParameter',
          'Missing required key \'' + paramName + '\' in ' + context);
      }
    }

    // validate hash members
    for (paramName in params) {
      if (!params.hasOwnProperty(paramName)) continue;

      var paramValue = params[paramName],
          paramRules = rules[paramName];

      if (paramRules !== undefined) {
        var memberContext = [context, paramName].join('.');
        this.validateMember(paramRules, paramValue, memberContext);
      } else {
        this.fail('UnexpectedParameter',
          'Unexpected key \'' + paramName + '\' found in ' + context);
      }
    }

    return true;
  },

  validateMember: function validateMember(rules, param, context) {
    var memberRules = rules.members || {};
    switch(rules.type) {
      case 'structure':
        return this.validateStructure(memberRules, param, context);
      case 'list':
        return this.validateList(memberRules, param, context);
      case 'map':
        return this.validateMap(memberRules, param, context);
      default:
        return this.validateScalar(rules, param, context);
    }
  },

  validateList: function validateList(rules, params, context) {
    this.validateType(context, params, [Array]);

    // validate array members
    for (var i = 0; i < params.length; i++) {
      this.validateMember(rules, params[i], context + '[' + i + ']');
    }
  },

  validateMap: function validateMap(rules, params, context) {
    this.validateType(context, params, ['object'], 'map');

    for (var param in params) {
      if (!params.hasOwnProperty(param)) continue;
      this.validateMember(rules, params[param],
                          context + '[\'' +  param + '\']');
    }
  },

  validateScalar: function validateScalar(rules, value, context) {
    switch (rules.type) {
      case null:
      case undefined:
      case 'string':
        return this.validateType(context, value, ['string']);
      case 'base64':
      case 'binary':
        return this.validatePayload(context, value);
      case 'integer':
      case 'float':
        return this.validateNumber(context, value);
      case 'boolean':
        return this.validateType(context, value, ['boolean']);
      case 'timestamp':
        return this.validateType(context, value, [Date,
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/, 'number'],
          'Date object, ISO-8601 string, or a UNIX timestamp');
      default:
        return this.fail('UnkownType', 'Unhandled type ' +
                         rules.type + ' for ' + context);
    }
  },

  fail: function fail(code, message) {
    throw AWS.util.error(new Error(message), {code: code});
  },

  validateType: function validateType(context, value, acceptedTypes, type) {
    if (value === null || value === undefined) return;

    var foundInvalidType = false;
    for (var i = 0; i < acceptedTypes.length; i++) {
      if (typeof acceptedTypes[i] === 'string') {
        if (typeof value === acceptedTypes[i]) return;
      } else if (acceptedTypes[i] instanceof RegExp) {
        if ((value || '').toString().match(acceptedTypes[i])) return;
      } else {
        if (value instanceof acceptedTypes[i]) return;
        if (AWS.util.isType(value, acceptedTypes[i])) return;
        if (!type && !foundInvalidType) acceptedTypes = acceptedTypes.slice();
        acceptedTypes[i] = AWS.util.typeName(acceptedTypes[i]);
      }
      foundInvalidType = true;
    }

    var acceptedType = type;
    if (!acceptedType) {
      acceptedType = acceptedTypes.join(', ').replace(/,([^,]+)$/, ', or$1');
    }

    var vowel = acceptedType.match(/^[aeiou]/i) ? 'n' : '';
    this.fail('InvalidParameterType', 'Expected ' + context + ' to be a' +
              vowel + ' ' + acceptedType);
  },

  validateNumber: function validateNumber(context, value) {
    if (value === null || value === undefined) return;
    if (typeof value === 'string') {
      var castedValue = parseFloat(value);
      if (castedValue.toString() === value) value = castedValue;
    }
    this.validateType(context, value, ['number']);
  },

  validatePayload: function validatePayload(context, value) {
    if (value === null || value === undefined) return;
    if (typeof value === 'string') return;
    if (value && typeof value.byteLength === 'number') return; // typed arrays
    if (AWS.util.isNode()) { // special check for buffer/stream in Node.js
      var Stream = AWS.util.nodeRequire('stream').Stream;
      if (AWS.util.Buffer.isBuffer(value) || value instanceof Stream) return;
    }

    var types = ['Buffer', 'Stream', 'File', 'Blob', 'ArrayBuffer', 'DataView'];
    if (value) {
      for (var i = 0; i < types.length; i++) {
        if (AWS.util.isType(value, types[i])) return;
        if (AWS.util.typeName(value.constructor) === types[i]) return;
      }
    }

    this.fail('InvalidParameterType', 'Expected ' + context + ' to be a ' +
      'string, Buffer, Stream, Blob, or typed array object');
  }
});
