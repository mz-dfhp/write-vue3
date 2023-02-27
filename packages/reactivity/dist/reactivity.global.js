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
    constructor(fn) {
      this.fn = fn;
      activeEffect = this;
      this.fn = fn;
    }
    run() {
      this.fn();
    }
  };
  function effect(fn) {
    if (!isFunction)
      console.warn("effect \u4F20\u5165\u5FC5\u987B\u662F\u4E00\u4E2A\u51FD\u6570\uFF01");
    const _effect = new ReactiveEffect(fn);
    _effect.run();
  }
  var targetMap = /* @__PURE__ */ new WeakMap();
  function track(target, key) {
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
    }
  }
  function trigger(target, key) {
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
    effect2.run();
  }

  // packages/reactivity/src/baseHandlers.ts
  var mutableHandlers = {
    get(target, key, receiver) {
      track(target, key);
      return Reflect.get(target, key, receiver);
    },
    set(target, key, value) {
      const result = Reflect.set(target, key, value);
      trigger(target, key);
      return result;
    }
  };

  // packages/reactivity/src/reactive.ts
  function reactive(target) {
    return createReactiveObject(target);
  }
  function createReactiveObject(target) {
    if (!isObject) {
      console.warn("\u54CD\u5E94\u5F0F\u5143\u7D20\u5FC5\u987B\u662F\u4E00\u4E2A\u5BF9\u8C61\uFF01");
      return target;
    }
    const proxy = new Proxy(target, mutableHandlers);
    return proxy;
  }
  return __toCommonJS(src_exports);
})();
//# sourceMappingURL=reactivity.global.js.map
