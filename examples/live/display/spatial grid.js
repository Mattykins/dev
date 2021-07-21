(() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __pow = Math.pow;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // ../phaser-genesis/node_modules/bitecs/dist/index.es.js
  var TYPES_ENUM = {
    i8: "i8",
    ui8: "ui8",
    ui8c: "ui8c",
    i16: "i16",
    ui16: "ui16",
    i32: "i32",
    ui32: "ui32",
    f32: "f32",
    f64: "f64"
  };
  var TYPES_NAMES = {
    i8: "Int8",
    ui8: "Uint8",
    ui8c: "Uint8Clamped",
    i16: "Int16",
    ui16: "Uint16",
    i32: "Int32",
    ui32: "Uint32",
    f32: "Float32",
    f64: "Float64"
  };
  var TYPES = {
    i8: Int8Array,
    ui8: Uint8Array,
    ui8c: Uint8ClampedArray,
    i16: Int16Array,
    ui16: Uint16Array,
    i32: Int32Array,
    ui32: Uint32Array,
    f32: Float32Array,
    f64: Float64Array
  };
  var UNSIGNED_MAX = {
    uint8: __pow(2, 8),
    uint16: __pow(2, 16),
    uint32: __pow(2, 32)
  };
  var $storeRef = Symbol("storeRef");
  var $storeSize = Symbol("storeSize");
  var $storeMaps = Symbol("storeMaps");
  var $storeFlattened = Symbol("storeFlattened");
  var $storeBase = Symbol("storeBase");
  var $storeType = Symbol("storeType");
  var $storeArrayCounts = Symbol("storeArrayCount");
  var $storeSubarrays = Symbol("storeSubarrays");
  var $storeCursor = Symbol("storeCursor");
  var $subarrayCursors = Symbol("subarrayCursors");
  var $subarray = Symbol("subarray");
  var $subarrayFrom = Symbol("subarrayFrom");
  var $subarrayTo = Symbol("subarrayTo");
  var $parentArray = Symbol("subStore");
  var $tagStore = Symbol("tagStore");
  var $queryShadow = Symbol("queryShadow");
  var $serializeShadow = Symbol("serializeShadow");
  var $indexType = Symbol("indexType");
  var $indexBytes = Symbol("indexBytes");
  var stores = {};
  var resize = (ta, size) => {
    const newBuffer = new ArrayBuffer(size * ta.BYTES_PER_ELEMENT);
    const newTa = new ta.constructor(newBuffer);
    newTa.set(ta, 0);
    return newTa;
  };
  var createShadow = (store, key) => {
    if (!ArrayBuffer.isView(store)) {
      const shadow = store[$parentArray].slice(0).fill(0);
      for (const k in store[key]) {
        const from = store[key][k][$subarrayFrom];
        const to = store[key][k][$subarrayTo];
        store[key][k] = shadow.subarray(from, to);
      }
    } else {
      store[key] = store.slice(0).fill(0);
    }
  };
  var resizeSubarray = (metadata, store, size) => {
    const cursors = metadata[$subarrayCursors];
    const type = store[$storeType];
    const length = store[0].length;
    const indexType = length <= UNSIGNED_MAX.uint8 ? "ui8" : length <= UNSIGNED_MAX.uint16 ? "ui16" : "ui32";
    const arrayCount = metadata[$storeArrayCounts][type];
    const summedLength = Array(arrayCount).fill(0).reduce((a, p) => a + length, 0);
    const array = new TYPES[type](summedLength * size);
    array.set(metadata[$storeSubarrays][type]);
    metadata[$storeSubarrays][type] = array;
    createShadow(metadata[$storeSubarrays][type], $queryShadow);
    createShadow(metadata[$storeSubarrays][type], $serializeShadow);
    array[$indexType] = TYPES_NAMES[indexType];
    array[$indexBytes] = TYPES[indexType].BYTES_PER_ELEMENT;
    const start = cursors[type];
    let end = 0;
    for (let eid = 0; eid < size; eid++) {
      const from = cursors[type] + eid * length;
      const to = from + length;
      store[eid] = metadata[$storeSubarrays][type].subarray(from, to);
      store[eid][$subarrayFrom] = from;
      store[eid][$subarrayTo] = to;
      store[eid][$queryShadow] = metadata[$storeSubarrays][type][$queryShadow].subarray(from, to);
      store[eid][$serializeShadow] = metadata[$storeSubarrays][type][$serializeShadow].subarray(from, to);
      store[eid][$subarray] = true;
      store[eid][$indexType] = array[$indexType];
      store[eid][$indexBytes] = array[$indexBytes];
      end = to;
    }
    cursors[type] = end;
    store[$parentArray] = metadata[$storeSubarrays][type].subarray(start, end);
  };
  var resizeRecursive = (metadata, store, size) => {
    Object.keys(store).forEach((key) => {
      const ta = store[key];
      if (Array.isArray(ta)) {
        resizeSubarray(metadata, ta, size);
        store[$storeFlattened].push(ta);
      } else if (ArrayBuffer.isView(ta)) {
        store[key] = resize(ta, size);
        store[$storeFlattened].push(store[key]);
        store[key][$queryShadow] = resize(ta[$queryShadow], size);
        store[key][$serializeShadow] = resize(ta[$serializeShadow], size);
      } else if (typeof ta === "object") {
        resizeRecursive(metadata, store[key], size);
      }
    });
  };
  var resizeStore = (store, size) => {
    if (store[$tagStore])
      return;
    store[$storeSize] = size;
    store[$storeFlattened].length = 0;
    Object.keys(store[$subarrayCursors]).forEach((k) => {
      store[$subarrayCursors][k] = 0;
    });
    resizeRecursive(store, store, size);
  };
  var resetStoreFor = (store, eid) => {
    if (store[$storeFlattened]) {
      store[$storeFlattened].forEach((ta) => {
        if (ArrayBuffer.isView(ta))
          ta[eid] = 0;
        else
          ta[eid].fill(0);
      });
    }
  };
  var createTypeStore = (type, length) => {
    const totalBytes = length * TYPES[type].BYTES_PER_ELEMENT;
    const buffer4 = new ArrayBuffer(totalBytes);
    return new TYPES[type](buffer4);
  };
  var createArrayStore = (metadata, type, length) => {
    const size = metadata[$storeSize];
    const store = Array(size).fill(0);
    store[$storeType] = type;
    const cursors = metadata[$subarrayCursors];
    const indexType = length < UNSIGNED_MAX.uint8 ? "ui8" : length < UNSIGNED_MAX.uint16 ? "ui16" : "ui32";
    if (!length)
      throw new Error("\u274C Must define a length for component array.");
    if (!TYPES[type])
      throw new Error(`\u274C Invalid component array property type ${type}.`);
    if (!metadata[$storeSubarrays][type]) {
      const arrayCount = metadata[$storeArrayCounts][type];
      const summedLength = Array(arrayCount).fill(0).reduce((a, p) => a + length, 0);
      const array = new TYPES[type](summedLength * size);
      metadata[$storeSubarrays][type] = array;
      createShadow(metadata[$storeSubarrays][type], $queryShadow);
      createShadow(metadata[$storeSubarrays][type], $serializeShadow);
      array[$indexType] = TYPES_NAMES[indexType];
      array[$indexBytes] = TYPES[indexType].BYTES_PER_ELEMENT;
    }
    const start = cursors[type];
    let end = 0;
    for (let eid = 0; eid < size; eid++) {
      const from = cursors[type] + eid * length;
      const to = from + length;
      store[eid] = metadata[$storeSubarrays][type].subarray(from, to);
      store[eid][$subarrayFrom] = from;
      store[eid][$subarrayTo] = to;
      store[eid][$queryShadow] = metadata[$storeSubarrays][type][$queryShadow].subarray(from, to);
      store[eid][$serializeShadow] = metadata[$storeSubarrays][type][$serializeShadow].subarray(from, to);
      store[eid][$subarray] = true;
      store[eid][$indexType] = TYPES_NAMES[indexType];
      store[eid][$indexBytes] = TYPES[indexType].BYTES_PER_ELEMENT;
      end = to;
    }
    cursors[type] = end;
    store[$parentArray] = metadata[$storeSubarrays][type].subarray(start, end);
    return store;
  };
  var isArrayType = (x) => Array.isArray(x) && typeof x[0] === "string" && typeof x[1] === "number";
  var createStore = (schema, size) => {
    const $store = Symbol("store");
    if (!schema || !Object.keys(schema).length) {
      stores[$store] = {
        [$storeSize]: size,
        [$tagStore]: true,
        [$storeBase]: () => stores[$store]
      };
      return stores[$store];
    }
    schema = JSON.parse(JSON.stringify(schema));
    const arrayCounts = {};
    const collectArrayCounts = (s) => {
      const keys = Object.keys(s);
      for (const k of keys) {
        if (isArrayType(s[k])) {
          if (!arrayCounts[s[k][0]])
            arrayCounts[s[k][0]] = 0;
          arrayCounts[s[k][0]]++;
        } else if (s[k] instanceof Object) {
          collectArrayCounts(s[k]);
        }
      }
    };
    collectArrayCounts(schema);
    const metadata = {
      [$storeSize]: size,
      [$storeMaps]: {},
      [$storeSubarrays]: {},
      [$storeRef]: $store,
      [$storeCursor]: 0,
      [$subarrayCursors]: Object.keys(TYPES).reduce((a, type) => __spreadProps(__spreadValues({}, a), {
        [type]: 0
      }), {}),
      [$storeFlattened]: [],
      [$storeArrayCounts]: arrayCounts
    };
    if (schema instanceof Object && Object.keys(schema).length) {
      const recursiveTransform = (a, k) => {
        if (typeof a[k] === "string") {
          a[k] = createTypeStore(a[k], size);
          createShadow(a[k], $queryShadow);
          createShadow(a[k], $serializeShadow);
          a[k][$storeBase] = () => stores[$store];
          metadata[$storeFlattened].push(a[k]);
        } else if (isArrayType(a[k])) {
          const [type, length] = a[k];
          a[k] = createArrayStore(metadata, type, length);
          a[k][$storeBase] = () => stores[$store];
          metadata[$storeFlattened].push(a[k]);
        } else if (a[k] instanceof Object) {
          a[k] = Object.keys(a[k]).reduce(recursiveTransform, a[k]);
        }
        return a;
      };
      stores[$store] = Object.assign(Object.keys(schema).reduce(recursiveTransform, schema), metadata);
      stores[$store][$storeBase] = () => stores[$store];
      return stores[$store];
    }
  };
  var SparseSet = () => {
    const dense = [];
    const sparse = [];
    const has = (val) => dense[sparse[val]] === val;
    const add = (val) => {
      if (has(val))
        return;
      sparse[val] = dense.push(val) - 1;
    };
    const remove = (val) => {
      if (!has(val))
        return;
      const index = sparse[val];
      const swapped = dense.pop();
      if (swapped !== val) {
        dense[index] = swapped;
        sparse[swapped] = index;
      }
    };
    return {
      add,
      remove,
      has,
      sparse,
      dense
    };
  };
  var resized = false;
  var setSerializationResized = (v) => {
    resized = v;
  };
  var newEntities = new Map();
  var $entityMasks = Symbol("entityMasks");
  var $entitySparseSet = Symbol("entitySparseSet");
  var $entityArray = Symbol("entityArray");
  var defaultSize = 1e5;
  var globalEntityCursor = 0;
  var globalSize = defaultSize;
  var threshold = globalSize - globalSize / 5;
  var resizeThreshold = () => threshold;
  var getGlobalSize = () => globalSize;
  var removed = [];
  var getDefaultSize = () => defaultSize;
  var getEntityCursor = () => globalEntityCursor;
  var eidToWorld = new Map();
  var addEntity = (world2) => {
    const eid = removed.length > 0 ? removed.shift() : globalEntityCursor++;
    world2[$entitySparseSet].add(eid);
    eidToWorld.set(eid, world2);
    if (globalEntityCursor >= resizeThreshold()) {
      const size = globalSize;
      const amount = Math.ceil(size / 2 / 4) * 4;
      const newSize = size + amount;
      globalSize = newSize;
      resizeWorlds(newSize);
      resizeComponents(newSize);
      setSerializationResized(true);
      console.info(`\u{1F47E} bitECS - resizing all worlds from ${size} to ${size + amount}`);
    }
    world2[$notQueries].forEach((q) => {
      const match = queryCheckEntity(world2, q, eid);
      if (match)
        queryAddEntity(q, eid);
    });
    return eid;
  };
  var removeEntity = (world2, eid) => {
    if (!world2[$entitySparseSet].has(eid))
      return;
    world2[$queries].forEach((q) => {
      queryRemoveEntity(world2, q, eid);
    });
    removed.push(eid);
    world2[$entitySparseSet].remove(eid);
    for (let i = 0; i < world2[$entityMasks].length; i++)
      world2[$entityMasks][i][eid] = 0;
  };
  function Changed(c) {
    return function QueryChanged() {
      return c;
    };
  }
  var $queries = Symbol("queries");
  var $notQueries = Symbol("notQueries");
  var $queryMap = Symbol("queryMap");
  var $dirtyQueries = Symbol("$dirtyQueries");
  var $queryComponents = Symbol("queryComponents");
  var registerQuery = (world2, query) => {
    const components2 = [];
    const notComponents = [];
    const changedComponents = [];
    query[$queryComponents].forEach((c) => {
      if (typeof c === "function") {
        const comp = c();
        if (!world2[$componentMap].has(comp))
          registerComponent(world2, comp);
        if (c.name === "QueryNot") {
          notComponents.push(comp);
        }
        if (c.name === "QueryChanged") {
          changedComponents.push(comp);
          components2.push(comp);
        }
      } else {
        if (!world2[$componentMap].has(c))
          registerComponent(world2, c);
        components2.push(c);
      }
    });
    const mapComponents = (c) => world2[$componentMap].get(c);
    const allComponents = components2.concat(notComponents).map(mapComponents);
    const sparseSet = SparseSet();
    const archetypes = [];
    const changed = [];
    const toRemove = [];
    const entered = [];
    const exited = [];
    const generations = allComponents.map((c) => c.generationId).reduce((a, v) => {
      if (a.includes(v))
        return a;
      a.push(v);
      return a;
    }, []);
    const reduceBitflags = (a, c) => {
      if (!a[c.generationId])
        a[c.generationId] = 0;
      a[c.generationId] |= c.bitflag;
      return a;
    };
    const masks = components2.map(mapComponents).reduce(reduceBitflags, {});
    const notMasks = notComponents.map(mapComponents).reduce((a, c) => {
      if (!a[c.generationId]) {
        a[c.generationId] = 0;
      }
      a[c.generationId] |= c.bitflag;
      return a;
    }, {});
    const hasMasks = allComponents.reduce(reduceBitflags, {});
    const flatProps = components2.filter((c) => !c[$tagStore]).map((c) => Object.getOwnPropertySymbols(c).includes($storeFlattened) ? c[$storeFlattened] : [c]).reduce((a, v) => a.concat(v), []);
    const shadows = flatProps.map((prop) => {
      const $ = Symbol();
      createShadow(prop, $);
      return prop[$];
    }, []);
    const q = Object.assign(sparseSet, {
      archetypes,
      changed,
      components: components2,
      notComponents,
      changedComponents,
      masks,
      notMasks,
      hasMasks,
      generations,
      flatProps,
      toRemove,
      entered,
      exited,
      shadows
    });
    world2[$queryMap].set(query, q);
    world2[$queries].add(q);
    components2.map(mapComponents).forEach((c) => {
      c.queries.add(q);
    });
    notComponents.map(mapComponents).forEach((c) => {
      c.notQueries.add(q);
    });
    if (notComponents.length)
      world2[$notQueries].add(q);
    for (let eid = 0; eid < getEntityCursor(); eid++) {
      if (!world2[$entitySparseSet].has(eid))
        continue;
      if (queryCheckEntity(world2, q, eid)) {
        queryAddEntity(q, eid);
      }
    }
  };
  var diff = (q, clearDiff) => {
    if (clearDiff)
      q.changed.length = 0;
    const {
      flatProps,
      shadows
    } = q;
    for (let i = 0; i < q.dense.length; i++) {
      const eid = q.dense[i];
      let dirty = false;
      for (let pid = 0; pid < flatProps.length; pid++) {
        const prop = flatProps[pid];
        const shadow = shadows[pid];
        if (ArrayBuffer.isView(prop[eid])) {
          for (let i2 = 0; i2 < prop[eid].length; i2++) {
            if (prop[eid][i2] !== prop[eid][$queryShadow][i2]) {
              dirty = true;
              prop[eid][$queryShadow][i2] = prop[eid][i2];
            }
          }
        } else {
          if (prop[eid] !== shadow[eid]) {
            dirty = true;
            shadow[eid] = prop[eid];
          }
        }
      }
      if (dirty)
        q.changed.push(eid);
    }
    return q.changed;
  };
  var defineQuery = (components2) => {
    if (components2 === void 0 || components2[$componentMap] !== void 0) {
      return (world2) => world2 ? world2[$entityArray] : components2[$entityArray];
    }
    const query = function(world2, clearDiff = true) {
      if (!world2[$queryMap].has(query))
        registerQuery(world2, query);
      const q = world2[$queryMap].get(query);
      queryCommitRemovals(q);
      if (q.changedComponents.length)
        return diff(q, clearDiff);
      return q.dense;
    };
    query[$queryComponents] = components2;
    return query;
  };
  var queryCheckEntity = (world2, q, eid) => {
    const {
      masks,
      notMasks,
      generations
    } = q;
    for (let i = 0; i < generations.length; i++) {
      const generationId = generations[i];
      const qMask = masks[generationId];
      const qNotMask = notMasks[generationId];
      const eMask = world2[$entityMasks][generationId][eid];
      if (qNotMask && (eMask & qNotMask) !== 0) {
        return false;
      }
      if (qMask && (eMask & qMask) !== qMask) {
        return false;
      }
    }
    return true;
  };
  var queryAddEntity = (q, eid) => {
    if (q.has(eid))
      return;
    q.add(eid);
    q.entered.push(eid);
  };
  var queryCommitRemovals = (q) => {
    while (q.toRemove.length) {
      q.remove(q.toRemove.pop());
    }
  };
  var commitRemovals = (world2) => {
    world2[$dirtyQueries].forEach(queryCommitRemovals);
    world2[$dirtyQueries].clear();
  };
  var queryRemoveEntity = (world2, q, eid) => {
    if (!q.has(eid))
      return;
    q.toRemove.push(eid);
    world2[$dirtyQueries].add(q);
    q.exited.push(eid);
  };
  var $componentMap = Symbol("componentMap");
  var components = [];
  var resizeComponents = (size) => {
    components.forEach((component) => resizeStore(component, size));
  };
  var defineComponent = (schema) => {
    const component = createStore(schema, getDefaultSize());
    if (schema && Object.keys(schema).length)
      components.push(component);
    return component;
  };
  var incrementBitflag = (world2) => {
    world2[$bitflag] *= 2;
    if (world2[$bitflag] >= __pow(2, 32)) {
      world2[$bitflag] = 1;
      world2[$entityMasks].push(new Uint32Array(world2[$size]));
    }
  };
  var registerComponent = (world2, component) => {
    if (!component)
      throw new Error(`\u{1F47E} bitECS - cannot register component as it is null or undefined.`);
    const queries = new Set();
    const notQueries = new Set();
    world2[$queries].forEach((q) => {
      if (q.components.includes(component)) {
        queries.add(q);
      } else if (q.notComponents.includes(component)) {
        notQueries.add(q);
      }
    });
    world2[$componentMap].set(component, {
      generationId: world2[$entityMasks].length - 1,
      bitflag: world2[$bitflag],
      store: component,
      queries,
      notQueries
    });
    if (component[$storeSize] < world2[$size]) {
      resizeStore(component, world2[$size]);
    }
    incrementBitflag(world2);
  };
  var hasComponent = (world2, component, eid) => {
    const registeredComponent = world2[$componentMap].get(component);
    if (!registeredComponent)
      return;
    const {
      generationId,
      bitflag
    } = registeredComponent;
    const mask = world2[$entityMasks][generationId][eid];
    return (mask & bitflag) === bitflag;
  };
  var addComponent = (world2, component, eid, reset = false) => {
    if (!Number.isInteger(eid)) {
      component = world2;
      world2 = eidToWorld.get(eid);
      reset = eid || reset;
    }
    if (!world2[$componentMap].has(component))
      registerComponent(world2, component);
    if (hasComponent(world2, component, eid))
      return;
    const c = world2[$componentMap].get(component);
    const {
      generationId,
      bitflag,
      queries,
      notQueries
    } = c;
    notQueries.forEach((q) => {
      const match = queryCheckEntity(world2, q, eid);
      if (match)
        queryRemoveEntity(world2, q, eid);
    });
    world2[$entityMasks][generationId][eid] |= bitflag;
    queries.forEach((q) => {
      const match = queryCheckEntity(world2, q, eid);
      if (match)
        queryAddEntity(q, eid);
    });
    if (reset)
      resetStoreFor(component, eid);
  };
  var removeComponent = (world2, component, eid, reset = true) => {
    if (!Number.isInteger(eid)) {
      component = world2;
      world2 = eidToWorld.get(eid);
      reset = eid || reset;
    }
    const c = world2[$componentMap].get(component);
    const {
      generationId,
      bitflag,
      queries,
      notQueries
    } = c;
    if (!(world2[$entityMasks][generationId][eid] & bitflag))
      return;
    queries.forEach((q) => {
      const match = queryCheckEntity(world2, q, eid);
      if (match)
        queryRemoveEntity(world2, q, eid);
    });
    world2[$entityMasks][generationId][eid] &= ~bitflag;
    notQueries.forEach((q) => {
      const match = queryCheckEntity(world2, q, eid);
      if (match)
        queryAddEntity(q, eid);
    });
    if (reset)
      resetStoreFor(component, eid);
  };
  var $size = Symbol("size");
  var $resizeThreshold = Symbol("resizeThreshold");
  var $bitflag = Symbol("bitflag");
  var $archetypes = Symbol("archetypes");
  var $localEntities = Symbol("localEntities");
  var worlds = [];
  var resizeWorlds = (size) => {
    worlds.forEach((world2) => {
      world2[$size] = size;
      for (let i = 0; i < world2[$entityMasks].length; i++) {
        const masks = world2[$entityMasks][i];
        world2[$entityMasks][i] = resize(masks, size);
      }
      world2[$resizeThreshold] = world2[$size] - world2[$size] / 5;
    });
  };
  var createWorld = () => {
    const world2 = {};
    resetWorld(world2);
    worlds.push(world2);
    return world2;
  };
  var resetWorld = (world2) => {
    const size = getGlobalSize();
    world2[$size] = size;
    if (world2[$entityArray])
      world2[$entityArray].forEach((eid) => removeEntity(world2, eid));
    world2[$entityMasks] = [new Uint32Array(size)];
    world2[$archetypes] = [];
    world2[$entitySparseSet] = SparseSet();
    world2[$entityArray] = world2[$entitySparseSet].dense;
    world2[$bitflag] = 1;
    world2[$componentMap] = new Map();
    world2[$queryMap] = new Map();
    world2[$queries] = new Set();
    world2[$notQueries] = new Set();
    world2[$dirtyQueries] = new Set();
    world2[$localEntities] = new Map();
    return world2;
  };
  var defineSystem = (fn1, fn2) => {
    const update = fn2 !== void 0 ? fn2 : fn1;
    const create = fn2 !== void 0 ? fn1 : void 0;
    const init = new Set();
    const system = (world2, ...args) => {
      if (create && !init.has(world2)) {
        create(world2, ...args);
        init.add(world2);
      }
      update(world2, ...args);
      commitRemovals(world2);
      return world2;
    };
    Object.defineProperty(system, "name", {
      value: (update.name || "AnonymousSystem") + "_internal",
      configurable: true
    });
    return system;
  };
  var Types = TYPES_ENUM;

  // ../phaser-genesis/src/GameObjectWorld.ts
  var world = createWorld();
  var GameObjectWorld = world;

  // ../phaser-genesis/src/components/hierarchy/HierarchyComponent.ts
  var Hierarchy = defineComponent({
    worldID: Types.ui32,
    parentID: Types.ui32,
    numChildren: Types.ui32,
    depth: Types.ui32,
    index: Types.ui32,
    worldDepth: Types.ui16
  });
  var HierarchyComponent = Hierarchy;

  // ../phaser-genesis/src/components/hierarchy/AddHierarchyComponent.ts
  function AddHierarchyComponent(id) {
    addComponent(GameObjectWorld, HierarchyComponent, id);
  }

  // ../phaser-genesis/src/gameobjects/GameObjectCache.ts
  var GameObjectCache = new Map();

  // ../phaser-genesis/src/components/dirty/DirtyComponent.ts
  var Dirty = defineComponent({
    child: Types.ui8,
    childCache: Types.ui8,
    displayList: Types.ui8,
    transform: Types.ui8
  });
  var DirtyComponent = Dirty;

  // ../phaser-genesis/src/components/dirty/AddDirtyComponent.ts
  function AddDirtyComponent(id) {
    addComponent(GameObjectWorld, DirtyComponent, id);
    DirtyComponent.transform[id] = 1;
  }

  // ../phaser-genesis/src/components/dirty/ClearDirtyChild.ts
  function ClearDirtyChild(id) {
    DirtyComponent.child[id] = 0;
  }

  // ../phaser-genesis/src/components/dirty/ClearDirtyDisplayList.ts
  function ClearDirtyDisplayList(id) {
    DirtyComponent.displayList[id] = 0;
  }

  // ../phaser-genesis/src/components/dirty/ClearDirtyTransform.ts
  function ClearDirtyTransform(id) {
    DirtyComponent.transform[id] = 0;
  }

  // ../phaser-genesis/src/components/dirty/HasDirtyChild.ts
  function HasDirtyChild(id) {
    return Boolean(DirtyComponent.child[id]);
  }

  // ../phaser-genesis/src/components/dirty/HasDirtyChildCache.ts
  function HasDirtyChildCache(id) {
    return Boolean(DirtyComponent.childCache[id]);
  }

  // ../phaser-genesis/src/components/dirty/HasDirtyDisplayList.ts
  function HasDirtyDisplayList(id) {
    return Boolean(DirtyComponent.displayList[id]);
  }

  // ../phaser-genesis/src/components/dirty/HasDirtyTransform.ts
  function HasDirtyTransform(id) {
    return Boolean(DirtyComponent.transform[id]);
  }

  // ../phaser-genesis/src/components/dirty/SetDirtyChild.ts
  function SetDirtyChild(id) {
    DirtyComponent.child[id] = 1;
  }

  // ../phaser-genesis/src/components/dirty/SetDirtyChildCache.ts
  function SetDirtyChildCache(id) {
    DirtyComponent.childCache[id] = 1;
  }

  // ../phaser-genesis/src/components/dirty/SetDirtyDisplayList.ts
  function SetDirtyDisplayList(id) {
    DirtyComponent.displayList[id] = 1;
  }

  // ../phaser-genesis/src/components/permissions/PermissionsComponent.ts
  var Permissions = defineComponent({
    visible: Types.ui8,
    visibleChildren: Types.ui8,
    willUpdate: Types.ui8,
    willUpdateChildren: Types.ui8,
    willRender: Types.ui8,
    willRenderChildren: Types.ui8,
    willCacheChildren: Types.ui8,
    willTransformChildren: Types.ui8,
    willColorChildren: Types.ui8
  });
  var PermissionsComponent = Permissions;

  // ../phaser-genesis/src/components/permissions/AddPermissionsComponent.ts
  function AddPermissionsComponent(id) {
    addComponent(GameObjectWorld, PermissionsComponent, id);
    PermissionsComponent.visible[id] = 1;
    PermissionsComponent.visibleChildren[id] = 1;
    PermissionsComponent.willUpdate[id] = 1;
    PermissionsComponent.willUpdateChildren[id] = 1;
    PermissionsComponent.willRender[id] = 1;
    PermissionsComponent.willRenderChildren[id] = 1;
    PermissionsComponent.willCacheChildren[id] = 0;
    PermissionsComponent.willTransformChildren[id] = 1;
    PermissionsComponent.willColorChildren[id] = 1;
  }

  // ../phaser-genesis/src/components/permissions/WillCacheChildren.ts
  function WillCacheChildren(id) {
    return Boolean(PermissionsComponent.willCacheChildren[id]);
  }

  // ../phaser-genesis/src/components/permissions/WillRender.ts
  function WillRender(id) {
    return Boolean(PermissionsComponent.visible[id]) && Boolean(PermissionsComponent.willRender[id]);
  }

  // ../phaser-genesis/src/components/permissions/WillRenderChildren.ts
  function WillRenderChildren(id) {
    return Boolean(PermissionsComponent.visibleChildren[id]) && Boolean(PermissionsComponent.willRenderChildren[id]);
  }

  // ../phaser-genesis/src/components/permissions/WillUpdate.ts
  function WillUpdate(id) {
    return Boolean(PermissionsComponent.willUpdate[id]);
  }

  // ../phaser-genesis/src/components/permissions/WillUpdateChildren.ts
  function WillUpdateChildren(id) {
    return Boolean(PermissionsComponent.willUpdateChildren[id]);
  }

  // ../phaser-genesis/src/components/dirty/SetDirtyParents.ts
  function SetDirtyParents(childID) {
    const parents = GetParents(childID);
    parents.forEach((id) => {
      if (WillCacheChildren(id)) {
        SetDirtyChildCache(id);
      }
    });
    SetDirtyDisplayList(GetWorldID(childID));
  }

  // ../phaser-genesis/src/components/dirty/SetDirtyTransform.ts
  function SetDirtyTransform(id) {
    DirtyComponent.transform[id] = 1;
  }

  // ../phaser-genesis/src/components/dirty/SetDirtyWorldDisplayList.ts
  function SetDirtyWorldDisplayList(id) {
    const worldID = HierarchyComponent.worldID[id];
    DirtyComponent.displayList[worldID] = 1;
  }

  // ../phaser-genesis/src/components/hierarchy/ClearWorldAndParentID.ts
  function ClearWorldAndParentID(id) {
    const worldID = GetWorldID(id);
    const parentID = GetParentID(id);
    const world2 = GameObjectCache.get(worldID);
    HierarchyComponent.worldID[id] = 0;
    HierarchyComponent.parentID[id] = 0;
    if (world2 && hasComponent(GameObjectWorld, world2.tag, id)) {
      removeComponent(GameObjectWorld, world2.tag, id);
    }
    UpdateNumChildren(parentID);
    SetDirtyParents(id);
  }

  // ../phaser-genesis/src/components/bounds/BoundsComponent.ts
  var Bounds = defineComponent({
    local: [Types.f32, 4],
    global: [Types.f32, 4],
    world: [Types.f32, 4]
  });
  var BoundsComponent = Bounds;

  // ../phaser-genesis/src/components/bounds/AddBoundsComponent.ts
  function AddBoundsComponent(id) {
    addComponent(GameObjectWorld, BoundsComponent, id);
  }

  // ../phaser-genesis/src/components/bounds/BoundsIntersects.ts
  function BoundsIntersects(id, x, y, right, bottom) {
    if (!hasComponent(GameObjectWorld, BoundsComponent, id)) {
      return true;
    }
    const global = BoundsComponent.global[id];
    const bx = global[0];
    const by = global[1];
    const br = global[2];
    const bb = global[3];
    return !(right < bx || bottom < by || x > br || y > bb);
  }

  // ../phaser-genesis/src/components/color/ColorComponent.ts
  var Color = defineComponent({
    r: Types.ui8c,
    g: Types.ui8c,
    b: Types.ui8c,
    a: Types.f32,
    colorMatrix: [Types.f32, 16],
    colorOffset: [Types.f32, 4]
  });
  var ColorComponent = Color;

  // ../phaser-genesis/src/colormatrix/consts.ts
  var DEFAULT_COLOR_MATRIX = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  var DEFAULT_COLOR_OFFSET = new Float32Array(4);

  // ../phaser-genesis/src/components/color/AddColorComponent.ts
  function AddColorComponent(id) {
    addComponent(GameObjectWorld, ColorComponent, id);
    ColorComponent.r[id] = 255;
    ColorComponent.g[id] = 255;
    ColorComponent.b[id] = 255;
    ColorComponent.a[id] = 1;
    ColorComponent.colorMatrix[id].set(DEFAULT_COLOR_MATRIX);
  }

  // ../phaser-genesis/src/components/color/CompareColorMatrix.ts
  function CompareColorMatrix(srcMatrix, srcOffset, targetMatrix, targetOffset) {
    for (let i = 0; i < srcOffset.length; i++) {
      if (srcOffset[i] !== targetOffset[i]) {
        return false;
      }
    }
    for (let i = 0; i < srcMatrix.length; i++) {
      if (srcMatrix[i] !== targetMatrix[i]) {
        return false;
      }
    }
    return true;
  }

  // ../phaser-genesis/src/components/vertices/QuadVertexComponent.ts
  var QuadVertex = defineComponent({
    values: [Types.f32, 54]
  });
  var QuadVertexComponent = QuadVertex;

  // ../phaser-genesis/src/components/vertices/AddQuadVertex.ts
  function AddQuadVertex(id, width = 0, height = 0, flipY = true) {
    addComponent(GameObjectWorld, QuadVertexComponent, id);
  }

  // ../phaser-genesis/src/components/vertices/SetQuadPosition.ts
  function SetQuadPosition(id, x0, y0, x1, y1, x2, y2, x3, y3) {
    const data = QuadVertexComponent.values[id];
    data[0] = x0;
    data[1] = y0;
    data[9] = x1;
    data[10] = y1;
    data[18] = x2;
    data[19] = y2;
    data[27] = x0;
    data[28] = y0;
    data[36] = x2;
    data[37] = y2;
    data[45] = x3;
    data[46] = y3;
  }

  // ../phaser-genesis/src/components/vertices/SetUV.ts
  function SetUV(id, u0, v0, u1, v1) {
    const data = QuadVertexComponent.values[id];
    data[2] = u0;
    data[3] = v0;
    data[11] = u0;
    data[12] = v1;
    data[20] = u1;
    data[21] = v1;
    data[29] = u0;
    data[30] = v0;
    data[38] = u1;
    data[39] = v1;
    data[47] = u1;
    data[48] = v0;
  }

  // ../phaser-genesis/src/components/transform/Extent2DComponent.ts
  var Extent2D = defineComponent({
    x: Types.f32,
    y: Types.f32,
    width: Types.f32,
    height: Types.f32,
    right: Types.f32,
    bottom: Types.f32
  });
  var Extent2DComponent = Extent2D;

  // ../phaser-genesis/src/components/transform/WorldMatrix2DComponent.ts
  var WorldMatrix2D = defineComponent({
    a: Types.f32,
    b: Types.f32,
    c: Types.f32,
    d: Types.f32,
    tx: Types.f32,
    ty: Types.f32
  });
  var WorldMatrix2DComponent = WorldMatrix2D;

  // ../phaser-genesis/src/components/vertices/UpdateVertexPositionSystem.ts
  var entities;
  var updateVertexPositionSystem = defineSystem((world2) => {
    for (let i = 0; i < entities.length; i++) {
      const id = entities[i];
      const a = WorldMatrix2DComponent.a[id];
      const b = WorldMatrix2DComponent.b[id];
      const c = WorldMatrix2DComponent.c[id];
      const d = WorldMatrix2DComponent.d[id];
      const tx = WorldMatrix2DComponent.tx[id];
      const ty = WorldMatrix2DComponent.ty[id];
      const x = Extent2DComponent.x[id];
      const y = Extent2DComponent.y[id];
      const right = Extent2DComponent.right[id];
      const bottom = Extent2DComponent.bottom[id];
      const x0 = x * a + y * c + tx;
      const y0 = x * b + y * d + ty;
      const x1 = x * a + bottom * c + tx;
      const y1 = x * b + bottom * d + ty;
      const x2 = right * a + bottom * c + tx;
      const y2 = right * b + bottom * d + ty;
      const x3 = right * a + y * c + tx;
      const y3 = right * b + y * d + ty;
      SetQuadPosition(id, x0, y0, x1, y1, x2, y2, x3, y3);
      const bx = Math.min(x0, x1, x2, x3);
      const by = Math.min(y0, y1, y2, y3);
      const br = Math.max(x0, x1, x2, x3);
      const bb = Math.max(y0, y1, y2, y3);
      const bounds = BoundsComponent.global[id];
      bounds[0] = bx;
      bounds[1] = by;
      bounds[2] = br;
      bounds[3] = bb;
    }
    return world2;
  });
  var UpdateVertexPositionSystem = (world2, query) => {
    entities = query(world2);
    const total = entities.length;
    if (total > 0) {
      updateVertexPositionSystem(world2);
    }
    return entities;
  };

  // ../phaser-genesis/src/components/vertices/SetQuadColor.ts
  function SetQuadColor(id, red, green, blue, alpha) {
    const data = QuadVertexComponent.values[id];
    data[5] = red;
    data[6] = green;
    data[7] = blue;
    data[8] = alpha;
    data[14] = red;
    data[15] = green;
    data[16] = blue;
    data[17] = alpha;
    data[23] = red;
    data[24] = green;
    data[25] = blue;
    data[26] = alpha;
    data[32] = red;
    data[33] = green;
    data[34] = blue;
    data[35] = alpha;
    data[41] = red;
    data[42] = green;
    data[43] = blue;
    data[44] = alpha;
    data[50] = red;
    data[51] = green;
    data[52] = blue;
    data[53] = alpha;
  }

  // ../phaser-genesis/src/components/color/PackQuadColorsSystem.ts
  var changedColorQuery = defineQuery([Changed(ColorComponent), QuadVertexComponent]);
  var packQuadColorsSystem = defineSystem((world2) => {
    const entities3 = changedColorQuery(world2);
    for (let i = 0; i < entities3.length; i++) {
      const id = entities3[i];
      const r = ColorComponent.r[id] / 255;
      const g = ColorComponent.g[id] / 255;
      const b = ColorComponent.b[id] / 255;
      const a = ColorComponent.a[id];
      SetQuadColor(id, r, g, b, a);
    }
    return world2;
  });
  var PackQuadColorsSystem = packQuadColorsSystem;

  // ../phaser-genesis/src/components/transform/LocalMatrix2DComponent.ts
  var LocalMatrix2D = defineComponent({
    a: Types.f32,
    b: Types.f32,
    c: Types.f32,
    d: Types.f32,
    tx: Types.f32,
    ty: Types.f32,
    dirty: Types.ui32
  });
  var LocalMatrix2DComponent = LocalMatrix2D;

  // ../phaser-genesis/src/components/transform/Transform2DComponent.ts
  var Transform2D = defineComponent({
    x: Types.f32,
    y: Types.f32,
    rotation: Types.f32,
    scaleX: Types.f32,
    scaleY: Types.f32,
    skewX: Types.f32,
    skewY: Types.f32,
    originX: Types.f32,
    originY: Types.f32
  });
  var Transform2DComponent = Transform2D;

  // ../phaser-genesis/src/components/transform/AddTransform2DComponent.ts
  function AddTransform2DComponent(id, x = 0, y = 0, originX = 0, originY = 0) {
    addComponent(GameObjectWorld, Transform2DComponent, id);
    addComponent(GameObjectWorld, Extent2DComponent, id);
    addComponent(GameObjectWorld, LocalMatrix2DComponent, id);
    addComponent(GameObjectWorld, WorldMatrix2DComponent, id);
    Transform2DComponent.x[id] = x;
    Transform2DComponent.y[id] = y;
    Transform2DComponent.scaleX[id] = 1;
    Transform2DComponent.scaleY[id] = 1;
    Transform2DComponent.originX[id] = originX;
    Transform2DComponent.originY[id] = originY;
    LocalMatrix2DComponent.a[id] = 1;
    LocalMatrix2DComponent.d[id] = 1;
    LocalMatrix2DComponent.tx[id] = x;
    LocalMatrix2DComponent.ty[id] = y;
    WorldMatrix2DComponent.a[id] = 1;
    WorldMatrix2DComponent.d[id] = 1;
    WorldMatrix2DComponent.tx[id] = x;
    WorldMatrix2DComponent.ty[id] = y;
  }

  // ../phaser-genesis/src/components/transform/GetVertices.ts
  function GetVertices(worldTransform, transformExtent) {
    const { a, b, c, d, tx, ty } = worldTransform;
    const { x, y, right, bottom } = transformExtent;
    const x0 = x * a + y * c + tx;
    const y0 = x * b + y * d + ty;
    const x1 = x * a + bottom * c + tx;
    const y1 = x * b + bottom * d + ty;
    const x2 = right * a + bottom * c + tx;
    const y2 = right * b + bottom * d + ty;
    const x3 = right * a + y * c + tx;
    const y3 = right * b + y * d + ty;
    return { x0, y0, x1, y1, x2, y2, x3, y3 };
  }

  // ../phaser-genesis/src/math/vec2/Vec2FromArray.ts
  function Vec2FromArray(dst, src = [], index = 0) {
    return dst.set(src[index], src[index + 1]);
  }

  // ../phaser-genesis/src/math/vec2/Vec2ToArray.ts
  function Vec2ToArray(v, dst = [], index = 0) {
    dst[index] = v.x;
    dst[index + 1] = v.y;
    return dst;
  }

  // ../phaser-genesis/src/math/vec2/Vec2.ts
  var Vec2 = class {
    constructor(x = 0, y = 0) {
      __publicField(this, "x");
      __publicField(this, "y");
      this.set(x, y);
    }
    set(x = 0, y = 0) {
      this.x = x;
      this.y = y;
      return this;
    }
    toArray(dst = [], index = 0) {
      return Vec2ToArray(this, dst, index);
    }
    fromArray(src, index = 0) {
      Vec2FromArray(this, src, index);
      return this;
    }
    toString() {
      return `{ x=${this.x}, y=${this.y} }`;
    }
  };

  // ../phaser-genesis/src/components/transform/InvalidateLocalMatrix2DComponent.ts
  function InvalidateLocalMatrix2DComponent(id) {
    if (hasComponent(GameObjectWorld, LocalMatrix2DComponent, id)) {
      LocalMatrix2DComponent.dirty[id]++;
    }
  }

  // ../phaser-genesis/src/components/transform/UpdateExtent.ts
  function UpdateExtent(id, width, height) {
    const x = -Transform2DComponent.originX[id] * width;
    const y = -Transform2DComponent.originY[id] * height;
    Extent2DComponent.x[id] = x;
    Extent2DComponent.y[id] = y;
    Extent2DComponent.width[id] = width;
    Extent2DComponent.height[id] = height;
    Extent2DComponent.right[id] = x + width;
    Extent2DComponent.bottom[id] = y + height;
    SetDirtyTransform(id);
  }

  // ../phaser-genesis/src/components/transform/Origin.ts
  var Origin = class {
    constructor(id, x = 0, y = 0) {
      __publicField(this, "id");
      this.id = id;
      this.x = x;
      this.y = y;
    }
    set(x, y = x) {
      const id = this.id;
      Transform2DComponent.originX[id] = x;
      Transform2DComponent.originY[id] = y;
      UpdateExtent(id, Extent2DComponent.width[id], Extent2DComponent.height[id]);
      return this;
    }
    set x(value) {
      const id = this.id;
      Transform2DComponent.originX[id] = value;
      UpdateExtent(id, Extent2DComponent.width[id], Extent2DComponent.height[id]);
    }
    get x() {
      return Transform2DComponent.originX[this.id];
    }
    set y(value) {
      const id = this.id;
      Transform2DComponent.originY[id] = value;
      UpdateExtent(id, Extent2DComponent.width[id], Extent2DComponent.height[id]);
    }
    get y() {
      return Transform2DComponent.originY[this.id];
    }
  };

  // ../phaser-genesis/src/components/transform/Position.ts
  var Position = class {
    constructor(id, x = 0, y = 0) {
      __publicField(this, "id");
      this.id = id;
      this.x = x;
      this.y = y;
    }
    set(x, y = x) {
      this.x = x;
      this.y = y;
      return this;
    }
    set x(value) {
      Transform2DComponent.x[this.id] = value;
    }
    get x() {
      return Transform2DComponent.x[this.id];
    }
    set y(value) {
      Transform2DComponent.y[this.id] = value;
    }
    get y() {
      return Transform2DComponent.y[this.id];
    }
  };

  // ../phaser-genesis/src/gameobjects/DIRTY_CONST.ts
  var DIRTY_CONST = {
    CLEAR: 0,
    TRANSFORM: 1,
    UPDATE: 2,
    CHILD_CACHE: 4,
    POST_RENDER: 8,
    COLORS: 16,
    BOUNDS: 32,
    TEXTURE: 64,
    FRAME: 128,
    ALPHA: 256,
    CHILD: 512,
    DEFAULT: 1 + 2 + 16 + 32,
    USER1: 536870912,
    USER2: 1073741824,
    USER3: 2147483648,
    USER4: 4294967296
  };

  // ../phaser-genesis/src/renderer/webgl1/colors/PackColors.ts
  function PackColors(vertices) {
    vertices.forEach((vertex) => {
      vertex.packColor();
    });
  }

  // ../phaser-genesis/src/components/transform/UpdateVertices.ts
  function UpdateVertices(vertices, worldTransform, transformExtent) {
    const { x0, y0, x1, y1, x2, y2, x3, y3 } = GetVertices(worldTransform, transformExtent);
    vertices[0].setPosition(x0, y0);
    vertices[1].setPosition(x1, y1);
    vertices[2].setPosition(x2, y2);
    vertices[3].setPosition(x3, y3);
  }

  // ../phaser-genesis/src/components/transform/PreRenderVertices.ts
  function PreRenderVertices(gameObject) {
    const vertices = gameObject.vertices;
    if (gameObject.isDirty(DIRTY_CONST.COLORS)) {
      PackColors(vertices);
      gameObject.clearDirty(DIRTY_CONST.COLORS);
    }
    if (gameObject.isDirty(DIRTY_CONST.TRANSFORM)) {
      UpdateVertices(vertices, gameObject.worldTransform, gameObject.transformExtent);
      gameObject.clearDirty(DIRTY_CONST.TRANSFORM);
    }
    return gameObject;
  }

  // ../phaser-genesis/src/components/transform/Scale.ts
  var Scale = class {
    constructor(id, x = 1, y = 1) {
      __publicField(this, "id");
      this.id = id;
      this.x = x;
      this.y = y;
    }
    set(x, y = x) {
      this.x = x;
      this.y = y;
      return this;
    }
    set x(value) {
      Transform2DComponent.scaleX[this.id] = value;
    }
    get x() {
      return Transform2DComponent.scaleX[this.id];
    }
    set y(value) {
      Transform2DComponent.scaleY[this.id] = value;
    }
    get y() {
      return Transform2DComponent.scaleY[this.id];
    }
  };

  // ../phaser-genesis/src/components/transform/SetExtent.ts
  function SetExtent(id, x, y, width, height) {
    Extent2DComponent.x[id] = x;
    Extent2DComponent.y[id] = y;
    Extent2DComponent.width[id] = width;
    Extent2DComponent.height[id] = height;
    Extent2DComponent.right[id] = x + width;
    Extent2DComponent.bottom[id] = y + height;
    SetDirtyTransform(id);
  }

  // ../phaser-genesis/src/components/transform/Size.ts
  var Size = class {
    constructor(id, width = 0, height = 0) {
      __publicField(this, "id");
      this.id = id;
      this.set(width, height);
    }
    set(width, height = width) {
      this.width = width;
      this.height = height;
      return this;
    }
    set width(value) {
      UpdateExtent(this.id, value, this.height);
    }
    get width() {
      return Extent2DComponent.width[this.id];
    }
    set height(value) {
      UpdateExtent(this.id, this.width, value);
    }
    get height() {
      return Extent2DComponent.height[this.id];
    }
    set x(value) {
      this.width = value;
    }
    get x() {
      return this.width;
    }
    set y(value) {
      this.height = value;
    }
    get y() {
      return this.height;
    }
  };

  // ../phaser-genesis/src/components/transform/Skew.ts
  var Skew = class {
    constructor(id, x = 0, y = 0) {
      __publicField(this, "id");
      this.id = id;
      this.x = x;
      this.y = y;
    }
    set(x, y = x) {
      this.x = x;
      this.y = y;
      return this;
    }
    set x(value) {
      Transform2DComponent.skewX[this.id] = value;
    }
    get x() {
      return Transform2DComponent.skewX[this.id];
    }
    set y(value) {
      Transform2DComponent.skewY[this.id] = value;
    }
    get y() {
      return Transform2DComponent.skewY[this.id];
    }
  };

  // ../phaser-genesis/src/components/transform/UpdateLocalTransform2DSystem.ts
  var entities2;
  var updateLocalTransformSystem = defineSystem((world2) => {
    let prevParent = 0;
    for (let i = 0; i < entities2.length; i++) {
      const id = entities2[i];
      const x = Transform2DComponent.x[id];
      const y = Transform2DComponent.y[id];
      const rotation = Transform2DComponent.rotation[id];
      const scaleX = Transform2DComponent.scaleX[id];
      const scaleY = Transform2DComponent.scaleY[id];
      const skewX = Transform2DComponent.skewX[id];
      const skewY = Transform2DComponent.skewY[id];
      LocalMatrix2DComponent.a[id] = Math.cos(rotation + skewY) * scaleX;
      LocalMatrix2DComponent.b[id] = Math.sin(rotation + skewY) * scaleX;
      LocalMatrix2DComponent.c[id] = -Math.sin(rotation - skewX) * scaleY;
      LocalMatrix2DComponent.d[id] = Math.cos(rotation - skewX) * scaleY;
      LocalMatrix2DComponent.tx[id] = x;
      LocalMatrix2DComponent.ty[id] = y;
      SetDirtyTransform(id);
      if (GetParentID(id) !== prevParent) {
        SetDirtyParents(id);
        prevParent = GetParentID(id);
      }
    }
    return world2;
  });
  var UpdateLocalTransform2DSystem = (world2, query) => {
    entities2 = query(world2);
    const total = entities2.length;
    if (total > 0) {
      SetDirtyChild(world2.id);
      updateLocalTransformSystem(world2);
    }
    return total;
  };

  // ../phaser-genesis/src/components/transform/CopyLocalToWorld.ts
  function CopyLocalToWorld(source, target) {
    WorldMatrix2DComponent.a[target] = LocalMatrix2DComponent.a[source];
    WorldMatrix2DComponent.b[target] = LocalMatrix2DComponent.b[source];
    WorldMatrix2DComponent.c[target] = LocalMatrix2DComponent.c[source];
    WorldMatrix2DComponent.d[target] = LocalMatrix2DComponent.d[source];
    WorldMatrix2DComponent.tx[target] = LocalMatrix2DComponent.tx[source];
    WorldMatrix2DComponent.ty[target] = LocalMatrix2DComponent.ty[source];
  }

  // ../phaser-genesis/src/components/transform/CopyWorldToWorld.ts
  function CopyWorldToWorld(source, target) {
    WorldMatrix2DComponent.a[target] = WorldMatrix2DComponent.a[source];
    WorldMatrix2DComponent.b[target] = WorldMatrix2DComponent.b[source];
    WorldMatrix2DComponent.c[target] = WorldMatrix2DComponent.c[source];
    WorldMatrix2DComponent.d[target] = WorldMatrix2DComponent.d[source];
    WorldMatrix2DComponent.tx[target] = WorldMatrix2DComponent.tx[source];
    WorldMatrix2DComponent.ty[target] = WorldMatrix2DComponent.ty[source];
  }

  // ../phaser-genesis/src/components/transform/MultiplyLocalWithWorld.ts
  function MultiplyLocalWithWorld(parentID, id) {
    const pa = WorldMatrix2DComponent.a[parentID];
    const pb = WorldMatrix2DComponent.b[parentID];
    const pc = WorldMatrix2DComponent.c[parentID];
    const pd = WorldMatrix2DComponent.d[parentID];
    const ptx = WorldMatrix2DComponent.tx[parentID];
    const pty = WorldMatrix2DComponent.ty[parentID];
    const a = LocalMatrix2DComponent.a[id];
    const b = LocalMatrix2DComponent.b[id];
    const c = LocalMatrix2DComponent.c[id];
    const d = LocalMatrix2DComponent.d[id];
    const tx = LocalMatrix2DComponent.tx[id];
    const ty = LocalMatrix2DComponent.ty[id];
    WorldMatrix2DComponent.a[id] = a * pa + b * pc;
    WorldMatrix2DComponent.b[id] = a * pb + b * pd;
    WorldMatrix2DComponent.c[id] = c * pa + d * pc;
    WorldMatrix2DComponent.d[id] = c * pb + d * pd;
    WorldMatrix2DComponent.tx[id] = tx * pa + ty * pc + ptx;
    WorldMatrix2DComponent.ty[id] = tx * pb + ty * pd + pty;
  }

  // ../phaser-genesis/src/components/permissions/WillTransformChildren.ts
  function WillTransformChildren(id) {
    return Boolean(PermissionsComponent.willTransformChildren[id]);
  }

  // ../phaser-genesis/src/components/transform/UpdateWorldTransform.ts
  function UpdateWorldTransform(id) {
    const parentID = GetParentID(id);
    if (!hasComponent(GameObjectWorld, Transform2DComponent, parentID)) {
      CopyLocalToWorld(id, id);
    } else if (!WillTransformChildren(id)) {
      CopyWorldToWorld(parentID, id);
    } else {
      MultiplyLocalWithWorld(parentID, id);
    }
    ClearDirtyTransform(id);
  }

  // ../phaser-genesis/src/components/transform/UpdateWorldTransform2DSystem.ts
  var changedWorldTransformQuery = defineQuery([Changed(LocalMatrix2DComponent)]);
  var updateWorldTransformSystem = defineSystem((world2) => {
    const entities3 = changedWorldTransformQuery(world2);
    for (let i = 0; i < entities3.length; i++) {
      const id = entities3[i];
      const gameObject = GameObjectCache.get(id);
      const parent = gameObject.parent;
      if (!parent) {
        CopyLocalToWorld(id, id);
      } else if (!WillTransformChildren(id)) {
        CopyWorldToWorld(parent.id, id);
      } else {
        MultiplyLocalWithWorld(parent.id, id);
      }
    }
    return world2;
  });

  // ../phaser-genesis/src/renderer/webgl1/draw/GetQuadBuffer.ts
  function GetQuadBuffer() {
    return new Float32Array([
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      0,
      0
    ]);
  }

  // ../phaser-genesis/src/renderer/webgl1/draw/BatchQuad.ts
  var buffer = GetQuadBuffer();
  function BatchQuad(F32, offset, textureIndex, x1, y1, x2, y2, x3, y3, x4, y4, r, g, b, a) {
    buffer[0] = x1;
    buffer[1] = y1;
    buffer[4] = textureIndex;
    buffer[5] = r;
    buffer[6] = g;
    buffer[7] = b;
    buffer[8] = a;
    buffer[9] = x2;
    buffer[10] = y2;
    buffer[13] = textureIndex;
    buffer[14] = r;
    buffer[15] = g;
    buffer[16] = b;
    buffer[17] = a;
    buffer[18] = x3;
    buffer[19] = y3;
    buffer[22] = textureIndex;
    buffer[23] = r;
    buffer[24] = g;
    buffer[25] = b;
    buffer[26] = a;
    buffer[27] = x1;
    buffer[28] = y1;
    buffer[31] = textureIndex;
    buffer[32] = r;
    buffer[33] = g;
    buffer[34] = b;
    buffer[35] = a;
    buffer[36] = x3;
    buffer[37] = y3;
    buffer[40] = textureIndex;
    buffer[41] = r;
    buffer[42] = g;
    buffer[43] = b;
    buffer[44] = a;
    buffer[45] = x4;
    buffer[46] = y4;
    buffer[49] = textureIndex;
    buffer[50] = r;
    buffer[51] = g;
    buffer[52] = b;
    buffer[53] = a;
    F32.set(buffer, offset);
    return offset + 54;
  }

  // ../phaser-genesis/src/renderer/webgl1/GL.ts
  var gl;
  var GL = {
    get: () => {
      return gl;
    },
    set: (context) => {
      gl = context;
    }
  };

  // ../phaser-genesis/src/renderer/webgl1/renderpass/Draw.ts
  function Draw(renderPass) {
    const count = renderPass.count;
    if (count === 0) {
      return;
    }
    const currentBuffer = renderPass.vertexbuffer.current;
    const currentShader = renderPass.shader.current;
    const renderToFramebuffer = currentShader.shader.renderToFramebuffer;
    if (renderToFramebuffer) {
      renderPass.framebuffer.set(currentShader.shader.framebuffer, true);
    }
    if (count === currentBuffer.batchSize) {
      const type = currentBuffer.isDynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW;
      gl.bufferData(gl.ARRAY_BUFFER, currentBuffer.data, type);
    } else {
      const subsize = count * currentBuffer.entryElementSize;
      const view = currentBuffer.vertexViewF32.subarray(0, subsize);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, view);
    }
    if (currentBuffer.indexed) {
      gl.drawElements(gl.TRIANGLES, count * currentBuffer.entryIndexSize, gl.UNSIGNED_SHORT, 0);
    } else {
      gl.drawArrays(gl.TRIANGLES, 0, count * currentBuffer.elementsPerEntry);
    }
    if (renderToFramebuffer) {
      renderPass.framebuffer.pop();
    }
  }

  // ../phaser-genesis/src/renderer/webgl1/renderpass/Flush.ts
  function Flush(renderPass, forceCount) {
    if (forceCount) {
      renderPass.count = forceCount;
    }
    const count = renderPass.count;
    if (count === 0) {
      return false;
    }
    Draw(renderPass);
    renderPass.flush();
    return true;
  }

  // ../phaser-genesis/src/renderer/webgl1/renderpass/GetVertexBufferEntry.ts
  var bufferEntry = {
    buffer: null,
    F32: null,
    offset: 0
  };
  function GetVertexBufferEntry(renderPass, addToCount = 0) {
    const buffer4 = renderPass.vertexbuffer.current;
    if (renderPass.count + addToCount >= buffer4.batchSize) {
      Flush(renderPass);
    }
    bufferEntry.buffer = buffer4;
    bufferEntry.F32 = buffer4.vertexViewF32;
    bufferEntry.offset = renderPass.count * buffer4.entryElementSize;
    renderPass.count += addToCount;
    return bufferEntry;
  }

  // ../phaser-genesis/src/renderer/webgl1/draw/BatchTexturedQuad.ts
  var buffer2 = GetQuadBuffer();
  function BatchTexturedQuad(F32, offset, textureIndex, x1, y1, x2, y2, x3, y3, x4, y4, u0, v0, u1, v1, r, g, b, a) {
    buffer2[0] = x1;
    buffer2[1] = y1;
    buffer2[2] = u0;
    buffer2[3] = v0;
    buffer2[4] = textureIndex;
    buffer2[5] = r;
    buffer2[6] = g;
    buffer2[7] = b;
    buffer2[8] = a;
    buffer2[9] = x2;
    buffer2[10] = y2;
    buffer2[11] = u0;
    buffer2[12] = v1;
    buffer2[13] = textureIndex;
    buffer2[14] = r;
    buffer2[15] = g;
    buffer2[16] = b;
    buffer2[17] = a;
    buffer2[18] = x3;
    buffer2[19] = y3;
    buffer2[20] = u1;
    buffer2[21] = v1;
    buffer2[22] = textureIndex;
    buffer2[23] = r;
    buffer2[24] = g;
    buffer2[25] = b;
    buffer2[26] = a;
    buffer2[27] = x1;
    buffer2[28] = y1;
    buffer2[29] = u0;
    buffer2[30] = v0;
    buffer2[31] = textureIndex;
    buffer2[32] = r;
    buffer2[33] = g;
    buffer2[34] = b;
    buffer2[35] = a;
    buffer2[36] = x3;
    buffer2[37] = y3;
    buffer2[38] = u1;
    buffer2[39] = v1;
    buffer2[40] = textureIndex;
    buffer2[41] = r;
    buffer2[42] = g;
    buffer2[43] = b;
    buffer2[44] = a;
    buffer2[45] = x4;
    buffer2[46] = y4;
    buffer2[47] = u1;
    buffer2[48] = v0;
    buffer2[49] = textureIndex;
    buffer2[50] = r;
    buffer2[51] = g;
    buffer2[52] = b;
    buffer2[53] = a;
    F32.set(buffer2, offset);
    return offset + 54;
  }

  // ../phaser-genesis/src/components/vertices/SetQuadTextureIndex.ts
  function SetQuadTextureIndex(id, textureIndex) {
    const data = QuadVertexComponent.values[id];
    if (data[4] !== textureIndex) {
      data[4] = textureIndex;
      data[13] = textureIndex;
      data[22] = textureIndex;
      data[31] = textureIndex;
      data[40] = textureIndex;
      data[49] = textureIndex;
    }
  }

  // ../phaser-genesis/src/renderer/webgl1/draw/BatchTexturedQuadBuffer.ts
  function BatchTexturedQuadBuffer(texture, id, renderPass) {
    const { F32, offset } = GetVertexBufferEntry(renderPass, 2);
    const textureIndex = renderPass.textures.set(texture);
    SetQuadTextureIndex(id, textureIndex);
    F32.set(QuadVertexComponent.values[id], offset);
  }

  // ../phaser-genesis/src/renderer/webgl1/draw/GetTriBuffer.ts
  function GetTriBuffer() {
    return new Float32Array([
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      0,
      0
    ]);
  }

  // ../phaser-genesis/src/renderer/webgl1/draw/BatchTriangle.ts
  var buffer3 = GetTriBuffer();
  function BatchTriangle(F32, offset, textureIndex, x1, y1, x2, y2, x3, y3, r, g, b, a) {
    buffer3[0] = x1;
    buffer3[1] = y1;
    buffer3[4] = textureIndex;
    buffer3[5] = r;
    buffer3[6] = g;
    buffer3[7] = b;
    buffer3[8] = a;
    buffer3[9] = x2;
    buffer3[10] = y2;
    buffer3[13] = textureIndex;
    buffer3[14] = r;
    buffer3[15] = g;
    buffer3[16] = b;
    buffer3[17] = a;
    buffer3[18] = x3;
    buffer3[19] = y3;
    buffer3[22] = textureIndex;
    buffer3[23] = r;
    buffer3[24] = g;
    buffer3[25] = b;
    buffer3[26] = a;
    F32.set(buffer3, offset);
    return offset + 27;
  }

  // ../phaser-genesis/src/renderer/webgl1/draw/DrawFrame.ts
  function DrawFrame(renderPass, texture, frame2, x, y, alpha = 1, scaleX = 1, scaleY = 1) {
    const { F32, offset } = GetVertexBufferEntry(renderPass, 2);
    frame2 = texture.getFrame(frame2);
    const textureIndex = renderPass.textures.set(texture);
    const displayWidth = frame2.width * scaleX;
    const displayHeight = frame2.height * scaleY;
    BatchTexturedQuad(F32, offset, textureIndex, x, y, x, y + displayHeight, x + displayWidth, y + displayHeight, x + displayWidth, y, frame2.u0, frame2.v0, frame2.u1, frame2.v1, 1, 1, 1, alpha);
  }

  // ../phaser-genesis/src/renderer/webgl1/draw/DrawImage.ts
  function DrawImage(renderPass, texture, x, y, alpha = 1, scaleX = 1, scaleY = 1) {
    const { F32, offset } = GetVertexBufferEntry(renderPass, 2);
    const frame2 = texture.firstFrame;
    const textureIndex = renderPass.textures.set(texture);
    const displayWidth = frame2.width * scaleX;
    const displayHeight = frame2.height * scaleY;
    BatchTexturedQuad(F32, offset, textureIndex, x, y, x, y + displayHeight, x + displayWidth, y + displayHeight, x + displayWidth, y, frame2.u0, frame2.v0, frame2.u1, frame2.v1, 1, 1, 1, alpha);
  }

  // ../phaser-genesis/src/math/const.ts
  var MATH_CONST = {
    PI2: Math.PI * 2,
    HALF_PI: Math.PI * 0.5,
    EPSILON: 1e-6,
    DEG_TO_RAD: Math.PI / 180,
    RAD_TO_DEG: 180 / Math.PI,
    MIN_SAFE_INTEGER: Number.MIN_SAFE_INTEGER || -9007199254740991,
    MAX_SAFE_INTEGER: Number.MAX_SAFE_INTEGER || 9007199254740991
  };

  // ../phaser-genesis/src/math/easing/back/In.ts
  function In(v, overshoot = 1.70158) {
    return v * v * ((overshoot + 1) * v - overshoot);
  }

  // ../phaser-genesis/src/math/easing/back/InOut.ts
  function InOut(v, overshoot = 1.70158) {
    const s = overshoot * 1.525;
    if ((v *= 2) < 1) {
      return 0.5 * (v * v * ((s + 1) * v - s));
    } else {
      return 0.5 * ((v -= 2) * v * ((s + 1) * v + s) + 2);
    }
  }

  // ../phaser-genesis/src/math/easing/back/Out.ts
  function Out(v, overshoot = 1.70158) {
    return --v * v * ((overshoot + 1) * v + overshoot) + 1;
  }

  // ../phaser-genesis/src/math/easing/bounce/In.ts
  function In2(v) {
    v = 1 - v;
    if (v < 1 / 2.75) {
      return 1 - 7.5625 * v * v;
    } else if (v < 2 / 2.75) {
      return 1 - (7.5625 * (v -= 1.5 / 2.75) * v + 0.75);
    } else if (v < 2.5 / 2.75) {
      return 1 - (7.5625 * (v -= 2.25 / 2.75) * v + 0.9375);
    } else {
      return 1 - (7.5625 * (v -= 2.625 / 2.75) * v + 0.984375);
    }
  }

  // ../phaser-genesis/src/math/easing/bounce/InOut.ts
  function InOut2(v) {
    let reverse = false;
    if (v < 0.5) {
      v = 1 - v * 2;
      reverse = true;
    } else {
      v = v * 2 - 1;
    }
    if (v < 1 / 2.75) {
      v = 7.5625 * v * v;
    } else if (v < 2 / 2.75) {
      v = 7.5625 * (v -= 1.5 / 2.75) * v + 0.75;
    } else if (v < 2.5 / 2.75) {
      v = 7.5625 * (v -= 2.25 / 2.75) * v + 0.9375;
    } else {
      v = 7.5625 * (v -= 2.625 / 2.75) * v + 0.984375;
    }
    if (reverse) {
      return (1 - v) * 0.5;
    } else {
      return v * 0.5 + 0.5;
    }
  }

  // ../phaser-genesis/src/math/easing/bounce/Out.ts
  function Out2(v) {
    if (v < 1 / 2.75) {
      return 7.5625 * v * v;
    } else if (v < 2 / 2.75) {
      return 7.5625 * (v -= 1.5 / 2.75) * v + 0.75;
    } else if (v < 2.5 / 2.75) {
      return 7.5625 * (v -= 2.25 / 2.75) * v + 0.9375;
    } else {
      return 7.5625 * (v -= 2.625 / 2.75) * v + 0.984375;
    }
  }

  // ../phaser-genesis/src/math/easing/circular/In.ts
  function In3(v) {
    return 1 - Math.sqrt(1 - v * v);
  }

  // ../phaser-genesis/src/math/easing/circular/InOut.ts
  function InOut3(v) {
    if ((v *= 2) < 1) {
      return -0.5 * (Math.sqrt(1 - v * v) - 1);
    } else {
      return 0.5 * (Math.sqrt(1 - (v -= 2) * v) + 1);
    }
  }

  // ../phaser-genesis/src/math/easing/circular/Out.ts
  function Out3(v) {
    return Math.sqrt(1 - --v * v);
  }

  // ../phaser-genesis/src/math/easing/cubic/In.ts
  function In4(v) {
    return v * v * v;
  }

  // ../phaser-genesis/src/math/easing/cubic/InOut.ts
  function InOut4(v) {
    if ((v *= 2) < 1) {
      return 0.5 * v * v * v;
    } else {
      return 0.5 * ((v -= 2) * v * v + 2);
    }
  }

  // ../phaser-genesis/src/math/easing/cubic/Out.ts
  function Out4(v) {
    return --v * v * v + 1;
  }

  // ../phaser-genesis/src/math/easing/elastic/In.ts
  function In5(v, amplitude = 0.1, period = 0.1) {
    if (v === 0) {
      return 0;
    } else if (v === 1) {
      return 1;
    } else {
      let s = period / 4;
      if (amplitude < 1) {
        amplitude = 1;
      } else {
        s = period * Math.asin(1 / amplitude) / (2 * Math.PI);
      }
      return -(amplitude * Math.pow(2, 10 * (v -= 1)) * Math.sin((v - s) * (2 * Math.PI) / period));
    }
  }

  // ../phaser-genesis/src/math/easing/elastic/InOut.ts
  function InOut5(v, amplitude = 0.1, period = 0.1) {
    if (v === 0) {
      return 0;
    } else if (v === 1) {
      return 1;
    } else {
      let s = period / 4;
      if (amplitude < 1) {
        amplitude = 1;
      } else {
        s = period * Math.asin(1 / amplitude) / (2 * Math.PI);
      }
      if ((v *= 2) < 1) {
        return -0.5 * (amplitude * Math.pow(2, 10 * (v -= 1)) * Math.sin((v - s) * (2 * Math.PI) / period));
      } else {
        return amplitude * Math.pow(2, -10 * (v -= 1)) * Math.sin((v - s) * (2 * Math.PI) / period) * 0.5 + 1;
      }
    }
  }

  // ../phaser-genesis/src/math/easing/elastic/Out.ts
  function Out5(v, amplitude = 0.1, period = 0.1) {
    if (v === 0) {
      return 0;
    } else if (v === 1) {
      return 1;
    } else {
      let s = period / 4;
      if (amplitude < 1) {
        amplitude = 1;
      } else {
        s = period * Math.asin(1 / amplitude) / (2 * Math.PI);
      }
      return amplitude * Math.pow(2, -10 * v) * Math.sin((v - s) * (2 * Math.PI) / period) + 1;
    }
  }

  // ../phaser-genesis/src/math/easing/expo/In.ts
  function In6(v) {
    return Math.pow(2, 10 * (v - 1)) - 1e-3;
  }

  // ../phaser-genesis/src/math/easing/expo/InOut.ts
  function InOut6(v) {
    if (v == 0) {
      return 0;
    }
    if (v == 1) {
      return 1;
    }
    if ((v *= 2) < 1) {
      return 0.5 * Math.pow(2, 10 * (v - 1));
    } else {
      return 0.5 * (2 - Math.pow(2, -10 * (v - 1)));
    }
  }

  // ../phaser-genesis/src/math/easing/expo/Out.ts
  function Out6(v) {
    return 1 - Math.pow(2, -10 * v);
  }

  // ../phaser-genesis/src/math/easing/quadratic/In.ts
  function In7(v) {
    return v * v;
  }

  // ../phaser-genesis/src/math/easing/quadratic/InOut.ts
  function InOut7(v) {
    if ((v *= 2) < 1) {
      return 0.5 * v * v;
    } else {
      return -0.5 * (--v * (v - 2) - 1);
    }
  }

  // ../phaser-genesis/src/math/easing/quadratic/Out.ts
  function Out7(v) {
    return v * (2 - v);
  }

  // ../phaser-genesis/src/math/easing/quartic/In.ts
  function In8(v) {
    return v * v * v * v;
  }

  // ../phaser-genesis/src/math/easing/quartic/InOut.ts
  function InOut8(v) {
    if ((v *= 2) < 1) {
      return 0.5 * v * v * v * v;
    } else {
      return -0.5 * ((v -= 2) * v * v * v - 2);
    }
  }

  // ../phaser-genesis/src/math/easing/quartic/Out.ts
  function Out8(v) {
    return -(--v * v * v * v - 1);
  }

  // ../phaser-genesis/src/math/easing/quintic/In.ts
  function In9(v) {
    return v * v * v * v * v;
  }

  // ../phaser-genesis/src/math/easing/quintic/InOut.ts
  function InOut9(v) {
    if ((v *= 2) < 1) {
      return 0.5 * v * v * v * v * v;
    } else {
      return 0.5 * ((v -= 2) * v * v * v * v + 2);
    }
  }

  // ../phaser-genesis/src/math/easing/quintic/Out.ts
  function Out9(v) {
    return (v = v - 1) * v * v * v * v + 1;
  }

  // ../phaser-genesis/src/math/easing/sine/In.ts
  function In10(v) {
    if (v === 0) {
      return 0;
    } else if (v === 1) {
      return 1;
    } else {
      return 1 - Math.cos(v * Math.PI / 2);
    }
  }

  // ../phaser-genesis/src/math/easing/sine/InOut.ts
  function InOut10(v) {
    if (v === 0) {
      return 0;
    } else if (v === 1) {
      return 1;
    } else {
      return 0.5 * (1 - Math.cos(Math.PI * v));
    }
  }

  // ../phaser-genesis/src/math/easing/sine/Out.ts
  function Out10(v) {
    if (v === 0) {
      return 0;
    } else if (v === 1) {
      return 1;
    } else {
      return Math.sin(v * Math.PI / 2);
    }
  }

  // ../phaser-genesis/src/math/easing/Linear.ts
  function Linear(v) {
    return v;
  }

  // ../phaser-genesis/src/math/easing/Stepped.ts
  function Stepped(v, steps = 1) {
    if (v <= 0) {
      return 0;
    } else if (v >= 1) {
      return 1;
    } else {
      return ((steps * v | 0) + 1) * (1 / steps);
    }
  }

  // ../phaser-genesis/src/math/easing/GetEase.ts
  var EaseMap = new Map([
    ["power0", Linear],
    ["power1", Out7],
    ["power2", Out4],
    ["power3", Out8],
    ["power4", Out9],
    ["linear", Linear],
    ["quad", Out7],
    ["cubic", Out4],
    ["quart", Out8],
    ["quint", Out9],
    ["sine", Out10],
    ["expo", Out6],
    ["circ", Out3],
    ["elastic", Out5],
    ["back", Out],
    ["bounce", Out2],
    ["stepped", Stepped],
    ["quad.in", In7],
    ["cubic.in", In4],
    ["quart.in", In8],
    ["quint.in", In9],
    ["sine.in", In10],
    ["expo.in", In6],
    ["circ.in", In3],
    ["elastic.in", In5],
    ["back.in", In],
    ["bounce.in", In2],
    ["quad.out", Out7],
    ["cubic.out", Out4],
    ["quart.out", Out8],
    ["quint.out", Out9],
    ["sine.out", Out10],
    ["expo.out", Out6],
    ["circ.out", Out3],
    ["elastic.out", Out5],
    ["back.out", Out],
    ["bounce.out", Out2],
    ["quad.inout", InOut7],
    ["cubic.inout", InOut4],
    ["quart.inout", InOut8],
    ["quint.inout", InOut9],
    ["sine.inout", InOut10],
    ["expo.inout", InOut6],
    ["circ.inout", InOut3],
    ["elastic.inout", InOut5],
    ["back.inout", InOut],
    ["bounce.inout", InOut2]
  ]);

  // ../phaser-genesis/src/math/mat2d/Matrix2D.ts
  var Matrix2D = class {
    constructor(a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0) {
      __publicField(this, "a");
      __publicField(this, "b");
      __publicField(this, "c");
      __publicField(this, "d");
      __publicField(this, "tx");
      __publicField(this, "ty");
      this.set(a, b, c, d, tx, ty);
    }
    set(a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0) {
      this.a = a;
      this.b = b;
      this.c = c;
      this.d = d;
      this.tx = tx;
      this.ty = ty;
      return this;
    }
    identity() {
      return this.set();
    }
    toArray() {
      const { a, b, c, d, tx, ty } = this;
      return [a, b, c, d, tx, ty];
    }
    fromArray(src) {
      return this.set(src[0], src[1], src[2], src[3], src[4], src[5]);
    }
  };

  // ../phaser-genesis/src/math/mat2d/Mat2dAppend.ts
  function Mat2dAppend(mat1, mat2, out = new Matrix2D()) {
    const { a: a1, b: b1, c: c1, d: d1, tx: tx1, ty: ty1 } = mat1;
    const { a: a2, b: b2, c: c2, d: d2, tx: tx2, ty: ty2 } = mat2;
    return out.set(a2 * a1 + b2 * c1, a2 * b1 + b2 * d1, c2 * a1 + d2 * c1, c2 * b1 + d2 * d1, tx2 * a1 + ty2 * c1 + tx1, tx2 * b1 + ty2 * d1 + ty1);
  }

  // ../phaser-genesis/src/math/mat2d/Mat2dGlobalToLocal.ts
  function Mat2dGlobalToLocal(mat, x, y, out = new Vec2()) {
    const { a, b, c, d, tx, ty } = mat;
    const id = 1 / (a * d + c * -b);
    return out.set(d * id * x + -c * id * y + (ty * c - tx * d) * id, a * id * y + -b * id * x + (-ty * a + tx * b) * id);
  }

  // ../phaser-genesis/src/utils/base64/Base64ToArrayBuffer.ts
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }

  // ../phaser-genesis/src/utils/NOOP.ts
  function NOOP() {
  }

  // ../phaser-genesis/src/math/mat4/Matrix4.ts
  var Matrix4 = class {
    constructor(src) {
      __publicField(this, "data");
      __publicField(this, "onChange");
      const data = new Float32Array(16);
      this.data = data;
      this.onChange = NOOP;
      if (src) {
        if (Array.isArray(src)) {
          this.fromArray(src);
        } else {
          this.fromArray(src.data);
        }
      } else {
        data[0] = 1;
        data[5] = 1;
        data[10] = 1;
        data[15] = 1;
      }
    }
    set(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
      const data = this.data;
      data[0] = m00;
      data[1] = m01;
      data[2] = m02;
      data[3] = m03;
      data[4] = m10;
      data[5] = m11;
      data[6] = m12;
      data[7] = m13;
      data[8] = m20;
      data[9] = m21;
      data[10] = m22;
      data[11] = m23;
      data[12] = m30;
      data[13] = m31;
      data[14] = m32;
      data[15] = m33;
      this.onChange(this);
      return this;
    }
    toArray(dst = [], index = 0) {
      const data = this.data;
      for (let i = 0; i < 16; i++) {
        dst[index + i] = data[i];
      }
      return dst;
    }
    fromArray(src, index = 0) {
      const data = this.data;
      for (let i = 0; i < 16; i++) {
        data[i] = src[index + i];
      }
      this.onChange(this);
      return this;
    }
    toString() {
      return "[ mat4=" + this.data.join(", ") + " ]";
    }
    destroy() {
      this.onChange = NOOP;
      this.data = null;
    }
  };

  // ../phaser-genesis/src/math/vec3/Vec3.ts
  var Vec3 = class {
    constructor(x = 0, y = 0, z = 0) {
      __publicField(this, "x");
      __publicField(this, "y");
      __publicField(this, "z");
      this.set(x, y, z);
    }
    set(x = 0, y = 0, z = 0) {
      this.x = x;
      this.y = y;
      this.z = z;
      return this;
    }
    toArray(dst = [], index = 0) {
      const { x, y, z } = this;
      dst[index] = x;
      dst[index + 1] = y;
      dst[index + 2] = z;
      return dst;
    }
    fromArray(src, index = 0) {
      return this.set(src[index], src[index + 1], src[index + 2]);
    }
    toString() {
      const { x, y, z } = this;
      return `{ x=${x}, y=${y}, z=${z} }`;
    }
  };

  // ../phaser-genesis/src/math/mat4/Mat4Identity.ts
  function Mat4Identity(matrix2 = new Matrix4()) {
    return matrix2.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }

  // ../phaser-genesis/src/math/mat4/Mat4Ortho.ts
  function Mat4Ortho(left, right, bottom, top, near, far, out = new Matrix4()) {
    const lr = 1 / (left - right);
    const bt = 1 / (bottom - top);
    const nf = 1 / (near - far);
    return out.set(-2 * lr, 0, 0, 0, 0, -2 * bt, 0, 0, 0, 0, 2 * nf, 0, (left + right) * lr, (top + bottom) * bt, (far + near) * nf, 1);
  }

  // ../phaser-genesis/src/math/pow2/IsSizePowerOfTwo.ts
  function IsSizePowerOfTwo(width, height) {
    if (width < 1 || height < 1) {
      return false;
    }
    return (width & width - 1) === 0 && (height & height - 1) === 0;
  }

  // ../phaser-genesis/src/math/Clamp.ts
  function Clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  // ../phaser-genesis/src/math/vec3/Vec3Backward.ts
  function Vec3Backward() {
    return new Vec3(0, 0, -1);
  }

  // ../phaser-genesis/src/math/vec3/Vec3Down.ts
  function Vec3Down() {
    return new Vec3(0, -1, 0);
  }

  // ../phaser-genesis/src/math/vec3/Vec3Forward.ts
  function Vec3Forward() {
    return new Vec3(0, 0, 1);
  }

  // ../phaser-genesis/src/math/vec3/Vec3Left.ts
  function Vec3Left() {
    return new Vec3(-1, 0, 0);
  }

  // ../phaser-genesis/src/math/vec3/Vec3Right.ts
  function Vec3Right() {
    return new Vec3(1, 0, 0);
  }

  // ../phaser-genesis/src/math/vec3/Vec3Up.ts
  function Vec3Up() {
    return new Vec3(0, 1, 0);
  }

  // ../phaser-genesis/src/math/vec3/Vec3Zero.ts
  function Vec3Zero() {
    return new Vec3(0, 0, 0);
  }

  // ../phaser-genesis/src/math/vec3/const.ts
  var UP = Vec3Up();
  var DOWN = Vec3Down();
  var LEFT = Vec3Left();
  var RIGHT = Vec3Right();
  var FORWARD = Vec3Forward();
  var BACKWARD = Vec3Backward();
  var ZERO = Vec3Zero();

  // ../phaser-genesis/src/math/vec3/Vec3Project.ts
  var tempMatrix1 = new Matrix4();
  var tempMatrix2 = new Matrix4();

  // ../phaser-genesis/src/math/vec3/Vec3Unproject.ts
  var matrix = new Matrix4();
  var screenSource = new Vec3();

  // ../phaser-genesis/src/math/FromPercent.ts
  function FromPercent(percent, min, max) {
    percent = Clamp(percent, 0, 1);
    return (max - min) * percent;
  }

  // ../phaser-genesis/src/renderer/webgl1/draw/DrawImagePart.ts
  function DrawImagePart(renderPass, texture, x0, y0, x1, y1, dx, dy, dw, dh, alpha = 1) {
    const { F32, offset } = GetVertexBufferEntry(renderPass, 2);
    const frame2 = texture.firstFrame;
    const textureIndex = renderPass.textures.set(texture);
    const frameWidth = frame2.width;
    const frameHeight = frame2.height;
    x0 = Clamp(x0, 0, frameWidth);
    x1 = Clamp(x1, x0, frameWidth);
    y0 = Clamp(y0, 0, frameHeight);
    y1 = Clamp(y1, y0, frameHeight);
    const uRange = frame2.u1 - frame2.u0;
    const vRange = frame2.v1 - frame2.v0;
    const u0 = frame2.u0 + uRange * (x0 / frameWidth);
    const v0 = frame2.v0 + vRange * (y0 / frameHeight);
    const u1 = frame2.u0 + uRange * (x1 / frameWidth);
    const v1 = frame2.v0 + vRange * (y1 / frameHeight);
    if (dw === void 0 || dw === null) {
      dw = x1 - x0;
    }
    if (dh === void 0 || dh === null) {
      dh = y1 - y0;
    }
    BatchTexturedQuad(F32, offset, textureIndex, dx, dy, dx, dy + dh, dx + dw, dy + dh, dx + dw, dy, u0, v0, u1, v1, 1, 1, 1, alpha);
  }

  // ../phaser-genesis/src/renderer/webgl1/draw/DrawQuad.ts
  function DrawQuad(renderPass, texture, frame2, x0, y0, x1, y1, x2, y2, x3, y3, alpha = 1) {
    const { F32, offset } = GetVertexBufferEntry(renderPass, 2);
    frame2 = texture.getFrame(frame2);
    const textureIndex = renderPass.textures.set(texture);
    BatchTexturedQuad(F32, offset, textureIndex, x0, y0, x1, y1, x2, y2, x3, y3, frame2.u0, frame2.v0, frame2.u1, frame2.v1, 1, 1, 1, alpha);
  }

  // ../phaser-genesis/src/renderer/webgl1/renderpass/Begin.ts
  function Begin(renderPass, camera2D) {
    renderPass.current2DCamera = camera2D;
    renderPass.cameraMatrix = camera2D.matrix;
    renderPass.shader.bindDefault();
  }

  // ../phaser-genesis/src/renderer/webgl1/renderpass/End.ts
  function End(renderPass) {
    Flush(renderPass);
  }

  // ../phaser-genesis/src/renderer/BindingQueue.ts
  var queue = [];
  var BindingQueue = {
    add: (texture, glConfig) => {
      queue.push({ texture, glConfig });
    },
    get: () => {
      return queue;
    },
    clear: () => {
      queue.length = 0;
    }
  };

  // ../phaser-genesis/src/renderer/webgl1/fbo/CreateFramebuffer.ts
  function CreateFramebuffer(texture, attachment) {
    if (!attachment) {
      attachment = gl.COLOR_ATTACHMENT0;
    }
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, attachment, gl.TEXTURE_2D, texture, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return framebuffer;
  }

  // ../phaser-genesis/src/renderer/webgl1/textures/CreateGLTexture.ts
  function CreateGLTexture(binding, mipmaps) {
    const { generateMipmap, minFilter, parent, compressed, internalFormat, flipY, unpackPremultiplyAlpha, magFilter, wrapS, wrapT, isPOT } = binding;
    const source = parent.image;
    let width = parent.width;
    let height = parent.height;
    const glTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, glTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, unpackPremultiplyAlpha);
    if (source) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      width = source.width;
      height = source.height;
    } else if (compressed && mipmaps) {
      for (let i = 0; i < mipmaps.length; i++) {
        gl.compressedTexImage2D(gl.TEXTURE_2D, i, internalFormat, mipmaps[i].width, mipmaps[i].height, 0, mipmaps[i].data);
      }
    } else {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);
    if (generateMipmap && isPOT) {
      gl.generateMipmap(gl.TEXTURE_2D);
    }
    binding.texture = glTexture;
    return glTexture;
  }

  // ../phaser-genesis/src/renderer/webgl1/fbo/DeleteFramebuffer.ts
  function DeleteFramebuffer(framebuffer) {
    if (gl && gl.isFramebuffer(framebuffer)) {
      gl.deleteFramebuffer(framebuffer);
    }
  }

  // ../phaser-genesis/src/renderer/webgl1/textures/DeleteGLTexture.ts
  function DeleteGLTexture(texture) {
    if (gl.isTexture(texture)) {
      gl.deleteTexture(texture);
    }
  }

  // ../phaser-genesis/src/renderer/webgl1/textures/SetGLTextureFilterMode.ts
  function SetGLTextureFilterMode(texture, linear = true) {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    const mode = linear ? gl.LINEAR : gl.NEAREST;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mode);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, mode);
  }

  // ../phaser-genesis/src/renderer/webgl1/textures/UpdateGLTexture.ts
  function UpdateGLTexture(binding) {
    const source = binding.parent.image;
    const width = source.width;
    const height = source.height;
    if (width > 0 && height > 0) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, binding.texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, binding.flipY);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    }
    return binding.texture;
  }

  // ../phaser-genesis/src/renderer/webgl1/textures/GLTextureBinding.ts
  var GLTextureBinding = class {
    constructor(parent, config = {}) {
      __publicField(this, "parent");
      __publicField(this, "texture");
      __publicField(this, "framebuffer");
      __publicField(this, "depthbuffer");
      __publicField(this, "format");
      __publicField(this, "internalFormat");
      __publicField(this, "compressed");
      __publicField(this, "mipmaps");
      __publicField(this, "isBound", false);
      __publicField(this, "textureUnit", 0);
      __publicField(this, "unpackPremultiplyAlpha", true);
      __publicField(this, "minFilter");
      __publicField(this, "magFilter");
      __publicField(this, "wrapS");
      __publicField(this, "wrapT");
      __publicField(this, "flipY", false);
      __publicField(this, "isPOT", false);
      __publicField(this, "generateMipmap", false);
      this.parent = parent;
      this.isPOT = IsSizePowerOfTwo(parent.width, parent.height);
      const {
        mipmaps = null,
        compressed = false,
        format = "IMG",
        internalFormat = 0,
        texture = null,
        framebuffer = null,
        createFramebuffer = false,
        depthbuffer = null,
        unpackPremultiplyAlpha = true,
        minFilter = this.isPOT ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR,
        magFilter = gl.LINEAR,
        wrapS = gl.CLAMP_TO_EDGE,
        wrapT = gl.CLAMP_TO_EDGE,
        generateMipmap = this.isPOT,
        flipY = false
      } = config;
      this.compressed = compressed;
      this.format = format;
      this.internalFormat = internalFormat;
      this.mipmaps = mipmaps;
      if (compressed) {
        this.minFilter = gl.LINEAR;
      } else {
        this.minFilter = minFilter;
      }
      this.magFilter = magFilter;
      this.wrapS = wrapS;
      this.wrapT = wrapT;
      this.generateMipmap = generateMipmap;
      this.flipY = flipY;
      this.unpackPremultiplyAlpha = unpackPremultiplyAlpha;
      if (texture) {
        this.texture = texture;
      } else {
        CreateGLTexture(this, mipmaps);
      }
      if (framebuffer) {
        this.framebuffer = framebuffer;
      } else if (createFramebuffer) {
        this.framebuffer = CreateFramebuffer(this.texture);
      }
      if (depthbuffer) {
        this.depthbuffer = depthbuffer;
      }
      parent.binding = this;
    }
    setFilter(linear) {
      if (this.texture) {
        SetGLTextureFilterMode(this.texture, linear);
      }
    }
    create() {
      const texture = this.texture;
      if (texture) {
        DeleteGLTexture(texture);
      }
      return CreateGLTexture(this);
    }
    update() {
      const texture = this.texture;
      if (!texture) {
        return CreateGLTexture(this);
      } else {
        return UpdateGLTexture(this);
      }
    }
    bind(index) {
      this.isBound = true;
      this.textureUnit = index;
    }
    unbind() {
      this.isBound = false;
      this.textureUnit = 0;
    }
    destroy() {
      this.unbind();
      DeleteGLTexture(this.texture);
      DeleteFramebuffer(this.framebuffer);
      this.parent = null;
      this.texture = null;
      this.framebuffer = null;
    }
  };

  // ../phaser-genesis/src/renderer/webgl1/renderpass/ProcessBindingQueue.ts
  function ProcessBindingQueue() {
    const queue2 = BindingQueue.get();
    queue2.forEach((entry) => {
      const { texture, glConfig } = entry;
      if (!texture.binding) {
        texture.binding = new GLTextureBinding(texture, glConfig);
      }
    });
    BindingQueue.clear();
  }

  // ../phaser-genesis/src/renderer/webgl1/renderpass/BlendModeStack.ts
  var BlendModeStack = class {
    constructor(renderPass) {
      __publicField(this, "renderPass");
      __publicField(this, "stack");
      __publicField(this, "default");
      __publicField(this, "index");
      this.renderPass = renderPass;
      this.stack = [];
    }
    get current() {
      return this.stack[this.index];
    }
    add(enable, sfactor, dfactor) {
      const entry = { enable, sfactor, dfactor };
      this.index++;
      if (this.index === this.stack.length) {
        this.stack.push(entry);
      } else {
        this.stack[this.index] = entry;
      }
      return entry;
    }
    bindDefault() {
      this.index = 0;
      this.bind(this.default);
    }
    bind(entry) {
      if (!entry) {
        entry = this.current;
      }
      if (entry.enable) {
        if (!gl.isEnabled(gl.BLEND) || (this.current.sfactor !== entry.sfactor || this.current.dfactor !== entry.dfactor)) {
          gl.enable(gl.BLEND);
          gl.blendFunc(entry.sfactor, entry.dfactor);
        }
      } else {
        gl.disable(gl.BLEND);
      }
    }
    pop() {
      this.index--;
      this.bind();
    }
    set(enable, sfactor, dfactor) {
      const entry = this.add(enable, sfactor, dfactor);
      this.bind(entry);
    }
    setDefault(enable, sfactor, dfactor) {
      const entry = { enable, sfactor, dfactor };
      this.stack[0] = entry;
      this.index = 0;
      this.default = entry;
    }
  };

  // ../phaser-genesis/src/renderer/webgl1/renderpass/ColorMatrixStack.ts
  var ColorMatrixStack = class {
    constructor(renderPass) {
      __publicField(this, "renderPass");
      __publicField(this, "stack");
      __publicField(this, "default");
      __publicField(this, "index");
      this.renderPass = renderPass;
      this.stack = [];
    }
    get current() {
      return this.stack[this.index];
    }
    add(colorMatrix, colorOffset) {
      const entry = { colorMatrix, colorOffset };
      this.index++;
      if (this.index === this.stack.length) {
        this.stack.push(entry);
      } else {
        this.stack[this.index] = entry;
      }
      return entry;
    }
    bindDefault() {
      this.index = 0;
      this.bind(this.default);
    }
    bind(entry) {
      if (!entry) {
        entry = this.current;
      }
      const shader = this.renderPass.getCurrentShader();
      Flush(this.renderPass);
      shader.setUniform("uColorMatrix", entry.colorMatrix);
      shader.setUniform("uColorOffset", entry.colorOffset);
    }
    pop() {
      this.index--;
      this.bind();
    }
    set(color) {
      const current = this.current;
      const entry = this.add(color.colorMatrix, color.colorOffset);
      if (!CompareColorMatrix(entry.colorMatrix, entry.colorOffset, current.colorMatrix, current.colorOffset)) {
        this.bind(entry);
      }
    }
    setDefault(colorMatrix, colorOffset) {
      const entry = { colorMatrix, colorOffset };
      this.stack[0] = entry;
      this.index = 0;
      this.default = entry;
    }
  };

  // ../phaser-genesis/src/renderer/webgl1/renderpass/FramebufferStack.ts
  var FramebufferStack = class {
    constructor(renderPass) {
      __publicField(this, "renderPass");
      __publicField(this, "stack");
      __publicField(this, "active");
      __publicField(this, "default");
      __publicField(this, "index");
      this.renderPass = renderPass;
      this.stack = [];
    }
    get current() {
      return this.stack[this.index];
    }
    add(framebuffer, viewport) {
      const entry = { framebuffer, viewport };
      this.index++;
      if (this.index === this.stack.length) {
        this.stack.push(entry);
      } else {
        this.stack[this.index] = entry;
      }
      return entry;
    }
    bindDefault() {
      this.index = 0;
      this.bind(false, this.default);
    }
    bind(clear = true, entry) {
      if (!entry) {
        entry = this.current;
      }
      const { framebuffer, viewport } = entry;
      if (this.active !== framebuffer) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      }
      if (clear) {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      }
      if (viewport) {
        this.renderPass.viewport.set(viewport.x, viewport.y, viewport.width, viewport.height);
      }
      this.active = framebuffer;
    }
    pop() {
      if (this.current.viewport) {
        this.renderPass.viewport.pop();
      }
      this.index--;
      this.bind(false);
    }
    set(framebuffer, clear = true, viewport) {
      const entry = this.add(framebuffer, viewport);
      this.bind(clear, entry);
    }
    setDefault(framebuffer = null, viewport) {
      const entry = { framebuffer, viewport };
      this.stack[0] = entry;
      this.index = 0;
      this.default = entry;
    }
  };

  // ../phaser-genesis/src/config/const.ts
  var CONFIG_DEFAULTS = {
    AUTO: "Auto",
    BACKGROUND_COLOR: "BackgroundColor",
    BANNER: "Banner",
    BATCH_SIZE: "BatchSize",
    CANVAS_CONTEXT: "CanvasContext",
    CANVAS: "Canvas",
    DEFAULT_ORIGIN: "DefaultOrigin",
    GLOBAL_VAR: "GlobalVar",
    MAX_TEXTURES: "MaxTextures",
    PARENT: "Parent",
    RENDERER: "Renderer",
    SCENES: "Scenes",
    SIZE: "Size",
    WEBGL_CONTEXT: "WebGLContext",
    WEBGL: "WebGL",
    WORLD_SIZE: "WorldSize"
  };

  // ../phaser-genesis/src/config/ConfigStore.ts
  var ConfigStore = new Map();

  // ../phaser-genesis/src/config/batchsize/GetBatchSize.ts
  function GetBatchSize() {
    return ConfigStore.get(CONFIG_DEFAULTS.BATCH_SIZE);
  }

  // ../phaser-genesis/src/config/maxtextures/GetMaxTextures.ts
  function GetMaxTextures() {
    return ConfigStore.get(CONFIG_DEFAULTS.MAX_TEXTURES);
  }

  // ../phaser-genesis/src/config/maxtextures/SetMaxTextures.ts
  function SetMaxTextures(max) {
    ConfigStore.set(CONFIG_DEFAULTS.MAX_TEXTURES, max);
  }

  // ../phaser-genesis/src/renderer/webgl1/buffers/DeleteGLBuffer.ts
  function DeleteGLBuffer(buffer4) {
    if (gl.isBuffer(buffer4)) {
      gl.deleteBuffer(buffer4);
    }
  }

  // ../phaser-genesis/src/renderer/webgl1/buffers/VertexBuffer.ts
  var VertexBuffer = class {
    constructor(config = {}) {
      __publicField(this, "name");
      __publicField(this, "batchSize");
      __publicField(this, "dataSize");
      __publicField(this, "vertexElementSize");
      __publicField(this, "vertexByteSize");
      __publicField(this, "entryByteSize");
      __publicField(this, "bufferByteSize");
      __publicField(this, "data");
      __publicField(this, "vertexViewF32");
      __publicField(this, "vertexBuffer");
      __publicField(this, "entryElementSize");
      __publicField(this, "indexed", false);
      __publicField(this, "isDynamic", false);
      __publicField(this, "count", 0);
      __publicField(this, "offset", 0);
      __publicField(this, "elementsPerEntry");
      __publicField(this, "isBound", false);
      const {
        name = "VBO",
        batchSize = 1,
        dataSize = 4,
        isDynamic = true,
        elementsPerEntry = 3,
        vertexElementSize = 9
      } = config;
      this.name = name;
      this.batchSize = batchSize;
      this.dataSize = dataSize;
      this.vertexElementSize = vertexElementSize;
      this.isDynamic = isDynamic;
      this.elementsPerEntry = elementsPerEntry;
      this.vertexByteSize = vertexElementSize * dataSize;
      this.entryByteSize = this.vertexByteSize * elementsPerEntry;
      this.bufferByteSize = batchSize * this.entryByteSize;
      this.entryElementSize = this.vertexElementSize * this.elementsPerEntry;
      this.create();
    }
    resize(batchSize) {
      this.batchSize = batchSize;
      this.bufferByteSize = batchSize * this.entryByteSize;
      if (this.vertexBuffer) {
        DeleteGLBuffer(this.vertexBuffer);
      }
      this.create();
    }
    create() {
      const data = new ArrayBuffer(this.bufferByteSize);
      this.data = data;
      this.vertexViewF32 = new Float32Array(data);
      this.vertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      const type = this.isDynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW;
      gl.bufferData(gl.ARRAY_BUFFER, data, type);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      this.isBound = false;
    }
    add(count) {
      this.count += count;
      this.offset += this.vertexElementSize * count;
    }
    reset() {
      this.count = 0;
      this.offset = 0;
    }
    canContain(count) {
      return this.count + count <= this.batchSize;
    }
    free() {
      return Math.max(0, 1 - this.count / this.batchSize);
    }
    bind() {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    }
    destroy() {
      DeleteGLBuffer(this.vertexBuffer);
      this.data = null;
      this.vertexViewF32 = null;
      this.vertexBuffer = null;
    }
  };

  // ../phaser-genesis/src/renderer/webgl1/buffers/IndexedVertexBuffer.ts
  var IndexedVertexBuffer = class extends VertexBuffer {
    constructor(config = {}) {
      super(config);
      __publicField(this, "indexSize");
      __publicField(this, "entryIndexSize");
      __publicField(this, "index");
      __publicField(this, "indexBuffer");
      __publicField(this, "indexLayout");
      const {
        indexSize = 4,
        entryIndexSize = 6,
        indexLayout = null
      } = config;
      this.indexed = true;
      this.indexSize = indexSize;
      this.entryIndexSize = entryIndexSize;
      const seededIndexBuffer = [];
      if (indexLayout) {
        this.indexLayout = indexLayout;
        for (let i = 0; i < this.batchSize * indexSize; i += indexSize) {
          for (let c = 0; c < indexLayout.length; c++) {
            seededIndexBuffer.push(i + indexLayout[c]);
          }
        }
      }
      this.createIndexBuffer(seededIndexBuffer);
    }
    createIndexBuffer(seededIndex) {
      this.index = new Uint16Array(seededIndex);
      this.indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.index, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
      seededIndex = [];
    }
    bind() {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    }
    destroy() {
      super.destroy();
      DeleteGLBuffer(this.indexBuffer);
      this.index = null;
      this.indexLayout = null;
      this.indexBuffer = null;
    }
  };

  // ../phaser-genesis/src/renderer/webgl1/GL_CONST.ts
  var BYTE = 5120;
  var UNSIGNED_BYTE = 5121;
  var SHORT = 5122;
  var UNSIGNED_SHORT = 5123;
  var FLOAT = 5126;

  // ../phaser-genesis/src/renderer/webgl1/shaders/CreateAttributes.ts
  function CreateAttributes(program, attribs) {
    const attributes = new Map();
    const defaultSettings = {
      size: 1,
      type: FLOAT,
      normalized: false,
      stride: 0
    };
    let offset = 0;
    for (const [name, entry] of Object.entries(attribs)) {
      const index = gl.getAttribLocation(program, name);
      if (index !== -1) {
        gl.enableVertexAttribArray(index);
        const {
          size = defaultSettings.size,
          type = defaultSettings.type,
          normalized = defaultSettings.normalized,
          stride = defaultSettings.stride
        } = entry;
        attributes.set(name, { index, size, type, normalized, stride, offset });
        let typeSize = 4;
        if (type === UNSIGNED_SHORT || type === SHORT) {
          typeSize = 2;
        } else if (type === UNSIGNED_BYTE || type === BYTE) {
          typeSize = 1;
        }
        offset += size * typeSize;
      }
    }
    return attributes;
  }

  // ../phaser-genesis/src/renderer/webgl1/shaders/DeleteShaders.ts
  function DeleteShaders(...shaders) {
    shaders.forEach((shader) => {
      gl.deleteShader(shader);
    });
  }

  // ../phaser-genesis/src/renderer/webgl1/shaders/CreateProgram.ts
  function CreateProgram(...shaders) {
    const program = gl.createProgram();
    shaders.forEach((shader) => {
      gl.attachShader(program, shader);
    });
    gl.linkProgram(program);
    const status = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!status) {
      const info = gl.getProgramInfoLog(program);
      console.error(`Error linking program: ${info}`);
      gl.deleteProgram(program);
      DeleteShaders(...shaders);
      return null;
    }
    return program;
  }

  // ../phaser-genesis/src/renderer/webgl1/shaders/CreateShader.ts
  function CreateShader(source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const status = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!status) {
      const info = gl.getShaderInfoLog(shader);
      const sourceLines = source.split("\n").map((line, index) => {
        return `${index}: ${line}`;
      });
      console.error(`Error compiling shader: ${info}`, sourceLines.join("\n"));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  // ../phaser-genesis/src/renderer/webgl1/shaders/CreateUniformSetter.ts
  function CreateUniformSetter(uniform, location, isArray = false) {
    switch (uniform.type) {
      case gl.INT:
      case gl.BOOL: {
        if (isArray) {
          return (v) => {
            gl.uniform1iv(location, v);
          };
        } else {
          return (v) => {
            gl.uniform1i(location, v);
          };
        }
      }
      case gl.INT_VEC2:
      case gl.BOOL_VEC2: {
        return (v) => {
          gl.uniform2iv(location, v);
        };
      }
      case gl.INT_VEC3:
      case gl.BOOL_VEC3: {
        return (v) => {
          gl.uniform3iv(location, v);
        };
      }
      case gl.INT_VEC4:
      case gl.BOOL_VEC4: {
        return (v) => {
          gl.uniform4iv(location, v);
        };
      }
      case gl.FLOAT: {
        if (isArray) {
          return (v) => {
            gl.uniform1fv(location, v);
          };
        } else {
          return (v) => {
            gl.uniform1f(location, v);
          };
        }
      }
      case gl.FLOAT_VEC2: {
        return (v) => {
          gl.uniform2fv(location, v);
        };
      }
      case gl.FLOAT_VEC3: {
        return (v) => {
          gl.uniform3fv(location, v);
        };
      }
      case gl.FLOAT_VEC4: {
        return (v) => {
          gl.uniform4fv(location, v);
        };
      }
      case gl.FLOAT_MAT2: {
        return (v) => {
          gl.uniformMatrix2fv(location, false, v);
        };
      }
      case gl.FLOAT_MAT3: {
        return (v) => {
          gl.uniformMatrix3fv(location, false, v);
        };
      }
      case gl.FLOAT_MAT4: {
        return (v) => {
          gl.uniformMatrix4fv(location, false, v);
        };
      }
      case gl.SAMPLER_2D:
      case gl.SAMPLER_CUBE: {
        if (uniform.size > 1) {
          return (v) => {
            gl.uniform1iv(location, v);
          };
        } else {
          return (v) => {
            gl.uniform1i(location, v);
          };
        }
      }
    }
  }

  // ../phaser-genesis/src/renderer/webgl1/shaders/CreateUniforms.ts
  function CreateUniforms(program) {
    const uniforms = new Map();
    const total = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < total; i++) {
      const uniform = gl.getActiveUniform(program, i);
      let name = uniform.name;
      if (name.startsWith("gl_") || name.startsWith("webgl_")) {
        continue;
      }
      const location = gl.getUniformLocation(program, name);
      if (location) {
        let isArray = false;
        if (name.endsWith("[0]")) {
          name = name.slice(0, -3);
          isArray = uniform.size > 1;
        }
        uniforms.set(name, CreateUniformSetter(uniform, location, isArray));
      }
    }
    return uniforms;
  }

  // ../phaser-genesis/src/renderer/webgl1/shaders/DefaultQuadAttributes.ts
  var DefaultQuadAttributes = {
    aVertexPosition: { size: 2 },
    aTextureCoord: { size: 2 },
    aTextureId: { size: 1 },
    aTintColor: { size: 4 }
  };

  // ../phaser-genesis/src/renderer/webgl1/shaders/DefaultQuadUniforms.ts
  var DefaultQuadUniforms = {
    uProjectionMatrix: new Float32Array(16),
    uCameraMatrix: new Float32Array(16),
    uTexture: 0,
    uColorMatrix: new Float32Array([
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    ]),
    uColorOffset: new Float32Array(4)
  };

  // ../phaser-genesis/src/config/size/GetHeight.ts
  function GetHeight() {
    return ConfigStore.get(CONFIG_DEFAULTS.SIZE).height;
  }

  // ../phaser-genesis/src/config/size/GetResolution.ts
  function GetResolution() {
    return ConfigStore.get(CONFIG_DEFAULTS.SIZE).resolution;
  }

  // ../phaser-genesis/src/config/size/GetWidth.ts
  function GetWidth() {
    return ConfigStore.get(CONFIG_DEFAULTS.SIZE).width;
  }

  // ../phaser-genesis/src/config/size/SetSize.ts
  function SetSize(width = 800, height = 600, resolution = 1) {
    if (resolution === 0) {
      resolution = window.devicePixelRatio;
    }
    ConfigStore.set(CONFIG_DEFAULTS.SIZE, { width, height, resolution });
  }

  // ../phaser-genesis/src/renderer/webgl1/fbo/CreateDepthBuffer.ts
  function CreateDepthBuffer(framebuffer, textureWidth, textureHeight) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    const depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, textureWidth, textureHeight);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return depthBuffer;
  }

  // ../phaser-genesis/src/renderer/webgl1/glsl/SINGLE_QUAD_FRAG.ts
  var SINGLE_QUAD_FRAG = `#define SHADER_NAME SINGLE_QUAD_FRAG

precision highp float;

varying vec2 vTextureCoord;
varying float vTextureId;
varying vec4 vTintColor;

uniform sampler2D uTexture;
uniform mat4 uColorMatrix;
uniform vec4 uColorOffset;

void main (void)
{
    vec4 color = texture2D(uTexture, vTextureCoord);

    //  Un pre-mult alpha
    if (color.a > 0.0)
    {
        color.rgb /= color.a;
    }

    vec4 result = color * uColorMatrix + (uColorOffset / 255.0);

    //  Pre-mult alpha
    result.rgb *= result.a;

    gl_FragColor = vec4(result.rgb, result.a);
}`;

  // ../phaser-genesis/src/renderer/webgl1/glsl/SINGLE_QUAD_VERT.ts
  var SINGLE_QUAD_VERT = `#define SHADER_NAME SINGLE_QUAD_VERT

precision highp float;

attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
attribute float aTextureId;
attribute vec4 aTintColor;

uniform mat4 uProjectionMatrix;
uniform mat4 uCameraMatrix;

varying vec2 vTextureCoord;
varying float vTextureId;
varying vec4 vTintColor;

void main (void)
{
    vTextureCoord = aTextureCoord;
    vTextureId = aTextureId;
    vTintColor = aTintColor;

    gl_Position = uProjectionMatrix * uCameraMatrix * vec4(aVertexPosition, 0.0, 1.0);
}`;

  // ../phaser-genesis/src/textures/Frame.ts
  var Frame = class {
    constructor(texture, key, x, y, width, height) {
      __publicField(this, "texture");
      __publicField(this, "key");
      __publicField(this, "x");
      __publicField(this, "y");
      __publicField(this, "width");
      __publicField(this, "height");
      __publicField(this, "trimmed", false);
      __publicField(this, "sourceSizeWidth");
      __publicField(this, "sourceSizeHeight");
      __publicField(this, "spriteSourceSizeX");
      __publicField(this, "spriteSourceSizeY");
      __publicField(this, "spriteSourceSizeWidth");
      __publicField(this, "spriteSourceSizeHeight");
      __publicField(this, "pivot");
      __publicField(this, "u0");
      __publicField(this, "v0");
      __publicField(this, "u1");
      __publicField(this, "v1");
      this.texture = texture;
      this.key = key;
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.sourceSizeWidth = width;
      this.sourceSizeHeight = height;
      this.updateUVs();
    }
    setPivot(x, y) {
      this.pivot = { x, y };
    }
    setSize(width, height) {
      this.width = width;
      this.height = height;
      this.sourceSizeWidth = width;
      this.sourceSizeHeight = height;
      this.updateUVs();
    }
    setSourceSize(width, height) {
      this.sourceSizeWidth = width;
      this.sourceSizeHeight = height;
    }
    setTrim(width, height, x, y, w, h) {
      this.trimmed = true;
      this.sourceSizeWidth = width;
      this.sourceSizeHeight = height;
      this.spriteSourceSizeX = x;
      this.spriteSourceSizeY = y;
      this.spriteSourceSizeWidth = w;
      this.spriteSourceSizeHeight = h;
    }
    getExtent(originX, originY) {
      const sourceSizeWidth = this.sourceSizeWidth;
      const sourceSizeHeight = this.sourceSizeHeight;
      let left;
      let right;
      let top;
      let bottom;
      if (this.trimmed) {
        left = this.spriteSourceSizeX - originX * sourceSizeWidth;
        right = left + this.spriteSourceSizeWidth;
        top = this.spriteSourceSizeY - originY * sourceSizeHeight;
        bottom = top + this.spriteSourceSizeHeight;
      } else {
        left = -originX * sourceSizeWidth;
        right = left + sourceSizeWidth;
        top = -originY * sourceSizeHeight;
        bottom = top + sourceSizeHeight;
      }
      return { left, right, top, bottom };
    }
    copyToExtent(child) {
      const originX = child.origin.x;
      const originY = child.origin.y;
      const sourceSizeWidth = this.sourceSizeWidth;
      const sourceSizeHeight = this.sourceSizeHeight;
      let x;
      let y;
      let width;
      let height;
      if (this.trimmed) {
        x = this.spriteSourceSizeX - originX * sourceSizeWidth;
        y = this.spriteSourceSizeY - originY * sourceSizeHeight;
        width = this.spriteSourceSizeWidth;
        height = this.spriteSourceSizeHeight;
      } else {
        x = -originX * sourceSizeWidth;
        y = -originY * sourceSizeHeight;
        width = sourceSizeWidth;
        height = sourceSizeHeight;
      }
      SetExtent(child.id, x, y, width, height);
      return this;
    }
    copyToVertices(id) {
      SetUV(id, this.u0, this.v0, this.u1, this.v1);
      return this;
    }
    updateUVs() {
      const { x, y, width, height } = this;
      const baseTextureWidth = this.texture.width;
      const baseTextureHeight = this.texture.height;
      this.u0 = x / baseTextureWidth;
      this.v0 = y / baseTextureHeight;
      this.u1 = (x + width) / baseTextureWidth;
      this.v1 = (y + height) / baseTextureHeight;
    }
    destroy() {
      this.texture = null;
    }
  };

  // ../phaser-genesis/src/textures/Texture.ts
  var Texture = class {
    constructor(image, width, height, glConfig) {
      __publicField(this, "key", "");
      __publicField(this, "width");
      __publicField(this, "height");
      __publicField(this, "image");
      __publicField(this, "binding");
      __publicField(this, "firstFrame");
      __publicField(this, "frames");
      __publicField(this, "data");
      if (image) {
        width = image.width;
        height = image.height;
      }
      this.image = image;
      this.width = width;
      this.height = height;
      this.frames = new Map();
      this.data = {};
      this.addFrame("__BASE", 0, 0, width, height);
      BindingQueue.add(this, glConfig);
    }
    addFrame(key, x, y, width, height) {
      if (this.frames.has(key)) {
        return null;
      }
      const frame2 = new Frame(this, key, x, y, width, height);
      this.frames.set(key, frame2);
      if (!this.firstFrame || this.firstFrame.key === "__BASE") {
        this.firstFrame = frame2;
      }
      return frame2;
    }
    getFrame(key) {
      if (!key) {
        return this.firstFrame;
      }
      if (key instanceof Frame) {
        key = key.key;
      }
      let frame2 = this.frames.get(key);
      if (!frame2) {
        console.warn(`Frame missing: ${key}`);
        frame2 = this.firstFrame;
      }
      return frame2;
    }
    setSize(width, height) {
      this.width = width;
      this.height = height;
      const frame2 = this.frames.get("__BASE");
      frame2.setSize(width, height);
    }
    destroy() {
      if (this.binding) {
        this.binding.destroy();
      }
      this.frames.clear();
      this.binding = null;
      this.data = null;
      this.image = null;
      this.firstFrame = null;
    }
  };

  // ../phaser-genesis/src/renderer/webgl1/shaders/Shader.ts
  var Shader = class {
    constructor(config) {
      __publicField(this, "program");
      __publicField(this, "attributes");
      __publicField(this, "uniforms");
      __publicField(this, "uniformSetters");
      __publicField(this, "texture");
      __publicField(this, "framebuffer");
      __publicField(this, "renderToFramebuffer", false);
      __publicField(this, "renderToDepthbuffer", false);
      __publicField(this, "isActive", false);
      if (config) {
        this.fromConfig(config);
      }
    }
    fromConfig(config) {
      const {
        attributes = DefaultQuadAttributes,
        fragmentShader = SINGLE_QUAD_FRAG,
        height = GetHeight(),
        renderToFramebuffer = false,
        renderToDepthbuffer = false,
        resolution = GetResolution(),
        vertexShader = SINGLE_QUAD_VERT,
        width = GetWidth(),
        uniforms = DefaultQuadUniforms
      } = config;
      this.create(fragmentShader, vertexShader, uniforms, attributes);
      if (renderToFramebuffer) {
        this.renderToFramebuffer = true;
        const texture = new Texture(null, width * resolution, height * resolution);
        const binding = new GLTextureBinding(texture);
        binding.framebuffer = CreateFramebuffer(binding.texture);
        if (renderToDepthbuffer) {
          this.renderToDepthbuffer = true;
          binding.depthbuffer = CreateDepthBuffer(binding.framebuffer, texture.width, texture.height);
        }
        this.texture = texture;
        this.framebuffer = binding.framebuffer;
      }
    }
    create(fragmentShaderSource, vertexShaderSource, uniforms, attribs) {
      const fragmentShader = CreateShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
      const vertexShader = CreateShader(vertexShaderSource, gl.VERTEX_SHADER);
      if (!fragmentShader || !vertexShader) {
        return;
      }
      const program = CreateProgram(fragmentShader, vertexShader);
      if (!program) {
        return;
      }
      const currentProgram = gl.getParameter(gl.CURRENT_PROGRAM);
      gl.useProgram(program);
      this.program = program;
      this.uniformSetters = CreateUniforms(program);
      this.uniforms = new Map();
      for (const [key, value] of Object.entries(uniforms)) {
        if (this.uniformSetters.has(key)) {
          this.uniforms.set(key, value);
        }
      }
      this.attributes = CreateAttributes(program, attribs);
      gl.useProgram(currentProgram);
      this.isActive = false;
    }
    updateUniforms(renderPass) {
    }
    bind(renderPass) {
      const uniforms = this.uniforms;
      uniforms.set("uProjectionMatrix", renderPass.projectionMatrix.data);
      uniforms.set("uCameraMatrix", renderPass.cameraMatrix.data);
      this.updateUniforms(renderPass);
      return this.setUniforms(renderPass);
    }
    setUniform(key, value) {
      const uniforms = this.uniforms;
      if (uniforms.has(key)) {
        uniforms.set(key, value);
        const setter = this.uniformSetters.get(key);
        setter(value);
      }
    }
    setUniforms(renderPass) {
      if (!this.program) {
        return false;
      }
      gl.useProgram(this.program);
      this.isActive = true;
      const uniforms = this.uniforms;
      for (const [name, setter] of this.uniformSetters.entries()) {
        setter(uniforms.get(name));
      }
      return true;
    }
    setAttributes(renderPass) {
      if (this.program) {
        const stride = renderPass.vertexbuffer.current.vertexByteSize;
        this.attributes.forEach((attrib) => {
          gl.vertexAttribPointer(attrib.index, attrib.size, attrib.type, attrib.normalized, stride, attrib.offset);
        });
      }
    }
    destroy() {
      DeleteShaders(this.program);
      DeleteGLTexture(this.texture);
      DeleteFramebuffer(this.framebuffer);
      this.uniforms.clear();
      this.uniformSetters.clear();
      this.attributes.clear();
      this.program = null;
      this.texture = null;
      this.framebuffer = null;
    }
  };

  // ../phaser-genesis/src/renderer/webgl1/shaders/QuadShader.ts
  var QuadShader = class extends Shader {
    constructor(config = {}) {
      config.attributes = (config == null ? void 0 : config.attributes) || DefaultQuadAttributes;
      super(config);
    }
  };

  // ../phaser-genesis/src/renderer/webgl1/glsl/MULTI_QUAD_FRAG.ts
  var MULTI_QUAD_FRAG = `#define SHADER_NAME MULTI_QUAD_FRAG
#define numTextures %count%

precision highp float;

varying vec2 vTextureCoord;
varying float vTextureId;
varying vec4 vTintColor;

uniform sampler2D uTexture[%count%];
uniform mat4 uColorMatrix;
uniform vec4 uColorOffset;

vec4 getSampler (int index, vec2 uv)
{
    for (int i = 0; i < numTextures; ++i)
    {
        vec4 color = texture2D(uTexture[i], uv);

        if (i == index)
        {
            return color * vec4(vTintColor.rgb * vTintColor.a, vTintColor.a);
        }
    }

    //  Return black
    return vec4(0);
}

void main (void)
{
    vec4 color = getSampler(int(vTextureId), vTextureCoord);

    //  Un pre-mult alpha
    if (color.a > 0.0)
    {
        color.rgb /= color.a;
    }

    vec4 result = color * uColorMatrix + (uColorOffset / 255.0);

    //  Pre-mult alpha
    result.rgb *= result.a;

    gl_FragColor = vec4(result.rgb, result.a);
}`;

  // ../phaser-genesis/src/renderer/webgl1/shaders/MultiTextureQuadShader.ts
  var MultiTextureQuadShader = class extends QuadShader {
    constructor(config = {}) {
      config.fragmentShader = (config == null ? void 0 : config.fragmentShader) || MULTI_QUAD_FRAG;
      super(config);
    }
    create(fragmentShaderSource, vertexShaderSource, uniforms, attribs) {
      const maxTextures = GetMaxTextures();
      fragmentShaderSource = fragmentShaderSource.replace(/%count%/gi, `${maxTextures}`);
      super.create(fragmentShaderSource, vertexShaderSource, uniforms, attribs);
    }
    bind(renderPass) {
      this.uniforms.set("uTexture", renderPass.textures.textureIndex);
      return super.bind(renderPass);
    }
  };

  // ../phaser-genesis/src/renderer/webgl1/renderpass/ShaderStack.ts
  var ShaderStack = class {
    constructor(renderPass) {
      __publicField(this, "renderPass");
      __publicField(this, "stack");
      __publicField(this, "active");
      __publicField(this, "default");
      __publicField(this, "index");
      this.renderPass = renderPass;
      this.stack = [];
    }
    get current() {
      return this.stack[this.index];
    }
    add(shader, textureID) {
      const entry = { shader, textureID };
      this.index++;
      if (this.index === this.stack.length) {
        this.stack.push(entry);
      } else {
        this.stack[this.index] = entry;
      }
      return entry;
    }
    bindDefault() {
      this.index = 0;
      this.bind(this.default);
    }
    bind(entry) {
      if (!entry) {
        entry = this.current;
      }
      if (!entry.shader.isActive) {
        const success = entry.shader.bind(this.renderPass, entry.textureID);
        if (success) {
          entry.shader.setAttributes(this.renderPass);
          if (this.active && this.active !== entry.shader) {
            this.active.isActive = false;
          }
          this.active = entry.shader;
        }
      }
    }
    pop() {
      this.index--;
      this.bind();
    }
    set(shader, textureID) {
      const entry = this.add(shader, textureID);
      this.bind(entry);
    }
    setDefault(shader, textureID) {
      const entry = { shader, textureID };
      this.stack[0] = entry;
      this.index = 0;
      this.default = entry;
    }
  };

  // ../phaser-genesis/src/GameInstance.ts
  var instance;
  var frame = 0;
  var elapsed = 0;
  var GameInstance = {
    get: () => {
      return instance;
    },
    set: (game) => {
      instance = game;
    },
    getFrame: () => {
      return frame;
    },
    setFrame: (current) => {
      frame = current;
    },
    getElapsed: () => {
      return elapsed;
    },
    setElapsed: (current) => {
      elapsed = current;
    }
  };

  // ../phaser-genesis/src/geom/rectangle/RectangleContains.ts
  function RectangleContains(rect, x, y) {
    if (rect.width <= 0 || rect.height <= 0) {
      return false;
    }
    return rect.x <= x && rect.x + rect.width >= x && rect.y <= y && rect.y + rect.height >= y;
  }

  // ../phaser-genesis/src/geom/rectangle/Rectangle.ts
  var Rectangle = class {
    constructor(x = 0, y = 0, width = 0, height = 0) {
      __publicField(this, "x");
      __publicField(this, "y");
      __publicField(this, "width");
      __publicField(this, "height");
      this.set(x, y, width, height);
    }
    set(x = 0, y = 0, width = 0, height = 0) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      return this;
    }
    contains(x, y) {
      return RectangleContains(this, x, y);
    }
    set right(value) {
      if (value <= this.x) {
        this.width = 0;
      } else {
        this.width = value - this.x;
      }
    }
    get right() {
      return this.x + this.width;
    }
    set bottom(value) {
      if (value <= this.y) {
        this.height = 0;
      } else {
        this.height = value - this.y;
      }
    }
    get bottom() {
      return this.y + this.height;
    }
  };

  // ../phaser-genesis/src/camera/StaticCamera.ts
  var StaticCamera = class {
    constructor() {
      __publicField(this, "world");
      __publicField(this, "matrix");
      __publicField(this, "renderer");
      __publicField(this, "type");
      __publicField(this, "width");
      __publicField(this, "height");
      __publicField(this, "bounds");
      __publicField(this, "dirtyRender");
      __publicField(this, "worldTransform");
      this.dirtyRender = true;
      const game = GameInstance.get();
      this.renderer = game.renderer;
      this.matrix = Mat4Identity();
      this.bounds = new Rectangle();
      this.worldTransform = new Matrix2D();
      this.reset();
    }
    reset() {
      const renderer = this.renderer;
      if (renderer) {
        const width = renderer.width;
        const height = renderer.height;
        this.width = width;
        this.height = height;
      }
      this.bounds.set(0, 0, this.width, this.height);
    }
    destroy() {
      this.world = null;
      this.worldTransform = null;
      this.renderer = null;
      this.matrix = null;
      this.bounds = null;
    }
  };

  // ../phaser-genesis/src/textures/CreateCanvas.ts
  function CreateCanvas(width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas.getContext("2d");
  }

  // ../phaser-genesis/src/textures/TextureManagerInstance.ts
  var instance2;
  var TextureManagerInstance = {
    get: () => {
      return instance2;
    },
    set: (manager) => {
      instance2 = manager;
    }
  };

  // ../phaser-genesis/src/textures/GetTexture.ts
  function GetTexture(key) {
    return TextureManagerInstance.get().get(key);
  }

  // ../phaser-genesis/src/textures/WhiteTexture.ts
  var instance3;
  var WhiteTexture = {
    get: () => {
      return instance3;
    },
    set: (texture) => {
      instance3 = texture;
    }
  };

  // ../phaser-genesis/src/textures/TextureManager.ts
  var TextureManager = class {
    constructor() {
      __publicField(this, "textures");
      this.textures = new Map();
      this.createDefaultTextures();
      TextureManagerInstance.set(this);
    }
    createDefaultTextures() {
      this.add("__BLANK", new Texture(CreateCanvas(32, 32).canvas));
      const missing = CreateCanvas(32, 32);
      missing.strokeStyle = "#0f0";
      missing.moveTo(0, 0);
      missing.lineTo(32, 32);
      missing.stroke();
      missing.strokeRect(0.5, 0.5, 31, 31);
      this.add("__MISSING", new Texture(missing.canvas));
      const white = CreateCanvas(2, 2);
      white.fillStyle = "#fff";
      white.fillRect(0, 0, 2, 2);
      const whiteTexture = this.add("__WHITE", new Texture(white.canvas));
      WhiteTexture.set(whiteTexture);
    }
    get(key) {
      const textures = this.textures;
      if (textures.has(key)) {
        return textures.get(key);
      } else {
        return textures.get("__MISSING");
      }
    }
    has(key) {
      return this.textures.has(key);
    }
    add(key, source, glConfig) {
      let texture;
      const textures = this.textures;
      if (!textures.has(key)) {
        if (source instanceof Texture) {
          texture = source;
        } else {
          texture = new Texture(source, 0, 0, glConfig);
        }
        texture.key = key;
        textures.set(key, texture);
      }
      return texture;
    }
  };

  // ../phaser-genesis/src/renderer/webgl1/renderpass/CreateTempTextures.ts
  function CreateTempTextures() {
    let maxGPUTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    const maxConfigTextures = GetMaxTextures();
    if (maxConfigTextures === 0 || maxConfigTextures > maxGPUTextures) {
      SetMaxTextures(maxGPUTextures);
    } else {
      maxGPUTextures = maxConfigTextures;
    }
    const textures = [];
    for (let i = 0; i < maxGPUTextures; i++) {
      const tempTexture = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, tempTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
      textures.push([i, tempTexture]);
    }
    return textures;
  }

  // ../phaser-genesis/src/renderer/webgl1/renderpass/TextureStack.ts
  var TextureStack = class {
    constructor(renderPass) {
      __publicField(this, "renderPass");
      __publicField(this, "textures");
      __publicField(this, "tempTextures");
      __publicField(this, "textureIndex");
      __publicField(this, "maxTextures");
      this.renderPass = renderPass;
    }
    bind(texture, index = 0) {
      const binding = texture.binding;
      binding.bind(index);
      gl.activeTexture(gl.TEXTURE0 + index);
      gl.bindTexture(gl.TEXTURE_2D, binding.texture);
    }
    unbind(index = 0) {
      gl.activeTexture(gl.TEXTURE0 + index);
      gl.bindTexture(gl.TEXTURE_2D, this.tempTextures[index]);
    }
    setWhite() {
      return this.set(WhiteTexture.get());
    }
    set(texture) {
      if (!texture.binding) {
        return -1;
      }
      const binding = texture.binding;
      const textures = this.textures;
      if (!binding.isBound) {
        if (textures.size === this.maxTextures) {
          Flush(this.renderPass);
          this.clear();
        }
        const textureUnit = textures.size;
        gl.activeTexture(gl.TEXTURE0 + textureUnit);
        gl.bindTexture(gl.TEXTURE_2D, binding.texture);
        textures.set(textureUnit, texture);
        binding.bind(textureUnit);
      }
      return binding.textureUnit;
    }
    setDefault() {
      if (this.textures) {
        this.reset();
      }
      const tempTextures = CreateTempTextures();
      this.maxTextures = tempTextures.length;
      this.tempTextures = new Map(tempTextures);
      this.textures = new Map();
      this.textureIndex = [];
      this.tempTextures.forEach((texture, index) => {
        this.textureIndex.push(index);
      });
    }
    clear() {
      this.textures.forEach((texture) => texture.binding.unbind());
      this.textures.clear();
    }
    reset() {
      this.tempTextures.forEach((texture, index) => {
        gl.activeTexture(gl.TEXTURE0 + index);
        gl.bindTexture(gl.TEXTURE_2D, texture);
      });
      this.clear();
    }
  };

  // ../phaser-genesis/src/renderer/webgl1/renderpass/VertexBufferStack.ts
  var VertexBufferStack = class {
    constructor(renderPass) {
      __publicField(this, "renderPass");
      __publicField(this, "stack");
      __publicField(this, "active");
      __publicField(this, "default");
      __publicField(this, "index");
      this.renderPass = renderPass;
      this.stack = [];
    }
    get current() {
      return this.stack[this.index];
    }
    add(buffer4) {
      this.index++;
      if (this.index === this.stack.length) {
        this.stack.push(buffer4);
      } else {
        this.stack[this.index] = buffer4;
      }
      return buffer4;
    }
    bindDefault() {
      this.index = 0;
      this.bind(this.default);
    }
    bind(buffer4) {
      if (!buffer4) {
        buffer4 = this.current;
      }
      if (!buffer4.isBound) {
        const indexBuffer = buffer4.indexed ? buffer4.indexBuffer : null;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer4.vertexBuffer);
        buffer4.isBound = true;
        if (this.active && this.active !== buffer4) {
          this.active.isBound = false;
        }
        this.active = buffer4;
      }
    }
    pop() {
      this.index--;
      this.bind();
    }
    set(buffer4) {
      const entry = this.add(buffer4);
      this.bind(entry);
    }
    setDefault(buffer4) {
      this.stack[0] = buffer4;
      this.index = 0;
      this.default = buffer4;
    }
  };

  // ../phaser-genesis/src/geom/rectangle/RectangleEquals.ts
  function RectangleEquals(rect, toCompare) {
    return rect.x === toCompare.x && rect.y === toCompare.y && rect.width === toCompare.width && rect.height === toCompare.height;
  }

  // ../phaser-genesis/src/renderer/webgl1/renderpass/ViewportStack.ts
  var ViewportStack = class {
    constructor(renderPass) {
      __publicField(this, "renderPass");
      __publicField(this, "stack");
      __publicField(this, "active");
      __publicField(this, "default");
      __publicField(this, "index");
      this.renderPass = renderPass;
      this.stack = [];
    }
    get current() {
      return this.stack[this.index];
    }
    add(x = 0, y = 0, width = 0, height = 0) {
      const entry = new Rectangle(x, y, width, height);
      this.index++;
      if (this.index === this.stack.length) {
        this.stack.push(entry);
      } else {
        this.stack[this.index] = entry;
      }
      return entry;
    }
    bindDefault() {
      this.index = 0;
      this.bind(this.default);
    }
    bind(viewport) {
      if (!viewport) {
        viewport = this.current;
      }
      if (!this.active || !RectangleEquals(this.active, viewport)) {
        gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
        this.active = viewport;
      }
    }
    pop() {
      this.index--;
      this.bind();
    }
    set(x = 0, y = 0, width = 0, height = 0) {
      const entry = this.add(x, y, width, height);
      this.bind(entry);
    }
    setDefault(x = 0, y = 0, width = 0, height = 0) {
      const entry = new Rectangle(x, y, width, height);
      this.stack[0] = entry;
      this.index = 0;
      this.default = entry;
    }
  };

  // ../phaser-genesis/src/renderer/webgl1/renderpass/RenderPass.ts
  var RenderPass = class {
    constructor(renderer) {
      __publicField(this, "renderer");
      __publicField(this, "projectionMatrix");
      __publicField(this, "cameraMatrix");
      __publicField(this, "count", 0);
      __publicField(this, "prevCount", 0);
      __publicField(this, "flushTotal", 0);
      __publicField(this, "framebuffer");
      __publicField(this, "vertexbuffer");
      __publicField(this, "blendMode");
      __publicField(this, "shader");
      __publicField(this, "viewport");
      __publicField(this, "textures");
      __publicField(this, "colorMatrix");
      __publicField(this, "quadShader");
      __publicField(this, "quadBuffer");
      __publicField(this, "quadCamera");
      __publicField(this, "current2DCamera");
      this.renderer = renderer;
      this.projectionMatrix = new Matrix4();
      this.framebuffer = new FramebufferStack(this);
      this.vertexbuffer = new VertexBufferStack(this);
      this.blendMode = new BlendModeStack(this);
      this.shader = new ShaderStack(this);
      this.viewport = new ViewportStack(this);
      this.textures = new TextureStack(this);
      this.colorMatrix = new ColorMatrixStack(this);
      this.reset();
    }
    getCurrentShader() {
      return this.shader.current.shader;
    }
    flush() {
      this.prevCount = this.count;
      this.count = 0;
      this.flushTotal++;
    }
    reset() {
      const gl2 = this.renderer.gl;
      this.quadShader = new QuadShader();
      this.quadBuffer = new IndexedVertexBuffer({ name: "quad", isDynamic: false, indexLayout: [0, 1, 2, 2, 3, 0] });
      this.quadCamera = new StaticCamera();
      this.textures.setDefault();
      this.framebuffer.setDefault();
      this.blendMode.setDefault(true, gl2.ONE, gl2.ONE_MINUS_SRC_ALPHA);
      this.colorMatrix.setDefault(DEFAULT_COLOR_MATRIX, DEFAULT_COLOR_OFFSET);
      this.vertexbuffer.setDefault(new VertexBuffer({ batchSize: GetBatchSize() }));
      this.shader.setDefault(GetMaxTextures() === 1 ? new QuadShader() : new MultiTextureQuadShader());
    }
    resize(width, height) {
      Mat4Ortho(0, width, height, 0, -1e3, 1e3, this.projectionMatrix);
      this.quadCamera.reset();
      this.viewport.setDefault(0, 0, width, height);
    }
  };

  // ../phaser-genesis/src/renderer/webgl1/renderpass/Start.ts
  function Start(renderPass) {
    renderPass.current2DCamera = renderPass.quadCamera;
    renderPass.cameraMatrix = renderPass.quadCamera.matrix;
    renderPass.count = 0;
    renderPass.flushTotal = 0;
    renderPass.framebuffer.bindDefault();
    renderPass.blendMode.bindDefault();
    renderPass.viewport.bindDefault();
    renderPass.vertexbuffer.bindDefault();
    renderPass.shader.bindDefault();
    renderPass.colorMatrix.bindDefault();
  }

  // ../phaser-genesis/src/geom/circle/CircleContains.ts
  function CircleContains(circle2, x, y) {
    if (circle2.radius > 0 && x >= circle2.left && x <= circle2.right && y >= circle2.top && y <= circle2.bottom) {
      const dx = (circle2.x - x) * (circle2.x - x);
      const dy = (circle2.y - y) * (circle2.y - y);
      return dx + dy <= circle2.radius * circle2.radius;
    } else {
      return false;
    }
  }

  // ../phaser-genesis/src/geom/circle/Circle.ts
  var Circle = class {
    constructor(x = 0, y = 0, radius = 0) {
      __publicField(this, "x");
      __publicField(this, "y");
      __publicField(this, "_radius");
      __publicField(this, "_diameter");
      this.set(x, y, radius);
    }
    set(x = 0, y = 0, radius = 0) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      return this;
    }
    contains(x, y) {
      return CircleContains(this, x, y);
    }
    get radius() {
      return this._radius;
    }
    set radius(value) {
      this._radius = value;
      this._diameter = value * 2;
    }
    get diameter() {
      return this._diameter;
    }
    set diameter(value) {
      this._diameter = value;
      this._radius = value * 0.5;
    }
    get left() {
      return this.x - this._radius;
    }
    set left(value) {
      this.x = value + this._radius;
    }
    get right() {
      return this.x + this._radius;
    }
    set right(value) {
      this.x = value - this._radius;
    }
    get top() {
      return this.y - this._radius;
    }
    set top(value) {
      this.y = value + this._radius;
    }
    get bottom() {
      return this.y + this._radius;
    }
    set bottom(value) {
      this.y = value - this._radius;
    }
  };

  // ../phaser-genesis/src/geom/circle/GetCircleCircumference.ts
  function GetCircleCircumference(circle2) {
    return 2 * (Math.PI * circle2.radius);
  }

  // ../phaser-genesis/src/geom/circle/GetCircleCircumferencePoint.ts
  function GetCircleCircumferencePoint(circle2, angle, out = new Vec2()) {
    return out.set(circle2.x + circle2.radius * Math.cos(angle), circle2.y + circle2.radius * Math.sin(angle));
  }

  // ../phaser-genesis/src/geom/circle/GetCirclePointsBetween.ts
  function GetCirclePointsBetween(circle2, startAngle, endAngle, step, anticlockwise = false, includeCenter = false, quantity = 0, out = []) {
    if (!quantity) {
      quantity = GetCircleCircumference(circle2) / step;
    }
    for (let i = 0; i < quantity; i++) {
      const angle = FromPercent(i / quantity, 0, MATH_CONST.PI2);
      if (angle >= startAngle && angle <= endAngle) {
        out.push(GetCircleCircumferencePoint(circle2, angle));
      }
    }
    if (anticlockwise) {
      out = out.reverse();
    }
    if (includeCenter) {
      out.push(new Vec2(circle2.x, circle2.y));
    }
    return out;
  }

  // ../phaser-genesis/src/geom/PolyPartition.ts
  function Area(a, b, c) {
    return (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);
  }
  function IsConvex(p1, p2, p3) {
    return Area(p1, p2, p3) < 0;
  }
  function Equals(a, b) {
    return a.x === b.x && a.y === b.y;
  }
  function IsClockwise(polygon) {
    let sum = 0;
    for (let i = 0, len = polygon.length; i < len; ++i) {
      const p1 = polygon[i];
      const p2 = polygon[(i + 1) % len];
      sum += (p2.x - p1.x) * (p2.y + p1.y);
    }
    return sum > 0;
  }
  function UpdateVertex(vertex, vertices) {
    if (!vertex.shouldUpdate) {
      return;
    }
    vertex.shouldUpdate = false;
    const v1 = vertex.prev.point;
    const v2 = vertex.point;
    const v3 = vertex.next.point;
    vertex.isConvex = IsConvex(v1, v2, v3);
    let v1x = v1.x - v2.x;
    let v1y = v1.y - v2.y;
    const v1Len = Math.sqrt(v1x * v1x + v1y * v1y);
    v1x /= v1Len;
    v1y /= v1Len;
    let v3x = v3.x - v2.x;
    let v3y = v3.y - v2.y;
    const v3Len = Math.sqrt(v3x * v3x + v3y * v3y);
    v3x /= v3Len;
    v3y /= v3Len;
    vertex.angleCos = v1x * v3x + v1y * v3y;
    if (vertex.isConvex) {
      vertex.isEar = true;
      for (let i = 0, len = vertices.length; i < len; ++i) {
        const curr = vertices[i];
        if (!curr.isActive || curr === vertex) {
          continue;
        }
        if (Equals(v1, curr.point) || Equals(v2, curr.point) || Equals(v3, curr.point)) {
          continue;
        }
        const areaA = Area(v1, curr.point, v2);
        const areaB = Area(v2, curr.point, v3);
        const areaC = Area(v3, curr.point, v1);
        if (areaA > 0 && areaB > 0 && areaC > 0) {
          vertex.isEar = false;
          break;
        }
        if (areaA === 0 && areaB >= 0 && areaC >= 0) {
          if (Area(v1, curr.prev.point, v2) > 0 || Area(v1, curr.next.point, v2) > 0) {
            vertex.isEar = false;
            break;
          }
        }
        if (areaB === 0 && areaA >= 0 && areaC >= 0) {
          if (Area(v2, curr.prev.point, v3) > 0 || Area(v2, curr.next.point, v3) > 0) {
            vertex.isEar = false;
            break;
          }
        }
        if (areaC === 0 && areaA >= 0 && areaB >= 0) {
          if (Area(v3, curr.prev.point, v1) > 0 || Area(v3, curr.next.point, v1) > 0) {
            vertex.isEar = false;
            break;
          }
        }
      }
    } else {
      vertex.isEar = false;
    }
  }
  function RemoveCollinearOrDuplicate(start) {
    for (let curr = start, end = start; ; ) {
      if (Equals(curr.point, curr.next.point) || Area(curr.prev.point, curr.point, curr.next.point) === 0) {
        curr.prev.next = curr.next;
        curr.next.prev = curr.prev;
        curr.prev.shouldUpdate = true;
        curr.next.shouldUpdate = true;
        if (curr === curr.next) {
          break;
        }
        end = curr.prev;
        curr = curr.next;
        continue;
      }
      curr = curr.next;
      if (curr === end) {
        break;
      }
    }
  }
  function Triangulate(polygon, doNotCheckOrdering = false) {
    if (!doNotCheckOrdering) {
      if (IsClockwise(polygon)) {
        throw new Error("Polygon should be counterclockwise");
      }
    }
    if (polygon.length < 4) {
      return [polygon];
    }
    const len = polygon.length;
    const vertices = [];
    const triangles = [];
    for (let i = 0; i < len; ++i) {
      vertices.push({
        isActive: true,
        isConvex: false,
        isEar: false,
        point: polygon[i],
        angleCos: 0,
        shouldUpdate: true,
        index: i
      });
    }
    for (let i = 0; i < len; ++i) {
      const vertex = vertices[i];
      vertex.prev = vertices[(i + len - 1) % len];
      vertex.next = vertices[(i + 1) % len];
    }
    vertices.forEach((vertex) => UpdateVertex(vertex, vertices));
    for (let i = 0; i < len - 3; ++i) {
      let ear = null;
      for (let j = 0; j < len; ++j) {
        const vertex = vertices[j];
        if (!vertex.isActive || !vertex.isEar) {
          continue;
        }
        if (!ear) {
          ear = vertex;
        } else if (vertex.angleCos > ear.angleCos) {
          ear = vertex;
        }
      }
      if (!ear) {
        for (let i2 = 0; i2 < len; ++i2) {
          const vertex = vertices[i2];
          if (vertex.isActive) {
            const p1 = vertex.prev.point;
            const p2 = vertex.point;
            const p3 = vertex.next.point;
            if (Math.abs(Area(p1, p2, p3)) > 1e-5) {
              throw new Error("Failed to find ear. There may be self-intersection in the polygon.");
            }
          }
        }
        break;
      }
      triangles.push([ear.prev.point, ear.point, ear.next.point]);
      ear.isActive = false;
      ear.prev.next = ear.next;
      ear.next.prev = ear.prev;
      ear.prev.shouldUpdate = true;
      ear.next.shouldUpdate = true;
      RemoveCollinearOrDuplicate(ear.next);
      if (i === len - 4) {
        break;
      }
      for (let i2 = 0; i2 < len; ++i2) {
        UpdateVertex(vertices[i2], vertices);
      }
    }
    for (let i = 0; i < len; ++i) {
      const vertex = vertices[i];
      if (vertex.isActive) {
        vertex.prev.isActive = false;
        vertex.next.isActive = false;
        const p1 = vertex.prev.point;
        const p2 = vertex.point;
        const p3 = vertex.next.point;
        if (Math.abs(Area(p1, p2, p3)) > 1e-5) {
          triangles.push([p1, p2, p3]);
        }
      }
    }
    return triangles;
  }

  // ../phaser-genesis/src/renderer/webgl1/draw/FillArc.ts
  var circle = new Circle();
  function FillArc(renderPass, x, y, radius, startAngle, endAngle, steps, anticlockwise, includeCenter, red, green, blue, alpha) {
    circle.set(x, y, radius);
    const points = GetCirclePointsBetween(circle, startAngle, endAngle, steps, anticlockwise, includeCenter);
    const tris = Triangulate(points);
    if (!tris.length) {
      return;
    }
    const { F32, offset } = GetVertexBufferEntry(renderPass, tris.length);
    const textureIndex = renderPass.textures.setWhite();
    let idx = offset;
    tris.forEach((tri) => {
      idx = BatchTriangle(F32, idx, textureIndex, tri[0].x, tri[0].y, tri[1].x, tri[1].y, tri[2].x, tri[2].y, red, green, blue, alpha);
    });
  }

  // ../phaser-genesis/src/renderer/webgl1/draw/FillLine.ts
  function FillLine(renderPass, x1, y1, x2, y2, width, red, green, blue, alpha) {
    const { F32, offset } = GetVertexBufferEntry(renderPass, 2);
    const textureIndex = renderPass.textures.setWhite();
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    width *= 0.5;
    const al0 = width * (y2 - y1) / len;
    const al1 = width * (x1 - x2) / len;
    const bl0 = width * (y2 - y1) / len;
    const bl1 = width * (x1 - x2) / len;
    BatchQuad(F32, offset, textureIndex, Math.floor(x1 + al0), Math.floor(y1 + al1), Math.floor(x1 - al0), Math.floor(y1 - al1), Math.floor(x2 - bl0), Math.floor(y2 - bl1), Math.floor(x2 + bl0), Math.floor(y2 + bl1), red, green, blue, alpha);
  }

  // ../phaser-genesis/src/renderer/webgl1/draw/FillRect.ts
  function FillRect(renderPass, x, y, width, height, red, green, blue, alpha) {
    const { F32, offset } = GetVertexBufferEntry(renderPass, 2);
    const textureIndex = renderPass.textures.setWhite();
    x = Math.round(x);
    y = Math.round(y);
    BatchQuad(F32, offset, textureIndex, x, y, x, y + height, x + width, y + height, x + width, y, red, green, blue, alpha);
  }

  // ../phaser-genesis/src/renderer/webgl1/draw/FillTriangle.ts
  function FillTriangle(renderPass, x1, y1, x2, y2, x3, y3, red, green, blue, alpha) {
    const { F32, offset } = GetVertexBufferEntry(renderPass, 1);
    const textureIndex = renderPass.textures.setWhite();
    BatchTriangle(F32, offset, textureIndex, x1, y1, x2, y2, x3, y3, red, green, blue, alpha);
  }

  // ../phaser-genesis/src/config/defaultorigin/SetDefaultOrigin.ts
  function SetDefaultOrigin(x = 0.5, y = x) {
    ConfigStore.set(CONFIG_DEFAULTS.DEFAULT_ORIGIN, { x, y });
  }

  // ../phaser-genesis/src/config/defaultorigin/GetDefaultOriginX.ts
  function GetDefaultOriginX() {
    return ConfigStore.get(CONFIG_DEFAULTS.DEFAULT_ORIGIN).x;
  }

  // ../phaser-genesis/src/config/defaultorigin/GetDefaultOriginY.ts
  function GetDefaultOriginY() {
    return ConfigStore.get(CONFIG_DEFAULTS.DEFAULT_ORIGIN).y;
  }

  // ../phaser-genesis/src/components/color/Color.ts
  var Color2 = class {
    constructor(id, red = 255, green = 255, blue = 255, alpha = 1) {
      __publicField(this, "id");
      __publicField(this, "colorMatrixEnabled", false);
      AddColorComponent(id);
      this.id = id;
      this.set(red, green, blue, alpha);
    }
    set(red, green, blue, alpha) {
      this.red = red;
      this.green = green;
      this.blue = blue;
      this.alpha = alpha;
    }
    set tint(value) {
      this.red = value >> 16 & 255;
      this.green = value >> 8 & 255;
      this.blue = value & 255;
    }
    get tint() {
      return this.red << 16 | this.green << 8 | this.blue;
    }
    set willColorChildren(value) {
      PermissionsComponent.willColorChildren[this.id] = Number(value);
    }
    get willColorChildren() {
      return Boolean(PermissionsComponent.willColorChildren[this.id]);
    }
    set colorMatrix(value) {
      ColorComponent.colorMatrix[this.id].set(value);
      this.colorMatrixEnabled = true;
    }
    get colorMatrix() {
      return ColorComponent.colorMatrix[this.id];
    }
    set colorOffset(value) {
      ColorComponent.colorOffset[this.id].set(value);
    }
    get colorOffset() {
      return ColorComponent.colorOffset[this.id];
    }
    set red(value) {
      ColorComponent.r[this.id] = value;
    }
    get red() {
      return ColorComponent.r[this.id];
    }
    set green(value) {
      ColorComponent.g[this.id] = value;
    }
    get green() {
      return ColorComponent.g[this.id];
    }
    set blue(value) {
      ColorComponent.b[this.id] = value;
    }
    get blue() {
      return ColorComponent.b[this.id];
    }
    set alpha(value) {
      ColorComponent.a[this.id] = value;
    }
    get alpha() {
      return ColorComponent.a[this.id];
    }
  };

  // ../phaser-genesis/src/display/RemoveChildrenBetween.ts
  function RemoveChildrenBetween(parent, beginIndex = 0, endIndex) {
    const parentID = parent.id;
    const children = GameObjectTree.get(parentID);
    if (endIndex === void 0) {
      endIndex = children.length;
    }
    const range = endIndex - beginIndex;
    if (range > 0 && range <= endIndex) {
      const removed2 = children.splice(beginIndex, range);
      removed2.forEach((childID) => {
        ClearWorldAndParentID(childID);
      });
      UpdateChildIndexes(parentID);
      return removed2.map((id) => GameObjectCache.get(id));
    } else {
      return [];
    }
  }

  // ../phaser-genesis/src/display/DestroyChildren.ts
  function DestroyChildren(parent, beginIndex = 0, endIndex) {
    const removed2 = RemoveChildrenBetween(parent, beginIndex, endIndex);
    removed2.forEach((child) => {
      child.destroy();
    });
    UpdateChildIndexes(parent.id);
    SetDirtyWorldDisplayList(parent.id);
  }

  // ../phaser-genesis/src/gameobjects/events/DestroyEvent.ts
  var DestroyEvent = "destroy";

  // ../phaser-genesis/src/events/Emit.ts
  function Emit(emitter, event, ...args) {
    if (emitter.events.size === 0 || !emitter.events.has(event)) {
      return false;
    }
    const listeners = emitter.events.get(event);
    const handlers = [...listeners];
    for (const ee of handlers) {
      ee.callback.apply(ee.context, args);
      if (ee.once) {
        listeners.delete(ee);
      }
    }
    if (listeners.size === 0) {
      emitter.events.delete(event);
    }
    return true;
  }

  // ../phaser-genesis/src/gameobjects/GameObjectTree.ts
  var GameObjectTree = new Map();

  // ../phaser-genesis/src/display/SetParent.ts
  function SetParent(parent, ...children) {
    children.forEach((child) => {
      AddChildAt(parent, child);
    });
    return children;
  }

  // ../phaser-genesis/src/display/ReparentChildren.ts
  function ReparentChildren(parent, newParent, beginIndex = 0, endIndex) {
    const moved = RemoveChildrenBetween(parent, beginIndex, endIndex);
    SetParent(newParent, ...moved);
    return moved;
  }

  // ../phaser-genesis/src/gameobjects/GameObject.ts
  var GameObject = class {
    constructor() {
      __publicField(this, "id", addEntity(GameObjectWorld));
      __publicField(this, "type", "GameObject");
      __publicField(this, "name", "");
      __publicField(this, "events");
      const id = this.id;
      AddHierarchyComponent(id);
      AddPermissionsComponent(id);
      AddDirtyComponent(id);
      GameObjectCache.set(id, this);
      GameObjectTree.set(id, []);
      this.events = new Map();
    }
    isRenderable() {
      return WillRender(this.id);
    }
    beforeUpdate(delta, time) {
    }
    update(delta, time) {
      this.beforeUpdate(delta, time);
      if (WillUpdateChildren(this.id)) {
        const children = GameObjectTree.get(this.id);
        for (let i = 0; i < children.length; i++) {
          const childID = children[i];
          if (WillUpdate(childID)) {
            GameObjectCache.get(childID).update(delta, time);
          }
        }
      }
      this.afterUpdate(delta, time);
    }
    afterUpdate(delta, time) {
    }
    preRenderGL(renderPass) {
    }
    renderGL(renderPass) {
    }
    renderCanvas(renderer) {
    }
    postRenderGL(renderPass) {
    }
    postRenderCanvas(renderer) {
    }
    set visible(value) {
      PermissionsComponent.visible[this.id] = Number(value);
      SetDirtyParents(this.id);
    }
    get visible() {
      return Boolean(PermissionsComponent.visible[this.id]);
    }
    set visibleChildren(value) {
      PermissionsComponent.visibleChildren[this.id] = Number(value);
      SetDirtyParents(this.id);
    }
    get visibleChildren() {
      return Boolean(PermissionsComponent.visibleChildren[this.id]);
    }
    set depth(value) {
      HierarchyComponent.depth[this.id] = value;
    }
    get depth() {
      return HierarchyComponent.depth[this.id];
    }
    hasParent(id) {
      if (id) {
        return HierarchyComponent.parentID[this.id] === id;
      } else {
        return HierarchyComponent.parentID[this.id] > 0;
      }
    }
    getParent() {
      return GetParentGameObject(this.id);
    }
    getChildren() {
      return GetChildrenFromParentID(this.id);
    }
    getNumChildren() {
      return GetNumChildren(this.id);
    }
    getDisplayData() {
      const id = this.id;
      return {
        id,
        index: HierarchyComponent.index[id],
        parent: HierarchyComponent.parentID[id],
        world: HierarchyComponent.worldID[id],
        worldDepth: HierarchyComponent.worldDepth[id],
        numChildren: HierarchyComponent.numChildren[id],
        children: GameObjectTree.get(id)
      };
    }
    toString() {
      return `${this.type} id="${this.id}" name="${this.name}"`;
    }
    destroy(reparentChildren) {
      if (reparentChildren) {
        ReparentChildren(this, reparentChildren);
      } else {
        DestroyChildren(this);
      }
      Emit(this, DestroyEvent, this);
      this.events.clear();
      this.events = null;
    }
  };

  // ../phaser-genesis/src/renderer/webgl1/renderpass/PopColor.ts
  function PopColor(renderPass, color) {
    if (color.colorMatrixEnabled && color.willColorChildren) {
      renderPass.colorMatrix.pop();
    }
  }

  // ../phaser-genesis/src/renderer/webgl1/renderpass/SetColor.ts
  function SetColor(renderPass, color) {
    if (color.colorMatrixEnabled && color.willColorChildren) {
      renderPass.colorMatrix.set(color);
    }
  }

  // ../phaser-genesis/src/gameobjects/container/Container.ts
  var Container = class extends GameObject {
    constructor(x = 0, y = 0) {
      super();
      __publicField(this, "type", "Container");
      __publicField(this, "position");
      __publicField(this, "scale");
      __publicField(this, "skew");
      __publicField(this, "origin");
      __publicField(this, "size");
      __publicField(this, "color");
      __publicField(this, "shader");
      const id = this.id;
      AddTransform2DComponent(id, x, y, GetDefaultOriginX(), GetDefaultOriginY());
      AddBoundsComponent(id);
      this.position = new Position(id, x, y);
      this.scale = new Scale(id);
      this.skew = new Skew(id);
      this.size = new Size(id);
      this.origin = new Origin(id, GetDefaultOriginX(), GetDefaultOriginY());
      this.color = new Color2(id);
    }
    renderGL(renderPass) {
      if (this.shader) {
        Flush(renderPass);
        renderPass.shader.set(this.shader, 0);
      }
      SetColor(renderPass, this.color);
      this.preRenderGL(renderPass);
    }
    postRenderGL(renderPass) {
      if (this.shader) {
        Flush(renderPass);
        renderPass.shader.pop();
      }
      PopColor(renderPass, this.color);
    }
    set x(value) {
      this.position.x = value;
    }
    get x() {
      return this.position.x;
    }
    set y(value) {
      this.position.y = value;
    }
    get y() {
      return this.position.y;
    }
    set rotation(value) {
      Transform2DComponent.rotation[this.id] = value;
    }
    get rotation() {
      return Transform2DComponent.rotation[this.id];
    }
    get alpha() {
      return this.color.alpha;
    }
    set alpha(value) {
      this.color.alpha = value;
    }
    setAlpha(value) {
      this.alpha = value;
      return this;
    }
    setPosition(x, y) {
      this.position.set(x, y);
      return this;
    }
    setScale(x, y) {
      this.scale.set(x, y);
      return this;
    }
    setRotation(value) {
      this.rotation = value;
      return this;
    }
    setSkew(x, y) {
      this.skew.set(x, y);
      return this;
    }
    setOrigin(x, y) {
      this.origin.set(x, y);
      return this;
    }
    destroy(reparentChildren) {
      super.destroy(reparentChildren);
    }
  };

  // ../phaser-genesis/src/gameobjects/sprite/SetFrame.ts
  function SetFrame(texture, key, ...children) {
    const frame2 = texture.getFrame(key);
    const pivot = frame2.pivot;
    children.forEach((child) => {
      if (!child || frame2 === child.frame) {
        return;
      }
      child.frame = frame2;
      child.hasTexture = true;
      if (pivot) {
        child.origin.set(pivot.x, pivot.y);
      }
      frame2.copyToExtent(child);
      frame2.copyToVertices(child.id);
    });
    return children;
  }

  // ../phaser-genesis/src/gameobjects/sprite/SetTexture.ts
  function SetTexture(key, frame2, ...children) {
    if (!key) {
      children.forEach((child) => {
        child.texture = null;
        child.frame = null;
        child.hasTexture = false;
      });
    } else {
      let texture;
      if (key instanceof Frame) {
        frame2 = key;
        texture = key.texture;
      } else if (key instanceof Texture) {
        texture = key;
      } else {
        texture = GetTexture(key);
      }
      if (!texture) {
        console.warn(`Invalid Texture key: ${key}`);
      } else {
        children.forEach((child) => {
          child.texture = texture;
        });
        SetFrame(texture, frame2, ...children);
      }
    }
    return children;
  }

  // ../phaser-genesis/src/gameobjects/sprite/Sprite.ts
  var Sprite = class extends Container {
    constructor(x, y, texture, frame2) {
      super(x, y);
      __publicField(this, "type", "Sprite");
      __publicField(this, "texture");
      __publicField(this, "frame");
      __publicField(this, "hasTexture", false);
      AddQuadVertex(this.id);
      this.setTexture(texture, frame2);
    }
    setTexture(key, frame2) {
      SetTexture(key, frame2, this);
      return this;
    }
    setFrame(key) {
      SetFrame(this.texture, key, this);
      return this;
    }
    isRenderable() {
      return this.visible && this.hasTexture && WillRender(this.id) && this.alpha > 0;
    }
    renderGL(renderPass) {
      const color = this.color;
      if (this.shader) {
        Flush(renderPass);
        renderPass.shader.set(this.shader, 0);
      }
      if (color.colorMatrixEnabled) {
        renderPass.colorMatrix.set(color);
      }
      this.preRenderGL(renderPass);
      BatchTexturedQuadBuffer(this.texture, this.id, renderPass);
      if (color.colorMatrixEnabled && !color.willColorChildren) {
        Flush(renderPass);
        renderPass.colorMatrix.pop();
      }
    }
    renderCanvas(renderer) {
      PreRenderVertices(this);
    }
    destroy(reparentChildren) {
      super.destroy(reparentChildren);
      this.texture = null;
      this.frame = null;
      this.hasTexture = false;
    }
  };

  // ../phaser-genesis/src/renderer/webgl1/draw/DrawTiles.ts
  function DrawTiles(renderPass, texture, tileWidth, tileHeight, mapData, mapWidth, x = 0, y = 0, alpha = 1) {
    let tx = 0;
    let ty = 0;
    let i = 0;
    mapData.forEach((tile) => {
      if (tile !== -1) {
        DrawFrame(renderPass, texture, tile, Math.floor(x + tx), Math.floor(y + ty), alpha);
      }
      i++;
      tx += tileWidth;
      if (i === mapWidth) {
        tx = 0;
        ty += tileHeight;
        i = 0;
      }
    });
  }

  // ../phaser-genesis/src/gameobjects/directdraw/DirectDraw.ts
  var DirectDraw = class extends GameObject {
    constructor() {
      super();
      __publicField(this, "type", "DirectDraw");
      __publicField(this, "red", 1);
      __publicField(this, "green", 1);
      __publicField(this, "blue", 1);
      __publicField(this, "alpha", 1);
      __publicField(this, "smoothness", 8);
      __publicField(this, "renderPass");
      __publicField(this, "_color");
    }
    set color(value) {
      if (value !== void 0 && value !== this._color) {
        this.red = (value >> 16 & 255) / 255;
        this.green = (value >> 8 & 255) / 255;
        this.blue = (value & 255) / 255;
        this._color = value;
      }
    }
    setRGB(red, green, blue, alpha = 1) {
      this.red = red / 255;
      this.green = green / 255;
      this.blue = blue / 255;
      this.alpha = alpha;
      return this;
    }
    arc(x, y, radius, startAngle = 0, endAngle = 6.283185307179586, anticlockwise = false, includeCenter = false, color) {
      this.color = color;
      FillArc(this.renderPass, x, y, radius, startAngle, endAngle, this.smoothness, anticlockwise, includeCenter, this.red, this.green, this.blue, this.alpha);
      return this;
    }
    circle(x, y, radius, color) {
      this.color = color;
      FillArc(this.renderPass, x, y, radius, 0, Math.PI * 2, this.smoothness, false, false, this.red, this.green, this.blue, this.alpha);
      return this;
    }
    plot(x, y, color) {
      this.color = color;
      FillRect(this.renderPass, x, y, 1, 1, this.red, this.green, this.blue, this.alpha);
      return this;
    }
    box(x, y, width, height, thickness = 1, color) {
      this.color = color;
      const tw = thickness * 0.5;
      this.line(x, y + tw, x + width, y + tw, thickness);
      this.line(x, y + height - tw, x + width, y + height - tw, thickness);
      this.line(x + tw, y + thickness, x + tw, y + height - thickness, thickness);
      this.line(x + width - tw, y + thickness, x + width - tw, y + height - thickness, thickness);
      return this;
    }
    rect(x, y, width, height, color) {
      this.color = color;
      FillRect(this.renderPass, x, y, width, height, this.red, this.green, this.blue, this.alpha);
      return this;
    }
    triangle(x1, y1, x2, y2, x3, y3, color) {
      this.color = color;
      FillTriangle(this.renderPass, x1, y1, x2, y2, x3, y3, this.red, this.green, this.blue, this.alpha);
      return this;
    }
    line(x1, y1, x2, y2, width, color) {
      this.color = color;
      FillLine(this.renderPass, x1, y1, x2, y2, width, this.red, this.green, this.blue, this.alpha);
      return this;
    }
    image(texture, x, y, alpha = 1, scaleX = 1, scaleY = 1) {
      DrawImage(this.renderPass, texture, x, y, alpha, scaleX, scaleY);
      return this;
    }
    imagePart(texture, x0, y0, x1, y1, dx, dy, dw, dh, alpha = 1) {
      DrawImagePart(this.renderPass, texture, x0, y0, x1, y1, dx, dy, dw, dh, alpha);
      return this;
    }
    frame(texture, frame2, x, y, alpha = 1, scaleX = 1, scaleY = 1) {
      DrawFrame(this.renderPass, texture, frame2, x, y, alpha, scaleX, scaleY);
      return this;
    }
    quad(texture, frame2, x0, y0, x1, y1, x2, y2, x3, y3, alpha = 1) {
      DrawQuad(this.renderPass, texture, frame2, x0, y0, x1, y1, x2, y2, x3, y3, alpha);
      return this;
    }
    tiles(texture, tileWidth, tileHeight, mapData, mapWidth, x = 0, y = 0) {
      DrawTiles(this.renderPass, texture, tileWidth, tileHeight, mapData, mapWidth, x, y, this.alpha);
      return this;
    }
    render() {
    }
    renderGL(renderPass) {
      this.renderPass = renderPass;
      this.render();
    }
  };

  // ../phaser-genesis/src/components/hierarchy/DepthFirstSearchFromParentID.ts
  function DepthFirstSearchFromParentID(parentID) {
    const stack = [parentID];
    const output = [];
    while (stack.length > 0) {
      const node = stack.shift();
      output.push(node);
      const nodeChildren = GameObjectTree.get(node);
      const numChildren = nodeChildren.length;
      if (numChildren > 0) {
        for (let i = numChildren - 1; i >= 0; i--) {
          stack.unshift(nodeChildren[i]);
        }
      }
    }
    output.shift();
    return output;
  }

  // ../phaser-genesis/src/components/hierarchy/GetChildrenFromParentID.ts
  function GetChildrenFromParentID(id) {
    const out = [];
    GameObjectTree.get(id).forEach((childID) => {
      out.push(GameObjectCache.get(childID));
    });
    return out;
  }

  // ../phaser-genesis/src/components/hierarchy/GetNumChildren.ts
  function GetNumChildren(id) {
    return HierarchyComponent.numChildren[id];
  }

  // ../phaser-genesis/src/components/hierarchy/GetParentGameObject.ts
  function GetParentGameObject(id) {
    return GameObjectCache.get(HierarchyComponent.parentID[id]);
  }

  // ../phaser-genesis/src/components/hierarchy/GetParentID.ts
  function GetParentID(id) {
    return HierarchyComponent.parentID[id];
  }

  // ../phaser-genesis/src/components/hierarchy/GetParents.ts
  function GetParents(id) {
    const results = [];
    let currentParent = GetParentID(id);
    while (currentParent) {
      results.push(currentParent);
      currentParent = GetParentID(currentParent);
    }
    return results;
  }

  // ../phaser-genesis/src/components/hierarchy/GetSiblingIDs.ts
  function GetSiblingIDs(childID) {
    const parentID = GetParentID(childID);
    return GameObjectTree.get(parentID);
  }

  // ../phaser-genesis/src/components/hierarchy/GetWorldID.ts
  function GetWorldID(id) {
    return HierarchyComponent.worldID[id];
  }

  // ../phaser-genesis/src/components/hierarchy/GetWorldFromParentID.ts
  function GetWorldFromParentID(parentID) {
    const worldID = GetWorldID(parentID);
    return GameObjectCache.get(worldID);
  }

  // ../phaser-genesis/src/components/hierarchy/SetIndex.ts
  function SetIndex(id, index) {
    HierarchyComponent.index[id] = index;
  }

  // ../phaser-genesis/src/components/hierarchy/UpdateNumChildren.ts
  function UpdateNumChildren(id) {
    HierarchyComponent.numChildren[id] = GameObjectTree.get(id).length;
  }

  // ../phaser-genesis/src/components/hierarchy/SetParentID.ts
  function SetParentID(childID, parentID) {
    HierarchyComponent.parentID[childID] = parentID;
    UpdateNumChildren(parentID);
  }

  // ../phaser-genesis/src/components/hierarchy/SetWorldDepth.ts
  function SetWorldDepth(id, worldDepth) {
    HierarchyComponent.worldDepth[id] = worldDepth;
  }

  // ../phaser-genesis/src/components/hierarchy/SetWorldID.ts
  function SetWorldID(id, worldID) {
    HierarchyComponent.worldID[id] = worldID;
  }

  // ../phaser-genesis/src/components/hierarchy/UpdateChildIndexes.ts
  function UpdateChildIndexes(parentID) {
    const children = GameObjectTree.get(parentID);
    for (let i = 0; i < children.length; i++) {
      SetIndex(children[i], i);
    }
  }

  // ../phaser-genesis/src/components/hierarchy/UpdateIndexes.ts
  function UpdateIndexes(id) {
    const parentID = GetParentID(id);
    const children = GameObjectTree.get(parentID);
    for (let i = 0; i < children.length; i++) {
      SetIndex(children[i], i);
    }
  }

  // ../phaser-genesis/src/display/IsValidParent.ts
  function IsValidParent(parent, child) {
    return !(child.id === parent.id || parent.id === GetParentID(child.id));
  }

  // ../phaser-genesis/src/display/GetChildIndex.ts
  function GetChildIndex(child) {
    return HierarchyComponent.index[child.id];
  }

  // ../phaser-genesis/src/display/RemoveChildAt.ts
  function RemoveChildAt(parent, index) {
    const parentID = parent.id;
    const children = GameObjectTree.get(parentID);
    if (index >= 0 && index < children.length) {
      const removedID = children.splice(index, 1)[0];
      if (removedID) {
        ClearWorldAndParentID(removedID);
        UpdateChildIndexes(parentID);
        return GameObjectCache.get(removedID);
      }
    }
  }

  // ../phaser-genesis/src/display/RemoveChild.ts
  function RemoveChild(parent, child) {
    if (parent && child.hasParent(parent.id)) {
      RemoveChildAt(parent, GetChildIndex(child));
    }
    return child;
  }

  // ../phaser-genesis/src/display/SetWorld.ts
  function SetWorld(world2, ...entries) {
    const worldID = world2.id;
    const worldTag = world2.tag;
    entries.forEach((entry) => {
      addComponent(GameObjectWorld, worldTag, entry.id);
      HierarchyComponent.worldID[entry.id] = worldID;
      const children = DepthFirstSearchFromParentID(entry.id);
      children.map((id) => {
        addComponent(GameObjectWorld, worldTag, id);
        HierarchyComponent.worldID[id] = worldID;
      });
    });
    SetDirtyDisplayList(worldID);
    return entries;
  }

  // ../phaser-genesis/src/display/AddChildAt.ts
  function AddChildAt(parent, child, index = -1) {
    if (IsValidParent(parent, child)) {
      const childID = child.id;
      const parentID = parent.id;
      const world2 = GetWorldFromParentID(parentID);
      const children = GameObjectTree.get(parentID);
      if (index === -1) {
        index = children.length;
      }
      if (index >= 0 && index <= children.length) {
        RemoveChild(child.getParent(), child);
        children.splice(index, 0, childID);
        InvalidateLocalMatrix2DComponent(child.id);
        if (world2) {
          SetWorld(world2, child);
        }
        SetParentID(childID, parentID);
        UpdateIndexes(childID);
        SetDirtyParents(childID);
      }
    }
    return child;
  }

  // ../phaser-genesis/src/display/AddChild.ts
  function AddChild(parent, child) {
    return AddChildAt(parent, child);
  }

  // ../phaser-genesis/src/display/BringChildToTop.ts
  function BringChildToTop(child) {
    const childID = child.id;
    const currentIndex = GetChildIndex(child);
    const children = GetSiblingIDs(childID);
    if (currentIndex !== -1 && currentIndex < children.length) {
      children.splice(currentIndex, 1);
      children.push(childID);
      UpdateIndexes(childID);
      SetDirtyWorldDisplayList(childID);
    }
    return child;
  }

  // ../phaser-genesis/src/display/RemoveChildren.ts
  function RemoveChildren(parent, ...children) {
    children.forEach((child) => {
      RemoveChild(parent, child);
    });
    return children;
  }

  // ../phaser-genesis/src/config/backgroundcolor/SetBackgroundColor.ts
  function SetBackgroundColor(color) {
    ConfigStore.set(CONFIG_DEFAULTS.BACKGROUND_COLOR, color);
  }

  // ../phaser-genesis/src/config/backgroundcolor/BackgroundColor.ts
  function BackgroundColor(color) {
    return () => {
      SetBackgroundColor(color);
    };
  }

  // ../phaser-genesis/src/config/banner/SetBanner.ts
  function SetBanner(title = "", version = "", url = "", color = "#fff", background = "linear-gradient(#3e0081 40%, #00bcc3)") {
    ConfigStore.set(CONFIG_DEFAULTS.BANNER, { title, version, url, color, background });
  }

  // ../phaser-genesis/src/config/batchsize/SetBatchSize.ts
  function SetBatchSize(size) {
    ConfigStore.set(CONFIG_DEFAULTS.BATCH_SIZE, size);
  }

  // ../phaser-genesis/src/config/backgroundcolor/GetBackgroundColor.ts
  function GetBackgroundColor() {
    return ConfigStore.get(CONFIG_DEFAULTS.BACKGROUND_COLOR);
  }

  // ../phaser-genesis/src/config/renderer/SetRenderer.ts
  function SetRenderer(renderer) {
    ConfigStore.set(CONFIG_DEFAULTS.RENDERER, renderer);
  }

  // ../phaser-genesis/src/config/globalvar/SetGlobalVar.ts
  function SetGlobalVar(name) {
    ConfigStore.set(CONFIG_DEFAULTS.GLOBAL_VAR, name);
  }

  // ../phaser-genesis/src/config/globalvar/GlobalVar.ts
  function GlobalVar(name) {
    return () => {
      SetGlobalVar(name);
    };
  }

  // ../phaser-genesis/src/dom/GetElement.ts
  function GetElement(target) {
    let element;
    if (target) {
      if (typeof target === "string") {
        element = document.getElementById(target);
      } else if (typeof target === "object" && target.nodeType === 1) {
        element = target;
      }
    }
    if (!element) {
      element = document.body;
    }
    return element;
  }

  // ../phaser-genesis/src/config/parent/SetParent.ts
  function SetParent2(parentElement) {
    if (parentElement) {
      ConfigStore.set(CONFIG_DEFAULTS.PARENT, GetElement(parentElement));
    }
  }

  // ../phaser-genesis/src/config/parent/Parent.ts
  function Parent(parentElement) {
    return () => {
      SetParent2(parentElement);
    };
  }

  // ../phaser-genesis/src/config/scenes/SetScenes.ts
  function SetScenes(scenes) {
    ConfigStore.set(CONFIG_DEFAULTS.SCENES, [].concat(scenes));
  }

  // ../phaser-genesis/src/config/scenes/Scenes.ts
  function Scenes(scenes) {
    return () => {
      SetScenes(scenes);
    };
  }

  // ../phaser-genesis/src/renderer/webgl1/textures/GetCompressedTextures.ts
  function GetCompressedTextures(gl2) {
    const extString = "WEBGL_compressed_texture_";
    const wkExtString = "WEBKIT_" + extString;
    const hasExt = (format) => {
      const results = gl2.getExtension(extString + format) || gl2.getExtension(wkExtString + format);
      if (results) {
        const glEnums = {};
        for (const key in results) {
          glEnums[results[key]] = key;
        }
        return glEnums;
      }
    };
    return {
      ETC: hasExt("etc"),
      ETC1: hasExt("etc1"),
      ATC: hasExt("atc"),
      ASTC: hasExt("astc"),
      BPTC: hasExt("bptc"),
      RGTC: hasExt("rgtc"),
      PVRTC: hasExt("pvrtc"),
      S3TC: hasExt("s3tc"),
      S3TCSRGB: hasExt("s3tc_srgb"),
      IMG: true
    };
  }

  // ../phaser-genesis/src/renderer/webgl1/colors/GetRGBArray.ts
  function GetRGBArray(color, output = []) {
    const r = color >> 16 & 255;
    const g = color >> 8 & 255;
    const b = color & 255;
    const a = color > 16777215 ? color >>> 24 : 255;
    output[0] = r / 255;
    output[1] = g / 255;
    output[2] = b / 255;
    output[3] = a / 255;
    return output;
  }

  // ../phaser-genesis/src/config/webglcontext/GetWebGLContext.ts
  function GetWebGLContext() {
    return ConfigStore.get(CONFIG_DEFAULTS.WEBGL_CONTEXT);
  }

  // ../phaser-genesis/src/renderer/webgl1/WebGLRendererInstance.ts
  var instance4;
  var WebGLRendererInstance = {
    get: () => {
      return instance4;
    },
    set: (renderer) => {
      instance4 = renderer;
    }
  };

  // ../phaser-genesis/src/world/WorldList.ts
  var WorldList = new Map();

  // ../phaser-genesis/src/renderer/webgl1/WebGLRenderer.ts
  var WebGLRenderer = class {
    constructor() {
      __publicField(this, "canvas");
      __publicField(this, "gl");
      __publicField(this, "renderPass");
      __publicField(this, "clearColor", [0, 0, 0, 1]);
      __publicField(this, "width");
      __publicField(this, "height");
      __publicField(this, "resolution");
      __publicField(this, "clearBeforeRender", true);
      __publicField(this, "optimizeRedraw", true);
      __publicField(this, "autoResize", true);
      __publicField(this, "contextLost", false);
      __publicField(this, "compression");
      this.width = GetWidth();
      this.height = GetHeight();
      this.resolution = GetResolution();
      this.setBackgroundColor(GetBackgroundColor());
      const canvas = document.createElement("canvas");
      canvas.addEventListener("webglcontextlost", (event) => this.onContextLost(event), false);
      canvas.addEventListener("webglcontextrestored", () => this.onContextRestored(), false);
      this.canvas = canvas;
      this.initContext();
      WebGLRendererInstance.set(this);
      this.renderPass = new RenderPass(this);
      this.resize(this.width, this.height, this.resolution);
      ProcessBindingQueue();
    }
    initContext() {
      const gl2 = this.canvas.getContext("webgl", GetWebGLContext());
      GL.set(gl2);
      this.gl = gl2;
      this.compression = GetCompressedTextures(gl2);
      gl2.disable(gl2.DEPTH_TEST);
      gl2.disable(gl2.CULL_FACE);
    }
    resize(width, height, resolution = 1) {
      const calcWidth = width * resolution;
      const calcHeight = height * resolution;
      this.width = calcWidth;
      this.height = calcHeight;
      this.resolution = resolution;
      const canvas = this.canvas;
      canvas.width = calcWidth;
      canvas.height = calcHeight;
      if (this.autoResize) {
        canvas.style.width = width.toString() + "px";
        canvas.style.height = height.toString() + "px";
      }
      this.renderPass.resize(calcWidth, calcHeight);
    }
    onContextLost(event) {
      event.preventDefault();
      this.contextLost = true;
    }
    onContextRestored() {
      this.contextLost = false;
      this.initContext();
    }
    setBackgroundColor(color) {
      GetRGBArray(color, this.clearColor);
      return this;
    }
    reset() {
    }
    render(willRedraw, scenes) {
      if (this.contextLost) {
        return;
      }
      const gl2 = this.gl;
      const renderPass = this.renderPass;
      gl2.getContextAttributes();
      ProcessBindingQueue();
      if (this.optimizeRedraw && !willRedraw) {
      }
      if (this.clearBeforeRender) {
        const cls = this.clearColor;
        gl2.clearColor(cls[0], cls[1], cls[2], cls[3]);
        gl2.clear(gl2.COLOR_BUFFER_BIT);
      }
      Start(renderPass);
      for (const scene of scenes.values()) {
        const worlds2 = WorldList.get(scene);
        for (const world2 of worlds2) {
          if (world2.runRender) {
            world2.renderGL(renderPass);
          }
          world2.postRenderGL(renderPass);
        }
      }
      End(renderPass);
    }
    destroy() {
      WebGLRendererInstance.set(void 0);
    }
  };

  // ../phaser-genesis/src/config/webgl/WebGL.ts
  function WebGL() {
    return () => {
      SetRenderer(WebGLRenderer);
    };
  }

  // ../phaser-genesis/src/config/webglcontext/SetWebGLContext.ts
  function SetWebGLContext(contextAttributes) {
    ConfigStore.set(CONFIG_DEFAULTS.WEBGL_CONTEXT, contextAttributes);
  }

  // ../phaser-genesis/src/config/worldsize/SetWorldSize.ts
  function SetWorldSize(size) {
    ConfigStore.set(CONFIG_DEFAULTS.WORLD_SIZE, size);
  }

  // ../phaser-genesis/src/dom/AddToDOM.ts
  function AddToDOM(element, parent) {
    const target = GetElement(parent);
    target.appendChild(element);
    return element;
  }

  // ../phaser-genesis/src/dom/DOMContentLoaded.ts
  function DOMContentLoaded(callback) {
    const readyState = document.readyState;
    if (readyState === "complete" || readyState === "interactive") {
      callback();
      return;
    }
    const check = () => {
      document.removeEventListener("deviceready", check, true);
      document.removeEventListener("DOMContentLoaded", check, true);
      window.removeEventListener("load", check, true);
      callback();
    };
    if (!document.body) {
      window.setTimeout(check, 20);
    } else if (window.hasOwnProperty("cordova")) {
      document.addEventListener("deviceready", check, true);
    } else {
      document.addEventListener("DOMContentLoaded", check, true);
      window.addEventListener("load", check, true);
    }
  }

  // ../phaser-genesis/src/events/EventEmitter.ts
  var EventEmitter = class {
    constructor() {
      __publicField(this, "events");
      this.events = new Map();
    }
  };

  // ../phaser-genesis/src/events/EventInstance.ts
  var EventInstance = class {
    constructor(callback, context, once = false) {
      __publicField(this, "callback");
      __publicField(this, "context");
      __publicField(this, "once");
      this.callback = callback;
      this.context = context;
      this.once = once;
    }
  };

  // ../phaser-genesis/src/events/On.ts
  function On(emitter, event, callback, context = emitter, once = false) {
    if (typeof callback !== "function") {
      throw new TypeError("Listener not a function");
    }
    const listener = new EventInstance(callback, context, once);
    const listeners = emitter.events.get(event);
    if (!listeners) {
      emitter.events.set(event, new Set([listener]));
    } else {
      listeners.add(listener);
    }
    return listener;
  }

  // ../phaser-genesis/src/events/Once.ts
  function Once(emitter, event, callback, context = emitter) {
    return On(emitter, event, callback, context, true);
  }

  // ../phaser-genesis/src/config/banner/GetBanner.ts
  function GetBanner() {
    const { title, version, url, color, background } = ConfigStore.get(CONFIG_DEFAULTS.BANNER);
    if (title !== "") {
      const str = version !== "" ? title + " " + version : title;
      console.log(`%c${str}%c ${url}`, `padding: 4px 16px; color: ${color}; background: ${background}`, "");
    }
  }

  // ../phaser-genesis/src/config/globalvar/GetGlobalVar.ts
  function GetGlobalVar() {
    return ConfigStore.get(CONFIG_DEFAULTS.GLOBAL_VAR);
  }

  // ../phaser-genesis/src/config/parent/GetParent.ts
  function GetParent() {
    return ConfigStore.get(CONFIG_DEFAULTS.PARENT);
  }

  // ../phaser-genesis/src/scenes/RenderStatsComponent.ts
  var RenderStats = defineComponent({
    gameFrame: Types.ui32,
    numScenes: Types.ui8,
    numWorlds: Types.ui8,
    numGameObjects: Types.ui32,
    numGameObjectsRendered: Types.ui32,
    numDirtyLocalTransforms: Types.ui32,
    numDirtyWorldTransforms: Types.ui32,
    numDirtyVertices: Types.ui32,
    numDirtyWorldLists: Types.ui8,
    numDirtyCameras: Types.ui32
  });
  var RenderStatsComponent = RenderStats;

  // ../phaser-genesis/src/scenes/AddRenderStatsComponent.ts
  function AddRenderStatsComponent(id) {
    addComponent(GameObjectWorld, RenderStatsComponent, id);
  }

  // ../phaser-genesis/src/scenes/GetConfigValue.ts
  function GetConfigValue(config, property, defaultValue) {
    if (Object.prototype.hasOwnProperty.call(config, property)) {
      return config[property];
    } else {
      return defaultValue;
    }
  }

  // ../phaser-genesis/src/scenes/SceneManagerInstance.ts
  var instance5;
  var SceneManagerInstance = {
    get: () => {
      return instance5;
    },
    set: (manager) => {
      if (instance5) {
        throw new Error("SceneManager should not be instantiated more than once");
      }
      instance5 = manager;
    }
  };

  // ../phaser-genesis/src/scenes/GetRenderStatsAsObject.ts
  function GetRenderStatsAsObject(obj) {
    const id = SceneManagerInstance.get().id;
    if (!obj) {
      obj = { fps: 0, delta: 0, gameFrame: 0, numScenes: 0, numWorlds: 0, numGameObjects: 0, numGameObjectsRendered: 0, numDirtyLocalTransforms: 0, numDirtyWorldTransforms: 0, numDirtyVertices: 0, numDirtyWorldLists: 0, numDirtyCameras: 0 };
    }
    obj.gameFrame = RenderStatsComponent.gameFrame[id];
    obj.numScenes = RenderStatsComponent.numScenes[id];
    obj.numWorlds = RenderStatsComponent.numWorlds[id];
    obj.numGameObjects = RenderStatsComponent.numGameObjects[id];
    obj.numGameObjectsRendered = RenderStatsComponent.numGameObjectsRendered[id];
    obj.numDirtyLocalTransforms = RenderStatsComponent.numDirtyLocalTransforms[id];
    obj.numDirtyWorldTransforms = RenderStatsComponent.numDirtyWorldTransforms[id];
    obj.numDirtyVertices = RenderStatsComponent.numDirtyVertices[id];
    obj.numDirtyWorldLists = RenderStatsComponent.numDirtyWorldLists[id];
    obj.numDirtyCameras = RenderStatsComponent.numDirtyCameras[id];
    return obj;
  }

  // ../phaser-genesis/src/scenes/Install.ts
  function Install(scene, config = {}) {
    const sceneManager = SceneManagerInstance.get();
    const size = sceneManager.scenes.size;
    const sceneIndex = sceneManager.sceneIndex;
    const firstScene = size === 0;
    if (typeof config === "string") {
      scene.key = config;
    } else if (config || !config && firstScene) {
      scene.key = GetConfigValue(config, "key", "scene" + sceneIndex.toString());
    }
    if (sceneManager.scenes.has(scene.key)) {
      console.warn("Scene key already in use: " + scene.key);
    } else {
      sceneManager.scenes.set(scene.key, scene);
      sceneManager.flush = true;
      sceneManager.sceneIndex++;
    }
    WorldList.set(scene, []);
  }

  // ../phaser-genesis/src/scenes/ResetRenderStats.ts
  function ResetRenderStats(id, gameFrame, scenes) {
    RenderStatsComponent.gameFrame[id] = gameFrame;
    RenderStatsComponent.numScenes[id] = scenes;
    RenderStatsComponent.numWorlds[id] = 0;
    RenderStatsComponent.numGameObjects[id] = 0;
    RenderStatsComponent.numGameObjectsRendered[id] = 0;
    RenderStatsComponent.numDirtyWorldLists[id] = 0;
    RenderStatsComponent.numDirtyVertices[id] = 0;
    RenderStatsComponent.numDirtyLocalTransforms[id] = 0;
    RenderStatsComponent.numDirtyWorldTransforms[id] = 0;
    RenderStatsComponent.numDirtyCameras[id] = 0;
  }

  // ../phaser-genesis/src/scenes/Scene.ts
  var Scene = class {
    constructor(config) {
      __publicField(this, "key");
      __publicField(this, "game");
      __publicField(this, "events");
      this.game = GameInstance.get();
      this.events = new Map();
      Install(this, config);
    }
  };

  // ../phaser-genesis/src/config/scenes/GetScenes.ts
  function GetScenes() {
    return ConfigStore.get(CONFIG_DEFAULTS.SCENES);
  }

  // ../phaser-genesis/src/scenes/SceneManager.ts
  var SceneManager = class {
    constructor() {
      __publicField(this, "id", addEntity(GameObjectWorld));
      __publicField(this, "game");
      __publicField(this, "scenes", new Map());
      __publicField(this, "sceneIndex", 0);
      __publicField(this, "flush");
      this.game = GameInstance.get();
      SceneManagerInstance.set(this);
      AddRenderStatsComponent(this.id);
      Once(this.game, "boot", () => this.boot());
    }
    boot() {
      GetScenes().forEach((scene) => new scene());
    }
    update(delta, time, gameFrame) {
      ResetRenderStats(this.id, gameFrame, this.scenes.size);
      for (const scene of this.scenes.values()) {
        const worlds2 = WorldList.get(scene);
        for (const world2 of worlds2) {
          world2.beforeUpdate(delta, time);
        }
        for (const world2 of worlds2) {
          world2.update(delta, time);
        }
        for (const world2 of worlds2) {
          world2.afterUpdate(delta, time);
        }
      }
    }
    preRender(gameFrame) {
      for (const scene of this.scenes.values()) {
        const worlds2 = WorldList.get(scene);
        for (const world2 of worlds2) {
          if (world2.preRender(gameFrame)) {
            this.flush = true;
          }
        }
      }
      PackQuadColorsSystem(GameObjectWorld);
    }
    getRenderList() {
      let output = [];
      for (const scene of this.scenes.values()) {
        const worlds2 = WorldList.get(scene);
        for (const world2 of worlds2) {
          output = output.concat(world2.getRenderList());
        }
      }
      return output;
    }
    updateWorldStats(numGameObjects, numRendered, numDisplayLists, numWorldTransforms) {
      const id = this.id;
      RenderStatsComponent.numGameObjects[id] += numGameObjects;
      RenderStatsComponent.numGameObjectsRendered[id] += numRendered;
      RenderStatsComponent.numDirtyWorldLists[id] += numDisplayLists;
      RenderStatsComponent.numDirtyWorldTransforms[id] += numWorldTransforms;
    }
  };

  // ../phaser-genesis/src/config/renderer/GetRenderer.ts
  function GetRenderer() {
    return ConfigStore.get(CONFIG_DEFAULTS.RENDERER);
  }

  // ../phaser-genesis/src/config/SetConfigDefaults.ts
  function SetConfigDefaults() {
    SetBackgroundColor(0);
    SetBatchSize(4096);
    SetBanner("Phaser", "4.0.0", "https://phaser4.io");
    SetMaxTextures(0);
    SetDefaultOrigin(0.5, 0.5);
    SetSize(800, 600, 1);
    SetWebGLContext({
      antialias: true,
      desynchronized: true,
      preserveDrawingBuffer: true
    });
    SetWorldSize(512);
  }

  // ../phaser-genesis/src/Game.ts
  var Game = class extends EventEmitter {
    constructor(...settings) {
      super();
      __publicField(this, "id", addEntity(GameObjectWorld));
      __publicField(this, "VERSION", "4.0.0-beta1");
      __publicField(this, "isBooted", false);
      __publicField(this, "isPaused", false);
      __publicField(this, "willUpdate", true);
      __publicField(this, "willRender", true);
      __publicField(this, "lastTick", 0);
      __publicField(this, "elapsed", 0);
      __publicField(this, "delta", 0);
      __publicField(this, "fps", 0);
      __publicField(this, "frame", 0);
      __publicField(this, "framems", 0);
      __publicField(this, "frames", 0);
      __publicField(this, "prevFrame", 0);
      __publicField(this, "renderStats");
      __publicField(this, "renderer");
      __publicField(this, "textureManager");
      __publicField(this, "sceneManager");
      GameInstance.set(this);
      SetConfigDefaults();
      DOMContentLoaded(() => this.boot(settings));
    }
    boot(settings) {
      settings.forEach((setting) => setting());
      const renderer = GetRenderer();
      this.textureManager = new TextureManager();
      this.renderer = new renderer();
      this.sceneManager = new SceneManager();
      const parent = GetParent();
      if (parent) {
        AddToDOM(this.renderer.canvas, parent);
      }
      const globalVar = GetGlobalVar();
      if (globalVar && window) {
        window[globalVar] = this;
      }
      this.isBooted = true;
      GetBanner();
      Emit(this, "boot");
      const now = performance.now();
      this.lastTick = now;
      this.prevFrame = now;
      this.renderStats = GetRenderStatsAsObject();
      this.step(now);
    }
    pause() {
      this.isPaused = true;
    }
    resume() {
      this.isPaused = false;
      this.lastTick = performance.now();
    }
    step(time) {
      const renderer = this.renderer;
      const sceneManager = this.sceneManager;
      this.framems = time - this.lastTick;
      if (!this.isPaused) {
        if (this.willUpdate) {
          sceneManager.update(this.delta, time, this.frame);
        }
        Emit(this, "update", this.framems, time);
        if (this.willRender) {
          sceneManager.preRender(this.frame);
          renderer.render(sceneManager.flush, sceneManager.scenes);
          sceneManager.flush = false;
        }
      }
      const now = performance.now();
      const delta = now - time;
      this.frames++;
      if (now >= this.prevFrame + 1e3) {
        this.fps = this.frames * 1e3 / (now - this.prevFrame);
        this.prevFrame = now;
        this.frames = 0;
      }
      this.lastTick = now;
      this.elapsed += delta;
      this.delta = delta;
      GetRenderStatsAsObject(this.renderStats);
      this.renderStats.fps = this.fps;
      this.renderStats.delta = delta;
      Emit(this, "step");
      this.frame++;
      GameInstance.setFrame(this.frame);
      GameInstance.setElapsed(this.elapsed);
      requestAnimationFrame((now2) => this.step(now2));
    }
    destroy() {
    }
  };

  // ../phaser-genesis/src/loader/File.ts
  var File = class {
    constructor(key, url, config) {
      __publicField(this, "key");
      __publicField(this, "url");
      __publicField(this, "responseType", "text");
      __publicField(this, "crossOrigin");
      __publicField(this, "data");
      __publicField(this, "error");
      __publicField(this, "config");
      __publicField(this, "skipCache", false);
      __publicField(this, "hasLoaded", false);
      __publicField(this, "loader");
      __publicField(this, "load");
      this.key = key;
      this.url = url;
      this.config = config;
    }
  };

  // ../phaser-genesis/src/loader/GetURL.ts
  function GetURL(key, url, extension, loader) {
    if (!url) {
      url = key + extension;
    }
    if (/^(?:blob:|data:|http:\/\/|https:\/\/|\/\/)/.exec(url)) {
      return url;
    } else if (loader) {
      return loader.baseURL + loader.path + url;
    } else {
      return url;
    }
  }

  // ../phaser-genesis/src/loader/ImageLoader.ts
  function ImageTagLoader(file) {
    const fileCast = file;
    fileCast.data = new Image();
    if (fileCast.crossOrigin) {
      fileCast.data.crossOrigin = file.crossOrigin;
    }
    return new Promise((resolve, reject) => {
      fileCast.data.onload = () => {
        if (fileCast.data.onload) {
          fileCast.data.onload = null;
          fileCast.data.onerror = null;
          resolve(fileCast);
        }
      };
      fileCast.data.onerror = (event) => {
        if (fileCast.data.onload) {
          fileCast.data.onload = null;
          fileCast.data.onerror = null;
          fileCast.error = event;
          reject(fileCast);
        }
      };
      fileCast.data.src = file.url;
      if (fileCast.data.complete && fileCast.data.width && fileCast.data.height) {
        fileCast.data.onload = null;
        fileCast.data.onerror = null;
        resolve(fileCast);
      }
    });
  }

  // ../phaser-genesis/src/loader/files/ImageFile.ts
  function ImageFile(key, url, glConfig) {
    const file = new File(key, url);
    file.load = () => {
      file.url = GetURL(file.key, file.url, ".png", file.loader);
      if (file.loader) {
        file.crossOrigin = file.loader.crossOrigin;
      }
      return new Promise((resolve, reject) => {
        const textureManager = TextureManagerInstance.get();
        if (textureManager.has(file.key)) {
          resolve(file);
        } else {
          ImageTagLoader(file).then((file2) => {
            textureManager.add(file2.key, file2.data, glConfig);
            resolve(file2);
          }).catch((file2) => {
            reject(file2);
          });
        }
      });
    };
    return file;
  }

  // ../phaser-genesis/src/input/keyboard/Keyboard.ts
  var Keyboard = class extends EventEmitter {
    constructor() {
      super();
      __publicField(this, "keys");
      __publicField(this, "keydownHandler");
      __publicField(this, "keyupHandler");
      __publicField(this, "blurHandler");
      __publicField(this, "keyConversion", {
        Up: "ArrowUp",
        Down: "ArrowDown",
        Left: "ArrowLeft",
        Right: "ArrowRight",
        Spacebar: " ",
        Win: "Meta",
        Scroll: "ScrollLock",
        Del: "Delete",
        Apps: "ContextMenu",
        Esc: "Escape",
        Add: "+",
        Subtract: "-",
        Multiply: "*",
        Decimal: ".",
        Divide: "/"
      });
      this.keydownHandler = (event) => this.onKeyDown(event);
      this.keyupHandler = (event) => this.onKeyUp(event);
      this.blurHandler = () => this.onBlur();
      window.addEventListener("keydown", this.keydownHandler);
      window.addEventListener("keyup", this.keyupHandler);
      window.addEventListener("blur", this.blurHandler);
      this.keys = new Map();
    }
    addKeys(...keys) {
      keys.forEach((key) => {
        this.keys.set(key.getValue(), key);
      });
    }
    clearKeys() {
      this.keys.clear();
    }
    onBlur() {
      this.keys.forEach((key) => {
        key.reset();
      });
    }
    getKeyValue(key) {
      if (this.keyConversion.hasOwnProperty(key)) {
        return this.keyConversion[key];
      } else {
        return key;
      }
    }
    onKeyDown(event) {
      const value = this.getKeyValue(event.key);
      if (this.keys.has(value)) {
        const key = this.keys.get(value);
        key.down(event);
      }
      Emit(this, "keydown-" + value, event);
      Emit(this, "keydown", event);
    }
    onKeyUp(event) {
      const value = this.getKeyValue(event.key);
      if (this.keys.has(value)) {
        const key = this.keys.get(value);
        key.up(event);
      }
      Emit(this, "keyup-" + value, event);
      Emit(this, "keyup", event);
    }
    destroy() {
      window.removeEventListener("keydown", this.keydownHandler);
      window.removeEventListener("keyup", this.keyupHandler);
      window.removeEventListener("blur", this.blurHandler);
      Emit(this, "destroy");
    }
  };

  // ../phaser-genesis/src/input/mouse/Mouse.ts
  var Mouse = class extends EventEmitter {
    constructor(target) {
      super();
      __publicField(this, "primaryDown", false);
      __publicField(this, "auxDown", false);
      __publicField(this, "secondaryDown", false);
      __publicField(this, "blockContextMenu", true);
      __publicField(this, "localPoint");
      __publicField(this, "hitPoint");
      __publicField(this, "target");
      __publicField(this, "resolution", 1);
      __publicField(this, "mousedownHandler");
      __publicField(this, "mouseupHandler");
      __publicField(this, "mousemoveHandler");
      __publicField(this, "mousewheelHandler");
      __publicField(this, "contextmenuHandler");
      __publicField(this, "blurHandler");
      __publicField(this, "transPoint");
      this.mousedownHandler = (event) => this.onMouseDown(event);
      this.mouseupHandler = (event) => this.onMouseUp(event);
      this.mousemoveHandler = (event) => this.onMouseMove(event);
      this.mousewheelHandler = (event) => this.onMouseWheel(event);
      this.contextmenuHandler = (event) => this.onContextMenuEvent(event);
      this.blurHandler = () => this.onBlur();
      this.localPoint = new Vec2();
      this.hitPoint = new Vec2();
      this.transPoint = new Vec2();
      if (!target) {
        target = GameInstance.get().renderer.canvas;
      }
      target.addEventListener("mousedown", this.mousedownHandler);
      target.addEventListener("mouseup", this.mouseupHandler);
      target.addEventListener("wheel", this.mousewheelHandler, { passive: false });
      target.addEventListener("contextmenu", this.contextmenuHandler);
      window.addEventListener("mouseup", this.mouseupHandler);
      window.addEventListener("mousemove", this.mousemoveHandler);
      window.addEventListener("blur", this.blurHandler);
      this.target = target;
    }
    onBlur() {
    }
    onMouseDown(event) {
      this.positionToPoint(event);
      this.primaryDown = event.button === 0;
      this.auxDown = event.button === 1;
      this.secondaryDown = event.button === 2;
      Emit(this, "pointerdown", this.localPoint.x, this.localPoint.y, event.button, event);
    }
    onMouseUp(event) {
      this.positionToPoint(event);
      this.primaryDown = !(event.button === 0);
      this.auxDown = !(event.button === 1);
      this.secondaryDown = !(event.button === 2);
      Emit(this, "pointerup", this.localPoint.x, this.localPoint.y, event.button, event);
    }
    onMouseMove(event) {
      this.positionToPoint(event);
      Emit(this, "pointermove", this.localPoint.x, this.localPoint.y, event);
    }
    onMouseWheel(event) {
      Emit(this, "wheel", event.deltaX, event.deltaY, event.deltaZ, event);
    }
    onContextMenuEvent(event) {
      if (this.blockContextMenu) {
        event.preventDefault();
      }
      Emit(this, "contextmenu", event);
    }
    positionToPoint(event) {
      return this.localPoint.set(event.offsetX, event.offsetY);
    }
    getInteractiveChildren(parent, results) {
      const children = parent.children;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (!child.visible || !child.input.enabled) {
          continue;
        }
        results.push(child);
        if (child.input.enabledChildren && child.numChildren) {
          this.getInteractiveChildren(child, results);
        }
      }
    }
    checkHitArea(entity, px, py) {
      if (entity.input.hitArea) {
        if (entity.input.hitArea.contains(px, py)) {
          return true;
        }
      } else {
        return entity.transformExtent.contains(px, py);
      }
      return false;
    }
    hitTest(...entities3) {
      const localX = this.localPoint.x;
      const localY = this.localPoint.y;
      const point = this.transPoint;
      for (let i = 0; i < entities3.length; i++) {
        const entity = entities3[i];
        if (!entity.world) {
          continue;
        }
        const mat = Mat2dAppend(entity.world.camera.worldTransform, entity.worldTransform);
        Mat2dGlobalToLocal(mat, localX, localY, point);
        if (this.checkHitArea(entity, point.x, point.y)) {
          this.hitPoint.set(point.x, point.y);
          return true;
        }
      }
      return false;
    }
    hitTestChildren(parent, topOnly = true) {
      const output = [];
      if (!parent.visible) {
        return output;
      }
      const candidates = [];
      const parentInput = parent.input;
      if (parentInput && parentInput.enabled) {
        candidates.push(parent);
      }
      if (parentInput.enabledChildren && parent.numChildren) {
        this.getInteractiveChildren(parent, candidates);
      }
      for (let i = candidates.length - 1; i >= 0; i--) {
        const entity = candidates[i];
        if (this.hitTest(entity)) {
          output.push(entity);
          if (topOnly) {
            break;
          }
        }
      }
      return output;
    }
    shutdown() {
      const target = this.target;
      target.removeEventListener("mousedown", this.mousedownHandler);
      target.removeEventListener("mouseup", this.mouseupHandler);
      target.removeEventListener("wheel", this.mousewheelHandler);
      target.removeEventListener("contextmenu", this.contextmenuHandler);
      window.removeEventListener("mouseup", this.mouseupHandler);
      window.removeEventListener("mousemove", this.mousemoveHandler);
      window.removeEventListener("blur", this.blurHandler);
    }
  };

  // ../phaser-genesis/src/world/events/WorldAfterUpdateEvent.ts
  var WorldAfterUpdateEvent = "afterupdate";

  // ../phaser-genesis/src/world/events/WorldBeforeUpdateEvent.ts
  var WorldBeforeUpdateEvent = "beforeupdate";

  // ../phaser-genesis/src/world/events/WorldPostRenderEvent.ts
  var WorldPostRenderEvent = "worldpostrender";

  // ../phaser-genesis/src/world/events/WorldRenderEvent.ts
  var WorldRenderEvent = "worldrender";

  // ../phaser-genesis/src/world/events/WorldShutdownEvent.ts
  var WorldShutdownEvent = "worldshutdown";

  // ../phaser-genesis/src/world/events/WorldUpdateEvent.ts
  var WorldUpdateEvent = "update";

  // ../phaser-genesis/src/world/RenderDataComponent.ts
  var RenderData = defineComponent({
    gameFrame: Types.ui32,
    dirtyFrame: Types.ui32,
    numRendered: Types.ui32,
    numRenderable: Types.ui32
  });
  var RenderDataComponent = RenderData;

  // ../phaser-genesis/src/world/AddRenderDataComponent.ts
  function AddRenderDataComponent(id) {
    addComponent(GameObjectWorld, RenderDataComponent, id);
  }

  // ../phaser-genesis/src/config/worldsize/GetWorldSize.ts
  function GetWorldSize() {
    return ConfigStore.get(CONFIG_DEFAULTS.WORLD_SIZE);
  }

  // ../phaser-genesis/src/world/AddToRenderList.ts
  function AddToRenderList(world2, id, renderType) {
    if (renderType === 0 && !world2.checkWorldEntity(id)) {
      return false;
    }
    let len = world2.listLength;
    const list = world2.renderList;
    list[len] = id;
    list[len + 1] = renderType;
    world2.listLength += 2;
    len += 2;
    if (len === list.length) {
      const newList = new Uint32Array(len + GetWorldSize() * 4);
      newList.set(list, 0);
      world2.renderList = newList;
    }
    return true;
  }

  // ../phaser-genesis/src/world/RebuildWorldList.ts
  function RebuildWorldList(world2, parent, worldDepth) {
    if (WillRender(parent)) {
      let entityAdded = true;
      if (world2.id !== parent) {
        entityAdded = AddToRenderList(world2, parent, 0);
      }
      if (!entityAdded) {
        return;
      }
      const children = GameObjectTree.get(parent);
      for (let i = 0; i < children.length; i++) {
        const nodeID = children[i];
        if (WillRender(nodeID)) {
          if (GetNumChildren(nodeID) > 0 && WillRenderChildren(nodeID)) {
            if (!WillCacheChildren(nodeID) || HasDirtyChildCache(nodeID)) {
              SetWorldDepth(nodeID, worldDepth);
              RebuildWorldList(world2, nodeID, worldDepth + 1);
            } else if (AddToRenderList(world2, nodeID, 0)) {
              SetWorldDepth(nodeID, worldDepth);
              AddToRenderList(world2, nodeID, 1);
            }
          } else if (!WillCacheChildren(nodeID) && AddToRenderList(world2, nodeID, 0)) {
            SetWorldDepth(nodeID, worldDepth);
            AddToRenderList(world2, nodeID, 1);
          }
        }
      }
      if (children.length === 0) {
        SetWorldDepth(parent, worldDepth);
      }
      if (world2.id !== parent) {
        AddToRenderList(world2, parent, 1);
      }
    }
  }

  // ../phaser-genesis/src/world/RebuildWorldTransforms.ts
  function RebuildWorldTransforms(world2, parent, forceUpdate) {
    if (WillRender(parent)) {
      if (!forceUpdate && HasDirtyTransform(parent)) {
        forceUpdate = true;
      }
      if (forceUpdate && hasComponent(GameObjectWorld, Transform2DComponent, parent)) {
        UpdateWorldTransform(parent);
      }
      const children = GameObjectTree.get(parent);
      for (let i = 0; i < children.length; i++) {
        const nodeID = children[i];
        if (WillRender(nodeID)) {
          if (GetNumChildren(nodeID) > 0) {
            if (WillRenderChildren(nodeID) && WillTransformChildren(nodeID)) {
              RebuildWorldTransforms(world2, nodeID, forceUpdate);
            }
          } else if (forceUpdate || HasDirtyTransform(nodeID)) {
            UpdateWorldTransform(nodeID);
          }
        }
      }
    }
  }

  // ../phaser-genesis/src/world/ResetWorldRenderData.ts
  function ResetWorldRenderData(id, gameFrame) {
    RenderDataComponent.gameFrame[id] = gameFrame;
    RenderDataComponent.dirtyFrame[id] = 0;
    RenderDataComponent.numRendered[id] = 0;
    RenderDataComponent.numRenderable[id] = 0;
  }

  // ../phaser-genesis/src/scenes/events/SceneDestroyEvent.ts
  var SceneDestroyEvent = "destroy";

  // ../phaser-genesis/src/math/spatialgrid/SpatialHashGrid.ts
  var SpatialHashGrid = class {
    constructor(minX, minY, maxX, maxY, cellSize) {
      __publicField(this, "minX");
      __publicField(this, "minY");
      __publicField(this, "maxX");
      __publicField(this, "maxY");
      __publicField(this, "cellSize");
      __publicField(this, "width");
      __publicField(this, "height");
      __publicField(this, "cells");
      __publicField(this, "debug");
      this.minX = minX;
      this.minY = minY;
      this.maxX = maxX;
      this.maxY = maxY;
      this.cellSize = cellSize;
      const width = Math.floor((maxX - minX) / cellSize);
      const height = Math.floor((maxY - minY) / cellSize);
      this.width = width;
      this.height = height;
      console.log("grid size", this.width, this.height);
      this.cells = [];
      this.debug = [];
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          this.cells.push(new Set());
          this.debug.push({ x: x * cellSize, y: y * cellSize, width: cellSize, height: cellSize });
        }
      }
      console.log("hash", this.cells);
    }
    clear() {
      this.cells.forEach((cell) => cell.clear());
    }
    insert(id) {
      const cells = this.cells;
      const bounds = BoundsComponent.global[id];
      const topLeft = this.getIndex(bounds[0], bounds[1]);
      const bottomRight = this.getIndex(bounds[2], bounds[3]);
      if (topLeft === bottomRight) {
        cells[topLeft].add(id);
        return;
      }
      const topRight = this.getIndex(bounds[2], bounds[1]);
      const bottomLeft = this.getIndex(bounds[0], bounds[3]);
      const width = topRight - topLeft + 1;
      const height = Math.max(1, Math.ceil((bottomLeft - topLeft) / this.height));
      const startX = Math.floor(bounds[0] / this.cellSize);
      const startY = Math.floor(bounds[1] / this.cellSize);
      let gridX = startX;
      let gridY = startY;
      let placed = 0;
      for (let i = 0; i < width * height; i++) {
        const index = gridX + gridY * this.width;
        console.log("adding to index", index);
        cells[index].add(id);
        gridX++;
        placed++;
        if (placed === width) {
          gridX = startX;
          gridY++;
          placed = 0;
        }
      }
    }
    getIndex(x, y) {
      return Math.floor(x / this.cellSize) + Math.floor(y / this.cellSize) * this.width;
    }
    getBounds(x, y, right, bottom) {
      const topLeft = this.getIndex(x, y);
      const topRight = this.getIndex(right, y);
      const bottomLeft = this.getIndex(x, bottom);
      const bottomRight = this.getIndex(right, bottom);
      return [topLeft, topRight, bottomLeft, bottomRight];
    }
  };

  // ../phaser-genesis/src/world/BaseWorld.ts
  var BaseWorld = class extends GameObject {
    constructor(scene) {
      super();
      __publicField(this, "tag", defineComponent());
      __publicField(this, "scene");
      __publicField(this, "sceneManager");
      __publicField(this, "camera");
      __publicField(this, "forceRefresh", false);
      __publicField(this, "is3D", false);
      __publicField(this, "runRender", false);
      __publicField(this, "color");
      __publicField(this, "renderList");
      __publicField(this, "listLength", 0);
      __publicField(this, "spatialGrid");
      __publicField(this, "totalChildren", 0);
      __publicField(this, "totalChildrenQuery");
      __publicField(this, "dirtyLocalQuery");
      __publicField(this, "vertexPositionQuery");
      __publicField(this, "dirtyBoundsQuery");
      this.scene = scene;
      this.sceneManager = SceneManagerInstance.get();
      const tag = this.tag;
      this.totalChildrenQuery = defineQuery([tag]);
      this.dirtyLocalQuery = defineQuery([tag, Changed(Transform2DComponent)]);
      this.vertexPositionQuery = defineQuery([tag, Changed(WorldMatrix2DComponent), Changed(Extent2DComponent)]);
      this.dirtyBoundsQuery = defineQuery([tag, Changed(BoundsComponent)]);
      this.renderList = new Uint32Array(GetWorldSize() * 4);
      const id = this.id;
      AddRenderDataComponent(id);
      SetWorldID(id, id);
      WorldList.get(scene).push(this);
      this.color = new Color2(id);
      this.spatialGrid = new SpatialHashGrid(0, 0, 800, 600, 200);
      Once(scene, SceneDestroyEvent, () => this.destroy());
    }
    beforeUpdate(delta, time) {
      Emit(this, WorldBeforeUpdateEvent, delta, time, this);
    }
    update(delta, time) {
      if (!WillUpdate(this.id)) {
        return;
      }
      Emit(this, WorldUpdateEvent, delta, time, this);
      super.update(delta, time);
    }
    afterUpdate(delta, time) {
      Emit(this, WorldAfterUpdateEvent, delta, time, this);
    }
    checkWorldEntity(id) {
      return true;
    }
    getRenderList() {
      const list = this.renderList;
      const output = [];
      for (let i = 0; i < this.listLength; i += 2) {
        const eid = list[i];
        const type = list[i + 1];
        if (type === 0) {
          output.push(GameObjectCache.get(eid));
        }
      }
      return output;
    }
    preRender(gameFrame) {
      const id = this.id;
      ClearDirtyChild(id);
      const sceneManager = this.sceneManager;
      if (!this.isRenderable()) {
        this.runRender = false;
        sceneManager.updateWorldStats(this.totalChildren, 0, 0, 0);
        return false;
      }
      const dirtyLocalTotal = UpdateLocalTransform2DSystem(GameObjectWorld, this.dirtyLocalQuery);
      RenderStatsComponent.numWorlds[sceneManager.id]++;
      RenderStatsComponent.numDirtyLocalTransforms[sceneManager.id] += dirtyLocalTotal;
      const dirtyDisplayList = HasDirtyDisplayList(id);
      ResetWorldRenderData(id, gameFrame);
      let isDirty = false;
      if (dirtyDisplayList || HasDirtyChild(id)) {
        RebuildWorldTransforms(this, id, false);
        isDirty = true;
      }
      const updatedEntities = UpdateVertexPositionSystem(GameObjectWorld, this.vertexPositionQuery);
      const dirtyWorldTotal = updatedEntities.length;
      updatedEntities.forEach((entity) => {
        this.spatialGrid.insert(entity);
      });
      if (dirtyDisplayList) {
        this.listLength = 0;
        RebuildWorldList(this, id, 0);
        ClearDirtyDisplayList(id);
        isDirty = true;
        this.totalChildren = this.totalChildrenQuery(GameObjectWorld).length;
      }
      this.runRender = this.listLength > 0;
      sceneManager.updateWorldStats(this.totalChildren, this.listLength / 4, Number(dirtyDisplayList), dirtyWorldTotal);
      return isDirty;
    }
    getTotalChildren() {
      if (HasDirtyDisplayList(this.id)) {
        this.totalChildren = this.totalChildrenQuery(GameObjectWorld).length;
      }
      return this.totalChildren;
    }
    renderGL(renderPass) {
      SetColor(renderPass, this.color);
      Emit(this, WorldRenderEvent, this);
      const camera = renderPass.current2DCamera;
      Begin(renderPass, camera);
      const list = this.renderList;
      for (let i = 0; i < this.listLength; i += 2) {
        const eid = list[i];
        const type = list[i + 1];
        const entry = GameObjectCache.get(eid);
        if (type === 1) {
          entry.postRenderGL(renderPass);
        } else {
          entry.renderGL(renderPass);
        }
      }
    }
    postRenderGL(renderPass) {
      PopColor(renderPass, this.color);
      if (!this.runRender) {
        Begin(renderPass, this.camera);
      }
      Emit(this, WorldPostRenderEvent, renderPass, this);
    }
    shutdown() {
      RemoveChildren(this);
      Emit(this, WorldShutdownEvent, this);
      ResetWorldRenderData(this.id, 0);
      if (this.camera) {
        this.camera.reset();
      }
    }
    destroy(reparentChildren) {
      super.destroy(reparentChildren);
      this.shutdown();
      if (this.camera) {
        this.camera.destroy();
      }
      this.camera = null;
    }
  };

  // ../phaser-genesis/src/world/StaticWorld.ts
  var StaticWorld = class extends BaseWorld {
    constructor(scene) {
      super(scene);
      this.camera = new StaticCamera();
    }
    checkWorldEntity(id) {
      const cameraBounds = this.camera.bounds;
      return BoundsIntersects(id, cameraBounds.x, cameraBounds.y, cameraBounds.right, cameraBounds.bottom);
    }
  };

  // examples/src/display/spatial grid.ts
  var Demo = class extends Scene {
    constructor() {
      super();
      this.create();
    }
    create() {
      return __async(this, null, function* () {
        yield ImageFile("box", "assets/box-item-boxed.png").load();
        yield ImageFile("rocket", "assets/rocket.png").load();
        yield ImageFile("pacman", "assets/pacman_by_oz_28x28.png").load();
        const world2 = new StaticWorld(this);
        const mouse = new Mouse();
        const grid = world2.spatialGrid;
        const dd = new DirectDraw();
        dd.render = () => {
          grid.debug.forEach((cell) => {
            dd.box(cell.x, cell.y, cell.width, cell.height, 1, 65280);
          });
        };
        AddChild(world2, dd);
        let frame2 = "pacman";
        const keyboard = new Keyboard();
        On(keyboard, "keydown", (event) => {
          if (event.key === "b") {
            frame2 = "box";
          } else if (event.key === "r") {
            frame2 = "rocket";
          } else if (event.key === "p") {
            frame2 = "pacman";
          }
        });
        On(mouse, "pointerdown", (x, y) => {
          const sprite = new Sprite(x, y, frame2);
          if (frame2 === "pacman") {
            sprite.setRotation(Math.PI / 2);
          }
          AddChild(world2, sprite);
          BringChildToTop(dd);
        });
      });
    }
  };
  new Game(WebGL(), Parent("gameParent"), GlobalVar("Phaser4"), BackgroundColor(657930), Scenes(Demo));
})();
/**
 * @author       Niklas von Hertzen (https://github.com/niklasvh/base64-arraybuffer)
 * @author       Richard Davey <rich@photonstorm.com>
 * @copyright    2020 Photon Storm Ltd.
 * @license      {@link https://opensource.org/licenses/MIT|MIT License}
 */
/**
 * @author       Richard Davey <rich@photonstorm.com>
 * @copyright    2020 Photon Storm Ltd.
 * @license      {@link https://opensource.org/licenses/MIT|MIT License}
 */
//# sourceMappingURL=spatial grid.js.map