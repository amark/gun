var AWS = require('../core');
var builder = require('xmlbuilder');
var inherit = AWS.util.inherit;

/**
 * @api private
 */
AWS.XML.Builder = inherit({

  constructor: function XMLBuilder(root, rules, options) {
    this.root = root;
    this.rules = rules;
    this.xmlns = options.xmlnamespace;
    this.timestampFormat = options.timestampFormat;
  },

  toXML: function toXML(params) {
    var xml = builder.create(this.root);
    if (this.xmlns) xml.att('xmlns', this.xmlns);
    this.serializeStructure(this.rules, params, xml);
    return xml.root().toString();
  },

  serializeStructure: function serializeStructure(rules, params, xml) {
    AWS.util.each.call(this, rules || {}, function (memberName, memberRules) {
      var value = params[memberName];
      if (value !== undefined) {
        if (memberRules.attribute) {
          xml.att(memberRules.name, value);
        } else {
          this.serializeMember(memberName, memberRules, value, xml);
        }
      }
    });
  },

  serializeList: function serializeList(name, rules, list, xml) {
    if (rules.flattened) {
      AWS.util.arrayEach.call(this, list, function (value) {
        this.serializeMember(rules.name || name, rules.members, value, xml);
      });
    } else {
      xml = xml.ele(rules.name || name);
      AWS.util.arrayEach.call(this, list, function (value) {
        var memberName = rules.members.name || 'member';
        this.serializeMember(memberName, rules.members, value, xml);
      });
    }
  },

  serializeMember: function serializeMember(memberName, rules, params, xml) {
    if (params === null || params === undefined) return;

    var name = memberName;
    if (rules.type === 'structure') {
      xml = xml.ele(name);
      this.serializeStructure(rules.members, params, xml);
    } else if (rules.type === 'list') {
      this.serializeList(name, rules, params, xml);
    } else if (rules.type === 'timestamp') {
      var timestampFormat = rules.format || this.timestampFormat;
      var date = AWS.util.date.format(params, timestampFormat);
      xml = xml.ele(name, String(date));
    } else {
      xml = xml.ele(name, String(params));
    }
    this.applyNamespaces(xml, rules);
  },

  applyNamespaces: function applyNamespaces(xml, rules) {
    if (rules.xmlns) {
      var attr = 'xmlns';
      if (rules.xmlns.prefix) attr += ':' + rules.xmlns.prefix;
      xml.att(attr, rules.xmlns.uri);
    }
  }


});
