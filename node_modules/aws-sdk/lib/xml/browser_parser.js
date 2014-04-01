var AWS = require('../core');
var inherit = AWS.util.inherit;

/**
 * @api private
 */
AWS.XML.Parser = inherit({
  constructor: function XMLParser(rules) {
    this.rules = (rules || {}).members || {};
  },

  parse: function parse(xml) {
    if (xml.replace(/^\s+/, '') === '') return {};

    var result, error;
    try {
      if (window.DOMParser) {
        var parser = new DOMParser();
        result = parser.parseFromString(xml, 'text/xml');

        if (result.documentElement === null) {
          throw new Error('Cannot parse empty document.');
        }

        var isError = result.getElementsByTagName('parsererror')[0];
        if (isError && (isError.parentNode === result ||
            isError.parentNode.nodeName === 'body')) {
          throw new Error(isError.getElementsByTagName('div')[0].textContent);
        }
      } else if (window.ActiveXObject) {
        result = new window.ActiveXObject('Microsoft.XMLDOM');
        result.async = false;
 
        if (!result.loadXML(xml)) {
          throw new Error('Parse error in document');
        }
      } else {
        throw new Error('Cannot load XML parser');
      }
    } catch (e) {
      error = e;
    }

    if (result && result.documentElement && !error) {
      return this.parseStructure(result.documentElement, this.rules);
    } else if (error) {
      throw AWS.util.error(error || new Error(), {code: 'XMLParserError'});
    } else { // empty xml document
      return {};
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

    for (var j = 0; j < structure.attributes.length; j++) {
      var attr = structure.attributes[j];
      var attrRule = rules[attr.name];
      if (attrRule) {
        var value = this.parseMember({ textContent: attr.value }, attrRule);
        data[attrRule.name || attr.name] = value;
      }
    }

    var child = structure.firstElementChild;
    while (child) {
      var rule = rules[child.nodeName] || {};
      var key = rule.name || child.nodeName;
      var inData = rule.flattened ? data[key] : null;
      data[key] = this.parseMember(child, rule, inData);
      child = child.nextElementSibling;
    }

    return data;
  },

  parseMap: function parseMap(map, rules, data) {
    data = data || {};
    var keyRules = rules.keys || {};
    var valueRules = rules.members || {};
    var keyName = keyRules.name || 'key';
    var valueName = valueRules.name || 'value';

    function run(item) {
      var key = item.getElementsByTagName(keyName)[0].textContent;
      var value = item.getElementsByTagName(valueName)[0];
      value = this.parseMember(value, valueRules);
      data[key] = value;
    }

    if (rules.flattened) {
      run.call(this, map);
    } else {
      var child = map.firstElementChild;
      while (child) {
        run.call(this, child);
        child = child.nextElementSibling;
      }
    }
    return data;
  },

  parseList: function parseList(list, rules, data) {
    data = data || [];
    var memberRules = rules.members || {};
    var memberName = memberRules.name || 'member';
    if (rules.flattened) {
      data.push(this.parseMember(list, memberRules));
    } else {
      var child = list.firstElementChild;
      while (child) {
        if (child.nodeName === memberName) {
          data.push(this.parseMember(child, memberRules));
        }
        child = child.nextElementSibling;
      }
    }
    return data;
  },

  parseMember: function parseMember(member, rules, data) {
    if (!rules.type) {
      if (member.childElementCount > 0) {
        rules.type = 'structure';
      } else {
        rules.type = 'string';
      }
    }

    if (rules.type === 'structure') {
      return this.parseStructure(member, rules.members || {}, data);
    } else if (rules.type === 'list') {
      return this.parseList(member, rules, data);
    } else if (rules.type === 'map') {
      return this.parseMap(member, rules, data);
    }

    if (rules.type === 'string') {
      if (member.attributes && member.attributes.encoding &&
          member.attributes.encoding.value === 'base64') {
        return AWS.util.base64.decode(member.textContent);
      } else {
        return member.textContent;
      }
    }

    // return null for empty nodes of any other type
    if (member.textContent === '') return null;

    if (rules.type === 'integer') {
      return parseInt(member.textContent, 10);
    } else if (rules.type === 'float') {
      return parseFloat(member.textContent);
    } else if (rules.type === 'timestamp') {
      return AWS.util.date.parseTimestamp(member.textContent);
    } else if (rules.type === 'boolean') {
      return member.textContent === 'true';
    } else {
      var msg = 'unhandled type: ' + rules.type;
      throw AWS.util.error(new Error(msg), {code: 'XMLParserError'});
    }
  }
});
