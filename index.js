
var Emitter = require('emitter');
var merge = require('merge');
var rndid = require('rndid');
var aria = require('aria-attributes');
var map = require('map');
var ev = require('event');
var normalize = require('normalize');
var classes = require('classes');
var keyname = require('keyname');

module.exports = Accordian;

/**
 * Create an Accordian on `element` with `opts`
 *
 * @api public
 * @param {HTMLElement} element
 * @param {Object} [opts]
 */

function Accordian(element, opts) {
  if (!(this instanceof Accordian)) {
    return new Accordian(element, opts);
  }

  this.element = typeof element === 'string'
               ? document.querySelector(element)
               : element;

  this.opts = merge({
    tab: '.tab',
    panel: '.panel',
    selected: 'selected'
  }, opts || {});

  this.setup();
}

/**
 * Inherit from Emitter
 */

Accordian.prototype = new Emitter;

/**
 * Setup stuff
 *
 * @api private
 * @return {Accordian} for chaining
 */

Accordian.prototype.setup = function () {
  function query(key) {
    return self.element.querySelectorAll(self.opts[key]);
  }

  var self = this;

  this.element.setAttribute('role', 'application');

  this.tabs = map(query('tab'), function (tab, index) {
    return new Tab(self, tab, index);

  });

  this.panels = map(query('panel'), function (panel, index) {
    return new Panel(self, panel, index);
  });

  for (var i = this.tabs.length - 1; i >= 0; i--) {
    var tab = this.tabs[i];
    var panel = this.panels[i];

    tab.setPanel(panel);
    panel.setTab(tab);
  }

  return this.deselectAll();
};

/**
 * Deselect all panels
 *
 * @api public
 * @return {Accordian} for chaining
 */

Accordian.prototype.deselectAll = function () {
  for (var i = this.panels.length - 1; i >= 0; i--) {
    this.panels[i].deselect();
  }
  return this;
};

/**
 * Remove / cleanup the Accordian
 *
 * @api public
 * @return {Accordian} for chaining
 */

Accordian.prototype.destroy = function () {
  for (var i = this.tabs.length - 1; i >= 0; i--) {
    this.tabs[i].unbind();
  }
  return this.emit('destoryed');
};

/**
 * An Accordian Tab
 *
 * @api private
 * @param {Accordian} accordian
 * @param {HTMLElement} element
 * @param {Number} index The tab index
 */

function Tab(accordian, element, index) {
  element.id = element.id || rndid();
  element.setAttribute('role', 'tab');
  // TODO
  //   don't add tabindex if the element is already focusable
  element.tabIndex = 0;
  this.accordian = accordian;
  this.element = element;
  this.index = index;
  this.panel = null;
}

/**
 * Associate the Tab with the given `panel`
 *
 * @api private
 * @param {Panel} panel
 * @return {Tab} for chaining
 */

Tab.prototype.setPanel = function (panel) {
  var el = this.element;
  this.panel = panel;
  el.tabIndex = 0;
  aria.controls(el, panel.element.id);
  return this.unbind().bind();
};

/**
 * Bind event listeners on the Tab
 *
 * @api private
 * @return {Tab} for chaining
 */

Tab.prototype.bind = function () {
  var self = this;

  this.onclick = ev.bind(this.element, 'click', normalize(function (event) {
    self.panel.toggle();
    event.preventDefault();
  }));

  this.onkeydown = ev.bind(this.element, 'keydown', normalize(function (event) {
    var key = keyname(event.which);

    // prevent conflicting with access keys
    if (event.ctrlKey) {
      return;
    }

    switch (key) {
    case 'down':
    case 'right':
      self.next().element.focus();
      event.preventDefault();
      break;
    case 'up':
    case 'left':
      self.previous().element.focus();
      event.preventDefault();
      break;
    case 'enter':
    case 'space':
      self.onclick(event);
      break;
    }
  }));

  return this;
};

/**
 * Remove event listeners on the Tab
 *
 * @api private
 * @return {Tab} for chaining
 */

Tab.prototype.unbind = function () {
  this.onclick && ev.unbind(this.element, 'click', this.onclick);
  this.onkeydown && ev.unbind(this.element, 'keydown', this.onkeydown);
  return this;
};

/**
 * Get the previous tab
 *
 * @api private
 * @return {Tab}
 */

Tab.prototype.previous = function () {
  var index = this.index === 0
            ? this.accordian.tabs.length - 1
            : this.index - 1;

  return this.accordian.tabs[index];
};


/**
 * Get the next tab
 *
 * @api private
 * @return {Tab}
 */

Tab.prototype.next = function () {
  var index = this.index === this.accordian.tabs.length - 1
            ? 0
            : this.index + 1;

  return this.accordian.tabs[index];
};

/**
 * An Accordian Panel
 *
 * @api private
 * @param {Accordian} accordian
 * @param {HTMLElement} element
 * @param {Number} index
 */

function Panel(accordian, element, index) {
  element.id = element.id || rndid();
  element.setAttribute('role', 'tabpanel');
  this.classes = classes(element);
  this.accordian = accordian;
  this.element = element;
  this.index = index;
  this.tab = null;
  this.selected = false;
}

/**
 * Associate the panel with `tab`
 *
 * @api private
 * @param {Tab} tab
 * @return {Pabel} for chaining
 */

Panel.prototype.setTab = function (tab) {
  this.tab = tab;
  aria.labelledBy(this.element, tab.element.id);
  return this;
};

/**
 * Toggle the panel's state
 *
 * @api private
 * @return {Panel} for chaining
 */

Panel.prototype.toggle = function () {
  if (this.selected) {
    return this.deselect();
  }

  return this.select();
};

/**
 * Deselect the panel
 *
 * Emits a "deselect" event
 *
 * @api private
 * @return {Panel} for chaining
 */

Panel.prototype.deselect = function () {
  this.classes.remove(this.accordian.opts.selected);
  this.selected = false;
  aria.hidden(this.element, true);
  return this.accordian.emit('deselect', this);
};

/**
 * Select the panel
 *
 * Emits a "select" event
 *
 * @api private
 * @return {Panel} for chaining
 */

Panel.prototype.select = function () {
  this.classes.add(this.accordian.opts.selected);
  this.selected = true;
  aria.hidden(this.element, false);
  return this.accordian.emit('select', this);
};
