"use strict";
var VueReactivity = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // packages/reactivity/src/index.ts
  var src_exports = {};
  __export(src_exports, {
    effect: () => effect,
    isReactive: () => isReactive,
    isReadonly: () => isReadonly,
    reactive: () => reactive,
    readonly: () => readonly
  });

  // packages/shared/src/index.ts
  var isObject = (val) => typeof val !== null && typeof val === "object";
  var isFunction = (fn) => typeof fn === "function";
  var isArray = Array.isArray;
  var extend = Object.assign;

  // packages/reactivity/src/dep.ts
  var createDep = (effects) => {
    const dep = new Set(effects);
    return dep;
  };

  // packages/reactivity/src/effect.ts
  var activeEffect;
  var ReactiveEffect = class {
    constructor(fn, scheduler = null) {
      this.fn = fn;
      this.scheduler = scheduler;
      this.active = true;
      // 默认激活状态
      this.deps = [];
      // 让 effect 记录dep
      this.parent = void 0;
      this.fn = fn;
    }
    // 执行effect
    run() {
      if (!this.active) {
        return this.fn();
      }
      try {
        this.parent = activeEffect;
        activeEffect = this;
        cleanupEffect(this);
        return this.fn();
      } finally {
        activeEffect = this.parent;
        this.parent = void 0;
      }
    }
    stop() {
      if (this.active) {
        cleanupEffect(this);
        if (this.onStop) {
          this.onStop();
        }
        this.active = false;
      }
    }
  };
  function cleanupEffect(effect2) {
    const { deps } = effect2;
    if (deps.length) {
      for (let i = 0; i < deps.length; i++) {
        deps[i].delete(effect2);
      }
      deps.length = 0;
    }
  }
  function effect(fn, options) {
    if (!isFunction)
      console.warn("effect \u4F20\u5165\u5FC5\u987B\u662F\u4E00\u4E2A\u51FD\u6570\uFF01");
    const _effect = new ReactiveEffect(fn);
    if (options) {
      extend(_effect, options);
    }
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
  }
  var targetMap = /* @__PURE__ */ new WeakMap();
  function track(target, type, key) {
    if (!activeEffect)
      return;
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, dep = createDep());
    }
    trackEffects(dep);
  }
  function trackEffects(dep) {
    let shouldTrack = false;
    shouldTrack = !dep.has(activeEffect);
    if (shouldTrack) {
      dep.add(activeEffect);
      activeEffect.deps.push(dep);
    }
  }
  function trigger(target, type, key) {
    const depsMap = targetMap.get(target);
    if (!depsMap)
      return;
    const deps = [];
    const dep = depsMap.get(key);
    deps.push(dep);
    if (deps.length === 1) {
      deps[0] && triggerEffects(deps[0]);
    } else {
      const effects = [];
      for (const dep2 of deps) {
        dep2 && effects.push(...dep2);
      }
      triggerEffects(createDep(effects));
    }
  }
  function triggerEffects(dep) {
    const effects = isArray(dep) ? dep : [...dep];
    for (const effect2 of effects) {
      triggerEffect(effect2);
    }
  }
  function triggerEffect(effect2) {
    if (effect2 !== activeEffect) {
      if (effect2.scheduler) {
        effect2.scheduler();
      } else {
        effect2.run();
      }
    }
  }

  // packages/reactivity/src/baseHandlers.ts
  var mutableHandlers = {
    get(target, key, receiver) {
      if (key === "__v_isReactive" /* IS_REACTIVE */)
        return true;
      track(target, "get" /* GET */, key);
      return Reflect.get(target, key, receiver);
    },
    set(target, key, value) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value);
      if (oldValue !== value) {
        trigger(target, "set" /* SET */, key);
      }
      return result;
    }
  };
  var readonlyHandlers = {
    get(target, key, receiver) {
      if (key === "__v_isReadonly" /* IS_READONLY */)
        return true;
      return Reflect.get(target, key, receiver);
    },
    set(target, key) {
      console.warn(`\u8BBE\u7F6E${String(key)}\u5931\u8D25`, target, "\u662F\u53EA\u8BFB\u5BF9\u8C61");
      return true;
    }
  };

  // packages/reactivity/src/reactive.ts
  var reactiveMap = /* @__PURE__ */ new WeakMap();
  var readonlyMap = /* @__PURE__ */ new WeakMap();
  function reactive(target) {
    if (isReadonly(target)) {
      return target;
    }
    return createReactiveObject(target, mutableHandlers, reactiveMap);
  }
  function readonly(target) {
    return createReactiveObject(target, readonlyHandlers, readonlyMap);
  }
  function createReactiveObject(target, baseHandlers, proxyMap) {
    if (!isObject) {
      console.warn("\u54CD\u5E94\u5F0F\u5143\u7D20\u5FC5\u987B\u662F\u4E00\u4E2A\u5BF9\u8C61\uFF01");
      return target;
    }
    const existingProxy = proxyMap.get(target);
    if (existingProxy) {
      return existingProxy;
    }
    if (target["__v_isReactive" /* IS_REACTIVE */]) {
      return target;
    }
    const proxy = new Proxy(target, baseHandlers);
    proxyMap.set(target, proxy);
    return proxy;
  }
  function isReactive(value) {
    return !!(value && value["__v_isReactive" /* IS_REACTIVE */]);
  }
  function isReadonly(value) {
    return !!(value && value["__v_isReadonly" /* IS_READONLY */]);
  }
  return __toCommonJS(src_exports);
})();
//# sourceMappingURL=reactivity.global.js.map
