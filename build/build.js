
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("yields-merge/index.js", Function("exports, require, module",
"\n\
/**\n\
 * merge `b`'s properties with `a`'s.\n\
 *\n\
 * example:\n\
 *\n\
 *        var user = {};\n\
 *        merge(user, console);\n\
 *        // > { log: fn, dir: fn ..}\n\
 *\n\
 * @param {Object} a\n\
 * @param {Object} b\n\
 * @return {Object}\n\
 */\n\
\n\
module.exports = function (a, b) {\n\
  for (var k in b) a[k] = b[k];\n\
  return a;\n\
};\n\
//@ sourceURL=yields-merge/index.js"
));
require.register("component-indexof/index.js", Function("exports, require, module",
"module.exports = function(arr, obj){\n\
  if (arr.indexOf) return arr.indexOf(obj);\n\
  for (var i = 0; i < arr.length; ++i) {\n\
    if (arr[i] === obj) return i;\n\
  }\n\
  return -1;\n\
};//@ sourceURL=component-indexof/index.js"
));
require.register("component-emitter/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var index = require('indexof');\n\
\n\
/**\n\
 * Expose `Emitter`.\n\
 */\n\
\n\
module.exports = Emitter;\n\
\n\
/**\n\
 * Initialize a new `Emitter`.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
function Emitter(obj) {\n\
  if (obj) return mixin(obj);\n\
};\n\
\n\
/**\n\
 * Mixin the emitter properties.\n\
 *\n\
 * @param {Object} obj\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function mixin(obj) {\n\
  for (var key in Emitter.prototype) {\n\
    obj[key] = Emitter.prototype[key];\n\
  }\n\
  return obj;\n\
}\n\
\n\
/**\n\
 * Listen on the given `event` with `fn`.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.on = function(event, fn){\n\
  this._callbacks = this._callbacks || {};\n\
  (this._callbacks[event] = this._callbacks[event] || [])\n\
    .push(fn);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Adds an `event` listener that will be invoked a single\n\
 * time then automatically removed.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.once = function(event, fn){\n\
  var self = this;\n\
  this._callbacks = this._callbacks || {};\n\
\n\
  function on() {\n\
    self.off(event, on);\n\
    fn.apply(this, arguments);\n\
  }\n\
\n\
  fn._off = on;\n\
  this.on(event, on);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove the given callback for `event` or all\n\
 * registered callbacks.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.off =\n\
Emitter.prototype.removeListener =\n\
Emitter.prototype.removeAllListeners = function(event, fn){\n\
  this._callbacks = this._callbacks || {};\n\
\n\
  // all\n\
  if (0 == arguments.length) {\n\
    this._callbacks = {};\n\
    return this;\n\
  }\n\
\n\
  // specific event\n\
  var callbacks = this._callbacks[event];\n\
  if (!callbacks) return this;\n\
\n\
  // remove all handlers\n\
  if (1 == arguments.length) {\n\
    delete this._callbacks[event];\n\
    return this;\n\
  }\n\
\n\
  // remove specific handler\n\
  var i = index(callbacks, fn._off || fn);\n\
  if (~i) callbacks.splice(i, 1);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Emit `event` with the given args.\n\
 *\n\
 * @param {String} event\n\
 * @param {Mixed} ...\n\
 * @return {Emitter}\n\
 */\n\
\n\
Emitter.prototype.emit = function(event){\n\
  this._callbacks = this._callbacks || {};\n\
  var args = [].slice.call(arguments, 1)\n\
    , callbacks = this._callbacks[event];\n\
\n\
  if (callbacks) {\n\
    callbacks = callbacks.slice(0);\n\
    for (var i = 0, len = callbacks.length; i < len; ++i) {\n\
      callbacks[i].apply(this, args);\n\
    }\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return array of callbacks for `event`.\n\
 *\n\
 * @param {String} event\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.listeners = function(event){\n\
  this._callbacks = this._callbacks || {};\n\
  return this._callbacks[event] || [];\n\
};\n\
\n\
/**\n\
 * Check if this emitter has `event` handlers.\n\
 *\n\
 * @param {String} event\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.hasListeners = function(event){\n\
  return !! this.listeners(event).length;\n\
};\n\
//@ sourceURL=component-emitter/index.js"
));
require.register("component-classes/index.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var index = require('indexof');\n\
\n\
/**\n\
 * Whitespace regexp.\n\
 */\n\
\n\
var re = /\\s+/;\n\
\n\
/**\n\
 * toString reference.\n\
 */\n\
\n\
var toString = Object.prototype.toString;\n\
\n\
/**\n\
 * Wrap `el` in a `ClassList`.\n\
 *\n\
 * @param {Element} el\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(el){\n\
  return new ClassList(el);\n\
};\n\
\n\
/**\n\
 * Initialize a new ClassList for `el`.\n\
 *\n\
 * @param {Element} el\n\
 * @api private\n\
 */\n\
\n\
function ClassList(el) {\n\
  if (!el) throw new Error('A DOM element reference is required');\n\
  this.el = el;\n\
  this.list = el.classList;\n\
}\n\
\n\
/**\n\
 * Add class `name` if not already present.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.add = function(name){\n\
  // classList\n\
  if (this.list) {\n\
    this.list.add(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  var arr = this.array();\n\
  var i = index(arr, name);\n\
  if (!~i) arr.push(name);\n\
  this.el.className = arr.join(' ');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove class `name` when present, or\n\
 * pass a regular expression to remove\n\
 * any which match.\n\
 *\n\
 * @param {String|RegExp} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.remove = function(name){\n\
  if ('[object RegExp]' == toString.call(name)) {\n\
    return this.removeMatching(name);\n\
  }\n\
\n\
  // classList\n\
  if (this.list) {\n\
    this.list.remove(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  var arr = this.array();\n\
  var i = index(arr, name);\n\
  if (~i) arr.splice(i, 1);\n\
  this.el.className = arr.join(' ');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove all classes matching `re`.\n\
 *\n\
 * @param {RegExp} re\n\
 * @return {ClassList}\n\
 * @api private\n\
 */\n\
\n\
ClassList.prototype.removeMatching = function(re){\n\
  var arr = this.array();\n\
  for (var i = 0; i < arr.length; i++) {\n\
    if (re.test(arr[i])) {\n\
      this.remove(arr[i]);\n\
    }\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Toggle class `name`.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.toggle = function(name){\n\
  // classList\n\
  if (this.list) {\n\
    this.list.toggle(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  if (this.has(name)) {\n\
    this.remove(name);\n\
  } else {\n\
    this.add(name);\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return an array of classes.\n\
 *\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.array = function(){\n\
  var str = this.el.className.replace(/^\\s+|\\s+$/g, '');\n\
  var arr = str.split(re);\n\
  if ('' === arr[0]) arr.shift();\n\
  return arr;\n\
};\n\
\n\
/**\n\
 * Check if class `name` is present.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.has =\n\
ClassList.prototype.contains = function(name){\n\
  return this.list\n\
    ? this.list.contains(name)\n\
    : !! ~index(this.array(), name);\n\
};\n\
//@ sourceURL=component-classes/index.js"
));
require.register("stephenmathieson-rndid/index.js", Function("exports, require, module",
"'use strict';\n\
\n\
/**\n\
 * Generate a random alpha-char\n\
 *\n\
 * @api private\n\
 * @return {String}\n\
 */\n\
function c() {\n\
  return String.fromCharCode(Math.floor(Math.random() * 25) + 97);\n\
}\n\
\n\
/**\n\
 * Generate a random alpha-string of `len` characters.\n\
 *\n\
 * @api private\n\
 * @param {Number} len\n\
 * @return {String}\n\
 */\n\
function str(len) {\n\
  var i,\n\
      s = '';\n\
\n\
  for (i = 0; i < len; i++)\n\
    s += c();\n\
\n\
  return s;\n\
}\n\
\n\
/**\n\
 * Generate a random, unused ID\n\
 *\n\
 * @api public\n\
 * @param {Number} [len] Length of the ID to generate\n\
 * @return {String}\n\
 */\n\
var rndid = module.exports = function (len) {\n\
  var id = str(len || 7);\n\
\n\
  // lookup to guarantee unique\n\
  if (document.getElementById(id))\n\
    // try again\n\
    return rndid(len);\n\
\n\
  return id;\n\
};\n\
//@ sourceURL=stephenmathieson-rndid/index.js"
));
require.register("component-trim/index.js", Function("exports, require, module",
"\n\
exports = module.exports = trim;\n\
\n\
function trim(str){\n\
  if (str.trim) return str.trim();\n\
  return str.replace(/^\\s*|\\s*$/g, '');\n\
}\n\
\n\
exports.left = function(str){\n\
  if (str.trimLeft) return str.trimLeft();\n\
  return str.replace(/^\\s*/, '');\n\
};\n\
\n\
exports.right = function(str){\n\
  if (str.trimRight) return str.trimRight();\n\
  return str.replace(/\\s*$/, '');\n\
};\n\
//@ sourceURL=component-trim/index.js"
));
require.register("component-bind/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Slice reference.\n\
 */\n\
\n\
var slice = [].slice;\n\
\n\
/**\n\
 * Bind `obj` to `fn`.\n\
 *\n\
 * @param {Object} obj\n\
 * @param {Function|String} fn or string\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(obj, fn){\n\
  if ('string' == typeof fn) fn = obj[fn];\n\
  if ('function' != typeof fn) throw new Error('bind() requires a function');\n\
  var args = [].slice.call(arguments, 2);\n\
  return function(){\n\
    return fn.apply(obj, args.concat(slice.call(arguments)));\n\
  }\n\
};\n\
//@ sourceURL=component-bind/index.js"
));
require.register("stephenmathieson-aria-attributes/index.js", Function("exports, require, module",
"\n\
var trim = require('trim'),\n\
    indexof = require('indexof'),\n\
    bind = require('bind'),\n\
    rndid = require('rndid');\n\
\n\
\n\
// space-delimited methods\n\
map([\n\
  'controls',\n\
  'describedBy',\n\
  'flowTo',\n\
  'labelledBy',\n\
  'owns'\n\
], function (attr, element, id) {\n\
  var val = element.getAttribute(attr);\n\
\n\
  if (!id) {\n\
    return val;\n\
  }\n\
\n\
  // duck typing dom nodes\n\
  if (typeof id === 'object' && id.nodeType) {\n\
    id = id.id = id.id || rndid();\n\
  }\n\
\n\
  var ids = split(val, ' ');\n\
  if (indexof(ids, id) == -1) {\n\
    ids.push(id);\n\
  }\n\
\n\
  var n = trim(ids.join(' '));\n\
  element.setAttribute(attr, n);\n\
  return n;\n\
});\n\
\n\
// boolean methods\n\
map([\n\
  'atomic',\n\
  'busy',\n\
  'checked',\n\
  'disabled',\n\
  'expanded',\n\
  'grabbed',\n\
  'hasPopUp',\n\
  'hidden',\n\
  'multiline',\n\
  'multiSelectable',\n\
  'pressed',\n\
  'readOnly',\n\
  'required',\n\
  'selected'\n\
], function (attr, element, val) {\n\
  var current = element.getAttribute(attr);\n\
\n\
  if (val === undefined) {\n\
    return current === 'true' ? true : false;\n\
  }\n\
\n\
  if (typeof val !== 'boolean' && val !== 'true' && val !== 'false') {\n\
    throw new TypeError(attr + ' must be a boolean');\n\
  }\n\
\n\
  element.setAttribute(attr, val);\n\
  return val;\n\
});\n\
\n\
\n\
// string methods\n\
map([\n\
  'activeDescendant',\n\
  'dropEffect', // TODO may only be: \"none\", \"popup\", \"execute\", \"copy\", \"move\", \"reference\"\n\
  'label',\n\
  'live', // TODO may only be: \"off\", \"live\" or \"assertive\"\n\
  'relevant', // TODO may only be: \"all\" or any combo of \"additions\", \"removals\", or \"text\"\n\
  'sort', // TODO may only be: \"ascending\", \"descending\", \"none\" or \"other\"\n\
  'valueText'\n\
], function (attr, element, val) {\n\
  var current = trim(element.getAttribute(attr) || '');\n\
  if (val === undefined) {\n\
    return current;\n\
  }\n\
\n\
  val = trim(val);\n\
  element.setAttribute(attr, val);\n\
  return val;\n\
});\n\
\n\
\n\
// number methods\n\
map([\n\
  'level',\n\
  'posInSet',\n\
  'setSize',\n\
  'valueMax',\n\
  'valueMin',\n\
  'valueNow'\n\
], function (attr, element, val) {\n\
  var current = element.getAttribute(attr);\n\
\n\
  if (val === undefined) {\n\
    return current\n\
      ? parseInt(current, 10)\n\
      : null;\n\
  }\n\
\n\
  val = parseInt(val, 10);\n\
  element.setAttribute(attr, val);\n\
  return val;\n\
});\n\
\n\
\n\
/**\n\
 * Split the given `str` via `delimiter`, ignoring empty items\n\
 *\n\
 * @api private\n\
 * @param {String} str\n\
 * @param {String|RegExp} delimiter\n\
 * @return {Array}\n\
 */\n\
function split(str, delimiter) {\n\
  var a = (str || '').split(delimiter);\n\
  var b = [];\n\
\n\
  for (var i = 0, len = a.length; i < len; i++) {\n\
    var c = trim(a[i]);\n\
    if (c) b.push(c);\n\
  }\n\
\n\
  return b;\n\
}\n\
\n\
\n\
/**\n\
 * Map the given `arr` of methods to `fn`\n\
 *\n\
 * @api private\n\
 * @param {Array} arr\n\
 * @param {Function} fn\n\
 */\n\
function map(arr, fn) {\n\
  for (var i = arr.length - 1; i >= 0; i--) {\n\
    var method = arr[i];\n\
    exports[method] = bind(null, fn, 'aria-' + method.toLowerCase());\n\
  }\n\
}\n\
//@ sourceURL=stephenmathieson-aria-attributes/index.js"
));
require.register("component-to-function/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `toFunction()`.\n\
 */\n\
\n\
module.exports = toFunction;\n\
\n\
/**\n\
 * Convert `obj` to a `Function`.\n\
 *\n\
 * @param {Mixed} obj\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function toFunction(obj) {\n\
  switch ({}.toString.call(obj)) {\n\
    case '[object Object]':\n\
      return objectToFunction(obj);\n\
    case '[object Function]':\n\
      return obj;\n\
    case '[object String]':\n\
      return stringToFunction(obj);\n\
    case '[object RegExp]':\n\
      return regexpToFunction(obj);\n\
    default:\n\
      return defaultToFunction(obj);\n\
  }\n\
}\n\
\n\
/**\n\
 * Default to strict equality.\n\
 *\n\
 * @param {Mixed} val\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function defaultToFunction(val) {\n\
  return function(obj){\n\
    return val === obj;\n\
  }\n\
}\n\
\n\
/**\n\
 * Convert `re` to a function.\n\
 *\n\
 * @param {RegExp} re\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function regexpToFunction(re) {\n\
  return function(obj){\n\
    return re.test(obj);\n\
  }\n\
}\n\
\n\
/**\n\
 * Convert property `str` to a function.\n\
 *\n\
 * @param {String} str\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function stringToFunction(str) {\n\
  // immediate such as \"> 20\"\n\
  if (/^ *\\W+/.test(str)) return new Function('_', 'return _ ' + str);\n\
\n\
  // properties such as \"name.first\" or \"age > 18\"\n\
  return new Function('_', 'return _.' + str);\n\
}\n\
\n\
/**\n\
 * Convert `object` to a function.\n\
 *\n\
 * @param {Object} object\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function objectToFunction(obj) {\n\
  var match = {}\n\
  for (var key in obj) {\n\
    match[key] = typeof obj[key] === 'string'\n\
      ? defaultToFunction(obj[key])\n\
      : toFunction(obj[key])\n\
  }\n\
  return function(val){\n\
    if (typeof val !== 'object') return false;\n\
    for (var key in match) {\n\
      if (!(key in val)) return false;\n\
      if (!match[key](val[key])) return false;\n\
    }\n\
    return true;\n\
  }\n\
}\n\
//@ sourceURL=component-to-function/index.js"
));
require.register("component-map/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var toFunction = require('to-function');\n\
\n\
/**\n\
 * Map the given `arr` with callback `fn(val, i)`.\n\
 *\n\
 * @param {Array} arr\n\
 * @param {Function} fn\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(arr, fn){\n\
  var ret = [];\n\
  fn = toFunction(fn);\n\
  for (var i = 0; i < arr.length; ++i) {\n\
    ret.push(fn(arr[i], i));\n\
  }\n\
  return ret;\n\
};//@ sourceURL=component-map/index.js"
));
require.register("component-event/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Bind `el` event `type` to `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.bind = function(el, type, fn, capture){\n\
  if (el.addEventListener) {\n\
    el.addEventListener(type, fn, capture || false);\n\
  } else {\n\
    el.attachEvent('on' + type, fn);\n\
  }\n\
  return fn;\n\
};\n\
\n\
/**\n\
 * Unbind `el` event `type`'s callback `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.unbind = function(el, type, fn, capture){\n\
  if (el.removeEventListener) {\n\
    el.removeEventListener(type, fn, capture || false);\n\
  } else {\n\
    el.detachEvent('on' + type, fn);\n\
  }\n\
  return fn;\n\
};\n\
//@ sourceURL=component-event/index.js"
));
require.register("stephenmathieson-normalize/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Normalize the events provided to `fn`\n\
 *\n\
 * @api public\n\
 * @param {Function|Event} fn\n\
 * @return {Function|Event}\n\
 */\n\
\n\
exports = module.exports = function (fn) {\n\
  // handle functions which are passed an event\n\
  if (typeof fn === 'function') {\n\
    return function (event) {\n\
      event = exports.normalize(event);\n\
      fn.call(this, event);\n\
    };\n\
  }\n\
\n\
  // just normalize the event\n\
  return exports.normalize(fn);\n\
};\n\
\n\
/**\n\
 * Normalize the given `event`\n\
 *\n\
 * @api private\n\
 * @param {Event} event\n\
 * @return {Event}\n\
 */\n\
\n\
exports.normalize = function (event) {\n\
  event = event || window.event;\n\
\n\
  event.target = event.target || event.srcElement;\n\
\n\
  event.which = event.which ||  event.keyCode || event.charCode;\n\
\n\
  event.preventDefault = event.preventDefault || function () {\n\
    this.returnValue = false;\n\
  };\n\
\n\
  event.stopPropagation = event.stopPropagation || function () {\n\
    this.cancelBubble = true;\n\
  };\n\
\n\
  return event;\n\
};\n\
//@ sourceURL=stephenmathieson-normalize/index.js"
));
require.register("component-keyname/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Key name map.\n\
 */\n\
\n\
var map = {\n\
  8: 'backspace',\n\
  9: 'tab',\n\
  13: 'enter',\n\
  16: 'shift',\n\
  17: 'ctrl',\n\
  18: 'alt',\n\
  20: 'capslock',\n\
  27: 'esc',\n\
  32: 'space',\n\
  33: 'pageup',\n\
  34: 'pagedown',\n\
  35: 'end',\n\
  36: 'home',\n\
  37: 'left',\n\
  38: 'up',\n\
  39: 'right',\n\
  40: 'down',\n\
  45: 'ins',\n\
  46: 'del',\n\
  91: 'meta',\n\
  93: 'meta',\n\
  224: 'meta'\n\
};\n\
\n\
/**\n\
 * Return key name for `n`.\n\
 *\n\
 * @param {Number} n\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(n){\n\
  return map[n];\n\
};//@ sourceURL=component-keyname/index.js"
));
require.register("stephenmathieson-is-focusable/index.js", Function("exports, require, module",
"\n\
var selector = /input|select|textarea|button/i;\n\
\n\
module.exports = isFocusable;\n\
\n\
/**\n\
 * Check if the given `element` can receive focus\n\
 *\n\
 * @api public\n\
 * @param {HTMLElement} element\n\
 * @return {Boolean}\n\
 */\n\
\n\
function isFocusable(element) {\n\
  // tabindex\n\
  if (element.hasAttribute('tabindex')) {\n\
    var tabindex = element.getAttribute('tabindex');\n\
    if (!isNaN(tabindex)) {\n\
      return true;\n\
    }\n\
  }\n\
\n\
  // natively focusable, but only when enabled\n\
  var name = element.nodeName;\n\
  if (selector.test(name)) {\n\
    return element.type.toLowerCase() !== 'hidden'\n\
        && !element.disabled;\n\
  }\n\
\n\
  // anchors must have an href\n\
  if (name === 'A') {\n\
    return !!element.href;\n\
  }\n\
\n\
  return false;\n\
}\n\
//@ sourceURL=stephenmathieson-is-focusable/index.js"
));
require.register("aria-accordian/index.js", Function("exports, require, module",
"\n\
var Emitter = require('emitter');\n\
var merge = require('merge');\n\
var rndid = require('rndid');\n\
var aria = require('aria-attributes');\n\
var map = require('map');\n\
var ev = require('event');\n\
var normalize = require('normalize');\n\
var classes = require('classes');\n\
var keyname = require('keyname');\n\
var isFocusable = require('is-focusable');\n\
\n\
module.exports = Accordian;\n\
\n\
/**\n\
 * Create an Accordian on `element` with `opts`\n\
 *\n\
 * @api public\n\
 * @param {HTMLElement} element\n\
 * @param {Object} [opts]\n\
 */\n\
\n\
function Accordian(element, opts) {\n\
  if (!(this instanceof Accordian)) {\n\
    return new Accordian(element, opts);\n\
  }\n\
\n\
  this.element = typeof element === 'string'\n\
               ? document.querySelector(element)\n\
               : element;\n\
\n\
  this.opts = merge({\n\
    tab: '.tab',\n\
    panel: '.panel',\n\
    selected: 'selected'\n\
  }, opts || {});\n\
\n\
  this.setup();\n\
}\n\
\n\
/**\n\
 * Inherit from Emitter\n\
 */\n\
\n\
Accordian.prototype = new Emitter;\n\
\n\
/**\n\
 * Setup stuff\n\
 *\n\
 * @api private\n\
 * @return {Accordian} for chaining\n\
 */\n\
\n\
Accordian.prototype.setup = function () {\n\
  function query(key) {\n\
    return self.element.querySelectorAll(self.opts[key]);\n\
  }\n\
\n\
  var self = this;\n\
\n\
  this.element.setAttribute('role', 'tablist');\n\
\n\
  this.tabs = map(query('tab'), function (tab, index) {\n\
    return new Tab(self, tab, index);\n\
\n\
  });\n\
\n\
  this.panels = map(query('panel'), function (panel, index) {\n\
    return new Panel(self, panel, index);\n\
  });\n\
\n\
  for (var i = this.tabs.length - 1; i >= 0; i--) {\n\
    var tab = this.tabs[i];\n\
    var panel = this.panels[i];\n\
\n\
    tab.setPanel(panel);\n\
    panel.setTab(tab);\n\
  }\n\
\n\
  return this.deselectAll();\n\
};\n\
\n\
/**\n\
 * Deselect all panels\n\
 *\n\
 * @api public\n\
 * @return {Accordian} for chaining\n\
 */\n\
\n\
Accordian.prototype.deselectAll = function () {\n\
  for (var i = this.panels.length - 1; i >= 0; i--) {\n\
    this.panels[i].deselect();\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove / cleanup the Accordian\n\
 *\n\
 * @api public\n\
 * @return {Accordian} for chaining\n\
 */\n\
\n\
Accordian.prototype.destroy = function () {\n\
  for (var i = this.tabs.length - 1; i >= 0; i--) {\n\
    this.tabs[i].unbind();\n\
  }\n\
  return this.emit('destoryed');\n\
};\n\
\n\
/**\n\
 * An Accordian Tab\n\
 *\n\
 * @api private\n\
 * @param {Accordian} accordian\n\
 * @param {HTMLElement} element\n\
 * @param {Number} index The tab index\n\
 */\n\
\n\
function Tab(accordian, element, index) {\n\
  element.id = element.id || rndid();\n\
  element.setAttribute('role', 'tab');\n\
\n\
  if (!isFocusable(element)) {\n\
    element.tabIndex = 0;\n\
  }\n\
\n\
  this.accordian = accordian;\n\
  this.element = element;\n\
  this.index = index;\n\
  this.panel = null;\n\
}\n\
\n\
/**\n\
 * Associate the Tab with the given `panel`\n\
 *\n\
 * @api private\n\
 * @param {Panel} panel\n\
 * @return {Tab} for chaining\n\
 */\n\
\n\
Tab.prototype.setPanel = function (panel) {\n\
  this.panel = panel;\n\
  aria.controls(this.element, panel.element.id);\n\
  return this.unbind().bind();\n\
};\n\
\n\
/**\n\
 * Bind event listeners on the Tab\n\
 *\n\
 * @api private\n\
 * @return {Tab} for chaining\n\
 */\n\
\n\
Tab.prototype.bind = function () {\n\
  var self = this;\n\
\n\
  this.onclick = ev.bind(this.element, 'click', normalize(function (event) {\n\
    self.panel.toggle();\n\
    event.preventDefault();\n\
  }));\n\
\n\
  this.onkeydown = ev.bind(this.element, 'keydown', normalize(function (event) {\n\
    var key = keyname(event.which);\n\
\n\
    // prevent conflicting with access keys\n\
    if (event.ctrlKey) {\n\
      return;\n\
    }\n\
\n\
    switch (key) {\n\
      case 'down':\n\
      case 'right':\n\
        self.next().element.focus();\n\
        event.preventDefault();\n\
        break;\n\
      case 'up':\n\
      case 'left':\n\
        self.previous().element.focus();\n\
        event.preventDefault();\n\
        break;\n\
      case 'enter':\n\
      case 'space':\n\
        self.onclick(event);\n\
        break;\n\
    }\n\
  }));\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove event listeners on the Tab\n\
 *\n\
 * @api private\n\
 * @return {Tab} for chaining\n\
 */\n\
\n\
Tab.prototype.unbind = function () {\n\
  this.onclick && ev.unbind(this.element, 'click', this.onclick);\n\
  this.onkeydown && ev.unbind(this.element, 'keydown', this.onkeydown);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Get the previous tab\n\
 *\n\
 * @api private\n\
 * @return {Tab}\n\
 */\n\
\n\
Tab.prototype.previous = function () {\n\
  var index = this.index === 0\n\
            ? this.accordian.tabs.length - 1\n\
            : this.index - 1;\n\
\n\
  return this.accordian.tabs[index];\n\
};\n\
\n\
\n\
/**\n\
 * Get the next tab\n\
 *\n\
 * @api private\n\
 * @return {Tab}\n\
 */\n\
\n\
Tab.prototype.next = function () {\n\
  var index = this.index === this.accordian.tabs.length - 1\n\
            ? 0\n\
            : this.index + 1;\n\
\n\
  return this.accordian.tabs[index];\n\
};\n\
\n\
/**\n\
 * An Accordian Panel\n\
 *\n\
 * @api private\n\
 * @param {Accordian} accordian\n\
 * @param {HTMLElement} element\n\
 * @param {Number} index\n\
 */\n\
\n\
function Panel(accordian, element, index) {\n\
  element.id = element.id || rndid();\n\
  element.setAttribute('role', 'tabpanel');\n\
  this.classes = classes(element);\n\
  this.accordian = accordian;\n\
  this.element = element;\n\
  this.index = index;\n\
  this.tab = null;\n\
  this.selected = false;\n\
}\n\
\n\
/**\n\
 * Associate the panel with `tab`\n\
 *\n\
 * @api private\n\
 * @param {Tab} tab\n\
 * @return {Pabel} for chaining\n\
 */\n\
\n\
Panel.prototype.setTab = function (tab) {\n\
  this.tab = tab;\n\
  aria.labelledBy(this.element, tab.element.id);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Toggle the panel's state\n\
 *\n\
 * @api private\n\
 * @return {Panel} for chaining\n\
 */\n\
\n\
Panel.prototype.toggle = function () {\n\
  if (this.selected) {\n\
    return this.deselect();\n\
  }\n\
\n\
  return this.select();\n\
};\n\
\n\
/**\n\
 * Deselect the panel\n\
 *\n\
 * Emits a \"deselect\" event\n\
 *\n\
 * @api private\n\
 * @return {Panel} for chaining\n\
 */\n\
\n\
Panel.prototype.deselect = function () {\n\
  this.classes.remove(this.accordian.opts.selected);\n\
  this.selected = false;\n\
  aria.hidden(this.element, true);\n\
  return this.accordian.emit('deselect', this);\n\
};\n\
\n\
/**\n\
 * Select the panel\n\
 *\n\
 * Emits a \"select\" event\n\
 *\n\
 * @api private\n\
 * @return {Panel} for chaining\n\
 */\n\
\n\
Panel.prototype.select = function () {\n\
  this.classes.add(this.accordian.opts.selected);\n\
  this.selected = true;\n\
  aria.hidden(this.element, false);\n\
  return this.accordian.emit('select', this);\n\
};\n\
//@ sourceURL=aria-accordian/index.js"
));











require.alias("yields-merge/index.js", "aria-accordian/deps/merge/index.js");
require.alias("yields-merge/index.js", "merge/index.js");

require.alias("component-emitter/index.js", "aria-accordian/deps/emitter/index.js");
require.alias("component-emitter/index.js", "emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-classes/index.js", "aria-accordian/deps/classes/index.js");
require.alias("component-classes/index.js", "classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("stephenmathieson-rndid/index.js", "aria-accordian/deps/rndid/index.js");
require.alias("stephenmathieson-rndid/index.js", "rndid/index.js");

require.alias("stephenmathieson-aria-attributes/index.js", "aria-accordian/deps/aria-attributes/index.js");
require.alias("stephenmathieson-aria-attributes/index.js", "aria-accordian/deps/aria-attributes/index.js");
require.alias("stephenmathieson-aria-attributes/index.js", "aria-attributes/index.js");
require.alias("component-trim/index.js", "stephenmathieson-aria-attributes/deps/trim/index.js");

require.alias("component-bind/index.js", "stephenmathieson-aria-attributes/deps/bind/index.js");

require.alias("component-indexof/index.js", "stephenmathieson-aria-attributes/deps/indexof/index.js");

require.alias("stephenmathieson-rndid/index.js", "stephenmathieson-aria-attributes/deps/rndid/index.js");

require.alias("stephenmathieson-aria-attributes/index.js", "stephenmathieson-aria-attributes/index.js");
require.alias("component-map/index.js", "aria-accordian/deps/map/index.js");
require.alias("component-map/index.js", "map/index.js");
require.alias("component-to-function/index.js", "component-map/deps/to-function/index.js");

require.alias("component-event/index.js", "aria-accordian/deps/event/index.js");
require.alias("component-event/index.js", "event/index.js");

require.alias("stephenmathieson-normalize/index.js", "aria-accordian/deps/normalize/index.js");
require.alias("stephenmathieson-normalize/index.js", "aria-accordian/deps/normalize/index.js");
require.alias("stephenmathieson-normalize/index.js", "normalize/index.js");
require.alias("stephenmathieson-normalize/index.js", "stephenmathieson-normalize/index.js");
require.alias("component-keyname/index.js", "aria-accordian/deps/keyname/index.js");
require.alias("component-keyname/index.js", "keyname/index.js");

require.alias("stephenmathieson-is-focusable/index.js", "aria-accordian/deps/is-focusable/index.js");
require.alias("stephenmathieson-is-focusable/index.js", "aria-accordian/deps/is-focusable/index.js");
require.alias("stephenmathieson-is-focusable/index.js", "is-focusable/index.js");
require.alias("stephenmathieson-is-focusable/index.js", "stephenmathieson-is-focusable/index.js");
require.alias("aria-accordian/index.js", "aria-accordian/index.js");