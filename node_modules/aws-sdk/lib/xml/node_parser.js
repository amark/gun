var AWS = require('../core');
var inherit = AWS.util.inherit;
var xml2js = require('xml2js');

/**
 * @api private
 */
AWS.XML.Parser = inherit({
  constructor: function XMLParser(rules) {
    this.rules = (rules || {}).members || {};
  },

  // options passed to xml2js parser
  options: {
    explicitCharkey: false, // undocumented
    trim: false,            // trim the leading/trailing whitespace from text nodes
    normalize: false,       // trim interior whitespace inside text nodes
    explicitRoot: false,    // return the root node in the resulting object?
    emptyTag: null,         // the default value for empty nodes
    explicitArray: true,    // always put child nodes in an array
    ignoreAttrs: false,     // ignore attributes, only create text nodes
    mergeAttrs: false,      // merge attributes and child elements
    validator: null         // a callable validator
  },

  parse: function parse(xml) {

    var result = null;
    var error = null;
    var parser = new xml2js.Parser(this.options);
    parser.parseString(xml, function (e, r) {
      error = e;
      result = r;
    });

    if (result) {
      delete result.xmlns;
      return this.parseStructure(result, this.rules);
    } else if (error) {
      throw AWS.util.error(error, {code: 'XMLParserError'});
    } else { // empty xml document
      return this.parseStructure({}, this.rules);
    }
  },

  parseStructure: function parseStructure(structure, rules) {
    var data = {};

    // force array members to always be present
    AWS.util.each.call(this, rules, function(memberName, memberRules) {
      if (memberRules.type === 'list') {
        data[memberRules.name || memberName] = [];
      }
    });

    AWS.util.each.call(this, structure, function (xmlName, value) {
      var rule;
      if (xmlName === '$') {
        AWS.util.each.call(this, value, function (attrName, attrValue) {
          if (rules[attrName]) {
            rule = rules[attrName];
            data[rule.name || xmlName] = this.parseMember([attrValue], rule);
          }
        });
      } else {
        rule = rules[xmlName] || {};
        data[rule.name || xmlName] = this.parseMember(value, rule);
      }
    });

    return data;
  },

  parseMap: function parseMap(map, rules) {
    var data = {};
    var keyRules = rules.keys || {};
    var valueRules = rules.members || {};
    var keyName = keyRules.name || 'key';
    var valueName = valueRules.name || 'value';
    if (!rules.flattened) {
      map = map[0].entry;
    }
    AWS.util.arrayEach.call(this, map, function (entry) {
      var value = this.parseMember(entry[valueName], valueRules);
      data[entry[keyName][0]] = value;
    });
    return data;
  },

  parseList: function parseList(list, rules) {
    var data = [];
    var memberRules = rules.members || {};
    var memberName = memberRules.name || 'member';
    if (rules.flattened) {
      AWS.util.arrayEach.call(this, list, function (value) {
        data.push(this.parseMember([value], memberRules));
      });
    } else {
      AWS.util.arrayEach.call(this, list, function (member) {
        AWS.util.arrayEach.call(this, member[memberName], function (value) {
          data.push(this.parseMember([value], memberRules));
        });
      });
    }
    return data;
  },

  parseMember: function parseMember(values, rules) {
    if (values[0] === null) {
      if (rules.type === 'structure') return {};
      if (rules.type === 'list') return [];
      if (rules.type === 'map') return {};
      if (!rules.type || rules.type === 'string') return '';
      return null;
    }

    if (values[0]['$'] && values[0]['$'].encoding === 'base64') {
      return AWS.util.base64.decode(values[0]['_']);
    }

    if (!rules.type) {
      if (typeof values[0] === 'string') {
        rules.type = 'string';
      } else if (values[0]['_']) {
        rules.type = 'string';
        values = [values[0]['_']];
      } else {
        rules.type = 'structure';
      }
    }

    if (rules.type === 'string') {
      return values[0] === null ? '' : values[0];
    } else if (rules.type === 'structure') {
      return this.parseStructure(values[0], rules.members || {});
    } else if (rules.type === 'list') {
      return this.parseList(values, rules);
    } else if (rules.type === 'map') {
      return this.parseMap(values, rules);
    } else if (rules.type === 'integer') {
      return parseInt(values[0], 10);
    } else if (rules.type === 'float') {
      return parseFloat(values[0]);
    } else if (rules.type === 'timestamp') {
      return AWS.util.date.parseTimestamp(values[0]);
    } else if (rules.type === 'boolean') {
      return values[0] === 'true';
    } else {
      var msg = 'unhandled type: ' + rules.type;
      throw AWS.util.error(new Error(msg), {code: 'XMLParserError'});
    }
  }
});
