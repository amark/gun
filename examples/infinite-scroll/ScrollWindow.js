const DEFAULT_OPTIONS = {
  size: 20,
  stickTo: 'top',
};

class ScrollWindow {
  constructor(gunNode, opts = {}) {
    this.opts = Object.assign(DEFAULT_OPTIONS, opts);
    this.elements = new Map();
    this.node = gunNode;
    this.center = this.opts.startAt;
    this.updateSubscriptions();
  }

  updateSubscriptions() {
    this.upSubscription && this.upSubscription.off();
    this.downSubscription && this.downSubscription.off();

    const subscribe = params => {
      this.node.get({ '.': params}).map().on((val, key, a, eve) => {
        if (params['-']) {
          this.downSubscription = eve;
        } else {
          this.upSubscription = eve;
        }
        this._addElement(key, val);
      });
    };

    if (this.center) {
      subscribe({ '>': this.center, '<': '\uffff' });
      subscribe({'<': this.center, '>' : '', '-': true});
    } else {
      subscribe({ '<': '\uffff', '>': '', '-': this.opts.stickTo === 'top' });
    }
  }

  _getSortedKeys() {
    this.sortedKeys = this.sortedKeys || [...this.elements.keys()].sort();
    return this.sortedKeys;
  }

  _upOrDown(n, up) {
    this.opts.stickTo = null;
    const keys = this._getSortedKeys();
    n = n || (keys.length / 2);
    n = up ? n : -n;
    const half = Math.floor(keys.length / 2);
    const newMiddleIndex = Math.max(Math.min(half + n, keys.length - 1), 0);
    if (this.center !== keys[newMiddleIndex]) {
      this.center = keys[newMiddleIndex];
      this.updateSubscriptions();
    }
    return this.center;
  }

  up(n) {
    return this._upOrDown(n, true);
  }

  down(n) {
    return this._upOrDown(n, false);
  }

  _topOrBottom(top) {
    this.opts.stickTo = top ? 'top' : 'bottom';
    this.center = null;
    this.updateSubscriptions();
  }

  top() {
    this._topOrBottom(true);
  }

  bottom() {
    this._topOrBottom(false);
  }

  _addElement(key, val) {
    if (!val || this.elements.has(key)) return;
    const add = () => {
      this.elements.set(key, val);
      this.sortedKeys = [...this.elements.keys()].sort();
      const sortedElements = this.sortedKeys.map(k => this.elements.get(k));
      this.opts.onChange && this.opts.onChange(sortedElements);
    };
    const keys = this._getSortedKeys();
    if (keys.length < this.opts.size) {
      add();
    } else {
      if (this.opts.stickTo === 'top' && key > keys[0]) {
        this.elements.delete(keys[0]);
        add();
      } else if (this.opts.stickTo === 'bottom' && key < keys[keys.length - 1]) {
        this.elements.delete(keys[keys.length - 1]);
        add();
      } else if (this.center) {
        if (keys.indexOf(this.center) < (keys.length / 2)) {
          if (key < keys[keys.length - 1]) {
            this.elements.delete(keys[keys.length - 1]);
            add();
          }
        } else {
          if (key > keys[0]) {
            delete this.elements.delete(keys[0]);
            add();
          }
        }
      }
    }
  }

  getElements() {
    return this.elements;
  }
}
