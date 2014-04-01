var AWS = require('../core');
var inherit = AWS.util.inherit;

/**
 * @api private
 */
AWS.JSON = {};

/**
 * @api private
 */
AWS.JSON.Builder = inherit({

  constructor: function JSONBuilder(rules, options) {
    this.rules = rules;
    this.timestampFormat = options.timestampFormat;
  },

  build: function build(params) {
    return JSON.stringify(this.translate(this.rules, params));
  },

  translate: function translate(rules, value) {
    if (value === null || value === undefined) return undefined;

    if (rules.type === 'structure') {

      // translate structures (hashes with pre-defined keys)
      var struct = {};
      AWS.util.each.call(this, value, function (memberName, memberValue) {
        var memberRules = rules.members[memberName] || {};
        var result = this.translate(memberRules, memberValue);
        if (result !== undefined) struct[memberName] = result;
      });
      return struct;

    } else if (rules.type === 'list') {

      // translate each member of the list
      var list = [];
      AWS.util.arrayEach.call(this, value, function (memberValue) {
        var memberRules = rules.members || {};
        var result = this.translate(memberRules, memberValue);
        if (result !== undefined) list.push(result);
      });
      return list;

    } else if (rules.type === 'map') {

      // translate maps (hashes with user supplied keys)
      var map = {};
      AWS.util.each.call(this, value, function (memberName, memberValue) {
        var memberRules = rules.members || {};
        var result = this.translate(memberRules, memberValue);
        if (result !== undefined) map[memberName] = result;
      });
      return map;

    } else if (rules.type === 'timestamp') {

      var timestampFormat = rules.format || this.timestampFormat;
      return AWS.util.date.format(value, timestampFormat);

    } else if (rules.type === 'integer') {
      return parseInt(value, 10);
    } else if (rules.type === 'float') {
      return parseFloat(value);
    } else {

      // all other shapes
      return value;

    }
  }

});
