!(function (modules) {
  var installedModules = {};
  function __webpack_require__(moduleId) {
    if (installedModules[moduleId]) return installedModules[moduleId].exports;
    var module = (installedModules[moduleId] = {
      i: moduleId,
      l: !1,
      exports: {},
    });
    return (
      modules[moduleId].call(
        module.exports,
        module,
        module.exports,
        __webpack_require__,
      ),
      (module.l = !0),
      module.exports
    );
  }
  (__webpack_require__.m = modules),
    (__webpack_require__.c = installedModules),
    (__webpack_require__.d = function (exports, name, getter) {
      __webpack_require__.o(exports, name) ||
        Object.defineProperty(exports, name, { enumerable: !0, get: getter });
    }),
    (__webpack_require__.r = function (exports) {
      'undefined' != typeof Symbol &&
        Symbol.toStringTag &&
        Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' }),
        Object.defineProperty(exports, '__esModule', { value: !0 });
    }),
    (__webpack_require__.t = function (value, mode) {
      if ((1 & mode && (value = __webpack_require__(value)), 8 & mode))
        return value;
      if (4 & mode && 'object' == typeof value && value && value.__esModule)
        return value;
      var ns = Object.create(null);
      if (
        (__webpack_require__.r(ns),
        Object.defineProperty(ns, 'default', { enumerable: !0, value: value }),
        2 & mode && 'string' != typeof value)
      )
        for (var key in value)
          __webpack_require__.d(
            ns,
            key,
            function (key) {
              return value[key];
            }.bind(null, key),
          );
      return ns;
    }),
    (__webpack_require__.n = function (module) {
      var getter =
        module && module.__esModule
          ? function () {
              return module.default;
            }
          : function () {
              return module;
            };
      return __webpack_require__.d(getter, 'a', getter), getter;
    }),
    (__webpack_require__.o = function (object, property) {
      return Object.prototype.hasOwnProperty.call(object, property);
    }),
    (__webpack_require__.p = ''),
    __webpack_require__((__webpack_require__.s = 3));
})([
  function (module, exports, __webpack_require__) {
    (function (global) {
      function now() {
        return root.Date.now();
      }
      var NAN = NaN,
        symbolTag = '[object Symbol]',
        reTrim = /^\s+|\s+$/g,
        reIsBadHex = /^[-+]0x[0-9a-f]+$/i,
        reIsBinary = /^0b[01]+$/i,
        reIsOctal = /^0o[0-7]+$/i,
        freeParseInt = parseInt,
        freeGlobal =
          'object' == typeof global &&
          global &&
          global.Object === Object &&
          global,
        freeSelf =
          'object' == typeof self && self && self.Object === Object && self,
        root = freeGlobal || freeSelf || Function('return this')(),
        objectToString = Object.prototype.toString,
        nativeMax = Math.max,
        nativeMin = Math.min;
      function isObject(value) {
        var type = typeof value;
        return value && ('object' == type || 'function' == type);
      }
      function toNumber(value) {
        if ('number' == typeof value) return value;
        if (
          (function (value) {
            return (
              'symbol' == typeof value ||
              ((function (value) {
                return !!value && 'object' == typeof value;
              })(value) &&
                objectToString.call(value) == symbolTag)
            );
          })(value)
        )
          return NAN;
        var other;
        if (
          (isObject(value) &&
            (value = isObject(
              (other =
                'function' == typeof value.valueOf ? value.valueOf() : value),
            )
              ? other + ''
              : other),
          'string' != typeof value)
        )
          return 0 === value ? value : +value;
        value = value.replace(reTrim, '');
        var isBinary = reIsBinary.test(value);
        return isBinary || reIsOctal.test(value)
          ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
          : reIsBadHex.test(value)
          ? NAN
          : +value;
      }
      module.exports = function (func, wait, options) {
        var lastArgs,
          lastThis,
          maxWait,
          result,
          timerId,
          lastCallTime,
          lastInvokeTime = 0,
          leading = !1,
          maxing = !1,
          trailing = !0;
        if ('function' != typeof func)
          throw new TypeError('Expected a function');
        function invokeFunc(time) {
          var args = lastArgs,
            thisArg = lastThis;
          return (
            (lastArgs = lastThis = void 0),
            (lastInvokeTime = time),
            (result = func.apply(thisArg, args))
          );
        }
        function shouldInvoke(time) {
          var timeSinceLastCall = time - lastCallTime;
          return (
            void 0 === lastCallTime ||
            wait <= timeSinceLastCall ||
            timeSinceLastCall < 0 ||
            (maxing && maxWait <= time - lastInvokeTime)
          );
        }
        function timerExpired() {
          var time = now();
          if (shouldInvoke(time)) return trailingEdge(time);
          timerId = setTimeout(
            timerExpired,
            (function (time) {
              var result = wait - (time - lastCallTime);
              return maxing
                ? nativeMin(result, maxWait - (time - lastInvokeTime))
                : result;
            })(time),
          );
        }
        function trailingEdge(time) {
          return (
            (timerId = void 0),
            trailing && lastArgs
              ? invokeFunc(time)
              : ((lastArgs = lastThis = void 0), result)
          );
        }
        function debounced() {
          var time = now(),
            isInvoking = shouldInvoke(time);
          if (
            ((lastArgs = arguments),
            (lastThis = this),
            (lastCallTime = time),
            isInvoking)
          ) {
            if (void 0 === timerId)
              return (function (time) {
                return (
                  (lastInvokeTime = time),
                  (timerId = setTimeout(timerExpired, wait)),
                  leading ? invokeFunc(time) : result
                );
              })(lastCallTime);
            if (maxing)
              return (
                (timerId = setTimeout(timerExpired, wait)),
                invokeFunc(lastCallTime)
              );
          }
          return (
            void 0 === timerId && (timerId = setTimeout(timerExpired, wait)),
            result
          );
        }
        return (
          (wait = toNumber(wait) || 0),
          isObject(options) &&
            ((leading = !!options.leading),
            (maxing = 'maxWait' in options),
            (maxWait = maxing
              ? nativeMax(toNumber(options.maxWait) || 0, wait)
              : maxWait),
            (trailing = 'trailing' in options ? !!options.trailing : trailing)),
          (debounced.cancel = function () {
            void 0 !== timerId && clearTimeout(timerId),
              (lastArgs = lastCallTime = lastThis = timerId = void (lastInvokeTime = 0));
          }),
          (debounced.flush = function () {
            return void 0 === timerId ? result : trailingEdge(now());
          }),
          debounced
        );
      };
    }.call(this, __webpack_require__(1)));
  },
  function (module, exports) {
    var g = (function () {
      return this;
    })();
    try {
      g = g || new Function('return this')();
    } catch (e) {
      'object' == typeof window && (g = window);
    }
    module.exports = g;
  },
  function (module, exports, __webpack_require__) {},
  function (module, __webpack_exports__, __webpack_require__) {
    'use strict';
    function _typeof(obj) {
      return (_typeof =
        'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
          ? function (obj) {
              return typeof obj;
            }
          : function (obj) {
              return obj &&
                'function' == typeof Symbol &&
                obj.constructor === Symbol &&
                obj !== Symbol.prototype
                ? 'symbol'
                : typeof obj;
            })(obj);
    }
    __webpack_require__.r(__webpack_exports__);
    var defaults = {
        tabGroup: 'skltbs-tab-group',
        tabItem: 'skltbs-tab-item',
        tab: 'skltbs-tab',
        panelGroup: 'skltbs-panel-group',
        panel: 'skltbs-panel',
        panelHeading: 'skltbs-panel-heading',
        init: 'skltbs-init',
        tabsMode: 'skltbs-mode-tabs',
        accordionMode: 'skltbs-mode-accordion',
        active: 'skltbs-active',
        disabled: 'skltbs-disabled',
        enter: 'skltbs-enter',
        enterActive: 'skltbs-enter-active',
        enterDone: 'skltbs-enter-done',
        leave: 'skltbs-leave',
        leaveActive: 'skltbs-leave-active',
        leaveDone: 'skltbs-leave-done',
      },
      classNames_classNames = $.extend({}, defaults);
    function getPrefixedClassNames(userPrefix) {
      return Object.keys(defaults).reduce(function (
        prefixed,
        key,
        index,
        array,
      ) {
        return (
          (prefixed[key] = defaults[key].replace('skltbs', userPrefix)),
          prefixed
        );
      },
      {});
    }
    function options_typeof(obj) {
      return (options_typeof =
        'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
          ? function (obj) {
              return typeof obj;
            }
          : function (obj) {
              return obj &&
                'function' == typeof Symbol &&
                obj.constructor === Symbol &&
                obj !== Symbol.prototype
                ? 'symbol'
                : typeof obj;
            })(obj);
    }
    var options_defaults = {
        autoplay: !1,
        autoplayInterval: 3e3,
        breakpoint: 640,
        breakpointLayout: 'accordion',
        disabledIndex: null,
        history: 'replace',
        keyboard: 'select',
        keyboardAccordion: 'vertical',
        keyboardTabs: 'horizontal',
        panelHeight: 'auto',
        pauseOnFocus: !0,
        pauseOnHover: !1,
        resizeTimeout: 100,
        selectEvent: 'click',
        slidingAccordion: !1,
        startIndex: 0,
        transitionDuration: 500,
      },
      options_options = options_defaults;
    function mergeOptions(targetObject, sourceObject) {
      if (!sourceObject) return targetObject;
      if ('object' !== options_typeof(sourceObject))
        throw new Error('Options should be an object type.');
      var target, source;
      return Object.keys(targetObject).reduce(function (merged, key) {
        return (
          (target = targetObject[key]),
          (source = sourceObject[key]),
          (merged[key] =
            null != source && (!0 !== source || 'boolean' == typeof target)
              ? source
              : target),
          merged
        );
      }, {});
    }
    var globalMethods = {
        setClassNames: function (arg) {
          throw (
            ('object' === _typeof(arg) && $.extend(classNames_classNames, arg),
            'string' == typeof arg &&
              (classNames_classNames = getPrefixedClassNames(arg)),
            new Error(
              'setClassNames requires an object or a string as argument.',
            ))
          );
        },
        setDefaults: function (userOptions) {
          options_options = mergeOptions(options_defaults, userOptions);
        },
      },
      lodash_debounce = __webpack_require__(0),
      lodash_debounce_default = __webpack_require__.n(lodash_debounce);
    function includes(array, item) {
      return -1 !== array.indexOf(item);
    }
    function findHiddenInTree(element) {
      return (function (element) {
        var _element$style = element.style,
          display = _element$style.display,
          width = _element$style.width,
          height = _element$style.height;
        return 'none' === display || ('0' === width && '0' === height);
      })(element)
        ? element
        : (function (element) {
            return (
              element.offsetWidth ||
              element.offsetHeight ||
              element.getClientRects().length
            );
          })(element) || element.parentElement === document.documentElement
        ? null
        : findHiddenInTree(element.parentElement);
    }
    function showInstantly(element) {
      (element.initialDisplay = element.style.display),
        (element.initialWidth = element.style.width),
        (element.initialHeight = element.style.height),
        (element.initialVisibility = element.style.visibility),
        (element.style.display = 'block'),
        (element.style.width = 'auto'),
        (element.style.height = 'auto'),
        (element.style.visibility = 'hidden');
    }
    function hideBack(element) {
      (element.style.display = element.initialDisplay),
        (element.style.width = element.initialWidth),
        (element.style.height = element.initialHeight),
        (element.style.visibility = element.initialVisibility);
    }
    function modulo(x, max) {
      return ((x % max) + max) % max;
    }
    function supportsHistory() {
      return window.history && window.history.pushState;
    }
    var ids = {};
    function nextId(_ref) {
      var type = _ref.type,
        _ref$prefix = _ref.prefix,
        prefix = void 0 === _ref$prefix ? '' : _ref$prefix;
      return (ids[type] = (ids[type] || 0) + 1), prefix + ids[type];
    }
    function setIds($elements, options) {
      return $elements
        .map(function (_, element) {
          return (
            element.id ||
              ((element.id = nextId(options)), (element.dynamicId = !0)),
            element.id
          );
        })
        .get();
    }
    function unsetIds($elements) {
      $elements.each(function (_, element) {
        element.dynamicId &&
          (element.removeAttribute('id'), delete element.dynamicId);
      });
    }
    var viewportWidth,
      expectedKeys = {
        38: 'up',
        40: 'down',
        37: 'left',
        39: 'right',
        36: 'home',
        35: 'end',
        87: 'up',
        83: 'down',
        65: 'left',
        68: 'right',
        104: 'up',
        98: 'down',
        100: 'left',
        102: 'right',
      },
      actions = {
        horizontal: { left: 'prev', right: 'next' },
        vertical: { up: 'prev', down: 'next' },
        common: { home: 'first', end: 'last' },
      };
    function updateViewportWidth() {
      viewportWidth = $(window).width();
    }
    function getViewportWidth() {
      return (
        void 0 === viewportWidth &&
          (updateViewportWidth(),
          $(window).on('resize orientationchange', updateViewportWidth)),
        viewportWidth
      );
    }
    function _defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        (descriptor.enumerable = descriptor.enumerable || !1),
          (descriptor.configurable = !0),
          'value' in descriptor && (descriptor.writable = !0),
          Object.defineProperty(target, descriptor.key, descriptor);
      }
    }
    var core_Skeletabs = (function () {
        function Skeletabs(container, userOptions, userClassNames) {
          !(function (instance, Constructor) {
            if (!(instance instanceof Constructor))
              throw new TypeError('Cannot call a class as a function');
          })(this, Skeletabs),
            (this.id = Date.now()),
            (this.container = container),
            (this.options = (function (userOptions) {
              return mergeOptions(options_options, userOptions);
            })(userOptions)),
            (this.classNames = (function (arg) {
              switch (_typeof(arg)) {
                case 'object':
                  return $.extend({}, classNames_classNames, arg);
                case 'string':
                  return getPrefixedClassNames(arg);
                default:
                  return classNames_classNames;
              }
            })(userClassNames)),
            (this.disabledList = []),
            (this.events = []),
            (this.isInit = !1),
            (this.isActive = !1),
            (this.rotationId = void 0);
        }
        var Constructor, protoProps, staticProps;
        return (
          (Constructor = Skeletabs),
          (protoProps = [
            {
              key: 'init',
              value: function () {
                var _this = this,
                  classNames = this.classNames,
                  _this$options = this.options,
                  breakpointLayout = _this$options.breakpointLayout,
                  resizeTimeout = _this$options.resizeTimeout;
                this.isInit ||
                  ((this.isInit = !0),
                  this.prepareElements(),
                  ('destroy' === breakpointLayout &&
                    this.isBelowBreakpoint()) ||
                    (this.activate(),
                    this.emit('skeletabs:init'),
                    this.$container.addClass(classNames.init)),
                  (this.unwatchResize = this.addEvent({
                    target: window,
                    type: 'resize orientationchange',
                    listener: lodash_debounce_default()(function () {
                      _this.setLayout(), _this.reload();
                    }, resizeTimeout),
                  })));
              },
            },
            {
              key: 'destroy',
              value: function () {
                this.isInit &&
                  ((this.isInit = !1),
                  this.deactivate(),
                  this.unwatchResize(),
                  this.resetData());
              },
            },
            {
              key: 'activate',
              value: function () {
                this.isActive ||
                  ((this.isActive = !0),
                  this.setupAccessibility(),
                  this.disableByOptions(),
                  this.defineStartIndex(),
                  this.setLayout(),
                  this.reload(),
                  this.addEvents(),
                  this.$panels.css('display', 'none'),
                  this.show(this.currentIndex, { passive: !0 }),
                  this.options.autoplay && this.play());
              },
            },
            {
              key: 'deactivate',
              value: function () {
                this.isActive &&
                  ((this.isActive = !1),
                  this.pause(),
                  this.removeEvents(),
                  this.resetLayout(),
                  this.resetPanelHeight(),
                  this.resetElementAttributes());
              },
            },
            {
              key: 'resetData',
              value: function () {
                (this.disabledList = []),
                  (this.events = []),
                  (this.rotationId = void 0),
                  delete this.$container,
                  delete this.$tabGroup,
                  delete this.$tabItems,
                  delete this.$tabs,
                  delete this.$panelGroup,
                  delete this.$panels,
                  delete this.$panelHeadings,
                  delete this.size,
                  delete this.tabIds,
                  delete this.panelIds,
                  delete this.startIndex,
                  delete this.currentIndex,
                  delete this.focusedIndex,
                  delete this.currentLayout;
              },
            },
            {
              key: 'prepareElements',
              value: function () {
                var container = this.container,
                  classNames = this.classNames,
                  $container = $(container),
                  $tabGroup = $container.find(
                    '.'.concat(classNames.tabGroup, ':first'),
                  ),
                  $tabItems = $tabGroup.find('> .'.concat(classNames.tabItem)),
                  $tabs = $tabItems.find('> .'.concat(classNames.tab)),
                  $panelGroup = $container.find(
                    '.'.concat(classNames.panelGroup, ':first'),
                  ),
                  $panels = ($panels = $panelGroup.find(
                    '.'.concat(classNames.panel, ':first'),
                  )).add($panels.siblings('.'.concat(classNames.panel)));
                if (
                  ((this.$container = $container),
                  (this.$tabGroup = $tabGroup),
                  (this.$tabItems = $tabItems),
                  (this.$tabs = $tabs),
                  (this.$panelGroup = $panelGroup),
                  (this.$panels = $panels),
                  $tabs.length !== $panels.length)
                )
                  throw new Error(
                    "Number of tabs and panels don't match: ".concat(
                      $container.selector,
                    ),
                  );
                (this.size = $panels.length),
                  'accordion' === this.options.breakpointLayout &&
                    (this.$panelHeadings = $tabs.map(function () {
                      var div = document.createElement('div');
                      return (div.className = classNames.panelHeading), div;
                    }));
              },
            },
            {
              key: 'add',
              value: function (_ref) {
                var _this2 = this,
                  tab = _ref.tab,
                  panel = _ref.panel,
                  $tabGroup = this.$tabGroup,
                  $panelGroup = this.$panelGroup,
                  classNames = this.classNames,
                  size = this.size;
                this.pause();
                var tabId = nextId({ type: 'tab', prefix: 'skeletabsTab' }),
                  panelId = nextId({ type: 'panel', prefix: 'skeletabsPanel' }),
                  $tabItem = $('<li />', {
                    class: classNames.tabItem,
                    role: 'presentation',
                  }),
                  $tab = $('<button />', {
                    class: classNames.tab,
                    id: tabId,
                    'aria-controls': panelId,
                    'aria-selected': !1,
                    role: 'tab',
                    tabindex: -1,
                  })
                    .html(tab)
                    .data('skeletabsIndex', size),
                  $panel = $('<div />', {
                    class: classNames.panel,
                    id: panelId,
                    'aria-labelledby': tabId,
                    role: 'tabpanel',
                    tabindex: 0,
                  })
                    .html(panel)
                    .css('display', 'none'),
                  $panelHeading = $('<div />', {
                    class: classNames.panelHeading,
                  });
                $tabItem.append($tab),
                  $tabGroup.append($tabItem),
                  $panelGroup.append($panel),
                  (this.$tabItems = this.$tabItems.add($tabItem)),
                  (this.$tabs = this.$tabs.add($tab)),
                  (this.$panels = this.$panels.add($panel)),
                  (this.$panelHeadings = this.$panelHeadings.add(
                    $panelHeading,
                  )),
                  this.tabIds.push(tabId),
                  this.panelIds.push(panelId),
                  (this.size += 1),
                  this.disabledList.forEach(function (disabledIndex) {
                    return _this2.undisable(disabledIndex, {});
                  }),
                  this.disableByOptions(),
                  0 === size && this.show(0),
                  'auto' !== this.options.panelHeight && this.reload(),
                  this.resume();
              },
            },
            {
              key: 'remove',
              value: function (index) {
                var targetIndex,
                  filterOut,
                  jQueryFilterOut,
                  nextIndex,
                  _this3 = this,
                  $tabItems = this.$tabItems,
                  $panels = this.$panels,
                  $tabs = this.$tabs,
                  currentIndex = this.currentIndex,
                  size = this.size;
                0 !== size &&
                  ((targetIndex = modulo(index, size)),
                  (filterOut = function (_, i) {
                    return i !== targetIndex;
                  }),
                  (jQueryFilterOut = function (i) {
                    return i !== targetIndex;
                  }),
                  this.pause(),
                  $tabItems.eq(targetIndex).remove(),
                  $panels.eq(targetIndex).remove(),
                  (this.$tabItems = this.$tabItems.filter(jQueryFilterOut)),
                  (this.$tabs = this.$tabs.filter(jQueryFilterOut)),
                  (this.$panels = this.$panels.filter(jQueryFilterOut)),
                  (this.$panelHeadings = this.$panelHeadings.filter(
                    jQueryFilterOut,
                  )),
                  (this.tabIds = this.tabIds.filter(filterOut)),
                  (this.panelIds = this.panelIds.filter(filterOut)),
                  --this.size,
                  $tabs.each(function (i, tab) {
                    $(tab).data('skeletabsIndex', i);
                  }),
                  this.disabledList.forEach(function (disabledIndex) {
                    return _this3.undisable(disabledIndex);
                  }),
                  this.disableByOptions(),
                  1 < size &&
                    targetIndex === currentIndex &&
                    ((nextIndex = this.getNextIndex({
                      currentIndex: currentIndex,
                      step: -1,
                    })),
                    this.show(nextIndex)),
                  'auto' !== this.options.panelHeight && this.reload(),
                  this.resume());
              },
            },
            {
              key: 'setupAccessibility',
              value: function () {
                var $tabGroup = this.$tabGroup,
                  $tabItems = this.$tabItems,
                  $tabs = this.$tabs,
                  $panels = this.$panels,
                  tabIds = setIds($tabs, {
                    type: 'tab',
                    prefix: 'skeletabsTab',
                  }),
                  panelIds = setIds($panels, {
                    type: 'panel',
                    prefix: 'skeletabsPanel',
                  });
                $tabGroup.attr('role', 'tablist'),
                  $tabItems.attr('role', 'presentation'),
                  $tabs
                    .attr({ 'aria-selected': !1, role: 'tab', tabindex: -1 })
                    .attr('aria-controls', function (i) {
                      return panelIds[i];
                    }),
                  $panels
                    .attr({ role: 'tabpanel', tabindex: 0 })
                    .attr('aria-labelledby', function (i) {
                      return tabIds[i];
                    }),
                  (this.tabIds = tabIds),
                  (this.panelIds = panelIds);
              },
            },
            {
              key: 'resetElementAttributes',
              value: function () {
                var $container = this.$container,
                  $tabGroup = this.$tabGroup,
                  $tabItems = this.$tabItems,
                  $tabs = this.$tabs,
                  $panels = this.$panels,
                  classNames = this.classNames;
                unsetIds($tabs), unsetIds($panels);
                var stateFlags = [
                  'active',
                  'disabled',
                  'enter',
                  'enterActive',
                  'enterDone',
                  'leave',
                  'leaveActive',
                  'leaveDone',
                ]
                  .map(function (key) {
                    return classNames[key];
                  })
                  .join(' ');
                $container.removeClass(
                  ''
                    .concat(classNames.init, ' ')
                    .concat(classNames.tabsMode, ' ')
                    .concat(classNames.accordionMode),
                ),
                  $tabGroup.removeAttr('role'),
                  $tabItems
                    .removeClass(
                      ''
                        .concat(classNames.active, ' ')
                        .concat(classNames.disabled),
                    )
                    .removeAttr('role'),
                  $tabs
                    .removeClass(
                      ''
                        .concat(classNames.active, ' ')
                        .concat(classNames.disabled),
                    )
                    .removeAttr(
                      'aria-controls aria-disabled disabled aria-selected role tabindex',
                    ),
                  $panels
                    .removeClass(stateFlags)
                    .removeAttr(
                      'aria-hidden aria-labelledby role style tabindex',
                    ),
                  $tabs.removeData('skeletabsIndex');
              },
            },
            {
              key: 'addEvent',
              value: function (_ref2) {
                var _$,
                  target = _ref2.target,
                  delegate = _ref2.delegate,
                  type = _ref2.type,
                  boundListener = _ref2.listener.bind(this),
                  parameters = delegate
                    ? [type, delegate, boundListener]
                    : [type, boundListener];
                return (
                  (_$ = $(target)).on.apply(_$, parameters),
                  function () {
                    var _$2;
                    return (_$2 = $(target)).off.apply(_$2, parameters);
                  }
                );
              },
            },
            {
              key: 'addEvents',
              value: function () {
                var _this4 = this,
                  $container = this.$container,
                  $panelGroup = this.$panelGroup,
                  options = this.options,
                  classNames = this.classNames;
                this.events = [
                  {
                    target: $container,
                    delegate: '.'.concat(classNames.tab),
                    type:
                      'hover' === options.selectEvent ? 'mouseenter' : 'click',
                    listener: this.handleSelect,
                  },
                  {
                    test: options.keyboard,
                    target: $container,
                    type: 'keydown',
                    listener: this.handleKeydown,
                  },
                  {
                    test: options.pauseOnFocus,
                    target: $container,
                    type: 'focusin',
                    listener: this.pause,
                  },
                  {
                    test: options.pauseOnFocus,
                    target: $container,
                    type: 'focusout',
                    listener: this.resume,
                  },
                  {
                    test: options.pauseOnHover,
                    target: $container,
                    type: 'mouseenter',
                    listener: this.pause,
                  },
                  {
                    test: options.pauseOnHover,
                    target: $container,
                    type: 'mouseout',
                    listener: this.resume,
                  },
                  {
                    test: 'auto' === options.panelHeight,
                    target: $panelGroup,
                    type: 'skeletabs:moved',
                    listener: this.reload,
                  },
                  {
                    test: 'push' === options.history,
                    target: window,
                    type: 'popstate',
                    listener: this.handlePopState,
                  },
                ]
                  .filter(function (_ref3) {
                    var test = _ref3.test;
                    return void 0 === test || !!test;
                  })
                  .map(function (_ref4) {
                    var target = _ref4.target,
                      delegate = _ref4.delegate,
                      type = _ref4.type,
                      listener = _ref4.listener;
                    return _this4.addEvent({
                      target: target,
                      delegate: delegate,
                      type: type,
                      listener: listener,
                    });
                  });
              },
            },
            {
              key: 'removeEvents',
              value: function () {
                this.events.forEach(function (removeEvent) {
                  return removeEvent();
                }),
                  (this.events = []);
              },
            },
            {
              key: 'disable',
              value: function (index) {
                var classNames = this.classNames;
                includes(this.disabledList, index) ||
                  (this.disabledList.push(index),
                  this.$tabItems.eq(index).addClass(classNames.disabled),
                  this.$tabs
                    .eq(index)
                    .addClass(classNames.disabled)
                    .attr({ 'aria-disabled': !0, disabled: !0, tabindex: -1 }),
                  this.$panels
                    .eq(index)
                    .addClass(classNames.disabled)
                    .attr({ 'aria-hidden': !0, tabindex: -1 }));
              },
            },
            {
              key: 'undisable',
              value: function (index) {
                var classNames = this.classNames;
                (this.disabledList = this.disabledList.filter(function (x) {
                  return x !== index;
                })),
                  this.$tabItems.eq(index).removeClass(classNames.disabled),
                  this.$tabs
                    .eq(index)
                    .removeClass(classNames.disabled)
                    .attr({ 'aria-disabled': '', disabled: '' }),
                  this.$panels
                    .eq(index)
                    .removeClass(classNames.disabled)
                    .attr({ 'aria-hidden': '', tabindex: 0 });
              },
            },
            {
              key: 'disableByOptions',
              value: function () {
                var _this5 = this,
                  disabledIndex = this.options.disabledIndex;
                null !== disabledIndex &&
                  []
                    .concat(disabledIndex)
                    .map(function (x) {
                      return modulo(x, _this5.size);
                    })
                    .forEach(this.disable.bind(this));
              },
            },
            {
              key: 'defineStartIndex',
              value: function () {
                var startIndex,
                  size = this.size,
                  options = this.options;
                window.location.hash &&
                  (startIndex = this.getIndexByHash(window.location.hash)),
                  'number' != typeof startIndex &&
                    ((startIndex = modulo(options.startIndex, size)),
                    includes(this.disabledList, startIndex) &&
                      ((startIndex = this.getNextIndex({
                        currentIndex: startIndex,
                      })),
                      console.warn(
                        'startIndex has been moved to '.concat(
                          startIndex,
                          ' due to conflict with disabledIndex.',
                        ),
                      ))),
                  (this.startIndex = startIndex),
                  (this.currentIndex = startIndex),
                  this.$tabs.each(function (i, tab) {
                    $(tab).data('skeletabsIndex', i);
                  });
              },
            },
            {
              key: 'hide',
              value: function (hiddenIndex) {
                var $tabItems,
                  $tabs,
                  $panels,
                  options,
                  classNames,
                  $hiddenTabItem,
                  $hiddenTab,
                  $hiddenPanel;
                includes(this.disabledList, hiddenIndex) ||
                  (($tabItems = this.$tabItems),
                  ($tabs = this.$tabs),
                  ($panels = this.$panels),
                  (options = this.options),
                  (classNames = this.classNames),
                  ($hiddenTabItem = $tabItems.eq(hiddenIndex)),
                  ($hiddenTab = $tabs.eq(hiddenIndex)),
                  ($hiddenPanel = $panels.eq(hiddenIndex)),
                  $hiddenTabItem.removeClass(classNames.active),
                  $hiddenTab
                    .removeClass(classNames.active)
                    .attr({ 'aria-selected': !1, tabindex: -1 }),
                  $hiddenPanel.removeClass(classNames.active),
                  'accordion' === this.currentLayout && options.slidingAccordion
                    ? $hiddenPanel.slideUp(options.transitionDuration)
                    : ($hiddenPanel
                        .css('display', 'none')
                        .addClass(classNames.leave)
                        .width(),
                      $hiddenPanel.addClass(classNames.leaveActive),
                      setTimeout(function () {
                        $hiddenPanel
                          .addClass(classNames.leaveDone)
                          .removeClass(
                            ''
                              .concat(classNames.leave, ' ')
                              .concat(classNames.leaveActive),
                          );
                      }, options.transitionDuration)));
              },
            },
            {
              key: 'show',
              value: function (shownIndex, argument_1) {
                var $tabItems,
                  $tabs,
                  $panelGroup,
                  $panels,
                  classNames,
                  options,
                  previousIndex,
                  $currentTabItem,
                  $currentTab,
                  $currentPanel,
                  emitMovedEvent,
                  currentPanelHeight,
                  currentHash,
                  hash,
                  _this6 = this,
                  _ref5 =
                    1 < arguments.length && void 0 !== argument_1
                      ? argument_1
                      : {},
                  focus = _ref5.focus,
                  passive = _ref5.passive,
                  updateHistory = _ref5.updateHistory;
                includes(this.disabledList, shownIndex) ||
                  (($tabItems = this.$tabItems),
                  ($tabs = this.$tabs),
                  ($panelGroup = this.$panelGroup),
                  ($panels = this.$panels),
                  (classNames = this.classNames),
                  (options = this.options),
                  (previousIndex = this.currentIndex),
                  ($currentTabItem = $tabItems.eq(shownIndex)),
                  ($currentTab = $tabs.eq(shownIndex)),
                  ($currentPanel = $panels.eq(shownIndex)),
                  (emitMovedEvent = function () {
                    _this6.emit('skeletabs:moved', {
                      previousIndex: previousIndex,
                      $previousPanel: $panels.eq(previousIndex),
                      $previousTab: $tabs.eq(previousIndex),
                    });
                  }),
                  (this.currentIndex = shownIndex),
                  (this.focusedIndex = shownIndex),
                  $currentTabItem.addClass(classNames.active),
                  $currentTab
                    .addClass(classNames.active)
                    .attr({ 'aria-selected': !0, tabindex: 0 }),
                  $currentPanel.addClass(classNames.active),
                  passive
                    ? $currentPanel.css('display', 'block')
                    : (focus && $currentTab.focus(),
                      'accordion' === this.currentLayout &&
                      options.slidingAccordion
                        ? $currentPanel.slideDown({ complete: emitMovedEvent })
                        : ($currentPanel
                            .css('display', 'block')
                            .addClass(classNames.enter),
                          (currentPanelHeight = $currentPanel.outerHeight()),
                          'adaptive' === options.panelHeight &&
                            $panelGroup.height(currentPanelHeight),
                          $currentPanel.addClass(classNames.enterActive),
                          setTimeout(function () {
                            $currentPanel
                              .addClass(classNames.enterDone)
                              .removeClass(
                                ''
                                  .concat(classNames.enter, ' ')
                                  .concat(classNames.enterActive),
                              ),
                              emitMovedEvent();
                          }, options.transitionDuration)),
                      options.history &&
                        updateHistory &&
                        !this.isPlaying() &&
                        ((currentHash = '#'.concat(this.panelIds[shownIndex])),
                        'push' === options.history
                          ? ((hash = currentHash),
                            supportsHistory() &&
                              window.history.pushState(
                                { hash: hash },
                                null,
                                hash,
                              ))
                          : (function (hash) {
                              supportsHistory() &&
                                window.history.replaceState(null, null, hash);
                            })(currentHash))));
              },
            },
            {
              key: 'goTo',
              value: function (index, argument_1) {
                var $panels,
                  $tabs,
                  classNames,
                  previousIndex,
                  nextIndex,
                  transitionFlags,
                  _ref6 =
                    1 < arguments.length && void 0 !== argument_1
                      ? argument_1
                      : {},
                  focus = _ref6.focus,
                  _ref6$updateHistory = _ref6.updateHistory,
                  updateHistory =
                    void 0 === _ref6$updateHistory || _ref6$updateHistory;
                null != index &&
                  (($panels = this.$panels),
                  ($tabs = this.$tabs),
                  (classNames = this.classNames),
                  (previousIndex = this.currentIndex),
                  (nextIndex = modulo(index, this.size)) === previousIndex ||
                    includes(this.disabledList, nextIndex) ||
                    (this.emit('skeletabs:move', {
                      currentIndex: previousIndex,
                      $currentPanel: $panels.eq(previousIndex),
                      $currentTab: $tabs.eq(previousIndex),
                      nextIndex: nextIndex,
                      $nextPanel: $panels.eq(nextIndex),
                      $nextTab: $tabs.eq(nextIndex),
                    }),
                    (transitionFlags = [
                      'enter',
                      'enterActive',
                      'enterDone',
                      'leave',
                      'leaveActive',
                      'leaveDone',
                    ]
                      .map(function (key) {
                        return classNames[key];
                      })
                      .join(' ')),
                    $panels.removeClass(transitionFlags),
                    this.hide(previousIndex),
                    this.show(nextIndex, {
                      focus: focus,
                      updateHistory: updateHistory,
                    })));
              },
            },
            {
              key: 'go',
              value: function (step, argument_1) {
                var nextIndex,
                  _ref7 =
                    1 < arguments.length && void 0 !== argument_1
                      ? argument_1
                      : {},
                  loop = _ref7.loop,
                  focus = _ref7.focus,
                  _ref7$updateHistory = _ref7.updateHistory,
                  updateHistory =
                    void 0 === _ref7$updateHistory || _ref7$updateHistory;
                !step ||
                  (null !==
                    (nextIndex = this.getNextIndex({
                      step: step,
                      loop: loop,
                    })) &&
                    this.goTo(nextIndex, {
                      focus: focus,
                      updateHistory: updateHistory,
                    }));
              },
            },
            {
              key: 'moveFocusTo',
              value: function (index) {
                var nextIndex = modulo(index, this.size),
                  previousIndex = this.focusedIndex;
                previousIndex === nextIndex ||
                  includes(this.disabledList, nextIndex) ||
                  (this.$tabs
                    .eq(nextIndex)
                    .attr('tabindex', 0)
                    .focus()
                    .end()
                    .eq(previousIndex)
                    .attr('tabindex', -1),
                  (this.focusedIndex = nextIndex));
              },
            },
            {
              key: 'moveFocus',
              value: function (step, argument_1) {
                var nextIndex,
                  loop = (1 < arguments.length && void 0 !== argument_1
                    ? argument_1
                    : {}
                  ).loop;
                !step ||
                  (null !==
                    (nextIndex = this.getNextIndex({
                      currentIndex: this.focusedIndex,
                      step: step,
                      loop: loop,
                    })) &&
                    this.moveFocusTo(nextIndex));
              },
            },
            {
              key: 'reload',
              value: function () {
                'accordion' === this.currentLayout
                  ? this.resetPanelHeight()
                  : 'equal' === this.options.panelHeight
                  ? this.equalizePanelHeight()
                  : 'adaptive' === this.options.panelHeight &&
                    this.adaptPanelHeight();
              },
            },
            {
              key: 'useTabs',
              value: function () {
                var classNames, options, previousLayout, $panelGroup, $tabItems;
                'tabs' !== this.currentLayout &&
                  ((classNames = this.classNames),
                  (options = this.options),
                  (previousLayout = this.currentLayout),
                  (this.currentLayout = 'tabs'),
                  this.$container
                    .addClass(classNames.tabsMode)
                    .removeClass(classNames.accordionMode),
                  'accordion' === previousLayout &&
                    (($panelGroup = this.$panelGroup),
                    ($tabItems = this.$tabItems),
                    this.$tabGroup.insertBefore($panelGroup),
                    this.$tabs.each(function (i, tab) {
                      $tabItems.eq(i).append($(tab).detach());
                    }),
                    this.$panelHeadings.detach()),
                  'adaptive' === options.panelHeight &&
                    this.$panelGroup.css(
                      'transition',
                      'height '.concat(
                        options.transitionDuration,
                        'ms ease 0s',
                      ),
                    ),
                  this.emit('skeletabs:layoutchange'));
              },
            },
            {
              key: 'useAccordion',
              value: function () {
                var $tabs, $panels, classNames;
                'accordion' !== this.currentLayout &&
                  (($tabs = this.$tabs),
                  ($panels = this.$panels),
                  (classNames = this.classNames),
                  (this.currentLayout = 'accordion'),
                  this.$container
                    .addClass(classNames.accordionMode)
                    .removeClass(classNames.tabsMode),
                  this.$panelHeadings.each(function (i, heading) {
                    var $tab = $tabs.eq(i),
                      $panel = $panels.eq(i);
                    $(heading).append($tab.detach()).insertBefore($panel);
                  }),
                  'adaptive' === this.options.panelHeight &&
                    this.$panelGroup.css('transition', ''),
                  this.$tabGroup.detach(),
                  this.emit('skeletabs:layoutchange'));
              },
            },
            {
              key: 'isBelowBreakpoint',
              value: function () {
                var breakpoint = this.options.breakpoint;
                return breakpoint && getViewportWidth() <= breakpoint;
              },
            },
            {
              key: 'setLayout',
              value: function () {
                var breakpointLayout = this.options.breakpointLayout,
                  isBelowBreakpoint = this.isBelowBreakpoint();
                'accordion' === breakpointLayout && isBelowBreakpoint
                  ? this.useAccordion()
                  : this.useTabs(),
                  'destroy' === breakpointLayout &&
                    (isBelowBreakpoint ? this.deactivate() : this.activate());
              },
            },
            {
              key: 'resetLayout',
              value: function () {
                var $panelGroup,
                  $tabItems,
                  currentLayout = this.currentLayout,
                  classNames = this.classNames;
                'accordion' === currentLayout &&
                  (($panelGroup = this.$panelGroup),
                  ($tabItems = this.$tabItems),
                  this.$tabGroup.insertBefore($panelGroup),
                  this.$tabs.detach().each(function (i, tab) {
                    $tabItems.eq(i).append(tab);
                  }),
                  this.$panelHeadings.remove(),
                  this.$panels.css('display', '')),
                  this.$container.removeClass(
                    ''
                      .concat(classNames.tabsMode, ' ')
                      .concat(classNames.accordionMode),
                  ),
                  (this.currentLayout = void 0);
              },
            },
            {
              key: 'adaptPanelHeight',
              value: function () {
                var currentIndex = this.currentIndex,
                  $currentPanel = this.$panels.eq(currentIndex),
                  hiddenAncestor = findHiddenInTree(this.container);
                hiddenAncestor && showInstantly(hiddenAncestor),
                  this.$panelGroup.css(
                    'height',
                    ''.concat($currentPanel.outerHeight(), 'px'),
                  ),
                  hiddenAncestor && hideBack(hiddenAncestor);
              },
            },
            {
              key: 'equalizePanelHeight',
              value: function () {
                var disabledList = this.disabledList,
                  hiddenAncestor = findHiddenInTree(this.container),
                  maxHeight = 0;
                hiddenAncestor && showInstantly(hiddenAncestor),
                  this.$panels
                    .each(function (index, panel) {
                      includes(disabledList, index) ||
                        (showInstantly(panel),
                        (maxHeight = Math.max(maxHeight, $(panel).height())),
                        hideBack(panel));
                    })
                    .height(maxHeight),
                  hiddenAncestor && hideBack(hiddenAncestor);
              },
            },
            {
              key: 'resetPanelHeight',
              value: function () {
                this.$panelGroup.css({ height: '', transition: '' }),
                  this.$panels.css('height', '');
              },
            },
            {
              key: 'play',
              value: function () {
                var _this7 = this;
                this.isPlaying() ||
                  (this.rotationId = setInterval(function () {
                    _this7.go(1, { loop: !0, updateHistory: !1 });
                  }, this.options.autoplayInterval));
              },
            },
            {
              key: 'pause',
              value: function () {
                this.isPlaying() &&
                  (this.rotationId = clearInterval(this.rotationId));
              },
            },
            {
              key: 'resume',
              value: function () {
                this.options.autoplay && this.play();
              },
            },
            {
              key: 'isPlaying',
              value: function () {
                return void 0 !== this.rotationId;
              },
            },
            {
              key: 'emit',
              value: function (eventName, parameters) {
                var currentInfo = this.getCurrentInfo();
                this.$container.trigger(
                  eventName,
                  $.extend(currentInfo, parameters),
                );
              },
            },
            {
              key: 'getNextIndex',
              value: function (_ref9) {
                for (
                  var x,
                    max,
                    _ref9$currentIndex = _ref9.currentIndex,
                    currentIndex =
                      void 0 === _ref9$currentIndex
                        ? this.currentIndex
                        : _ref9$currentIndex,
                    _ref9$step = _ref9.step,
                    step = void 0 === _ref9$step ? 1 : _ref9$step,
                    _ref9$loop = _ref9.loop,
                    loop = void 0 !== _ref9$loop && _ref9$loop,
                    size = this.size,
                    disabledList = this.disabledList,
                    nextIndex = currentIndex;
                  (nextIndex += step),
                    loop && (nextIndex = modulo(nextIndex, size)),
                    includes(disabledList, nextIndex);

                );
                return loop ||
                  ((max = size - 1), 0 <= (x = nextIndex) && x <= max)
                  ? nextIndex
                  : null;
              },
            },
            {
              key: 'getFirstIndex',
              value: function () {
                for (
                  var size = this.size,
                    disabledList = this.disabledList,
                    index = 0;
                  includes(disabledList, index);

                )
                  index += 1;
                return size - 1 < index ? null : index;
              },
            },
            {
              key: 'getLastIndex',
              value: function () {
                for (
                  var size = this.size,
                    disabledList = this.disabledList,
                    index = size - 1;
                  includes(disabledList, index);

                )
                  --index;
                return index < 0 ? null : index;
              },
            },
            {
              key: 'getIndexByHash',
              value: function (hash) {
                if (!hash) return null;
                var match = this.panelIds.indexOf(hash.slice(1));
                return -1 !== match ? match : null;
              },
            },
            {
              key: 'getCurrentInfo',
              value: function () {
                var $container = this.$container,
                  $panels = this.$panels,
                  $tabs = this.$tabs,
                  currentIndex = this.currentIndex,
                  currentLayout = this.currentLayout,
                  size = this.size;
                return {
                  $container: $container,
                  $panels: $panels,
                  $tabs: $tabs,
                  $currentPanel: $panels.eq(currentIndex),
                  $currentTab: $tabs.eq(currentIndex),
                  currentIndex: currentIndex,
                  currentLayout: currentLayout,
                  size: size,
                };
              },
            },
            {
              key: 'handlePopState',
              value: function (event) {
                var state,
                  targetHash =
                    (state = event.originalEvent.state) && state.hash
                      ? state.hash
                      : null,
                  targetIndex = targetHash
                    ? this.getIndexByHash(targetHash)
                    : this.startIndex;
                this.goTo(targetIndex, { updateHistory: !1 });
              },
            },
            {
              key: 'handleKeydown',
              value: function (event) {
                var string,
                  action = (function (event, direction) {
                    var keycode = event.which || event.keyCode,
                      key = expectedKeys[keycode];
                    return (
                      (key &&
                        (actions[direction][key] || actions.common[key])) ||
                      null
                    );
                  })(
                    event,
                    this.options[
                      'keyboard'.concat(
                        (string = this.currentLayout)[0].toUpperCase() +
                          string.slice(1).toLowerCase(),
                      )
                    ],
                  ),
                  autoselect = 'select' === this.options.keyboard;
                switch (action) {
                  case 'prev':
                    this[autoselect ? 'go' : 'moveFocus'](-1, { focus: !0 });
                    break;
                  case 'next':
                    this[autoselect ? 'go' : 'moveFocus'](1, { focus: !0 });
                    break;
                  case 'first':
                    this[
                      autoselect ? 'goTo' : 'moveFocusTo'
                    ](this.getFirstIndex(), { focus: !0 });
                    break;
                  case 'last':
                    this[
                      autoselect ? 'goTo' : 'moveFocusTo'
                    ](this.getLastIndex(), { focus: !0 });
                    break;
                  default:
                    return;
                }
                event.preventDefault(), event.stopPropagation();
              },
            },
            {
              key: 'handleSelect',
              value: function (event) {
                var selectedIndex = $(event.currentTarget).data(
                  'skeletabsIndex',
                );
                this.goTo(selectedIndex),
                  event.preventDefault(),
                  event.stopPropagation();
              },
            },
          ]) && _defineProperties(Constructor.prototype, protoProps),
          staticProps && _defineProperties(Constructor, staticProps),
          Skeletabs
        );
      })(),
      registered = {};
    function createInstance(container, options, classNames) {
      if (void 0 !== container.skeletabsId)
        throw new Error('Skeletabs has already been initialized.');
      return new core_Skeletabs(container, options, classNames);
    }
    function register(container, instance) {
      (registered[instance.id] = instance),
        (container.skeletabsId = instance.id);
    }
    function methods_typeof(obj) {
      return (methods_typeof =
        'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
          ? function (obj) {
              return typeof obj;
            }
          : function (obj) {
              return obj &&
                'function' == typeof Symbol &&
                obj.constructor === Symbol &&
                obj !== Symbol.prototype
                ? 'symbol'
                : typeof obj;
            })(obj);
    }
    var api = {
      destroy: function () {
        var instance, id, container;
        this.destroy(),
          (id = (instance = this).id),
          (container = instance.container),
          id in registered &&
            (delete container.skeletabsId, delete registered[id]);
      },
      reload: function () {
        this.reload();
      },
      goTo: function (query) {
        switch (methods_typeof(query)) {
          case 'number':
            this.goTo(query, { updateHistory: !0 });
            break;
          case 'string':
            '#' === query[0] &&
              this.goTo(this.getIndexByHash(query), { updateHistory: !1 });
            break;
          default:
            throw Error('Invalid parameter: '.concat(JSON.stringify(query)));
        }
      },
      next: function () {
        this.go(1, { updateHistory: !0 });
      },
      prev: function () {
        this.go(-1, { updateHistory: !0 });
      },
      play: function () {
        this.play();
      },
      pause: function () {
        this.pause();
      },
      add: function (data) {
        this.add(data);
      },
      remove: function (index) {
        this.remove(index);
      },
      getCurrentInfo: function () {
        return this.getCurrentInfo();
      },
    };
    function call(command, container, params) {
      var instance = (function (container) {
        var id = container.skeletabsId;
        return (id && registered[id]) || null;
      })(container);
      if (!Object.prototype.hasOwnProperty.call(api, command))
        throw new Error('Invalid method name: '.concat(command));
      if (!instance)
        throw new Error(
          'Skeletabs is not initialized on element: '.concat(
            container.id ? '#'.concat(container.id) : container.className,
          ),
        );
      return api[command].apply(instance, params);
    }
    function reverseEach($elements, callback) {
      $elements.pushStack($elements.get().reverse()).each(callback);
    }
    __webpack_require__(2);
    function ownKeys(object, enumerableOnly) {
      var symbols,
        keys = Object.keys(object);
      return (
        Object.getOwnPropertySymbols &&
          ((symbols = Object.getOwnPropertySymbols(object)),
          enumerableOnly &&
            (symbols = symbols.filter(function (sym) {
              return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            })),
          keys.push.apply(keys, symbols)),
        keys
      );
    }
    /*! Skeletabs v2.1.1 | MIT License | Requires jQuery v1 or higher */
    if ('undefined' == typeof $)
      throw new ReferenceError('Skeletabs requires jQuery to be loaded.');
    $.fn.extend({
      skeletabs: function (firstArg) {
        for (
          var returnValue,
            _len = arguments.length,
            restArgs = new Array(1 < _len ? _len - 1 : 0),
            _key = 1;
          _key < _len;
          _key++
        )
          restArgs[_key - 1] = arguments[_key];
        try {
          reverseEach(this, function (_, container) {
            var instance;
            'string' == typeof firstArg
              ? (returnValue = call(firstArg, container, restArgs))
              : (register(
                  container,
                  (instance = createInstance(container, firstArg, restArgs[0])),
                ),
                instance.init());
          });
        } catch (error) {
          console.error(error.message);
        }
        return returnValue || this;
      },
    }),
      ($.skeletabs = (function (target) {
        for (var i = 1; i < arguments.length; i++) {
          var source = null != arguments[i] ? arguments[i] : {};
          i % 2
            ? ownKeys(Object(source), !0).forEach(function (key) {
                !(function (obj, key, value) {
                  key in obj
                    ? Object.defineProperty(obj, key, {
                        value: value,
                        enumerable: !0,
                        configurable: !0,
                        writable: !0,
                      })
                    : (obj[key] = value);
                })(target, key, source[key]);
              })
            : Object.getOwnPropertyDescriptors
            ? Object.defineProperties(
                target,
                Object.getOwnPropertyDescriptors(source),
              )
            : ownKeys(Object(source)).forEach(function (key) {
                Object.defineProperty(
                  target,
                  key,
                  Object.getOwnPropertyDescriptor(source, key),
                );
              });
        }
        return target;
      })({ version: '2.1.1' }, globalMethods)),
      $(function () {
        reverseEach($('[data-skeletabs]'), function (_, container) {
          var $container = $(container),
            instance = createInstance(
              container,
              $container.data('skeletabs'),
              $container.data('skeletabs-class'),
            );
          register(container, instance), instance.init();
        });
      });
  },
]);
