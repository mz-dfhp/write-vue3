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
    reactive: () => reactive
  });

  // packages/shared/src/index.ts
  var isObject = (val) => typeof val !== null && typeof val === "object";
  var isFunction = (fn) => typeof fn === "function";
  var isArray = Array.isArray;

  // packages/reactivity/src/dep.ts
  var createDep = (effects) => {
    const dep = new Set(effects);
    return dep;
  };

  // packages/reactivity/src/effect.ts
  var activeEffect;
  var ReactiveEffect = class {
    // 父 effect 默认null
    constructor(fn) {
      this.fn = fn;
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
      this.active = false;
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
  function effect(fn) {
    if (!isFunction)
      console.warn("effect \u4F20\u5165\u5FC5\u987B\u662F\u4E00\u4E2A\u51FD\u6570\uFF01");
    const _effect = new ReactiveEffect(fn);
    _effect.run();
  }
  var targetMap = /* @__PURE__ */ new WeakMap();
  function track(target, type, key) {
    console.log(type);
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
    console.log(type);
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
      console.log(effect2);
      console.log(activeEffect);
      effect2.run();
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

  // packages/reactivity/src/reactive.ts
  var reactiveMap = /* @__PURE__ */ new WeakMap();
  function reactive(target) {
    return createReactiveObject(target);
  }
  function createReactiveObject(target) {
    if (!isObject) {
      console.warn("\u54CD\u5E94\u5F0F\u5143\u7D20\u5FC5\u987B\u662F\u4E00\u4E2A\u5BF9\u8C61\uFF01");
      return target;
    }
    const existingProxy = reactiveMap.get(target);
    if (existingProxy) {
      return existingProxy;
    }
    if (target["__v_isReactive" /* IS_REACTIVE */]) {
      return target;
    }
    const proxy = new Proxy(target, mutableHandlers);
    reactiveMap.set(target, proxy);
    return proxy;
  }
  return __toCommonJS(src_exports);
})();
//# sourceMappingURL=reactivity.global.js.map
