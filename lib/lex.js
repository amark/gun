(function (Gun, u) {
    /**
     * 
     *  credits: 
     *      github:bmatusiak
     * 
     */    
    var Lex = (gun) => {
        function Lex() {}

        Lex.prototype = Object.create(Object.prototype, {
            constructor: {
                value: Lex
            }
        });
        Lex.prototype.toString = function () {
            return JSON.stringify(this);
        }
        Lex.prototype.more = function (m) {
            this[">"] = m;
            return this;
        }
        Lex.prototype.less = function (le) {
            this["<"] = le;
            return this;
        }
        Lex.prototype.in = function () {
            var l = new Lex();
            this["."] = l;
            return l;
        }
        Lex.prototype.of = function () {
            var l = new Lex();
            this.hash(l)
            return l;
        }
        Lex.prototype.hash = function (h) {
            this["#"] = h;
            return this;
        }
        Lex.prototype.prefix = function (p) {
            this["*"] = p;
            return this;
        }
        Lex.prototype.return = function (r) {
            this["="] = r;
            return this;
        }
        Lex.prototype.limit = function (l) {
            this["%"] = l;
            return this;
        }
        Lex.prototype.reverse = function (rv) {
            this["-"] = rv || 1;
            return this;
        }
        Lex.prototype.includes = function (i) {
            this["+"] = i;
            return this;
        }
        Lex.prototype.map = function (...args) {
            return gun.map(this, ...args);
        }
        Lex.prototype.match = function(t,o){ var tmp, u;
            o = o || this;            
            if('string' == typeof o){ o = {'=': o} }
            if('string' !== typeof t){ return false }
            tmp = (o['='] || o['*'] || o['>'] || o['<']);
            if(t === tmp){ return true }
            if(u !== o['=']){ return false }
            tmp = (o['*'] || o['>']);
            if(t.slice(0, (tmp||'').length) === tmp){ return true }
            if(u !== o['*']){ return false }
            if(u !== o['>'] && u !== o['<']){
                return (t >= o['>'] && t <= o['<'])? true : false;
            }
            if(u !== o['>'] && t >= o['>']){ return true }
            if(u !== o['<'] && t <= o['<']){ return true }
            return false;
        }
        
        return new Lex();
    };

    Gun.chain.lex = function () {
        return Lex(this);
    }

})((typeof window !== "undefined") ? window.Gun : require('../gun'))