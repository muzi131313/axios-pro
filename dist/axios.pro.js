(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('core-js/modules/es.date.to-string'), require('core-js/modules/es.object.to-string'), require('core-js/modules/es.promise'), require('core-js/modules/es.promise.finally'), require('core-js/modules/es.regexp.to-string'), require('core-js/modules/es.regexp.exec'), require('core-js/modules/es.string.replace')) :
	typeof define === 'function' && define.amd ? define(['core-js/modules/es.date.to-string', 'core-js/modules/es.object.to-string', 'core-js/modules/es.promise', 'core-js/modules/es.promise.finally', 'core-js/modules/es.regexp.to-string', 'core-js/modules/es.regexp.exec', 'core-js/modules/es.string.replace'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, (global.axios = global.axios || {}, global.axios.pro = factory()));
})(this, (function () { 'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function getDefaultExportFromCjs (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	function getAugmentedNamespace(n) {
	  var f = n.default;
		if (typeof f == "function") {
			var a = function () {
				return f.apply(this, arguments);
			};
			a.prototype = f.prototype;
	  } else a = {};
	  Object.defineProperty(a, '__esModule', {value: true});
		Object.keys(n).forEach(function (k) {
			var d = Object.getOwnPropertyDescriptor(n, k);
			Object.defineProperty(a, k, d.get ? d : {
				enumerable: true,
				get: function () {
					return n[k];
				}
			});
		});
		return a;
	}

	function commonjsRequire(path) {
		throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
	}

	var es6Promise = {exports: {}};

	/*!
	 * @overview es6-promise - a tiny implementation of Promises/A+.
	 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
	 * @license   Licensed under MIT license
	 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
	 * @version   v4.2.8+1e68dce6
	 */

	(function (module, exports) {
		(function (global, factory) {
			module.exports = factory() ;
		}(commonjsGlobal, (function () {
		function objectOrFunction(x) {
		  var type = typeof x;
		  return x !== null && (type === 'object' || type === 'function');
		}

		function isFunction(x) {
		  return typeof x === 'function';
		}



		var _isArray = void 0;
		if (Array.isArray) {
		  _isArray = Array.isArray;
		} else {
		  _isArray = function (x) {
		    return Object.prototype.toString.call(x) === '[object Array]';
		  };
		}

		var isArray = _isArray;

		var len = 0;
		var vertxNext = void 0;
		var customSchedulerFn = void 0;

		var asap = function asap(callback, arg) {
		  queue[len] = callback;
		  queue[len + 1] = arg;
		  len += 2;
		  if (len === 2) {
		    // If len is 2, that means that we need to schedule an async flush.
		    // If additional callbacks are queued before the queue is flushed, they
		    // will be processed by this flush that we are scheduling.
		    if (customSchedulerFn) {
		      customSchedulerFn(flush);
		    } else {
		      scheduleFlush();
		    }
		  }
		};

		function setScheduler(scheduleFn) {
		  customSchedulerFn = scheduleFn;
		}

		function setAsap(asapFn) {
		  asap = asapFn;
		}

		var browserWindow = typeof window !== 'undefined' ? window : undefined;
		var browserGlobal = browserWindow || {};
		var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
		var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

		// test for web worker but not in IE10
		var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

		// node
		function useNextTick() {
		  // node version 0.10.x displays a deprecation warning when nextTick is used recursively
		  // see https://github.com/cujojs/when/issues/410 for details
		  return function () {
		    return process.nextTick(flush);
		  };
		}

		// vertx
		function useVertxTimer() {
		  if (typeof vertxNext !== 'undefined') {
		    return function () {
		      vertxNext(flush);
		    };
		  }

		  return useSetTimeout();
		}

		function useMutationObserver() {
		  var iterations = 0;
		  var observer = new BrowserMutationObserver(flush);
		  var node = document.createTextNode('');
		  observer.observe(node, { characterData: true });

		  return function () {
		    node.data = iterations = ++iterations % 2;
		  };
		}

		// web worker
		function useMessageChannel() {
		  var channel = new MessageChannel();
		  channel.port1.onmessage = flush;
		  return function () {
		    return channel.port2.postMessage(0);
		  };
		}

		function useSetTimeout() {
		  // Store setTimeout reference so es6-promise will be unaffected by
		  // other code modifying setTimeout (like sinon.useFakeTimers())
		  var globalSetTimeout = setTimeout;
		  return function () {
		    return globalSetTimeout(flush, 1);
		  };
		}

		var queue = new Array(1000);
		function flush() {
		  for (var i = 0; i < len; i += 2) {
		    var callback = queue[i];
		    var arg = queue[i + 1];

		    callback(arg);

		    queue[i] = undefined;
		    queue[i + 1] = undefined;
		  }

		  len = 0;
		}

		function attemptVertx() {
		  try {
		    var vertx = Function('return this')().require('vertx');
		    vertxNext = vertx.runOnLoop || vertx.runOnContext;
		    return useVertxTimer();
		  } catch (e) {
		    return useSetTimeout();
		  }
		}

		var scheduleFlush = void 0;
		// Decide what async method to use to triggering processing of queued callbacks:
		if (isNode) {
		  scheduleFlush = useNextTick();
		} else if (BrowserMutationObserver) {
		  scheduleFlush = useMutationObserver();
		} else if (isWorker) {
		  scheduleFlush = useMessageChannel();
		} else if (browserWindow === undefined && typeof commonjsRequire === 'function') {
		  scheduleFlush = attemptVertx();
		} else {
		  scheduleFlush = useSetTimeout();
		}

		function then(onFulfillment, onRejection) {
		  var parent = this;

		  var child = new this.constructor(noop);

		  if (child[PROMISE_ID] === undefined) {
		    makePromise(child);
		  }

		  var _state = parent._state;


		  if (_state) {
		    var callback = arguments[_state - 1];
		    asap(function () {
		      return invokeCallback(_state, child, callback, parent._result);
		    });
		  } else {
		    subscribe(parent, child, onFulfillment, onRejection);
		  }

		  return child;
		}

		/**
		  `Promise.resolve` returns a promise that will become resolved with the
		  passed `value`. It is shorthand for the following:

		  ```javascript
		  let promise = new Promise(function(resolve, reject){
		    resolve(1);
		  });

		  promise.then(function(value){
		    // value === 1
		  });
		  ```

		  Instead of writing the above, your code now simply becomes the following:

		  ```javascript
		  let promise = Promise.resolve(1);

		  promise.then(function(value){
		    // value === 1
		  });
		  ```

		  @method resolve
		  @static
		  @param {Any} value value that the returned promise will be resolved with
		  Useful for tooling.
		  @return {Promise} a promise that will become fulfilled with the given
		  `value`
		*/
		function resolve$1(object) {
		  /*jshint validthis:true */
		  var Constructor = this;

		  if (object && typeof object === 'object' && object.constructor === Constructor) {
		    return object;
		  }

		  var promise = new Constructor(noop);
		  resolve(promise, object);
		  return promise;
		}

		var PROMISE_ID = Math.random().toString(36).substring(2);

		function noop() {}

		var PENDING = void 0;
		var FULFILLED = 1;
		var REJECTED = 2;

		function selfFulfillment() {
		  return new TypeError("You cannot resolve a promise with itself");
		}

		function cannotReturnOwn() {
		  return new TypeError('A promises callback cannot return that same promise.');
		}

		function tryThen(then$$1, value, fulfillmentHandler, rejectionHandler) {
		  try {
		    then$$1.call(value, fulfillmentHandler, rejectionHandler);
		  } catch (e) {
		    return e;
		  }
		}

		function handleForeignThenable(promise, thenable, then$$1) {
		  asap(function (promise) {
		    var sealed = false;
		    var error = tryThen(then$$1, thenable, function (value) {
		      if (sealed) {
		        return;
		      }
		      sealed = true;
		      if (thenable !== value) {
		        resolve(promise, value);
		      } else {
		        fulfill(promise, value);
		      }
		    }, function (reason) {
		      if (sealed) {
		        return;
		      }
		      sealed = true;

		      reject(promise, reason);
		    }, 'Settle: ' + (promise._label || ' unknown promise'));

		    if (!sealed && error) {
		      sealed = true;
		      reject(promise, error);
		    }
		  }, promise);
		}

		function handleOwnThenable(promise, thenable) {
		  if (thenable._state === FULFILLED) {
		    fulfill(promise, thenable._result);
		  } else if (thenable._state === REJECTED) {
		    reject(promise, thenable._result);
		  } else {
		    subscribe(thenable, undefined, function (value) {
		      return resolve(promise, value);
		    }, function (reason) {
		      return reject(promise, reason);
		    });
		  }
		}

		function handleMaybeThenable(promise, maybeThenable, then$$1) {
		  if (maybeThenable.constructor === promise.constructor && then$$1 === then && maybeThenable.constructor.resolve === resolve$1) {
		    handleOwnThenable(promise, maybeThenable);
		  } else {
		    if (then$$1 === undefined) {
		      fulfill(promise, maybeThenable);
		    } else if (isFunction(then$$1)) {
		      handleForeignThenable(promise, maybeThenable, then$$1);
		    } else {
		      fulfill(promise, maybeThenable);
		    }
		  }
		}

		function resolve(promise, value) {
		  if (promise === value) {
		    reject(promise, selfFulfillment());
		  } else if (objectOrFunction(value)) {
		    var then$$1 = void 0;
		    try {
		      then$$1 = value.then;
		    } catch (error) {
		      reject(promise, error);
		      return;
		    }
		    handleMaybeThenable(promise, value, then$$1);
		  } else {
		    fulfill(promise, value);
		  }
		}

		function publishRejection(promise) {
		  if (promise._onerror) {
		    promise._onerror(promise._result);
		  }

		  publish(promise);
		}

		function fulfill(promise, value) {
		  if (promise._state !== PENDING) {
		    return;
		  }

		  promise._result = value;
		  promise._state = FULFILLED;

		  if (promise._subscribers.length !== 0) {
		    asap(publish, promise);
		  }
		}

		function reject(promise, reason) {
		  if (promise._state !== PENDING) {
		    return;
		  }
		  promise._state = REJECTED;
		  promise._result = reason;

		  asap(publishRejection, promise);
		}

		function subscribe(parent, child, onFulfillment, onRejection) {
		  var _subscribers = parent._subscribers;
		  var length = _subscribers.length;


		  parent._onerror = null;

		  _subscribers[length] = child;
		  _subscribers[length + FULFILLED] = onFulfillment;
		  _subscribers[length + REJECTED] = onRejection;

		  if (length === 0 && parent._state) {
		    asap(publish, parent);
		  }
		}

		function publish(promise) {
		  var subscribers = promise._subscribers;
		  var settled = promise._state;

		  if (subscribers.length === 0) {
		    return;
		  }

		  var child = void 0,
		      callback = void 0,
		      detail = promise._result;

		  for (var i = 0; i < subscribers.length; i += 3) {
		    child = subscribers[i];
		    callback = subscribers[i + settled];

		    if (child) {
		      invokeCallback(settled, child, callback, detail);
		    } else {
		      callback(detail);
		    }
		  }

		  promise._subscribers.length = 0;
		}

		function invokeCallback(settled, promise, callback, detail) {
		  var hasCallback = isFunction(callback),
		      value = void 0,
		      error = void 0,
		      succeeded = true;

		  if (hasCallback) {
		    try {
		      value = callback(detail);
		    } catch (e) {
		      succeeded = false;
		      error = e;
		    }

		    if (promise === value) {
		      reject(promise, cannotReturnOwn());
		      return;
		    }
		  } else {
		    value = detail;
		  }

		  if (promise._state !== PENDING) ; else if (hasCallback && succeeded) {
		    resolve(promise, value);
		  } else if (succeeded === false) {
		    reject(promise, error);
		  } else if (settled === FULFILLED) {
		    fulfill(promise, value);
		  } else if (settled === REJECTED) {
		    reject(promise, value);
		  }
		}

		function initializePromise(promise, resolver) {
		  try {
		    resolver(function resolvePromise(value) {
		      resolve(promise, value);
		    }, function rejectPromise(reason) {
		      reject(promise, reason);
		    });
		  } catch (e) {
		    reject(promise, e);
		  }
		}

		var id = 0;
		function nextId() {
		  return id++;
		}

		function makePromise(promise) {
		  promise[PROMISE_ID] = id++;
		  promise._state = undefined;
		  promise._result = undefined;
		  promise._subscribers = [];
		}

		function validationError() {
		  return new Error('Array Methods must be provided an Array');
		}

		var Enumerator = function () {
		  function Enumerator(Constructor, input) {
		    this._instanceConstructor = Constructor;
		    this.promise = new Constructor(noop);

		    if (!this.promise[PROMISE_ID]) {
		      makePromise(this.promise);
		    }

		    if (isArray(input)) {
		      this.length = input.length;
		      this._remaining = input.length;

		      this._result = new Array(this.length);

		      if (this.length === 0) {
		        fulfill(this.promise, this._result);
		      } else {
		        this.length = this.length || 0;
		        this._enumerate(input);
		        if (this._remaining === 0) {
		          fulfill(this.promise, this._result);
		        }
		      }
		    } else {
		      reject(this.promise, validationError());
		    }
		  }

		  Enumerator.prototype._enumerate = function _enumerate(input) {
		    for (var i = 0; this._state === PENDING && i < input.length; i++) {
		      this._eachEntry(input[i], i);
		    }
		  };

		  Enumerator.prototype._eachEntry = function _eachEntry(entry, i) {
		    var c = this._instanceConstructor;
		    var resolve$$1 = c.resolve;


		    if (resolve$$1 === resolve$1) {
		      var _then = void 0;
		      var error = void 0;
		      var didError = false;
		      try {
		        _then = entry.then;
		      } catch (e) {
		        didError = true;
		        error = e;
		      }

		      if (_then === then && entry._state !== PENDING) {
		        this._settledAt(entry._state, i, entry._result);
		      } else if (typeof _then !== 'function') {
		        this._remaining--;
		        this._result[i] = entry;
		      } else if (c === Promise$1) {
		        var promise = new c(noop);
		        if (didError) {
		          reject(promise, error);
		        } else {
		          handleMaybeThenable(promise, entry, _then);
		        }
		        this._willSettleAt(promise, i);
		      } else {
		        this._willSettleAt(new c(function (resolve$$1) {
		          return resolve$$1(entry);
		        }), i);
		      }
		    } else {
		      this._willSettleAt(resolve$$1(entry), i);
		    }
		  };

		  Enumerator.prototype._settledAt = function _settledAt(state, i, value) {
		    var promise = this.promise;


		    if (promise._state === PENDING) {
		      this._remaining--;

		      if (state === REJECTED) {
		        reject(promise, value);
		      } else {
		        this._result[i] = value;
		      }
		    }

		    if (this._remaining === 0) {
		      fulfill(promise, this._result);
		    }
		  };

		  Enumerator.prototype._willSettleAt = function _willSettleAt(promise, i) {
		    var enumerator = this;

		    subscribe(promise, undefined, function (value) {
		      return enumerator._settledAt(FULFILLED, i, value);
		    }, function (reason) {
		      return enumerator._settledAt(REJECTED, i, reason);
		    });
		  };

		  return Enumerator;
		}();

		/**
		  `Promise.all` accepts an array of promises, and returns a new promise which
		  is fulfilled with an array of fulfillment values for the passed promises, or
		  rejected with the reason of the first passed promise to be rejected. It casts all
		  elements of the passed iterable to promises as it runs this algorithm.

		  Example:

		  ```javascript
		  let promise1 = resolve(1);
		  let promise2 = resolve(2);
		  let promise3 = resolve(3);
		  let promises = [ promise1, promise2, promise3 ];

		  Promise.all(promises).then(function(array){
		    // The array here would be [ 1, 2, 3 ];
		  });
		  ```

		  If any of the `promises` given to `all` are rejected, the first promise
		  that is rejected will be given as an argument to the returned promises's
		  rejection handler. For example:

		  Example:

		  ```javascript
		  let promise1 = resolve(1);
		  let promise2 = reject(new Error("2"));
		  let promise3 = reject(new Error("3"));
		  let promises = [ promise1, promise2, promise3 ];

		  Promise.all(promises).then(function(array){
		    // Code here never runs because there are rejected promises!
		  }, function(error) {
		    // error.message === "2"
		  });
		  ```

		  @method all
		  @static
		  @param {Array} entries array of promises
		  @param {String} label optional string for labeling the promise.
		  Useful for tooling.
		  @return {Promise} promise that is fulfilled when all `promises` have been
		  fulfilled, or rejected if any of them become rejected.
		  @static
		*/
		function all(entries) {
		  return new Enumerator(this, entries).promise;
		}

		/**
		  `Promise.race` returns a new promise which is settled in the same way as the
		  first passed promise to settle.

		  Example:

		  ```javascript
		  let promise1 = new Promise(function(resolve, reject){
		    setTimeout(function(){
		      resolve('promise 1');
		    }, 200);
		  });

		  let promise2 = new Promise(function(resolve, reject){
		    setTimeout(function(){
		      resolve('promise 2');
		    }, 100);
		  });

		  Promise.race([promise1, promise2]).then(function(result){
		    // result === 'promise 2' because it was resolved before promise1
		    // was resolved.
		  });
		  ```

		  `Promise.race` is deterministic in that only the state of the first
		  settled promise matters. For example, even if other promises given to the
		  `promises` array argument are resolved, but the first settled promise has
		  become rejected before the other promises became fulfilled, the returned
		  promise will become rejected:

		  ```javascript
		  let promise1 = new Promise(function(resolve, reject){
		    setTimeout(function(){
		      resolve('promise 1');
		    }, 200);
		  });

		  let promise2 = new Promise(function(resolve, reject){
		    setTimeout(function(){
		      reject(new Error('promise 2'));
		    }, 100);
		  });

		  Promise.race([promise1, promise2]).then(function(result){
		    // Code here never runs
		  }, function(reason){
		    // reason.message === 'promise 2' because promise 2 became rejected before
		    // promise 1 became fulfilled
		  });
		  ```

		  An example real-world use case is implementing timeouts:

		  ```javascript
		  Promise.race([ajax('foo.json'), timeout(5000)])
		  ```

		  @method race
		  @static
		  @param {Array} promises array of promises to observe
		  Useful for tooling.
		  @return {Promise} a promise which settles in the same way as the first passed
		  promise to settle.
		*/
		function race(entries) {
		  /*jshint validthis:true */
		  var Constructor = this;

		  if (!isArray(entries)) {
		    return new Constructor(function (_, reject) {
		      return reject(new TypeError('You must pass an array to race.'));
		    });
		  } else {
		    return new Constructor(function (resolve, reject) {
		      var length = entries.length;
		      for (var i = 0; i < length; i++) {
		        Constructor.resolve(entries[i]).then(resolve, reject);
		      }
		    });
		  }
		}

		/**
		  `Promise.reject` returns a promise rejected with the passed `reason`.
		  It is shorthand for the following:

		  ```javascript
		  let promise = new Promise(function(resolve, reject){
		    reject(new Error('WHOOPS'));
		  });

		  promise.then(function(value){
		    // Code here doesn't run because the promise is rejected!
		  }, function(reason){
		    // reason.message === 'WHOOPS'
		  });
		  ```

		  Instead of writing the above, your code now simply becomes the following:

		  ```javascript
		  let promise = Promise.reject(new Error('WHOOPS'));

		  promise.then(function(value){
		    // Code here doesn't run because the promise is rejected!
		  }, function(reason){
		    // reason.message === 'WHOOPS'
		  });
		  ```

		  @method reject
		  @static
		  @param {Any} reason value that the returned promise will be rejected with.
		  Useful for tooling.
		  @return {Promise} a promise rejected with the given `reason`.
		*/
		function reject$1(reason) {
		  /*jshint validthis:true */
		  var Constructor = this;
		  var promise = new Constructor(noop);
		  reject(promise, reason);
		  return promise;
		}

		function needsResolver() {
		  throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
		}

		function needsNew() {
		  throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
		}

		/**
		  Promise objects represent the eventual result of an asynchronous operation. The
		  primary way of interacting with a promise is through its `then` method, which
		  registers callbacks to receive either a promise's eventual value or the reason
		  why the promise cannot be fulfilled.

		  Terminology
		  -----------

		  - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
		  - `thenable` is an object or function that defines a `then` method.
		  - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
		  - `exception` is a value that is thrown using the throw statement.
		  - `reason` is a value that indicates why a promise was rejected.
		  - `settled` the final resting state of a promise, fulfilled or rejected.

		  A promise can be in one of three states: pending, fulfilled, or rejected.

		  Promises that are fulfilled have a fulfillment value and are in the fulfilled
		  state.  Promises that are rejected have a rejection reason and are in the
		  rejected state.  A fulfillment value is never a thenable.

		  Promises can also be said to *resolve* a value.  If this value is also a
		  promise, then the original promise's settled state will match the value's
		  settled state.  So a promise that *resolves* a promise that rejects will
		  itself reject, and a promise that *resolves* a promise that fulfills will
		  itself fulfill.


		  Basic Usage:
		  ------------

		  ```js
		  let promise = new Promise(function(resolve, reject) {
		    // on success
		    resolve(value);

		    // on failure
		    reject(reason);
		  });

		  promise.then(function(value) {
		    // on fulfillment
		  }, function(reason) {
		    // on rejection
		  });
		  ```

		  Advanced Usage:
		  ---------------

		  Promises shine when abstracting away asynchronous interactions such as
		  `XMLHttpRequest`s.

		  ```js
		  function getJSON(url) {
		    return new Promise(function(resolve, reject){
		      let xhr = new XMLHttpRequest();

		      xhr.open('GET', url);
		      xhr.onreadystatechange = handler;
		      xhr.responseType = 'json';
		      xhr.setRequestHeader('Accept', 'application/json');
		      xhr.send();

		      function handler() {
		        if (this.readyState === this.DONE) {
		          if (this.status === 200) {
		            resolve(this.response);
		          } else {
		            reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
		          }
		        }
		      };
		    });
		  }

		  getJSON('/posts.json').then(function(json) {
		    // on fulfillment
		  }, function(reason) {
		    // on rejection
		  });
		  ```

		  Unlike callbacks, promises are great composable primitives.

		  ```js
		  Promise.all([
		    getJSON('/posts'),
		    getJSON('/comments')
		  ]).then(function(values){
		    values[0] // => postsJSON
		    values[1] // => commentsJSON

		    return values;
		  });
		  ```

		  @class Promise
		  @param {Function} resolver
		  Useful for tooling.
		  @constructor
		*/

		var Promise$1 = function () {
		  function Promise(resolver) {
		    this[PROMISE_ID] = nextId();
		    this._result = this._state = undefined;
		    this._subscribers = [];

		    if (noop !== resolver) {
		      typeof resolver !== 'function' && needsResolver();
		      this instanceof Promise ? initializePromise(this, resolver) : needsNew();
		    }
		  }

		  /**
		  The primary way of interacting with a promise is through its `then` method,
		  which registers callbacks to receive either a promise's eventual value or the
		  reason why the promise cannot be fulfilled.
		   ```js
		  findUser().then(function(user){
		    // user is available
		  }, function(reason){
		    // user is unavailable, and you are given the reason why
		  });
		  ```
		   Chaining
		  --------
		   The return value of `then` is itself a promise.  This second, 'downstream'
		  promise is resolved with the return value of the first promise's fulfillment
		  or rejection handler, or rejected if the handler throws an exception.
		   ```js
		  findUser().then(function (user) {
		    return user.name;
		  }, function (reason) {
		    return 'default name';
		  }).then(function (userName) {
		    // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
		    // will be `'default name'`
		  });
		   findUser().then(function (user) {
		    throw new Error('Found user, but still unhappy');
		  }, function (reason) {
		    throw new Error('`findUser` rejected and we're unhappy');
		  }).then(function (value) {
		    // never reached
		  }, function (reason) {
		    // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
		    // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
		  });
		  ```
		  If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
		   ```js
		  findUser().then(function (user) {
		    throw new PedagogicalException('Upstream error');
		  }).then(function (value) {
		    // never reached
		  }).then(function (value) {
		    // never reached
		  }, function (reason) {
		    // The `PedgagocialException` is propagated all the way down to here
		  });
		  ```
		   Assimilation
		  ------------
		   Sometimes the value you want to propagate to a downstream promise can only be
		  retrieved asynchronously. This can be achieved by returning a promise in the
		  fulfillment or rejection handler. The downstream promise will then be pending
		  until the returned promise is settled. This is called *assimilation*.
		   ```js
		  findUser().then(function (user) {
		    return findCommentsByAuthor(user);
		  }).then(function (comments) {
		    // The user's comments are now available
		  });
		  ```
		   If the assimliated promise rejects, then the downstream promise will also reject.
		   ```js
		  findUser().then(function (user) {
		    return findCommentsByAuthor(user);
		  }).then(function (comments) {
		    // If `findCommentsByAuthor` fulfills, we'll have the value here
		  }, function (reason) {
		    // If `findCommentsByAuthor` rejects, we'll have the reason here
		  });
		  ```
		   Simple Example
		  --------------
		   Synchronous Example
		   ```javascript
		  let result;
		   try {
		    result = findResult();
		    // success
		  } catch(reason) {
		    // failure
		  }
		  ```
		   Errback Example
		   ```js
		  findResult(function(result, err){
		    if (err) {
		      // failure
		    } else {
		      // success
		    }
		  });
		  ```
		   Promise Example;
		   ```javascript
		  findResult().then(function(result){
		    // success
		  }, function(reason){
		    // failure
		  });
		  ```
		   Advanced Example
		  --------------
		   Synchronous Example
		   ```javascript
		  let author, books;
		   try {
		    author = findAuthor();
		    books  = findBooksByAuthor(author);
		    // success
		  } catch(reason) {
		    // failure
		  }
		  ```
		   Errback Example
		   ```js
		   function foundBooks(books) {
		   }
		   function failure(reason) {
		   }
		   findAuthor(function(author, err){
		    if (err) {
		      failure(err);
		      // failure
		    } else {
		      try {
		        findBoooksByAuthor(author, function(books, err) {
		          if (err) {
		            failure(err);
		          } else {
		            try {
		              foundBooks(books);
		            } catch(reason) {
		              failure(reason);
		            }
		          }
		        });
		      } catch(error) {
		        failure(err);
		      }
		      // success
		    }
		  });
		  ```
		   Promise Example;
		   ```javascript
		  findAuthor().
		    then(findBooksByAuthor).
		    then(function(books){
		      // found books
		  }).catch(function(reason){
		    // something went wrong
		  });
		  ```
		   @method then
		  @param {Function} onFulfilled
		  @param {Function} onRejected
		  Useful for tooling.
		  @return {Promise}
		  */

		  /**
		  `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
		  as the catch block of a try/catch statement.
		  ```js
		  function findAuthor(){
		  throw new Error('couldn't find that author');
		  }
		  // synchronous
		  try {
		  findAuthor();
		  } catch(reason) {
		  // something went wrong
		  }
		  // async with promises
		  findAuthor().catch(function(reason){
		  // something went wrong
		  });
		  ```
		  @method catch
		  @param {Function} onRejection
		  Useful for tooling.
		  @return {Promise}
		  */


		  Promise.prototype.catch = function _catch(onRejection) {
		    return this.then(null, onRejection);
		  };

		  /**
		    `finally` will be invoked regardless of the promise's fate just as native
		    try/catch/finally behaves
		  
		    Synchronous example:
		  
		    ```js
		    findAuthor() {
		      if (Math.random() > 0.5) {
		        throw new Error();
		      }
		      return new Author();
		    }
		  
		    try {
		      return findAuthor(); // succeed or fail
		    } catch(error) {
		      return findOtherAuther();
		    } finally {
		      // always runs
		      // doesn't affect the return value
		    }
		    ```
		  
		    Asynchronous example:
		  
		    ```js
		    findAuthor().catch(function(reason){
		      return findOtherAuther();
		    }).finally(function(){
		      // author was either found, or not
		    });
		    ```
		  
		    @method finally
		    @param {Function} callback
		    @return {Promise}
		  */


		  Promise.prototype.finally = function _finally(callback) {
		    var promise = this;
		    var constructor = promise.constructor;

		    if (isFunction(callback)) {
		      return promise.then(function (value) {
		        return constructor.resolve(callback()).then(function () {
		          return value;
		        });
		      }, function (reason) {
		        return constructor.resolve(callback()).then(function () {
		          throw reason;
		        });
		      });
		    }

		    return promise.then(callback, callback);
		  };

		  return Promise;
		}();

		Promise$1.prototype.then = then;
		Promise$1.all = all;
		Promise$1.race = race;
		Promise$1.resolve = resolve$1;
		Promise$1.reject = reject$1;
		Promise$1._setScheduler = setScheduler;
		Promise$1._setAsap = setAsap;
		Promise$1._asap = asap;

		/*global self*/
		function polyfill() {
		  var local = void 0;

		  if (typeof commonjsGlobal !== 'undefined') {
		    local = commonjsGlobal;
		  } else if (typeof self !== 'undefined') {
		    local = self;
		  } else {
		    try {
		      local = Function('return this')();
		    } catch (e) {
		      throw new Error('polyfill failed because global object is unavailable in this environment');
		    }
		  }

		  var P = local.Promise;

		  if (P) {
		    var promiseToString = null;
		    try {
		      promiseToString = Object.prototype.toString.call(P.resolve());
		    } catch (e) {
		      // silently ignored
		    }

		    if (promiseToString === '[object Promise]' && !P.cast) {
		      return;
		    }
		  }

		  local.Promise = Promise$1;
		}

		// Strange compat..
		Promise$1.polyfill = polyfill;
		Promise$1.Promise = Promise$1;

		return Promise$1;

		})));



		
	} (es6Promise));

	/* eslint no-invalid-this: 1 */

	var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
	var slice$5 = Array.prototype.slice;
	var toStr$2 = Object.prototype.toString;
	var funcType = '[object Function]';

	var implementation$5 = function bind(that) {
	    var target = this;
	    if (typeof target !== 'function' || toStr$2.call(target) !== funcType) {
	        throw new TypeError(ERROR_MESSAGE + target);
	    }
	    var args = slice$5.call(arguments, 1);

	    var bound;
	    var binder = function () {
	        if (this instanceof bound) {
	            var result = target.apply(
	                this,
	                args.concat(slice$5.call(arguments))
	            );
	            if (Object(result) === result) {
	                return result;
	            }
	            return this;
	        } else {
	            return target.apply(
	                that,
	                args.concat(slice$5.call(arguments))
	            );
	        }
	    };

	    var boundLength = Math.max(0, target.length - args.length);
	    var boundArgs = [];
	    for (var i = 0; i < boundLength; i++) {
	        boundArgs.push('$' + i);
	    }

	    bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this,arguments); }')(binder);

	    if (target.prototype) {
	        var Empty = function Empty() {};
	        Empty.prototype = target.prototype;
	        bound.prototype = new Empty();
	        Empty.prototype = null;
	    }

	    return bound;
	};

	var implementation$4 = implementation$5;

	var functionBind = Function.prototype.bind || implementation$4;

	var toStr$1 = Object.prototype.toString;

	var isArguments = function isArguments(value) {
		var str = toStr$1.call(value);
		var isArgs = str === '[object Arguments]';
		if (!isArgs) {
			isArgs = str !== '[object Array]' &&
				value !== null &&
				typeof value === 'object' &&
				typeof value.length === 'number' &&
				value.length >= 0 &&
				toStr$1.call(value.callee) === '[object Function]';
		}
		return isArgs;
	};

	var implementation$3;
	var hasRequiredImplementation;

	function requireImplementation () {
		if (hasRequiredImplementation) return implementation$3;
		hasRequiredImplementation = 1;

		var keysShim;
		if (!Object.keys) {
			// modified from https://github.com/es-shims/es5-shim
			var has = Object.prototype.hasOwnProperty;
			var toStr = Object.prototype.toString;
			var isArgs = isArguments; // eslint-disable-line global-require
			var isEnumerable = Object.prototype.propertyIsEnumerable;
			var hasDontEnumBug = !isEnumerable.call({ toString: null }, 'toString');
			var hasProtoEnumBug = isEnumerable.call(function () {}, 'prototype');
			var dontEnums = [
				'toString',
				'toLocaleString',
				'valueOf',
				'hasOwnProperty',
				'isPrototypeOf',
				'propertyIsEnumerable',
				'constructor'
			];
			var equalsConstructorPrototype = function (o) {
				var ctor = o.constructor;
				return ctor && ctor.prototype === o;
			};
			var excludedKeys = {
				$applicationCache: true,
				$console: true,
				$external: true,
				$frame: true,
				$frameElement: true,
				$frames: true,
				$innerHeight: true,
				$innerWidth: true,
				$onmozfullscreenchange: true,
				$onmozfullscreenerror: true,
				$outerHeight: true,
				$outerWidth: true,
				$pageXOffset: true,
				$pageYOffset: true,
				$parent: true,
				$scrollLeft: true,
				$scrollTop: true,
				$scrollX: true,
				$scrollY: true,
				$self: true,
				$webkitIndexedDB: true,
				$webkitStorageInfo: true,
				$window: true
			};
			var hasAutomationEqualityBug = (function () {
				/* global window */
				if (typeof window === 'undefined') { return false; }
				for (var k in window) {
					try {
						if (!excludedKeys['$' + k] && has.call(window, k) && window[k] !== null && typeof window[k] === 'object') {
							try {
								equalsConstructorPrototype(window[k]);
							} catch (e) {
								return true;
							}
						}
					} catch (e) {
						return true;
					}
				}
				return false;
			}());
			var equalsConstructorPrototypeIfNotBuggy = function (o) {
				/* global window */
				if (typeof window === 'undefined' || !hasAutomationEqualityBug) {
					return equalsConstructorPrototype(o);
				}
				try {
					return equalsConstructorPrototype(o);
				} catch (e) {
					return false;
				}
			};

			keysShim = function keys(object) {
				var isObject = object !== null && typeof object === 'object';
				var isFunction = toStr.call(object) === '[object Function]';
				var isArguments = isArgs(object);
				var isString = isObject && toStr.call(object) === '[object String]';
				var theKeys = [];

				if (!isObject && !isFunction && !isArguments) {
					throw new TypeError('Object.keys called on a non-object');
				}

				var skipProto = hasProtoEnumBug && isFunction;
				if (isString && object.length > 0 && !has.call(object, 0)) {
					for (var i = 0; i < object.length; ++i) {
						theKeys.push(String(i));
					}
				}

				if (isArguments && object.length > 0) {
					for (var j = 0; j < object.length; ++j) {
						theKeys.push(String(j));
					}
				} else {
					for (var name in object) {
						if (!(skipProto && name === 'prototype') && has.call(object, name)) {
							theKeys.push(String(name));
						}
					}
				}

				if (hasDontEnumBug) {
					var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);

					for (var k = 0; k < dontEnums.length; ++k) {
						if (!(skipConstructor && dontEnums[k] === 'constructor') && has.call(object, dontEnums[k])) {
							theKeys.push(dontEnums[k]);
						}
					}
				}
				return theKeys;
			};
		}
		implementation$3 = keysShim;
		return implementation$3;
	}

	var slice$4 = Array.prototype.slice;
	var isArgs = isArguments;

	var origKeys = Object.keys;
	var keysShim = origKeys ? function keys(o) { return origKeys(o); } : requireImplementation();

	var originalKeys = Object.keys;

	keysShim.shim = function shimObjectKeys() {
		if (Object.keys) {
			var keysWorksWithArguments = (function () {
				// Safari 5.0 bug
				var args = Object.keys(arguments);
				return args && args.length === arguments.length;
			}(1, 2));
			if (!keysWorksWithArguments) {
				Object.keys = function keys(object) { // eslint-disable-line func-name-matching
					if (isArgs(object)) {
						return originalKeys(slice$4.call(object));
					}
					return originalKeys(object);
				};
			}
		} else {
			Object.keys = keysShim;
		}
		return Object.keys || keysShim;
	};

	var objectKeys$3 = keysShim;

	var keys$4 = objectKeys$3;
	var hasSymbols$1 = typeof Symbol === 'function' && typeof Symbol('foo') === 'symbol';

	var toStr = Object.prototype.toString;
	var concat = Array.prototype.concat;
	var origDefineProperty = Object.defineProperty;

	var isFunction$1 = function (fn) {
		return typeof fn === 'function' && toStr.call(fn) === '[object Function]';
	};

	var arePropertyDescriptorsSupported = function () {
		var obj = {};
		try {
			origDefineProperty(obj, 'x', { enumerable: false, value: obj });
			// eslint-disable-next-line no-unused-vars, no-restricted-syntax
			for (var _ in obj) { // jscs:ignore disallowUnusedVariables
				return false;
			}
			return obj.x === obj;
		} catch (e) { /* this is IE 8. */
			return false;
		}
	};
	var supportsDescriptors = origDefineProperty && arePropertyDescriptorsSupported();

	var defineProperty$2 = function (object, name, value, predicate) {
		if (name in object && (!isFunction$1(predicate) || !predicate())) {
			return;
		}
		if (supportsDescriptors) {
			origDefineProperty(object, name, {
				configurable: true,
				enumerable: false,
				value: value,
				writable: true
			});
		} else {
			object[name] = value;
		}
	};

	var defineProperties$1 = function (object, map) {
		var predicates = arguments.length > 2 ? arguments[2] : {};
		var props = keys$4(map);
		if (hasSymbols$1) {
			props = concat.call(props, Object.getOwnPropertySymbols(map));
		}
		for (var i = 0; i < props.length; i += 1) {
			defineProperty$2(object, props[i], map[props[i]], predicates[props[i]]);
		}
	};

	defineProperties$1.supportsDescriptors = !!supportsDescriptors;

	var defineProperties_1 = defineProperties$1;

	var requirePromise$3 = function requirePromise() {
		if (typeof Promise !== 'function') {
			throw new TypeError('`Promise.prototype.finally` requires a global `Promise` be available.');
		}
	};

	var es7 = {exports: {}};

	var src$1;
	var hasRequiredSrc;

	function requireSrc () {
		if (hasRequiredSrc) return src$1;
		hasRequiredSrc = 1;

		var bind = functionBind;

		src$1 = bind.call(Function.call, Object.prototype.hasOwnProperty);
		return src$1;
	}

	var es6 = {exports: {}};

	var isPrimitive$1;
	var hasRequiredIsPrimitive$1;

	function requireIsPrimitive$1 () {
		if (hasRequiredIsPrimitive$1) return isPrimitive$1;
		hasRequiredIsPrimitive$1 = 1;
		isPrimitive$1 = function isPrimitive(value) {
			return value === null || (typeof value !== 'function' && typeof value !== 'object');
		};
		return isPrimitive$1;
	}

	var isCallable;
	var hasRequiredIsCallable;

	function requireIsCallable () {
		if (hasRequiredIsCallable) return isCallable;
		hasRequiredIsCallable = 1;

		var fnToStr = Function.prototype.toString;

		var constructorRegex = /^\s*class\b/;
		var isES6ClassFn = function isES6ClassFunction(value) {
			try {
				var fnStr = fnToStr.call(value);
				return constructorRegex.test(fnStr);
			} catch (e) {
				return false; // not a function
			}
		};

		var tryFunctionObject = function tryFunctionToStr(value) {
			try {
				if (isES6ClassFn(value)) { return false; }
				fnToStr.call(value);
				return true;
			} catch (e) {
				return false;
			}
		};
		var toStr = Object.prototype.toString;
		var fnClass = '[object Function]';
		var genClass = '[object GeneratorFunction]';
		var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

		isCallable = function isCallable(value) {
			if (!value) { return false; }
			if (typeof value !== 'function' && typeof value !== 'object') { return false; }
			if (typeof value === 'function' && !value.prototype) { return true; }
			if (hasToStringTag) { return tryFunctionObject(value); }
			if (isES6ClassFn(value)) { return false; }
			var strClass = toStr.call(value);
			return strClass === fnClass || strClass === genClass;
		};
		return isCallable;
	}

	var isDateObject;
	var hasRequiredIsDateObject;

	function requireIsDateObject () {
		if (hasRequiredIsDateObject) return isDateObject;
		hasRequiredIsDateObject = 1;

		var getDay = Date.prototype.getDay;
		var tryDateObject = function tryDateObject(value) {
			try {
				getDay.call(value);
				return true;
			} catch (e) {
				return false;
			}
		};

		var toStr = Object.prototype.toString;
		var dateClass = '[object Date]';
		var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

		isDateObject = function isDateObject(value) {
			if (typeof value !== 'object' || value === null) { return false; }
			return hasToStringTag ? tryDateObject(value) : toStr.call(value) === dateClass;
		};
		return isDateObject;
	}

	var isSymbol = {exports: {}};

	var shams;
	var hasRequiredShams;

	function requireShams () {
		if (hasRequiredShams) return shams;
		hasRequiredShams = 1;

		/* eslint complexity: [2, 17], max-statements: [2, 33] */
		shams = function hasSymbols() {
			if (typeof Symbol !== 'function' || typeof Object.getOwnPropertySymbols !== 'function') { return false; }
			if (typeof Symbol.iterator === 'symbol') { return true; }

			var obj = {};
			var sym = Symbol('test');
			var symObj = Object(sym);
			if (typeof sym === 'string') { return false; }

			if (Object.prototype.toString.call(sym) !== '[object Symbol]') { return false; }
			if (Object.prototype.toString.call(symObj) !== '[object Symbol]') { return false; }

			// temp disabled per https://github.com/ljharb/object.assign/issues/17
			// if (sym instanceof Symbol) { return false; }
			// temp disabled per https://github.com/WebReflection/get-own-property-symbols/issues/4
			// if (!(symObj instanceof Symbol)) { return false; }

			// if (typeof Symbol.prototype.toString !== 'function') { return false; }
			// if (String(sym) !== Symbol.prototype.toString.call(sym)) { return false; }

			var symVal = 42;
			obj[sym] = symVal;
			for (sym in obj) { return false; } // eslint-disable-line no-restricted-syntax
			if (typeof Object.keys === 'function' && Object.keys(obj).length !== 0) { return false; }

			if (typeof Object.getOwnPropertyNames === 'function' && Object.getOwnPropertyNames(obj).length !== 0) { return false; }

			var syms = Object.getOwnPropertySymbols(obj);
			if (syms.length !== 1 || syms[0] !== sym) { return false; }

			if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) { return false; }

			if (typeof Object.getOwnPropertyDescriptor === 'function') {
				var descriptor = Object.getOwnPropertyDescriptor(obj, sym);
				if (descriptor.value !== symVal || descriptor.enumerable !== true) { return false; }
			}

			return true;
		};
		return shams;
	}

	var hasSymbols;
	var hasRequiredHasSymbols;

	function requireHasSymbols () {
		if (hasRequiredHasSymbols) return hasSymbols;
		hasRequiredHasSymbols = 1;

		var origSymbol = commonjsGlobal.Symbol;
		var hasSymbolSham = requireShams();

		hasSymbols = function hasNativeSymbols() {
			if (typeof origSymbol !== 'function') { return false; }
			if (typeof Symbol !== 'function') { return false; }
			if (typeof origSymbol('foo') !== 'symbol') { return false; }
			if (typeof Symbol('bar') !== 'symbol') { return false; }

			return hasSymbolSham();
		};
		return hasSymbols;
	}

	var hasRequiredIsSymbol;

	function requireIsSymbol () {
		if (hasRequiredIsSymbol) return isSymbol.exports;
		hasRequiredIsSymbol = 1;

		var toStr = Object.prototype.toString;
		var hasSymbols = requireHasSymbols()();

		if (hasSymbols) {
			var symToStr = Symbol.prototype.toString;
			var symStringRegex = /^Symbol\(.*\)$/;
			var isSymbolObject = function isRealSymbolObject(value) {
				if (typeof value.valueOf() !== 'symbol') {
					return false;
				}
				return symStringRegex.test(symToStr.call(value));
			};

			isSymbol.exports = function isSymbol(value) {
				if (typeof value === 'symbol') {
					return true;
				}
				if (toStr.call(value) !== '[object Symbol]') {
					return false;
				}
				try {
					return isSymbolObject(value);
				} catch (e) {
					return false;
				}
			};
		} else {

			isSymbol.exports = function isSymbol(value) {
				// this environment does not support Symbols.
				return false ;
			};
		}
		return isSymbol.exports;
	}

	var es2015$1;
	var hasRequiredEs2015$1;

	function requireEs2015$1 () {
		if (hasRequiredEs2015$1) return es2015$1;
		hasRequiredEs2015$1 = 1;

		var hasSymbols = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol';

		var isPrimitive = requireIsPrimitive$1();
		var isCallable = requireIsCallable();
		var isDate = requireIsDateObject();
		var isSymbol = requireIsSymbol();

		var ordinaryToPrimitive = function OrdinaryToPrimitive(O, hint) {
			if (typeof O === 'undefined' || O === null) {
				throw new TypeError('Cannot call method on ' + O);
			}
			if (typeof hint !== 'string' || (hint !== 'number' && hint !== 'string')) {
				throw new TypeError('hint must be "string" or "number"');
			}
			var methodNames = hint === 'string' ? ['toString', 'valueOf'] : ['valueOf', 'toString'];
			var method, result, i;
			for (i = 0; i < methodNames.length; ++i) {
				method = O[methodNames[i]];
				if (isCallable(method)) {
					result = method.call(O);
					if (isPrimitive(result)) {
						return result;
					}
				}
			}
			throw new TypeError('No default value');
		};

		var GetMethod = function GetMethod(O, P) {
			var func = O[P];
			if (func !== null && typeof func !== 'undefined') {
				if (!isCallable(func)) {
					throw new TypeError(func + ' returned for property ' + P + ' of object ' + O + ' is not a function');
				}
				return func;
			}
			return void 0;
		};

		// http://www.ecma-international.org/ecma-262/6.0/#sec-toprimitive
		es2015$1 = function ToPrimitive(input) {
			if (isPrimitive(input)) {
				return input;
			}
			var hint = 'default';
			if (arguments.length > 1) {
				if (arguments[1] === String) {
					hint = 'string';
				} else if (arguments[1] === Number) {
					hint = 'number';
				}
			}

			var exoticToPrim;
			if (hasSymbols) {
				if (Symbol.toPrimitive) {
					exoticToPrim = GetMethod(input, Symbol.toPrimitive);
				} else if (isSymbol(input)) {
					exoticToPrim = Symbol.prototype.valueOf;
				}
			}
			if (typeof exoticToPrim !== 'undefined') {
				var result = exoticToPrim.call(input, hint);
				if (isPrimitive(result)) {
					return result;
				}
				throw new TypeError('unable to convert exotic object to primitive');
			}
			if (hint === 'default' && (isDate(input) || isSymbol(input))) {
				hint = 'string';
			}
			return ordinaryToPrimitive(input, hint === 'default' ? 'number' : hint);
		};
		return es2015$1;
	}

	var hasRequiredEs6;

	function requireEs6 () {
		if (hasRequiredEs6) return es6.exports;
		hasRequiredEs6 = 1;
		(function (module) {

			module.exports = requireEs2015$1();
	} (es6));
		return es6.exports;
	}

	var GetIntrinsic;
	var hasRequiredGetIntrinsic;

	function requireGetIntrinsic () {
		if (hasRequiredGetIntrinsic) return GetIntrinsic;
		hasRequiredGetIntrinsic = 1;

		/* globals
			Set,
			Map,
			WeakSet,
			WeakMap,

			Promise,

			Symbol,
			Proxy,

			Atomics,
			SharedArrayBuffer,

			ArrayBuffer,
			DataView,
			Uint8Array,
			Float32Array,
			Float64Array,
			Int8Array,
			Int16Array,
			Int32Array,
			Uint8ClampedArray,
			Uint16Array,
			Uint32Array,
		*/

		var undefined$1; // eslint-disable-line no-shadow-restricted-names

		var ThrowTypeError = Object.getOwnPropertyDescriptor
			? (function () { return Object.getOwnPropertyDescriptor(arguments, 'callee').get; }())
			: function () { throw new TypeError(); };

		var hasSymbols = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol';

		var getProto = Object.getPrototypeOf || function (x) { return x.__proto__; }; // eslint-disable-line no-proto
		var generatorFunction = undefined$1;
		var asyncFunction = undefined$1;
		var asyncGenFunction = undefined$1;

		var TypedArray = typeof Uint8Array === 'undefined' ? undefined$1 : getProto(Uint8Array);

		var INTRINSICS = {
			'$ %Array%': Array,
			'$ %ArrayBuffer%': typeof ArrayBuffer === 'undefined' ? undefined$1 : ArrayBuffer,
			'$ %ArrayBufferPrototype%': typeof ArrayBuffer === 'undefined' ? undefined$1 : ArrayBuffer.prototype,
			'$ %ArrayIteratorPrototype%': hasSymbols ? getProto([][Symbol.iterator]()) : undefined$1,
			'$ %ArrayPrototype%': Array.prototype,
			'$ %ArrayProto_entries%': Array.prototype.entries,
			'$ %ArrayProto_forEach%': Array.prototype.forEach,
			'$ %ArrayProto_keys%': Array.prototype.keys,
			'$ %ArrayProto_values%': Array.prototype.values,
			'$ %AsyncFromSyncIteratorPrototype%': undefined$1,
			'$ %AsyncFunction%': asyncFunction,
			'$ %AsyncFunctionPrototype%': undefined$1,
			'$ %AsyncGenerator%': undefined$1,
			'$ %AsyncGeneratorFunction%': asyncGenFunction,
			'$ %AsyncGeneratorPrototype%': undefined$1,
			'$ %AsyncIteratorPrototype%': undefined$1,
			'$ %Atomics%': typeof Atomics === 'undefined' ? undefined$1 : Atomics,
			'$ %Boolean%': Boolean,
			'$ %BooleanPrototype%': Boolean.prototype,
			'$ %DataView%': typeof DataView === 'undefined' ? undefined$1 : DataView,
			'$ %DataViewPrototype%': typeof DataView === 'undefined' ? undefined$1 : DataView.prototype,
			'$ %Date%': Date,
			'$ %DatePrototype%': Date.prototype,
			'$ %decodeURI%': decodeURI,
			'$ %decodeURIComponent%': decodeURIComponent,
			'$ %encodeURI%': encodeURI,
			'$ %encodeURIComponent%': encodeURIComponent,
			'$ %Error%': Error,
			'$ %ErrorPrototype%': Error.prototype,
			'$ %eval%': eval, // eslint-disable-line no-eval
			'$ %EvalError%': EvalError,
			'$ %EvalErrorPrototype%': EvalError.prototype,
			'$ %Float32Array%': typeof Float32Array === 'undefined' ? undefined$1 : Float32Array,
			'$ %Float32ArrayPrototype%': typeof Float32Array === 'undefined' ? undefined$1 : Float32Array.prototype,
			'$ %Float64Array%': typeof Float64Array === 'undefined' ? undefined$1 : Float64Array,
			'$ %Float64ArrayPrototype%': typeof Float64Array === 'undefined' ? undefined$1 : Float64Array.prototype,
			'$ %Function%': Function,
			'$ %FunctionPrototype%': Function.prototype,
			'$ %Generator%': undefined$1,
			'$ %GeneratorFunction%': generatorFunction,
			'$ %GeneratorPrototype%': undefined$1,
			'$ %Int8Array%': typeof Int8Array === 'undefined' ? undefined$1 : Int8Array,
			'$ %Int8ArrayPrototype%': typeof Int8Array === 'undefined' ? undefined$1 : Int8Array.prototype,
			'$ %Int16Array%': typeof Int16Array === 'undefined' ? undefined$1 : Int16Array,
			'$ %Int16ArrayPrototype%': typeof Int16Array === 'undefined' ? undefined$1 : Int8Array.prototype,
			'$ %Int32Array%': typeof Int32Array === 'undefined' ? undefined$1 : Int32Array,
			'$ %Int32ArrayPrototype%': typeof Int32Array === 'undefined' ? undefined$1 : Int32Array.prototype,
			'$ %isFinite%': isFinite,
			'$ %isNaN%': isNaN,
			'$ %IteratorPrototype%': hasSymbols ? getProto(getProto([][Symbol.iterator]())) : undefined$1,
			'$ %JSON%': JSON,
			'$ %JSONParse%': JSON.parse,
			'$ %Map%': typeof Map === 'undefined' ? undefined$1 : Map,
			'$ %MapIteratorPrototype%': typeof Map === 'undefined' || !hasSymbols ? undefined$1 : getProto(new Map()[Symbol.iterator]()),
			'$ %MapPrototype%': typeof Map === 'undefined' ? undefined$1 : Map.prototype,
			'$ %Math%': Math,
			'$ %Number%': Number,
			'$ %NumberPrototype%': Number.prototype,
			'$ %Object%': Object,
			'$ %ObjectPrototype%': Object.prototype,
			'$ %ObjProto_toString%': Object.prototype.toString,
			'$ %ObjProto_valueOf%': Object.prototype.valueOf,
			'$ %parseFloat%': parseFloat,
			'$ %parseInt%': parseInt,
			'$ %Promise%': typeof Promise === 'undefined' ? undefined$1 : Promise,
			'$ %PromisePrototype%': typeof Promise === 'undefined' ? undefined$1 : Promise.prototype,
			'$ %PromiseProto_then%': typeof Promise === 'undefined' ? undefined$1 : Promise.prototype.then,
			'$ %Promise_all%': typeof Promise === 'undefined' ? undefined$1 : Promise.all,
			'$ %Promise_reject%': typeof Promise === 'undefined' ? undefined$1 : Promise.reject,
			'$ %Promise_resolve%': typeof Promise === 'undefined' ? undefined$1 : Promise.resolve,
			'$ %Proxy%': typeof Proxy === 'undefined' ? undefined$1 : Proxy,
			'$ %RangeError%': RangeError,
			'$ %RangeErrorPrototype%': RangeError.prototype,
			'$ %ReferenceError%': ReferenceError,
			'$ %ReferenceErrorPrototype%': ReferenceError.prototype,
			'$ %Reflect%': typeof Reflect === 'undefined' ? undefined$1 : Reflect,
			'$ %RegExp%': RegExp,
			'$ %RegExpPrototype%': RegExp.prototype,
			'$ %Set%': typeof Set === 'undefined' ? undefined$1 : Set,
			'$ %SetIteratorPrototype%': typeof Set === 'undefined' || !hasSymbols ? undefined$1 : getProto(new Set()[Symbol.iterator]()),
			'$ %SetPrototype%': typeof Set === 'undefined' ? undefined$1 : Set.prototype,
			'$ %SharedArrayBuffer%': typeof SharedArrayBuffer === 'undefined' ? undefined$1 : SharedArrayBuffer,
			'$ %SharedArrayBufferPrototype%': typeof SharedArrayBuffer === 'undefined' ? undefined$1 : SharedArrayBuffer.prototype,
			'$ %String%': String,
			'$ %StringIteratorPrototype%': hasSymbols ? getProto(''[Symbol.iterator]()) : undefined$1,
			'$ %StringPrototype%': String.prototype,
			'$ %Symbol%': hasSymbols ? Symbol : undefined$1,
			'$ %SymbolPrototype%': hasSymbols ? Symbol.prototype : undefined$1,
			'$ %SyntaxError%': SyntaxError,
			'$ %SyntaxErrorPrototype%': SyntaxError.prototype,
			'$ %ThrowTypeError%': ThrowTypeError,
			'$ %TypedArray%': TypedArray,
			'$ %TypedArrayPrototype%': TypedArray ? TypedArray.prototype : undefined$1,
			'$ %TypeError%': TypeError,
			'$ %TypeErrorPrototype%': TypeError.prototype,
			'$ %Uint8Array%': typeof Uint8Array === 'undefined' ? undefined$1 : Uint8Array,
			'$ %Uint8ArrayPrototype%': typeof Uint8Array === 'undefined' ? undefined$1 : Uint8Array.prototype,
			'$ %Uint8ClampedArray%': typeof Uint8ClampedArray === 'undefined' ? undefined$1 : Uint8ClampedArray,
			'$ %Uint8ClampedArrayPrototype%': typeof Uint8ClampedArray === 'undefined' ? undefined$1 : Uint8ClampedArray.prototype,
			'$ %Uint16Array%': typeof Uint16Array === 'undefined' ? undefined$1 : Uint16Array,
			'$ %Uint16ArrayPrototype%': typeof Uint16Array === 'undefined' ? undefined$1 : Uint16Array.prototype,
			'$ %Uint32Array%': typeof Uint32Array === 'undefined' ? undefined$1 : Uint32Array,
			'$ %Uint32ArrayPrototype%': typeof Uint32Array === 'undefined' ? undefined$1 : Uint32Array.prototype,
			'$ %URIError%': URIError,
			'$ %URIErrorPrototype%': URIError.prototype,
			'$ %WeakMap%': typeof WeakMap === 'undefined' ? undefined$1 : WeakMap,
			'$ %WeakMapPrototype%': typeof WeakMap === 'undefined' ? undefined$1 : WeakMap.prototype,
			'$ %WeakSet%': typeof WeakSet === 'undefined' ? undefined$1 : WeakSet,
			'$ %WeakSetPrototype%': typeof WeakSet === 'undefined' ? undefined$1 : WeakSet.prototype
		};

		GetIntrinsic = function GetIntrinsic(name, allowMissing) {
			if (arguments.length > 1 && typeof allowMissing !== 'boolean') {
				throw new TypeError('"allowMissing" argument must be a boolean');
			}

			var key = '$ ' + name;
			if (!(key in INTRINSICS)) {
				throw new SyntaxError('intrinsic ' + name + ' does not exist!');
			}

			// istanbul ignore if // hopefully this is impossible to test :-)
			if (typeof INTRINSICS[key] === 'undefined' && !allowMissing) {
				throw new TypeError('intrinsic ' + name + ' exists, but is not available. Please file an issue!');
			}
			return INTRINSICS[key];
		};
		return GetIntrinsic;
	}

	var assertRecord;
	var hasRequiredAssertRecord;

	function requireAssertRecord () {
		if (hasRequiredAssertRecord) return assertRecord;
		hasRequiredAssertRecord = 1;

		var GetIntrinsic = requireGetIntrinsic();

		var $TypeError = GetIntrinsic('%TypeError%');
		var $SyntaxError = GetIntrinsic('%SyntaxError%');

		var has = requireSrc();

		var predicates = {
		  // https://ecma-international.org/ecma-262/6.0/#sec-property-descriptor-specification-type
		  'Property Descriptor': function isPropertyDescriptor(ES, Desc) {
		    if (ES.Type(Desc) !== 'Object') {
		      return false;
		    }
		    var allowed = {
		      '[[Configurable]]': true,
		      '[[Enumerable]]': true,
		      '[[Get]]': true,
		      '[[Set]]': true,
		      '[[Value]]': true,
		      '[[Writable]]': true
		    };

		    for (var key in Desc) { // eslint-disable-line
		      if (has(Desc, key) && !allowed[key]) {
		        return false;
		      }
		    }

		    var isData = has(Desc, '[[Value]]');
		    var IsAccessor = has(Desc, '[[Get]]') || has(Desc, '[[Set]]');
		    if (isData && IsAccessor) {
		      throw new $TypeError('Property Descriptors may not be both accessor and data descriptors');
		    }
		    return true;
		  }
		};

		assertRecord = function assertRecord(ES, recordType, argumentName, value) {
		  var predicate = predicates[recordType];
		  if (typeof predicate !== 'function') {
		    throw new $SyntaxError('unknown record type: ' + recordType);
		  }
		  if (!predicate(ES, value)) {
		    throw new $TypeError(argumentName + ' must be a ' + recordType);
		  }
		  console.log(predicate(ES, value), value);
		};
		return assertRecord;
	}

	var _isNaN;
	var hasRequired_isNaN;

	function require_isNaN () {
		if (hasRequired_isNaN) return _isNaN;
		hasRequired_isNaN = 1;
		_isNaN = Number.isNaN || function isNaN(a) {
			return a !== a;
		};
		return _isNaN;
	}

	var _isFinite;
	var hasRequired_isFinite;

	function require_isFinite () {
		if (hasRequired_isFinite) return _isFinite;
		hasRequired_isFinite = 1;
		var $isNaN = Number.isNaN || function (a) { return a !== a; };

		_isFinite = Number.isFinite || function (x) { return typeof x === 'number' && !$isNaN(x) && x !== Infinity && x !== -Infinity; };
		return _isFinite;
	}

	var assign$4;
	var hasRequiredAssign;

	function requireAssign () {
		if (hasRequiredAssign) return assign$4;
		hasRequiredAssign = 1;
		var bind = functionBind;
		var has = bind.call(Function.call, Object.prototype.hasOwnProperty);

		var $assign = Object.assign;

		assign$4 = function assign(target, source) {
			if ($assign) {
				return $assign(target, source);
			}

			for (var key in source) {
				if (has(source, key)) {
					target[key] = source[key];
				}
			}
			return target;
		};
		return assign$4;
	}

	var sign;
	var hasRequiredSign;

	function requireSign () {
		if (hasRequiredSign) return sign;
		hasRequiredSign = 1;
		sign = function sign(number) {
			return number >= 0 ? 1 : -1;
		};
		return sign;
	}

	var mod;
	var hasRequiredMod;

	function requireMod () {
		if (hasRequiredMod) return mod;
		hasRequiredMod = 1;
		mod = function mod(number, modulo) {
			var remain = number % modulo;
			return Math.floor(remain >= 0 ? remain : remain + modulo);
		};
		return mod;
	}

	var isPrimitive;
	var hasRequiredIsPrimitive;

	function requireIsPrimitive () {
		if (hasRequiredIsPrimitive) return isPrimitive;
		hasRequiredIsPrimitive = 1;
		isPrimitive = function isPrimitive(value) {
			return value === null || (typeof value !== 'function' && typeof value !== 'object');
		};
		return isPrimitive;
	}

	var es5$1;
	var hasRequiredEs5$1;

	function requireEs5$1 () {
		if (hasRequiredEs5$1) return es5$1;
		hasRequiredEs5$1 = 1;

		var toStr = Object.prototype.toString;

		var isPrimitive = requireIsPrimitive$1();

		var isCallable = requireIsCallable();

		// http://ecma-international.org/ecma-262/5.1/#sec-8.12.8
		var ES5internalSlots = {
			'[[DefaultValue]]': function (O) {
				var actualHint;
				if (arguments.length > 1) {
					actualHint = arguments[1];
				} else {
					actualHint = toStr.call(O) === '[object Date]' ? String : Number;
				}

				if (actualHint === String || actualHint === Number) {
					var methods = actualHint === String ? ['toString', 'valueOf'] : ['valueOf', 'toString'];
					var value, i;
					for (i = 0; i < methods.length; ++i) {
						if (isCallable(O[methods[i]])) {
							value = O[methods[i]]();
							if (isPrimitive(value)) {
								return value;
							}
						}
					}
					throw new TypeError('No default value');
				}
				throw new TypeError('invalid [[DefaultValue]] hint supplied');
			}
		};

		// http://ecma-international.org/ecma-262/5.1/#sec-9.1
		es5$1 = function ToPrimitive(input) {
			if (isPrimitive(input)) {
				return input;
			}
			if (arguments.length > 1) {
				return ES5internalSlots['[[DefaultValue]]'](input, arguments[1]);
			}
			return ES5internalSlots['[[DefaultValue]]'](input);
		};
		return es5$1;
	}

	var es5;
	var hasRequiredEs5;

	function requireEs5 () {
		if (hasRequiredEs5) return es5;
		hasRequiredEs5 = 1;

		var GetIntrinsic = requireGetIntrinsic();

		var $Object = GetIntrinsic('%Object%');
		var $TypeError = GetIntrinsic('%TypeError%');
		var $String = GetIntrinsic('%String%');

		var assertRecord = requireAssertRecord();
		var $isNaN = require_isNaN();
		var $isFinite = require_isFinite();

		var sign = requireSign();
		var mod = requireMod();

		var IsCallable = requireIsCallable();
		var toPrimitive = requireEs5$1();

		var has = requireSrc();

		// https://es5.github.io/#x9
		var ES5 = {
			ToPrimitive: toPrimitive,

			ToBoolean: function ToBoolean(value) {
				return !!value;
			},
			ToNumber: function ToNumber(value) {
				return +value; // eslint-disable-line no-implicit-coercion
			},
			ToInteger: function ToInteger(value) {
				var number = this.ToNumber(value);
				if ($isNaN(number)) { return 0; }
				if (number === 0 || !$isFinite(number)) { return number; }
				return sign(number) * Math.floor(Math.abs(number));
			},
			ToInt32: function ToInt32(x) {
				return this.ToNumber(x) >> 0;
			},
			ToUint32: function ToUint32(x) {
				return this.ToNumber(x) >>> 0;
			},
			ToUint16: function ToUint16(value) {
				var number = this.ToNumber(value);
				if ($isNaN(number) || number === 0 || !$isFinite(number)) { return 0; }
				var posInt = sign(number) * Math.floor(Math.abs(number));
				return mod(posInt, 0x10000);
			},
			ToString: function ToString(value) {
				return $String(value);
			},
			ToObject: function ToObject(value) {
				this.CheckObjectCoercible(value);
				return $Object(value);
			},
			CheckObjectCoercible: function CheckObjectCoercible(value, optMessage) {
				/* jshint eqnull:true */
				if (value == null) {
					throw new $TypeError(optMessage || 'Cannot call method on ' + value);
				}
				return value;
			},
			IsCallable: IsCallable,
			SameValue: function SameValue(x, y) {
				if (x === y) { // 0 === -0, but they are not identical.
					if (x === 0) { return 1 / x === 1 / y; }
					return true;
				}
				return $isNaN(x) && $isNaN(y);
			},

			// https://www.ecma-international.org/ecma-262/5.1/#sec-8
			Type: function Type(x) {
				if (x === null) {
					return 'Null';
				}
				if (typeof x === 'undefined') {
					return 'Undefined';
				}
				if (typeof x === 'function' || typeof x === 'object') {
					return 'Object';
				}
				if (typeof x === 'number') {
					return 'Number';
				}
				if (typeof x === 'boolean') {
					return 'Boolean';
				}
				if (typeof x === 'string') {
					return 'String';
				}
			},

			// https://ecma-international.org/ecma-262/6.0/#sec-property-descriptor-specification-type
			IsPropertyDescriptor: function IsPropertyDescriptor(Desc) {
				if (this.Type(Desc) !== 'Object') {
					return false;
				}
				var allowed = {
					'[[Configurable]]': true,
					'[[Enumerable]]': true,
					'[[Get]]': true,
					'[[Set]]': true,
					'[[Value]]': true,
					'[[Writable]]': true
				};

				for (var key in Desc) { // eslint-disable-line
					if (has(Desc, key) && !allowed[key]) {
						return false;
					}
				}

				var isData = has(Desc, '[[Value]]');
				var IsAccessor = has(Desc, '[[Get]]') || has(Desc, '[[Set]]');
				if (isData && IsAccessor) {
					throw new $TypeError('Property Descriptors may not be both accessor and data descriptors');
				}
				return true;
			},

			// https://ecma-international.org/ecma-262/5.1/#sec-8.10.1
			IsAccessorDescriptor: function IsAccessorDescriptor(Desc) {
				if (typeof Desc === 'undefined') {
					return false;
				}

				assertRecord(this, 'Property Descriptor', 'Desc', Desc);

				if (!has(Desc, '[[Get]]') && !has(Desc, '[[Set]]')) {
					return false;
				}

				return true;
			},

			// https://ecma-international.org/ecma-262/5.1/#sec-8.10.2
			IsDataDescriptor: function IsDataDescriptor(Desc) {
				if (typeof Desc === 'undefined') {
					return false;
				}

				assertRecord(this, 'Property Descriptor', 'Desc', Desc);

				if (!has(Desc, '[[Value]]') && !has(Desc, '[[Writable]]')) {
					return false;
				}

				return true;
			},

			// https://ecma-international.org/ecma-262/5.1/#sec-8.10.3
			IsGenericDescriptor: function IsGenericDescriptor(Desc) {
				if (typeof Desc === 'undefined') {
					return false;
				}

				assertRecord(this, 'Property Descriptor', 'Desc', Desc);

				if (!this.IsAccessorDescriptor(Desc) && !this.IsDataDescriptor(Desc)) {
					return true;
				}

				return false;
			},

			// https://ecma-international.org/ecma-262/5.1/#sec-8.10.4
			FromPropertyDescriptor: function FromPropertyDescriptor(Desc) {
				if (typeof Desc === 'undefined') {
					return Desc;
				}

				assertRecord(this, 'Property Descriptor', 'Desc', Desc);

				if (this.IsDataDescriptor(Desc)) {
					return {
						value: Desc['[[Value]]'],
						writable: !!Desc['[[Writable]]'],
						enumerable: !!Desc['[[Enumerable]]'],
						configurable: !!Desc['[[Configurable]]']
					};
				} else if (this.IsAccessorDescriptor(Desc)) {
					return {
						get: Desc['[[Get]]'],
						set: Desc['[[Set]]'],
						enumerable: !!Desc['[[Enumerable]]'],
						configurable: !!Desc['[[Configurable]]']
					};
				} else {
					throw new $TypeError('FromPropertyDescriptor must be called with a fully populated Property Descriptor');
				}
			},

			// https://ecma-international.org/ecma-262/5.1/#sec-8.10.5
			ToPropertyDescriptor: function ToPropertyDescriptor(Obj) {
				if (this.Type(Obj) !== 'Object') {
					throw new $TypeError('ToPropertyDescriptor requires an object');
				}

				var desc = {};
				if (has(Obj, 'enumerable')) {
					desc['[[Enumerable]]'] = this.ToBoolean(Obj.enumerable);
				}
				if (has(Obj, 'configurable')) {
					desc['[[Configurable]]'] = this.ToBoolean(Obj.configurable);
				}
				if (has(Obj, 'value')) {
					desc['[[Value]]'] = Obj.value;
				}
				if (has(Obj, 'writable')) {
					desc['[[Writable]]'] = this.ToBoolean(Obj.writable);
				}
				if (has(Obj, 'get')) {
					var getter = Obj.get;
					if (typeof getter !== 'undefined' && !this.IsCallable(getter)) {
						throw new TypeError('getter must be a function');
					}
					desc['[[Get]]'] = getter;
				}
				if (has(Obj, 'set')) {
					var setter = Obj.set;
					if (typeof setter !== 'undefined' && !this.IsCallable(setter)) {
						throw new $TypeError('setter must be a function');
					}
					desc['[[Set]]'] = setter;
				}

				if ((has(desc, '[[Get]]') || has(desc, '[[Set]]')) && (has(desc, '[[Value]]') || has(desc, '[[Writable]]'))) {
					throw new $TypeError('Invalid property descriptor. Cannot both specify accessors and a value or writable attribute');
				}
				return desc;
			}
		};

		es5 = ES5;
		return es5;
	}

	var isRegex;
	var hasRequiredIsRegex;

	function requireIsRegex () {
		if (hasRequiredIsRegex) return isRegex;
		hasRequiredIsRegex = 1;

		var has = requireSrc();
		var regexExec = RegExp.prototype.exec;
		var gOPD = Object.getOwnPropertyDescriptor;

		var tryRegexExecCall = function tryRegexExec(value) {
			try {
				var lastIndex = value.lastIndex;
				value.lastIndex = 0;

				regexExec.call(value);
				return true;
			} catch (e) {
				return false;
			} finally {
				value.lastIndex = lastIndex;
			}
		};
		var toStr = Object.prototype.toString;
		var regexClass = '[object RegExp]';
		var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

		isRegex = function isRegex(value) {
			if (!value || typeof value !== 'object') {
				return false;
			}
			if (!hasToStringTag) {
				return toStr.call(value) === regexClass;
			}

			var descriptor = gOPD(value, 'lastIndex');
			var hasLastIndexDataProperty = descriptor && has(descriptor, 'value');
			if (!hasLastIndexDataProperty) {
				return false;
			}

			return tryRegexExecCall(value);
		};
		return isRegex;
	}

	var es2015;
	var hasRequiredEs2015;

	function requireEs2015 () {
		if (hasRequiredEs2015) return es2015;
		hasRequiredEs2015 = 1;

		var has = requireSrc();
		var toPrimitive = requireEs6();
		var keys = objectKeys$3;

		var GetIntrinsic = requireGetIntrinsic();

		var $TypeError = GetIntrinsic('%TypeError%');
		var $SyntaxError = GetIntrinsic('%SyntaxError%');
		var $Array = GetIntrinsic('%Array%');
		var $String = GetIntrinsic('%String%');
		var $Object = GetIntrinsic('%Object%');
		var $Number = GetIntrinsic('%Number%');
		var $Symbol = GetIntrinsic('%Symbol%', true);
		var $RegExp = GetIntrinsic('%RegExp%');

		var hasSymbols = !!$Symbol;

		var assertRecord = requireAssertRecord();
		var $isNaN = require_isNaN();
		var $isFinite = require_isFinite();
		var MAX_SAFE_INTEGER = $Number.MAX_SAFE_INTEGER || Math.pow(2, 53) - 1;

		var assign = requireAssign();
		var sign = requireSign();
		var mod = requireMod();
		var isPrimitive = requireIsPrimitive();
		var parseInteger = parseInt;
		var bind = functionBind;
		var arraySlice = bind.call(Function.call, $Array.prototype.slice);
		var strSlice = bind.call(Function.call, $String.prototype.slice);
		var isBinary = bind.call(Function.call, $RegExp.prototype.test, /^0b[01]+$/i);
		var isOctal = bind.call(Function.call, $RegExp.prototype.test, /^0o[0-7]+$/i);
		var regexExec = bind.call(Function.call, $RegExp.prototype.exec);
		var nonWS = ['\u0085', '\u200b', '\ufffe'].join('');
		var nonWSregex = new $RegExp('[' + nonWS + ']', 'g');
		var hasNonWS = bind.call(Function.call, $RegExp.prototype.test, nonWSregex);
		var invalidHexLiteral = /^[-+]0x[0-9a-f]+$/i;
		var isInvalidHexLiteral = bind.call(Function.call, $RegExp.prototype.test, invalidHexLiteral);
		var $charCodeAt = bind.call(Function.call, $String.prototype.charCodeAt);

		var toStr = bind.call(Function.call, Object.prototype.toString);

		var $NumberValueOf = bind.call(Function.call, GetIntrinsic('%NumberPrototype%').valueOf);
		var $BooleanValueOf = bind.call(Function.call, GetIntrinsic('%BooleanPrototype%').valueOf);
		var $StringValueOf = bind.call(Function.call, GetIntrinsic('%StringPrototype%').valueOf);
		var $DateValueOf = bind.call(Function.call, GetIntrinsic('%DatePrototype%').valueOf);

		var $floor = Math.floor;
		var $abs = Math.abs;

		var $ObjectCreate = Object.create;
		var $gOPD = $Object.getOwnPropertyDescriptor;

		var $isExtensible = $Object.isExtensible;

		var $defineProperty = $Object.defineProperty;

		// whitespace from: http://es5.github.io/#x15.5.4.20
		// implementation from https://github.com/es-shims/es5-shim/blob/v3.4.0/es5-shim.js#L1304-L1324
		var ws = [
			'\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003',
			'\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028',
			'\u2029\uFEFF'
		].join('');
		var trimRegex = new RegExp('(^[' + ws + ']+)|([' + ws + ']+$)', 'g');
		var replace = bind.call(Function.call, $String.prototype.replace);
		var trim = function (value) {
			return replace(value, trimRegex, '');
		};

		var ES5 = requireEs5();

		var hasRegExpMatcher = requireIsRegex();

		// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-abstract-operations
		var ES6 = assign(assign({}, ES5), {

			// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-call-f-v-args
			Call: function Call(F, V) {
				var args = arguments.length > 2 ? arguments[2] : [];
				if (!this.IsCallable(F)) {
					throw new $TypeError(F + ' is not a function');
				}
				return F.apply(V, args);
			},

			// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toprimitive
			ToPrimitive: toPrimitive,

			// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toboolean
			// ToBoolean: ES5.ToBoolean,

			// https://ecma-international.org/ecma-262/6.0/#sec-tonumber
			ToNumber: function ToNumber(argument) {
				var value = isPrimitive(argument) ? argument : toPrimitive(argument, $Number);
				if (typeof value === 'symbol') {
					throw new $TypeError('Cannot convert a Symbol value to a number');
				}
				if (typeof value === 'string') {
					if (isBinary(value)) {
						return this.ToNumber(parseInteger(strSlice(value, 2), 2));
					} else if (isOctal(value)) {
						return this.ToNumber(parseInteger(strSlice(value, 2), 8));
					} else if (hasNonWS(value) || isInvalidHexLiteral(value)) {
						return NaN;
					} else {
						var trimmed = trim(value);
						if (trimmed !== value) {
							return this.ToNumber(trimmed);
						}
					}
				}
				return $Number(value);
			},

			// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tointeger
			// ToInteger: ES5.ToNumber,

			// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toint32
			// ToInt32: ES5.ToInt32,

			// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-touint32
			// ToUint32: ES5.ToUint32,

			// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toint16
			ToInt16: function ToInt16(argument) {
				var int16bit = this.ToUint16(argument);
				return int16bit >= 0x8000 ? int16bit - 0x10000 : int16bit;
			},

			// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-touint16
			// ToUint16: ES5.ToUint16,

			// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toint8
			ToInt8: function ToInt8(argument) {
				var int8bit = this.ToUint8(argument);
				return int8bit >= 0x80 ? int8bit - 0x100 : int8bit;
			},

			// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-touint8
			ToUint8: function ToUint8(argument) {
				var number = this.ToNumber(argument);
				if ($isNaN(number) || number === 0 || !$isFinite(number)) { return 0; }
				var posInt = sign(number) * $floor($abs(number));
				return mod(posInt, 0x100);
			},

			// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-touint8clamp
			ToUint8Clamp: function ToUint8Clamp(argument) {
				var number = this.ToNumber(argument);
				if ($isNaN(number) || number <= 0) { return 0; }
				if (number >= 0xFF) { return 0xFF; }
				var f = $floor(argument);
				if (f + 0.5 < number) { return f + 1; }
				if (number < f + 0.5) { return f; }
				if (f % 2 !== 0) { return f + 1; }
				return f;
			},

			// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tostring
			ToString: function ToString(argument) {
				if (typeof argument === 'symbol') {
					throw new $TypeError('Cannot convert a Symbol value to a string');
				}
				return $String(argument);
			},

			// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toobject
			ToObject: function ToObject(value) {
				this.RequireObjectCoercible(value);
				return $Object(value);
			},

			// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-topropertykey
			ToPropertyKey: function ToPropertyKey(argument) {
				var key = this.ToPrimitive(argument, $String);
				return typeof key === 'symbol' ? key : this.ToString(key);
			},

			// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
			ToLength: function ToLength(argument) {
				var len = this.ToInteger(argument);
				if (len <= 0) { return 0; } // includes converting -0 to +0
				if (len > MAX_SAFE_INTEGER) { return MAX_SAFE_INTEGER; }
				return len;
			},

			// https://ecma-international.org/ecma-262/6.0/#sec-canonicalnumericindexstring
			CanonicalNumericIndexString: function CanonicalNumericIndexString(argument) {
				if (toStr(argument) !== '[object String]') {
					throw new $TypeError('must be a string');
				}
				if (argument === '-0') { return -0; }
				var n = this.ToNumber(argument);
				if (this.SameValue(this.ToString(n), argument)) { return n; }
				return void 0;
			},

			// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-requireobjectcoercible
			RequireObjectCoercible: ES5.CheckObjectCoercible,

			// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-isarray
			IsArray: $Array.isArray || function IsArray(argument) {
				return toStr(argument) === '[object Array]';
			},

			// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-iscallable
			// IsCallable: ES5.IsCallable,

			// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-isconstructor
			IsConstructor: function IsConstructor(argument) {
				return typeof argument === 'function' && !!argument.prototype; // unfortunately there's no way to truly check this without try/catch `new argument`
			},

			// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-isextensible-o
			IsExtensible: Object.preventExtensions
				? function IsExtensible(obj) {
					if (isPrimitive(obj)) {
						return false;
					}
					return $isExtensible(obj);
				}
				: function isExtensible(obj) { return true; }, // eslint-disable-line no-unused-vars

			// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-isinteger
			IsInteger: function IsInteger(argument) {
				if (typeof argument !== 'number' || $isNaN(argument) || !$isFinite(argument)) {
					return false;
				}
				var abs = $abs(argument);
				return $floor(abs) === abs;
			},

			// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-ispropertykey
			IsPropertyKey: function IsPropertyKey(argument) {
				return typeof argument === 'string' || typeof argument === 'symbol';
			},

			// https://ecma-international.org/ecma-262/6.0/#sec-isregexp
			IsRegExp: function IsRegExp(argument) {
				if (!argument || typeof argument !== 'object') {
					return false;
				}
				if (hasSymbols) {
					var isRegExp = argument[$Symbol.match];
					if (typeof isRegExp !== 'undefined') {
						return ES5.ToBoolean(isRegExp);
					}
				}
				return hasRegExpMatcher(argument);
			},

			// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevalue
			// SameValue: ES5.SameValue,

			// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevaluezero
			SameValueZero: function SameValueZero(x, y) {
				return (x === y) || ($isNaN(x) && $isNaN(y));
			},

			/**
			 * 7.3.2 GetV (V, P)
			 * 1. Assert: IsPropertyKey(P) is true.
			 * 2. Let O be ToObject(V).
			 * 3. ReturnIfAbrupt(O).
			 * 4. Return O.[[Get]](P, V).
			 */
			GetV: function GetV(V, P) {
				// 7.3.2.1
				if (!this.IsPropertyKey(P)) {
					throw new $TypeError('Assertion failed: IsPropertyKey(P) is not true');
				}

				// 7.3.2.2-3
				var O = this.ToObject(V);

				// 7.3.2.4
				return O[P];
			},

			/**
			 * 7.3.9 - https://ecma-international.org/ecma-262/6.0/#sec-getmethod
			 * 1. Assert: IsPropertyKey(P) is true.
			 * 2. Let func be GetV(O, P).
			 * 3. ReturnIfAbrupt(func).
			 * 4. If func is either undefined or null, return undefined.
			 * 5. If IsCallable(func) is false, throw a TypeError exception.
			 * 6. Return func.
			 */
			GetMethod: function GetMethod(O, P) {
				// 7.3.9.1
				if (!this.IsPropertyKey(P)) {
					throw new $TypeError('Assertion failed: IsPropertyKey(P) is not true');
				}

				// 7.3.9.2
				var func = this.GetV(O, P);

				// 7.3.9.4
				if (func == null) {
					return void 0;
				}

				// 7.3.9.5
				if (!this.IsCallable(func)) {
					throw new $TypeError(P + 'is not a function');
				}

				// 7.3.9.6
				return func;
			},

			/**
			 * 7.3.1 Get (O, P) - https://ecma-international.org/ecma-262/6.0/#sec-get-o-p
			 * 1. Assert: Type(O) is Object.
			 * 2. Assert: IsPropertyKey(P) is true.
			 * 3. Return O.[[Get]](P, O).
			 */
			Get: function Get(O, P) {
				// 7.3.1.1
				if (this.Type(O) !== 'Object') {
					throw new $TypeError('Assertion failed: Type(O) is not Object');
				}
				// 7.3.1.2
				if (!this.IsPropertyKey(P)) {
					throw new $TypeError('Assertion failed: IsPropertyKey(P) is not true');
				}
				// 7.3.1.3
				return O[P];
			},

			Type: function Type(x) {
				if (typeof x === 'symbol') {
					return 'Symbol';
				}
				return ES5.Type(x);
			},

			// https://ecma-international.org/ecma-262/6.0/#sec-speciesconstructor
			SpeciesConstructor: function SpeciesConstructor(O, defaultConstructor) {
				if (this.Type(O) !== 'Object') {
					throw new $TypeError('Assertion failed: Type(O) is not Object');
				}
				var C = O.constructor;
				if (typeof C === 'undefined') {
					return defaultConstructor;
				}
				if (this.Type(C) !== 'Object') {
					throw new $TypeError('O.constructor is not an Object');
				}
				var S = hasSymbols && $Symbol.species ? C[$Symbol.species] : void 0;
				if (S == null) {
					return defaultConstructor;
				}
				if (this.IsConstructor(S)) {
					return S;
				}
				throw new $TypeError('no constructor found');
			},

			// https://ecma-international.org/ecma-262/6.0/#sec-completepropertydescriptor
			CompletePropertyDescriptor: function CompletePropertyDescriptor(Desc) {
				assertRecord(this, 'Property Descriptor', 'Desc', Desc);

				if (this.IsGenericDescriptor(Desc) || this.IsDataDescriptor(Desc)) {
					if (!has(Desc, '[[Value]]')) {
						Desc['[[Value]]'] = void 0;
					}
					if (!has(Desc, '[[Writable]]')) {
						Desc['[[Writable]]'] = false;
					}
				} else {
					if (!has(Desc, '[[Get]]')) {
						Desc['[[Get]]'] = void 0;
					}
					if (!has(Desc, '[[Set]]')) {
						Desc['[[Set]]'] = void 0;
					}
				}
				if (!has(Desc, '[[Enumerable]]')) {
					Desc['[[Enumerable]]'] = false;
				}
				if (!has(Desc, '[[Configurable]]')) {
					Desc['[[Configurable]]'] = false;
				}
				return Desc;
			},

			// https://ecma-international.org/ecma-262/6.0/#sec-set-o-p-v-throw
			Set: function Set(O, P, V, Throw) {
				if (this.Type(O) !== 'Object') {
					throw new $TypeError('O must be an Object');
				}
				if (!this.IsPropertyKey(P)) {
					throw new $TypeError('P must be a Property Key');
				}
				if (this.Type(Throw) !== 'Boolean') {
					throw new $TypeError('Throw must be a Boolean');
				}
				if (Throw) {
					O[P] = V;
					return true;
				} else {
					try {
						O[P] = V;
					} catch (e) {
						return false;
					}
				}
			},

			// https://ecma-international.org/ecma-262/6.0/#sec-hasownproperty
			HasOwnProperty: function HasOwnProperty(O, P) {
				if (this.Type(O) !== 'Object') {
					throw new $TypeError('O must be an Object');
				}
				if (!this.IsPropertyKey(P)) {
					throw new $TypeError('P must be a Property Key');
				}
				return has(O, P);
			},

			// https://ecma-international.org/ecma-262/6.0/#sec-hasproperty
			HasProperty: function HasProperty(O, P) {
				if (this.Type(O) !== 'Object') {
					throw new $TypeError('O must be an Object');
				}
				if (!this.IsPropertyKey(P)) {
					throw new $TypeError('P must be a Property Key');
				}
				return P in O;
			},

			// https://ecma-international.org/ecma-262/6.0/#sec-isconcatspreadable
			IsConcatSpreadable: function IsConcatSpreadable(O) {
				if (this.Type(O) !== 'Object') {
					return false;
				}
				if (hasSymbols && typeof $Symbol.isConcatSpreadable === 'symbol') {
					var spreadable = this.Get(O, Symbol.isConcatSpreadable);
					if (typeof spreadable !== 'undefined') {
						return this.ToBoolean(spreadable);
					}
				}
				return this.IsArray(O);
			},

			// https://ecma-international.org/ecma-262/6.0/#sec-invoke
			Invoke: function Invoke(O, P) {
				if (!this.IsPropertyKey(P)) {
					throw new $TypeError('P must be a Property Key');
				}
				var argumentsList = arraySlice(arguments, 2);
				var func = this.GetV(O, P);
				return this.Call(func, O, argumentsList);
			},

			// https://ecma-international.org/ecma-262/6.0/#sec-getiterator
			GetIterator: function GetIterator(obj, method) {
				if (!hasSymbols) {
					throw new SyntaxError('ES.GetIterator depends on native iterator support.');
				}

				var actualMethod = method;
				if (arguments.length < 2) {
					actualMethod = this.GetMethod(obj, $Symbol.iterator);
				}
				var iterator = this.Call(actualMethod, obj);
				if (this.Type(iterator) !== 'Object') {
					throw new $TypeError('iterator must return an object');
				}

				return iterator;
			},

			// https://ecma-international.org/ecma-262/6.0/#sec-iteratornext
			IteratorNext: function IteratorNext(iterator, value) {
				var result = this.Invoke(iterator, 'next', arguments.length < 2 ? [] : [value]);
				if (this.Type(result) !== 'Object') {
					throw new $TypeError('iterator next must return an object');
				}
				return result;
			},

			// https://ecma-international.org/ecma-262/6.0/#sec-iteratorcomplete
			IteratorComplete: function IteratorComplete(iterResult) {
				if (this.Type(iterResult) !== 'Object') {
					throw new $TypeError('Assertion failed: Type(iterResult) is not Object');
				}
				return this.ToBoolean(this.Get(iterResult, 'done'));
			},

			// https://ecma-international.org/ecma-262/6.0/#sec-iteratorvalue
			IteratorValue: function IteratorValue(iterResult) {
				if (this.Type(iterResult) !== 'Object') {
					throw new $TypeError('Assertion failed: Type(iterResult) is not Object');
				}
				return this.Get(iterResult, 'value');
			},

			// https://ecma-international.org/ecma-262/6.0/#sec-iteratorstep
			IteratorStep: function IteratorStep(iterator) {
				var result = this.IteratorNext(iterator);
				var done = this.IteratorComplete(result);
				return done === true ? false : result;
			},

			// https://ecma-international.org/ecma-262/6.0/#sec-iteratorclose
			IteratorClose: function IteratorClose(iterator, completion) {
				if (this.Type(iterator) !== 'Object') {
					throw new $TypeError('Assertion failed: Type(iterator) is not Object');
				}
				if (!this.IsCallable(completion)) {
					throw new $TypeError('Assertion failed: completion is not a thunk for a Completion Record');
				}
				var completionThunk = completion;

				var iteratorReturn = this.GetMethod(iterator, 'return');

				if (typeof iteratorReturn === 'undefined') {
					return completionThunk();
				}

				var completionRecord;
				try {
					var innerResult = this.Call(iteratorReturn, iterator, []);
				} catch (e) {
					// if we hit here, then "e" is the innerResult completion that needs re-throwing

					// if the completion is of type "throw", this will throw.
					completionRecord = completionThunk();
					completionThunk = null; // ensure it's not called twice.

					// if not, then return the innerResult completion
					throw e;
				}
				completionRecord = completionThunk(); // if innerResult worked, then throw if the completion does
				completionThunk = null; // ensure it's not called twice.

				if (this.Type(innerResult) !== 'Object') {
					throw new $TypeError('iterator .return must return an object');
				}

				return completionRecord;
			},

			// https://ecma-international.org/ecma-262/6.0/#sec-createiterresultobject
			CreateIterResultObject: function CreateIterResultObject(value, done) {
				if (this.Type(done) !== 'Boolean') {
					throw new $TypeError('Assertion failed: Type(done) is not Boolean');
				}
				return {
					value: value,
					done: done
				};
			},

			// https://ecma-international.org/ecma-262/6.0/#sec-regexpexec
			RegExpExec: function RegExpExec(R, S) {
				if (this.Type(R) !== 'Object') {
					throw new $TypeError('R must be an Object');
				}
				if (this.Type(S) !== 'String') {
					throw new $TypeError('S must be a String');
				}
				var exec = this.Get(R, 'exec');
				if (this.IsCallable(exec)) {
					var result = this.Call(exec, R, [S]);
					if (result === null || this.Type(result) === 'Object') {
						return result;
					}
					throw new $TypeError('"exec" method must return `null` or an Object');
				}
				return regexExec(R, S);
			},

			// https://ecma-international.org/ecma-262/6.0/#sec-arrayspeciescreate
			ArraySpeciesCreate: function ArraySpeciesCreate(originalArray, length) {
				if (!this.IsInteger(length) || length < 0) {
					throw new $TypeError('Assertion failed: length must be an integer >= 0');
				}
				var len = length === 0 ? 0 : length;
				var C;
				var isArray = this.IsArray(originalArray);
				if (isArray) {
					C = this.Get(originalArray, 'constructor');
					// TODO: figure out how to make a cross-realm normal Array, a same-realm Array
					// if (this.IsConstructor(C)) {
					// 	if C is another realm's Array, C = undefined
					// 	Object.getPrototypeOf(Object.getPrototypeOf(Object.getPrototypeOf(Array))) === null ?
					// }
					if (this.Type(C) === 'Object' && hasSymbols && $Symbol.species) {
						C = this.Get(C, $Symbol.species);
						if (C === null) {
							C = void 0;
						}
					}
				}
				if (typeof C === 'undefined') {
					return $Array(len);
				}
				if (!this.IsConstructor(C)) {
					throw new $TypeError('C must be a constructor');
				}
				return new C(len); // this.Construct(C, len);
			},

			CreateDataProperty: function CreateDataProperty(O, P, V) {
				if (this.Type(O) !== 'Object') {
					throw new $TypeError('Assertion failed: Type(O) is not Object');
				}
				if (!this.IsPropertyKey(P)) {
					throw new $TypeError('Assertion failed: IsPropertyKey(P) is not true');
				}
				var oldDesc = $gOPD(O, P);
				var extensible = oldDesc || (typeof $isExtensible !== 'function' || $isExtensible(O));
				var immutable = oldDesc && (!oldDesc.writable || !oldDesc.configurable);
				if (immutable || !extensible) {
					return false;
				}
				var newDesc = {
					configurable: true,
					enumerable: true,
					value: V,
					writable: true
				};
				$defineProperty(O, P, newDesc);
				return true;
			},

			// https://ecma-international.org/ecma-262/6.0/#sec-createdatapropertyorthrow
			CreateDataPropertyOrThrow: function CreateDataPropertyOrThrow(O, P, V) {
				if (this.Type(O) !== 'Object') {
					throw new $TypeError('Assertion failed: Type(O) is not Object');
				}
				if (!this.IsPropertyKey(P)) {
					throw new $TypeError('Assertion failed: IsPropertyKey(P) is not true');
				}
				var success = this.CreateDataProperty(O, P, V);
				if (!success) {
					throw new $TypeError('unable to create data property');
				}
				return success;
			},

			// https://www.ecma-international.org/ecma-262/6.0/#sec-objectcreate
			ObjectCreate: function ObjectCreate(proto, internalSlotsList) {
				if (proto !== null && this.Type(proto) !== 'Object') {
					throw new $TypeError('Assertion failed: proto must be null or an object');
				}
				var slots = arguments.length < 2 ? [] : internalSlotsList;
				if (slots.length > 0) {
					throw new $SyntaxError('es-abstract does not yet support internal slots');
				}

				if (proto === null && !$ObjectCreate) {
					throw new $SyntaxError('native Object.create support is required to create null objects');
				}

				return $ObjectCreate(proto);
			},

			// https://ecma-international.org/ecma-262/6.0/#sec-advancestringindex
			AdvanceStringIndex: function AdvanceStringIndex(S, index, unicode) {
				if (this.Type(S) !== 'String') {
					throw new $TypeError('S must be a String');
				}
				if (!this.IsInteger(index) || index < 0 || index > MAX_SAFE_INTEGER) {
					throw new $TypeError('Assertion failed: length must be an integer >= 0 and <= 2**53');
				}
				if (this.Type(unicode) !== 'Boolean') {
					throw new $TypeError('Assertion failed: unicode must be a Boolean');
				}
				if (!unicode) {
					return index + 1;
				}
				var length = S.length;
				if ((index + 1) >= length) {
					return index + 1;
				}

				var first = $charCodeAt(S, index);
				if (first < 0xD800 || first > 0xDBFF) {
					return index + 1;
				}

				var second = $charCodeAt(S, index + 1);
				if (second < 0xDC00 || second > 0xDFFF) {
					return index + 1;
				}

				return index + 2;
			},

			// https://www.ecma-international.org/ecma-262/6.0/#sec-createmethodproperty
			CreateMethodProperty: function CreateMethodProperty(O, P, V) {
				if (this.Type(O) !== 'Object') {
					throw new $TypeError('Assertion failed: Type(O) is not Object');
				}

				if (!this.IsPropertyKey(P)) {
					throw new $TypeError('Assertion failed: IsPropertyKey(P) is not true');
				}

				var newDesc = {
					configurable: true,
					enumerable: false,
					value: V,
					writable: true
				};
				return !!$defineProperty(O, P, newDesc);
			},

			// https://www.ecma-international.org/ecma-262/6.0/#sec-definepropertyorthrow
			DefinePropertyOrThrow: function DefinePropertyOrThrow(O, P, desc) {
				if (this.Type(O) !== 'Object') {
					throw new $TypeError('Assertion failed: Type(O) is not Object');
				}

				if (!this.IsPropertyKey(P)) {
					throw new $TypeError('Assertion failed: IsPropertyKey(P) is not true');
				}

				return !!$defineProperty(O, P, desc);
			},

			// https://www.ecma-international.org/ecma-262/6.0/#sec-deletepropertyorthrow
			DeletePropertyOrThrow: function DeletePropertyOrThrow(O, P) {
				if (this.Type(O) !== 'Object') {
					throw new $TypeError('Assertion failed: Type(O) is not Object');
				}

				if (!this.IsPropertyKey(P)) {
					throw new $TypeError('Assertion failed: IsPropertyKey(P) is not true');
				}

				var success = delete O[P];
				if (!success) {
					throw new TypeError('Attempt to delete property failed.');
				}
				return success;
			},

			// https://www.ecma-international.org/ecma-262/6.0/#sec-enumerableownnames
			EnumerableOwnNames: function EnumerableOwnNames(O) {
				if (this.Type(O) !== 'Object') {
					throw new $TypeError('Assertion failed: Type(O) is not Object');
				}

				return keys(O);
			},

			// https://ecma-international.org/ecma-262/6.0/#sec-properties-of-the-number-prototype-object
			thisNumberValue: function thisNumberValue(value) {
				if (this.Type(value) === 'Number') {
					return value;
				}

				return $NumberValueOf(value);
			},

			// https://ecma-international.org/ecma-262/6.0/#sec-properties-of-the-boolean-prototype-object
			thisBooleanValue: function thisBooleanValue(value) {
				if (this.Type(value) === 'Boolean') {
					return value;
				}

				return $BooleanValueOf(value);
			},

			// https://ecma-international.org/ecma-262/6.0/#sec-properties-of-the-string-prototype-object
			thisStringValue: function thisStringValue(value) {
				if (this.Type(value) === 'String') {
					return value;
				}

				return $StringValueOf(value);
			},

			// https://ecma-international.org/ecma-262/6.0/#sec-properties-of-the-date-prototype-object
			thisTimeValue: function thisTimeValue(value) {
				return $DateValueOf(value);
			}
		});

		delete ES6.CheckObjectCoercible; // renamed in ES6 to RequireObjectCoercible

		es2015 = ES6;
		return es2015;
	}

	var es2016;
	var hasRequiredEs2016;

	function requireEs2016 () {
		if (hasRequiredEs2016) return es2016;
		hasRequiredEs2016 = 1;

		var ES2015 = requireEs2015();
		var assign = requireAssign();

		var ES2016 = assign(assign({}, ES2015), {
			// https://github.com/tc39/ecma262/pull/60
			SameValueNonNumber: function SameValueNonNumber(x, y) {
				if (typeof x === 'number' || typeof x !== typeof y) {
					throw new TypeError('SameValueNonNumber requires two non-number values of the same type.');
				}
				return this.SameValue(x, y);
			}
		});

		es2016 = ES2016;
		return es2016;
	}

	var hasRequiredEs7;

	function requireEs7 () {
		if (hasRequiredEs7) return es7.exports;
		hasRequiredEs7 = 1;
		(function (module) {

			module.exports = requireEs2016();
	} (es7));
		return es7.exports;
	}

	var requirePromise$2 = requirePromise$3;

	requirePromise$2();

	var ES = requireEs7();
	var bind$9 = functionBind;

	var promiseResolve$3 = function PromiseResolve(C, value) {
		return new C(function (resolve) {
			resolve(value);
		});
	};

	var OriginalPromise = Promise;

	var createThenFinally = function CreateThenFinally(C, onFinally) {
		return function (value) {
			var result = onFinally();
			var promise = promiseResolve$3(C, result);
			var valueThunk = function () {
				return value;
			};
			return promise.then(valueThunk);
		};
	};

	var createCatchFinally = function CreateCatchFinally(C, onFinally) {
		return function (reason) {
			var result = onFinally();
			var promise = promiseResolve$3(C, result);
			var thrower = function () {
				throw reason;
			};
			return promise.then(thrower);
		};
	};

	var then$1 = bind$9.call(Function.call, OriginalPromise.prototype.then);

	var promiseFinally$1 = function finally_(onFinally) {
		/* eslint no-invalid-this: 0 */

		var promise = this;

		then$1(promise, null, function () {}); // throw if IsPromise(this) is false; catch() to avoid unhandled rejection warnings

		var C = ES.SpeciesConstructor(promise, OriginalPromise); // may throw

		var thenFinally = onFinally;
		var catchFinally = onFinally;
		if (ES.IsCallable(onFinally)) {
			thenFinally = createThenFinally(C, onFinally);
			catchFinally = createCatchFinally(C, onFinally);
		}

		return promise.then(thenFinally, catchFinally);
	};

	if (Object.getOwnPropertyDescriptor) {
		var descriptor = Object.getOwnPropertyDescriptor(promiseFinally$1, 'name');
		if (descriptor && descriptor.configurable) {
			Object.defineProperty(promiseFinally$1, 'name', { configurable: true, value: 'finally' });
		}
	}

	var implementation$2 = promiseFinally$1;

	var requirePromise$1 = requirePromise$3;

	var implementation$1 = implementation$2;

	var polyfill = function getPolyfill() {
		requirePromise$1();
		return typeof Promise.prototype['finally'] === 'function' ? Promise.prototype['finally'] : implementation$1;
	};

	var requirePromise = requirePromise$3;

	var getPolyfill$1 = polyfill;
	var define$1 = defineProperties_1;

	var shim$1 = function shimPromiseFinally() {
		requirePromise();

		var polyfill = getPolyfill$1();
		define$1(Promise.prototype, { 'finally': polyfill }, {
			'finally': function testFinally() {
				return Promise.prototype['finally'] !== polyfill;
			}
		});
		return polyfill;
	};

	var bind$8 = functionBind;
	var define = defineProperties_1;

	var implementation = implementation$2;
	var getPolyfill = polyfill;
	var shim = shim$1;

	var bound = bind$8.call(Function.call, getPolyfill());

	define(bound, {
		getPolyfill: getPolyfill,
		implementation: implementation,
		shim: shim
	});

	var promise_prototype_finally = bound;

	var assign$3 = {exports: {}};

	var check = function (it) {
	  return it && it.Math == Math && it;
	};

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global$h =
	  // eslint-disable-next-line es/no-global-this -- safe
	  check(typeof globalThis == 'object' && globalThis) ||
	  check(typeof window == 'object' && window) ||
	  // eslint-disable-next-line no-restricted-globals -- safe
	  check(typeof self == 'object' && self) ||
	  check(typeof commonjsGlobal == 'object' && commonjsGlobal) ||
	  // eslint-disable-next-line no-new-func -- fallback
	  (function () { return this; })() || Function('return this')();

	var objectGetOwnPropertyDescriptor = {};

	var fails$e = function (exec) {
	  try {
	    return !!exec();
	  } catch (error) {
	    return true;
	  }
	};

	var fails$d = fails$e;

	// Detect IE8's incomplete defineProperty implementation
	var descriptors = !fails$d(function () {
	  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
	  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] != 7;
	});

	var objectPropertyIsEnumerable = {};

	var $propertyIsEnumerable = {}.propertyIsEnumerable;
	// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	var getOwnPropertyDescriptor$2 = Object.getOwnPropertyDescriptor;

	// Nashorn ~ JDK8 bug
	var NASHORN_BUG = getOwnPropertyDescriptor$2 && !$propertyIsEnumerable.call({ 1: 2 }, 1);

	// `Object.prototype.propertyIsEnumerable` method implementation
	// https://tc39.es/ecma262/#sec-object.prototype.propertyisenumerable
	objectPropertyIsEnumerable.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
	  var descriptor = getOwnPropertyDescriptor$2(this, V);
	  return !!descriptor && descriptor.enumerable;
	} : $propertyIsEnumerable;

	var createPropertyDescriptor$5 = function (bitmap, value) {
	  return {
	    enumerable: !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable: !(bitmap & 4),
	    value: value
	  };
	};

	var toString$2 = {}.toString;

	var classofRaw$1 = function (it) {
	  return toString$2.call(it).slice(8, -1);
	};

	var fails$c = fails$e;
	var classof$7 = classofRaw$1;

	var split = ''.split;

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var indexedObject = fails$c(function () {
	  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
	  // eslint-disable-next-line no-prototype-builtins -- safe
	  return !Object('z').propertyIsEnumerable(0);
	}) ? function (it) {
	  return classof$7(it) == 'String' ? split.call(it, '') : Object(it);
	} : Object;

	// `RequireObjectCoercible` abstract operation
	// https://tc39.es/ecma262/#sec-requireobjectcoercible
	var requireObjectCoercible$3 = function (it) {
	  if (it == undefined) throw TypeError("Can't call method on " + it);
	  return it;
	};

	// toObject with fallback for non-array-like ES3 strings
	var IndexedObject$3 = indexedObject;
	var requireObjectCoercible$2 = requireObjectCoercible$3;

	var toIndexedObject$5 = function (it) {
	  return IndexedObject$3(requireObjectCoercible$2(it));
	};

	var isObject$a = function (it) {
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

	var isObject$9 = isObject$a;

	// `ToPrimitive` abstract operation
	// https://tc39.es/ecma262/#sec-toprimitive
	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string
	var toPrimitive$3 = function (input, PREFERRED_STRING) {
	  if (!isObject$9(input)) return input;
	  var fn, val;
	  if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject$9(val = fn.call(input))) return val;
	  if (typeof (fn = input.valueOf) == 'function' && !isObject$9(val = fn.call(input))) return val;
	  if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject$9(val = fn.call(input))) return val;
	  throw TypeError("Can't convert object to primitive value");
	};

	var requireObjectCoercible$1 = requireObjectCoercible$3;

	// `ToObject` abstract operation
	// https://tc39.es/ecma262/#sec-toobject
	var toObject$7 = function (argument) {
	  return Object(requireObjectCoercible$1(argument));
	};

	var toObject$6 = toObject$7;

	var hasOwnProperty = {}.hasOwnProperty;

	var has$8 = function hasOwn(it, key) {
	  return hasOwnProperty.call(toObject$6(it), key);
	};

	var global$g = global$h;
	var isObject$8 = isObject$a;

	var document$3 = global$g.document;
	// typeof document.createElement is 'object' in old IE
	var EXISTS = isObject$8(document$3) && isObject$8(document$3.createElement);

	var documentCreateElement$1 = function (it) {
	  return EXISTS ? document$3.createElement(it) : {};
	};

	var DESCRIPTORS$6 = descriptors;
	var fails$b = fails$e;
	var createElement$1 = documentCreateElement$1;

	// Thank's IE8 for his funny defineProperty
	var ie8DomDefine = !DESCRIPTORS$6 && !fails$b(function () {
	  // eslint-disable-next-line es/no-object-defineproperty -- requied for testing
	  return Object.defineProperty(createElement$1('div'), 'a', {
	    get: function () { return 7; }
	  }).a != 7;
	});

	var DESCRIPTORS$5 = descriptors;
	var propertyIsEnumerableModule$1 = objectPropertyIsEnumerable;
	var createPropertyDescriptor$4 = createPropertyDescriptor$5;
	var toIndexedObject$4 = toIndexedObject$5;
	var toPrimitive$2 = toPrimitive$3;
	var has$7 = has$8;
	var IE8_DOM_DEFINE$1 = ie8DomDefine;

	// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

	// `Object.getOwnPropertyDescriptor` method
	// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
	objectGetOwnPropertyDescriptor.f = DESCRIPTORS$5 ? $getOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
	  O = toIndexedObject$4(O);
	  P = toPrimitive$2(P, true);
	  if (IE8_DOM_DEFINE$1) try {
	    return $getOwnPropertyDescriptor(O, P);
	  } catch (error) { /* empty */ }
	  if (has$7(O, P)) return createPropertyDescriptor$4(!propertyIsEnumerableModule$1.f.call(O, P), O[P]);
	};

	var fails$a = fails$e;

	var replacement = /#|\.prototype\./;

	var isForced$2 = function (feature, detection) {
	  var value = data$1[normalize(feature)];
	  return value == POLYFILL ? true
	    : value == NATIVE ? false
	    : typeof detection == 'function' ? fails$a(detection)
	    : !!detection;
	};

	var normalize = isForced$2.normalize = function (string) {
	  return String(string).replace(replacement, '.').toLowerCase();
	};

	var data$1 = isForced$2.data = {};
	var NATIVE = isForced$2.NATIVE = 'N';
	var POLYFILL = isForced$2.POLYFILL = 'P';

	var isForced_1 = isForced$2;

	var path$6 = {};

	var aFunction$9 = function (it) {
	  if (typeof it != 'function') {
	    throw TypeError(String(it) + ' is not a function');
	  } return it;
	};

	var aFunction$8 = aFunction$9;

	// optional / simple context binding
	var functionBindContext = function (fn, that, length) {
	  aFunction$8(fn);
	  if (that === undefined) return fn;
	  switch (length) {
	    case 0: return function () {
	      return fn.call(that);
	    };
	    case 1: return function (a) {
	      return fn.call(that, a);
	    };
	    case 2: return function (a, b) {
	      return fn.call(that, a, b);
	    };
	    case 3: return function (a, b, c) {
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function (/* ...args */) {
	    return fn.apply(that, arguments);
	  };
	};

	var objectDefineProperty = {};

	var isObject$7 = isObject$a;

	var anObject$8 = function (it) {
	  if (!isObject$7(it)) {
	    throw TypeError(String(it) + ' is not an object');
	  } return it;
	};

	var DESCRIPTORS$4 = descriptors;
	var IE8_DOM_DEFINE = ie8DomDefine;
	var anObject$7 = anObject$8;
	var toPrimitive$1 = toPrimitive$3;

	// eslint-disable-next-line es/no-object-defineproperty -- safe
	var $defineProperty = Object.defineProperty;

	// `Object.defineProperty` method
	// https://tc39.es/ecma262/#sec-object.defineproperty
	objectDefineProperty.f = DESCRIPTORS$4 ? $defineProperty : function defineProperty(O, P, Attributes) {
	  anObject$7(O);
	  P = toPrimitive$1(P, true);
	  anObject$7(Attributes);
	  if (IE8_DOM_DEFINE) try {
	    return $defineProperty(O, P, Attributes);
	  } catch (error) { /* empty */ }
	  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
	  if ('value' in Attributes) O[P] = Attributes.value;
	  return O;
	};

	var DESCRIPTORS$3 = descriptors;
	var definePropertyModule$3 = objectDefineProperty;
	var createPropertyDescriptor$3 = createPropertyDescriptor$5;

	var createNonEnumerableProperty$9 = DESCRIPTORS$3 ? function (object, key, value) {
	  return definePropertyModule$3.f(object, key, createPropertyDescriptor$3(1, value));
	} : function (object, key, value) {
	  object[key] = value;
	  return object;
	};

	var global$f = global$h;
	var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;
	var isForced$1 = isForced_1;
	var path$5 = path$6;
	var bind$7 = functionBindContext;
	var createNonEnumerableProperty$8 = createNonEnumerableProperty$9;
	var has$6 = has$8;

	var wrapConstructor = function (NativeConstructor) {
	  var Wrapper = function (a, b, c) {
	    if (this instanceof NativeConstructor) {
	      switch (arguments.length) {
	        case 0: return new NativeConstructor();
	        case 1: return new NativeConstructor(a);
	        case 2: return new NativeConstructor(a, b);
	      } return new NativeConstructor(a, b, c);
	    } return NativeConstructor.apply(this, arguments);
	  };
	  Wrapper.prototype = NativeConstructor.prototype;
	  return Wrapper;
	};

	/*
	  options.target      - name of the target object
	  options.global      - target is the global object
	  options.stat        - export as static methods of target
	  options.proto       - export as prototype methods of target
	  options.real        - real prototype method for the `pure` version
	  options.forced      - export even if the native feature is available
	  options.bind        - bind methods to the target, required for the `pure` version
	  options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
	  options.unsafe      - use the simple assignment of property instead of delete + defineProperty
	  options.sham        - add a flag to not completely full polyfills
	  options.enumerable  - export as enumerable property
	  options.noTargetGet - prevent calling a getter on target
	*/
	var _export = function (options, source) {
	  var TARGET = options.target;
	  var GLOBAL = options.global;
	  var STATIC = options.stat;
	  var PROTO = options.proto;

	  var nativeSource = GLOBAL ? global$f : STATIC ? global$f[TARGET] : (global$f[TARGET] || {}).prototype;

	  var target = GLOBAL ? path$5 : path$5[TARGET] || (path$5[TARGET] = {});
	  var targetPrototype = target.prototype;

	  var FORCED, USE_NATIVE, VIRTUAL_PROTOTYPE;
	  var key, sourceProperty, targetProperty, nativeProperty, resultProperty, descriptor;

	  for (key in source) {
	    FORCED = isForced$1(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
	    // contains in native
	    USE_NATIVE = !FORCED && nativeSource && has$6(nativeSource, key);

	    targetProperty = target[key];

	    if (USE_NATIVE) if (options.noTargetGet) {
	      descriptor = getOwnPropertyDescriptor$1(nativeSource, key);
	      nativeProperty = descriptor && descriptor.value;
	    } else nativeProperty = nativeSource[key];

	    // export native or implementation
	    sourceProperty = (USE_NATIVE && nativeProperty) ? nativeProperty : source[key];

	    if (USE_NATIVE && typeof targetProperty === typeof sourceProperty) continue;

	    // bind timers to global for call from export context
	    if (options.bind && USE_NATIVE) resultProperty = bind$7(sourceProperty, global$f);
	    // wrap global constructors for prevent changs in this version
	    else if (options.wrap && USE_NATIVE) resultProperty = wrapConstructor(sourceProperty);
	    // make static versions for prototype methods
	    else if (PROTO && typeof sourceProperty == 'function') resultProperty = bind$7(Function.call, sourceProperty);
	    // default case
	    else resultProperty = sourceProperty;

	    // add a flag to not completely full polyfills
	    if (options.sham || (sourceProperty && sourceProperty.sham) || (targetProperty && targetProperty.sham)) {
	      createNonEnumerableProperty$8(resultProperty, 'sham', true);
	    }

	    target[key] = resultProperty;

	    if (PROTO) {
	      VIRTUAL_PROTOTYPE = TARGET + 'Prototype';
	      if (!has$6(path$5, VIRTUAL_PROTOTYPE)) {
	        createNonEnumerableProperty$8(path$5, VIRTUAL_PROTOTYPE, {});
	      }
	      // export virtual prototype methods
	      path$5[VIRTUAL_PROTOTYPE][key] = sourceProperty;
	      // export real prototype methods
	      if (options.real && targetPrototype && !targetPrototype[key]) {
	        createNonEnumerableProperty$8(targetPrototype, key, sourceProperty);
	      }
	    }
	  }
	};

	var ceil = Math.ceil;
	var floor = Math.floor;

	// `ToInteger` abstract operation
	// https://tc39.es/ecma262/#sec-tointeger
	var toInteger$3 = function (argument) {
	  return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
	};

	var toInteger$2 = toInteger$3;

	var min$1 = Math.min;

	// `ToLength` abstract operation
	// https://tc39.es/ecma262/#sec-tolength
	var toLength$5 = function (argument) {
	  return argument > 0 ? min$1(toInteger$2(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
	};

	var toInteger$1 = toInteger$3;

	var max$1 = Math.max;
	var min = Math.min;

	// Helper for a popular repeating case of the spec:
	// Let integer be ? ToInteger(index).
	// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
	var toAbsoluteIndex$2 = function (index, length) {
	  var integer = toInteger$1(index);
	  return integer < 0 ? max$1(integer + length, 0) : min(integer, length);
	};

	var toIndexedObject$3 = toIndexedObject$5;
	var toLength$4 = toLength$5;
	var toAbsoluteIndex$1 = toAbsoluteIndex$2;

	// `Array.prototype.{ indexOf, includes }` methods implementation
	var createMethod$3 = function (IS_INCLUDES) {
	  return function ($this, el, fromIndex) {
	    var O = toIndexedObject$3($this);
	    var length = toLength$4(O.length);
	    var index = toAbsoluteIndex$1(fromIndex, length);
	    var value;
	    // Array#includes uses SameValueZero equality algorithm
	    // eslint-disable-next-line no-self-compare -- NaN check
	    if (IS_INCLUDES && el != el) while (length > index) {
	      value = O[index++];
	      // eslint-disable-next-line no-self-compare -- NaN check
	      if (value != value) return true;
	    // Array#indexOf ignores holes, Array#includes - not
	    } else for (;length > index; index++) {
	      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
	    } return !IS_INCLUDES && -1;
	  };
	};

	var arrayIncludes = {
	  // `Array.prototype.includes` method
	  // https://tc39.es/ecma262/#sec-array.prototype.includes
	  includes: createMethod$3(true),
	  // `Array.prototype.indexOf` method
	  // https://tc39.es/ecma262/#sec-array.prototype.indexof
	  indexOf: createMethod$3(false)
	};

	var hiddenKeys$3 = {};

	var has$5 = has$8;
	var toIndexedObject$2 = toIndexedObject$5;
	var indexOf$4 = arrayIncludes.indexOf;
	var hiddenKeys$2 = hiddenKeys$3;

	var objectKeysInternal = function (object, names) {
	  var O = toIndexedObject$2(object);
	  var i = 0;
	  var result = [];
	  var key;
	  for (key in O) !has$5(hiddenKeys$2, key) && has$5(O, key) && result.push(key);
	  // Don't enum bug & hidden keys
	  while (names.length > i) if (has$5(O, key = names[i++])) {
	    ~indexOf$4(result, key) || result.push(key);
	  }
	  return result;
	};

	// IE8- don't enum bug keys
	var enumBugKeys$2 = [
	  'constructor',
	  'hasOwnProperty',
	  'isPrototypeOf',
	  'propertyIsEnumerable',
	  'toLocaleString',
	  'toString',
	  'valueOf'
	];

	var internalObjectKeys = objectKeysInternal;
	var enumBugKeys$1 = enumBugKeys$2;

	// `Object.keys` method
	// https://tc39.es/ecma262/#sec-object.keys
	// eslint-disable-next-line es/no-object-keys -- safe
	var objectKeys$2 = Object.keys || function keys(O) {
	  return internalObjectKeys(O, enumBugKeys$1);
	};

	var objectGetOwnPropertySymbols = {};

	// eslint-disable-next-line es/no-object-getownpropertysymbols -- safe
	objectGetOwnPropertySymbols.f = Object.getOwnPropertySymbols;

	var DESCRIPTORS$2 = descriptors;
	var fails$9 = fails$e;
	var objectKeys$1 = objectKeys$2;
	var getOwnPropertySymbolsModule = objectGetOwnPropertySymbols;
	var propertyIsEnumerableModule = objectPropertyIsEnumerable;
	var toObject$5 = toObject$7;
	var IndexedObject$2 = indexedObject;

	// eslint-disable-next-line es/no-object-assign -- safe
	var $assign = Object.assign;
	// eslint-disable-next-line es/no-object-defineproperty -- required for testing
	var defineProperty$1 = Object.defineProperty;

	// `Object.assign` method
	// https://tc39.es/ecma262/#sec-object.assign
	var objectAssign = !$assign || fails$9(function () {
	  // should have correct order of operations (Edge bug)
	  if (DESCRIPTORS$2 && $assign({ b: 1 }, $assign(defineProperty$1({}, 'a', {
	    enumerable: true,
	    get: function () {
	      defineProperty$1(this, 'b', {
	        value: 3,
	        enumerable: false
	      });
	    }
	  }), { b: 2 })).b !== 1) return true;
	  // should work with symbols and should have deterministic property order (V8 bug)
	  var A = {};
	  var B = {};
	  // eslint-disable-next-line es/no-symbol -- safe
	  var symbol = Symbol();
	  var alphabet = 'abcdefghijklmnopqrst';
	  A[symbol] = 7;
	  alphabet.split('').forEach(function (chr) { B[chr] = chr; });
	  return $assign({}, A)[symbol] != 7 || objectKeys$1($assign({}, B)).join('') != alphabet;
	}) ? function assign(target, source) { // eslint-disable-line no-unused-vars -- required for `.length`
	  var T = toObject$5(target);
	  var argumentsLength = arguments.length;
	  var index = 1;
	  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
	  var propertyIsEnumerable = propertyIsEnumerableModule.f;
	  while (argumentsLength > index) {
	    var S = IndexedObject$2(arguments[index++]);
	    var keys = getOwnPropertySymbols ? objectKeys$1(S).concat(getOwnPropertySymbols(S)) : objectKeys$1(S);
	    var length = keys.length;
	    var j = 0;
	    var key;
	    while (length > j) {
	      key = keys[j++];
	      if (!DESCRIPTORS$2 || propertyIsEnumerable.call(S, key)) T[key] = S[key];
	    }
	  } return T;
	} : $assign;

	var $$c = _export;
	var assign$2 = objectAssign;

	// `Object.assign` method
	// https://tc39.es/ecma262/#sec-object.assign
	// eslint-disable-next-line es/no-object-assign -- required for testing
	$$c({ target: 'Object', stat: true, forced: Object.assign !== assign$2 }, {
	  assign: assign$2
	});

	var path$4 = path$6;

	var assign$1 = path$4.Object.assign;

	var parent$7 = assign$1;

	var assign = parent$7;

	(function (module) {
		module.exports = assign;
	} (assign$3));

	var _Object$assign = /*@__PURE__*/getDefaultExportFromCjs(assign$3.exports);

	var forEach$5 = {exports: {}};

	var iterators = {};

	var global$e = global$h;
	var createNonEnumerableProperty$7 = createNonEnumerableProperty$9;

	var setGlobal$1 = function (key, value) {
	  try {
	    createNonEnumerableProperty$7(global$e, key, value);
	  } catch (error) {
	    global$e[key] = value;
	  } return value;
	};

	var global$d = global$h;
	var setGlobal = setGlobal$1;

	var SHARED = '__core-js_shared__';
	var store$3 = global$d[SHARED] || setGlobal(SHARED, {});

	var sharedStore = store$3;

	var store$2 = sharedStore;

	var functionToString = Function.toString;

	// this helper broken in `3.4.1-3.4.4`, so we can't use `shared` helper
	if (typeof store$2.inspectSource != 'function') {
	  store$2.inspectSource = function (it) {
	    return functionToString.call(it);
	  };
	}

	var inspectSource$2 = store$2.inspectSource;

	var global$c = global$h;
	var inspectSource$1 = inspectSource$2;

	var WeakMap$2 = global$c.WeakMap;

	var nativeWeakMap = typeof WeakMap$2 === 'function' && /native code/.test(inspectSource$1(WeakMap$2));

	var shared$3 = {exports: {}};

	var isPure = true;

	var store$1 = sharedStore;

	(shared$3.exports = function (key, value) {
	  return store$1[key] || (store$1[key] = value !== undefined ? value : {});
	})('versions', []).push({
	  version: '3.12.1',
	  mode: 'pure' ,
	  copyright: '© 2021 Denis Pushkarev (zloirock.ru)'
	});

	var id = 0;
	var postfix = Math.random();

	var uid$2 = function (key) {
	  return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
	};

	var shared$2 = shared$3.exports;
	var uid$1 = uid$2;

	var keys$3 = shared$2('keys');

	var sharedKey$3 = function (key) {
	  return keys$3[key] || (keys$3[key] = uid$1(key));
	};

	var NATIVE_WEAK_MAP = nativeWeakMap;
	var global$b = global$h;
	var isObject$6 = isObject$a;
	var createNonEnumerableProperty$6 = createNonEnumerableProperty$9;
	var objectHas = has$8;
	var shared$1 = sharedStore;
	var sharedKey$2 = sharedKey$3;
	var hiddenKeys$1 = hiddenKeys$3;

	var OBJECT_ALREADY_INITIALIZED = 'Object already initialized';
	var WeakMap$1 = global$b.WeakMap;
	var set$1, get$1, has$4;

	var enforce = function (it) {
	  return has$4(it) ? get$1(it) : set$1(it, {});
	};

	var getterFor = function (TYPE) {
	  return function (it) {
	    var state;
	    if (!isObject$6(it) || (state = get$1(it)).type !== TYPE) {
	      throw TypeError('Incompatible receiver, ' + TYPE + ' required');
	    } return state;
	  };
	};

	if (NATIVE_WEAK_MAP || shared$1.state) {
	  var store = shared$1.state || (shared$1.state = new WeakMap$1());
	  var wmget = store.get;
	  var wmhas = store.has;
	  var wmset = store.set;
	  set$1 = function (it, metadata) {
	    if (wmhas.call(store, it)) throw new TypeError(OBJECT_ALREADY_INITIALIZED);
	    metadata.facade = it;
	    wmset.call(store, it, metadata);
	    return metadata;
	  };
	  get$1 = function (it) {
	    return wmget.call(store, it) || {};
	  };
	  has$4 = function (it) {
	    return wmhas.call(store, it);
	  };
	} else {
	  var STATE = sharedKey$2('state');
	  hiddenKeys$1[STATE] = true;
	  set$1 = function (it, metadata) {
	    if (objectHas(it, STATE)) throw new TypeError(OBJECT_ALREADY_INITIALIZED);
	    metadata.facade = it;
	    createNonEnumerableProperty$6(it, STATE, metadata);
	    return metadata;
	  };
	  get$1 = function (it) {
	    return objectHas(it, STATE) ? it[STATE] : {};
	  };
	  has$4 = function (it) {
	    return objectHas(it, STATE);
	  };
	}

	var internalState = {
	  set: set$1,
	  get: get$1,
	  has: has$4,
	  enforce: enforce,
	  getterFor: getterFor
	};

	var fails$8 = fails$e;

	var correctPrototypeGetter = !fails$8(function () {
	  function F() { /* empty */ }
	  F.prototype.constructor = null;
	  // eslint-disable-next-line es/no-object-getprototypeof -- required for testing
	  return Object.getPrototypeOf(new F()) !== F.prototype;
	});

	var has$3 = has$8;
	var toObject$4 = toObject$7;
	var sharedKey$1 = sharedKey$3;
	var CORRECT_PROTOTYPE_GETTER = correctPrototypeGetter;

	var IE_PROTO$1 = sharedKey$1('IE_PROTO');
	var ObjectPrototype = Object.prototype;

	// `Object.getPrototypeOf` method
	// https://tc39.es/ecma262/#sec-object.getprototypeof
	// eslint-disable-next-line es/no-object-getprototypeof -- safe
	var objectGetPrototypeOf = CORRECT_PROTOTYPE_GETTER ? Object.getPrototypeOf : function (O) {
	  O = toObject$4(O);
	  if (has$3(O, IE_PROTO$1)) return O[IE_PROTO$1];
	  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
	    return O.constructor.prototype;
	  } return O instanceof Object ? ObjectPrototype : null;
	};

	var path$3 = path$6;
	var global$a = global$h;

	var aFunction$7 = function (variable) {
	  return typeof variable == 'function' ? variable : undefined;
	};

	var getBuiltIn$6 = function (namespace, method) {
	  return arguments.length < 2 ? aFunction$7(path$3[namespace]) || aFunction$7(global$a[namespace])
	    : path$3[namespace] && path$3[namespace][method] || global$a[namespace] && global$a[namespace][method];
	};

	var getBuiltIn$5 = getBuiltIn$6;

	var engineUserAgent = getBuiltIn$5('navigator', 'userAgent') || '';

	var global$9 = global$h;
	var userAgent$2 = engineUserAgent;

	var process$4 = global$9.process;
	var versions = process$4 && process$4.versions;
	var v8 = versions && versions.v8;
	var match, version;

	if (v8) {
	  match = v8.split('.');
	  version = match[0] < 4 ? 1 : match[0] + match[1];
	} else if (userAgent$2) {
	  match = userAgent$2.match(/Edge\/(\d+)/);
	  if (!match || match[1] >= 74) {
	    match = userAgent$2.match(/Chrome\/(\d+)/);
	    if (match) version = match[1];
	  }
	}

	var engineV8Version = version && +version;

	/* eslint-disable es/no-symbol -- required for testing */

	var V8_VERSION$2 = engineV8Version;
	var fails$7 = fails$e;

	// eslint-disable-next-line es/no-object-getownpropertysymbols -- required for testing
	var nativeSymbol = !!Object.getOwnPropertySymbols && !fails$7(function () {
	  return !String(Symbol()) ||
	    // Chrome 38 Symbol has incorrect toString conversion
	    // Chrome 38-40 symbols are not inherited from DOM collections prototypes to instances
	    !Symbol.sham && V8_VERSION$2 && V8_VERSION$2 < 41;
	});

	/* eslint-disable es/no-symbol -- required for testing */

	var NATIVE_SYMBOL$1 = nativeSymbol;

	var useSymbolAsUid = NATIVE_SYMBOL$1
	  && !Symbol.sham
	  && typeof Symbol.iterator == 'symbol';

	var global$8 = global$h;
	var shared = shared$3.exports;
	var has$2 = has$8;
	var uid = uid$2;
	var NATIVE_SYMBOL = nativeSymbol;
	var USE_SYMBOL_AS_UID = useSymbolAsUid;

	var WellKnownSymbolsStore = shared('wks');
	var Symbol$1 = global$8.Symbol;
	var createWellKnownSymbol = USE_SYMBOL_AS_UID ? Symbol$1 : Symbol$1 && Symbol$1.withoutSetter || uid;

	var wellKnownSymbol$f = function (name) {
	  if (!has$2(WellKnownSymbolsStore, name) || !(NATIVE_SYMBOL || typeof WellKnownSymbolsStore[name] == 'string')) {
	    if (NATIVE_SYMBOL && has$2(Symbol$1, name)) {
	      WellKnownSymbolsStore[name] = Symbol$1[name];
	    } else {
	      WellKnownSymbolsStore[name] = createWellKnownSymbol('Symbol.' + name);
	    }
	  } return WellKnownSymbolsStore[name];
	};

	var fails$6 = fails$e;
	var getPrototypeOf$2 = objectGetPrototypeOf;
	var createNonEnumerableProperty$5 = createNonEnumerableProperty$9;
	var has$1 = has$8;
	var wellKnownSymbol$e = wellKnownSymbol$f;

	var ITERATOR$4 = wellKnownSymbol$e('iterator');
	var BUGGY_SAFARI_ITERATORS$1 = false;

	var returnThis$2 = function () { return this; };

	// `%IteratorPrototype%` object
	// https://tc39.es/ecma262/#sec-%iteratorprototype%-object
	var IteratorPrototype$2, PrototypeOfArrayIteratorPrototype, arrayIterator;

	/* eslint-disable es/no-array-prototype-keys -- safe */
	if ([].keys) {
	  arrayIterator = [].keys();
	  // Safari 8 has buggy iterators w/o `next`
	  if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS$1 = true;
	  else {
	    PrototypeOfArrayIteratorPrototype = getPrototypeOf$2(getPrototypeOf$2(arrayIterator));
	    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype$2 = PrototypeOfArrayIteratorPrototype;
	  }
	}

	var NEW_ITERATOR_PROTOTYPE = IteratorPrototype$2 == undefined || fails$6(function () {
	  var test = {};
	  // FF44- legacy iterators case
	  return IteratorPrototype$2[ITERATOR$4].call(test) !== test;
	});

	if (NEW_ITERATOR_PROTOTYPE) IteratorPrototype$2 = {};

	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	if ((NEW_ITERATOR_PROTOTYPE) && !has$1(IteratorPrototype$2, ITERATOR$4)) {
	  createNonEnumerableProperty$5(IteratorPrototype$2, ITERATOR$4, returnThis$2);
	}

	var iteratorsCore = {
	  IteratorPrototype: IteratorPrototype$2,
	  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS$1
	};

	var DESCRIPTORS$1 = descriptors;
	var definePropertyModule$2 = objectDefineProperty;
	var anObject$6 = anObject$8;
	var objectKeys = objectKeys$2;

	// `Object.defineProperties` method
	// https://tc39.es/ecma262/#sec-object.defineproperties
	// eslint-disable-next-line es/no-object-defineproperties -- safe
	var objectDefineProperties = DESCRIPTORS$1 ? Object.defineProperties : function defineProperties(O, Properties) {
	  anObject$6(O);
	  var keys = objectKeys(Properties);
	  var length = keys.length;
	  var index = 0;
	  var key;
	  while (length > index) definePropertyModule$2.f(O, key = keys[index++], Properties[key]);
	  return O;
	};

	var getBuiltIn$4 = getBuiltIn$6;

	var html$2 = getBuiltIn$4('document', 'documentElement');

	var anObject$5 = anObject$8;
	var defineProperties = objectDefineProperties;
	var enumBugKeys = enumBugKeys$2;
	var hiddenKeys = hiddenKeys$3;
	var html$1 = html$2;
	var documentCreateElement = documentCreateElement$1;
	var sharedKey = sharedKey$3;

	var GT = '>';
	var LT = '<';
	var PROTOTYPE = 'prototype';
	var SCRIPT = 'script';
	var IE_PROTO = sharedKey('IE_PROTO');

	var EmptyConstructor = function () { /* empty */ };

	var scriptTag = function (content) {
	  return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
	};

	// Create object with fake `null` prototype: use ActiveX Object with cleared prototype
	var NullProtoObjectViaActiveX = function (activeXDocument) {
	  activeXDocument.write(scriptTag(''));
	  activeXDocument.close();
	  var temp = activeXDocument.parentWindow.Object;
	  activeXDocument = null; // avoid memory leak
	  return temp;
	};

	// Create object with fake `null` prototype: use iframe Object with cleared prototype
	var NullProtoObjectViaIFrame = function () {
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = documentCreateElement('iframe');
	  var JS = 'java' + SCRIPT + ':';
	  var iframeDocument;
	  iframe.style.display = 'none';
	  html$1.appendChild(iframe);
	  // https://github.com/zloirock/core-js/issues/475
	  iframe.src = String(JS);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write(scriptTag('document.F=Object'));
	  iframeDocument.close();
	  return iframeDocument.F;
	};

	// Check for document.domain and active x support
	// No need to use active x approach when document.domain is not set
	// see https://github.com/es-shims/es5-shim/issues/150
	// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
	// avoid IE GC bug
	var activeXDocument;
	var NullProtoObject = function () {
	  try {
	    /* global ActiveXObject -- old IE */
	    activeXDocument = document.domain && new ActiveXObject('htmlfile');
	  } catch (error) { /* ignore */ }
	  NullProtoObject = activeXDocument ? NullProtoObjectViaActiveX(activeXDocument) : NullProtoObjectViaIFrame();
	  var length = enumBugKeys.length;
	  while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];
	  return NullProtoObject();
	};

	hiddenKeys[IE_PROTO] = true;

	// `Object.create` method
	// https://tc39.es/ecma262/#sec-object.create
	var objectCreate = Object.create || function create(O, Properties) {
	  var result;
	  if (O !== null) {
	    EmptyConstructor[PROTOTYPE] = anObject$5(O);
	    result = new EmptyConstructor();
	    EmptyConstructor[PROTOTYPE] = null;
	    // add "__proto__" for Object.getPrototypeOf polyfill
	    result[IE_PROTO] = O;
	  } else result = NullProtoObject();
	  return Properties === undefined ? result : defineProperties(result, Properties);
	};

	var wellKnownSymbol$d = wellKnownSymbol$f;

	var TO_STRING_TAG$3 = wellKnownSymbol$d('toStringTag');
	var test$1 = {};

	test$1[TO_STRING_TAG$3] = 'z';

	var toStringTagSupport = String(test$1) === '[object z]';

	var TO_STRING_TAG_SUPPORT$2 = toStringTagSupport;
	var classofRaw = classofRaw$1;
	var wellKnownSymbol$c = wellKnownSymbol$f;

	var TO_STRING_TAG$2 = wellKnownSymbol$c('toStringTag');
	// ES3 wrong here
	var CORRECT_ARGUMENTS = classofRaw(function () { return arguments; }()) == 'Arguments';

	// fallback for IE11 Script Access Denied error
	var tryGet = function (it, key) {
	  try {
	    return it[key];
	  } catch (error) { /* empty */ }
	};

	// getting tag from ES6+ `Object.prototype.toString`
	var classof$6 = TO_STRING_TAG_SUPPORT$2 ? classofRaw : function (it) {
	  var O, tag, result;
	  return it === undefined ? 'Undefined' : it === null ? 'Null'
	    // @@toStringTag case
	    : typeof (tag = tryGet(O = Object(it), TO_STRING_TAG$2)) == 'string' ? tag
	    // builtinTag case
	    : CORRECT_ARGUMENTS ? classofRaw(O)
	    // ES3 arguments fallback
	    : (result = classofRaw(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : result;
	};

	var TO_STRING_TAG_SUPPORT$1 = toStringTagSupport;
	var classof$5 = classof$6;

	// `Object.prototype.toString` method implementation
	// https://tc39.es/ecma262/#sec-object.prototype.tostring
	var objectToString = TO_STRING_TAG_SUPPORT$1 ? {}.toString : function toString() {
	  return '[object ' + classof$5(this) + ']';
	};

	var TO_STRING_TAG_SUPPORT = toStringTagSupport;
	var defineProperty = objectDefineProperty.f;
	var createNonEnumerableProperty$4 = createNonEnumerableProperty$9;
	var has = has$8;
	var toString$1 = objectToString;
	var wellKnownSymbol$b = wellKnownSymbol$f;

	var TO_STRING_TAG$1 = wellKnownSymbol$b('toStringTag');

	var setToStringTag$3 = function (it, TAG, STATIC, SET_METHOD) {
	  if (it) {
	    var target = STATIC ? it : it.prototype;
	    if (!has(target, TO_STRING_TAG$1)) {
	      defineProperty(target, TO_STRING_TAG$1, { configurable: true, value: TAG });
	    }
	    if (SET_METHOD && !TO_STRING_TAG_SUPPORT) {
	      createNonEnumerableProperty$4(target, 'toString', toString$1);
	    }
	  }
	};

	var IteratorPrototype$1 = iteratorsCore.IteratorPrototype;
	var create$1 = objectCreate;
	var createPropertyDescriptor$2 = createPropertyDescriptor$5;
	var setToStringTag$2 = setToStringTag$3;
	var Iterators$5 = iterators;

	var returnThis$1 = function () { return this; };

	var createIteratorConstructor$1 = function (IteratorConstructor, NAME, next) {
	  var TO_STRING_TAG = NAME + ' Iterator';
	  IteratorConstructor.prototype = create$1(IteratorPrototype$1, { next: createPropertyDescriptor$2(1, next) });
	  setToStringTag$2(IteratorConstructor, TO_STRING_TAG, false, true);
	  Iterators$5[TO_STRING_TAG] = returnThis$1;
	  return IteratorConstructor;
	};

	var isObject$5 = isObject$a;

	var aPossiblePrototype$1 = function (it) {
	  if (!isObject$5(it) && it !== null) {
	    throw TypeError("Can't set " + String(it) + ' as a prototype');
	  } return it;
	};

	/* eslint-disable no-proto -- safe */

	var anObject$4 = anObject$8;
	var aPossiblePrototype = aPossiblePrototype$1;

	// `Object.setPrototypeOf` method
	// https://tc39.es/ecma262/#sec-object.setprototypeof
	// Works with __proto__ only. Old v8 can't work with null proto objects.
	// eslint-disable-next-line es/no-object-setprototypeof -- safe
	var objectSetPrototypeOf = Object.setPrototypeOf || ('__proto__' in {} ? function () {
	  var CORRECT_SETTER = false;
	  var test = {};
	  var setter;
	  try {
	    // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	    setter = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set;
	    setter.call(test, []);
	    CORRECT_SETTER = test instanceof Array;
	  } catch (error) { /* empty */ }
	  return function setPrototypeOf(O, proto) {
	    anObject$4(O);
	    aPossiblePrototype(proto);
	    if (CORRECT_SETTER) setter.call(O, proto);
	    else O.__proto__ = proto;
	    return O;
	  };
	}() : undefined);

	var createNonEnumerableProperty$3 = createNonEnumerableProperty$9;

	var redefine$2 = function (target, key, value, options) {
	  if (options && options.enumerable) target[key] = value;
	  else createNonEnumerableProperty$3(target, key, value);
	};

	var $$b = _export;
	var createIteratorConstructor = createIteratorConstructor$1;
	var getPrototypeOf$1 = objectGetPrototypeOf;
	var setToStringTag$1 = setToStringTag$3;
	var createNonEnumerableProperty$2 = createNonEnumerableProperty$9;
	var redefine$1 = redefine$2;
	var wellKnownSymbol$a = wellKnownSymbol$f;
	var Iterators$4 = iterators;
	var IteratorsCore = iteratorsCore;

	var IteratorPrototype = IteratorsCore.IteratorPrototype;
	var BUGGY_SAFARI_ITERATORS = IteratorsCore.BUGGY_SAFARI_ITERATORS;
	var ITERATOR$3 = wellKnownSymbol$a('iterator');
	var KEYS = 'keys';
	var VALUES = 'values';
	var ENTRIES = 'entries';

	var returnThis = function () { return this; };

	var defineIterator$2 = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
	  createIteratorConstructor(IteratorConstructor, NAME, next);

	  var getIterationMethod = function (KIND) {
	    if (KIND === DEFAULT && defaultIterator) return defaultIterator;
	    if (!BUGGY_SAFARI_ITERATORS && KIND in IterablePrototype) return IterablePrototype[KIND];
	    switch (KIND) {
	      case KEYS: return function keys() { return new IteratorConstructor(this, KIND); };
	      case VALUES: return function values() { return new IteratorConstructor(this, KIND); };
	      case ENTRIES: return function entries() { return new IteratorConstructor(this, KIND); };
	    } return function () { return new IteratorConstructor(this); };
	  };

	  var TO_STRING_TAG = NAME + ' Iterator';
	  var INCORRECT_VALUES_NAME = false;
	  var IterablePrototype = Iterable.prototype;
	  var nativeIterator = IterablePrototype[ITERATOR$3]
	    || IterablePrototype['@@iterator']
	    || DEFAULT && IterablePrototype[DEFAULT];
	  var defaultIterator = !BUGGY_SAFARI_ITERATORS && nativeIterator || getIterationMethod(DEFAULT);
	  var anyNativeIterator = NAME == 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
	  var CurrentIteratorPrototype, methods, KEY;

	  // fix native
	  if (anyNativeIterator) {
	    CurrentIteratorPrototype = getPrototypeOf$1(anyNativeIterator.call(new Iterable()));
	    if (IteratorPrototype !== Object.prototype && CurrentIteratorPrototype.next) {
	      // Set @@toStringTag to native iterators
	      setToStringTag$1(CurrentIteratorPrototype, TO_STRING_TAG, true, true);
	      Iterators$4[TO_STRING_TAG] = returnThis;
	    }
	  }

	  // fix Array#{values, @@iterator}.name in V8 / FF
	  if (DEFAULT == VALUES && nativeIterator && nativeIterator.name !== VALUES) {
	    INCORRECT_VALUES_NAME = true;
	    defaultIterator = function values() { return nativeIterator.call(this); };
	  }

	  // define iterator
	  if ((FORCED) && IterablePrototype[ITERATOR$3] !== defaultIterator) {
	    createNonEnumerableProperty$2(IterablePrototype, ITERATOR$3, defaultIterator);
	  }
	  Iterators$4[NAME] = defaultIterator;

	  // export additional methods
	  if (DEFAULT) {
	    methods = {
	      values: getIterationMethod(VALUES),
	      keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
	      entries: getIterationMethod(ENTRIES)
	    };
	    if (FORCED) for (KEY in methods) {
	      if (BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
	        redefine$1(IterablePrototype, KEY, methods[KEY]);
	      }
	    } else $$b({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME }, methods);
	  }

	  return methods;
	};

	var toIndexedObject$1 = toIndexedObject$5;
	var Iterators$3 = iterators;
	var InternalStateModule$2 = internalState;
	var defineIterator$1 = defineIterator$2;

	var ARRAY_ITERATOR = 'Array Iterator';
	var setInternalState$2 = InternalStateModule$2.set;
	var getInternalState$2 = InternalStateModule$2.getterFor(ARRAY_ITERATOR);

	// `Array.prototype.entries` method
	// https://tc39.es/ecma262/#sec-array.prototype.entries
	// `Array.prototype.keys` method
	// https://tc39.es/ecma262/#sec-array.prototype.keys
	// `Array.prototype.values` method
	// https://tc39.es/ecma262/#sec-array.prototype.values
	// `Array.prototype[@@iterator]` method
	// https://tc39.es/ecma262/#sec-array.prototype-@@iterator
	// `CreateArrayIterator` internal method
	// https://tc39.es/ecma262/#sec-createarrayiterator
	defineIterator$1(Array, 'Array', function (iterated, kind) {
	  setInternalState$2(this, {
	    type: ARRAY_ITERATOR,
	    target: toIndexedObject$1(iterated), // target
	    index: 0,                          // next index
	    kind: kind                         // kind
	  });
	// `%ArrayIteratorPrototype%.next` method
	// https://tc39.es/ecma262/#sec-%arrayiteratorprototype%.next
	}, function () {
	  var state = getInternalState$2(this);
	  var target = state.target;
	  var kind = state.kind;
	  var index = state.index++;
	  if (!target || index >= target.length) {
	    state.target = undefined;
	    return { value: undefined, done: true };
	  }
	  if (kind == 'keys') return { value: index, done: false };
	  if (kind == 'values') return { value: target[index], done: false };
	  return { value: [index, target[index]], done: false };
	}, 'values');

	// argumentsList[@@iterator] is %ArrayProto_values%
	// https://tc39.es/ecma262/#sec-createunmappedargumentsobject
	// https://tc39.es/ecma262/#sec-createmappedargumentsobject
	Iterators$3.Arguments = Iterators$3.Array;

	// iterable DOM collections
	// flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
	var domIterables = {
	  CSSRuleList: 0,
	  CSSStyleDeclaration: 0,
	  CSSValueList: 0,
	  ClientRectList: 0,
	  DOMRectList: 0,
	  DOMStringList: 0,
	  DOMTokenList: 1,
	  DataTransferItemList: 0,
	  FileList: 0,
	  HTMLAllCollection: 0,
	  HTMLCollection: 0,
	  HTMLFormElement: 0,
	  HTMLSelectElement: 0,
	  MediaList: 0,
	  MimeTypeArray: 0,
	  NamedNodeMap: 0,
	  NodeList: 1,
	  PaintRequestList: 0,
	  Plugin: 0,
	  PluginArray: 0,
	  SVGLengthList: 0,
	  SVGNumberList: 0,
	  SVGPathSegList: 0,
	  SVGPointList: 0,
	  SVGStringList: 0,
	  SVGTransformList: 0,
	  SourceBufferList: 0,
	  StyleSheetList: 0,
	  TextTrackCueList: 0,
	  TextTrackList: 0,
	  TouchList: 0
	};

	var DOMIterables$1 = domIterables;
	var global$7 = global$h;
	var classof$4 = classof$6;
	var createNonEnumerableProperty$1 = createNonEnumerableProperty$9;
	var Iterators$2 = iterators;
	var wellKnownSymbol$9 = wellKnownSymbol$f;

	var TO_STRING_TAG = wellKnownSymbol$9('toStringTag');

	for (var COLLECTION_NAME in DOMIterables$1) {
	  var Collection = global$7[COLLECTION_NAME];
	  var CollectionPrototype = Collection && Collection.prototype;
	  if (CollectionPrototype && classof$4(CollectionPrototype) !== TO_STRING_TAG) {
	    createNonEnumerableProperty$1(CollectionPrototype, TO_STRING_TAG, COLLECTION_NAME);
	  }
	  Iterators$2[COLLECTION_NAME] = Iterators$2.Array;
	}

	var classof$3 = classofRaw$1;

	// `IsArray` abstract operation
	// https://tc39.es/ecma262/#sec-isarray
	// eslint-disable-next-line es/no-array-isarray -- safe
	var isArray$3 = Array.isArray || function isArray(arg) {
	  return classof$3(arg) == 'Array';
	};

	var isObject$4 = isObject$a;
	var isArray$2 = isArray$3;
	var wellKnownSymbol$8 = wellKnownSymbol$f;

	var SPECIES$5 = wellKnownSymbol$8('species');

	// `ArraySpeciesCreate` abstract operation
	// https://tc39.es/ecma262/#sec-arrayspeciescreate
	var arraySpeciesCreate$1 = function (originalArray, length) {
	  var C;
	  if (isArray$2(originalArray)) {
	    C = originalArray.constructor;
	    // cross-realm fallback
	    if (typeof C == 'function' && (C === Array || isArray$2(C.prototype))) C = undefined;
	    else if (isObject$4(C)) {
	      C = C[SPECIES$5];
	      if (C === null) C = undefined;
	    }
	  } return new (C === undefined ? Array : C)(length === 0 ? 0 : length);
	};

	var bind$6 = functionBindContext;
	var IndexedObject$1 = indexedObject;
	var toObject$3 = toObject$7;
	var toLength$3 = toLength$5;
	var arraySpeciesCreate = arraySpeciesCreate$1;

	var push = [].push;

	// `Array.prototype.{ forEach, map, filter, some, every, find, findIndex, filterOut }` methods implementation
	var createMethod$2 = function (TYPE) {
	  var IS_MAP = TYPE == 1;
	  var IS_FILTER = TYPE == 2;
	  var IS_SOME = TYPE == 3;
	  var IS_EVERY = TYPE == 4;
	  var IS_FIND_INDEX = TYPE == 6;
	  var IS_FILTER_OUT = TYPE == 7;
	  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
	  return function ($this, callbackfn, that, specificCreate) {
	    var O = toObject$3($this);
	    var self = IndexedObject$1(O);
	    var boundFunction = bind$6(callbackfn, that, 3);
	    var length = toLength$3(self.length);
	    var index = 0;
	    var create = specificCreate || arraySpeciesCreate;
	    var target = IS_MAP ? create($this, length) : IS_FILTER || IS_FILTER_OUT ? create($this, 0) : undefined;
	    var value, result;
	    for (;length > index; index++) if (NO_HOLES || index in self) {
	      value = self[index];
	      result = boundFunction(value, index, O);
	      if (TYPE) {
	        if (IS_MAP) target[index] = result; // map
	        else if (result) switch (TYPE) {
	          case 3: return true;              // some
	          case 5: return value;             // find
	          case 6: return index;             // findIndex
	          case 2: push.call(target, value); // filter
	        } else switch (TYPE) {
	          case 4: return false;             // every
	          case 7: push.call(target, value); // filterOut
	        }
	      }
	    }
	    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
	  };
	};

	var arrayIteration = {
	  // `Array.prototype.forEach` method
	  // https://tc39.es/ecma262/#sec-array.prototype.foreach
	  forEach: createMethod$2(0),
	  // `Array.prototype.map` method
	  // https://tc39.es/ecma262/#sec-array.prototype.map
	  map: createMethod$2(1),
	  // `Array.prototype.filter` method
	  // https://tc39.es/ecma262/#sec-array.prototype.filter
	  filter: createMethod$2(2),
	  // `Array.prototype.some` method
	  // https://tc39.es/ecma262/#sec-array.prototype.some
	  some: createMethod$2(3),
	  // `Array.prototype.every` method
	  // https://tc39.es/ecma262/#sec-array.prototype.every
	  every: createMethod$2(4),
	  // `Array.prototype.find` method
	  // https://tc39.es/ecma262/#sec-array.prototype.find
	  find: createMethod$2(5),
	  // `Array.prototype.findIndex` method
	  // https://tc39.es/ecma262/#sec-array.prototype.findIndex
	  findIndex: createMethod$2(6),
	  // `Array.prototype.filterOut` method
	  // https://github.com/tc39/proposal-array-filtering
	  filterOut: createMethod$2(7)
	};

	var fails$5 = fails$e;

	var arrayMethodIsStrict$4 = function (METHOD_NAME, argument) {
	  var method = [][METHOD_NAME];
	  return !!method && fails$5(function () {
	    // eslint-disable-next-line no-useless-call,no-throw-literal -- required for testing
	    method.call(null, argument || function () { throw 1; }, 1);
	  });
	};

	var $forEach = arrayIteration.forEach;
	var arrayMethodIsStrict$3 = arrayMethodIsStrict$4;

	var STRICT_METHOD$3 = arrayMethodIsStrict$3('forEach');

	// `Array.prototype.forEach` method implementation
	// https://tc39.es/ecma262/#sec-array.prototype.foreach
	var arrayForEach = !STRICT_METHOD$3 ? function forEach(callbackfn /* , thisArg */) {
	  return $forEach(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	// eslint-disable-next-line es/no-array-prototype-foreach -- safe
	} : [].forEach;

	var $$a = _export;
	var forEach$4 = arrayForEach;

	// `Array.prototype.forEach` method
	// https://tc39.es/ecma262/#sec-array.prototype.foreach
	// eslint-disable-next-line es/no-array-prototype-foreach -- safe
	$$a({ target: 'Array', proto: true, forced: [].forEach != forEach$4 }, {
	  forEach: forEach$4
	});

	var path$2 = path$6;

	var entryVirtual$5 = function (CONSTRUCTOR) {
	  return path$2[CONSTRUCTOR + 'Prototype'];
	};

	var entryVirtual$4 = entryVirtual$5;

	var forEach$3 = entryVirtual$4('Array').forEach;

	var parent$6 = forEach$3;

	var forEach$2 = parent$6;

	var forEach$1 = forEach$2;
	var classof$2 = classof$6;
	var ArrayPrototype$5 = Array.prototype;

	var DOMIterables = {
	  DOMTokenList: true,
	  NodeList: true
	};

	var forEach_1 = function (it) {
	  var own = it.forEach;
	  return it === ArrayPrototype$5 || (it instanceof Array && own === ArrayPrototype$5.forEach)
	    // eslint-disable-next-line no-prototype-builtins -- safe
	    || DOMIterables.hasOwnProperty(classof$2(it)) ? forEach$1 : own;
	};

	(function (module) {
		module.exports = forEach_1;
	} (forEach$5));

	var _forEachInstanceProperty = /*@__PURE__*/getDefaultExportFromCjs(forEach$5.exports);

	var keys$2 = {exports: {}};

	var $$9 = _export;
	var toObject$2 = toObject$7;
	var nativeKeys = objectKeys$2;
	var fails$4 = fails$e;

	var FAILS_ON_PRIMITIVES = fails$4(function () { nativeKeys(1); });

	// `Object.keys` method
	// https://tc39.es/ecma262/#sec-object.keys
	$$9({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES }, {
	  keys: function keys(it) {
	    return nativeKeys(toObject$2(it));
	  }
	});

	var path$1 = path$6;

	var keys$1 = path$1.Object.keys;

	var parent$5 = keys$1;

	var keys = parent$5;

	(function (module) {
		module.exports = keys;
	} (keys$2));

	var _Object$keys = /*@__PURE__*/getDefaultExportFromCjs(keys$2.exports);

	var reduce$3 = {exports: {}};

	var aFunction$6 = aFunction$9;
	var toObject$1 = toObject$7;
	var IndexedObject = indexedObject;
	var toLength$2 = toLength$5;

	// `Array.prototype.{ reduce, reduceRight }` methods implementation
	var createMethod$1 = function (IS_RIGHT) {
	  return function (that, callbackfn, argumentsLength, memo) {
	    aFunction$6(callbackfn);
	    var O = toObject$1(that);
	    var self = IndexedObject(O);
	    var length = toLength$2(O.length);
	    var index = IS_RIGHT ? length - 1 : 0;
	    var i = IS_RIGHT ? -1 : 1;
	    if (argumentsLength < 2) while (true) {
	      if (index in self) {
	        memo = self[index];
	        index += i;
	        break;
	      }
	      index += i;
	      if (IS_RIGHT ? index < 0 : length <= index) {
	        throw TypeError('Reduce of empty array with no initial value');
	      }
	    }
	    for (;IS_RIGHT ? index >= 0 : length > index; index += i) if (index in self) {
	      memo = callbackfn(memo, self[index], index, O);
	    }
	    return memo;
	  };
	};

	var arrayReduce = {
	  // `Array.prototype.reduce` method
	  // https://tc39.es/ecma262/#sec-array.prototype.reduce
	  left: createMethod$1(false),
	  // `Array.prototype.reduceRight` method
	  // https://tc39.es/ecma262/#sec-array.prototype.reduceright
	  right: createMethod$1(true)
	};

	var classof$1 = classofRaw$1;
	var global$6 = global$h;

	var engineIsNode = classof$1(global$6.process) == 'process';

	var $$8 = _export;
	var $reduce = arrayReduce.left;
	var arrayMethodIsStrict$2 = arrayMethodIsStrict$4;
	var CHROME_VERSION = engineV8Version;
	var IS_NODE$3 = engineIsNode;

	var STRICT_METHOD$2 = arrayMethodIsStrict$2('reduce');
	// Chrome 80-82 has a critical bug
	// https://bugs.chromium.org/p/chromium/issues/detail?id=1049982
	var CHROME_BUG = !IS_NODE$3 && CHROME_VERSION > 79 && CHROME_VERSION < 83;

	// `Array.prototype.reduce` method
	// https://tc39.es/ecma262/#sec-array.prototype.reduce
	$$8({ target: 'Array', proto: true, forced: !STRICT_METHOD$2 || CHROME_BUG }, {
	  reduce: function reduce(callbackfn /* , initialValue */) {
	    return $reduce(this, callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	var entryVirtual$3 = entryVirtual$5;

	var reduce$2 = entryVirtual$3('Array').reduce;

	var reduce$1 = reduce$2;

	var ArrayPrototype$4 = Array.prototype;

	var reduce_1 = function (it) {
	  var own = it.reduce;
	  return it === ArrayPrototype$4 || (it instanceof Array && own === ArrayPrototype$4.reduce) ? reduce$1 : own;
	};

	var parent$4 = reduce_1;

	var reduce = parent$4;

	(function (module) {
		module.exports = reduce;
	} (reduce$3));

	var _reduceInstanceProperty = /*@__PURE__*/getDefaultExportFromCjs(reduce$3.exports);

	var promise$4 = {exports: {}};

	var wellKnownSymbol$7 = wellKnownSymbol$f;
	var Iterators$1 = iterators;

	var ITERATOR$2 = wellKnownSymbol$7('iterator');
	var ArrayPrototype$3 = Array.prototype;

	// check on default Array iterator
	var isArrayIteratorMethod$1 = function (it) {
	  return it !== undefined && (Iterators$1.Array === it || ArrayPrototype$3[ITERATOR$2] === it);
	};

	var classof = classof$6;
	var Iterators = iterators;
	var wellKnownSymbol$6 = wellKnownSymbol$f;

	var ITERATOR$1 = wellKnownSymbol$6('iterator');

	var getIteratorMethod$1 = function (it) {
	  if (it != undefined) return it[ITERATOR$1]
	    || it['@@iterator']
	    || Iterators[classof(it)];
	};

	var anObject$3 = anObject$8;

	var iteratorClose$1 = function (iterator) {
	  var returnMethod = iterator['return'];
	  if (returnMethod !== undefined) {
	    return anObject$3(returnMethod.call(iterator)).value;
	  }
	};

	var anObject$2 = anObject$8;
	var isArrayIteratorMethod = isArrayIteratorMethod$1;
	var toLength$1 = toLength$5;
	var bind$5 = functionBindContext;
	var getIteratorMethod = getIteratorMethod$1;
	var iteratorClose = iteratorClose$1;

	var Result = function (stopped, result) {
	  this.stopped = stopped;
	  this.result = result;
	};

	var iterate$4 = function (iterable, unboundFunction, options) {
	  var that = options && options.that;
	  var AS_ENTRIES = !!(options && options.AS_ENTRIES);
	  var IS_ITERATOR = !!(options && options.IS_ITERATOR);
	  var INTERRUPTED = !!(options && options.INTERRUPTED);
	  var fn = bind$5(unboundFunction, that, 1 + AS_ENTRIES + INTERRUPTED);
	  var iterator, iterFn, index, length, result, next, step;

	  var stop = function (condition) {
	    if (iterator) iteratorClose(iterator);
	    return new Result(true, condition);
	  };

	  var callFn = function (value) {
	    if (AS_ENTRIES) {
	      anObject$2(value);
	      return INTERRUPTED ? fn(value[0], value[1], stop) : fn(value[0], value[1]);
	    } return INTERRUPTED ? fn(value, stop) : fn(value);
	  };

	  if (IS_ITERATOR) {
	    iterator = iterable;
	  } else {
	    iterFn = getIteratorMethod(iterable);
	    if (typeof iterFn != 'function') throw TypeError('Target is not iterable');
	    // optimisation for array iterators
	    if (isArrayIteratorMethod(iterFn)) {
	      for (index = 0, length = toLength$1(iterable.length); length > index; index++) {
	        result = callFn(iterable[index]);
	        if (result && result instanceof Result) return result;
	      } return new Result(false);
	    }
	    iterator = iterFn.call(iterable);
	  }

	  next = iterator.next;
	  while (!(step = next.call(iterator)).done) {
	    try {
	      result = callFn(step.value);
	    } catch (error) {
	      iteratorClose(iterator);
	      throw error;
	    }
	    if (typeof result == 'object' && result && result instanceof Result) return result;
	  } return new Result(false);
	};

	var $$7 = _export;
	var getPrototypeOf = objectGetPrototypeOf;
	var setPrototypeOf = objectSetPrototypeOf;
	var create = objectCreate;
	var createNonEnumerableProperty = createNonEnumerableProperty$9;
	var createPropertyDescriptor$1 = createPropertyDescriptor$5;
	var iterate$3 = iterate$4;

	var $AggregateError = function AggregateError(errors, message) {
	  var that = this;
	  if (!(that instanceof $AggregateError)) return new $AggregateError(errors, message);
	  if (setPrototypeOf) {
	    // eslint-disable-next-line unicorn/error-message -- expected
	    that = setPrototypeOf(new Error(undefined), getPrototypeOf(that));
	  }
	  if (message !== undefined) createNonEnumerableProperty(that, 'message', String(message));
	  var errorsArray = [];
	  iterate$3(errors, errorsArray.push, { that: errorsArray });
	  createNonEnumerableProperty(that, 'errors', errorsArray);
	  return that;
	};

	$AggregateError.prototype = create(Error.prototype, {
	  constructor: createPropertyDescriptor$1(5, $AggregateError),
	  message: createPropertyDescriptor$1(5, ''),
	  name: createPropertyDescriptor$1(5, 'AggregateError')
	});

	// `AggregateError` constructor
	// https://tc39.es/ecma262/#sec-aggregate-error-constructor
	$$7({ global: true }, {
	  AggregateError: $AggregateError
	});

	var global$5 = global$h;

	var nativePromiseConstructor = global$5.Promise;

	var redefine = redefine$2;

	var redefineAll$1 = function (target, src, options) {
	  for (var key in src) {
	    if (options && options.unsafe && target[key]) target[key] = src[key];
	    else redefine(target, key, src[key], options);
	  } return target;
	};

	var getBuiltIn$3 = getBuiltIn$6;
	var definePropertyModule$1 = objectDefineProperty;
	var wellKnownSymbol$5 = wellKnownSymbol$f;
	var DESCRIPTORS = descriptors;

	var SPECIES$4 = wellKnownSymbol$5('species');

	var setSpecies$1 = function (CONSTRUCTOR_NAME) {
	  var Constructor = getBuiltIn$3(CONSTRUCTOR_NAME);
	  var defineProperty = definePropertyModule$1.f;

	  if (DESCRIPTORS && Constructor && !Constructor[SPECIES$4]) {
	    defineProperty(Constructor, SPECIES$4, {
	      configurable: true,
	      get: function () { return this; }
	    });
	  }
	};

	var anInstance$1 = function (it, Constructor, name) {
	  if (!(it instanceof Constructor)) {
	    throw TypeError('Incorrect ' + (name ? name + ' ' : '') + 'invocation');
	  } return it;
	};

	var wellKnownSymbol$4 = wellKnownSymbol$f;

	var ITERATOR = wellKnownSymbol$4('iterator');
	var SAFE_CLOSING = false;

	try {
	  var called = 0;
	  var iteratorWithReturn = {
	    next: function () {
	      return { done: !!called++ };
	    },
	    'return': function () {
	      SAFE_CLOSING = true;
	    }
	  };
	  iteratorWithReturn[ITERATOR] = function () {
	    return this;
	  };
	  // eslint-disable-next-line es/no-array-from, no-throw-literal -- required for testing
	  Array.from(iteratorWithReturn, function () { throw 2; });
	} catch (error) { /* empty */ }

	var checkCorrectnessOfIteration$1 = function (exec, SKIP_CLOSING) {
	  if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
	  var ITERATION_SUPPORT = false;
	  try {
	    var object = {};
	    object[ITERATOR] = function () {
	      return {
	        next: function () {
	          return { done: ITERATION_SUPPORT = true };
	        }
	      };
	    };
	    exec(object);
	  } catch (error) { /* empty */ }
	  return ITERATION_SUPPORT;
	};

	var anObject$1 = anObject$8;
	var aFunction$5 = aFunction$9;
	var wellKnownSymbol$3 = wellKnownSymbol$f;

	var SPECIES$3 = wellKnownSymbol$3('species');

	// `SpeciesConstructor` abstract operation
	// https://tc39.es/ecma262/#sec-speciesconstructor
	var speciesConstructor$2 = function (O, defaultConstructor) {
	  var C = anObject$1(O).constructor;
	  var S;
	  return C === undefined || (S = anObject$1(C)[SPECIES$3]) == undefined ? defaultConstructor : aFunction$5(S);
	};

	var userAgent$1 = engineUserAgent;

	var engineIsIos = /(?:iphone|ipod|ipad).*applewebkit/i.test(userAgent$1);

	var global$4 = global$h;
	var fails$3 = fails$e;
	var bind$4 = functionBindContext;
	var html = html$2;
	var createElement = documentCreateElement$1;
	var IS_IOS$1 = engineIsIos;
	var IS_NODE$2 = engineIsNode;

	var location = global$4.location;
	var set = global$4.setImmediate;
	var clear = global$4.clearImmediate;
	var process$3 = global$4.process;
	var MessageChannel$1 = global$4.MessageChannel;
	var Dispatch = global$4.Dispatch;
	var counter = 0;
	var queue = {};
	var ONREADYSTATECHANGE = 'onreadystatechange';
	var defer, channel, port;

	var run = function (id) {
	  // eslint-disable-next-line no-prototype-builtins -- safe
	  if (queue.hasOwnProperty(id)) {
	    var fn = queue[id];
	    delete queue[id];
	    fn();
	  }
	};

	var runner = function (id) {
	  return function () {
	    run(id);
	  };
	};

	var listener = function (event) {
	  run(event.data);
	};

	var post$1 = function (id) {
	  // old engines have not location.origin
	  global$4.postMessage(id + '', location.protocol + '//' + location.host);
	};

	// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
	if (!set || !clear) {
	  set = function setImmediate(fn) {
	    var args = [];
	    var i = 1;
	    while (arguments.length > i) args.push(arguments[i++]);
	    queue[++counter] = function () {
	      // eslint-disable-next-line no-new-func -- spec requirement
	      (typeof fn == 'function' ? fn : Function(fn)).apply(undefined, args);
	    };
	    defer(counter);
	    return counter;
	  };
	  clear = function clearImmediate(id) {
	    delete queue[id];
	  };
	  // Node.js 0.8-
	  if (IS_NODE$2) {
	    defer = function (id) {
	      process$3.nextTick(runner(id));
	    };
	  // Sphere (JS game engine) Dispatch API
	  } else if (Dispatch && Dispatch.now) {
	    defer = function (id) {
	      Dispatch.now(runner(id));
	    };
	  // Browsers with MessageChannel, includes WebWorkers
	  // except iOS - https://github.com/zloirock/core-js/issues/624
	  } else if (MessageChannel$1 && !IS_IOS$1) {
	    channel = new MessageChannel$1();
	    port = channel.port2;
	    channel.port1.onmessage = listener;
	    defer = bind$4(port.postMessage, port, 1);
	  // Browsers with postMessage, skip WebWorkers
	  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
	  } else if (
	    global$4.addEventListener &&
	    typeof postMessage == 'function' &&
	    !global$4.importScripts &&
	    location && location.protocol !== 'file:' &&
	    !fails$3(post$1)
	  ) {
	    defer = post$1;
	    global$4.addEventListener('message', listener, false);
	  // IE8-
	  } else if (ONREADYSTATECHANGE in createElement('script')) {
	    defer = function (id) {
	      html.appendChild(createElement('script'))[ONREADYSTATECHANGE] = function () {
	        html.removeChild(this);
	        run(id);
	      };
	    };
	  // Rest old browsers
	  } else {
	    defer = function (id) {
	      setTimeout(runner(id), 0);
	    };
	  }
	}

	var task$1 = {
	  set: set,
	  clear: clear
	};

	var userAgent = engineUserAgent;

	var engineIsWebosWebkit = /web0s(?!.*chrome)/i.test(userAgent);

	var global$3 = global$h;
	var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
	var macrotask = task$1.set;
	var IS_IOS = engineIsIos;
	var IS_WEBOS_WEBKIT = engineIsWebosWebkit;
	var IS_NODE$1 = engineIsNode;

	var MutationObserver = global$3.MutationObserver || global$3.WebKitMutationObserver;
	var document$2 = global$3.document;
	var process$2 = global$3.process;
	var Promise$1 = global$3.Promise;
	// Node.js 11 shows ExperimentalWarning on getting `queueMicrotask`
	var queueMicrotaskDescriptor = getOwnPropertyDescriptor(global$3, 'queueMicrotask');
	var queueMicrotask = queueMicrotaskDescriptor && queueMicrotaskDescriptor.value;

	var flush, head$1, last, notify$1, toggle, node, promise$3, then;

	// modern engines have queueMicrotask method
	if (!queueMicrotask) {
	  flush = function () {
	    var parent, fn;
	    if (IS_NODE$1 && (parent = process$2.domain)) parent.exit();
	    while (head$1) {
	      fn = head$1.fn;
	      head$1 = head$1.next;
	      try {
	        fn();
	      } catch (error) {
	        if (head$1) notify$1();
	        else last = undefined;
	        throw error;
	      }
	    } last = undefined;
	    if (parent) parent.enter();
	  };

	  // browsers with MutationObserver, except iOS - https://github.com/zloirock/core-js/issues/339
	  // also except WebOS Webkit https://github.com/zloirock/core-js/issues/898
	  if (!IS_IOS && !IS_NODE$1 && !IS_WEBOS_WEBKIT && MutationObserver && document$2) {
	    toggle = true;
	    node = document$2.createTextNode('');
	    new MutationObserver(flush).observe(node, { characterData: true });
	    notify$1 = function () {
	      node.data = toggle = !toggle;
	    };
	  // environments with maybe non-completely correct, but existent Promise
	  } else if (Promise$1 && Promise$1.resolve) {
	    // Promise.resolve without an argument throws an error in LG WebOS 2
	    promise$3 = Promise$1.resolve(undefined);
	    // workaround of WebKit ~ iOS Safari 10.1 bug
	    promise$3.constructor = Promise$1;
	    then = promise$3.then;
	    notify$1 = function () {
	      then.call(promise$3, flush);
	    };
	  // Node.js without promises
	  } else if (IS_NODE$1) {
	    notify$1 = function () {
	      process$2.nextTick(flush);
	    };
	  // for other environments - macrotask based on:
	  // - setImmediate
	  // - MessageChannel
	  // - window.postMessag
	  // - onreadystatechange
	  // - setTimeout
	  } else {
	    notify$1 = function () {
	      // strange IE + webpack dev server bug - use .call(global)
	      macrotask.call(global$3, flush);
	    };
	  }
	}

	var microtask$1 = queueMicrotask || function (fn) {
	  var task = { fn: fn, next: undefined };
	  if (last) last.next = task;
	  if (!head$1) {
	    head$1 = task;
	    notify$1();
	  } last = task;
	};

	var newPromiseCapability$2 = {};

	var aFunction$4 = aFunction$9;

	var PromiseCapability = function (C) {
	  var resolve, reject;
	  this.promise = new C(function ($$resolve, $$reject) {
	    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
	    resolve = $$resolve;
	    reject = $$reject;
	  });
	  this.resolve = aFunction$4(resolve);
	  this.reject = aFunction$4(reject);
	};

	// 25.4.1.5 NewPromiseCapability(C)
	newPromiseCapability$2.f = function (C) {
	  return new PromiseCapability(C);
	};

	var anObject = anObject$8;
	var isObject$3 = isObject$a;
	var newPromiseCapability$1 = newPromiseCapability$2;

	var promiseResolve$2 = function (C, x) {
	  anObject(C);
	  if (isObject$3(x) && x.constructor === C) return x;
	  var promiseCapability = newPromiseCapability$1.f(C);
	  var resolve = promiseCapability.resolve;
	  resolve(x);
	  return promiseCapability.promise;
	};

	var global$2 = global$h;

	var hostReportErrors$1 = function (a, b) {
	  var console = global$2.console;
	  if (console && console.error) {
	    arguments.length === 1 ? console.error(a) : console.error(a, b);
	  }
	};

	var perform$3 = function (exec) {
	  try {
	    return { error: false, value: exec() };
	  } catch (error) {
	    return { error: true, value: error };
	  }
	};

	var engineIsBrowser = typeof window == 'object';

	var $$6 = _export;
	var IS_PURE = isPure;
	var global$1 = global$h;
	var getBuiltIn$2 = getBuiltIn$6;
	var NativePromise$1 = nativePromiseConstructor;
	var redefineAll = redefineAll$1;
	var setToStringTag = setToStringTag$3;
	var setSpecies = setSpecies$1;
	var isObject$2 = isObject$a;
	var aFunction$3 = aFunction$9;
	var anInstance = anInstance$1;
	var inspectSource = inspectSource$2;
	var iterate$2 = iterate$4;
	var checkCorrectnessOfIteration = checkCorrectnessOfIteration$1;
	var speciesConstructor$1 = speciesConstructor$2;
	var task = task$1.set;
	var microtask = microtask$1;
	var promiseResolve$1 = promiseResolve$2;
	var hostReportErrors = hostReportErrors$1;
	var newPromiseCapabilityModule$2 = newPromiseCapability$2;
	var perform$2 = perform$3;
	var InternalStateModule$1 = internalState;
	var isForced = isForced_1;
	var wellKnownSymbol$2 = wellKnownSymbol$f;
	var IS_BROWSER = engineIsBrowser;
	var IS_NODE = engineIsNode;
	var V8_VERSION$1 = engineV8Version;

	var SPECIES$2 = wellKnownSymbol$2('species');
	var PROMISE = 'Promise';
	var getInternalState$1 = InternalStateModule$1.get;
	var setInternalState$1 = InternalStateModule$1.set;
	var getInternalPromiseState = InternalStateModule$1.getterFor(PROMISE);
	var NativePromisePrototype = NativePromise$1 && NativePromise$1.prototype;
	var PromiseConstructor = NativePromise$1;
	var PromiseConstructorPrototype = NativePromisePrototype;
	var TypeError$1 = global$1.TypeError;
	var document$1 = global$1.document;
	var process$1 = global$1.process;
	var newPromiseCapability = newPromiseCapabilityModule$2.f;
	var newGenericPromiseCapability = newPromiseCapability;
	var DISPATCH_EVENT = !!(document$1 && document$1.createEvent && global$1.dispatchEvent);
	var NATIVE_REJECTION_EVENT = typeof PromiseRejectionEvent == 'function';
	var UNHANDLED_REJECTION = 'unhandledrejection';
	var REJECTION_HANDLED = 'rejectionhandled';
	var PENDING = 0;
	var FULFILLED = 1;
	var REJECTED = 2;
	var HANDLED = 1;
	var UNHANDLED = 2;
	var SUBCLASSING = false;
	var Internal, OwnPromiseCapability, PromiseWrapper;

	var FORCED$1 = isForced(PROMISE, function () {
	  var GLOBAL_CORE_JS_PROMISE = inspectSource(PromiseConstructor) !== String(PromiseConstructor);
	  // V8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
	  // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
	  // We can't detect it synchronously, so just check versions
	  if (!GLOBAL_CORE_JS_PROMISE && V8_VERSION$1 === 66) return true;
	  // We need Promise#finally in the pure version for preventing prototype pollution
	  if (!PromiseConstructorPrototype['finally']) return true;
	  // We can't use @@species feature detection in V8 since it causes
	  // deoptimization and performance degradation
	  // https://github.com/zloirock/core-js/issues/679
	  if (V8_VERSION$1 >= 51 && /native code/.test(PromiseConstructor)) return false;
	  // Detect correctness of subclassing with @@species support
	  var promise = new PromiseConstructor(function (resolve) { resolve(1); });
	  var FakePromise = function (exec) {
	    exec(function () { /* empty */ }, function () { /* empty */ });
	  };
	  var constructor = promise.constructor = {};
	  constructor[SPECIES$2] = FakePromise;
	  SUBCLASSING = promise.then(function () { /* empty */ }) instanceof FakePromise;
	  if (!SUBCLASSING) return true;
	  // Unhandled rejections tracking support, NodeJS Promise without it fails @@species test
	  return !GLOBAL_CORE_JS_PROMISE && IS_BROWSER && !NATIVE_REJECTION_EVENT;
	});

	var INCORRECT_ITERATION = FORCED$1 || !checkCorrectnessOfIteration(function (iterable) {
	  PromiseConstructor.all(iterable)['catch'](function () { /* empty */ });
	});

	// helpers
	var isThenable = function (it) {
	  var then;
	  return isObject$2(it) && typeof (then = it.then) == 'function' ? then : false;
	};

	var notify = function (state, isReject) {
	  if (state.notified) return;
	  state.notified = true;
	  var chain = state.reactions;
	  microtask(function () {
	    var value = state.value;
	    var ok = state.state == FULFILLED;
	    var index = 0;
	    // variable length - can't use forEach
	    while (chain.length > index) {
	      var reaction = chain[index++];
	      var handler = ok ? reaction.ok : reaction.fail;
	      var resolve = reaction.resolve;
	      var reject = reaction.reject;
	      var domain = reaction.domain;
	      var result, then, exited;
	      try {
	        if (handler) {
	          if (!ok) {
	            if (state.rejection === UNHANDLED) onHandleUnhandled(state);
	            state.rejection = HANDLED;
	          }
	          if (handler === true) result = value;
	          else {
	            if (domain) domain.enter();
	            result = handler(value); // can throw
	            if (domain) {
	              domain.exit();
	              exited = true;
	            }
	          }
	          if (result === reaction.promise) {
	            reject(TypeError$1('Promise-chain cycle'));
	          } else if (then = isThenable(result)) {
	            then.call(result, resolve, reject);
	          } else resolve(result);
	        } else reject(value);
	      } catch (error) {
	        if (domain && !exited) domain.exit();
	        reject(error);
	      }
	    }
	    state.reactions = [];
	    state.notified = false;
	    if (isReject && !state.rejection) onUnhandled(state);
	  });
	};

	var dispatchEvent = function (name, promise, reason) {
	  var event, handler;
	  if (DISPATCH_EVENT) {
	    event = document$1.createEvent('Event');
	    event.promise = promise;
	    event.reason = reason;
	    event.initEvent(name, false, true);
	    global$1.dispatchEvent(event);
	  } else event = { promise: promise, reason: reason };
	  if (!NATIVE_REJECTION_EVENT && (handler = global$1['on' + name])) handler(event);
	  else if (name === UNHANDLED_REJECTION) hostReportErrors('Unhandled promise rejection', reason);
	};

	var onUnhandled = function (state) {
	  task.call(global$1, function () {
	    var promise = state.facade;
	    var value = state.value;
	    var IS_UNHANDLED = isUnhandled(state);
	    var result;
	    if (IS_UNHANDLED) {
	      result = perform$2(function () {
	        if (IS_NODE) {
	          process$1.emit('unhandledRejection', value, promise);
	        } else dispatchEvent(UNHANDLED_REJECTION, promise, value);
	      });
	      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
	      state.rejection = IS_NODE || isUnhandled(state) ? UNHANDLED : HANDLED;
	      if (result.error) throw result.value;
	    }
	  });
	};

	var isUnhandled = function (state) {
	  return state.rejection !== HANDLED && !state.parent;
	};

	var onHandleUnhandled = function (state) {
	  task.call(global$1, function () {
	    var promise = state.facade;
	    if (IS_NODE) {
	      process$1.emit('rejectionHandled', promise);
	    } else dispatchEvent(REJECTION_HANDLED, promise, state.value);
	  });
	};

	var bind$3 = function (fn, state, unwrap) {
	  return function (value) {
	    fn(state, value, unwrap);
	  };
	};

	var internalReject = function (state, value, unwrap) {
	  if (state.done) return;
	  state.done = true;
	  if (unwrap) state = unwrap;
	  state.value = value;
	  state.state = REJECTED;
	  notify(state, true);
	};

	var internalResolve = function (state, value, unwrap) {
	  if (state.done) return;
	  state.done = true;
	  if (unwrap) state = unwrap;
	  try {
	    if (state.facade === value) throw TypeError$1("Promise can't be resolved itself");
	    var then = isThenable(value);
	    if (then) {
	      microtask(function () {
	        var wrapper = { done: false };
	        try {
	          then.call(value,
	            bind$3(internalResolve, wrapper, state),
	            bind$3(internalReject, wrapper, state)
	          );
	        } catch (error) {
	          internalReject(wrapper, error, state);
	        }
	      });
	    } else {
	      state.value = value;
	      state.state = FULFILLED;
	      notify(state, false);
	    }
	  } catch (error) {
	    internalReject({ done: false }, error, state);
	  }
	};

	// constructor polyfill
	if (FORCED$1) {
	  // 25.4.3.1 Promise(executor)
	  PromiseConstructor = function Promise(executor) {
	    anInstance(this, PromiseConstructor, PROMISE);
	    aFunction$3(executor);
	    Internal.call(this);
	    var state = getInternalState$1(this);
	    try {
	      executor(bind$3(internalResolve, state), bind$3(internalReject, state));
	    } catch (error) {
	      internalReject(state, error);
	    }
	  };
	  PromiseConstructorPrototype = PromiseConstructor.prototype;
	  // eslint-disable-next-line no-unused-vars -- required for `.length`
	  Internal = function Promise(executor) {
	    setInternalState$1(this, {
	      type: PROMISE,
	      done: false,
	      notified: false,
	      parent: false,
	      reactions: [],
	      rejection: false,
	      state: PENDING,
	      value: undefined
	    });
	  };
	  Internal.prototype = redefineAll(PromiseConstructorPrototype, {
	    // `Promise.prototype.then` method
	    // https://tc39.es/ecma262/#sec-promise.prototype.then
	    then: function then(onFulfilled, onRejected) {
	      var state = getInternalPromiseState(this);
	      var reaction = newPromiseCapability(speciesConstructor$1(this, PromiseConstructor));
	      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
	      reaction.fail = typeof onRejected == 'function' && onRejected;
	      reaction.domain = IS_NODE ? process$1.domain : undefined;
	      state.parent = true;
	      state.reactions.push(reaction);
	      if (state.state != PENDING) notify(state, false);
	      return reaction.promise;
	    },
	    // `Promise.prototype.catch` method
	    // https://tc39.es/ecma262/#sec-promise.prototype.catch
	    'catch': function (onRejected) {
	      return this.then(undefined, onRejected);
	    }
	  });
	  OwnPromiseCapability = function () {
	    var promise = new Internal();
	    var state = getInternalState$1(promise);
	    this.promise = promise;
	    this.resolve = bind$3(internalResolve, state);
	    this.reject = bind$3(internalReject, state);
	  };
	  newPromiseCapabilityModule$2.f = newPromiseCapability = function (C) {
	    return C === PromiseConstructor || C === PromiseWrapper
	      ? new OwnPromiseCapability(C)
	      : newGenericPromiseCapability(C);
	  };
	}

	$$6({ global: true, wrap: true, forced: FORCED$1 }, {
	  Promise: PromiseConstructor
	});

	setToStringTag(PromiseConstructor, PROMISE, false, true);
	setSpecies(PROMISE);

	PromiseWrapper = getBuiltIn$2(PROMISE);

	// statics
	$$6({ target: PROMISE, stat: true, forced: FORCED$1 }, {
	  // `Promise.reject` method
	  // https://tc39.es/ecma262/#sec-promise.reject
	  reject: function reject(r) {
	    var capability = newPromiseCapability(this);
	    capability.reject.call(undefined, r);
	    return capability.promise;
	  }
	});

	$$6({ target: PROMISE, stat: true, forced: IS_PURE  }, {
	  // `Promise.resolve` method
	  // https://tc39.es/ecma262/#sec-promise.resolve
	  resolve: function resolve(x) {
	    return promiseResolve$1(this === PromiseWrapper ? PromiseConstructor : this, x);
	  }
	});

	$$6({ target: PROMISE, stat: true, forced: INCORRECT_ITERATION }, {
	  // `Promise.all` method
	  // https://tc39.es/ecma262/#sec-promise.all
	  all: function all(iterable) {
	    var C = this;
	    var capability = newPromiseCapability(C);
	    var resolve = capability.resolve;
	    var reject = capability.reject;
	    var result = perform$2(function () {
	      var $promiseResolve = aFunction$3(C.resolve);
	      var values = [];
	      var counter = 0;
	      var remaining = 1;
	      iterate$2(iterable, function (promise) {
	        var index = counter++;
	        var alreadyCalled = false;
	        values.push(undefined);
	        remaining++;
	        $promiseResolve.call(C, promise).then(function (value) {
	          if (alreadyCalled) return;
	          alreadyCalled = true;
	          values[index] = value;
	          --remaining || resolve(values);
	        }, reject);
	      });
	      --remaining || resolve(values);
	    });
	    if (result.error) reject(result.value);
	    return capability.promise;
	  },
	  // `Promise.race` method
	  // https://tc39.es/ecma262/#sec-promise.race
	  race: function race(iterable) {
	    var C = this;
	    var capability = newPromiseCapability(C);
	    var reject = capability.reject;
	    var result = perform$2(function () {
	      var $promiseResolve = aFunction$3(C.resolve);
	      iterate$2(iterable, function (promise) {
	        $promiseResolve.call(C, promise).then(capability.resolve, reject);
	      });
	    });
	    if (result.error) reject(result.value);
	    return capability.promise;
	  }
	});

	var $$5 = _export;
	var aFunction$2 = aFunction$9;
	var newPromiseCapabilityModule$1 = newPromiseCapability$2;
	var perform$1 = perform$3;
	var iterate$1 = iterate$4;

	// `Promise.allSettled` method
	// https://tc39.es/ecma262/#sec-promise.allsettled
	$$5({ target: 'Promise', stat: true }, {
	  allSettled: function allSettled(iterable) {
	    var C = this;
	    var capability = newPromiseCapabilityModule$1.f(C);
	    var resolve = capability.resolve;
	    var reject = capability.reject;
	    var result = perform$1(function () {
	      var promiseResolve = aFunction$2(C.resolve);
	      var values = [];
	      var counter = 0;
	      var remaining = 1;
	      iterate$1(iterable, function (promise) {
	        var index = counter++;
	        var alreadyCalled = false;
	        values.push(undefined);
	        remaining++;
	        promiseResolve.call(C, promise).then(function (value) {
	          if (alreadyCalled) return;
	          alreadyCalled = true;
	          values[index] = { status: 'fulfilled', value: value };
	          --remaining || resolve(values);
	        }, function (error) {
	          if (alreadyCalled) return;
	          alreadyCalled = true;
	          values[index] = { status: 'rejected', reason: error };
	          --remaining || resolve(values);
	        });
	      });
	      --remaining || resolve(values);
	    });
	    if (result.error) reject(result.value);
	    return capability.promise;
	  }
	});

	var $$4 = _export;
	var aFunction$1 = aFunction$9;
	var getBuiltIn$1 = getBuiltIn$6;
	var newPromiseCapabilityModule = newPromiseCapability$2;
	var perform = perform$3;
	var iterate = iterate$4;

	var PROMISE_ANY_ERROR = 'No one promise resolved';

	// `Promise.any` method
	// https://tc39.es/ecma262/#sec-promise.any
	$$4({ target: 'Promise', stat: true }, {
	  any: function any(iterable) {
	    var C = this;
	    var capability = newPromiseCapabilityModule.f(C);
	    var resolve = capability.resolve;
	    var reject = capability.reject;
	    var result = perform(function () {
	      var promiseResolve = aFunction$1(C.resolve);
	      var errors = [];
	      var counter = 0;
	      var remaining = 1;
	      var alreadyResolved = false;
	      iterate(iterable, function (promise) {
	        var index = counter++;
	        var alreadyRejected = false;
	        errors.push(undefined);
	        remaining++;
	        promiseResolve.call(C, promise).then(function (value) {
	          if (alreadyRejected || alreadyResolved) return;
	          alreadyResolved = true;
	          resolve(value);
	        }, function (error) {
	          if (alreadyRejected || alreadyResolved) return;
	          alreadyRejected = true;
	          errors[index] = error;
	          --remaining || reject(new (getBuiltIn$1('AggregateError'))(errors, PROMISE_ANY_ERROR));
	        });
	      });
	      --remaining || reject(new (getBuiltIn$1('AggregateError'))(errors, PROMISE_ANY_ERROR));
	    });
	    if (result.error) reject(result.value);
	    return capability.promise;
	  }
	});

	var $$3 = _export;
	var NativePromise = nativePromiseConstructor;
	var fails$2 = fails$e;
	var getBuiltIn = getBuiltIn$6;
	var speciesConstructor = speciesConstructor$2;
	var promiseResolve = promiseResolve$2;

	// Safari bug https://bugs.webkit.org/show_bug.cgi?id=200829
	var NON_GENERIC = !!NativePromise && fails$2(function () {
	  NativePromise.prototype['finally'].call({ then: function () { /* empty */ } }, function () { /* empty */ });
	});

	// `Promise.prototype.finally` method
	// https://tc39.es/ecma262/#sec-promise.prototype.finally
	$$3({ target: 'Promise', proto: true, real: true, forced: NON_GENERIC }, {
	  'finally': function (onFinally) {
	    var C = speciesConstructor(this, getBuiltIn('Promise'));
	    var isFunction = typeof onFinally == 'function';
	    return this.then(
	      isFunction ? function (x) {
	        return promiseResolve(C, onFinally()).then(function () { return x; });
	      } : onFinally,
	      isFunction ? function (e) {
	        return promiseResolve(C, onFinally()).then(function () { throw e; });
	      } : onFinally
	    );
	  }
	});

	var toInteger = toInteger$3;
	var requireObjectCoercible = requireObjectCoercible$3;

	// `String.prototype.{ codePointAt, at }` methods implementation
	var createMethod = function (CONVERT_TO_STRING) {
	  return function ($this, pos) {
	    var S = String(requireObjectCoercible($this));
	    var position = toInteger(pos);
	    var size = S.length;
	    var first, second;
	    if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
	    first = S.charCodeAt(position);
	    return first < 0xD800 || first > 0xDBFF || position + 1 === size
	      || (second = S.charCodeAt(position + 1)) < 0xDC00 || second > 0xDFFF
	        ? CONVERT_TO_STRING ? S.charAt(position) : first
	        : CONVERT_TO_STRING ? S.slice(position, position + 2) : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
	  };
	};

	var stringMultibyte = {
	  // `String.prototype.codePointAt` method
	  // https://tc39.es/ecma262/#sec-string.prototype.codepointat
	  codeAt: createMethod(false),
	  // `String.prototype.at` method
	  // https://github.com/mathiasbynens/String.prototype.at
	  charAt: createMethod(true)
	};

	var charAt = stringMultibyte.charAt;
	var InternalStateModule = internalState;
	var defineIterator = defineIterator$2;

	var STRING_ITERATOR = 'String Iterator';
	var setInternalState = InternalStateModule.set;
	var getInternalState = InternalStateModule.getterFor(STRING_ITERATOR);

	// `String.prototype[@@iterator]` method
	// https://tc39.es/ecma262/#sec-string.prototype-@@iterator
	defineIterator(String, 'String', function (iterated) {
	  setInternalState(this, {
	    type: STRING_ITERATOR,
	    string: String(iterated),
	    index: 0
	  });
	// `%StringIteratorPrototype%.next` method
	// https://tc39.es/ecma262/#sec-%stringiteratorprototype%.next
	}, function next() {
	  var state = getInternalState(this);
	  var string = state.string;
	  var index = state.index;
	  var point;
	  if (index >= string.length) return { value: undefined, done: true };
	  point = charAt(string, index);
	  state.index += point.length;
	  return { value: point, done: false };
	});

	var path = path$6;

	var promise$2 = path.Promise;

	var parent$3 = promise$2;

	var promise$1 = parent$3;

	(function (module) {
		module.exports = promise$1;
	} (promise$4));

	var _Promise = /*@__PURE__*/getDefaultExportFromCjs(promise$4.exports);

	var axios$3 = {exports: {}};

	var axios$2 = {exports: {}};

	var bind$2 = function bind(fn, thisArg) {
	  return function wrap() {
	    var args = new Array(arguments.length);
	    for (var i = 0; i < args.length; i++) {
	      args[i] = arguments[i];
	    }
	    return fn.apply(thisArg, args);
	  };
	};

	var bind$1 = bind$2;

	// utils is a library of generic helper functions non-specific to axios

	var toString = Object.prototype.toString;

	// eslint-disable-next-line func-names
	var kindOf = (function(cache) {
	  // eslint-disable-next-line func-names
	  return function(thing) {
	    var str = toString.call(thing);
	    return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
	  };
	})(Object.create(null));

	function kindOfTest(type) {
	  type = type.toLowerCase();
	  return function isKindOf(thing) {
	    return kindOf(thing) === type;
	  };
	}

	/**
	 * Determine if a value is an Array
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an Array, otherwise false
	 */
	function isArray$1(val) {
	  return Array.isArray(val);
	}

	/**
	 * Determine if a value is undefined
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if the value is undefined, otherwise false
	 */
	function isUndefined(val) {
	  return typeof val === 'undefined';
	}

	/**
	 * Determine if a value is a Buffer
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Buffer, otherwise false
	 */
	function isBuffer(val) {
	  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
	    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
	}

	/**
	 * Determine if a value is an ArrayBuffer
	 *
	 * @function
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
	 */
	var isArrayBuffer = kindOfTest('ArrayBuffer');


	/**
	 * Determine if a value is a view on an ArrayBuffer
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
	 */
	function isArrayBufferView(val) {
	  var result;
	  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
	    result = ArrayBuffer.isView(val);
	  } else {
	    result = (val) && (val.buffer) && (isArrayBuffer(val.buffer));
	  }
	  return result;
	}

	/**
	 * Determine if a value is a String
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a String, otherwise false
	 */
	function isString(val) {
	  return typeof val === 'string';
	}

	/**
	 * Determine if a value is a Number
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Number, otherwise false
	 */
	function isNumber(val) {
	  return typeof val === 'number';
	}

	/**
	 * Determine if a value is an Object
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an Object, otherwise false
	 */
	function isObject$1(val) {
	  return val !== null && typeof val === 'object';
	}

	/**
	 * Determine if a value is a plain Object
	 *
	 * @param {Object} val The value to test
	 * @return {boolean} True if value is a plain Object, otherwise false
	 */
	function isPlainObject(val) {
	  if (kindOf(val) !== 'object') {
	    return false;
	  }

	  var prototype = Object.getPrototypeOf(val);
	  return prototype === null || prototype === Object.prototype;
	}

	/**
	 * Determine if a value is a Date
	 *
	 * @function
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Date, otherwise false
	 */
	var isDate = kindOfTest('Date');

	/**
	 * Determine if a value is a File
	 *
	 * @function
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a File, otherwise false
	 */
	var isFile = kindOfTest('File');

	/**
	 * Determine if a value is a Blob
	 *
	 * @function
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Blob, otherwise false
	 */
	var isBlob = kindOfTest('Blob');

	/**
	 * Determine if a value is a FileList
	 *
	 * @function
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a File, otherwise false
	 */
	var isFileList = kindOfTest('FileList');

	/**
	 * Determine if a value is a Function
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Function, otherwise false
	 */
	function isFunction(val) {
	  return toString.call(val) === '[object Function]';
	}

	/**
	 * Determine if a value is a Stream
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Stream, otherwise false
	 */
	function isStream(val) {
	  return isObject$1(val) && isFunction(val.pipe);
	}

	/**
	 * Determine if a value is a FormData
	 *
	 * @param {Object} thing The value to test
	 * @returns {boolean} True if value is an FormData, otherwise false
	 */
	function isFormData(thing) {
	  var pattern = '[object FormData]';
	  return thing && (
	    (typeof FormData === 'function' && thing instanceof FormData) ||
	    toString.call(thing) === pattern ||
	    (isFunction(thing.toString) && thing.toString() === pattern)
	  );
	}

	/**
	 * Determine if a value is a URLSearchParams object
	 * @function
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
	 */
	var isURLSearchParams = kindOfTest('URLSearchParams');

	/**
	 * Trim excess whitespace off the beginning and end of a string
	 *
	 * @param {String} str The String to trim
	 * @returns {String} The String freed of excess whitespace
	 */
	function trim(str) {
	  return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
	}

	/**
	 * Determine if we're running in a standard browser environment
	 *
	 * This allows axios to run in a web worker, and react-native.
	 * Both environments support XMLHttpRequest, but not fully standard globals.
	 *
	 * web workers:
	 *  typeof window -> undefined
	 *  typeof document -> undefined
	 *
	 * react-native:
	 *  navigator.product -> 'ReactNative'
	 * nativescript
	 *  navigator.product -> 'NativeScript' or 'NS'
	 */
	function isStandardBrowserEnv() {
	  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
	                                           navigator.product === 'NativeScript' ||
	                                           navigator.product === 'NS')) {
	    return false;
	  }
	  return (
	    typeof window !== 'undefined' &&
	    typeof document !== 'undefined'
	  );
	}

	/**
	 * Iterate over an Array or an Object invoking a function for each item.
	 *
	 * If `obj` is an Array callback will be called passing
	 * the value, index, and complete array for each item.
	 *
	 * If 'obj' is an Object callback will be called passing
	 * the value, key, and complete object for each property.
	 *
	 * @param {Object|Array} obj The object to iterate
	 * @param {Function} fn The callback to invoke for each item
	 */
	function forEach(obj, fn) {
	  // Don't bother if no value provided
	  if (obj === null || typeof obj === 'undefined') {
	    return;
	  }

	  // Force an array if not already something iterable
	  if (typeof obj !== 'object') {
	    /*eslint no-param-reassign:0*/
	    obj = [obj];
	  }

	  if (isArray$1(obj)) {
	    // Iterate over array values
	    for (var i = 0, l = obj.length; i < l; i++) {
	      fn.call(null, obj[i], i, obj);
	    }
	  } else {
	    // Iterate over object keys
	    for (var key in obj) {
	      if (Object.prototype.hasOwnProperty.call(obj, key)) {
	        fn.call(null, obj[key], key, obj);
	      }
	    }
	  }
	}

	/**
	 * Accepts varargs expecting each argument to be an object, then
	 * immutably merges the properties of each object and returns result.
	 *
	 * When multiple objects contain the same key the later object in
	 * the arguments list will take precedence.
	 *
	 * Example:
	 *
	 * ```js
	 * var result = merge({foo: 123}, {foo: 456});
	 * console.log(result.foo); // outputs 456
	 * ```
	 *
	 * @param {Object} obj1 Object to merge
	 * @returns {Object} Result of all merge properties
	 */
	function merge(/* obj1, obj2, obj3, ... */) {
	  var result = {};
	  function assignValue(val, key) {
	    if (isPlainObject(result[key]) && isPlainObject(val)) {
	      result[key] = merge(result[key], val);
	    } else if (isPlainObject(val)) {
	      result[key] = merge({}, val);
	    } else if (isArray$1(val)) {
	      result[key] = val.slice();
	    } else {
	      result[key] = val;
	    }
	  }

	  for (var i = 0, l = arguments.length; i < l; i++) {
	    forEach(arguments[i], assignValue);
	  }
	  return result;
	}

	/**
	 * Extends object a by mutably adding to it the properties of object b.
	 *
	 * @param {Object} a The object to be extended
	 * @param {Object} b The object to copy properties from
	 * @param {Object} thisArg The object to bind function to
	 * @return {Object} The resulting value of object a
	 */
	function extend(a, b, thisArg) {
	  forEach(b, function assignValue(val, key) {
	    if (thisArg && typeof val === 'function') {
	      a[key] = bind$1(val, thisArg);
	    } else {
	      a[key] = val;
	    }
	  });
	  return a;
	}

	/**
	 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
	 *
	 * @param {string} content with BOM
	 * @return {string} content value without BOM
	 */
	function stripBOM(content) {
	  if (content.charCodeAt(0) === 0xFEFF) {
	    content = content.slice(1);
	  }
	  return content;
	}

	/**
	 * Inherit the prototype methods from one constructor into another
	 * @param {function} constructor
	 * @param {function} superConstructor
	 * @param {object} [props]
	 * @param {object} [descriptors]
	 */

	function inherits(constructor, superConstructor, props, descriptors) {
	  constructor.prototype = Object.create(superConstructor.prototype, descriptors);
	  constructor.prototype.constructor = constructor;
	  props && Object.assign(constructor.prototype, props);
	}

	/**
	 * Resolve object with deep prototype chain to a flat object
	 * @param {Object} sourceObj source object
	 * @param {Object} [destObj]
	 * @param {Function} [filter]
	 * @returns {Object}
	 */

	function toFlatObject(sourceObj, destObj, filter) {
	  var props;
	  var i;
	  var prop;
	  var merged = {};

	  destObj = destObj || {};

	  do {
	    props = Object.getOwnPropertyNames(sourceObj);
	    i = props.length;
	    while (i-- > 0) {
	      prop = props[i];
	      if (!merged[prop]) {
	        destObj[prop] = sourceObj[prop];
	        merged[prop] = true;
	      }
	    }
	    sourceObj = Object.getPrototypeOf(sourceObj);
	  } while (sourceObj && (!filter || filter(sourceObj, destObj)) && sourceObj !== Object.prototype);

	  return destObj;
	}

	/*
	 * determines whether a string ends with the characters of a specified string
	 * @param {String} str
	 * @param {String} searchString
	 * @param {Number} [position= 0]
	 * @returns {boolean}
	 */
	function endsWith(str, searchString, position) {
	  str = String(str);
	  if (position === undefined || position > str.length) {
	    position = str.length;
	  }
	  position -= searchString.length;
	  var lastIndex = str.indexOf(searchString, position);
	  return lastIndex !== -1 && lastIndex === position;
	}


	/**
	 * Returns new array from array like object
	 * @param {*} [thing]
	 * @returns {Array}
	 */
	function toArray(thing) {
	  if (!thing) return null;
	  var i = thing.length;
	  if (isUndefined(i)) return null;
	  var arr = new Array(i);
	  while (i-- > 0) {
	    arr[i] = thing[i];
	  }
	  return arr;
	}

	// eslint-disable-next-line func-names
	var isTypedArray = (function(TypedArray) {
	  // eslint-disable-next-line func-names
	  return function(thing) {
	    return TypedArray && thing instanceof TypedArray;
	  };
	})(typeof Uint8Array !== 'undefined' && Object.getPrototypeOf(Uint8Array));

	var utils$c = {
	  isArray: isArray$1,
	  isArrayBuffer: isArrayBuffer,
	  isBuffer: isBuffer,
	  isFormData: isFormData,
	  isArrayBufferView: isArrayBufferView,
	  isString: isString,
	  isNumber: isNumber,
	  isObject: isObject$1,
	  isPlainObject: isPlainObject,
	  isUndefined: isUndefined,
	  isDate: isDate,
	  isFile: isFile,
	  isBlob: isBlob,
	  isFunction: isFunction,
	  isStream: isStream,
	  isURLSearchParams: isURLSearchParams,
	  isStandardBrowserEnv: isStandardBrowserEnv,
	  forEach: forEach,
	  merge: merge,
	  extend: extend,
	  trim: trim,
	  stripBOM: stripBOM,
	  inherits: inherits,
	  toFlatObject: toFlatObject,
	  kindOf: kindOf,
	  kindOfTest: kindOfTest,
	  endsWith: endsWith,
	  toArray: toArray,
	  isTypedArray: isTypedArray,
	  isFileList: isFileList
	};

	var utils$b = utils$c;

	function encode(val) {
	  return encodeURIComponent(val).
	    replace(/%3A/gi, ':').
	    replace(/%24/g, '$').
	    replace(/%2C/gi, ',').
	    replace(/%20/g, '+').
	    replace(/%5B/gi, '[').
	    replace(/%5D/gi, ']');
	}

	/**
	 * Build a URL by appending params to the end
	 *
	 * @param {string} url The base of the url (e.g., http://www.google.com)
	 * @param {object} [params] The params to be appended
	 * @returns {string} The formatted url
	 */
	var buildURL$1 = function buildURL(url, params, paramsSerializer) {
	  /*eslint no-param-reassign:0*/
	  if (!params) {
	    return url;
	  }

	  var serializedParams;
	  if (paramsSerializer) {
	    serializedParams = paramsSerializer(params);
	  } else if (utils$b.isURLSearchParams(params)) {
	    serializedParams = params.toString();
	  } else {
	    var parts = [];

	    utils$b.forEach(params, function serialize(val, key) {
	      if (val === null || typeof val === 'undefined') {
	        return;
	      }

	      if (utils$b.isArray(val)) {
	        key = key + '[]';
	      } else {
	        val = [val];
	      }

	      utils$b.forEach(val, function parseValue(v) {
	        if (utils$b.isDate(v)) {
	          v = v.toISOString();
	        } else if (utils$b.isObject(v)) {
	          v = JSON.stringify(v);
	        }
	        parts.push(encode(key) + '=' + encode(v));
	      });
	    });

	    serializedParams = parts.join('&');
	  }

	  if (serializedParams) {
	    var hashmarkIndex = url.indexOf('#');
	    if (hashmarkIndex !== -1) {
	      url = url.slice(0, hashmarkIndex);
	    }

	    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
	  }

	  return url;
	};

	var utils$a = utils$c;

	function InterceptorManager$1() {
	  this.handlers = [];
	}

	/**
	 * Add a new interceptor to the stack
	 *
	 * @param {Function} fulfilled The function to handle `then` for a `Promise`
	 * @param {Function} rejected The function to handle `reject` for a `Promise`
	 *
	 * @return {Number} An ID used to remove interceptor later
	 */
	InterceptorManager$1.prototype.use = function use(fulfilled, rejected, options) {
	  this.handlers.push({
	    fulfilled: fulfilled,
	    rejected: rejected,
	    synchronous: options ? options.synchronous : false,
	    runWhen: options ? options.runWhen : null
	  });
	  return this.handlers.length - 1;
	};

	/**
	 * Remove an interceptor from the stack
	 *
	 * @param {Number} id The ID that was returned by `use`
	 */
	InterceptorManager$1.prototype.eject = function eject(id) {
	  if (this.handlers[id]) {
	    this.handlers[id] = null;
	  }
	};

	/**
	 * Iterate over all the registered interceptors
	 *
	 * This method is particularly useful for skipping over any
	 * interceptors that may have become `null` calling `eject`.
	 *
	 * @param {Function} fn The function to call for each interceptor
	 */
	InterceptorManager$1.prototype.forEach = function forEach(fn) {
	  utils$a.forEach(this.handlers, function forEachHandler(h) {
	    if (h !== null) {
	      fn(h);
	    }
	  });
	};

	var InterceptorManager_1 = InterceptorManager$1;

	var utils$9 = utils$c;

	var normalizeHeaderName$1 = function normalizeHeaderName(headers, normalizedName) {
	  utils$9.forEach(headers, function processHeader(value, name) {
	    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
	      headers[normalizedName] = value;
	      delete headers[name];
	    }
	  });
	};

	var AxiosError_1;
	var hasRequiredAxiosError;

	function requireAxiosError () {
		if (hasRequiredAxiosError) return AxiosError_1;
		hasRequiredAxiosError = 1;

		var utils = utils$c;

		/**
		 * Create an Error with the specified message, config, error code, request and response.
		 *
		 * @param {string} message The error message.
		 * @param {string} [code] The error code (for example, 'ECONNABORTED').
		 * @param {Object} [config] The config.
		 * @param {Object} [request] The request.
		 * @param {Object} [response] The response.
		 * @returns {Error} The created error.
		 */
		function AxiosError(message, code, config, request, response) {
		  Error.call(this);
		  this.message = message;
		  this.name = 'AxiosError';
		  code && (this.code = code);
		  config && (this.config = config);
		  request && (this.request = request);
		  response && (this.response = response);
		}

		utils.inherits(AxiosError, Error, {
		  toJSON: function toJSON() {
		    return {
		      // Standard
		      message: this.message,
		      name: this.name,
		      // Microsoft
		      description: this.description,
		      number: this.number,
		      // Mozilla
		      fileName: this.fileName,
		      lineNumber: this.lineNumber,
		      columnNumber: this.columnNumber,
		      stack: this.stack,
		      // Axios
		      config: this.config,
		      code: this.code,
		      status: this.response && this.response.status ? this.response.status : null
		    };
		  }
		});

		var prototype = AxiosError.prototype;
		var descriptors = {};

		[
		  'ERR_BAD_OPTION_VALUE',
		  'ERR_BAD_OPTION',
		  'ECONNABORTED',
		  'ETIMEDOUT',
		  'ERR_NETWORK',
		  'ERR_FR_TOO_MANY_REDIRECTS',
		  'ERR_DEPRECATED',
		  'ERR_BAD_RESPONSE',
		  'ERR_BAD_REQUEST',
		  'ERR_CANCELED'
		// eslint-disable-next-line func-names
		].forEach(function(code) {
		  descriptors[code] = {value: code};
		});

		Object.defineProperties(AxiosError, descriptors);
		Object.defineProperty(prototype, 'isAxiosError', {value: true});

		// eslint-disable-next-line func-names
		AxiosError.from = function(error, code, config, request, response, customProps) {
		  var axiosError = Object.create(prototype);

		  utils.toFlatObject(error, axiosError, function filter(obj) {
		    return obj !== Error.prototype;
		  });

		  AxiosError.call(axiosError, error.message, code, config, request, response);

		  axiosError.name = error.name;

		  customProps && Object.assign(axiosError, customProps);

		  return axiosError;
		};

		AxiosError_1 = AxiosError;
		return AxiosError_1;
	}

	var transitional = {
	  silentJSONParsing: true,
	  forcedJSONParsing: true,
	  clarifyTimeoutError: false
	};

	var toFormData_1;
	var hasRequiredToFormData;

	function requireToFormData () {
		if (hasRequiredToFormData) return toFormData_1;
		hasRequiredToFormData = 1;

		var utils = utils$c;

		/**
		 * Convert a data object to FormData
		 * @param {Object} obj
		 * @param {?Object} [formData]
		 * @returns {Object}
		 **/

		function toFormData(obj, formData) {
		  // eslint-disable-next-line no-param-reassign
		  formData = formData || new FormData();

		  var stack = [];

		  function convertValue(value) {
		    if (value === null) return '';

		    if (utils.isDate(value)) {
		      return value.toISOString();
		    }

		    if (utils.isArrayBuffer(value) || utils.isTypedArray(value)) {
		      return typeof Blob === 'function' ? new Blob([value]) : Buffer.from(value);
		    }

		    return value;
		  }

		  function build(data, parentKey) {
		    if (utils.isPlainObject(data) || utils.isArray(data)) {
		      if (stack.indexOf(data) !== -1) {
		        throw Error('Circular reference detected in ' + parentKey);
		      }

		      stack.push(data);

		      utils.forEach(data, function each(value, key) {
		        if (utils.isUndefined(value)) return;
		        var fullKey = parentKey ? parentKey + '.' + key : key;
		        var arr;

		        if (value && !parentKey && typeof value === 'object') {
		          if (utils.endsWith(key, '{}')) {
		            // eslint-disable-next-line no-param-reassign
		            value = JSON.stringify(value);
		          } else if (utils.endsWith(key, '[]') && (arr = utils.toArray(value))) {
		            // eslint-disable-next-line func-names
		            arr.forEach(function(el) {
		              !utils.isUndefined(el) && formData.append(fullKey, convertValue(el));
		            });
		            return;
		          }
		        }

		        build(value, fullKey);
		      });

		      stack.pop();
		    } else {
		      formData.append(parentKey, convertValue(data));
		    }
		  }

		  build(obj);

		  return formData;
		}

		toFormData_1 = toFormData;
		return toFormData_1;
	}

	var settle;
	var hasRequiredSettle;

	function requireSettle () {
		if (hasRequiredSettle) return settle;
		hasRequiredSettle = 1;

		var AxiosError = requireAxiosError();

		/**
		 * Resolve or reject a Promise based on response status.
		 *
		 * @param {Function} resolve A function that resolves the promise.
		 * @param {Function} reject A function that rejects the promise.
		 * @param {object} response The response.
		 */
		settle = function settle(resolve, reject, response) {
		  var validateStatus = response.config.validateStatus;
		  if (!response.status || !validateStatus || validateStatus(response.status)) {
		    resolve(response);
		  } else {
		    reject(new AxiosError(
		      'Request failed with status code ' + response.status,
		      [AxiosError.ERR_BAD_REQUEST, AxiosError.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
		      response.config,
		      response.request,
		      response
		    ));
		  }
		};
		return settle;
	}

	var cookies;
	var hasRequiredCookies;

	function requireCookies () {
		if (hasRequiredCookies) return cookies;
		hasRequiredCookies = 1;

		var utils = utils$c;

		cookies = (
		  utils.isStandardBrowserEnv() ?

		  // Standard browser envs support document.cookie
		    (function standardBrowserEnv() {
		      return {
		        write: function write(name, value, expires, path, domain, secure) {
		          var cookie = [];
		          cookie.push(name + '=' + encodeURIComponent(value));

		          if (utils.isNumber(expires)) {
		            cookie.push('expires=' + new Date(expires).toGMTString());
		          }

		          if (utils.isString(path)) {
		            cookie.push('path=' + path);
		          }

		          if (utils.isString(domain)) {
		            cookie.push('domain=' + domain);
		          }

		          if (secure === true) {
		            cookie.push('secure');
		          }

		          document.cookie = cookie.join('; ');
		        },

		        read: function read(name) {
		          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
		          return (match ? decodeURIComponent(match[3]) : null);
		        },

		        remove: function remove(name) {
		          this.write(name, '', Date.now() - 86400000);
		        }
		      };
		    })() :

		  // Non standard browser env (web workers, react-native) lack needed support.
		    (function nonStandardBrowserEnv() {
		      return {
		        write: function write() {},
		        read: function read() { return null; },
		        remove: function remove() {}
		      };
		    })()
		);
		return cookies;
	}

	/**
	 * Determines whether the specified URL is absolute
	 *
	 * @param {string} url The URL to test
	 * @returns {boolean} True if the specified URL is absolute, otherwise false
	 */
	var isAbsoluteURL$1 = function isAbsoluteURL(url) {
	  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
	  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
	  // by any combination of letters, digits, plus, period, or hyphen.
	  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
	};

	/**
	 * Creates a new URL by combining the specified URLs
	 *
	 * @param {string} baseURL The base URL
	 * @param {string} relativeURL The relative URL
	 * @returns {string} The combined URL
	 */
	var combineURLs$1 = function combineURLs(baseURL, relativeURL) {
	  return relativeURL
	    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
	    : baseURL;
	};

	var isAbsoluteURL = isAbsoluteURL$1;
	var combineURLs = combineURLs$1;

	/**
	 * Creates a new URL by combining the baseURL with the requestedURL,
	 * only when the requestedURL is not already an absolute URL.
	 * If the requestURL is absolute, this function returns the requestedURL untouched.
	 *
	 * @param {string} baseURL The base URL
	 * @param {string} requestedURL Absolute or relative URL to combine
	 * @returns {string} The combined full path
	 */
	var buildFullPath$1 = function buildFullPath(baseURL, requestedURL) {
	  if (baseURL && !isAbsoluteURL(requestedURL)) {
	    return combineURLs(baseURL, requestedURL);
	  }
	  return requestedURL;
	};

	var parseHeaders;
	var hasRequiredParseHeaders;

	function requireParseHeaders () {
		if (hasRequiredParseHeaders) return parseHeaders;
		hasRequiredParseHeaders = 1;

		var utils = utils$c;

		// Headers whose duplicates are ignored by node
		// c.f. https://nodejs.org/api/http.html#http_message_headers
		var ignoreDuplicateOf = [
		  'age', 'authorization', 'content-length', 'content-type', 'etag',
		  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
		  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
		  'referer', 'retry-after', 'user-agent'
		];

		/**
		 * Parse headers into an object
		 *
		 * ```
		 * Date: Wed, 27 Aug 2014 08:58:49 GMT
		 * Content-Type: application/json
		 * Connection: keep-alive
		 * Transfer-Encoding: chunked
		 * ```
		 *
		 * @param {String} headers Headers needing to be parsed
		 * @returns {Object} Headers parsed into an object
		 */
		parseHeaders = function parseHeaders(headers) {
		  var parsed = {};
		  var key;
		  var val;
		  var i;

		  if (!headers) { return parsed; }

		  utils.forEach(headers.split('\n'), function parser(line) {
		    i = line.indexOf(':');
		    key = utils.trim(line.substr(0, i)).toLowerCase();
		    val = utils.trim(line.substr(i + 1));

		    if (key) {
		      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
		        return;
		      }
		      if (key === 'set-cookie') {
		        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
		      } else {
		        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
		      }
		    }
		  });

		  return parsed;
		};
		return parseHeaders;
	}

	var isURLSameOrigin;
	var hasRequiredIsURLSameOrigin;

	function requireIsURLSameOrigin () {
		if (hasRequiredIsURLSameOrigin) return isURLSameOrigin;
		hasRequiredIsURLSameOrigin = 1;

		var utils = utils$c;

		isURLSameOrigin = (
		  utils.isStandardBrowserEnv() ?

		  // Standard browser envs have full support of the APIs needed to test
		  // whether the request URL is of the same origin as current location.
		    (function standardBrowserEnv() {
		      var msie = /(msie|trident)/i.test(navigator.userAgent);
		      var urlParsingNode = document.createElement('a');
		      var originURL;

		      /**
		    * Parse a URL to discover it's components
		    *
		    * @param {String} url The URL to be parsed
		    * @returns {Object}
		    */
		      function resolveURL(url) {
		        var href = url;

		        if (msie) {
		        // IE needs attribute set twice to normalize properties
		          urlParsingNode.setAttribute('href', href);
		          href = urlParsingNode.href;
		        }

		        urlParsingNode.setAttribute('href', href);

		        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
		        return {
		          href: urlParsingNode.href,
		          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
		          host: urlParsingNode.host,
		          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
		          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
		          hostname: urlParsingNode.hostname,
		          port: urlParsingNode.port,
		          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
		            urlParsingNode.pathname :
		            '/' + urlParsingNode.pathname
		        };
		      }

		      originURL = resolveURL(window.location.href);

		      /**
		    * Determine if a URL shares the same origin as the current location
		    *
		    * @param {String} requestURL The URL to test
		    * @returns {boolean} True if URL shares the same origin, otherwise false
		    */
		      return function isURLSameOrigin(requestURL) {
		        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
		        return (parsed.protocol === originURL.protocol &&
		            parsed.host === originURL.host);
		      };
		    })() :

		  // Non standard browser envs (web workers, react-native) lack needed support.
		    (function nonStandardBrowserEnv() {
		      return function isURLSameOrigin() {
		        return true;
		      };
		    })()
		);
		return isURLSameOrigin;
	}

	var CanceledError_1;
	var hasRequiredCanceledError;

	function requireCanceledError () {
		if (hasRequiredCanceledError) return CanceledError_1;
		hasRequiredCanceledError = 1;

		var AxiosError = requireAxiosError();
		var utils = utils$c;

		/**
		 * A `CanceledError` is an object that is thrown when an operation is canceled.
		 *
		 * @class
		 * @param {string=} message The message.
		 */
		function CanceledError(message) {
		  // eslint-disable-next-line no-eq-null,eqeqeq
		  AxiosError.call(this, message == null ? 'canceled' : message, AxiosError.ERR_CANCELED);
		  this.name = 'CanceledError';
		}

		utils.inherits(CanceledError, AxiosError, {
		  __CANCEL__: true
		});

		CanceledError_1 = CanceledError;
		return CanceledError_1;
	}

	var parseProtocol;
	var hasRequiredParseProtocol;

	function requireParseProtocol () {
		if (hasRequiredParseProtocol) return parseProtocol;
		hasRequiredParseProtocol = 1;

		parseProtocol = function parseProtocol(url) {
		  var match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
		  return match && match[1] || '';
		};
		return parseProtocol;
	}

	var xhr;
	var hasRequiredXhr;

	function requireXhr () {
		if (hasRequiredXhr) return xhr;
		hasRequiredXhr = 1;

		var utils = utils$c;
		var settle = requireSettle();
		var cookies = requireCookies();
		var buildURL = buildURL$1;
		var buildFullPath = buildFullPath$1;
		var parseHeaders = requireParseHeaders();
		var isURLSameOrigin = requireIsURLSameOrigin();
		var transitionalDefaults = transitional;
		var AxiosError = requireAxiosError();
		var CanceledError = requireCanceledError();
		var parseProtocol = requireParseProtocol();

		xhr = function xhrAdapter(config) {
		  return new Promise(function dispatchXhrRequest(resolve, reject) {
		    var requestData = config.data;
		    var requestHeaders = config.headers;
		    var responseType = config.responseType;
		    var onCanceled;
		    function done() {
		      if (config.cancelToken) {
		        config.cancelToken.unsubscribe(onCanceled);
		      }

		      if (config.signal) {
		        config.signal.removeEventListener('abort', onCanceled);
		      }
		    }

		    if (utils.isFormData(requestData) && utils.isStandardBrowserEnv()) {
		      delete requestHeaders['Content-Type']; // Let the browser set it
		    }

		    var request = new XMLHttpRequest();

		    // HTTP basic authentication
		    if (config.auth) {
		      var username = config.auth.username || '';
		      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
		      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
		    }

		    var fullPath = buildFullPath(config.baseURL, config.url);

		    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

		    // Set the request timeout in MS
		    request.timeout = config.timeout;

		    function onloadend() {
		      if (!request) {
		        return;
		      }
		      // Prepare the response
		      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
		      var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
		        request.responseText : request.response;
		      var response = {
		        data: responseData,
		        status: request.status,
		        statusText: request.statusText,
		        headers: responseHeaders,
		        config: config,
		        request: request
		      };

		      settle(function _resolve(value) {
		        resolve(value);
		        done();
		      }, function _reject(err) {
		        reject(err);
		        done();
		      }, response);

		      // Clean up request
		      request = null;
		    }

		    if ('onloadend' in request) {
		      // Use onloadend if available
		      request.onloadend = onloadend;
		    } else {
		      // Listen for ready state to emulate onloadend
		      request.onreadystatechange = function handleLoad() {
		        if (!request || request.readyState !== 4) {
		          return;
		        }

		        // The request errored out and we didn't get a response, this will be
		        // handled by onerror instead
		        // With one exception: request that using file: protocol, most browsers
		        // will return status as 0 even though it's a successful request
		        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
		          return;
		        }
		        // readystate handler is calling before onerror or ontimeout handlers,
		        // so we should call onloadend on the next 'tick'
		        setTimeout(onloadend);
		      };
		    }

		    // Handle browser request cancellation (as opposed to a manual cancellation)
		    request.onabort = function handleAbort() {
		      if (!request) {
		        return;
		      }

		      reject(new AxiosError('Request aborted', AxiosError.ECONNABORTED, config, request));

		      // Clean up request
		      request = null;
		    };

		    // Handle low level network errors
		    request.onerror = function handleError() {
		      // Real errors are hidden from us by the browser
		      // onerror should only fire if it's a network error
		      reject(new AxiosError('Network Error', AxiosError.ERR_NETWORK, config, request, request));

		      // Clean up request
		      request = null;
		    };

		    // Handle timeout
		    request.ontimeout = function handleTimeout() {
		      var timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
		      var transitional = config.transitional || transitionalDefaults;
		      if (config.timeoutErrorMessage) {
		        timeoutErrorMessage = config.timeoutErrorMessage;
		      }
		      reject(new AxiosError(
		        timeoutErrorMessage,
		        transitional.clarifyTimeoutError ? AxiosError.ETIMEDOUT : AxiosError.ECONNABORTED,
		        config,
		        request));

		      // Clean up request
		      request = null;
		    };

		    // Add xsrf header
		    // This is only done if running in a standard browser environment.
		    // Specifically not if we're in a web worker, or react-native.
		    if (utils.isStandardBrowserEnv()) {
		      // Add xsrf header
		      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
		        cookies.read(config.xsrfCookieName) :
		        undefined;

		      if (xsrfValue) {
		        requestHeaders[config.xsrfHeaderName] = xsrfValue;
		      }
		    }

		    // Add headers to the request
		    if ('setRequestHeader' in request) {
		      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
		        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
		          // Remove Content-Type if data is undefined
		          delete requestHeaders[key];
		        } else {
		          // Otherwise add header to the request
		          request.setRequestHeader(key, val);
		        }
		      });
		    }

		    // Add withCredentials to request if needed
		    if (!utils.isUndefined(config.withCredentials)) {
		      request.withCredentials = !!config.withCredentials;
		    }

		    // Add responseType to request if needed
		    if (responseType && responseType !== 'json') {
		      request.responseType = config.responseType;
		    }

		    // Handle progress if needed
		    if (typeof config.onDownloadProgress === 'function') {
		      request.addEventListener('progress', config.onDownloadProgress);
		    }

		    // Not all browsers support upload events
		    if (typeof config.onUploadProgress === 'function' && request.upload) {
		      request.upload.addEventListener('progress', config.onUploadProgress);
		    }

		    if (config.cancelToken || config.signal) {
		      // Handle cancellation
		      // eslint-disable-next-line func-names
		      onCanceled = function(cancel) {
		        if (!request) {
		          return;
		        }
		        reject(!cancel || (cancel && cancel.type) ? new CanceledError() : cancel);
		        request.abort();
		        request = null;
		      };

		      config.cancelToken && config.cancelToken.subscribe(onCanceled);
		      if (config.signal) {
		        config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
		      }
		    }

		    if (!requestData) {
		      requestData = null;
		    }

		    var protocol = parseProtocol(fullPath);

		    if (protocol && [ 'http', 'https', 'file' ].indexOf(protocol) === -1) {
		      reject(new AxiosError('Unsupported protocol ' + protocol + ':', AxiosError.ERR_BAD_REQUEST, config));
		      return;
		    }


		    // Send the request
		    request.send(requestData);
		  });
		};
		return xhr;
	}

	var _null;
	var hasRequired_null;

	function require_null () {
		if (hasRequired_null) return _null;
		hasRequired_null = 1;
		// eslint-disable-next-line strict
		_null = null;
		return _null;
	}

	var utils$8 = utils$c;
	var normalizeHeaderName = normalizeHeaderName$1;
	var AxiosError$1 = requireAxiosError();
	var transitionalDefaults = transitional;
	var toFormData = requireToFormData();

	var DEFAULT_CONTENT_TYPE = {
	  'Content-Type': 'application/x-www-form-urlencoded'
	};

	function setContentTypeIfUnset(headers, value) {
	  if (!utils$8.isUndefined(headers) && utils$8.isUndefined(headers['Content-Type'])) {
	    headers['Content-Type'] = value;
	  }
	}

	function getDefaultAdapter() {
	  var adapter;
	  if (typeof XMLHttpRequest !== 'undefined') {
	    // For browsers use XHR adapter
	    adapter = requireXhr();
	  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
	    // For node use HTTP adapter
	    adapter = requireXhr();
	  }
	  return adapter;
	}

	function stringifySafely(rawValue, parser, encoder) {
	  if (utils$8.isString(rawValue)) {
	    try {
	      (parser || JSON.parse)(rawValue);
	      return utils$8.trim(rawValue);
	    } catch (e) {
	      if (e.name !== 'SyntaxError') {
	        throw e;
	      }
	    }
	  }

	  return (encoder || JSON.stringify)(rawValue);
	}

	var defaults$3 = {

	  transitional: transitionalDefaults,

	  adapter: getDefaultAdapter(),

	  transformRequest: [function transformRequest(data, headers) {
	    normalizeHeaderName(headers, 'Accept');
	    normalizeHeaderName(headers, 'Content-Type');

	    if (utils$8.isFormData(data) ||
	      utils$8.isArrayBuffer(data) ||
	      utils$8.isBuffer(data) ||
	      utils$8.isStream(data) ||
	      utils$8.isFile(data) ||
	      utils$8.isBlob(data)
	    ) {
	      return data;
	    }
	    if (utils$8.isArrayBufferView(data)) {
	      return data.buffer;
	    }
	    if (utils$8.isURLSearchParams(data)) {
	      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
	      return data.toString();
	    }

	    var isObjectPayload = utils$8.isObject(data);
	    var contentType = headers && headers['Content-Type'];

	    var isFileList;

	    if ((isFileList = utils$8.isFileList(data)) || (isObjectPayload && contentType === 'multipart/form-data')) {
	      var _FormData = this.env && this.env.FormData;
	      return toFormData(isFileList ? {'files[]': data} : data, _FormData && new _FormData());
	    } else if (isObjectPayload || contentType === 'application/json') {
	      setContentTypeIfUnset(headers, 'application/json');
	      return stringifySafely(data);
	    }

	    return data;
	  }],

	  transformResponse: [function transformResponse(data) {
	    var transitional = this.transitional || defaults$3.transitional;
	    var silentJSONParsing = transitional && transitional.silentJSONParsing;
	    var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
	    var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

	    if (strictJSONParsing || (forcedJSONParsing && utils$8.isString(data) && data.length)) {
	      try {
	        return JSON.parse(data);
	      } catch (e) {
	        if (strictJSONParsing) {
	          if (e.name === 'SyntaxError') {
	            throw AxiosError$1.from(e, AxiosError$1.ERR_BAD_RESPONSE, this, null, this.response);
	          }
	          throw e;
	        }
	      }
	    }

	    return data;
	  }],

	  /**
	   * A timeout in milliseconds to abort a request. If set to 0 (default) a
	   * timeout is not created.
	   */
	  timeout: 0,

	  xsrfCookieName: 'XSRF-TOKEN',
	  xsrfHeaderName: 'X-XSRF-TOKEN',

	  maxContentLength: -1,
	  maxBodyLength: -1,

	  env: {
	    FormData: require_null()
	  },

	  validateStatus: function validateStatus(status) {
	    return status >= 200 && status < 300;
	  },

	  headers: {
	    common: {
	      'Accept': 'application/json, text/plain, */*'
	    }
	  }
	};

	utils$8.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
	  defaults$3.headers[method] = {};
	});

	utils$8.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
	  defaults$3.headers[method] = utils$8.merge(DEFAULT_CONTENT_TYPE);
	});

	var defaults_1 = defaults$3;

	var utils$7 = utils$c;
	var defaults$2 = defaults_1;

	/**
	 * Transform the data for a request or a response
	 *
	 * @param {Object|String} data The data to be transformed
	 * @param {Array} headers The headers for the request or response
	 * @param {Array|Function} fns A single function or Array of functions
	 * @returns {*} The resulting transformed data
	 */
	var transformData$1 = function transformData(data, headers, fns) {
	  var context = this || defaults$2;
	  /*eslint no-param-reassign:0*/
	  utils$7.forEach(fns, function transform(fn) {
	    data = fn.call(context, data, headers);
	  });

	  return data;
	};

	var isCancel$1;
	var hasRequiredIsCancel;

	function requireIsCancel () {
		if (hasRequiredIsCancel) return isCancel$1;
		hasRequiredIsCancel = 1;

		isCancel$1 = function isCancel(value) {
		  return !!(value && value.__CANCEL__);
		};
		return isCancel$1;
	}

	var utils$6 = utils$c;
	var transformData = transformData$1;
	var isCancel = requireIsCancel();
	var defaults$1 = defaults_1;
	var CanceledError = requireCanceledError();

	/**
	 * Throws a `CanceledError` if cancellation has been requested.
	 */
	function throwIfCancellationRequested(config) {
	  if (config.cancelToken) {
	    config.cancelToken.throwIfRequested();
	  }

	  if (config.signal && config.signal.aborted) {
	    throw new CanceledError();
	  }
	}

	/**
	 * Dispatch a request to the server using the configured adapter.
	 *
	 * @param {object} config The config that is to be used for the request
	 * @returns {Promise} The Promise to be fulfilled
	 */
	var dispatchRequest$1 = function dispatchRequest(config) {
	  throwIfCancellationRequested(config);

	  // Ensure headers exist
	  config.headers = config.headers || {};

	  // Transform request data
	  config.data = transformData.call(
	    config,
	    config.data,
	    config.headers,
	    config.transformRequest
	  );

	  // Flatten headers
	  config.headers = utils$6.merge(
	    config.headers.common || {},
	    config.headers[config.method] || {},
	    config.headers
	  );

	  utils$6.forEach(
	    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
	    function cleanHeaderConfig(method) {
	      delete config.headers[method];
	    }
	  );

	  var adapter = config.adapter || defaults$1.adapter;

	  return adapter(config).then(function onAdapterResolution(response) {
	    throwIfCancellationRequested(config);

	    // Transform response data
	    response.data = transformData.call(
	      config,
	      response.data,
	      response.headers,
	      config.transformResponse
	    );

	    return response;
	  }, function onAdapterRejection(reason) {
	    if (!isCancel(reason)) {
	      throwIfCancellationRequested(config);

	      // Transform response data
	      if (reason && reason.response) {
	        reason.response.data = transformData.call(
	          config,
	          reason.response.data,
	          reason.response.headers,
	          config.transformResponse
	        );
	      }
	    }

	    return Promise.reject(reason);
	  });
	};

	var utils$5 = utils$c;

	/**
	 * Config-specific merge-function which creates a new config-object
	 * by merging two configuration objects together.
	 *
	 * @param {Object} config1
	 * @param {Object} config2
	 * @returns {Object} New object resulting from merging config2 to config1
	 */
	var mergeConfig$2 = function mergeConfig(config1, config2) {
	  // eslint-disable-next-line no-param-reassign
	  config2 = config2 || {};
	  var config = {};

	  function getMergedValue(target, source) {
	    if (utils$5.isPlainObject(target) && utils$5.isPlainObject(source)) {
	      return utils$5.merge(target, source);
	    } else if (utils$5.isPlainObject(source)) {
	      return utils$5.merge({}, source);
	    } else if (utils$5.isArray(source)) {
	      return source.slice();
	    }
	    return source;
	  }

	  // eslint-disable-next-line consistent-return
	  function mergeDeepProperties(prop) {
	    if (!utils$5.isUndefined(config2[prop])) {
	      return getMergedValue(config1[prop], config2[prop]);
	    } else if (!utils$5.isUndefined(config1[prop])) {
	      return getMergedValue(undefined, config1[prop]);
	    }
	  }

	  // eslint-disable-next-line consistent-return
	  function valueFromConfig2(prop) {
	    if (!utils$5.isUndefined(config2[prop])) {
	      return getMergedValue(undefined, config2[prop]);
	    }
	  }

	  // eslint-disable-next-line consistent-return
	  function defaultToConfig2(prop) {
	    if (!utils$5.isUndefined(config2[prop])) {
	      return getMergedValue(undefined, config2[prop]);
	    } else if (!utils$5.isUndefined(config1[prop])) {
	      return getMergedValue(undefined, config1[prop]);
	    }
	  }

	  // eslint-disable-next-line consistent-return
	  function mergeDirectKeys(prop) {
	    if (prop in config2) {
	      return getMergedValue(config1[prop], config2[prop]);
	    } else if (prop in config1) {
	      return getMergedValue(undefined, config1[prop]);
	    }
	  }

	  var mergeMap = {
	    'url': valueFromConfig2,
	    'method': valueFromConfig2,
	    'data': valueFromConfig2,
	    'baseURL': defaultToConfig2,
	    'transformRequest': defaultToConfig2,
	    'transformResponse': defaultToConfig2,
	    'paramsSerializer': defaultToConfig2,
	    'timeout': defaultToConfig2,
	    'timeoutMessage': defaultToConfig2,
	    'withCredentials': defaultToConfig2,
	    'adapter': defaultToConfig2,
	    'responseType': defaultToConfig2,
	    'xsrfCookieName': defaultToConfig2,
	    'xsrfHeaderName': defaultToConfig2,
	    'onUploadProgress': defaultToConfig2,
	    'onDownloadProgress': defaultToConfig2,
	    'decompress': defaultToConfig2,
	    'maxContentLength': defaultToConfig2,
	    'maxBodyLength': defaultToConfig2,
	    'beforeRedirect': defaultToConfig2,
	    'transport': defaultToConfig2,
	    'httpAgent': defaultToConfig2,
	    'httpsAgent': defaultToConfig2,
	    'cancelToken': defaultToConfig2,
	    'socketPath': defaultToConfig2,
	    'responseEncoding': defaultToConfig2,
	    'validateStatus': mergeDirectKeys
	  };

	  utils$5.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
	    var merge = mergeMap[prop] || mergeDeepProperties;
	    var configValue = merge(prop);
	    (utils$5.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
	  });

	  return config;
	};

	var data;
	var hasRequiredData;

	function requireData () {
		if (hasRequiredData) return data;
		hasRequiredData = 1;
		data = {
		  "version": "0.27.2"
		};
		return data;
	}

	var VERSION = requireData().version;
	var AxiosError = requireAxiosError();

	var validators$1 = {};

	// eslint-disable-next-line func-names
	['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
	  validators$1[type] = function validator(thing) {
	    return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
	  };
	});

	var deprecatedWarnings = {};

	/**
	 * Transitional option validator
	 * @param {function|boolean?} validator - set to false if the transitional option has been removed
	 * @param {string?} version - deprecated version / removed since version
	 * @param {string?} message - some message with additional info
	 * @returns {function}
	 */
	validators$1.transitional = function transitional(validator, version, message) {
	  function formatMessage(opt, desc) {
	    return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
	  }

	  // eslint-disable-next-line func-names
	  return function(value, opt, opts) {
	    if (validator === false) {
	      throw new AxiosError(
	        formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')),
	        AxiosError.ERR_DEPRECATED
	      );
	    }

	    if (version && !deprecatedWarnings[opt]) {
	      deprecatedWarnings[opt] = true;
	      // eslint-disable-next-line no-console
	      console.warn(
	        formatMessage(
	          opt,
	          ' has been deprecated since v' + version + ' and will be removed in the near future'
	        )
	      );
	    }

	    return validator ? validator(value, opt, opts) : true;
	  };
	};

	/**
	 * Assert object's properties type
	 * @param {object} options
	 * @param {object} schema
	 * @param {boolean?} allowUnknown
	 */

	function assertOptions(options, schema, allowUnknown) {
	  if (typeof options !== 'object') {
	    throw new AxiosError('options must be an object', AxiosError.ERR_BAD_OPTION_VALUE);
	  }
	  var keys = Object.keys(options);
	  var i = keys.length;
	  while (i-- > 0) {
	    var opt = keys[i];
	    var validator = schema[opt];
	    if (validator) {
	      var value = options[opt];
	      var result = value === undefined || validator(value, opt, options);
	      if (result !== true) {
	        throw new AxiosError('option ' + opt + ' must be ' + result, AxiosError.ERR_BAD_OPTION_VALUE);
	      }
	      continue;
	    }
	    if (allowUnknown !== true) {
	      throw new AxiosError('Unknown option ' + opt, AxiosError.ERR_BAD_OPTION);
	    }
	  }
	}

	var validator$1 = {
	  assertOptions: assertOptions,
	  validators: validators$1
	};

	var utils$4 = utils$c;
	var buildURL = buildURL$1;
	var InterceptorManager = InterceptorManager_1;
	var dispatchRequest = dispatchRequest$1;
	var mergeConfig$1 = mergeConfig$2;
	var buildFullPath = buildFullPath$1;
	var validator = validator$1;

	var validators = validator.validators;
	/**
	 * Create a new instance of Axios
	 *
	 * @param {Object} instanceConfig The default config for the instance
	 */
	function Axios$1(instanceConfig) {
	  this.defaults = instanceConfig;
	  this.interceptors = {
	    request: new InterceptorManager(),
	    response: new InterceptorManager()
	  };
	}

	/**
	 * Dispatch a request
	 *
	 * @param {Object} config The config specific for this request (merged with this.defaults)
	 */
	Axios$1.prototype.request = function request(configOrUrl, config) {
	  /*eslint no-param-reassign:0*/
	  // Allow for axios('example/url'[, config]) a la fetch API
	  if (typeof configOrUrl === 'string') {
	    config = config || {};
	    config.url = configOrUrl;
	  } else {
	    config = configOrUrl || {};
	  }

	  config = mergeConfig$1(this.defaults, config);

	  // Set config.method
	  if (config.method) {
	    config.method = config.method.toLowerCase();
	  } else if (this.defaults.method) {
	    config.method = this.defaults.method.toLowerCase();
	  } else {
	    config.method = 'get';
	  }

	  var transitional = config.transitional;

	  if (transitional !== undefined) {
	    validator.assertOptions(transitional, {
	      silentJSONParsing: validators.transitional(validators.boolean),
	      forcedJSONParsing: validators.transitional(validators.boolean),
	      clarifyTimeoutError: validators.transitional(validators.boolean)
	    }, false);
	  }

	  // filter out skipped interceptors
	  var requestInterceptorChain = [];
	  var synchronousRequestInterceptors = true;
	  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
	    if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
	      return;
	    }

	    synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

	    requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
	  });

	  var responseInterceptorChain = [];
	  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
	    responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
	  });

	  var promise;

	  if (!synchronousRequestInterceptors) {
	    var chain = [dispatchRequest, undefined];

	    Array.prototype.unshift.apply(chain, requestInterceptorChain);
	    chain = chain.concat(responseInterceptorChain);

	    promise = Promise.resolve(config);
	    while (chain.length) {
	      promise = promise.then(chain.shift(), chain.shift());
	    }

	    return promise;
	  }


	  var newConfig = config;
	  while (requestInterceptorChain.length) {
	    var onFulfilled = requestInterceptorChain.shift();
	    var onRejected = requestInterceptorChain.shift();
	    try {
	      newConfig = onFulfilled(newConfig);
	    } catch (error) {
	      onRejected(error);
	      break;
	    }
	  }

	  try {
	    promise = dispatchRequest(newConfig);
	  } catch (error) {
	    return Promise.reject(error);
	  }

	  while (responseInterceptorChain.length) {
	    promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
	  }

	  return promise;
	};

	Axios$1.prototype.getUri = function getUri(config) {
	  config = mergeConfig$1(this.defaults, config);
	  var fullPath = buildFullPath(config.baseURL, config.url);
	  return buildURL(fullPath, config.params, config.paramsSerializer);
	};

	// Provide aliases for supported request methods
	utils$4.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
	  /*eslint func-names:0*/
	  Axios$1.prototype[method] = function(url, config) {
	    return this.request(mergeConfig$1(config || {}, {
	      method: method,
	      url: url,
	      data: (config || {}).data
	    }));
	  };
	});

	utils$4.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
	  /*eslint func-names:0*/

	  function generateHTTPMethod(isForm) {
	    return function httpMethod(url, data, config) {
	      return this.request(mergeConfig$1(config || {}, {
	        method: method,
	        headers: isForm ? {
	          'Content-Type': 'multipart/form-data'
	        } : {},
	        url: url,
	        data: data
	      }));
	    };
	  }

	  Axios$1.prototype[method] = generateHTTPMethod();

	  Axios$1.prototype[method + 'Form'] = generateHTTPMethod(true);
	});

	var Axios_1 = Axios$1;

	var CancelToken_1;
	var hasRequiredCancelToken;

	function requireCancelToken () {
		if (hasRequiredCancelToken) return CancelToken_1;
		hasRequiredCancelToken = 1;

		var CanceledError = requireCanceledError();

		/**
		 * A `CancelToken` is an object that can be used to request cancellation of an operation.
		 *
		 * @class
		 * @param {Function} executor The executor function.
		 */
		function CancelToken(executor) {
		  if (typeof executor !== 'function') {
		    throw new TypeError('executor must be a function.');
		  }

		  var resolvePromise;

		  this.promise = new Promise(function promiseExecutor(resolve) {
		    resolvePromise = resolve;
		  });

		  var token = this;

		  // eslint-disable-next-line func-names
		  this.promise.then(function(cancel) {
		    if (!token._listeners) return;

		    var i;
		    var l = token._listeners.length;

		    for (i = 0; i < l; i++) {
		      token._listeners[i](cancel);
		    }
		    token._listeners = null;
		  });

		  // eslint-disable-next-line func-names
		  this.promise.then = function(onfulfilled) {
		    var _resolve;
		    // eslint-disable-next-line func-names
		    var promise = new Promise(function(resolve) {
		      token.subscribe(resolve);
		      _resolve = resolve;
		    }).then(onfulfilled);

		    promise.cancel = function reject() {
		      token.unsubscribe(_resolve);
		    };

		    return promise;
		  };

		  executor(function cancel(message) {
		    if (token.reason) {
		      // Cancellation has already been requested
		      return;
		    }

		    token.reason = new CanceledError(message);
		    resolvePromise(token.reason);
		  });
		}

		/**
		 * Throws a `CanceledError` if cancellation has been requested.
		 */
		CancelToken.prototype.throwIfRequested = function throwIfRequested() {
		  if (this.reason) {
		    throw this.reason;
		  }
		};

		/**
		 * Subscribe to the cancel signal
		 */

		CancelToken.prototype.subscribe = function subscribe(listener) {
		  if (this.reason) {
		    listener(this.reason);
		    return;
		  }

		  if (this._listeners) {
		    this._listeners.push(listener);
		  } else {
		    this._listeners = [listener];
		  }
		};

		/**
		 * Unsubscribe from the cancel signal
		 */

		CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
		  if (!this._listeners) {
		    return;
		  }
		  var index = this._listeners.indexOf(listener);
		  if (index !== -1) {
		    this._listeners.splice(index, 1);
		  }
		};

		/**
		 * Returns an object that contains a new `CancelToken` and a function that, when called,
		 * cancels the `CancelToken`.
		 */
		CancelToken.source = function source() {
		  var cancel;
		  var token = new CancelToken(function executor(c) {
		    cancel = c;
		  });
		  return {
		    token: token,
		    cancel: cancel
		  };
		};

		CancelToken_1 = CancelToken;
		return CancelToken_1;
	}

	var spread;
	var hasRequiredSpread;

	function requireSpread () {
		if (hasRequiredSpread) return spread;
		hasRequiredSpread = 1;

		/**
		 * Syntactic sugar for invoking a function and expanding an array for arguments.
		 *
		 * Common use case would be to use `Function.prototype.apply`.
		 *
		 *  ```js
		 *  function f(x, y, z) {}
		 *  var args = [1, 2, 3];
		 *  f.apply(null, args);
		 *  ```
		 *
		 * With `spread` this example can be re-written.
		 *
		 *  ```js
		 *  spread(function(x, y, z) {})([1, 2, 3]);
		 *  ```
		 *
		 * @param {Function} callback
		 * @returns {Function}
		 */
		spread = function spread(callback) {
		  return function wrap(arr) {
		    return callback.apply(null, arr);
		  };
		};
		return spread;
	}

	var isAxiosError;
	var hasRequiredIsAxiosError;

	function requireIsAxiosError () {
		if (hasRequiredIsAxiosError) return isAxiosError;
		hasRequiredIsAxiosError = 1;

		var utils = utils$c;

		/**
		 * Determines whether the payload is an error thrown by Axios
		 *
		 * @param {*} payload The value to test
		 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
		 */
		isAxiosError = function isAxiosError(payload) {
		  return utils.isObject(payload) && (payload.isAxiosError === true);
		};
		return isAxiosError;
	}

	var utils$3 = utils$c;
	var bind = bind$2;
	var Axios = Axios_1;
	var mergeConfig = mergeConfig$2;
	var defaults = defaults_1;

	/**
	 * Create an instance of Axios
	 *
	 * @param {Object} defaultConfig The default config for the instance
	 * @return {Axios} A new instance of Axios
	 */
	function createInstance(defaultConfig) {
	  var context = new Axios(defaultConfig);
	  var instance = bind(Axios.prototype.request, context);

	  // Copy axios.prototype to instance
	  utils$3.extend(instance, Axios.prototype, context);

	  // Copy context to instance
	  utils$3.extend(instance, context);

	  // Factory for creating new instances
	  instance.create = function create(instanceConfig) {
	    return createInstance(mergeConfig(defaultConfig, instanceConfig));
	  };

	  return instance;
	}

	// Create the default instance to be exported
	var axios$1 = createInstance(defaults);

	// Expose Axios class to allow class inheritance
	axios$1.Axios = Axios;

	// Expose Cancel & CancelToken
	axios$1.CanceledError = requireCanceledError();
	axios$1.CancelToken = requireCancelToken();
	axios$1.isCancel = requireIsCancel();
	axios$1.VERSION = requireData().version;
	axios$1.toFormData = requireToFormData();

	// Expose AxiosError class
	axios$1.AxiosError = requireAxiosError();

	// alias for CanceledError for backward compatibility
	axios$1.Cancel = axios$1.CanceledError;

	// Expose all/spread
	axios$1.all = function all(promises) {
	  return Promise.all(promises);
	};
	axios$1.spread = requireSpread();

	// Expose isAxiosError
	axios$1.isAxiosError = requireIsAxiosError();

	axios$2.exports = axios$1;

	// Allow use of default import syntax in TypeScript
	axios$2.exports.default = axios$1;

	(function (module) {
		module.exports = axios$2.exports;
	} (axios$3));

	/**
	 * @file constant.js
	 * @description 常量
	 * @created 2019年10月25日15:47:16
	 */
	var EN_TYPE$1 = 'en';
	var CN_TYPE$2 = 'cn';

	var constant = /*#__PURE__*/Object.freeze({
		__proto__: null,
		EN_TYPE: EN_TYPE$1,
		CN_TYPE: CN_TYPE$2
	});

	var require$$0 = /*@__PURE__*/getAugmentedNamespace(constant);

	var CN_TYPE$1 = require$$0.CN_TYPE;
	var config$1 = {
	  method: 'get',
	  // 基础url前缀
	  baseURL: '',
	  // 请求头信息
	  headers: {
	    'Content-Type': 'application/json;charset=UTF-8'
	  },
	  // 参数
	  data: {},
	  // 设置超时时间
	  timeout: 30e3,
	  // 携带凭证
	  withCredentials: false,
	  // 返回数据类型
	  responseType: 'json',
	  // 函数处理
	  handlers: {
	    // 默认语言, 可以通过传参更改
	    language: CN_TYPE$1,
	    // 语言错误自定义选项, 参考: src/language/en/index.js
	    // 若传此项, 需要重写language: null
	    languageOption: null,

	    /**
	     * @name timeout
	     * @desc {{description}}{{超时的处理, REM: 从外部传参重写}}
	     * @param \{{{string}}\} {{msg}} {{超时信息}}{{}}
	     */
	    timeout: function timeout(msg) {},

	    /**
	     * @name data
	     * @desc {{description}}{{处理后端约定code, REM: 从外部传参重写}}
	     * @param \{{{number}}\} {{code}} {{后端返回code}}{{}}
	     */
	    data: function data(_data) {
	      _data = _data || {};
	      _data.code; // 根据返回的code值来做不同的处理（和后端约定）
	    },

	    /**
	     * @name error
	     * @desc {{description}}{{报错统一处理, REM: 从外部传参重写}}
	     * @param \{{{errorInfo.message}}\} {{errorInfo}} {{错误信息}}{{}}
	     * @param \{{{errorInfo.response.status}}\} {{errorInfo}} {{错误状态}}{{}}
	     */
	    error: function error(errorInfo) {// 此处我使用的是 element UI 的提示组件
	      // Message.error(`ERROR: ${err}`);
	    },
	    config: function config(_config) {// 可以用来控制登陆权限
	      // if (!Utils.isNotLogin()) {
	      //     config.headers['X-Token'] = Utils.getToken() // 让每个请求携带token--['X-Token']为自定义key 请根据实际情况自行修改
	      // } else {
	      //     // 重定向到登录页面
	      //     window.location.href = 'login'
	      // }
	    },
	    loading: {
	      // 是否开启动画, 默认关闭, 需要请求中主动开启
	      open: false,
	      start: function start() {// UI开始loading动画
	      },
	      end: function end() {// UI结束loading动画
	      }
	    }
	  }
	};

	var indexOf$3 = {exports: {}};

	/* eslint-disable es/no-array-prototype-indexof -- required for testing */
	var $$2 = _export;
	var $indexOf = arrayIncludes.indexOf;
	var arrayMethodIsStrict$1 = arrayMethodIsStrict$4;

	var nativeIndexOf = [].indexOf;

	var NEGATIVE_ZERO = !!nativeIndexOf && 1 / [1].indexOf(1, -0) < 0;
	var STRICT_METHOD$1 = arrayMethodIsStrict$1('indexOf');

	// `Array.prototype.indexOf` method
	// https://tc39.es/ecma262/#sec-array.prototype.indexof
	$$2({ target: 'Array', proto: true, forced: NEGATIVE_ZERO || !STRICT_METHOD$1 }, {
	  indexOf: function indexOf(searchElement /* , fromIndex = 0 */) {
	    return NEGATIVE_ZERO
	      // convert -0 to +0
	      ? nativeIndexOf.apply(this, arguments) || 0
	      : $indexOf(this, searchElement, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	var entryVirtual$2 = entryVirtual$5;

	var indexOf$2 = entryVirtual$2('Array').indexOf;

	var indexOf$1 = indexOf$2;

	var ArrayPrototype$2 = Array.prototype;

	var indexOf_1 = function (it) {
	  var own = it.indexOf;
	  return it === ArrayPrototype$2 || (it instanceof Array && own === ArrayPrototype$2.indexOf) ? indexOf$1 : own;
	};

	var parent$2 = indexOf_1;

	var indexOf = parent$2;

	(function (module) {
		module.exports = indexOf;
	} (indexOf$3));

	var _indexOfInstanceProperty = /*@__PURE__*/getDefaultExportFromCjs(indexOf$3.exports);

	// var stringifyTypes = ['post', 'put', 'patch', 'delete']

	var request$1 = function request(instance, baseConfig) {
	  // request 拦截器
	  instance.interceptors.request.use(function (config) {
	    // Tip: 1
	    // 请求开始的时候可以结合 vuex 开启全屏的 loading 动画
	    if (baseConfig.handlers && baseConfig.handlers.loading && baseConfig.handlers.loading.open) {
	      baseConfig.handlers && baseConfig.handlers.loading && baseConfig.handlers.loading.start && baseConfig.handlers.loading.start();
	    } // Tip: 2
	    // 带上 token , 可以结合 vuex 或者重 localStorage


	    baseConfig.handlers && baseConfig.handlers.config && baseConfig.handlers.config(config);
	    return config;
	  }, function (error) {
	    var _context;

	    // 请求错误时做些事(接口错误、超时等)
	    // Tip: 4
	    // 关闭loadding
	    // console.log('request:', error)
	    //  1.判断请求超时
	    if (error.code === 'ECONNABORTED' && _indexOfInstanceProperty(_context = error.message).call(_context, 'timeout') !== -1) {
	      // TODO: 超时处理
	      console.log('根据你设置的timeout/真的请求超时 判断请求现在超时了，你可以在这里加入超时的处理方案');
	      var hasOwnHandleTimeout = baseConfig.handlers && baseConfig.handlers.timeout;
	      hasOwnHandleTimeout && baseConfig.handlers.timeout(error.message); // return service.request(originalRequest);//例如再重复请求一次

	      return hasOwnHandleTimeout ? _Promise.resolve(error) : _Promise.reject(error);
	    } //  2.需要重定向到错误页面
	    // const errorInfo = error.response || {}
	    // const errorStatus = errorInfo.status


	    return _Promise.reject(error); // 在调用的那边可以拿到(catch)你想返回的错误信息
	  });
	  return instance;
	};

	var en$1 = {
	  msg: {
	    400: 'request error',
	    401: 'no authentication，please login',
	    403: 'refuse connect',
	    404: 'request address exits error',
	    408: 'request timeout',
	    500: 'server inner error',
	    501: 'server not impl',
	    502: 'network error',
	    503: 'invalid service',
	    504: 'network timeout',
	    505: 'HTTP version not supported'
	  }
	};

	var cn$1 = {
	  msg: {
	    400: '请求错误',
	    401: '未授权，请登录',
	    403: '拒绝访问',
	    404: '请求地址出错',
	    408: '请求超时',
	    500: '服务器内部错误',
	    501: '服务未实现',
	    502: '网关错误',
	    503: '服务不可用',
	    504: '网关超时',
	    505: 'HTTP版本不受支持'
	  }
	};

	var EN_TYPE = require$$0.EN_TYPE,
	    CN_TYPE = require$$0.CN_TYPE;
	var en = en$1;
	var cn = cn$1;
	/**
	 * @name getLanguage
	 * @description 获取语言版本
	 * @created 2019年10月25日10:38:47
	 */

	var language = function getLanguage(type, languageOption) {
	  switch (type) {
	    case EN_TYPE:
	      return en;

	    case CN_TYPE:
	      return cn;

	    default:
	      return languageOption || {};
	  }
	};

	var getLanguage = language;

	var response$1 = function response(instance, config) {
	  var objType = function objType(obj) {
	    return Object.prototype.toString.call(obj).replace('[object ', '').replace(']', '').toLowerCase();
	  }; // response 拦截器


	  instance.interceptors.response.use(function (response) {
	    // IE9时response.data是undefined，因此需要使用response.request.responseText(Stringify后的字符串)
	    var data;

	    if (!response.data) {
	      data = response.request.responseText;
	    } else {
	      data = response.data;
	    }

	    var oldDataType = objType(data);
	    var oldData = data;

	    try {
	      // ie下返回data为[object String]类型
	      data = data && oldDataType === 'string' ? JSON.parse(data) : data;
	    } catch (e) {
	      data = oldData;
	      console.error('interceptors response parse data exits error');
	      console.error(e);
	    } // 文件流


	    var fileTypes = ['string', 'blob'];
	    var dataType = objType(data);

	    if (~_indexOfInstanceProperty(fileTypes).call(fileTypes, dataType)) {
	      return {
	        data: data,
	        // 如果后台把文件名放到headers中的filename属性上
	        fileName: response.headers.filename
	      };
	    }

	    config.handlers && config.handlers.data && config.handlers.data(data);
	    return data;
	  }, function (err) {
	    if (err) {
	      console.error(err.message);
	    }

	    if (err && err.response) {
	      var language = getLanguage(config.handlers && config.handlers.language);
	      var errMessage = language.msg[err.response.status] || 'unknow error';
	      err.message = errMessage;
	    }

	    if (config.handlers && config.handlers.error) {
	      config.handlers.error(err);
	      return _Promise.resolve(err);
	    }

	    return _Promise.reject(err); // 返回接口返回的错误信息
	  });
	  return instance;
	};

	var axios = axios$3.exports;
	var config = config$1; // 倒入默认配置

	var request = request$1;
	var response = response$1; // 返回数据解析

	var parseData = function parseData(res) {
	  try {
	    var data = Object.prototype.toString.call(res.data) === '[object String]' ? JSON.parse(res.data) : res;
	    return data;
	  } catch (e) {
	    return res;
	  }
	}; // (type, url, param, opts)


	var ajax$1 = function ajax(options) {
	  return new _Promise(function (resolve, reject) {
	    // support override baseURL for global baseURL
	    var baseURL = options.baseURL || config.baseURL; // support override headers for global headers

	    var headers = options.headers || config.headers; // support override handlers from methods

	    var baseHandlers = _Object$assign({}, config.handlers || {}, options.handlers || {});

	    options = _Object$assign({}, config || {}, options || {});
	    options.handlers = baseHandlers; // console.info('baseHandlers: ' + JSON.stringify(baseHandlers))

	    var instance = axios.create({
	      baseURL: baseURL,
	      headers: headers,
	      transformResponse: [function (data) {
	        return data;
	      }]
	    }); // request interceptor

	    instance = request(instance, options); // response interceptor

	    instance = response(instance, options); // 请求处理

	    return instance(options).then(function (res) {
	      var data = parseData(res);
	      resolve(data);
	      return res;
	    })["catch"](function (error) {
	      reject(error);
	    })["finally"](function () {
	      if (options.handlers && options.handlers.loading && options.handlers.loading.open) {
	        options.handlers && options.handlers.loading && options.handlers.loading.end && options.handlers.loading.end();
	      }
	    });
	  });
	};

	var ajax = ajax$1;
	var api$1 = {};
	/**
	 * @name get
	 * @param url string 请求url
	 * @param params object 请求参数
	 * @createTime 2018年11月04日00:15:02
	 */

	api$1.get = function (url, params, options) {
	  options = options || {
	    headers: {
	      'Content-Type': 'application/x-www-form-urlencoded'
	    }
	  };
	  params = params || {};
	  options = _Object$assign({}, {
	    url: url,
	    params: params,
	    method: 'get'
	  }, options);
	  return ajax(options);
	};
	/**
	 * @name post
	 * @param url string 请求url
	 * @param params object 请求参数
	 * @createTime 2018年11月04日00:15:02
	 */


	api$1.post = function (url, params, options) {
	  options = options || {};
	  var data = params || {};
	  options = _Object$assign({}, {
	    url: url,
	    data: data,
	    method: 'post'
	  }, options);
	  return ajax(options);
	};
	/**
	 * @name put
	 * @param url string 请求url
	 * @param params object 请求参数
	 * @createTime 2018年11月04日00:15:02
	 */


	api$1.put = function (url, params, options) {
	  options = options || {};
	  var data = params || {};
	  options = _Object$assign({}, {
	    url: url,
	    data: data,
	    method: 'put'
	  }, options);
	  return ajax(options);
	};
	/**
	 * @name delete
	 * @param url string 请求url
	 * @param params object 请求参数
	 * @createTime 2018年11月04日00:15:02
	 */


	api$1.del = function (url, params, options) {
	  options = options || {};
	  params = params || {};
	  options = _Object$assign({}, {
	    url: url,
	    params: params,
	    method: 'delete'
	  }, options);
	  return ajax(options);
	};
	/**
	 * @name patch
	 * @param url string 请求url
	 * @param params object 请求参数
	 * @createTime 2018年11月04日00:15:02
	 */


	api$1.patch = function (url, params, options) {
	  options = options || {};
	  var data = params || {};
	  options = _Object$assign({}, {
	    url: url,
	    data: data,
	    method: 'patch'
	  }, options);
	  return ajax(options);
	};
	/**
	 * @name head
	 * @param url string 请求url
	 * @param params object 请求参数
	 * @createTime 2019年10月24日21:03:12
	 */


	api$1.head = function (url, params, options) {
	  options = options || {};
	  var data = params || {};
	  options = _Object$assign({}, {
	    url: url,
	    data: data,
	    method: 'head'
	  }, options);
	  return ajax(options);
	};

	var api_1 = api$1;

	var sort$3 = {exports: {}};

	var $$1 = _export;
	var aFunction = aFunction$9;
	var toObject = toObject$7;
	var fails$1 = fails$e;
	var arrayMethodIsStrict = arrayMethodIsStrict$4;

	var test = [];
	var nativeSort = test.sort;

	// IE8-
	var FAILS_ON_UNDEFINED = fails$1(function () {
	  test.sort(undefined);
	});
	// V8 bug
	var FAILS_ON_NULL = fails$1(function () {
	  test.sort(null);
	});
	// Old WebKit
	var STRICT_METHOD = arrayMethodIsStrict('sort');

	var FORCED = FAILS_ON_UNDEFINED || !FAILS_ON_NULL || !STRICT_METHOD;

	// `Array.prototype.sort` method
	// https://tc39.es/ecma262/#sec-array.prototype.sort
	$$1({ target: 'Array', proto: true, forced: FORCED }, {
	  sort: function sort(comparefn) {
	    return comparefn === undefined
	      ? nativeSort.call(toObject(this))
	      : nativeSort.call(toObject(this), aFunction(comparefn));
	  }
	});

	var entryVirtual$1 = entryVirtual$5;

	var sort$2 = entryVirtual$1('Array').sort;

	var sort$1 = sort$2;

	var ArrayPrototype$1 = Array.prototype;

	var sort_1 = function (it) {
	  var own = it.sort;
	  return it === ArrayPrototype$1 || (it instanceof Array && own === ArrayPrototype$1.sort) ? sort$1 : own;
	};

	var parent$1 = sort_1;

	var sort = parent$1;

	(function (module) {
		module.exports = sort;
	} (sort$3));

	var _sortInstanceProperty = /*@__PURE__*/getDefaultExportFromCjs(sort$3.exports);

	var slice$3 = {exports: {}};

	var toPrimitive = toPrimitive$3;
	var definePropertyModule = objectDefineProperty;
	var createPropertyDescriptor = createPropertyDescriptor$5;

	var createProperty$1 = function (object, key, value) {
	  var propertyKey = toPrimitive(key);
	  if (propertyKey in object) definePropertyModule.f(object, propertyKey, createPropertyDescriptor(0, value));
	  else object[propertyKey] = value;
	};

	var fails = fails$e;
	var wellKnownSymbol$1 = wellKnownSymbol$f;
	var V8_VERSION = engineV8Version;

	var SPECIES$1 = wellKnownSymbol$1('species');

	var arrayMethodHasSpeciesSupport$1 = function (METHOD_NAME) {
	  // We can't use this feature detection in V8 since it causes
	  // deoptimization and serious performance degradation
	  // https://github.com/zloirock/core-js/issues/677
	  return V8_VERSION >= 51 || !fails(function () {
	    var array = [];
	    var constructor = array.constructor = {};
	    constructor[SPECIES$1] = function () {
	      return { foo: 1 };
	    };
	    return array[METHOD_NAME](Boolean).foo !== 1;
	  });
	};

	var $ = _export;
	var isObject = isObject$a;
	var isArray = isArray$3;
	var toAbsoluteIndex = toAbsoluteIndex$2;
	var toLength = toLength$5;
	var toIndexedObject = toIndexedObject$5;
	var createProperty = createProperty$1;
	var wellKnownSymbol = wellKnownSymbol$f;
	var arrayMethodHasSpeciesSupport = arrayMethodHasSpeciesSupport$1;

	var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('slice');

	var SPECIES = wellKnownSymbol('species');
	var nativeSlice = [].slice;
	var max = Math.max;

	// `Array.prototype.slice` method
	// https://tc39.es/ecma262/#sec-array.prototype.slice
	// fallback for not array-like ES3 strings and DOM objects
	$({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT }, {
	  slice: function slice(start, end) {
	    var O = toIndexedObject(this);
	    var length = toLength(O.length);
	    var k = toAbsoluteIndex(start, length);
	    var fin = toAbsoluteIndex(end === undefined ? length : end, length);
	    // inline `ArraySpeciesCreate` for usage native `Array#slice` where it's possible
	    var Constructor, result, n;
	    if (isArray(O)) {
	      Constructor = O.constructor;
	      // cross-realm fallback
	      if (typeof Constructor == 'function' && (Constructor === Array || isArray(Constructor.prototype))) {
	        Constructor = undefined;
	      } else if (isObject(Constructor)) {
	        Constructor = Constructor[SPECIES];
	        if (Constructor === null) Constructor = undefined;
	      }
	      if (Constructor === Array || Constructor === undefined) {
	        return nativeSlice.call(O, k, fin);
	      }
	    }
	    result = new (Constructor === undefined ? Array : Constructor)(max(fin - k, 0));
	    for (n = 0; k < fin; k++, n++) if (k in O) createProperty(result, n, O[k]);
	    result.length = n;
	    return result;
	  }
	});

	var entryVirtual = entryVirtual$5;

	var slice$2 = entryVirtual('Array').slice;

	var slice$1 = slice$2;

	var ArrayPrototype = Array.prototype;

	var slice_1 = function (it) {
	  var own = it.slice;
	  return it === ArrayPrototype || (it instanceof Array && own === ArrayPrototype.slice) ? slice$1 : own;
	};

	var parent = slice_1;

	var slice = parent;

	(function (module) {
		module.exports = slice;
	} (slice$3));

	var _sliceInstanceProperty = /*@__PURE__*/getDefaultExportFromCjs(slice$3.exports);

	var combine = function combine() {
	  var args = _sliceInstanceProperty(Array.prototype).call(arguments);

	  if (!args) {
	    return console.warn('combine() require at least one params');
	  } // only one parameter


	  if (args.length === 1) {
	    return args[0];
	  } // has two or args than two parameters


	  var objs = args;
	  objs = _sortInstanceProperty(objs).call(objs, function (prev, next) {
	    return _Object$keys(next).length - _Object$keys(prev).length;
	  });
	  var baseObj = objs[0];

	  var baseKeys = _Object$keys(baseObj);

	  var result = {};

	  _forEachInstanceProperty(baseKeys).call(baseKeys, function (baseKey) {
	    result[baseKey] = _reduceInstanceProperty(objs).call(objs, function (cur, now) {
	      return _Object$assign(cur, now[baseKey]);
	    }, {});
	  });

	  return result;
	};
	/**
	 * @name objType
	 * @desc {{description}}{{获取数据的obj类型}}
	 * @param {Object} obj 要获取类型的obj值
	 * @createTime 2019年02月26日10:04:52
	 */


	var objType = function objType(obj) {
	  return Object.prototype.toString.call(obj).replace('[object ', '').replace(']', '').toLowerCase();
	};

	var utils$2 = {
	  combine: combine,
	  objType: objType
	};

	var api = api_1;
	var utils$1 = utils$2;
	var get = api.get;
	var post = api.post;
	var put = api.put;
	var del = api.del;
	var patch = api.patch;
	var head = api.head;
	var requestTypes = {
	  gets: get,
	  posts: post,
	  puts: put,
	  dels: del,
	  patches: patch,
	  heades: head
	};

	var transURL = function transURL(url, urlParams) {
	  var urlType = utils$1.objType(url);
	  return urlType === 'function' ? url(urlParams) : url;
	};

	var initHttpPromise = function initHttpPromise(mappers, config) {
	  var _context;

	  if (utils$1.objType(mappers) !== 'object') {
	    throw new Error('mappers was not a object params');
	  }

	  if (utils$1.objType(config) !== 'object') {
	    throw new Error('config was not a object params');
	  }

	  return _reduceInstanceProperty(_context = _Object$keys(mappers)).call(_context, function (current, now) {
	    var _context2;

	    var requests = mappers[now];
	    var httpPromise = current;
	    var request = requestTypes[now];

	    _forEachInstanceProperty(_context2 = _Object$keys(requests)).call(_context2, function (reqKey) {
	      var url = requests[reqKey];

	      httpPromise[reqKey] = function (params, options, urlParams) {
	        options = options || {};

	        var baseHandlers = _Object$assign({}, config.handlers || {}, options.handlers || {});

	        options = _Object$assign({}, config, options);
	        options.handlers = baseHandlers;
	        var requestURL = transURL(url, urlParams);
	        return request(requestURL, params, options);
	      };
	    });

	    return current;
	  }, {});
	};

	var promise = function promise(options) {
	  options = options || {};
	  var mappers = options.mappers;
	  var config = options.config;
	  return initHttpPromise(mappers, config);
	};

	/**
	 * @file index.js
	 * @desc {{description}}{{http暴露接口}}
	 * @createTime 2018年11月03日18:09:33
	 * @doc
	 *  npm run build && git add -A dist
	 *  npm version patch
	 * @doc
	 *  https://juejin.im/post/5b19d65a51882513756f102b
	 */
	es6Promise.exports.polyfill();
	var promiseFinally = promise_prototype_finally;
	var httpPromise = promise;
	var utils = utils$2;
	promiseFinally.shim();

	var getAxiosPro = function getAxiosPro() {
	  var axiosPro = {
	    api: {}
	  };

	  var install = function install(Vue, options) {
	    if (install.installed) {
	      return;
	    }

	    install.installed = true; // TODO: 1.区分不同模块
	    // 注意哦，此处挂载在 Vue 原型的 $api 对象上

	    var api = httpPromise(options);
	    axiosPro.api = api;
	    Vue.prototype.$api = api;
	  }; // node environments
	  // 支持服务端使用


	  axiosPro.inject = function (options) {
	    axiosPro.api = httpPromise(options);
	  };

	  axiosPro.install = install;
	  axiosPro.combine = utils.combine;
	  return axiosPro;
	};

	var src = getAxiosPro();

	return src;

}));
//# sourceMappingURL=axios.pro.js.map
