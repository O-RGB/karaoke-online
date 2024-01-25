/* eslint-disable no-undef */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-unused-expressions */
var Module = typeof Module != "undefined" ? Module : {};
var document = typeof document !== "undefined" ? document : {};
var window = typeof window !== "undefined" ? window : {};
if (typeof AudioWorkletGlobalScope !== "undefined" && AudioWorkletGlobalScope) {
  AudioWorkletGlobalScope.wasmModule = Module;
  AudioWorkletGlobalScope.wasmAddFunction = addFunction;
  AudioWorkletGlobalScope.wasmRemoveFunction = removeFunction;
  AudioWorkletGlobalScope.addOnPreRun = addOnPreRun;
  AudioWorkletGlobalScope.addOnInit = addOnInit;
  AudioWorkletGlobalScope.addOnPostRun = addOnPostRun;
}
var moduleOverrides = Object.assign({}, Module);
var arguments_ = [];
var thisProgram = "./this.program";
var quit_ = (status, toThrow) => {
  throw toThrow;
};
var ENVIRONMENT_IS_WEB = true;
var ENVIRONMENT_IS_WORKER = false;
var scriptDirectory = "";
function locateFile(path) {
  if (Module["locateFile"]) {
    return Module["locateFile"](path, scriptDirectory);
  }
  return scriptDirectory + path;
}
var read_, readAsync, readBinary, setWindowTitle;
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  if (ENVIRONMENT_IS_WORKER) {
    scriptDirectory = self.location.href;
  } else if (typeof document != "undefined" && document.currentScript) {
    scriptDirectory = document.currentScript.src;
  }
  if (scriptDirectory.indexOf("blob:") !== 0) {
    scriptDirectory = scriptDirectory.substr(
      0,
      scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1
    );
  } else {
    scriptDirectory = "";
  }
  {
    read_ = (url) => {
      try {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.send(null);
        return xhr.responseText;
      } catch (err) {
        var data = tryParseAsDataURI(url);
        if (data) {
          return intArrayToString(data);
        }
        throw err;
      }
    };
    if (ENVIRONMENT_IS_WORKER) {
      readBinary = (url) => {
        try {
          var xhr = new XMLHttpRequest();
          xhr.open("GET", url, false);
          xhr.responseType = "arraybuffer";
          xhr.send(null);
          return new Uint8Array(xhr.response);
        } catch (err) {
          var data = tryParseAsDataURI(url);
          if (data) {
            return data;
          }
          throw err;
        }
      };
    }
    readAsync = (url, onload, onerror) => {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.responseType = "arraybuffer";
      xhr.onload = () => {
        if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
          onload(xhr.response);
          return;
        }
        var data = tryParseAsDataURI(url);
        if (data) {
          onload(data.buffer);
          return;
        }
        onerror();
      };
      xhr.onerror = onerror;
      xhr.send(null);
    };
  }
  setWindowTitle = (title) => (document.title = title);
} else {
}
var out = Module["print"] || console.log.bind(console);
var err = Module["printErr"] || console.warn.bind(console);
Object.assign(Module, moduleOverrides);
moduleOverrides = null;
if (Module["arguments"]) arguments_ = Module["arguments"];
if (Module["thisProgram"]) thisProgram = Module["thisProgram"];
if (Module["quit"]) quit_ = Module["quit"];
function uleb128Encode(n) {
  if (n < 128) {
    return [n];
  }
  return [n % 128 | 128, n >> 7];
}
function convertJsFunctionToWasm(func, sig) {
  if (typeof WebAssembly.Function == "function") {
    var typeNames = { i: "i32", j: "i64", f: "f32", d: "f64" };
    var type = {
      parameters: [],
      results: sig[0] == "v" ? [] : [typeNames[sig[0]]],
    };
    for (var i = 1; i < sig.length; ++i) {
      type.parameters.push(typeNames[sig[i]]);
    }
    return new WebAssembly.Function(type, func);
  }
  var typeSection = [1, 96];
  var sigRet = sig.slice(0, 1);
  var sigParam = sig.slice(1);
  var typeCodes = { i: 127, j: 126, f: 125, d: 124 };
  typeSection = typeSection.concat(uleb128Encode(sigParam.length));
  for (var i = 0; i < sigParam.length; ++i) {
    typeSection.push(typeCodes[sigParam[i]]);
  }
  if (sigRet == "v") {
    typeSection.push(0);
  } else {
    typeSection = typeSection.concat([1, typeCodes[sigRet]]);
  }
  typeSection = [1].concat(uleb128Encode(typeSection.length), typeSection);
  var bytes = new Uint8Array(
    [0, 97, 115, 109, 1, 0, 0, 0].concat(
      typeSection,
      [2, 7, 1, 1, 101, 1, 102, 0, 0, 7, 5, 1, 1, 102, 0, 0]
    )
  );
  var module = new WebAssembly.Module(bytes);
  var instance = new WebAssembly.Instance(module, { e: { f: func } });
  var wrappedFunc = instance.exports["f"];
  return wrappedFunc;
}
var freeTableIndexes = [];
var functionsInTableMap;
function getEmptyTableSlot() {
  if (freeTableIndexes.length) {
    return freeTableIndexes.pop();
  }
  try {
    wasmTable.grow(1);
  } catch (err) {
    if (!(err instanceof RangeError)) {
      throw err;
    }
    throw "Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.";
  }
  return wasmTable.length - 1;
}
function updateTableMap(offset, count) {
  for (var i = offset; i < offset + count; i++) {
    var item = getWasmTableEntry(i);
    if (item) {
      functionsInTableMap.set(item, i);
    }
  }
}
function addFunction(func, sig) {
  if (!functionsInTableMap) {
    functionsInTableMap = new WeakMap();
    updateTableMap(0, wasmTable.length);
  }
  if (functionsInTableMap.has(func)) {
    return functionsInTableMap.get(func);
  }
  var ret = getEmptyTableSlot();
  try {
    setWasmTableEntry(ret, func);
  } catch (err) {
    if (!(err instanceof TypeError)) {
      throw err;
    }
    var wrapped = convertJsFunctionToWasm(func, sig);
    setWasmTableEntry(ret, wrapped);
  }
  functionsInTableMap.set(func, ret);
  return ret;
}
function removeFunction(index) {
  functionsInTableMap.delete(getWasmTableEntry(index));
  freeTableIndexes.push(index);
}
var wasmBinary;
if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];
var noExitRuntime = Module["noExitRuntime"] || true;
if (typeof WebAssembly != "object") {
  abort("no native wasm support detected");
}
var wasmMemory;
var ABORT = false;
var EXITSTATUS;
function assert(condition, text) {
  if (!condition) {
    abort(text);
  }
}
function getCFunc(ident) {
  var func = Module["_" + ident];
  return func;
}
function ccall(ident, returnType, argTypes, args, opts) {
  var toC = {
    string: function (str) {
      var ret = 0;
      if (str !== null && str !== undefined && str !== 0) {
        var len = (str.length << 2) + 1;
        ret = stackAlloc(len);
        stringToUTF8(str, ret, len);
      }
      return ret;
    },
    array: function (arr) {
      var ret = stackAlloc(arr.length);
      writeArrayToMemory(arr, ret);
      return ret;
    },
  };
  function convertReturnValue(ret) {
    if (returnType === "string") return UTF8ToString(ret);
    if (returnType === "boolean") return Boolean(ret);
    return ret;
  }
  var func = getCFunc(ident);
  var cArgs = [];
  var stack = 0;
  if (args) {
    for (var i = 0; i < args.length; i++) {
      var converter = toC[argTypes[i]];
      if (converter) {
        if (stack === 0) stack = stackSave();
        cArgs[i] = converter(args[i]);
      } else {
        cArgs[i] = args[i];
      }
    }
  }
  var ret = func.apply(null, cArgs);
  function onDone(ret) {
    if (stack !== 0) stackRestore(stack);
    return convertReturnValue(ret);
  }
  ret = onDone(ret);
  return ret;
}
function cwrap(ident, returnType, argTypes, opts) {
  argTypes = argTypes || [];
  var numericArgs = argTypes.every(function (type) {
    return type === "number";
  });
  var numericRet = returnType !== "string";
  if (numericRet && numericArgs && !opts) {
    return getCFunc(ident);
  }
  return function () {
    return ccall(ident, returnType, argTypes, arguments, opts);
  };
}
var UTF8Decoder =
  typeof TextDecoder != "undefined" ? new TextDecoder("utf8") : undefined;
function UTF8ArrayToString(heapOrArray, idx, maxBytesToRead) {
  var endIdx = idx + maxBytesToRead;
  var endPtr = idx;
  while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
  if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
    return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
  } else {
    var str = "";
    while (idx < endPtr) {
      var u0 = heapOrArray[idx++];
      if (!(u0 & 128)) {
        str += String.fromCharCode(u0);
        continue;
      }
      var u1 = heapOrArray[idx++] & 63;
      if ((u0 & 224) == 192) {
        str += String.fromCharCode(((u0 & 31) << 6) | u1);
        continue;
      }
      var u2 = heapOrArray[idx++] & 63;
      if ((u0 & 240) == 224) {
        u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
      } else {
        u0 =
          ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63);
      }
      if (u0 < 65536) {
        str += String.fromCharCode(u0);
      } else {
        var ch = u0 - 65536;
        str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023));
      }
    }
  }
  return str;
}
function UTF8ToString(ptr, maxBytesToRead) {
  return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
}
function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
  if (!(maxBytesToWrite > 0)) return 0;
  var startIdx = outIdx;
  var endIdx = outIdx + maxBytesToWrite - 1;
  for (var i = 0; i < str.length; ++i) {
    var u = str.charCodeAt(i);
    if (u >= 55296 && u <= 57343) {
      var u1 = str.charCodeAt(++i);
      u = (65536 + ((u & 1023) << 10)) | (u1 & 1023);
    }
    if (u <= 127) {
      if (outIdx >= endIdx) break;
      heap[outIdx++] = u;
    } else if (u <= 2047) {
      if (outIdx + 1 >= endIdx) break;
      heap[outIdx++] = 192 | (u >> 6);
      heap[outIdx++] = 128 | (u & 63);
    } else if (u <= 65535) {
      if (outIdx + 2 >= endIdx) break;
      heap[outIdx++] = 224 | (u >> 12);
      heap[outIdx++] = 128 | ((u >> 6) & 63);
      heap[outIdx++] = 128 | (u & 63);
    } else {
      if (outIdx + 3 >= endIdx) break;
      heap[outIdx++] = 240 | (u >> 18);
      heap[outIdx++] = 128 | ((u >> 12) & 63);
      heap[outIdx++] = 128 | ((u >> 6) & 63);
      heap[outIdx++] = 128 | (u & 63);
    }
  }
  heap[outIdx] = 0;
  return outIdx - startIdx;
}
function stringToUTF8(str, outPtr, maxBytesToWrite) {
  return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
}
function lengthBytesUTF8(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    var u = str.charCodeAt(i);
    if (u >= 55296 && u <= 57343)
      u = (65536 + ((u & 1023) << 10)) | (str.charCodeAt(++i) & 1023);
    if (u <= 127) ++len;
    else if (u <= 2047) len += 2;
    else if (u <= 65535) len += 3;
    else len += 4;
  }
  return len;
}
function allocateUTF8(str) {
  var size = lengthBytesUTF8(str) + 1;
  var ret = _malloc(size);
  if (ret) stringToUTF8Array(str, HEAP8, ret, size);
  return ret;
}
function writeArrayToMemory(array, buffer) {
  HEAP8.set(array, buffer);
}
function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; ++i) {
    HEAP8[buffer++ >> 0] = str.charCodeAt(i);
  }
  if (!dontAddNull) HEAP8[buffer >> 0] = 0;
}
var buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
function updateGlobalBufferAndViews(buf) {
  buffer = buf;
  Module["HEAP8"] = HEAP8 = new Int8Array(buf);
  Module["HEAP16"] = HEAP16 = new Int16Array(buf);
  Module["HEAP32"] = HEAP32 = new Int32Array(buf);
  Module["HEAPU8"] = HEAPU8 = new Uint8Array(buf);
  Module["HEAPU16"] = HEAPU16 = new Uint16Array(buf);
  Module["HEAPU32"] = HEAPU32 = new Uint32Array(buf);
  Module["HEAPF32"] = HEAPF32 = new Float32Array(buf);
  Module["HEAPF64"] = HEAPF64 = new Float64Array(buf);
}
var INITIAL_MEMORY = Module["INITIAL_MEMORY"] || 67108864;
var wasmTable;
var __ATPRERUN__ = [];
var __ATINIT__ = [];
var __ATPOSTRUN__ = [];
var runtimeInitialized = false;
function keepRuntimeAlive() {
  return noExitRuntime;
}
function preRun() {
  if (Module["preRun"]) {
    if (typeof Module["preRun"] == "function")
      Module["preRun"] = [Module["preRun"]];
    while (Module["preRun"].length) {
      addOnPreRun(Module["preRun"].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}
function initRuntime() {
  runtimeInitialized = true;
  if (!Module["noFSInit"] && !FS.init.initialized) FS.init();
  FS.ignorePermissions = false;
  TTY.init();
  callRuntimeCallbacks(__ATINIT__);
}
function postRun() {
  if (Module["postRun"]) {
    if (typeof Module["postRun"] == "function")
      Module["postRun"] = [Module["postRun"]];
    while (Module["postRun"].length) {
      addOnPostRun(Module["postRun"].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}
function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null;
function getUniqueRunDependency(id) {
  return id;
}
function addRunDependency(id) {
  runDependencies++;
  if (Module["monitorRunDependencies"]) {
    Module["monitorRunDependencies"](runDependencies);
  }
}
function removeRunDependency(id) {
  runDependencies--;
  if (Module["monitorRunDependencies"]) {
    Module["monitorRunDependencies"](runDependencies);
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback();
    }
  }
}
function abort(what) {
  {
    if (Module["onAbort"]) {
      Module["onAbort"](what);
    }
  }
  what = "Aborted(" + what + ")";
  err(what);
  ABORT = true;
  EXITSTATUS = 1;
  what += ". Build with -sASSERTIONS for more info.";
  var e = new WebAssembly.RuntimeError(what);
  throw e;
}
var dataURIPrefix = "data:application/octet-stream;base64,";
function isDataURI(filename) {
  return filename.startsWith(dataURIPrefix);
}
var wasmBinaryFile;
wasmBinaryFile =
if (!isDataURI(wasmBinaryFile)) {
  wasmBinaryFile = locateFile(wasmBinaryFile);
}
function getBinary(file) {
  try {
    if (file == wasmBinaryFile && wasmBinary) {
      return new Uint8Array(wasmBinary);
    }
    var binary = tryParseAsDataURI(file);
    if (binary) {
      return binary;
    }
    if (readBinary) {
      return readBinary(file);
    } else {
      throw "both async and sync fetching of the wasm failed";
    }
  } catch (err) {
    abort(err);
  }
}
function getBinaryPromise() {
  if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
    if (typeof fetch == "function") {
      return fetch(wasmBinaryFile, { credentials: "same-origin" })
        .then(function (response) {
          if (!response["ok"]) {
            throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
          }
          return response["arrayBuffer"]();
        })
        .catch(function () {
          return getBinary(wasmBinaryFile);
        });
    }
  }
  return Promise.resolve().then(function () {
    return getBinary(wasmBinaryFile);
  });
}
function createWasm() {
  var info = { a: asmLibraryArg };
  function receiveInstance(instance, module) {
    var exports = instance.exports;
    Module["asm"] = exports;
    wasmMemory = Module["asm"]["B"];
    updateGlobalBufferAndViews(wasmMemory.buffer);
    wasmTable = Module["asm"]["F"];
    addOnInit(Module["asm"]["C"]);
    removeRunDependency("wasm-instantiate");
  }
  addRunDependency("wasm-instantiate");
  function receiveInstantiationResult(result) {
    receiveInstance(result["instance"]);
  }
  function instantiateArrayBuffer(receiver) {
    return getBinaryPromise()
      .then(function (binary) {
        return WebAssembly.instantiate(binary, info);
      })
      .then(function (instance) {
        return instance;
      })
      .then(receiver, function (reason) {
        err("failed to asynchronously prepare wasm: " + reason);
        abort(reason);
      });
  }
  function instantiateAsync() {
    if (
      !wasmBinary &&
      typeof WebAssembly.instantiateStreaming == "function" &&
      !isDataURI(wasmBinaryFile) &&
      typeof fetch == "function"
    ) {
      return fetch(wasmBinaryFile, { credentials: "same-origin" }).then(
        function (response) {
          var result = WebAssembly.instantiateStreaming(response, info);
          return result.then(receiveInstantiationResult, function (reason) {
            err("wasm streaming compile failed: " + reason);
            err("falling back to ArrayBuffer instantiation");
            return instantiateArrayBuffer(receiveInstantiationResult);
          });
        }
      );
    } else {
      return instantiateArrayBuffer(receiveInstantiationResult);
    }
  }
  if (Module["instantiateWasm"]) {
    try {
      var exports = Module["instantiateWasm"](info, receiveInstance);
      return exports;
    } catch (e) {
      err("Module.instantiateWasm callback failed with error: " + e);
      return false;
    }
  }
  instantiateAsync();
  return {};
}
var tempDouble;
var tempI64;
function callRuntimeCallbacks(callbacks) {
  while (callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == "function") {
      callback(Module);
      continue;
    }
    var func = callback.func;
    if (typeof func == "number") {
      if (callback.arg === undefined) {
        getWasmTableEntry(func)();
      } else {
        getWasmTableEntry(func)(callback.arg);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}
var wasmTableMirror = [];
function getWasmTableEntry(funcPtr) {
  var func = wasmTableMirror[funcPtr];
  if (!func) {
    if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1;
    wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
  }
  return func;
}
function setWasmTableEntry(idx, func) {
  wasmTable.set(idx, func);
  wasmTableMirror[idx] = wasmTable.get(idx);
}
function ___cxa_allocate_exception(size) {
  return _malloc(size + 24) + 24;
}
function ExceptionInfo(excPtr) {
  this.excPtr = excPtr;
  this.ptr = excPtr - 24;
  this.set_type = function (type) {
    HEAPU32[(this.ptr + 4) >> 2] = type;
  };
  this.get_type = function () {
    return HEAPU32[(this.ptr + 4) >> 2];
  };
  this.set_destructor = function (destructor) {
    HEAPU32[(this.ptr + 8) >> 2] = destructor;
  };
  this.get_destructor = function () {
    return HEAPU32[(this.ptr + 8) >> 2];
  };
  this.set_refcount = function (refcount) {
    HEAP32[this.ptr >> 2] = refcount;
  };
  this.set_caught = function (caught) {
    caught = caught ? 1 : 0;
    HEAP8[(this.ptr + 12) >> 0] = caught;
  };
  this.get_caught = function () {
    return HEAP8[(this.ptr + 12) >> 0] != 0;
  };
  this.set_rethrown = function (rethrown) {
    rethrown = rethrown ? 1 : 0;
    HEAP8[(this.ptr + 13) >> 0] = rethrown;
  };
  this.get_rethrown = function () {
    return HEAP8[(this.ptr + 13) >> 0] != 0;
  };
  this.init = function (type, destructor) {
    this.set_adjusted_ptr(0);
    this.set_type(type);
    this.set_destructor(destructor);
    this.set_refcount(0);
    this.set_caught(false);
    this.set_rethrown(false);
  };
  this.add_ref = function () {
    var value = HEAP32[this.ptr >> 2];
    HEAP32[this.ptr >> 2] = value + 1;
  };
  this.release_ref = function () {
    var prev = HEAP32[this.ptr >> 2];
    HEAP32[this.ptr >> 2] = prev - 1;
    return prev === 1;
  };
  this.set_adjusted_ptr = function (adjustedPtr) {
    HEAPU32[(this.ptr + 16) >> 2] = adjustedPtr;
  };
  this.get_adjusted_ptr = function () {
    return HEAPU32[(this.ptr + 16) >> 2];
  };
  this.get_exception_ptr = function () {
    var isPointer = ___cxa_is_pointer_type(this.get_type());
    if (isPointer) {
      return HEAPU32[this.excPtr >> 2];
    }
    var adjusted = this.get_adjusted_ptr();
    if (adjusted !== 0) return adjusted;
    return this.excPtr;
  };
}
var exceptionLast = 0;
var uncaughtExceptionCount = 0;
function ___cxa_throw(ptr, type, destructor) {
  var info = new ExceptionInfo(ptr);
  info.init(type, destructor);
  exceptionLast = ptr;
  uncaughtExceptionCount++;
  throw ptr;
}
var PATH = {
  isAbs: (path) => path.charAt(0) === "/",
  splitPath: (filename) => {
    var splitPathRe =
      /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
    return splitPathRe.exec(filename).slice(1);
  },
  normalizeArray: (parts, allowAboveRoot) => {
    var up = 0;
    for (var i = parts.length - 1; i >= 0; i--) {
      var last = parts[i];
      if (last === ".") {
        parts.splice(i, 1);
      } else if (last === "..") {
        parts.splice(i, 1);
        up++;
      } else if (up) {
        parts.splice(i, 1);
        up--;
      }
    }
    if (allowAboveRoot) {
      for (; up; up--) {
        parts.unshift("..");
      }
    }
    return parts;
  },
  normalize: (path) => {
    var isAbsolute = PATH.isAbs(path),
      trailingSlash = path.substr(-1) === "/";
    path = PATH.normalizeArray(
      path.split("/").filter((p) => !!p),
      !isAbsolute
    ).join("/");
    if (!path && !isAbsolute) {
      path = ".";
    }
    if (path && trailingSlash) {
      path += "/";
    }
    return (isAbsolute ? "/" : "") + path;
  },
  dirname: (path) => {
    var result = PATH.splitPath(path),
      root = result[0],
      dir = result[1];
    if (!root && !dir) {
      return ".";
    }
    if (dir) {
      dir = dir.substr(0, dir.length - 1);
    }
    return root + dir;
  },
  basename: (path) => {
    if (path === "/") return "/";
    path = PATH.normalize(path);
    path = path.replace(/\/$/, "");
    var lastSlash = path.lastIndexOf("/");
    if (lastSlash === -1) return path;
    return path.substr(lastSlash + 1);
  },
  join: function () {
    var paths = Array.prototype.slice.call(arguments, 0);
    return PATH.normalize(paths.join("/"));
  },
  join2: (l, r) => {
    return PATH.normalize(l + "/" + r);
  },
};
function getRandomDevice() {
  if (
    typeof crypto == "object" &&
    typeof crypto["getRandomValues"] == "function"
  ) {
    var randomBuffer = new Uint8Array(1);
    return function () {
      crypto.getRandomValues(randomBuffer);
      return randomBuffer[0];
    };
  } else
    return function () {
      abort("randomDevice");
    };
}
var PATH_FS = {
  resolve: function () {
    var resolvedPath = "",
      resolvedAbsolute = false;
    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path = i >= 0 ? arguments[i] : FS.cwd();
      if (typeof path != "string") {
        throw new TypeError("Arguments to path.resolve must be strings");
      } else if (!path) {
        return "";
      }
      resolvedPath = path + "/" + resolvedPath;
      resolvedAbsolute = PATH.isAbs(path);
    }
    resolvedPath = PATH.normalizeArray(
      resolvedPath.split("/").filter((p) => !!p),
      !resolvedAbsolute
    ).join("/");
    return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
  },
  relative: (from, to) => {
    from = PATH_FS.resolve(from).substr(1);
    to = PATH_FS.resolve(to).substr(1);
    function trim(arr) {
      var start = 0;
      for (; start < arr.length; start++) {
        if (arr[start] !== "") break;
      }
      var end = arr.length - 1;
      for (; end >= 0; end--) {
        if (arr[end] !== "") break;
      }
      if (start > end) return [];
      return arr.slice(start, end - start + 1);
    }
    var fromParts = trim(from.split("/"));
    var toParts = trim(to.split("/"));
    var length = Math.min(fromParts.length, toParts.length);
    var samePartsLength = length;
    for (var i = 0; i < length; i++) {
      if (fromParts[i] !== toParts[i]) {
        samePartsLength = i;
        break;
      }
    }
    var outputParts = [];
    for (var i = samePartsLength; i < fromParts.length; i++) {
      outputParts.push("..");
    }
    outputParts = outputParts.concat(toParts.slice(samePartsLength));
    return outputParts.join("/");
  },
};
var TTY = {
  ttys: [],
  init: function () {},
  shutdown: function () {},
  register: function (dev, ops) {
    TTY.ttys[dev] = { input: [], output: [], ops: ops };
    FS.registerDevice(dev, TTY.stream_ops);
  },
  stream_ops: {
    open: function (stream) {
      var tty = TTY.ttys[stream.node.rdev];
      if (!tty) {
        throw new FS.ErrnoError(43);
      }
      stream.tty = tty;
      stream.seekable = false;
    },
    close: function (stream) {
      stream.tty.ops.flush(stream.tty);
    },
    flush: function (stream) {
      stream.tty.ops.flush(stream.tty);
    },
    read: function (stream, buffer, offset, length, pos) {
      if (!stream.tty || !stream.tty.ops.get_char) {
        throw new FS.ErrnoError(60);
      }
      var bytesRead = 0;
      for (var i = 0; i < length; i++) {
        var result;
        try {
          result = stream.tty.ops.get_char(stream.tty);
        } catch (e) {
          throw new FS.ErrnoError(29);
        }
        if (result === undefined && bytesRead === 0) {
          throw new FS.ErrnoError(6);
        }
        if (result === null || result === undefined) break;
        bytesRead++;
        buffer[offset + i] = result;
      }
      if (bytesRead) {
        stream.node.timestamp = Date.now();
      }
      return bytesRead;
    },
    write: function (stream, buffer, offset, length, pos) {
      if (!stream.tty || !stream.tty.ops.put_char) {
        throw new FS.ErrnoError(60);
      }
      try {
        for (var i = 0; i < length; i++) {
          stream.tty.ops.put_char(stream.tty, buffer[offset + i]);
        }
      } catch (e) {
        throw new FS.ErrnoError(29);
      }
      if (length) {
        stream.node.timestamp = Date.now();
      }
      return i;
    },
  },
  default_tty_ops: {
    get_char: function (tty) {
      if (!tty.input.length) {
        var result = null;
        if (
          typeof window != "undefined" &&
          typeof window.prompt == "function"
        ) {
          result = window.prompt("Input: ");
          if (result !== null) {
            result += "\n";
          }
        } else if (typeof readline == "function") {
          result = readline();
          if (result !== null) {
            result += "\n";
          }
        }
        if (!result) {
          return null;
        }
        tty.input = intArrayFromString(result, true);
      }
      return tty.input.shift();
    },
    put_char: function (tty, val) {
      if (val === null || val === 10) {
        out(UTF8ArrayToString(tty.output, 0));
        tty.output = [];
      } else {
        if (val != 0) tty.output.push(val);
      }
    },
    flush: function (tty) {
      if (tty.output && tty.output.length > 0) {
        out(UTF8ArrayToString(tty.output, 0));
        tty.output = [];
      }
    },
  },
  default_tty1_ops: {
    put_char: function (tty, val) {
      if (val === null || val === 10) {
        err(UTF8ArrayToString(tty.output, 0));
        tty.output = [];
      } else {
        if (val != 0) tty.output.push(val);
      }
    },
    flush: function (tty) {
      if (tty.output && tty.output.length > 0) {
        err(UTF8ArrayToString(tty.output, 0));
        tty.output = [];
      }
    },
  },
};
function mmapAlloc(size) {
  abort();
}
var MEMFS = {
  ops_table: null,
  mount: function (mount) {
    return MEMFS.createNode(null, "/", 16384 | 511, 0);
  },
  createNode: function (parent, name, mode, dev) {
    if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
      throw new FS.ErrnoError(63);
    }
    if (!MEMFS.ops_table) {
      MEMFS.ops_table = {
        dir: {
          node: {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr,
            lookup: MEMFS.node_ops.lookup,
            mknod: MEMFS.node_ops.mknod,
            rename: MEMFS.node_ops.rename,
            unlink: MEMFS.node_ops.unlink,
            rmdir: MEMFS.node_ops.rmdir,
            readdir: MEMFS.node_ops.readdir,
            symlink: MEMFS.node_ops.symlink,
          },
          stream: { llseek: MEMFS.stream_ops.llseek },
        },
        file: {
          node: {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr,
          },
          stream: {
            llseek: MEMFS.stream_ops.llseek,
            read: MEMFS.stream_ops.read,
            write: MEMFS.stream_ops.write,
            allocate: MEMFS.stream_ops.allocate,
            mmap: MEMFS.stream_ops.mmap,
            msync: MEMFS.stream_ops.msync,
          },
        },
        link: {
          node: {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr,
            readlink: MEMFS.node_ops.readlink,
          },
          stream: {},
        },
        chrdev: {
          node: {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr,
          },
          stream: FS.chrdev_stream_ops,
        },
      };
    }
    var node = FS.createNode(parent, name, mode, dev);
    if (FS.isDir(node.mode)) {
      node.node_ops = MEMFS.ops_table.dir.node;
      node.stream_ops = MEMFS.ops_table.dir.stream;
      node.contents = {};
    } else if (FS.isFile(node.mode)) {
      node.node_ops = MEMFS.ops_table.file.node;
      node.stream_ops = MEMFS.ops_table.file.stream;
      node.usedBytes = 0;
      node.contents = null;
    } else if (FS.isLink(node.mode)) {
      node.node_ops = MEMFS.ops_table.link.node;
      node.stream_ops = MEMFS.ops_table.link.stream;
    } else if (FS.isChrdev(node.mode)) {
      node.node_ops = MEMFS.ops_table.chrdev.node;
      node.stream_ops = MEMFS.ops_table.chrdev.stream;
    }
    node.timestamp = Date.now();
    if (parent) {
      parent.contents[name] = node;
      parent.timestamp = node.timestamp;
    }
    return node;
  },
  getFileDataAsTypedArray: function (node) {
    if (!node.contents) return new Uint8Array(0);
    if (node.contents.subarray)
      return node.contents.subarray(0, node.usedBytes);
    return new Uint8Array(node.contents);
  },
  expandFileStorage: function (node, newCapacity) {
    var prevCapacity = node.contents ? node.contents.length : 0;
    if (prevCapacity >= newCapacity) return;
    var CAPACITY_DOUBLING_MAX = 1024 * 1024;
    newCapacity = Math.max(
      newCapacity,
      (prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125)) >>> 0
    );
    if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
    var oldContents = node.contents;
    node.contents = new Uint8Array(newCapacity);
    if (node.usedBytes > 0)
      node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
  },
  resizeFileStorage: function (node, newSize) {
    if (node.usedBytes == newSize) return;
    if (newSize == 0) {
      node.contents = null;
      node.usedBytes = 0;
    } else {
      var oldContents = node.contents;
      node.contents = new Uint8Array(newSize);
      if (oldContents) {
        node.contents.set(
          oldContents.subarray(0, Math.min(newSize, node.usedBytes))
        );
      }
      node.usedBytes = newSize;
    }
  },
  node_ops: {
    getattr: function (node) {
      var attr = {};
      attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
      attr.ino = node.id;
      attr.mode = node.mode;
      attr.nlink = 1;
      attr.uid = 0;
      attr.gid = 0;
      attr.rdev = node.rdev;
      if (FS.isDir(node.mode)) {
        attr.size = 4096;
      } else if (FS.isFile(node.mode)) {
        attr.size = node.usedBytes;
      } else if (FS.isLink(node.mode)) {
        attr.size = node.link.length;
      } else {
        attr.size = 0;
      }
      attr.atime = new Date(node.timestamp);
      attr.mtime = new Date(node.timestamp);
      attr.ctime = new Date(node.timestamp);
      attr.blksize = 4096;
      attr.blocks = Math.ceil(attr.size / attr.blksize);
      return attr;
    },
    setattr: function (node, attr) {
      if (attr.mode !== undefined) {
        node.mode = attr.mode;
      }
      if (attr.timestamp !== undefined) {
        node.timestamp = attr.timestamp;
      }
      if (attr.size !== undefined) {
        MEMFS.resizeFileStorage(node, attr.size);
      }
    },
    lookup: function (parent, name) {
      throw FS.genericErrors[44];
    },
    mknod: function (parent, name, mode, dev) {
      return MEMFS.createNode(parent, name, mode, dev);
    },
    rename: function (old_node, new_dir, new_name) {
      if (FS.isDir(old_node.mode)) {
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {}
        if (new_node) {
          for (var i in new_node.contents) {
            throw new FS.ErrnoError(55);
          }
        }
      }
      delete old_node.parent.contents[old_node.name];
      old_node.parent.timestamp = Date.now();
      old_node.name = new_name;
      new_dir.contents[new_name] = old_node;
      new_dir.timestamp = old_node.parent.timestamp;
      old_node.parent = new_dir;
    },
    unlink: function (parent, name) {
      delete parent.contents[name];
      parent.timestamp = Date.now();
    },
    rmdir: function (parent, name) {
      var node = FS.lookupNode(parent, name);
      for (var i in node.contents) {
        throw new FS.ErrnoError(55);
      }
      delete parent.contents[name];
      parent.timestamp = Date.now();
    },
    readdir: function (node) {
      var entries = [".", ".."];
      for (var key in node.contents) {
        if (!node.contents.hasOwnProperty(key)) {
          continue;
        }
        entries.push(key);
      }
      return entries;
    },
    symlink: function (parent, newname, oldpath) {
      var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
      node.link = oldpath;
      return node;
    },
    readlink: function (node) {
      if (!FS.isLink(node.mode)) {
        throw new FS.ErrnoError(28);
      }
      return node.link;
    },
  },
  stream_ops: {
    read: function (stream, buffer, offset, length, position) {
      var contents = stream.node.contents;
      if (position >= stream.node.usedBytes) return 0;
      var size = Math.min(stream.node.usedBytes - position, length);
      if (size > 8 && contents.subarray) {
        buffer.set(contents.subarray(position, position + size), offset);
      } else {
        for (var i = 0; i < size; i++)
          buffer[offset + i] = contents[position + i];
      }
      return size;
    },
    write: function (stream, buffer, offset, length, position, canOwn) {
      if (buffer.buffer === HEAP8.buffer) {
        canOwn = false;
      }
      if (!length) return 0;
      var node = stream.node;
      node.timestamp = Date.now();
      if (buffer.subarray && (!node.contents || node.contents.subarray)) {
        if (canOwn) {
          node.contents = buffer.subarray(offset, offset + length);
          node.usedBytes = length;
          return length;
        } else if (node.usedBytes === 0 && position === 0) {
          node.contents = buffer.slice(offset, offset + length);
          node.usedBytes = length;
          return length;
        } else if (position + length <= node.usedBytes) {
          node.contents.set(buffer.subarray(offset, offset + length), position);
          return length;
        }
      }
      MEMFS.expandFileStorage(node, position + length);
      if (node.contents.subarray && buffer.subarray) {
        node.contents.set(buffer.subarray(offset, offset + length), position);
      } else {
        for (var i = 0; i < length; i++) {
          node.contents[position + i] = buffer[offset + i];
        }
      }
      node.usedBytes = Math.max(node.usedBytes, position + length);
      return length;
    },
    llseek: function (stream, offset, whence) {
      var position = offset;
      if (whence === 1) {
        position += stream.position;
      } else if (whence === 2) {
        if (FS.isFile(stream.node.mode)) {
          position += stream.node.usedBytes;
        }
      }
      if (position < 0) {
        throw new FS.ErrnoError(28);
      }
      return position;
    },
    allocate: function (stream, offset, length) {
      MEMFS.expandFileStorage(stream.node, offset + length);
      stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
    },
    mmap: function (stream, address, length, position, prot, flags) {
      if (address !== 0) {
        throw new FS.ErrnoError(28);
      }
      if (!FS.isFile(stream.node.mode)) {
        throw new FS.ErrnoError(43);
      }
      var ptr;
      var allocated;
      var contents = stream.node.contents;
      if (!(flags & 2) && contents.buffer === buffer) {
        allocated = false;
        ptr = contents.byteOffset;
      } else {
        if (position > 0 || position + length < contents.length) {
          if (contents.subarray) {
            contents = contents.subarray(position, position + length);
          } else {
            contents = Array.prototype.slice.call(
              contents,
              position,
              position + length
            );
          }
        }
        allocated = true;
        ptr = mmapAlloc(length);
        if (!ptr) {
          throw new FS.ErrnoError(48);
        }
        HEAP8.set(contents, ptr);
      }
      return { ptr: ptr, allocated: allocated };
    },
    msync: function (stream, buffer, offset, length, mmapFlags) {
      if (!FS.isFile(stream.node.mode)) {
        throw new FS.ErrnoError(43);
      }
      if (mmapFlags & 2) {
        return 0;
      }
      var bytesWritten = MEMFS.stream_ops.write(
        stream,
        buffer,
        0,
        length,
        offset,
        false
      );
      return 0;
    },
  },
};
function asyncLoad(url, onload, onerror, noRunDep) {
  var dep = !noRunDep ? getUniqueRunDependency("al " + url) : "";
  readAsync(
    url,
    function (arrayBuffer) {
      assert(
        arrayBuffer,
        'Loading data file "' + url + '" failed (no arrayBuffer).'
      );
      onload(new Uint8Array(arrayBuffer));
      if (dep) removeRunDependency(dep);
    },
    function (event) {
      if (onerror) {
        onerror();
      } else {
        throw 'Loading data file "' + url + '" failed.';
      }
    }
  );
  if (dep) addRunDependency(dep);
}
var FS = {
  root: null,
  mounts: [],
  devices: {},
  streams: [],
  nextInode: 1,
  nameTable: null,
  currentPath: "/",
  initialized: false,
  ignorePermissions: true,
  ErrnoError: null,
  genericErrors: {},
  filesystems: null,
  syncFSRequests: 0,
  lookupPath: (path, opts = {}) => {
    path = PATH_FS.resolve(FS.cwd(), path);
    if (!path) return { path: "", node: null };
    var defaults = { follow_mount: true, recurse_count: 0 };
    opts = Object.assign(defaults, opts);
    if (opts.recurse_count > 8) {
      throw new FS.ErrnoError(32);
    }
    var parts = PATH.normalizeArray(
      path.split("/").filter((p) => !!p),
      false
    );
    var current = FS.root;
    var current_path = "/";
    for (var i = 0; i < parts.length; i++) {
      var islast = i === parts.length - 1;
      if (islast && opts.parent) {
        break;
      }
      current = FS.lookupNode(current, parts[i]);
      current_path = PATH.join2(current_path, parts[i]);
      if (FS.isMountpoint(current)) {
        if (!islast || (islast && opts.follow_mount)) {
          current = current.mounted.root;
        }
      }
      if (!islast || opts.follow) {
        var count = 0;
        while (FS.isLink(current.mode)) {
          var link = FS.readlink(current_path);
          current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
          var lookup = FS.lookupPath(current_path, {
            recurse_count: opts.recurse_count + 1,
          });
          current = lookup.node;
          if (count++ > 40) {
            throw new FS.ErrnoError(32);
          }
        }
      }
    }
    return { path: current_path, node: current };
  },
  getPath: (node) => {
    var path;
    while (true) {
      if (FS.isRoot(node)) {
        var mount = node.mount.mountpoint;
        if (!path) return mount;
        return mount[mount.length - 1] !== "/"
          ? mount + "/" + path
          : mount + path;
      }
      path = path ? node.name + "/" + path : node.name;
      node = node.parent;
    }
  },
  hashName: (parentid, name) => {
    var hash = 0;
    for (var i = 0; i < name.length; i++) {
      hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
    }
    return ((parentid + hash) >>> 0) % FS.nameTable.length;
  },
  hashAddNode: (node) => {
    var hash = FS.hashName(node.parent.id, node.name);
    node.name_next = FS.nameTable[hash];
    FS.nameTable[hash] = node;
  },
  hashRemoveNode: (node) => {
    var hash = FS.hashName(node.parent.id, node.name);
    if (FS.nameTable[hash] === node) {
      FS.nameTable[hash] = node.name_next;
    } else {
      var current = FS.nameTable[hash];
      while (current) {
        if (current.name_next === node) {
          current.name_next = node.name_next;
          break;
        }
        current = current.name_next;
      }
    }
  },
  lookupNode: (parent, name) => {
    var errCode = FS.mayLookup(parent);
    if (errCode) {
      throw new FS.ErrnoError(errCode, parent);
    }
    var hash = FS.hashName(parent.id, name);
    for (var node = FS.nameTable[hash]; node; node = node.name_next) {
      var nodeName = node.name;
      if (node.parent.id === parent.id && nodeName === name) {
        return node;
      }
    }
    return FS.lookup(parent, name);
  },
  createNode: (parent, name, mode, rdev) => {
    var node = new FS.FSNode(parent, name, mode, rdev);
    FS.hashAddNode(node);
    return node;
  },
  destroyNode: (node) => {
    FS.hashRemoveNode(node);
  },
  isRoot: (node) => {
    return node === node.parent;
  },
  isMountpoint: (node) => {
    return !!node.mounted;
  },
  isFile: (mode) => {
    return (mode & 61440) === 32768;
  },
  isDir: (mode) => {
    return (mode & 61440) === 16384;
  },
  isLink: (mode) => {
    return (mode & 61440) === 40960;
  },
  isChrdev: (mode) => {
    return (mode & 61440) === 8192;
  },
  isBlkdev: (mode) => {
    return (mode & 61440) === 24576;
  },
  isFIFO: (mode) => {
    return (mode & 61440) === 4096;
  },
  isSocket: (mode) => {
    return (mode & 49152) === 49152;
  },
  flagModes: { r: 0, "r+": 2, w: 577, "w+": 578, a: 1089, "a+": 1090 },
  modeStringToFlags: (str) => {
    var flags = FS.flagModes[str];
    if (typeof flags == "undefined") {
      throw new Error("Unknown file open mode: " + str);
    }
    return flags;
  },
  flagsToPermissionString: (flag) => {
    var perms = ["r", "w", "rw"][flag & 3];
    if (flag & 512) {
      perms += "w";
    }
    return perms;
  },
  nodePermissions: (node, perms) => {
    if (FS.ignorePermissions) {
      return 0;
    }
    if (perms.includes("r") && !(node.mode & 292)) {
      return 2;
    } else if (perms.includes("w") && !(node.mode & 146)) {
      return 2;
    } else if (perms.includes("x") && !(node.mode & 73)) {
      return 2;
    }
    return 0;
  },
  mayLookup: (dir) => {
    var errCode = FS.nodePermissions(dir, "x");
    if (errCode) return errCode;
    if (!dir.node_ops.lookup) return 2;
    return 0;
  },
  mayCreate: (dir, name) => {
    try {
      var node = FS.lookupNode(dir, name);
      return 20;
    } catch (e) {}
    return FS.nodePermissions(dir, "wx");
  },
  mayDelete: (dir, name, isdir) => {
    var node;
    try {
      node = FS.lookupNode(dir, name);
    } catch (e) {
      return e.errno;
    }
    var errCode = FS.nodePermissions(dir, "wx");
    if (errCode) {
      return errCode;
    }
    if (isdir) {
      if (!FS.isDir(node.mode)) {
        return 54;
      }
      if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
        return 10;
      }
    } else {
      if (FS.isDir(node.mode)) {
        return 31;
      }
    }
    return 0;
  },
  mayOpen: (node, flags) => {
    if (!node) {
      return 44;
    }
    if (FS.isLink(node.mode)) {
      return 32;
    } else if (FS.isDir(node.mode)) {
      if (FS.flagsToPermissionString(flags) !== "r" || flags & 512) {
        return 31;
      }
    }
    return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
  },
  MAX_OPEN_FDS: 4096,
  nextfd: (fd_start = 0, fd_end = FS.MAX_OPEN_FDS) => {
    for (var fd = fd_start; fd <= fd_end; fd++) {
      if (!FS.streams[fd]) {
        return fd;
      }
    }
    throw new FS.ErrnoError(33);
  },
  getStream: (fd) => FS.streams[fd],
  createStream: (stream, fd_start, fd_end) => {
    if (!FS.FSStream) {
      FS.FSStream = function () {
        this.shared = {};
      };
      FS.FSStream.prototype = {
        object: {
          get: function () {
            return this.node;
          },
          set: function (val) {
            this.node = val;
          },
        },
        isRead: {
          get: function () {
            return (this.flags & 2097155) !== 1;
          },
        },
        isWrite: {
          get: function () {
            return (this.flags & 2097155) !== 0;
          },
        },
        isAppend: {
          get: function () {
            return this.flags & 1024;
          },
        },
        flags: {
          get: function () {
            return this.shared.flags;
          },
          set: function (val) {
            this.shared.flags = val;
          },
        },
        position: {
          get function() {
            return this.shared.position;
          },
          set: function (val) {
            this.shared.position = val;
          },
        },
      };
    }
    stream = Object.assign(new FS.FSStream(), stream);
    var fd = FS.nextfd(fd_start, fd_end);
    stream.fd = fd;
    FS.streams[fd] = stream;
    return stream;
  },
  closeStream: (fd) => {
    FS.streams[fd] = null;
  },
  chrdev_stream_ops: {
    open: (stream) => {
      var device = FS.getDevice(stream.node.rdev);
      stream.stream_ops = device.stream_ops;
      if (stream.stream_ops.open) {
        stream.stream_ops.open(stream);
      }
    },
    llseek: () => {
      throw new FS.ErrnoError(70);
    },
  },
  major: (dev) => dev >> 8,
  minor: (dev) => dev & 255,
  makedev: (ma, mi) => (ma << 8) | mi,
  registerDevice: (dev, ops) => {
    FS.devices[dev] = { stream_ops: ops };
  },
  getDevice: (dev) => FS.devices[dev],
  getMounts: (mount) => {
    var mounts = [];
    var check = [mount];
    while (check.length) {
      var m = check.pop();
      mounts.push(m);
      check.push.apply(check, m.mounts);
    }
    return mounts;
  },
  syncfs: (populate, callback) => {
    if (typeof populate == "function") {
      callback = populate;
      populate = false;
    }
    FS.syncFSRequests++;
    if (FS.syncFSRequests > 1) {
      err(
        "warning: " +
          FS.syncFSRequests +
          " FS.syncfs operations in flight at once, probably just doing extra work"
      );
    }
    var mounts = FS.getMounts(FS.root.mount);
    var completed = 0;
    function doCallback(errCode) {
      FS.syncFSRequests--;
      return callback(errCode);
    }
    function done(errCode) {
      if (errCode) {
        if (!done.errored) {
          done.errored = true;
          return doCallback(errCode);
        }
        return;
      }
      if (++completed >= mounts.length) {
        doCallback(null);
      }
    }
    mounts.forEach((mount) => {
      if (!mount.type.syncfs) {
        return done(null);
      }
      mount.type.syncfs(mount, populate, done);
    });
  },
  mount: (type, opts, mountpoint) => {
    var root = mountpoint === "/";
    var pseudo = !mountpoint;
    var node;
    if (root && FS.root) {
      throw new FS.ErrnoError(10);
    } else if (!root && !pseudo) {
      var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
      mountpoint = lookup.path;
      node = lookup.node;
      if (FS.isMountpoint(node)) {
        throw new FS.ErrnoError(10);
      }
      if (!FS.isDir(node.mode)) {
        throw new FS.ErrnoError(54);
      }
    }
    var mount = { type: type, opts: opts, mountpoint: mountpoint, mounts: [] };
    var mountRoot = type.mount(mount);
    mountRoot.mount = mount;
    mount.root = mountRoot;
    if (root) {
      FS.root = mountRoot;
    } else if (node) {
      node.mounted = mount;
      if (node.mount) {
        node.mount.mounts.push(mount);
      }
    }
    return mountRoot;
  },
  unmount: (mountpoint) => {
    var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
    if (!FS.isMountpoint(lookup.node)) {
      throw new FS.ErrnoError(28);
    }
    var node = lookup.node;
    var mount = node.mounted;
    var mounts = FS.getMounts(mount);
    Object.keys(FS.nameTable).forEach((hash) => {
      var current = FS.nameTable[hash];
      while (current) {
        var next = current.name_next;
        if (mounts.includes(current.mount)) {
          FS.destroyNode(current);
        }
        current = next;
      }
    });
    node.mounted = null;
    var idx = node.mount.mounts.indexOf(mount);
    node.mount.mounts.splice(idx, 1);
  },
  lookup: (parent, name) => {
    return parent.node_ops.lookup(parent, name);
  },
  mknod: (path, mode, dev) => {
    var lookup = FS.lookupPath(path, { parent: true });
    var parent = lookup.node;
    var name = PATH.basename(path);
    if (!name || name === "." || name === "..") {
      throw new FS.ErrnoError(28);
    }
    var errCode = FS.mayCreate(parent, name);
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    if (!parent.node_ops.mknod) {
      throw new FS.ErrnoError(63);
    }
    return parent.node_ops.mknod(parent, name, mode, dev);
  },
  create: (path, mode) => {
    mode = mode !== undefined ? mode : 438;
    mode &= 4095;
    mode |= 32768;
    return FS.mknod(path, mode, 0);
  },
  mkdir: (path, mode) => {
    mode = mode !== undefined ? mode : 511;
    mode &= 511 | 512;
    mode |= 16384;
    return FS.mknod(path, mode, 0);
  },
  mkdirTree: (path, mode) => {
    var dirs = path.split("/");
    var d = "";
    for (var i = 0; i < dirs.length; ++i) {
      if (!dirs[i]) continue;
      d += "/" + dirs[i];
      try {
        FS.mkdir(d, mode);
      } catch (e) {
        if (e.errno != 20) throw e;
      }
    }
  },
  mkdev: (path, mode, dev) => {
    if (typeof dev == "undefined") {
      dev = mode;
      mode = 438;
    }
    mode |= 8192;
    return FS.mknod(path, mode, dev);
  },
  symlink: (oldpath, newpath) => {
    if (!PATH_FS.resolve(oldpath)) {
      throw new FS.ErrnoError(44);
    }
    var lookup = FS.lookupPath(newpath, { parent: true });
    var parent = lookup.node;
    if (!parent) {
      throw new FS.ErrnoError(44);
    }
    var newname = PATH.basename(newpath);
    var errCode = FS.mayCreate(parent, newname);
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    if (!parent.node_ops.symlink) {
      throw new FS.ErrnoError(63);
    }
    return parent.node_ops.symlink(parent, newname, oldpath);
  },
  rename: (old_path, new_path) => {
    var old_dirname = PATH.dirname(old_path);
    var new_dirname = PATH.dirname(new_path);
    var old_name = PATH.basename(old_path);
    var new_name = PATH.basename(new_path);
    var lookup, old_dir, new_dir;
    lookup = FS.lookupPath(old_path, { parent: true });
    old_dir = lookup.node;
    lookup = FS.lookupPath(new_path, { parent: true });
    new_dir = lookup.node;
    if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
    if (old_dir.mount !== new_dir.mount) {
      throw new FS.ErrnoError(75);
    }
    var old_node = FS.lookupNode(old_dir, old_name);
    var relative = PATH_FS.relative(old_path, new_dirname);
    if (relative.charAt(0) !== ".") {
      throw new FS.ErrnoError(28);
    }
    relative = PATH_FS.relative(new_path, old_dirname);
    if (relative.charAt(0) !== ".") {
      throw new FS.ErrnoError(55);
    }
    var new_node;
    try {
      new_node = FS.lookupNode(new_dir, new_name);
    } catch (e) {}
    if (old_node === new_node) {
      return;
    }
    var isdir = FS.isDir(old_node.mode);
    var errCode = FS.mayDelete(old_dir, old_name, isdir);
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    errCode = new_node
      ? FS.mayDelete(new_dir, new_name, isdir)
      : FS.mayCreate(new_dir, new_name);
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    if (!old_dir.node_ops.rename) {
      throw new FS.ErrnoError(63);
    }
    if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
      throw new FS.ErrnoError(10);
    }
    if (new_dir !== old_dir) {
      errCode = FS.nodePermissions(old_dir, "w");
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
    }
    FS.hashRemoveNode(old_node);
    try {
      old_dir.node_ops.rename(old_node, new_dir, new_name);
    } catch (e) {
      throw e;
    } finally {
      FS.hashAddNode(old_node);
    }
  },
  rmdir: (path) => {
    var lookup = FS.lookupPath(path, { parent: true });
    var parent = lookup.node;
    var name = PATH.basename(path);
    var node = FS.lookupNode(parent, name);
    var errCode = FS.mayDelete(parent, name, true);
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    if (!parent.node_ops.rmdir) {
      throw new FS.ErrnoError(63);
    }
    if (FS.isMountpoint(node)) {
      throw new FS.ErrnoError(10);
    }
    parent.node_ops.rmdir(parent, name);
    FS.destroyNode(node);
  },
  readdir: (path) => {
    var lookup = FS.lookupPath(path, { follow: true });
    var node = lookup.node;
    if (!node.node_ops.readdir) {
      throw new FS.ErrnoError(54);
    }
    return node.node_ops.readdir(node);
  },
  unlink: (path) => {
    var lookup = FS.lookupPath(path, { parent: true });
    var parent = lookup.node;
    if (!parent) {
      throw new FS.ErrnoError(44);
    }
    var name = PATH.basename(path);
    var node = FS.lookupNode(parent, name);
    var errCode = FS.mayDelete(parent, name, false);
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    if (!parent.node_ops.unlink) {
      throw new FS.ErrnoError(63);
    }
    if (FS.isMountpoint(node)) {
      throw new FS.ErrnoError(10);
    }
    parent.node_ops.unlink(parent, name);
    FS.destroyNode(node);
  },
  readlink: (path) => {
    var lookup = FS.lookupPath(path);
    var link = lookup.node;
    if (!link) {
      throw new FS.ErrnoError(44);
    }
    if (!link.node_ops.readlink) {
      throw new FS.ErrnoError(28);
    }
    return PATH_FS.resolve(
      FS.getPath(link.parent),
      link.node_ops.readlink(link)
    );
  },
  stat: (path, dontFollow) => {
    var lookup = FS.lookupPath(path, { follow: !dontFollow });
    var node = lookup.node;
    if (!node) {
      throw new FS.ErrnoError(44);
    }
    if (!node.node_ops.getattr) {
      throw new FS.ErrnoError(63);
    }
    return node.node_ops.getattr(node);
  },
  lstat: (path) => {
    return FS.stat(path, true);
  },
  chmod: (path, mode, dontFollow) => {
    var node;
    if (typeof path == "string") {
      var lookup = FS.lookupPath(path, { follow: !dontFollow });
      node = lookup.node;
    } else {
      node = path;
    }
    if (!node.node_ops.setattr) {
      throw new FS.ErrnoError(63);
    }
    node.node_ops.setattr(node, {
      mode: (mode & 4095) | (node.mode & ~4095),
      timestamp: Date.now(),
    });
  },
  lchmod: (path, mode) => {
    FS.chmod(path, mode, true);
  },
  fchmod: (fd, mode) => {
    var stream = FS.getStream(fd);
    if (!stream) {
      throw new FS.ErrnoError(8);
    }
    FS.chmod(stream.node, mode);
  },
  chown: (path, uid, gid, dontFollow) => {
    var node;
    if (typeof path == "string") {
      var lookup = FS.lookupPath(path, { follow: !dontFollow });
      node = lookup.node;
    } else {
      node = path;
    }
    if (!node.node_ops.setattr) {
      throw new FS.ErrnoError(63);
    }
    node.node_ops.setattr(node, { timestamp: Date.now() });
  },
  lchown: (path, uid, gid) => {
    FS.chown(path, uid, gid, true);
  },
  fchown: (fd, uid, gid) => {
    var stream = FS.getStream(fd);
    if (!stream) {
      throw new FS.ErrnoError(8);
    }
    FS.chown(stream.node, uid, gid);
  },
  truncate: (path, len) => {
    if (len < 0) {
      throw new FS.ErrnoError(28);
    }
    var node;
    if (typeof path == "string") {
      var lookup = FS.lookupPath(path, { follow: true });
      node = lookup.node;
    } else {
      node = path;
    }
    if (!node.node_ops.setattr) {
      throw new FS.ErrnoError(63);
    }
    if (FS.isDir(node.mode)) {
      throw new FS.ErrnoError(31);
    }
    if (!FS.isFile(node.mode)) {
      throw new FS.ErrnoError(28);
    }
    var errCode = FS.nodePermissions(node, "w");
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    node.node_ops.setattr(node, { size: len, timestamp: Date.now() });
  },
  ftruncate: (fd, len) => {
    var stream = FS.getStream(fd);
    if (!stream) {
      throw new FS.ErrnoError(8);
    }
    if ((stream.flags & 2097155) === 0) {
      throw new FS.ErrnoError(28);
    }
    FS.truncate(stream.node, len);
  },
  utime: (path, atime, mtime) => {
    var lookup = FS.lookupPath(path, { follow: true });
    var node = lookup.node;
    node.node_ops.setattr(node, { timestamp: Math.max(atime, mtime) });
  },
  open: (path, flags, mode) => {
    if (path === "") {
      throw new FS.ErrnoError(44);
    }
    flags = typeof flags == "string" ? FS.modeStringToFlags(flags) : flags;
    mode = typeof mode == "undefined" ? 438 : mode;
    if (flags & 64) {
      mode = (mode & 4095) | 32768;
    } else {
      mode = 0;
    }
    var node;
    if (typeof path == "object") {
      node = path;
    } else {
      path = PATH.normalize(path);
      try {
        var lookup = FS.lookupPath(path, { follow: !(flags & 131072) });
        node = lookup.node;
      } catch (e) {}
    }
    var created = false;
    if (flags & 64) {
      if (node) {
        if (flags & 128) {
          throw new FS.ErrnoError(20);
        }
      } else {
        node = FS.mknod(path, mode, 0);
        created = true;
      }
    }
    if (!node) {
      throw new FS.ErrnoError(44);
    }
    if (FS.isChrdev(node.mode)) {
      flags &= ~512;
    }
    if (flags & 65536 && !FS.isDir(node.mode)) {
      throw new FS.ErrnoError(54);
    }
    if (!created) {
      var errCode = FS.mayOpen(node, flags);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
    }
    if (flags & 512 && !created) {
      FS.truncate(node, 0);
    }
    flags &= ~(128 | 512 | 131072);
    var stream = FS.createStream({
      node: node,
      path: FS.getPath(node),
      flags: flags,
      seekable: true,
      position: 0,
      stream_ops: node.stream_ops,
      ungotten: [],
      error: false,
    });
    if (stream.stream_ops.open) {
      stream.stream_ops.open(stream);
    }
    if (Module["logReadFiles"] && !(flags & 1)) {
      if (!FS.readFiles) FS.readFiles = {};
      if (!(path in FS.readFiles)) {
        FS.readFiles[path] = 1;
      }
    }
    return stream;
  },
  close: (stream) => {
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(8);
    }
    if (stream.getdents) stream.getdents = null;
    try {
      if (stream.stream_ops.close) {
        stream.stream_ops.close(stream);
      }
    } catch (e) {
      throw e;
    } finally {
      FS.closeStream(stream.fd);
    }
    stream.fd = null;
  },
  isClosed: (stream) => {
    return stream.fd === null;
  },
  llseek: (stream, offset, whence) => {
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(8);
    }
    if (!stream.seekable || !stream.stream_ops.llseek) {
      throw new FS.ErrnoError(70);
    }
    if (whence != 0 && whence != 1 && whence != 2) {
      throw new FS.ErrnoError(28);
    }
    stream.position = stream.stream_ops.llseek(stream, offset, whence);
    stream.ungotten = [];
    return stream.position;
  },
  read: (stream, buffer, offset, length, position) => {
    if (length < 0 || position < 0) {
      throw new FS.ErrnoError(28);
    }
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(8);
    }
    if ((stream.flags & 2097155) === 1) {
      throw new FS.ErrnoError(8);
    }
    if (FS.isDir(stream.node.mode)) {
      throw new FS.ErrnoError(31);
    }
    if (!stream.stream_ops.read) {
      throw new FS.ErrnoError(28);
    }
    var seeking = typeof position != "undefined";
    if (!seeking) {
      position = stream.position;
    } else if (!stream.seekable) {
      throw new FS.ErrnoError(70);
    }
    var bytesRead = stream.stream_ops.read(
      stream,
      buffer,
      offset,
      length,
      position
    );
    if (!seeking) stream.position += bytesRead;
    return bytesRead;
  },
  write: (stream, buffer, offset, length, position, canOwn) => {
    if (length < 0 || position < 0) {
      throw new FS.ErrnoError(28);
    }
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(8);
    }
    if ((stream.flags & 2097155) === 0) {
      throw new FS.ErrnoError(8);
    }
    if (FS.isDir(stream.node.mode)) {
      throw new FS.ErrnoError(31);
    }
    if (!stream.stream_ops.write) {
      throw new FS.ErrnoError(28);
    }
    if (stream.seekable && stream.flags & 1024) {
      FS.llseek(stream, 0, 2);
    }
    var seeking = typeof position != "undefined";
    if (!seeking) {
      position = stream.position;
    } else if (!stream.seekable) {
      throw new FS.ErrnoError(70);
    }
    var bytesWritten = stream.stream_ops.write(
      stream,
      buffer,
      offset,
      length,
      position,
      canOwn
    );
    if (!seeking) stream.position += bytesWritten;
    return bytesWritten;
  },
  allocate: (stream, offset, length) => {
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(8);
    }
    if (offset < 0 || length <= 0) {
      throw new FS.ErrnoError(28);
    }
    if ((stream.flags & 2097155) === 0) {
      throw new FS.ErrnoError(8);
    }
    if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
      throw new FS.ErrnoError(43);
    }
    if (!stream.stream_ops.allocate) {
      throw new FS.ErrnoError(138);
    }
    stream.stream_ops.allocate(stream, offset, length);
  },
  mmap: (stream, address, length, position, prot, flags) => {
    if (
      (prot & 2) !== 0 &&
      (flags & 2) === 0 &&
      (stream.flags & 2097155) !== 2
    ) {
      throw new FS.ErrnoError(2);
    }
    if ((stream.flags & 2097155) === 1) {
      throw new FS.ErrnoError(2);
    }
    if (!stream.stream_ops.mmap) {
      throw new FS.ErrnoError(43);
    }
    return stream.stream_ops.mmap(
      stream,
      address,
      length,
      position,
      prot,
      flags
    );
  },
  msync: (stream, buffer, offset, length, mmapFlags) => {
    if (!stream || !stream.stream_ops.msync) {
      return 0;
    }
    return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
  },
  munmap: (stream) => 0,
  ioctl: (stream, cmd, arg) => {
    if (!stream.stream_ops.ioctl) {
      throw new FS.ErrnoError(59);
    }
    return stream.stream_ops.ioctl(stream, cmd, arg);
  },
  readFile: (path, opts = {}) => {
    opts.flags = opts.flags || 0;
    opts.encoding = opts.encoding || "binary";
    if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
      throw new Error('Invalid encoding type "' + opts.encoding + '"');
    }
    var ret;
    var stream = FS.open(path, opts.flags);
    var stat = FS.stat(path);
    var length = stat.size;
    var buf = new Uint8Array(length);
    FS.read(stream, buf, 0, length, 0);
    if (opts.encoding === "utf8") {
      ret = UTF8ArrayToString(buf, 0);
    } else if (opts.encoding === "binary") {
      ret = buf;
    }
    FS.close(stream);
    return ret;
  },
  writeFile: (path, data, opts = {}) => {
    opts.flags = opts.flags || 577;
    var stream = FS.open(path, opts.flags, opts.mode);
    if (typeof data == "string") {
      var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
      var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
      FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn);
    } else if (ArrayBuffer.isView(data)) {
      FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
    } else {
      throw new Error("Unsupported data type");
    }
    FS.close(stream);
  },
  cwd: () => FS.currentPath,
  chdir: (path) => {
    var lookup = FS.lookupPath(path, { follow: true });
    if (lookup.node === null) {
      throw new FS.ErrnoError(44);
    }
    if (!FS.isDir(lookup.node.mode)) {
      throw new FS.ErrnoError(54);
    }
    var errCode = FS.nodePermissions(lookup.node, "x");
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    FS.currentPath = lookup.path;
  },
  createDefaultDirectories: () => {
    FS.mkdir("/tmp");
    FS.mkdir("/home");
    FS.mkdir("/home/web_user");
  },
  createDefaultDevices: () => {
    FS.mkdir("/dev");
    FS.registerDevice(FS.makedev(1, 3), {
      read: () => 0,
      write: (stream, buffer, offset, length, pos) => length,
    });
    FS.mkdev("/dev/null", FS.makedev(1, 3));
    TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
    TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
    FS.mkdev("/dev/tty", FS.makedev(5, 0));
    FS.mkdev("/dev/tty1", FS.makedev(6, 0));
    var random_device = getRandomDevice();
    FS.createDevice("/dev", "random", random_device);
    FS.createDevice("/dev", "urandom", random_device);
    FS.mkdir("/dev/shm");
    FS.mkdir("/dev/shm/tmp");
  },
  createSpecialDirectories: () => {
    FS.mkdir("/proc");
    var proc_self = FS.mkdir("/proc/self");
    FS.mkdir("/proc/self/fd");
    FS.mount(
      {
        mount: () => {
          var node = FS.createNode(proc_self, "fd", 16384 | 511, 73);
          node.node_ops = {
            lookup: (parent, name) => {
              var fd = +name;
              var stream = FS.getStream(fd);
              if (!stream) throw new FS.ErrnoError(8);
              var ret = {
                parent: null,
                mount: { mountpoint: "fake" },
                node_ops: { readlink: () => stream.path },
              };
              ret.parent = ret;
              return ret;
            },
          };
          return node;
        },
      },
      {},
      "/proc/self/fd"
    );
  },
  createStandardStreams: () => {
    if (Module["stdin"]) {
      FS.createDevice("/dev", "stdin", Module["stdin"]);
    } else {
      FS.symlink("/dev/tty", "/dev/stdin");
    }
    if (Module["stdout"]) {
      FS.createDevice("/dev", "stdout", null, Module["stdout"]);
    } else {
      FS.symlink("/dev/tty", "/dev/stdout");
    }
    if (Module["stderr"]) {
      FS.createDevice("/dev", "stderr", null, Module["stderr"]);
    } else {
      FS.symlink("/dev/tty1", "/dev/stderr");
    }
    var stdin = FS.open("/dev/stdin", 0);
    var stdout = FS.open("/dev/stdout", 1);
    var stderr = FS.open("/dev/stderr", 1);
  },
  ensureErrnoError: () => {
    if (FS.ErrnoError) return;
    FS.ErrnoError = function ErrnoError(errno, node) {
      this.node = node;
      this.setErrno = function (errno) {
        this.errno = errno;
      };
      this.setErrno(errno);
      this.message = "FS error";
    };
    FS.ErrnoError.prototype = new Error();
    FS.ErrnoError.prototype.constructor = FS.ErrnoError;
    [44].forEach((code) => {
      FS.genericErrors[code] = new FS.ErrnoError(code);
      FS.genericErrors[code].stack = "<generic error, no stack>";
    });
  },
  staticInit: () => {
    FS.ensureErrnoError();
    FS.nameTable = new Array(4096);
    FS.mount(MEMFS, {}, "/");
    FS.createDefaultDirectories();
    FS.createDefaultDevices();
    FS.createSpecialDirectories();
    FS.filesystems = { MEMFS: MEMFS };
  },
  init: (input, output, error) => {
    FS.init.initialized = true;
    FS.ensureErrnoError();
    Module["stdin"] = input || Module["stdin"];
    Module["stdout"] = output || Module["stdout"];
    Module["stderr"] = error || Module["stderr"];
    FS.createStandardStreams();
  },
  quit: () => {
    FS.init.initialized = false;
    for (var i = 0; i < FS.streams.length; i++) {
      var stream = FS.streams[i];
      if (!stream) {
        continue;
      }
      FS.close(stream);
    }
  },
  getMode: (canRead, canWrite) => {
    var mode = 0;
    if (canRead) mode |= 292 | 73;
    if (canWrite) mode |= 146;
    return mode;
  },
  findObject: (path, dontResolveLastLink) => {
    var ret = FS.analyzePath(path, dontResolveLastLink);
    if (ret.exists) {
      return ret.object;
    } else {
      return null;
    }
  },
  analyzePath: (path, dontResolveLastLink) => {
    try {
      var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
      path = lookup.path;
    } catch (e) {}
    var ret = {
      isRoot: false,
      exists: false,
      error: 0,
      name: null,
      path: null,
      object: null,
      parentExists: false,
      parentPath: null,
      parentObject: null,
    };
    try {
      var lookup = FS.lookupPath(path, { parent: true });
      ret.parentExists = true;
      ret.parentPath = lookup.path;
      ret.parentObject = lookup.node;
      ret.name = PATH.basename(path);
      lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
      ret.exists = true;
      ret.path = lookup.path;
      ret.object = lookup.node;
      ret.name = lookup.node.name;
      ret.isRoot = lookup.path === "/";
    } catch (e) {
      ret.error = e.errno;
    }
    return ret;
  },
  createPath: (parent, path, canRead, canWrite) => {
    parent = typeof parent == "string" ? parent : FS.getPath(parent);
    var parts = path.split("/").reverse();
    while (parts.length) {
      var part = parts.pop();
      if (!part) continue;
      var current = PATH.join2(parent, part);
      try {
        FS.mkdir(current);
      } catch (e) {}
      parent = current;
    }
    return current;
  },
  createFile: (parent, name, properties, canRead, canWrite) => {
    var path = PATH.join2(
      typeof parent == "string" ? parent : FS.getPath(parent),
      name
    );
    var mode = FS.getMode(canRead, canWrite);
    return FS.create(path, mode);
  },
  createDataFile: (parent, name, data, canRead, canWrite, canOwn) => {
    var path = name;
    if (parent) {
      parent = typeof parent == "string" ? parent : FS.getPath(parent);
      path = name ? PATH.join2(parent, name) : parent;
    }
    var mode = FS.getMode(canRead, canWrite);
    var node = FS.create(path, mode);
    if (data) {
      if (typeof data == "string") {
        var arr = new Array(data.length);
        for (var i = 0, len = data.length; i < len; ++i)
          arr[i] = data.charCodeAt(i);
        data = arr;
      }
      FS.chmod(node, mode | 146);
      var stream = FS.open(node, 577);
      FS.write(stream, data, 0, data.length, 0, canOwn);
      FS.close(stream);
      FS.chmod(node, mode);
    }
    return node;
  },
  createDevice: (parent, name, input, output) => {
    var path = PATH.join2(
      typeof parent == "string" ? parent : FS.getPath(parent),
      name
    );
    var mode = FS.getMode(!!input, !!output);
    if (!FS.createDevice.major) FS.createDevice.major = 64;
    var dev = FS.makedev(FS.createDevice.major++, 0);
    FS.registerDevice(dev, {
      open: (stream) => {
        stream.seekable = false;
      },
      close: (stream) => {
        if (output && output.buffer && output.buffer.length) {
          output(10);
        }
      },
      read: (stream, buffer, offset, length, pos) => {
        var bytesRead = 0;
        for (var i = 0; i < length; i++) {
          var result;
          try {
            result = input();
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
          if (result === undefined && bytesRead === 0) {
            throw new FS.ErrnoError(6);
          }
          if (result === null || result === undefined) break;
          bytesRead++;
          buffer[offset + i] = result;
        }
        if (bytesRead) {
          stream.node.timestamp = Date.now();
        }
        return bytesRead;
      },
      write: (stream, buffer, offset, length, pos) => {
        for (var i = 0; i < length; i++) {
          try {
            output(buffer[offset + i]);
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
        }
        if (length) {
          stream.node.timestamp = Date.now();
        }
        return i;
      },
    });
    return FS.mkdev(path, mode, dev);
  },
  forceLoadFile: (obj) => {
    if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
    if (typeof XMLHttpRequest != "undefined") {
      throw new Error(
        "Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread."
      );
    } else if (read_) {
      try {
        obj.contents = intArrayFromString(read_(obj.url), true);
        obj.usedBytes = obj.contents.length;
      } catch (e) {
        throw new FS.ErrnoError(29);
      }
    } else {
      throw new Error("Cannot load without read() or XMLHttpRequest.");
    }
  },
  createLazyFile: (parent, name, url, canRead, canWrite) => {
    function LazyUint8Array() {
      this.lengthKnown = false;
      this.chunks = [];
    }
    LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
      if (idx > this.length - 1 || idx < 0) {
        return undefined;
      }
      var chunkOffset = idx % this.chunkSize;
      var chunkNum = (idx / this.chunkSize) | 0;
      return this.getter(chunkNum)[chunkOffset];
    };
    LazyUint8Array.prototype.setDataGetter =
      function LazyUint8Array_setDataGetter(getter) {
        this.getter = getter;
      };
    LazyUint8Array.prototype.cacheLength =
      function LazyUint8Array_cacheLength() {
        var xhr = new XMLHttpRequest();
        xhr.open("HEAD", url, false);
        xhr.send(null);
        if (!((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304))
          throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
        var datalength = Number(xhr.getResponseHeader("Content-length"));
        var header;
        var hasByteServing =
          (header = xhr.getResponseHeader("Accept-Ranges")) &&
          header === "bytes";
        var usesGzip =
          (header = xhr.getResponseHeader("Content-Encoding")) &&
          header === "gzip";
        var chunkSize = 1024 * 1024;
        if (!hasByteServing) chunkSize = datalength;
        var doXHR = (from, to) => {
          if (from > to)
            throw new Error(
              "invalid range (" + from + ", " + to + ") or no bytes requested!"
            );
          if (to > datalength - 1)
            throw new Error(
              "only " + datalength + " bytes available! programmer error!"
            );
          var xhr = new XMLHttpRequest();
          xhr.open("GET", url, false);
          if (datalength !== chunkSize)
            xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
          xhr.responseType = "arraybuffer";
          if (xhr.overrideMimeType) {
            xhr.overrideMimeType("text/plain; charset=x-user-defined");
          }
          xhr.send(null);
          if (!((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304))
            throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
          if (xhr.response !== undefined) {
            return new Uint8Array(xhr.response || []);
          } else {
            return intArrayFromString(xhr.responseText || "", true);
          }
        };
        var lazyArray = this;
        lazyArray.setDataGetter((chunkNum) => {
          var start = chunkNum * chunkSize;
          var end = (chunkNum + 1) * chunkSize - 1;
          end = Math.min(end, datalength - 1);
          if (typeof lazyArray.chunks[chunkNum] == "undefined") {
            lazyArray.chunks[chunkNum] = doXHR(start, end);
          }
          if (typeof lazyArray.chunks[chunkNum] == "undefined")
            throw new Error("doXHR failed!");
          return lazyArray.chunks[chunkNum];
        });
        if (usesGzip || !datalength) {
          chunkSize = datalength = 1;
          datalength = this.getter(0).length;
          chunkSize = datalength;
          out(
            "LazyFiles on gzip forces download of the whole file when length is accessed"
          );
        }
        this._length = datalength;
        this._chunkSize = chunkSize;
        this.lengthKnown = true;
      };
    if (typeof XMLHttpRequest != "undefined") {
      if (!ENVIRONMENT_IS_WORKER)
        throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
      var lazyArray = new LazyUint8Array();
      Object.defineProperties(lazyArray, {
        length: {
          get: function () {
            if (!this.lengthKnown) {
              this.cacheLength();
            }
            return this._length;
          },
        },
        chunkSize: {
          get: function () {
            if (!this.lengthKnown) {
              this.cacheLength();
            }
            return this._chunkSize;
          },
        },
      });
      var properties = { isDevice: false, contents: lazyArray };
    } else {
      var properties = { isDevice: false, url: url };
    }
    var node = FS.createFile(parent, name, properties, canRead, canWrite);
    if (properties.contents) {
      node.contents = properties.contents;
    } else if (properties.url) {
      node.contents = null;
      node.url = properties.url;
    }
    Object.defineProperties(node, {
      usedBytes: {
        get: function () {
          return this.contents.length;
        },
      },
    });
    var stream_ops = {};
    var keys = Object.keys(node.stream_ops);
    keys.forEach((key) => {
      var fn = node.stream_ops[key];
      stream_ops[key] = function forceLoadLazyFile() {
        FS.forceLoadFile(node);
        return fn.apply(null, arguments);
      };
    });
    stream_ops.read = (stream, buffer, offset, length, position) => {
      FS.forceLoadFile(node);
      var contents = stream.node.contents;
      if (position >= contents.length) return 0;
      var size = Math.min(contents.length - position, length);
      if (contents.slice) {
        for (var i = 0; i < size; i++) {
          buffer[offset + i] = contents[position + i];
        }
      } else {
        for (var i = 0; i < size; i++) {
          buffer[offset + i] = contents.get(position + i);
        }
      }
      return size;
    };
    node.stream_ops = stream_ops;
    return node;
  },
  createPreloadedFile: (
    parent,
    name,
    url,
    canRead,
    canWrite,
    onload,
    onerror,
    dontCreateFile,
    canOwn,
    preFinish
  ) => {
    var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
    var dep = getUniqueRunDependency("cp " + fullname);
    function processData(byteArray) {
      function finish(byteArray) {
        if (preFinish) preFinish();
        if (!dontCreateFile) {
          FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
        }
        if (onload) onload();
        removeRunDependency(dep);
      }
      if (
        Browser.handledByPreloadPlugin(byteArray, fullname, finish, () => {
          if (onerror) onerror();
          removeRunDependency(dep);
        })
      ) {
        return;
      }
      finish(byteArray);
    }
    addRunDependency(dep);
    if (typeof url == "string") {
      asyncLoad(url, (byteArray) => processData(byteArray), onerror);
    } else {
      processData(url);
    }
  },
  indexedDB: () => {
    return (
      window.indexedDB ||
      window.mozIndexedDB ||
      window.webkitIndexedDB ||
      window.msIndexedDB
    );
  },
  DB_NAME: () => {
    return "EM_FS_" + window.location.pathname;
  },
  DB_VERSION: 20,
  DB_STORE_NAME: "FILE_DATA",
  saveFilesToDB: (paths, onload, onerror) => {
    onload = onload || (() => {});
    onerror = onerror || (() => {});
    var indexedDB = FS.indexedDB();
    try {
      var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
    } catch (e) {
      return onerror(e);
    }
    openRequest.onupgradeneeded = () => {
      out("creating db");
      var db = openRequest.result;
      db.createObjectStore(FS.DB_STORE_NAME);
    };
    openRequest.onsuccess = () => {
      var db = openRequest.result;
      var transaction = db.transaction([FS.DB_STORE_NAME], "readwrite");
      var files = transaction.objectStore(FS.DB_STORE_NAME);
      var ok = 0,
        fail = 0,
        total = paths.length;
      function finish() {
        if (fail == 0) onload();
        else onerror();
      }
      paths.forEach((path) => {
        var putRequest = files.put(FS.analyzePath(path).object.contents, path);
        putRequest.onsuccess = () => {
          ok++;
          if (ok + fail == total) finish();
        };
        putRequest.onerror = () => {
          fail++;
          if (ok + fail == total) finish();
        };
      });
      transaction.onerror = onerror;
    };
    openRequest.onerror = onerror;
  },
  loadFilesFromDB: (paths, onload, onerror) => {
    onload = onload || (() => {});
    onerror = onerror || (() => {});
    var indexedDB = FS.indexedDB();
    try {
      var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
    } catch (e) {
      return onerror(e);
    }
    openRequest.onupgradeneeded = onerror;
    openRequest.onsuccess = () => {
      var db = openRequest.result;
      try {
        var transaction = db.transaction([FS.DB_STORE_NAME], "readonly");
      } catch (e) {
        onerror(e);
        return;
      }
      var files = transaction.objectStore(FS.DB_STORE_NAME);
      var ok = 0,
        fail = 0,
        total = paths.length;
      function finish() {
        if (fail == 0) onload();
        else onerror();
      }
      paths.forEach((path) => {
        var getRequest = files.get(path);
        getRequest.onsuccess = () => {
          if (FS.analyzePath(path).exists) {
            FS.unlink(path);
          }
          FS.createDataFile(
            PATH.dirname(path),
            PATH.basename(path),
            getRequest.result,
            true,
            true,
            true
          );
          ok++;
          if (ok + fail == total) finish();
        };
        getRequest.onerror = () => {
          fail++;
          if (ok + fail == total) finish();
        };
      });
      transaction.onerror = onerror;
    };
    openRequest.onerror = onerror;
  },
};
var SYSCALLS = {
  DEFAULT_POLLMASK: 5,
  calculateAt: function (dirfd, path, allowEmpty) {
    if (PATH.isAbs(path)) {
      return path;
    }
    var dir;
    if (dirfd === -100) {
      dir = FS.cwd();
    } else {
      var dirstream = FS.getStream(dirfd);
      if (!dirstream) throw new FS.ErrnoError(8);
      dir = dirstream.path;
    }
    if (path.length == 0) {
      if (!allowEmpty) {
        throw new FS.ErrnoError(44);
      }
      return dir;
    }
    return PATH.join2(dir, path);
  },
  doStat: function (func, path, buf) {
    try {
      var stat = func(path);
    } catch (e) {
      if (
        e &&
        e.node &&
        PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))
      ) {
        return -54;
      }
      throw e;
    }
    HEAP32[buf >> 2] = stat.dev;
    HEAP32[(buf + 4) >> 2] = 0;
    HEAP32[(buf + 8) >> 2] = stat.ino;
    HEAP32[(buf + 12) >> 2] = stat.mode;
    HEAP32[(buf + 16) >> 2] = stat.nlink;
    HEAP32[(buf + 20) >> 2] = stat.uid;
    HEAP32[(buf + 24) >> 2] = stat.gid;
    HEAP32[(buf + 28) >> 2] = stat.rdev;
    HEAP32[(buf + 32) >> 2] = 0;
    (tempI64 = [
      stat.size >>> 0,
      ((tempDouble = stat.size),
      +Math.abs(tempDouble) >= 1
        ? tempDouble > 0
          ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>>
            0
          : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>>
            0
        : 0),
    ]),
      (HEAP32[(buf + 40) >> 2] = tempI64[0]),
      (HEAP32[(buf + 44) >> 2] = tempI64[1]);
    HEAP32[(buf + 48) >> 2] = 4096;
    HEAP32[(buf + 52) >> 2] = stat.blocks;
    HEAP32[(buf + 56) >> 2] = (stat.atime.getTime() / 1e3) | 0;
    HEAP32[(buf + 60) >> 2] = 0;
    HEAP32[(buf + 64) >> 2] = (stat.mtime.getTime() / 1e3) | 0;
    HEAP32[(buf + 68) >> 2] = 0;
    HEAP32[(buf + 72) >> 2] = (stat.ctime.getTime() / 1e3) | 0;
    HEAP32[(buf + 76) >> 2] = 0;
    (tempI64 = [
      stat.ino >>> 0,
      ((tempDouble = stat.ino),
      +Math.abs(tempDouble) >= 1
        ? tempDouble > 0
          ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>>
            0
          : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>>
            0
        : 0),
    ]),
      (HEAP32[(buf + 80) >> 2] = tempI64[0]),
      (HEAP32[(buf + 84) >> 2] = tempI64[1]);
    return 0;
  },
  doMsync: function (addr, stream, len, flags, offset) {
    var buffer = HEAPU8.slice(addr, addr + len);
    FS.msync(stream, buffer, offset, len, flags);
  },
  varargs: undefined,
  get: function () {
    SYSCALLS.varargs += 4;
    var ret = HEAP32[(SYSCALLS.varargs - 4) >> 2];
    return ret;
  },
  getStr: function (ptr) {
    var ret = UTF8ToString(ptr);
    return ret;
  },
  getStreamFromFD: function (fd) {
    var stream = FS.getStream(fd);
    if (!stream) throw new FS.ErrnoError(8);
    return stream;
  },
};
function ___syscall_faccessat(dirfd, path, amode, flags) {
  try {
    path = SYSCALLS.getStr(path);
    path = SYSCALLS.calculateAt(dirfd, path);
    if (amode & ~7) {
      return -28;
    }
    var lookup = FS.lookupPath(path, { follow: true });
    var node = lookup.node;
    if (!node) {
      return -44;
    }
    var perms = "";
    if (amode & 4) perms += "r";
    if (amode & 2) perms += "w";
    if (amode & 1) perms += "x";
    if (perms && FS.nodePermissions(node, perms)) {
      return -2;
    }
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}
function setErrNo(value) {
  HEAP32[___errno_location() >> 2] = value;
  return value;
}
function ___syscall_fcntl64(fd, cmd, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    switch (cmd) {
      case 0: {
        var arg = SYSCALLS.get();
        if (arg < 0) {
          return -28;
        }
        var newStream;
        newStream = FS.createStream(stream, arg);
        return newStream.fd;
      }
      case 1:
      case 2:
        return 0;
      case 3:
        return stream.flags;
      case 4: {
        var arg = SYSCALLS.get();
        stream.flags |= arg;
        return 0;
      }
      case 5: {
        var arg = SYSCALLS.get();
        var offset = 0;
        HEAP16[(arg + offset) >> 1] = 2;
        return 0;
      }
      case 6:
      case 7:
        return 0;
      case 16:
      case 8:
        return -28;
      case 9:
        setErrNo(28);
        return -1;
      default: {
        return -28;
      }
    }
  } catch (e) {
    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}
function ___syscall_fstat64(fd, buf) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    return SYSCALLS.doStat(FS.stat, stream.path, buf);
  } catch (e) {
    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}
function ___syscall_ftruncate64(fd, length_low, length_high) {
  try {
    var length = length_high * 4294967296 + (length_low >>> 0);
    FS.ftruncate(fd, length);
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}
function ___syscall_ioctl(fd, op, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    switch (op) {
      case 21509:
      case 21505: {
        if (!stream.tty) return -59;
        return 0;
      }
      case 21510:
      case 21511:
      case 21512:
      case 21506:
      case 21507:
      case 21508: {
        if (!stream.tty) return -59;
        return 0;
      }
      case 21519: {
        if (!stream.tty) return -59;
        var argp = SYSCALLS.get();
        HEAP32[argp >> 2] = 0;
        return 0;
      }
      case 21520: {
        if (!stream.tty) return -59;
        return -28;
      }
      case 21531: {
        var argp = SYSCALLS.get();
        return FS.ioctl(stream, op, argp);
      }
      case 21523: {
        if (!stream.tty) return -59;
        return 0;
      }
      case 21524: {
        if (!stream.tty) return -59;
        return 0;
      }
      default:
        abort("bad ioctl syscall " + op);
    }
  } catch (e) {
    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}
function ___syscall_lstat64(path, buf) {
  try {
    path = SYSCALLS.getStr(path);
    return SYSCALLS.doStat(FS.lstat, path, buf);
  } catch (e) {
    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}
function ___syscall_newfstatat(dirfd, path, buf, flags) {
  try {
    path = SYSCALLS.getStr(path);
    var nofollow = flags & 256;
    var allowEmpty = flags & 4096;
    flags = flags & ~4352;
    path = SYSCALLS.calculateAt(dirfd, path, allowEmpty);
    return SYSCALLS.doStat(nofollow ? FS.lstat : FS.stat, path, buf);
  } catch (e) {
    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}
function ___syscall_openat(dirfd, path, flags, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    path = SYSCALLS.getStr(path);
    path = SYSCALLS.calculateAt(dirfd, path);
    var mode = varargs ? SYSCALLS.get() : 0;
    return FS.open(path, flags, mode).fd;
  } catch (e) {
    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}
function ___syscall_rmdir(path) {
  try {
    path = SYSCALLS.getStr(path);
    FS.rmdir(path);
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}
function ___syscall_stat64(path, buf) {
  try {
    path = SYSCALLS.getStr(path);
    return SYSCALLS.doStat(FS.stat, path, buf);
  } catch (e) {
    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}
function ___syscall_unlinkat(dirfd, path, flags) {
  try {
    path = SYSCALLS.getStr(path);
    path = SYSCALLS.calculateAt(dirfd, path);
    if (flags === 0) {
      FS.unlink(path);
    } else if (flags === 512) {
      FS.rmdir(path);
    } else {
      abort("Invalid flags passed to unlinkat");
    }
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}
function __emscripten_date_now() {
  return Date.now();
}
function __gmtime_js(time, tmPtr) {
  var date = new Date(HEAP32[time >> 2] * 1e3);
  HEAP32[tmPtr >> 2] = date.getUTCSeconds();
  HEAP32[(tmPtr + 4) >> 2] = date.getUTCMinutes();
  HEAP32[(tmPtr + 8) >> 2] = date.getUTCHours();
  HEAP32[(tmPtr + 12) >> 2] = date.getUTCDate();
  HEAP32[(tmPtr + 16) >> 2] = date.getUTCMonth();
  HEAP32[(tmPtr + 20) >> 2] = date.getUTCFullYear() - 1900;
  HEAP32[(tmPtr + 24) >> 2] = date.getUTCDay();
  var start = Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0, 0);
  var yday = ((date.getTime() - start) / (1e3 * 60 * 60 * 24)) | 0;
  HEAP32[(tmPtr + 28) >> 2] = yday;
}
function _tzset_impl(timezone, daylight, tzname) {
  var currentYear = new Date().getFullYear();
  var winter = new Date(currentYear, 0, 1);
  var summer = new Date(currentYear, 6, 1);
  var winterOffset = winter.getTimezoneOffset();
  var summerOffset = summer.getTimezoneOffset();
  var stdTimezoneOffset = Math.max(winterOffset, summerOffset);
  HEAP32[timezone >> 2] = stdTimezoneOffset * 60;
  HEAP32[daylight >> 2] = Number(winterOffset != summerOffset);
  function extractZone(date) {
    var match = date.toTimeString().match(/\(([A-Za-z ]+)\)$/);
    return match ? match[1] : "GMT";
  }
  var winterName = extractZone(winter);
  var summerName = extractZone(summer);
  var winterNamePtr = allocateUTF8(winterName);
  var summerNamePtr = allocateUTF8(summerName);
  if (summerOffset < winterOffset) {
    HEAP32[tzname >> 2] = winterNamePtr;
    HEAP32[(tzname + 4) >> 2] = summerNamePtr;
  } else {
    HEAP32[tzname >> 2] = summerNamePtr;
    HEAP32[(tzname + 4) >> 2] = winterNamePtr;
  }
}
function __tzset_js(timezone, daylight, tzname) {
  if (__tzset_js.called) return;
  __tzset_js.called = true;
  _tzset_impl(timezone, daylight, tzname);
}
function _abort() {
  abort("");
}
var _emscripten_get_now;
_emscripten_get_now = () => performance.now();
function _emscripten_memcpy_big(dest, src, num) {
  HEAPU8.copyWithin(dest, src, src + num);
}
function _emscripten_get_heap_max() {
  return 2147483648;
}
function emscripten_realloc_buffer(size) {
  try {
    wasmMemory.grow((size - buffer.byteLength + 65535) >>> 16);
    updateGlobalBufferAndViews(wasmMemory.buffer);
    return 1;
  } catch (e) {}
}
function _emscripten_resize_heap(requestedSize) {
  var oldSize = HEAPU8.length;
  requestedSize = requestedSize >>> 0;
  var maxHeapSize = _emscripten_get_heap_max();
  if (requestedSize > maxHeapSize) {
    return false;
  }
  let alignUp = (x, multiple) => x + ((multiple - (x % multiple)) % multiple);
  for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
    var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
    overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
    var newSize = Math.min(
      maxHeapSize,
      alignUp(Math.max(requestedSize, overGrownHeapSize), 65536)
    );
    var replacement = emscripten_realloc_buffer(newSize);
    if (replacement) {
      return true;
    }
  }
  return false;
}
var ENV = {};
function getExecutableName() {
  return thisProgram || "./this.program";
}
function getEnvStrings() {
  if (!getEnvStrings.strings) {
    var lang =
      (
        (typeof navigator == "object" &&
          navigator.languages &&
          navigator.languages[0]) ||
        "C"
      ).replace("-", "_") + ".UTF-8";
    var env = {
      USER: "web_user",
      LOGNAME: "web_user",
      PATH: "/",
      PWD: "/",
      HOME: "/home/web_user",
      LANG: lang,
      _: getExecutableName(),
    };
    for (var x in ENV) {
      if (ENV[x] === undefined) delete env[x];
      else env[x] = ENV[x];
    }
    var strings = [];
    for (var x in env) {
      strings.push(x + "=" + env[x]);
    }
    getEnvStrings.strings = strings;
  }
  return getEnvStrings.strings;
}
function _environ_get(__environ, environ_buf) {
  var bufSize = 0;
  getEnvStrings().forEach(function (string, i) {
    var ptr = environ_buf + bufSize;
    HEAP32[(__environ + i * 4) >> 2] = ptr;
    writeAsciiToMemory(string, ptr);
    bufSize += string.length + 1;
  });
  return 0;
}
function _environ_sizes_get(penviron_count, penviron_buf_size) {
  var strings = getEnvStrings();
  HEAP32[penviron_count >> 2] = strings.length;
  var bufSize = 0;
  strings.forEach(function (string) {
    bufSize += string.length + 1;
  });
  HEAP32[penviron_buf_size >> 2] = bufSize;
  return 0;
}
function _exit(status) {
  exit(status);
}
function _fd_close(fd) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    FS.close(stream);
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
    return e.errno;
  }
}
function doReadv(stream, iov, iovcnt, offset) {
  var ret = 0;
  for (var i = 0; i < iovcnt; i++) {
    var ptr = HEAPU32[iov >> 2];
    var len = HEAPU32[(iov + 4) >> 2];
    iov += 8;
    var curr = FS.read(stream, HEAP8, ptr, len, offset);
    if (curr < 0) return -1;
    ret += curr;
    if (curr < len) break;
  }
  return ret;
}
function _fd_read(fd, iov, iovcnt, pnum) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    var num = doReadv(stream, iov, iovcnt);
    HEAP32[pnum >> 2] = num;
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
    return e.errno;
  }
}
function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    var HIGH_OFFSET = 4294967296;
    var offset = offset_high * HIGH_OFFSET + (offset_low >>> 0);
    var DOUBLE_LIMIT = 9007199254740992;
    if (offset <= -DOUBLE_LIMIT || offset >= DOUBLE_LIMIT) {
      return 61;
    }
    FS.llseek(stream, offset, whence);
    (tempI64 = [
      stream.position >>> 0,
      ((tempDouble = stream.position),
      +Math.abs(tempDouble) >= 1
        ? tempDouble > 0
          ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>>
            0
          : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>>
            0
        : 0),
    ]),
      (HEAP32[newOffset >> 2] = tempI64[0]),
      (HEAP32[(newOffset + 4) >> 2] = tempI64[1]);
    if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null;
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
    return e.errno;
  }
}
function doWritev(stream, iov, iovcnt, offset) {
  var ret = 0;
  for (var i = 0; i < iovcnt; i++) {
    var ptr = HEAPU32[iov >> 2];
    var len = HEAPU32[(iov + 4) >> 2];
    iov += 8;
    var curr = FS.write(stream, HEAP8, ptr, len, offset);
    if (curr < 0) return -1;
    ret += curr;
  }
  return ret;
}
function _fd_write(fd, iov, iovcnt, pnum) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    var num = doWritev(stream, iov, iovcnt);
    HEAP32[pnum >> 2] = num;
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
    return e.errno;
  }
}
var FSNode = function (parent, name, mode, rdev) {
  if (!parent) {
    parent = this;
  }
  this.parent = parent;
  this.mount = parent.mount;
  this.mounted = null;
  this.id = FS.nextInode++;
  this.name = name;
  this.mode = mode;
  this.node_ops = {};
  this.stream_ops = {};
  this.rdev = rdev;
};
var readMode = 292 | 73;
var writeMode = 146;
Object.defineProperties(FSNode.prototype, {
  read: {
    get: function () {
      return (this.mode & readMode) === readMode;
    },
    set: function (val) {
      val ? (this.mode |= readMode) : (this.mode &= ~readMode);
    },
  },
  write: {
    get: function () {
      return (this.mode & writeMode) === writeMode;
    },
    set: function (val) {
      val ? (this.mode |= writeMode) : (this.mode &= ~writeMode);
    },
  },
  isFolder: {
    get: function () {
      return FS.isDir(this.mode);
    },
  },
  isDevice: {
    get: function () {
      return FS.isChrdev(this.mode);
    },
  },
});
FS.FSNode = FSNode;
FS.staticInit();
var ASSERTIONS = false;
function intArrayFromString(stringy, dontAddNull, length) {
  var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
  var u8array = new Array(len);
  var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
  if (dontAddNull) u8array.length = numBytesWritten;
  return u8array;
}
function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 255) {
      if (ASSERTIONS) {
        assert(
          false,
          "Character code " +
            chr +
            " (" +
            String.fromCharCode(chr) +
            ")  at offset " +
            i +
            " not in 0x00-0xFF."
        );
      }
      chr &= 255;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join("");
}
var decodeBase64 =
  typeof atob == "function"
    ? atob
    : function (input) {
        var keyStr =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        do {
          enc1 = keyStr.indexOf(input.charAt(i++));
          enc2 = keyStr.indexOf(input.charAt(i++));
          enc3 = keyStr.indexOf(input.charAt(i++));
          enc4 = keyStr.indexOf(input.charAt(i++));
          chr1 = (enc1 << 2) | (enc2 >> 4);
          chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
          chr3 = ((enc3 & 3) << 6) | enc4;
          output = output + String.fromCharCode(chr1);
          if (enc3 !== 64) {
            output = output + String.fromCharCode(chr2);
          }
          if (enc4 !== 64) {
            output = output + String.fromCharCode(chr3);
          }
        } while (i < input.length);
        return output;
      };
function intArrayFromBase64(s) {
  try {
    var decoded = decodeBase64(s);
    var bytes = new Uint8Array(decoded.length);
    for (var i = 0; i < decoded.length; ++i) {
      bytes[i] = decoded.charCodeAt(i);
    }
    return bytes;
  } catch (_) {
    throw new Error("Converting base64 string to bytes failed.");
  }
}
function tryParseAsDataURI(filename) {
  if (!isDataURI(filename)) {
    return;
  }
  return intArrayFromBase64(filename.slice(dataURIPrefix.length));
}
var asmLibraryArg = {
  A: ___cxa_allocate_exception,
  z: ___cxa_throw,
  l: ___syscall_faccessat,
  f: ___syscall_fcntl64,
  x: ___syscall_fstat64,
  n: ___syscall_ftruncate64,
  y: ___syscall_ioctl,
  u: ___syscall_lstat64,
  v: ___syscall_newfstatat,
  g: ___syscall_openat,
  p: ___syscall_rmdir,
  w: ___syscall_stat64,
  q: ___syscall_unlinkat,
  c: __emscripten_date_now,
  i: __gmtime_js,
  j: __tzset_js,
  d: _abort,
  h: _emscripten_get_now,
  k: _emscripten_memcpy_big,
  o: _emscripten_resize_heap,
  r: _environ_get,
  s: _environ_sizes_get,
  t: _exit,
  a: _fd_close,
  e: _fd_read,
  m: _fd_seek,
  b: _fd_write,
};
var asm = createWasm();
var ___wasm_call_ctors = (Module["___wasm_call_ctors"] = function () {
  return (___wasm_call_ctors = Module["___wasm_call_ctors"] =
    Module["asm"]["C"]).apply(null, arguments);
});
var _fluid_log = (Module["_fluid_log"] = function () {
  return (_fluid_log = Module["_fluid_log"] = Module["asm"]["D"]).apply(
    null,
    arguments
  );
});
var _fluid_free = (Module["_fluid_free"] = function () {
  return (_fluid_free = Module["_fluid_free"] = Module["asm"]["E"]).apply(
    null,
    arguments
  );
});
var _new_fluid_settings = (Module["_new_fluid_settings"] = function () {
  return (_new_fluid_settings = Module["_new_fluid_settings"] =
    Module["asm"]["G"]).apply(null, arguments);
});
var _delete_fluid_settings = (Module["_delete_fluid_settings"] = function () {
  return (_delete_fluid_settings = Module["_delete_fluid_settings"] =
    Module["asm"]["H"]).apply(null, arguments);
});
var _fluid_settings_get_type = (Module["_fluid_settings_get_type"] =
  function () {
    return (_fluid_settings_get_type = Module["_fluid_settings_get_type"] =
      Module["asm"]["I"]).apply(null, arguments);
  });
var _fluid_settings_get_hints = (Module["_fluid_settings_get_hints"] =
  function () {
    return (_fluid_settings_get_hints = Module["_fluid_settings_get_hints"] =
      Module["asm"]["J"]).apply(null, arguments);
  });
var _fluid_settings_is_realtime = (Module["_fluid_settings_is_realtime"] =
  function () {
    return (_fluid_settings_is_realtime = Module[
      "_fluid_settings_is_realtime"
    ] =
      Module["asm"]["K"]).apply(null, arguments);
  });
var _fluid_settings_setstr = (Module["_fluid_settings_setstr"] = function () {
  return (_fluid_settings_setstr = Module["_fluid_settings_setstr"] =
    Module["asm"]["L"]).apply(null, arguments);
});
var _fluid_settings_copystr = (Module["_fluid_settings_copystr"] = function () {
  return (_fluid_settings_copystr = Module["_fluid_settings_copystr"] =
    Module["asm"]["M"]).apply(null, arguments);
});
var _fluid_settings_dupstr = (Module["_fluid_settings_dupstr"] = function () {
  return (_fluid_settings_dupstr = Module["_fluid_settings_dupstr"] =
    Module["asm"]["N"]).apply(null, arguments);
});
var _fluid_settings_str_equal = (Module["_fluid_settings_str_equal"] =
  function () {
    return (_fluid_settings_str_equal = Module["_fluid_settings_str_equal"] =
      Module["asm"]["O"]).apply(null, arguments);
  });
var _fluid_settings_getstr_default = (Module["_fluid_settings_getstr_default"] =
  function () {
    return (_fluid_settings_getstr_default = Module[
      "_fluid_settings_getstr_default"
    ] =
      Module["asm"]["P"]).apply(null, arguments);
  });
var _fluid_settings_setnum = (Module["_fluid_settings_setnum"] = function () {
  return (_fluid_settings_setnum = Module["_fluid_settings_setnum"] =
    Module["asm"]["Q"]).apply(null, arguments);
});
var _fluid_settings_getnum = (Module["_fluid_settings_getnum"] = function () {
  return (_fluid_settings_getnum = Module["_fluid_settings_getnum"] =
    Module["asm"]["R"]).apply(null, arguments);
});
var _fluid_settings_getnum_range = (Module["_fluid_settings_getnum_range"] =
  function () {
    return (_fluid_settings_getnum_range = Module[
      "_fluid_settings_getnum_range"
    ] =
      Module["asm"]["S"]).apply(null, arguments);
  });
var _fluid_settings_getnum_default = (Module["_fluid_settings_getnum_default"] =
  function () {
    return (_fluid_settings_getnum_default = Module[
      "_fluid_settings_getnum_default"
    ] =
      Module["asm"]["T"]).apply(null, arguments);
  });
var _fluid_settings_setint = (Module["_fluid_settings_setint"] = function () {
  return (_fluid_settings_setint = Module["_fluid_settings_setint"] =
    Module["asm"]["U"]).apply(null, arguments);
});
var _fluid_settings_getint = (Module["_fluid_settings_getint"] = function () {
  return (_fluid_settings_getint = Module["_fluid_settings_getint"] =
    Module["asm"]["V"]).apply(null, arguments);
});
var _fluid_settings_getint_range = (Module["_fluid_settings_getint_range"] =
  function () {
    return (_fluid_settings_getint_range = Module[
      "_fluid_settings_getint_range"
    ] =
      Module["asm"]["W"]).apply(null, arguments);
  });
var _fluid_settings_getint_default = (Module["_fluid_settings_getint_default"] =
  function () {
    return (_fluid_settings_getint_default = Module[
      "_fluid_settings_getint_default"
    ] =
      Module["asm"]["X"]).apply(null, arguments);
  });
var _fluid_settings_foreach_option = (Module["_fluid_settings_foreach_option"] =
  function () {
    return (_fluid_settings_foreach_option = Module[
      "_fluid_settings_foreach_option"
    ] =
      Module["asm"]["Y"]).apply(null, arguments);
  });
var _fluid_settings_option_count = (Module["_fluid_settings_option_count"] =
  function () {
    return (_fluid_settings_option_count = Module[
      "_fluid_settings_option_count"
    ] =
      Module["asm"]["Z"]).apply(null, arguments);
  });
var _fluid_settings_option_concat = (Module["_fluid_settings_option_concat"] =
  function () {
    return (_fluid_settings_option_concat = Module[
      "_fluid_settings_option_concat"
    ] =
      Module["asm"]["_"]).apply(null, arguments);
  });
var _fluid_settings_foreach = (Module["_fluid_settings_foreach"] = function () {
  return (_fluid_settings_foreach = Module["_fluid_settings_foreach"] =
    Module["asm"]["$"]).apply(null, arguments);
});
var _fluid_set_log_function = (Module["_fluid_set_log_function"] = function () {
  return (_fluid_set_log_function = Module["_fluid_set_log_function"] =
    Module["asm"]["aa"]).apply(null, arguments);
});
var _fluid_default_log_function = (Module["_fluid_default_log_function"] =
  function () {
    return (_fluid_default_log_function = Module[
      "_fluid_default_log_function"
    ] =
      Module["asm"]["ba"]).apply(null, arguments);
  });
var _malloc = (Module["_malloc"] = function () {
  return (_malloc = Module["_malloc"] = Module["asm"]["ca"]).apply(
    null,
    arguments
  );
});
var _free = (Module["_free"] = function () {
  return (_free = Module["_free"] = Module["asm"]["da"]).apply(null, arguments);
});
var _new_fluid_defsfloader = (Module["_new_fluid_defsfloader"] = function () {
  return (_new_fluid_defsfloader = Module["_new_fluid_defsfloader"] =
    Module["asm"]["ea"]).apply(null, arguments);
});
var _delete_fluid_sfloader = (Module["_delete_fluid_sfloader"] = function () {
  return (_delete_fluid_sfloader = Module["_delete_fluid_sfloader"] =
    Module["asm"]["fa"]).apply(null, arguments);
});
var _new_fluid_sfloader = (Module["_new_fluid_sfloader"] = function () {
  return (_new_fluid_sfloader = Module["_new_fluid_sfloader"] =
    Module["asm"]["ga"]).apply(null, arguments);
});
var _fluid_sfloader_set_data = (Module["_fluid_sfloader_set_data"] =
  function () {
    return (_fluid_sfloader_set_data = Module["_fluid_sfloader_set_data"] =
      Module["asm"]["ha"]).apply(null, arguments);
  });
var _fluid_sfloader_get_data = (Module["_fluid_sfloader_get_data"] =
  function () {
    return (_fluid_sfloader_get_data = Module["_fluid_sfloader_get_data"] =
      Module["asm"]["ia"]).apply(null, arguments);
  });
var _new_fluid_sfont = (Module["_new_fluid_sfont"] = function () {
  return (_new_fluid_sfont = Module["_new_fluid_sfont"] =
    Module["asm"]["ja"]).apply(null, arguments);
});
var _fluid_sfont_set_data = (Module["_fluid_sfont_set_data"] = function () {
  return (_fluid_sfont_set_data = Module["_fluid_sfont_set_data"] =
    Module["asm"]["ka"]).apply(null, arguments);
});
var _fluid_sfont_get_data = (Module["_fluid_sfont_get_data"] = function () {
  return (_fluid_sfont_get_data = Module["_fluid_sfont_get_data"] =
    Module["asm"]["la"]).apply(null, arguments);
});
var _delete_fluid_sfont = (Module["_delete_fluid_sfont"] = function () {
  return (_delete_fluid_sfont = Module["_delete_fluid_sfont"] =
    Module["asm"]["ma"]).apply(null, arguments);
});
var _fluid_preset_get_banknum = (Module["_fluid_preset_get_banknum"] =
  function () {
    return (_fluid_preset_get_banknum = Module["_fluid_preset_get_banknum"] =
      Module["asm"]["na"]).apply(null, arguments);
  });
var _fluid_preset_get_num = (Module["_fluid_preset_get_num"] = function () {
  return (_fluid_preset_get_num = Module["_fluid_preset_get_num"] =
    Module["asm"]["oa"]).apply(null, arguments);
});
var _fluid_preset_get_data = (Module["_fluid_preset_get_data"] = function () {
  return (_fluid_preset_get_data = Module["_fluid_preset_get_data"] =
    Module["asm"]["pa"]).apply(null, arguments);
});
var _fluid_preset_get_name = (Module["_fluid_preset_get_name"] = function () {
  return (_fluid_preset_get_name = Module["_fluid_preset_get_name"] =
    Module["asm"]["qa"]).apply(null, arguments);
});
var _delete_fluid_sample = (Module["_delete_fluid_sample"] = function () {
  return (_delete_fluid_sample = Module["_delete_fluid_sample"] =
    Module["asm"]["ra"]).apply(null, arguments);
});
var _delete_fluid_preset = (Module["_delete_fluid_preset"] = function () {
  return (_delete_fluid_preset = Module["_delete_fluid_preset"] =
    Module["asm"]["sa"]).apply(null, arguments);
});
var _new_fluid_sample = (Module["_new_fluid_sample"] = function () {
  return (_new_fluid_sample = Module["_new_fluid_sample"] =
    Module["asm"]["ta"]).apply(null, arguments);
});
var _new_fluid_preset = (Module["_new_fluid_preset"] = function () {
  return (_new_fluid_preset = Module["_new_fluid_preset"] =
    Module["asm"]["ua"]).apply(null, arguments);
});
var _fluid_preset_set_data = (Module["_fluid_preset_set_data"] = function () {
  return (_fluid_preset_set_data = Module["_fluid_preset_set_data"] =
    Module["asm"]["va"]).apply(null, arguments);
});
var _delete_fluid_mod = (Module["_delete_fluid_mod"] = function () {
  return (_delete_fluid_mod = Module["_delete_fluid_mod"] =
    Module["asm"]["wa"]).apply(null, arguments);
});
var _fluid_voice_gen_set = (Module["_fluid_voice_gen_set"] = function () {
  return (_fluid_voice_gen_set = Module["_fluid_voice_gen_set"] =
    Module["asm"]["xa"]).apply(null, arguments);
});
var _fluid_voice_gen_incr = (Module["_fluid_voice_gen_incr"] = function () {
  return (_fluid_voice_gen_incr = Module["_fluid_voice_gen_incr"] =
    Module["asm"]["ya"]).apply(null, arguments);
});
var _fluid_synth_start_voice = (Module["_fluid_synth_start_voice"] =
  function () {
    return (_fluid_synth_start_voice = Module["_fluid_synth_start_voice"] =
      Module["asm"]["za"]).apply(null, arguments);
  });
var _fluid_voice_optimize_sample = (Module["_fluid_voice_optimize_sample"] =
  function () {
    return (_fluid_voice_optimize_sample = Module[
      "_fluid_voice_optimize_sample"
    ] =
      Module["asm"]["Aa"]).apply(null, arguments);
  });
var _fluid_mod_test_identity = (Module["_fluid_mod_test_identity"] =
  function () {
    return (_fluid_mod_test_identity = Module["_fluid_mod_test_identity"] =
      Module["asm"]["Ba"]).apply(null, arguments);
  });
var _new_fluid_mod = (Module["_new_fluid_mod"] = function () {
  return (_new_fluid_mod = Module["_new_fluid_mod"] =
    Module["asm"]["Ca"]).apply(null, arguments);
});
var _fluid_sfloader_set_callbacks = (Module["_fluid_sfloader_set_callbacks"] =
  function () {
    return (_fluid_sfloader_set_callbacks = Module[
      "_fluid_sfloader_set_callbacks"
    ] =
      Module["asm"]["Da"]).apply(null, arguments);
  });
var _fluid_sfont_get_id = (Module["_fluid_sfont_get_id"] = function () {
  return (_fluid_sfont_get_id = Module["_fluid_sfont_get_id"] =
    Module["asm"]["Ea"]).apply(null, arguments);
});
var _fluid_sfont_get_name = (Module["_fluid_sfont_get_name"] = function () {
  return (_fluid_sfont_get_name = Module["_fluid_sfont_get_name"] =
    Module["asm"]["Fa"]).apply(null, arguments);
});
var _fluid_sfont_get_preset = (Module["_fluid_sfont_get_preset"] = function () {
  return (_fluid_sfont_get_preset = Module["_fluid_sfont_get_preset"] =
    Module["asm"]["Ga"]).apply(null, arguments);
});
var _fluid_sfont_iteration_start = (Module["_fluid_sfont_iteration_start"] =
  function () {
    return (_fluid_sfont_iteration_start = Module[
      "_fluid_sfont_iteration_start"
    ] =
      Module["asm"]["Ha"]).apply(null, arguments);
  });
var _fluid_sfont_iteration_next = (Module["_fluid_sfont_iteration_next"] =
  function () {
    return (_fluid_sfont_iteration_next = Module[
      "_fluid_sfont_iteration_next"
    ] =
      Module["asm"]["Ia"]).apply(null, arguments);
  });
var _fluid_preset_get_sfont = (Module["_fluid_preset_get_sfont"] = function () {
  return (_fluid_preset_get_sfont = Module["_fluid_preset_get_sfont"] =
    Module["asm"]["Ja"]).apply(null, arguments);
});
var _fluid_sample_sizeof = (Module["_fluid_sample_sizeof"] = function () {
  return (_fluid_sample_sizeof = Module["_fluid_sample_sizeof"] =
    Module["asm"]["Ka"]).apply(null, arguments);
});
var _fluid_sample_set_name = (Module["_fluid_sample_set_name"] = function () {
  return (_fluid_sample_set_name = Module["_fluid_sample_set_name"] =
    Module["asm"]["La"]).apply(null, arguments);
});
var _fluid_sample_set_sound_data = (Module["_fluid_sample_set_sound_data"] =
  function () {
    return (_fluid_sample_set_sound_data = Module[
      "_fluid_sample_set_sound_data"
    ] =
      Module["asm"]["Ma"]).apply(null, arguments);
  });
var _fluid_sample_set_loop = (Module["_fluid_sample_set_loop"] = function () {
  return (_fluid_sample_set_loop = Module["_fluid_sample_set_loop"] =
    Module["asm"]["Na"]).apply(null, arguments);
});
var _fluid_sample_set_pitch = (Module["_fluid_sample_set_pitch"] = function () {
  return (_fluid_sample_set_pitch = Module["_fluid_sample_set_pitch"] =
    Module["asm"]["Oa"]).apply(null, arguments);
});
var _fluid_is_soundfont = (Module["_fluid_is_soundfont"] = function () {
  return (_fluid_is_soundfont = Module["_fluid_is_soundfont"] =
    Module["asm"]["Pa"]).apply(null, arguments);
});
var _new_fluid_event = (Module["_new_fluid_event"] = function () {
  return (_new_fluid_event = Module["_new_fluid_event"] =
    Module["asm"]["Qa"]).apply(null, arguments);
});
var _delete_fluid_event = (Module["_delete_fluid_event"] = function () {
  return (_delete_fluid_event = Module["_delete_fluid_event"] =
    Module["asm"]["Ra"]).apply(null, arguments);
});
var _fluid_event_set_source = (Module["_fluid_event_set_source"] = function () {
  return (_fluid_event_set_source = Module["_fluid_event_set_source"] =
    Module["asm"]["Sa"]).apply(null, arguments);
});
var _fluid_event_set_dest = (Module["_fluid_event_set_dest"] = function () {
  return (_fluid_event_set_dest = Module["_fluid_event_set_dest"] =
    Module["asm"]["Ta"]).apply(null, arguments);
});
var _fluid_event_timer = (Module["_fluid_event_timer"] = function () {
  return (_fluid_event_timer = Module["_fluid_event_timer"] =
    Module["asm"]["Ua"]).apply(null, arguments);
});
var _fluid_event_noteon = (Module["_fluid_event_noteon"] = function () {
  return (_fluid_event_noteon = Module["_fluid_event_noteon"] =
    Module["asm"]["Va"]).apply(null, arguments);
});
var _fluid_event_noteoff = (Module["_fluid_event_noteoff"] = function () {
  return (_fluid_event_noteoff = Module["_fluid_event_noteoff"] =
    Module["asm"]["Wa"]).apply(null, arguments);
});
var _fluid_event_note = (Module["_fluid_event_note"] = function () {
  return (_fluid_event_note = Module["_fluid_event_note"] =
    Module["asm"]["Xa"]).apply(null, arguments);
});
var _fluid_event_all_sounds_off = (Module["_fluid_event_all_sounds_off"] =
  function () {
    return (_fluid_event_all_sounds_off = Module[
      "_fluid_event_all_sounds_off"
    ] =
      Module["asm"]["Ya"]).apply(null, arguments);
  });
var _fluid_event_all_notes_off = (Module["_fluid_event_all_notes_off"] =
  function () {
    return (_fluid_event_all_notes_off = Module["_fluid_event_all_notes_off"] =
      Module["asm"]["Za"]).apply(null, arguments);
  });
var _fluid_event_bank_select = (Module["_fluid_event_bank_select"] =
  function () {
    return (_fluid_event_bank_select = Module["_fluid_event_bank_select"] =
      Module["asm"]["_a"]).apply(null, arguments);
  });
var _fluid_event_program_change = (Module["_fluid_event_program_change"] =
  function () {
    return (_fluid_event_program_change = Module[
      "_fluid_event_program_change"
    ] =
      Module["asm"]["$a"]).apply(null, arguments);
  });
var _fluid_event_program_select = (Module["_fluid_event_program_select"] =
  function () {
    return (_fluid_event_program_select = Module[
      "_fluid_event_program_select"
    ] =
      Module["asm"]["ab"]).apply(null, arguments);
  });
var _fluid_event_pitch_bend = (Module["_fluid_event_pitch_bend"] = function () {
  return (_fluid_event_pitch_bend = Module["_fluid_event_pitch_bend"] =
    Module["asm"]["bb"]).apply(null, arguments);
});
var _fluid_event_pitch_wheelsens = (Module["_fluid_event_pitch_wheelsens"] =
  function () {
    return (_fluid_event_pitch_wheelsens = Module[
      "_fluid_event_pitch_wheelsens"
    ] =
      Module["asm"]["cb"]).apply(null, arguments);
  });
var _fluid_event_modulation = (Module["_fluid_event_modulation"] = function () {
  return (_fluid_event_modulation = Module["_fluid_event_modulation"] =
    Module["asm"]["db"]).apply(null, arguments);
});
var _fluid_event_sustain = (Module["_fluid_event_sustain"] = function () {
  return (_fluid_event_sustain = Module["_fluid_event_sustain"] =
    Module["asm"]["eb"]).apply(null, arguments);
});
var _fluid_event_control_change = (Module["_fluid_event_control_change"] =
  function () {
    return (_fluid_event_control_change = Module[
      "_fluid_event_control_change"
    ] =
      Module["asm"]["fb"]).apply(null, arguments);
  });
var _fluid_event_pan = (Module["_fluid_event_pan"] = function () {
  return (_fluid_event_pan = Module["_fluid_event_pan"] =
    Module["asm"]["gb"]).apply(null, arguments);
});
var _fluid_event_volume = (Module["_fluid_event_volume"] = function () {
  return (_fluid_event_volume = Module["_fluid_event_volume"] =
    Module["asm"]["hb"]).apply(null, arguments);
});
var _fluid_event_reverb_send = (Module["_fluid_event_reverb_send"] =
  function () {
    return (_fluid_event_reverb_send = Module["_fluid_event_reverb_send"] =
      Module["asm"]["ib"]).apply(null, arguments);
  });
var _fluid_event_chorus_send = (Module["_fluid_event_chorus_send"] =
  function () {
    return (_fluid_event_chorus_send = Module["_fluid_event_chorus_send"] =
      Module["asm"]["jb"]).apply(null, arguments);
  });
var _fluid_event_unregistering = (Module["_fluid_event_unregistering"] =
  function () {
    return (_fluid_event_unregistering = Module["_fluid_event_unregistering"] =
      Module["asm"]["kb"]).apply(null, arguments);
  });
var _fluid_event_scale = (Module["_fluid_event_scale"] = function () {
  return (_fluid_event_scale = Module["_fluid_event_scale"] =
    Module["asm"]["lb"]).apply(null, arguments);
});
var _fluid_event_channel_pressure = (Module["_fluid_event_channel_pressure"] =
  function () {
    return (_fluid_event_channel_pressure = Module[
      "_fluid_event_channel_pressure"
    ] =
      Module["asm"]["mb"]).apply(null, arguments);
  });
var _fluid_event_key_pressure = (Module["_fluid_event_key_pressure"] =
  function () {
    return (_fluid_event_key_pressure = Module["_fluid_event_key_pressure"] =
      Module["asm"]["nb"]).apply(null, arguments);
  });
var _fluid_event_system_reset = (Module["_fluid_event_system_reset"] =
  function () {
    return (_fluid_event_system_reset = Module["_fluid_event_system_reset"] =
      Module["asm"]["ob"]).apply(null, arguments);
  });
var _fluid_event_from_midi_event = (Module["_fluid_event_from_midi_event"] =
  function () {
    return (_fluid_event_from_midi_event = Module[
      "_fluid_event_from_midi_event"
    ] =
      Module["asm"]["pb"]).apply(null, arguments);
  });
var _fluid_midi_event_get_channel = (Module["_fluid_midi_event_get_channel"] =
  function () {
    return (_fluid_midi_event_get_channel = Module[
      "_fluid_midi_event_get_channel"
    ] =
      Module["asm"]["qb"]).apply(null, arguments);
  });
var _fluid_midi_event_get_type = (Module["_fluid_midi_event_get_type"] =
  function () {
    return (_fluid_midi_event_get_type = Module["_fluid_midi_event_get_type"] =
      Module["asm"]["rb"]).apply(null, arguments);
  });
var _fluid_midi_event_get_key = (Module["_fluid_midi_event_get_key"] =
  function () {
    return (_fluid_midi_event_get_key = Module["_fluid_midi_event_get_key"] =
      Module["asm"]["sb"]).apply(null, arguments);
  });
var _fluid_midi_event_get_velocity = (Module["_fluid_midi_event_get_velocity"] =
  function () {
    return (_fluid_midi_event_get_velocity = Module[
      "_fluid_midi_event_get_velocity"
    ] =
      Module["asm"]["tb"]).apply(null, arguments);
  });
var _fluid_midi_event_get_control = (Module["_fluid_midi_event_get_control"] =
  function () {
    return (_fluid_midi_event_get_control = Module[
      "_fluid_midi_event_get_control"
    ] =
      Module["asm"]["ub"]).apply(null, arguments);
  });
var _fluid_midi_event_get_value = (Module["_fluid_midi_event_get_value"] =
  function () {
    return (_fluid_midi_event_get_value = Module[
      "_fluid_midi_event_get_value"
    ] =
      Module["asm"]["vb"]).apply(null, arguments);
  });
var _fluid_midi_event_get_program = (Module["_fluid_midi_event_get_program"] =
  function () {
    return (_fluid_midi_event_get_program = Module[
      "_fluid_midi_event_get_program"
    ] =
      Module["asm"]["wb"]).apply(null, arguments);
  });
var _fluid_midi_event_get_pitch = (Module["_fluid_midi_event_get_pitch"] =
  function () {
    return (_fluid_midi_event_get_pitch = Module[
      "_fluid_midi_event_get_pitch"
    ] =
      Module["asm"]["xb"]).apply(null, arguments);
  });
var _fluid_event_get_type = (Module["_fluid_event_get_type"] = function () {
  return (_fluid_event_get_type = Module["_fluid_event_get_type"] =
    Module["asm"]["yb"]).apply(null, arguments);
});
var _fluid_event_get_source = (Module["_fluid_event_get_source"] = function () {
  return (_fluid_event_get_source = Module["_fluid_event_get_source"] =
    Module["asm"]["zb"]).apply(null, arguments);
});
var _fluid_event_get_dest = (Module["_fluid_event_get_dest"] = function () {
  return (_fluid_event_get_dest = Module["_fluid_event_get_dest"] =
    Module["asm"]["Ab"]).apply(null, arguments);
});
var _fluid_event_get_channel = (Module["_fluid_event_get_channel"] =
  function () {
    return (_fluid_event_get_channel = Module["_fluid_event_get_channel"] =
      Module["asm"]["Bb"]).apply(null, arguments);
  });
var _fluid_event_get_key = (Module["_fluid_event_get_key"] = function () {
  return (_fluid_event_get_key = Module["_fluid_event_get_key"] =
    Module["asm"]["Cb"]).apply(null, arguments);
});
var _fluid_event_get_velocity = (Module["_fluid_event_get_velocity"] =
  function () {
    return (_fluid_event_get_velocity = Module["_fluid_event_get_velocity"] =
      Module["asm"]["Db"]).apply(null, arguments);
  });
var _fluid_event_get_control = (Module["_fluid_event_get_control"] =
  function () {
    return (_fluid_event_get_control = Module["_fluid_event_get_control"] =
      Module["asm"]["Eb"]).apply(null, arguments);
  });
var _fluid_event_get_value = (Module["_fluid_event_get_value"] = function () {
  return (_fluid_event_get_value = Module["_fluid_event_get_value"] =
    Module["asm"]["Fb"]).apply(null, arguments);
});
var _fluid_event_get_data = (Module["_fluid_event_get_data"] = function () {
  return (_fluid_event_get_data = Module["_fluid_event_get_data"] =
    Module["asm"]["Gb"]).apply(null, arguments);
});
var _fluid_event_get_duration = (Module["_fluid_event_get_duration"] =
  function () {
    return (_fluid_event_get_duration = Module["_fluid_event_get_duration"] =
      Module["asm"]["Hb"]).apply(null, arguments);
  });
var _fluid_event_get_bank = (Module["_fluid_event_get_bank"] = function () {
  return (_fluid_event_get_bank = Module["_fluid_event_get_bank"] =
    Module["asm"]["Ib"]).apply(null, arguments);
});
var _fluid_event_get_pitch = (Module["_fluid_event_get_pitch"] = function () {
  return (_fluid_event_get_pitch = Module["_fluid_event_get_pitch"] =
    Module["asm"]["Jb"]).apply(null, arguments);
});
var _fluid_event_get_program = (Module["_fluid_event_get_program"] =
  function () {
    return (_fluid_event_get_program = Module["_fluid_event_get_program"] =
      Module["asm"]["Kb"]).apply(null, arguments);
  });
var _fluid_event_get_sfont_id = (Module["_fluid_event_get_sfont_id"] =
  function () {
    return (_fluid_event_get_sfont_id = Module["_fluid_event_get_sfont_id"] =
      Module["asm"]["Lb"]).apply(null, arguments);
  });
var _fluid_event_get_scale = (Module["_fluid_event_get_scale"] = function () {
  return (_fluid_event_get_scale = Module["_fluid_event_get_scale"] =
    Module["asm"]["Mb"]).apply(null, arguments);
});
var _fluid_mod_clone = (Module["_fluid_mod_clone"] = function () {
  return (_fluid_mod_clone = Module["_fluid_mod_clone"] =
    Module["asm"]["Nb"]).apply(null, arguments);
});
var _fluid_mod_set_source1 = (Module["_fluid_mod_set_source1"] = function () {
  return (_fluid_mod_set_source1 = Module["_fluid_mod_set_source1"] =
    Module["asm"]["Ob"]).apply(null, arguments);
});
var _fluid_mod_set_source2 = (Module["_fluid_mod_set_source2"] = function () {
  return (_fluid_mod_set_source2 = Module["_fluid_mod_set_source2"] =
    Module["asm"]["Pb"]).apply(null, arguments);
});
var _fluid_mod_set_dest = (Module["_fluid_mod_set_dest"] = function () {
  return (_fluid_mod_set_dest = Module["_fluid_mod_set_dest"] =
    Module["asm"]["Qb"]).apply(null, arguments);
});
var _fluid_mod_set_amount = (Module["_fluid_mod_set_amount"] = function () {
  return (_fluid_mod_set_amount = Module["_fluid_mod_set_amount"] =
    Module["asm"]["Rb"]).apply(null, arguments);
});
var _fluid_mod_get_source1 = (Module["_fluid_mod_get_source1"] = function () {
  return (_fluid_mod_get_source1 = Module["_fluid_mod_get_source1"] =
    Module["asm"]["Sb"]).apply(null, arguments);
});
var _fluid_mod_get_flags1 = (Module["_fluid_mod_get_flags1"] = function () {
  return (_fluid_mod_get_flags1 = Module["_fluid_mod_get_flags1"] =
    Module["asm"]["Tb"]).apply(null, arguments);
});
var _fluid_mod_get_source2 = (Module["_fluid_mod_get_source2"] = function () {
  return (_fluid_mod_get_source2 = Module["_fluid_mod_get_source2"] =
    Module["asm"]["Ub"]).apply(null, arguments);
});
var _fluid_mod_get_flags2 = (Module["_fluid_mod_get_flags2"] = function () {
  return (_fluid_mod_get_flags2 = Module["_fluid_mod_get_flags2"] =
    Module["asm"]["Vb"]).apply(null, arguments);
});
var _fluid_mod_get_dest = (Module["_fluid_mod_get_dest"] = function () {
  return (_fluid_mod_get_dest = Module["_fluid_mod_get_dest"] =
    Module["asm"]["Wb"]).apply(null, arguments);
});
var _fluid_mod_get_amount = (Module["_fluid_mod_get_amount"] = function () {
  return (_fluid_mod_get_amount = Module["_fluid_mod_get_amount"] =
    Module["asm"]["Xb"]).apply(null, arguments);
});
var _fluid_voice_get_actual_velocity = (Module[
  "_fluid_voice_get_actual_velocity"
] = function () {
  return (_fluid_voice_get_actual_velocity = Module[
    "_fluid_voice_get_actual_velocity"
  ] =
    Module["asm"]["Yb"]).apply(null, arguments);
});
var _fluid_voice_get_actual_key = (Module["_fluid_voice_get_actual_key"] =
  function () {
    return (_fluid_voice_get_actual_key = Module[
      "_fluid_voice_get_actual_key"
    ] =
      Module["asm"]["Zb"]).apply(null, arguments);
  });
var _fluid_mod_sizeof = (Module["_fluid_mod_sizeof"] = function () {
  return (_fluid_mod_sizeof = Module["_fluid_mod_sizeof"] =
    Module["asm"]["_b"]).apply(null, arguments);
});
var _fluid_mod_has_source = (Module["_fluid_mod_has_source"] = function () {
  return (_fluid_mod_has_source = Module["_fluid_mod_has_source"] =
    Module["asm"]["$b"]).apply(null, arguments);
});
var _fluid_mod_has_dest = (Module["_fluid_mod_has_dest"] = function () {
  return (_fluid_mod_has_dest = Module["_fluid_mod_has_dest"] =
    Module["asm"]["ac"]).apply(null, arguments);
});
var _fluid_version = (Module["_fluid_version"] = function () {
  return (_fluid_version = Module["_fluid_version"] =
    Module["asm"]["bc"]).apply(null, arguments);
});
var _fluid_version_str = (Module["_fluid_version_str"] = function () {
  return (_fluid_version_str = Module["_fluid_version_str"] =
    Module["asm"]["cc"]).apply(null, arguments);
});
var _new_fluid_synth = (Module["_new_fluid_synth"] = function () {
  return (_new_fluid_synth = Module["_new_fluid_synth"] =
    Module["asm"]["dc"]).apply(null, arguments);
});
var _fluid_synth_add_default_mod = (Module["_fluid_synth_add_default_mod"] =
  function () {
    return (_fluid_synth_add_default_mod = Module[
      "_fluid_synth_add_default_mod"
    ] =
      Module["asm"]["ec"]).apply(null, arguments);
  });
var _fluid_synth_reverb_on = (Module["_fluid_synth_reverb_on"] = function () {
  return (_fluid_synth_reverb_on = Module["_fluid_synth_reverb_on"] =
    Module["asm"]["fc"]).apply(null, arguments);
});
var _fluid_synth_chorus_on = (Module["_fluid_synth_chorus_on"] = function () {
  return (_fluid_synth_chorus_on = Module["_fluid_synth_chorus_on"] =
    Module["asm"]["gc"]).apply(null, arguments);
});
var _delete_fluid_synth = (Module["_delete_fluid_synth"] = function () {
  return (_delete_fluid_synth = Module["_delete_fluid_synth"] =
    Module["asm"]["hc"]).apply(null, arguments);
});
var _fluid_synth_set_gain = (Module["_fluid_synth_set_gain"] = function () {
  return (_fluid_synth_set_gain = Module["_fluid_synth_set_gain"] =
    Module["asm"]["ic"]).apply(null, arguments);
});
var _fluid_synth_set_polyphony = (Module["_fluid_synth_set_polyphony"] =
  function () {
    return (_fluid_synth_set_polyphony = Module["_fluid_synth_set_polyphony"] =
      Module["asm"]["jc"]).apply(null, arguments);
  });
var _fluid_synth_add_sfloader = (Module["_fluid_synth_add_sfloader"] =
  function () {
    return (_fluid_synth_add_sfloader = Module["_fluid_synth_add_sfloader"] =
      Module["asm"]["kc"]).apply(null, arguments);
  });
var _fluid_voice_is_playing = (Module["_fluid_voice_is_playing"] = function () {
  return (_fluid_voice_is_playing = Module["_fluid_voice_is_playing"] =
    Module["asm"]["lc"]).apply(null, arguments);
});
var _fluid_synth_error = (Module["_fluid_synth_error"] = function () {
  return (_fluid_synth_error = Module["_fluid_synth_error"] =
    Module["asm"]["mc"]).apply(null, arguments);
});
var _fluid_synth_noteon = (Module["_fluid_synth_noteon"] = function () {
  return (_fluid_synth_noteon = Module["_fluid_synth_noteon"] =
    Module["asm"]["nc"]).apply(null, arguments);
});
var _fluid_synth_noteoff = (Module["_fluid_synth_noteoff"] = function () {
  return (_fluid_synth_noteoff = Module["_fluid_synth_noteoff"] =
    Module["asm"]["oc"]).apply(null, arguments);
});
var _fluid_synth_remove_default_mod = (Module[
  "_fluid_synth_remove_default_mod"
] = function () {
  return (_fluid_synth_remove_default_mod = Module[
    "_fluid_synth_remove_default_mod"
  ] =
    Module["asm"]["pc"]).apply(null, arguments);
});
var _fluid_synth_cc = (Module["_fluid_synth_cc"] = function () {
  return (_fluid_synth_cc = Module["_fluid_synth_cc"] =
    Module["asm"]["qc"]).apply(null, arguments);
});
var _fluid_voice_get_channel = (Module["_fluid_voice_get_channel"] =
  function () {
    return (_fluid_voice_get_channel = Module["_fluid_voice_get_channel"] =
      Module["asm"]["rc"]).apply(null, arguments);
  });
var _fluid_voice_is_sustained = (Module["_fluid_voice_is_sustained"] =
  function () {
    return (_fluid_voice_is_sustained = Module["_fluid_voice_is_sustained"] =
      Module["asm"]["sc"]).apply(null, arguments);
  });
var _fluid_voice_is_sostenuto = (Module["_fluid_voice_is_sostenuto"] =
  function () {
    return (_fluid_voice_is_sostenuto = Module["_fluid_voice_is_sostenuto"] =
      Module["asm"]["tc"]).apply(null, arguments);
  });
var _fluid_synth_activate_tuning = (Module["_fluid_synth_activate_tuning"] =
  function () {
    return (_fluid_synth_activate_tuning = Module[
      "_fluid_synth_activate_tuning"
    ] =
      Module["asm"]["uc"]).apply(null, arguments);
  });
var _fluid_synth_get_cc = (Module["_fluid_synth_get_cc"] = function () {
  return (_fluid_synth_get_cc = Module["_fluid_synth_get_cc"] =
    Module["asm"]["vc"]).apply(null, arguments);
});
var _fluid_synth_sysex = (Module["_fluid_synth_sysex"] = function () {
  return (_fluid_synth_sysex = Module["_fluid_synth_sysex"] =
    Module["asm"]["wc"]).apply(null, arguments);
});
var _fluid_synth_tuning_dump = (Module["_fluid_synth_tuning_dump"] =
  function () {
    return (_fluid_synth_tuning_dump = Module["_fluid_synth_tuning_dump"] =
      Module["asm"]["xc"]).apply(null, arguments);
  });
var _fluid_synth_tune_notes = (Module["_fluid_synth_tune_notes"] = function () {
  return (_fluid_synth_tune_notes = Module["_fluid_synth_tune_notes"] =
    Module["asm"]["yc"]).apply(null, arguments);
});
var _fluid_synth_activate_octave_tuning = (Module[
  "_fluid_synth_activate_octave_tuning"
] = function () {
  return (_fluid_synth_activate_octave_tuning = Module[
    "_fluid_synth_activate_octave_tuning"
  ] =
    Module["asm"]["zc"]).apply(null, arguments);
});
var _fluid_synth_set_basic_channel = (Module["_fluid_synth_set_basic_channel"] =
  function () {
    return (_fluid_synth_set_basic_channel = Module[
      "_fluid_synth_set_basic_channel"
    ] =
      Module["asm"]["Ac"]).apply(null, arguments);
  });
var _fluid_synth_program_change = (Module["_fluid_synth_program_change"] =
  function () {
    return (_fluid_synth_program_change = Module[
      "_fluid_synth_program_change"
    ] =
      Module["asm"]["Bc"]).apply(null, arguments);
  });
var _fluid_synth_all_notes_off = (Module["_fluid_synth_all_notes_off"] =
  function () {
    return (_fluid_synth_all_notes_off = Module["_fluid_synth_all_notes_off"] =
      Module["asm"]["Cc"]).apply(null, arguments);
  });
var _fluid_synth_all_sounds_off = (Module["_fluid_synth_all_sounds_off"] =
  function () {
    return (_fluid_synth_all_sounds_off = Module[
      "_fluid_synth_all_sounds_off"
    ] =
      Module["asm"]["Dc"]).apply(null, arguments);
  });
var _fluid_synth_system_reset = (Module["_fluid_synth_system_reset"] =
  function () {
    return (_fluid_synth_system_reset = Module["_fluid_synth_system_reset"] =
      Module["asm"]["Ec"]).apply(null, arguments);
  });
var _fluid_synth_channel_pressure = (Module["_fluid_synth_channel_pressure"] =
  function () {
    return (_fluid_synth_channel_pressure = Module[
      "_fluid_synth_channel_pressure"
    ] =
      Module["asm"]["Fc"]).apply(null, arguments);
  });
var _fluid_synth_key_pressure = (Module["_fluid_synth_key_pressure"] =
  function () {
    return (_fluid_synth_key_pressure = Module["_fluid_synth_key_pressure"] =
      Module["asm"]["Gc"]).apply(null, arguments);
  });
var _fluid_synth_pitch_bend = (Module["_fluid_synth_pitch_bend"] = function () {
  return (_fluid_synth_pitch_bend = Module["_fluid_synth_pitch_bend"] =
    Module["asm"]["Hc"]).apply(null, arguments);
});
var _fluid_synth_get_pitch_bend = (Module["_fluid_synth_get_pitch_bend"] =
  function () {
    return (_fluid_synth_get_pitch_bend = Module[
      "_fluid_synth_get_pitch_bend"
    ] =
      Module["asm"]["Ic"]).apply(null, arguments);
  });
var _fluid_synth_pitch_wheel_sens = (Module["_fluid_synth_pitch_wheel_sens"] =
  function () {
    return (_fluid_synth_pitch_wheel_sens = Module[
      "_fluid_synth_pitch_wheel_sens"
    ] =
      Module["asm"]["Jc"]).apply(null, arguments);
  });
var _fluid_synth_get_pitch_wheel_sens = (Module[
  "_fluid_synth_get_pitch_wheel_sens"
] = function () {
  return (_fluid_synth_get_pitch_wheel_sens = Module[
    "_fluid_synth_get_pitch_wheel_sens"
  ] =
    Module["asm"]["Kc"]).apply(null, arguments);
});
var _fluid_synth_bank_select = (Module["_fluid_synth_bank_select"] =
  function () {
    return (_fluid_synth_bank_select = Module["_fluid_synth_bank_select"] =
      Module["asm"]["Lc"]).apply(null, arguments);
  });
var _fluid_synth_sfont_select = (Module["_fluid_synth_sfont_select"] =
  function () {
    return (_fluid_synth_sfont_select = Module["_fluid_synth_sfont_select"] =
      Module["asm"]["Mc"]).apply(null, arguments);
  });
var _fluid_synth_unset_program = (Module["_fluid_synth_unset_program"] =
  function () {
    return (_fluid_synth_unset_program = Module["_fluid_synth_unset_program"] =
      Module["asm"]["Nc"]).apply(null, arguments);
  });
var _fluid_synth_get_program = (Module["_fluid_synth_get_program"] =
  function () {
    return (_fluid_synth_get_program = Module["_fluid_synth_get_program"] =
      Module["asm"]["Oc"]).apply(null, arguments);
  });
var _fluid_synth_program_select = (Module["_fluid_synth_program_select"] =
  function () {
    return (_fluid_synth_program_select = Module[
      "_fluid_synth_program_select"
    ] =
      Module["asm"]["Pc"]).apply(null, arguments);
  });
var _fluid_synth_pin_preset = (Module["_fluid_synth_pin_preset"] = function () {
  return (_fluid_synth_pin_preset = Module["_fluid_synth_pin_preset"] =
    Module["asm"]["Qc"]).apply(null, arguments);
});
var _fluid_synth_unpin_preset = (Module["_fluid_synth_unpin_preset"] =
  function () {
    return (_fluid_synth_unpin_preset = Module["_fluid_synth_unpin_preset"] =
      Module["asm"]["Rc"]).apply(null, arguments);
  });
var _fluid_synth_program_select_by_sfont_name = (Module[
  "_fluid_synth_program_select_by_sfont_name"
] = function () {
  return (_fluid_synth_program_select_by_sfont_name = Module[
    "_fluid_synth_program_select_by_sfont_name"
  ] =
    Module["asm"]["Sc"]).apply(null, arguments);
});
var _fluid_synth_set_sample_rate = (Module["_fluid_synth_set_sample_rate"] =
  function () {
    return (_fluid_synth_set_sample_rate = Module[
      "_fluid_synth_set_sample_rate"
    ] =
      Module["asm"]["Tc"]).apply(null, arguments);
  });
var _fluid_synth_get_gain = (Module["_fluid_synth_get_gain"] = function () {
  return (_fluid_synth_get_gain = Module["_fluid_synth_get_gain"] =
    Module["asm"]["Uc"]).apply(null, arguments);
});
var _fluid_synth_get_polyphony = (Module["_fluid_synth_get_polyphony"] =
  function () {
    return (_fluid_synth_get_polyphony = Module["_fluid_synth_get_polyphony"] =
      Module["asm"]["Vc"]).apply(null, arguments);
  });
var _fluid_synth_get_active_voice_count = (Module[
  "_fluid_synth_get_active_voice_count"
] = function () {
  return (_fluid_synth_get_active_voice_count = Module[
    "_fluid_synth_get_active_voice_count"
  ] =
    Module["asm"]["Wc"]).apply(null, arguments);
});
var _fluid_synth_get_internal_bufsize = (Module[
  "_fluid_synth_get_internal_bufsize"
] = function () {
  return (_fluid_synth_get_internal_bufsize = Module[
    "_fluid_synth_get_internal_bufsize"
  ] =
    Module["asm"]["Xc"]).apply(null, arguments);
});
var _fluid_synth_program_reset = (Module["_fluid_synth_program_reset"] =
  function () {
    return (_fluid_synth_program_reset = Module["_fluid_synth_program_reset"] =
      Module["asm"]["Yc"]).apply(null, arguments);
  });
var _fluid_synth_nwrite_float = (Module["_fluid_synth_nwrite_float"] =
  function () {
    return (_fluid_synth_nwrite_float = Module["_fluid_synth_nwrite_float"] =
      Module["asm"]["Zc"]).apply(null, arguments);
  });
var _fluid_synth_process = (Module["_fluid_synth_process"] = function () {
  return (_fluid_synth_process = Module["_fluid_synth_process"] =
    Module["asm"]["_c"]).apply(null, arguments);
});
var _fluid_synth_write_float = (Module["_fluid_synth_write_float"] =
  function () {
    return (_fluid_synth_write_float = Module["_fluid_synth_write_float"] =
      Module["asm"]["$c"]).apply(null, arguments);
  });
var _fluid_synth_write_s16 = (Module["_fluid_synth_write_s16"] = function () {
  return (_fluid_synth_write_s16 = Module["_fluid_synth_write_s16"] =
    Module["asm"]["ad"]).apply(null, arguments);
});
var _fluid_synth_alloc_voice = (Module["_fluid_synth_alloc_voice"] =
  function () {
    return (_fluid_synth_alloc_voice = Module["_fluid_synth_alloc_voice"] =
      Module["asm"]["bd"]).apply(null, arguments);
  });
var _fluid_voice_get_id = (Module["_fluid_voice_get_id"] = function () {
  return (_fluid_voice_get_id = Module["_fluid_voice_get_id"] =
    Module["asm"]["cd"]).apply(null, arguments);
});
var _fluid_voice_get_key = (Module["_fluid_voice_get_key"] = function () {
  return (_fluid_voice_get_key = Module["_fluid_voice_get_key"] =
    Module["asm"]["dd"]).apply(null, arguments);
});
var _fluid_synth_sfload = (Module["_fluid_synth_sfload"] = function () {
  return (_fluid_synth_sfload = Module["_fluid_synth_sfload"] =
    Module["asm"]["ed"]).apply(null, arguments);
});
var _fluid_synth_sfunload = (Module["_fluid_synth_sfunload"] = function () {
  return (_fluid_synth_sfunload = Module["_fluid_synth_sfunload"] =
    Module["asm"]["fd"]).apply(null, arguments);
});
var _fluid_synth_sfreload = (Module["_fluid_synth_sfreload"] = function () {
  return (_fluid_synth_sfreload = Module["_fluid_synth_sfreload"] =
    Module["asm"]["gd"]).apply(null, arguments);
});
var _fluid_synth_add_sfont = (Module["_fluid_synth_add_sfont"] = function () {
  return (_fluid_synth_add_sfont = Module["_fluid_synth_add_sfont"] =
    Module["asm"]["hd"]).apply(null, arguments);
});
var _fluid_synth_remove_sfont = (Module["_fluid_synth_remove_sfont"] =
  function () {
    return (_fluid_synth_remove_sfont = Module["_fluid_synth_remove_sfont"] =
      Module["asm"]["id"]).apply(null, arguments);
  });
var _fluid_synth_sfcount = (Module["_fluid_synth_sfcount"] = function () {
  return (_fluid_synth_sfcount = Module["_fluid_synth_sfcount"] =
    Module["asm"]["jd"]).apply(null, arguments);
});
var _fluid_synth_get_sfont = (Module["_fluid_synth_get_sfont"] = function () {
  return (_fluid_synth_get_sfont = Module["_fluid_synth_get_sfont"] =
    Module["asm"]["kd"]).apply(null, arguments);
});
var _fluid_synth_get_sfont_by_id = (Module["_fluid_synth_get_sfont_by_id"] =
  function () {
    return (_fluid_synth_get_sfont_by_id = Module[
      "_fluid_synth_get_sfont_by_id"
    ] =
      Module["asm"]["ld"]).apply(null, arguments);
  });
var _fluid_synth_get_sfont_by_name = (Module["_fluid_synth_get_sfont_by_name"] =
  function () {
    return (_fluid_synth_get_sfont_by_name = Module[
      "_fluid_synth_get_sfont_by_name"
    ] =
      Module["asm"]["md"]).apply(null, arguments);
  });
var _fluid_synth_get_channel_preset = (Module[
  "_fluid_synth_get_channel_preset"
] = function () {
  return (_fluid_synth_get_channel_preset = Module[
    "_fluid_synth_get_channel_preset"
  ] =
    Module["asm"]["nd"]).apply(null, arguments);
});
var _fluid_synth_get_voicelist = (Module["_fluid_synth_get_voicelist"] =
  function () {
    return (_fluid_synth_get_voicelist = Module["_fluid_synth_get_voicelist"] =
      Module["asm"]["od"]).apply(null, arguments);
  });
var _fluid_synth_set_reverb_on = (Module["_fluid_synth_set_reverb_on"] =
  function () {
    return (_fluid_synth_set_reverb_on = Module["_fluid_synth_set_reverb_on"] =
      Module["asm"]["pd"]).apply(null, arguments);
  });
var _fluid_synth_set_reverb = (Module["_fluid_synth_set_reverb"] = function () {
  return (_fluid_synth_set_reverb = Module["_fluid_synth_set_reverb"] =
    Module["asm"]["qd"]).apply(null, arguments);
});
var _fluid_synth_set_reverb_roomsize = (Module[
  "_fluid_synth_set_reverb_roomsize"
] = function () {
  return (_fluid_synth_set_reverb_roomsize = Module[
    "_fluid_synth_set_reverb_roomsize"
  ] =
    Module["asm"]["rd"]).apply(null, arguments);
});
var _fluid_synth_set_reverb_damp = (Module["_fluid_synth_set_reverb_damp"] =
  function () {
    return (_fluid_synth_set_reverb_damp = Module[
      "_fluid_synth_set_reverb_damp"
    ] =
      Module["asm"]["sd"]).apply(null, arguments);
  });
var _fluid_synth_set_reverb_width = (Module["_fluid_synth_set_reverb_width"] =
  function () {
    return (_fluid_synth_set_reverb_width = Module[
      "_fluid_synth_set_reverb_width"
    ] =
      Module["asm"]["td"]).apply(null, arguments);
  });
var _fluid_synth_set_reverb_level = (Module["_fluid_synth_set_reverb_level"] =
  function () {
    return (_fluid_synth_set_reverb_level = Module[
      "_fluid_synth_set_reverb_level"
    ] =
      Module["asm"]["ud"]).apply(null, arguments);
  });
var _fluid_synth_set_reverb_group_roomsize = (Module[
  "_fluid_synth_set_reverb_group_roomsize"
] = function () {
  return (_fluid_synth_set_reverb_group_roomsize = Module[
    "_fluid_synth_set_reverb_group_roomsize"
  ] =
    Module["asm"]["vd"]).apply(null, arguments);
});
var _fluid_synth_set_reverb_group_damp = (Module[
  "_fluid_synth_set_reverb_group_damp"
] = function () {
  return (_fluid_synth_set_reverb_group_damp = Module[
    "_fluid_synth_set_reverb_group_damp"
  ] =
    Module["asm"]["wd"]).apply(null, arguments);
});
var _fluid_synth_set_reverb_group_width = (Module[
  "_fluid_synth_set_reverb_group_width"
] = function () {
  return (_fluid_synth_set_reverb_group_width = Module[
    "_fluid_synth_set_reverb_group_width"
  ] =
    Module["asm"]["xd"]).apply(null, arguments);
});
var _fluid_synth_set_reverb_group_level = (Module[
  "_fluid_synth_set_reverb_group_level"
] = function () {
  return (_fluid_synth_set_reverb_group_level = Module[
    "_fluid_synth_set_reverb_group_level"
  ] =
    Module["asm"]["yd"]).apply(null, arguments);
});
var _fluid_synth_get_reverb_roomsize = (Module[
  "_fluid_synth_get_reverb_roomsize"
] = function () {
  return (_fluid_synth_get_reverb_roomsize = Module[
    "_fluid_synth_get_reverb_roomsize"
  ] =
    Module["asm"]["zd"]).apply(null, arguments);
});
var _fluid_synth_get_reverb_damp = (Module["_fluid_synth_get_reverb_damp"] =
  function () {
    return (_fluid_synth_get_reverb_damp = Module[
      "_fluid_synth_get_reverb_damp"
    ] =
      Module["asm"]["Ad"]).apply(null, arguments);
  });
var _fluid_synth_get_reverb_level = (Module["_fluid_synth_get_reverb_level"] =
  function () {
    return (_fluid_synth_get_reverb_level = Module[
      "_fluid_synth_get_reverb_level"
    ] =
      Module["asm"]["Bd"]).apply(null, arguments);
  });
var _fluid_synth_get_reverb_width = (Module["_fluid_synth_get_reverb_width"] =
  function () {
    return (_fluid_synth_get_reverb_width = Module[
      "_fluid_synth_get_reverb_width"
    ] =
      Module["asm"]["Cd"]).apply(null, arguments);
  });
var _fluid_synth_get_reverb_group_roomsize = (Module[
  "_fluid_synth_get_reverb_group_roomsize"
] = function () {
  return (_fluid_synth_get_reverb_group_roomsize = Module[
    "_fluid_synth_get_reverb_group_roomsize"
  ] =
    Module["asm"]["Dd"]).apply(null, arguments);
});
var _fluid_synth_get_reverb_group_damp = (Module[
  "_fluid_synth_get_reverb_group_damp"
] = function () {
  return (_fluid_synth_get_reverb_group_damp = Module[
    "_fluid_synth_get_reverb_group_damp"
  ] =
    Module["asm"]["Ed"]).apply(null, arguments);
});
var _fluid_synth_get_reverb_group_width = (Module[
  "_fluid_synth_get_reverb_group_width"
] = function () {
  return (_fluid_synth_get_reverb_group_width = Module[
    "_fluid_synth_get_reverb_group_width"
  ] =
    Module["asm"]["Fd"]).apply(null, arguments);
});
var _fluid_synth_get_reverb_group_level = (Module[
  "_fluid_synth_get_reverb_group_level"
] = function () {
  return (_fluid_synth_get_reverb_group_level = Module[
    "_fluid_synth_get_reverb_group_level"
  ] =
    Module["asm"]["Gd"]).apply(null, arguments);
});
var _fluid_synth_set_chorus_on = (Module["_fluid_synth_set_chorus_on"] =
  function () {
    return (_fluid_synth_set_chorus_on = Module["_fluid_synth_set_chorus_on"] =
      Module["asm"]["Hd"]).apply(null, arguments);
  });
var _fluid_synth_set_chorus = (Module["_fluid_synth_set_chorus"] = function () {
  return (_fluid_synth_set_chorus = Module["_fluid_synth_set_chorus"] =
    Module["asm"]["Id"]).apply(null, arguments);
});
var _fluid_synth_set_chorus_nr = (Module["_fluid_synth_set_chorus_nr"] =
  function () {
    return (_fluid_synth_set_chorus_nr = Module["_fluid_synth_set_chorus_nr"] =
      Module["asm"]["Jd"]).apply(null, arguments);
  });
var _fluid_synth_set_chorus_level = (Module["_fluid_synth_set_chorus_level"] =
  function () {
    return (_fluid_synth_set_chorus_level = Module[
      "_fluid_synth_set_chorus_level"
    ] =
      Module["asm"]["Kd"]).apply(null, arguments);
  });
var _fluid_synth_set_chorus_speed = (Module["_fluid_synth_set_chorus_speed"] =
  function () {
    return (_fluid_synth_set_chorus_speed = Module[
      "_fluid_synth_set_chorus_speed"
    ] =
      Module["asm"]["Ld"]).apply(null, arguments);
  });
var _fluid_synth_set_chorus_depth = (Module["_fluid_synth_set_chorus_depth"] =
  function () {
    return (_fluid_synth_set_chorus_depth = Module[
      "_fluid_synth_set_chorus_depth"
    ] =
      Module["asm"]["Md"]).apply(null, arguments);
  });
var _fluid_synth_set_chorus_type = (Module["_fluid_synth_set_chorus_type"] =
  function () {
    return (_fluid_synth_set_chorus_type = Module[
      "_fluid_synth_set_chorus_type"
    ] =
      Module["asm"]["Nd"]).apply(null, arguments);
  });
var _fluid_synth_set_chorus_group_nr = (Module[
  "_fluid_synth_set_chorus_group_nr"
] = function () {
  return (_fluid_synth_set_chorus_group_nr = Module[
    "_fluid_synth_set_chorus_group_nr"
  ] =
    Module["asm"]["Od"]).apply(null, arguments);
});
var _fluid_synth_set_chorus_group_level = (Module[
  "_fluid_synth_set_chorus_group_level"
] = function () {
  return (_fluid_synth_set_chorus_group_level = Module[
    "_fluid_synth_set_chorus_group_level"
  ] =
    Module["asm"]["Pd"]).apply(null, arguments);
});
var _fluid_synth_set_chorus_group_speed = (Module[
  "_fluid_synth_set_chorus_group_speed"
] = function () {
  return (_fluid_synth_set_chorus_group_speed = Module[
    "_fluid_synth_set_chorus_group_speed"
  ] =
    Module["asm"]["Qd"]).apply(null, arguments);
});
var _fluid_synth_set_chorus_group_depth = (Module[
  "_fluid_synth_set_chorus_group_depth"
] = function () {
  return (_fluid_synth_set_chorus_group_depth = Module[
    "_fluid_synth_set_chorus_group_depth"
  ] =
    Module["asm"]["Rd"]).apply(null, arguments);
});
var _fluid_synth_set_chorus_group_type = (Module[
  "_fluid_synth_set_chorus_group_type"
] = function () {
  return (_fluid_synth_set_chorus_group_type = Module[
    "_fluid_synth_set_chorus_group_type"
  ] =
    Module["asm"]["Sd"]).apply(null, arguments);
});
var _fluid_synth_get_chorus_nr = (Module["_fluid_synth_get_chorus_nr"] =
  function () {
    return (_fluid_synth_get_chorus_nr = Module["_fluid_synth_get_chorus_nr"] =
      Module["asm"]["Td"]).apply(null, arguments);
  });
var _fluid_synth_get_chorus_level = (Module["_fluid_synth_get_chorus_level"] =
  function () {
    return (_fluid_synth_get_chorus_level = Module[
      "_fluid_synth_get_chorus_level"
    ] =
      Module["asm"]["Ud"]).apply(null, arguments);
  });
var _fluid_synth_get_chorus_speed = (Module["_fluid_synth_get_chorus_speed"] =
  function () {
    return (_fluid_synth_get_chorus_speed = Module[
      "_fluid_synth_get_chorus_speed"
    ] =
      Module["asm"]["Vd"]).apply(null, arguments);
  });
var _fluid_synth_get_chorus_depth = (Module["_fluid_synth_get_chorus_depth"] =
  function () {
    return (_fluid_synth_get_chorus_depth = Module[
      "_fluid_synth_get_chorus_depth"
    ] =
      Module["asm"]["Wd"]).apply(null, arguments);
  });
var _fluid_synth_get_chorus_type = (Module["_fluid_synth_get_chorus_type"] =
  function () {
    return (_fluid_synth_get_chorus_type = Module[
      "_fluid_synth_get_chorus_type"
    ] =
      Module["asm"]["Xd"]).apply(null, arguments);
  });
var _fluid_synth_get_chorus_group_nr = (Module[
  "_fluid_synth_get_chorus_group_nr"
] = function () {
  return (_fluid_synth_get_chorus_group_nr = Module[
    "_fluid_synth_get_chorus_group_nr"
  ] =
    Module["asm"]["Yd"]).apply(null, arguments);
});
var _fluid_synth_get_chorus_group_level = (Module[
  "_fluid_synth_get_chorus_group_level"
] = function () {
  return (_fluid_synth_get_chorus_group_level = Module[
    "_fluid_synth_get_chorus_group_level"
  ] =
    Module["asm"]["Zd"]).apply(null, arguments);
});
var _fluid_synth_get_chorus_group_speed = (Module[
  "_fluid_synth_get_chorus_group_speed"
] = function () {
  return (_fluid_synth_get_chorus_group_speed = Module[
    "_fluid_synth_get_chorus_group_speed"
  ] =
    Module["asm"]["_d"]).apply(null, arguments);
});
var _fluid_synth_get_chorus_group_depth = (Module[
  "_fluid_synth_get_chorus_group_depth"
] = function () {
  return (_fluid_synth_get_chorus_group_depth = Module[
    "_fluid_synth_get_chorus_group_depth"
  ] =
    Module["asm"]["$d"]).apply(null, arguments);
});
var _fluid_synth_get_chorus_group_type = (Module[
  "_fluid_synth_get_chorus_group_type"
] = function () {
  return (_fluid_synth_get_chorus_group_type = Module[
    "_fluid_synth_get_chorus_group_type"
  ] =
    Module["asm"]["ae"]).apply(null, arguments);
});
var _fluid_synth_set_interp_method = (Module["_fluid_synth_set_interp_method"] =
  function () {
    return (_fluid_synth_set_interp_method = Module[
      "_fluid_synth_set_interp_method"
    ] =
      Module["asm"]["be"]).apply(null, arguments);
  });
var _fluid_synth_count_midi_channels = (Module[
  "_fluid_synth_count_midi_channels"
] = function () {
  return (_fluid_synth_count_midi_channels = Module[
    "_fluid_synth_count_midi_channels"
  ] =
    Module["asm"]["ce"]).apply(null, arguments);
});
var _fluid_synth_count_audio_channels = (Module[
  "_fluid_synth_count_audio_channels"
] = function () {
  return (_fluid_synth_count_audio_channels = Module[
    "_fluid_synth_count_audio_channels"
  ] =
    Module["asm"]["de"]).apply(null, arguments);
});
var _fluid_synth_count_audio_groups = (Module[
  "_fluid_synth_count_audio_groups"
] = function () {
  return (_fluid_synth_count_audio_groups = Module[
    "_fluid_synth_count_audio_groups"
  ] =
    Module["asm"]["ee"]).apply(null, arguments);
});
var _fluid_synth_count_effects_channels = (Module[
  "_fluid_synth_count_effects_channels"
] = function () {
  return (_fluid_synth_count_effects_channels = Module[
    "_fluid_synth_count_effects_channels"
  ] =
    Module["asm"]["fe"]).apply(null, arguments);
});
var _fluid_synth_count_effects_groups = (Module[
  "_fluid_synth_count_effects_groups"
] = function () {
  return (_fluid_synth_count_effects_groups = Module[
    "_fluid_synth_count_effects_groups"
  ] =
    Module["asm"]["ge"]).apply(null, arguments);
});
var _fluid_synth_get_cpu_load = (Module["_fluid_synth_get_cpu_load"] =
  function () {
    return (_fluid_synth_get_cpu_load = Module["_fluid_synth_get_cpu_load"] =
      Module["asm"]["he"]).apply(null, arguments);
  });
var _fluid_synth_activate_key_tuning = (Module[
  "_fluid_synth_activate_key_tuning"
] = function () {
  return (_fluid_synth_activate_key_tuning = Module[
    "_fluid_synth_activate_key_tuning"
  ] =
    Module["asm"]["ie"]).apply(null, arguments);
});
var _fluid_voice_is_on = (Module["_fluid_voice_is_on"] = function () {
  return (_fluid_voice_is_on = Module["_fluid_voice_is_on"] =
    Module["asm"]["je"]).apply(null, arguments);
});
var _fluid_voice_update_param = (Module["_fluid_voice_update_param"] =
  function () {
    return (_fluid_voice_update_param = Module["_fluid_voice_update_param"] =
      Module["asm"]["ke"]).apply(null, arguments);
  });
var _fluid_synth_deactivate_tuning = (Module["_fluid_synth_deactivate_tuning"] =
  function () {
    return (_fluid_synth_deactivate_tuning = Module[
      "_fluid_synth_deactivate_tuning"
    ] =
      Module["asm"]["le"]).apply(null, arguments);
  });
var _fluid_synth_tuning_iteration_start = (Module[
  "_fluid_synth_tuning_iteration_start"
] = function () {
  return (_fluid_synth_tuning_iteration_start = Module[
    "_fluid_synth_tuning_iteration_start"
  ] =
    Module["asm"]["me"]).apply(null, arguments);
});
var _fluid_synth_tuning_iteration_next = (Module[
  "_fluid_synth_tuning_iteration_next"
] = function () {
  return (_fluid_synth_tuning_iteration_next = Module[
    "_fluid_synth_tuning_iteration_next"
  ] =
    Module["asm"]["ne"]).apply(null, arguments);
});
var _fluid_synth_get_settings = (Module["_fluid_synth_get_settings"] =
  function () {
    return (_fluid_synth_get_settings = Module["_fluid_synth_get_settings"] =
      Module["asm"]["oe"]).apply(null, arguments);
  });
var _fluid_synth_set_gen = (Module["_fluid_synth_set_gen"] = function () {
  return (_fluid_synth_set_gen = Module["_fluid_synth_set_gen"] =
    Module["asm"]["pe"]).apply(null, arguments);
});
var _fluid_synth_get_gen = (Module["_fluid_synth_get_gen"] = function () {
  return (_fluid_synth_get_gen = Module["_fluid_synth_get_gen"] =
    Module["asm"]["qe"]).apply(null, arguments);
});
var _fluid_synth_handle_midi_event = (Module["_fluid_synth_handle_midi_event"] =
  function () {
    return (_fluid_synth_handle_midi_event = Module[
      "_fluid_synth_handle_midi_event"
    ] =
      Module["asm"]["re"]).apply(null, arguments);
  });
var _fluid_synth_start = (Module["_fluid_synth_start"] = function () {
  return (_fluid_synth_start = Module["_fluid_synth_start"] =
    Module["asm"]["se"]).apply(null, arguments);
});
var _fluid_synth_stop = (Module["_fluid_synth_stop"] = function () {
  return (_fluid_synth_stop = Module["_fluid_synth_stop"] =
    Module["asm"]["te"]).apply(null, arguments);
});
var _fluid_synth_set_bank_offset = (Module["_fluid_synth_set_bank_offset"] =
  function () {
    return (_fluid_synth_set_bank_offset = Module[
      "_fluid_synth_set_bank_offset"
    ] =
      Module["asm"]["ue"]).apply(null, arguments);
  });
var _fluid_synth_get_bank_offset = (Module["_fluid_synth_get_bank_offset"] =
  function () {
    return (_fluid_synth_get_bank_offset = Module[
      "_fluid_synth_get_bank_offset"
    ] =
      Module["asm"]["ve"]).apply(null, arguments);
  });
var _fluid_synth_set_channel_type = (Module["_fluid_synth_set_channel_type"] =
  function () {
    return (_fluid_synth_set_channel_type = Module[
      "_fluid_synth_set_channel_type"
    ] =
      Module["asm"]["we"]).apply(null, arguments);
  });
var _fluid_synth_get_ladspa_fx = (Module["_fluid_synth_get_ladspa_fx"] =
  function () {
    return (_fluid_synth_get_ladspa_fx = Module["_fluid_synth_get_ladspa_fx"] =
      Module["asm"]["xe"]).apply(null, arguments);
  });
var _fluid_synth_set_custom_filter = (Module["_fluid_synth_set_custom_filter"] =
  function () {
    return (_fluid_synth_set_custom_filter = Module[
      "_fluid_synth_set_custom_filter"
    ] =
      Module["asm"]["ye"]).apply(null, arguments);
  });
var _fluid_synth_set_legato_mode = (Module["_fluid_synth_set_legato_mode"] =
  function () {
    return (_fluid_synth_set_legato_mode = Module[
      "_fluid_synth_set_legato_mode"
    ] =
      Module["asm"]["ze"]).apply(null, arguments);
  });
var _fluid_synth_get_legato_mode = (Module["_fluid_synth_get_legato_mode"] =
  function () {
    return (_fluid_synth_get_legato_mode = Module[
      "_fluid_synth_get_legato_mode"
    ] =
      Module["asm"]["Ae"]).apply(null, arguments);
  });
var _fluid_synth_set_portamento_mode = (Module[
  "_fluid_synth_set_portamento_mode"
] = function () {
  return (_fluid_synth_set_portamento_mode = Module[
    "_fluid_synth_set_portamento_mode"
  ] =
    Module["asm"]["Be"]).apply(null, arguments);
});
var _fluid_synth_get_portamento_mode = (Module[
  "_fluid_synth_get_portamento_mode"
] = function () {
  return (_fluid_synth_get_portamento_mode = Module[
    "_fluid_synth_get_portamento_mode"
  ] =
    Module["asm"]["Ce"]).apply(null, arguments);
});
var _fluid_synth_set_breath_mode = (Module["_fluid_synth_set_breath_mode"] =
  function () {
    return (_fluid_synth_set_breath_mode = Module[
      "_fluid_synth_set_breath_mode"
    ] =
      Module["asm"]["De"]).apply(null, arguments);
  });
var _fluid_synth_get_breath_mode = (Module["_fluid_synth_get_breath_mode"] =
  function () {
    return (_fluid_synth_get_breath_mode = Module[
      "_fluid_synth_get_breath_mode"
    ] =
      Module["asm"]["Ee"]).apply(null, arguments);
  });
var _fluid_synth_reset_basic_channel = (Module[
  "_fluid_synth_reset_basic_channel"
] = function () {
  return (_fluid_synth_reset_basic_channel = Module[
    "_fluid_synth_reset_basic_channel"
  ] =
    Module["asm"]["Fe"]).apply(null, arguments);
});
var _fluid_synth_get_basic_channel = (Module["_fluid_synth_get_basic_channel"] =
  function () {
    return (_fluid_synth_get_basic_channel = Module[
      "_fluid_synth_get_basic_channel"
    ] =
      Module["asm"]["Ge"]).apply(null, arguments);
  });
var _fluid_voice_gen_get = (Module["_fluid_voice_gen_get"] = function () {
  return (_fluid_voice_gen_get = Module["_fluid_voice_gen_get"] =
    Module["asm"]["He"]).apply(null, arguments);
});
var _fluid_voice_add_mod = (Module["_fluid_voice_add_mod"] = function () {
  return (_fluid_voice_add_mod = Module["_fluid_voice_add_mod"] =
    Module["asm"]["Ie"]).apply(null, arguments);
});
var _fluid_voice_get_velocity = (Module["_fluid_voice_get_velocity"] =
  function () {
    return (_fluid_voice_get_velocity = Module["_fluid_voice_get_velocity"] =
      Module["asm"]["Je"]).apply(null, arguments);
  });
var _fluid_is_midifile = (Module["_fluid_is_midifile"] = function () {
  return (_fluid_is_midifile = Module["_fluid_is_midifile"] =
    Module["asm"]["Ke"]).apply(null, arguments);
});
var _new_fluid_midi_event = (Module["_new_fluid_midi_event"] = function () {
  return (_new_fluid_midi_event = Module["_new_fluid_midi_event"] =
    Module["asm"]["Le"]).apply(null, arguments);
});
var _delete_fluid_midi_event = (Module["_delete_fluid_midi_event"] =
  function () {
    return (_delete_fluid_midi_event = Module["_delete_fluid_midi_event"] =
      Module["asm"]["Me"]).apply(null, arguments);
  });
var _fluid_midi_event_set_type = (Module["_fluid_midi_event_set_type"] =
  function () {
    return (_fluid_midi_event_set_type = Module["_fluid_midi_event_set_type"] =
      Module["asm"]["Ne"]).apply(null, arguments);
  });
var _fluid_midi_event_set_channel = (Module["_fluid_midi_event_set_channel"] =
  function () {
    return (_fluid_midi_event_set_channel = Module[
      "_fluid_midi_event_set_channel"
    ] =
      Module["asm"]["Oe"]).apply(null, arguments);
  });
var _fluid_midi_event_set_key = (Module["_fluid_midi_event_set_key"] =
  function () {
    return (_fluid_midi_event_set_key = Module["_fluid_midi_event_set_key"] =
      Module["asm"]["Pe"]).apply(null, arguments);
  });
var _fluid_midi_event_set_velocity = (Module["_fluid_midi_event_set_velocity"] =
  function () {
    return (_fluid_midi_event_set_velocity = Module[
      "_fluid_midi_event_set_velocity"
    ] =
      Module["asm"]["Qe"]).apply(null, arguments);
  });
var _fluid_midi_event_set_control = (Module["_fluid_midi_event_set_control"] =
  function () {
    return (_fluid_midi_event_set_control = Module[
      "_fluid_midi_event_set_control"
    ] =
      Module["asm"]["Re"]).apply(null, arguments);
  });
var _fluid_midi_event_set_value = (Module["_fluid_midi_event_set_value"] =
  function () {
    return (_fluid_midi_event_set_value = Module[
      "_fluid_midi_event_set_value"
    ] =
      Module["asm"]["Se"]).apply(null, arguments);
  });
var _fluid_midi_event_set_program = (Module["_fluid_midi_event_set_program"] =
  function () {
    return (_fluid_midi_event_set_program = Module[
      "_fluid_midi_event_set_program"
    ] =
      Module["asm"]["Te"]).apply(null, arguments);
  });
var _fluid_midi_event_set_pitch = (Module["_fluid_midi_event_set_pitch"] =
  function () {
    return (_fluid_midi_event_set_pitch = Module[
      "_fluid_midi_event_set_pitch"
    ] =
      Module["asm"]["Ue"]).apply(null, arguments);
  });
var _fluid_midi_event_set_sysex = (Module["_fluid_midi_event_set_sysex"] =
  function () {
    return (_fluid_midi_event_set_sysex = Module[
      "_fluid_midi_event_set_sysex"
    ] =
      Module["asm"]["Ve"]).apply(null, arguments);
  });
var _fluid_midi_event_set_text = (Module["_fluid_midi_event_set_text"] =
  function () {
    return (_fluid_midi_event_set_text = Module["_fluid_midi_event_set_text"] =
      Module["asm"]["We"]).apply(null, arguments);
  });
var _fluid_midi_event_get_text = (Module["_fluid_midi_event_get_text"] =
  function () {
    return (_fluid_midi_event_get_text = Module["_fluid_midi_event_get_text"] =
      Module["asm"]["Xe"]).apply(null, arguments);
  });
var _fluid_midi_event_set_lyrics = (Module["_fluid_midi_event_set_lyrics"] =
  function () {
    return (_fluid_midi_event_set_lyrics = Module[
      "_fluid_midi_event_set_lyrics"
    ] =
      Module["asm"]["Ye"]).apply(null, arguments);
  });
var _fluid_midi_event_get_lyrics = (Module["_fluid_midi_event_get_lyrics"] =
  function () {
    return (_fluid_midi_event_get_lyrics = Module[
      "_fluid_midi_event_get_lyrics"
    ] =
      Module["asm"]["Ze"]).apply(null, arguments);
  });
var _new_fluid_player = (Module["_new_fluid_player"] = function () {
  return (_new_fluid_player = Module["_new_fluid_player"] =
    Module["asm"]["_e"]).apply(null, arguments);
});
var _delete_fluid_player = (Module["_delete_fluid_player"] = function () {
  return (_delete_fluid_player = Module["_delete_fluid_player"] =
    Module["asm"]["$e"]).apply(null, arguments);
});
var _fluid_player_set_playback_callback = (Module[
  "_fluid_player_set_playback_callback"
] = function () {
  return (_fluid_player_set_playback_callback = Module[
    "_fluid_player_set_playback_callback"
  ] =
    Module["asm"]["af"]).apply(null, arguments);
});
var _fluid_player_set_tick_callback = (Module[
  "_fluid_player_set_tick_callback"
] = function () {
  return (_fluid_player_set_tick_callback = Module[
    "_fluid_player_set_tick_callback"
  ] =
    Module["asm"]["bf"]).apply(null, arguments);
});
var _fluid_player_stop = (Module["_fluid_player_stop"] = function () {
  return (_fluid_player_stop = Module["_fluid_player_stop"] =
    Module["asm"]["cf"]).apply(null, arguments);
});
var _fluid_player_add = (Module["_fluid_player_add"] = function () {
  return (_fluid_player_add = Module["_fluid_player_add"] =
    Module["asm"]["df"]).apply(null, arguments);
});
var _fluid_player_add_mem = (Module["_fluid_player_add_mem"] = function () {
  return (_fluid_player_add_mem = Module["_fluid_player_add_mem"] =
    Module["asm"]["ef"]).apply(null, arguments);
});
var _fluid_player_play = (Module["_fluid_player_play"] = function () {
  return (_fluid_player_play = Module["_fluid_player_play"] =
    Module["asm"]["ff"]).apply(null, arguments);
});
var _fluid_player_get_status = (Module["_fluid_player_get_status"] =
  function () {
    return (_fluid_player_get_status = Module["_fluid_player_get_status"] =
      Module["asm"]["gf"]).apply(null, arguments);
  });
var _fluid_player_seek = (Module["_fluid_player_seek"] = function () {
  return (_fluid_player_seek = Module["_fluid_player_seek"] =
    Module["asm"]["hf"]).apply(null, arguments);
});
var _fluid_player_get_current_tick = (Module["_fluid_player_get_current_tick"] =
  function () {
    return (_fluid_player_get_current_tick = Module[
      "_fluid_player_get_current_tick"
    ] =
      Module["asm"]["jf"]).apply(null, arguments);
  });
var _fluid_player_get_total_ticks = (Module["_fluid_player_get_total_ticks"] =
  function () {
    return (_fluid_player_get_total_ticks = Module[
      "_fluid_player_get_total_ticks"
    ] =
      Module["asm"]["kf"]).apply(null, arguments);
  });
var _fluid_player_set_loop = (Module["_fluid_player_set_loop"] = function () {
  return (_fluid_player_set_loop = Module["_fluid_player_set_loop"] =
    Module["asm"]["lf"]).apply(null, arguments);
});
var _fluid_player_set_tempo = (Module["_fluid_player_set_tempo"] = function () {
  return (_fluid_player_set_tempo = Module["_fluid_player_set_tempo"] =
    Module["asm"]["mf"]).apply(null, arguments);
});
var _fluid_player_set_midi_tempo = (Module["_fluid_player_set_midi_tempo"] =
  function () {
    return (_fluid_player_set_midi_tempo = Module[
      "_fluid_player_set_midi_tempo"
    ] =
      Module["asm"]["nf"]).apply(null, arguments);
  });
var _fluid_player_set_bpm = (Module["_fluid_player_set_bpm"] = function () {
  return (_fluid_player_set_bpm = Module["_fluid_player_set_bpm"] =
    Module["asm"]["of"]).apply(null, arguments);
});
var _fluid_player_join = (Module["_fluid_player_join"] = function () {
  return (_fluid_player_join = Module["_fluid_player_join"] =
    Module["asm"]["pf"]).apply(null, arguments);
});
var _fluid_player_get_bpm = (Module["_fluid_player_get_bpm"] = function () {
  return (_fluid_player_get_bpm = Module["_fluid_player_get_bpm"] =
    Module["asm"]["qf"]).apply(null, arguments);
});
var _fluid_player_get_midi_tempo = (Module["_fluid_player_get_midi_tempo"] =
  function () {
    return (_fluid_player_get_midi_tempo = Module[
      "_fluid_player_get_midi_tempo"
    ] =
      Module["asm"]["rf"]).apply(null, arguments);
  });
var _new_fluid_midi_router = (Module["_new_fluid_midi_router"] = function () {
  return (_new_fluid_midi_router = Module["_new_fluid_midi_router"] =
    Module["asm"]["sf"]).apply(null, arguments);
});
var _delete_fluid_midi_router = (Module["_delete_fluid_midi_router"] =
  function () {
    return (_delete_fluid_midi_router = Module["_delete_fluid_midi_router"] =
      Module["asm"]["tf"]).apply(null, arguments);
  });
var _new_fluid_midi_router_rule = (Module["_new_fluid_midi_router_rule"] =
  function () {
    return (_new_fluid_midi_router_rule = Module[
      "_new_fluid_midi_router_rule"
    ] =
      Module["asm"]["uf"]).apply(null, arguments);
  });
var _fluid_midi_router_set_default_rules = (Module[
  "_fluid_midi_router_set_default_rules"
] = function () {
  return (_fluid_midi_router_set_default_rules = Module[
    "_fluid_midi_router_set_default_rules"
  ] =
    Module["asm"]["vf"]).apply(null, arguments);
});
var _delete_fluid_midi_router_rule = (Module["_delete_fluid_midi_router_rule"] =
  function () {
    return (_delete_fluid_midi_router_rule = Module[
      "_delete_fluid_midi_router_rule"
    ] =
      Module["asm"]["wf"]).apply(null, arguments);
  });
var _fluid_midi_router_clear_rules = (Module["_fluid_midi_router_clear_rules"] =
  function () {
    return (_fluid_midi_router_clear_rules = Module[
      "_fluid_midi_router_clear_rules"
    ] =
      Module["asm"]["xf"]).apply(null, arguments);
  });
var _fluid_midi_router_add_rule = (Module["_fluid_midi_router_add_rule"] =
  function () {
    return (_fluid_midi_router_add_rule = Module[
      "_fluid_midi_router_add_rule"
    ] =
      Module["asm"]["yf"]).apply(null, arguments);
  });
var _fluid_midi_router_rule_set_chan = (Module[
  "_fluid_midi_router_rule_set_chan"
] = function () {
  return (_fluid_midi_router_rule_set_chan = Module[
    "_fluid_midi_router_rule_set_chan"
  ] =
    Module["asm"]["zf"]).apply(null, arguments);
});
var _fluid_midi_router_rule_set_param1 = (Module[
  "_fluid_midi_router_rule_set_param1"
] = function () {
  return (_fluid_midi_router_rule_set_param1 = Module[
    "_fluid_midi_router_rule_set_param1"
  ] =
    Module["asm"]["Af"]).apply(null, arguments);
});
var _fluid_midi_router_rule_set_param2 = (Module[
  "_fluid_midi_router_rule_set_param2"
] = function () {
  return (_fluid_midi_router_rule_set_param2 = Module[
    "_fluid_midi_router_rule_set_param2"
  ] =
    Module["asm"]["Bf"]).apply(null, arguments);
});
var _fluid_midi_router_handle_midi_event = (Module[
  "_fluid_midi_router_handle_midi_event"
] = function () {
  return (_fluid_midi_router_handle_midi_event = Module[
    "_fluid_midi_router_handle_midi_event"
  ] =
    Module["asm"]["Cf"]).apply(null, arguments);
});
var _fluid_midi_dump_prerouter = (Module["_fluid_midi_dump_prerouter"] =
  function () {
    return (_fluid_midi_dump_prerouter = Module["_fluid_midi_dump_prerouter"] =
      Module["asm"]["Df"]).apply(null, arguments);
  });
var _fluid_midi_dump_postrouter = (Module["_fluid_midi_dump_postrouter"] =
  function () {
    return (_fluid_midi_dump_postrouter = Module[
      "_fluid_midi_dump_postrouter"
    ] =
      Module["asm"]["Ef"]).apply(null, arguments);
  });
var _fluid_sequencer_unregister_client = (Module[
  "_fluid_sequencer_unregister_client"
] = function () {
  return (_fluid_sequencer_unregister_client = Module[
    "_fluid_sequencer_unregister_client"
  ] =
    Module["asm"]["Ff"]).apply(null, arguments);
});
var _fluid_sequencer_register_fluidsynth = (Module[
  "_fluid_sequencer_register_fluidsynth"
] = function () {
  return (_fluid_sequencer_register_fluidsynth = Module[
    "_fluid_sequencer_register_fluidsynth"
  ] =
    Module["asm"]["Gf"]).apply(null, arguments);
});
var _fluid_sequencer_get_use_system_timer = (Module[
  "_fluid_sequencer_get_use_system_timer"
] = function () {
  return (_fluid_sequencer_get_use_system_timer = Module[
    "_fluid_sequencer_get_use_system_timer"
  ] =
    Module["asm"]["Hf"]).apply(null, arguments);
});
var _fluid_sequencer_register_client = (Module[
  "_fluid_sequencer_register_client"
] = function () {
  return (_fluid_sequencer_register_client = Module[
    "_fluid_sequencer_register_client"
  ] =
    Module["asm"]["If"]).apply(null, arguments);
});
var _fluid_sequencer_process = (Module["_fluid_sequencer_process"] =
  function () {
    return (_fluid_sequencer_process = Module["_fluid_sequencer_process"] =
      Module["asm"]["Jf"]).apply(null, arguments);
  });
var _fluid_sequencer_send_at = (Module["_fluid_sequencer_send_at"] =
  function () {
    return (_fluid_sequencer_send_at = Module["_fluid_sequencer_send_at"] =
      Module["asm"]["Kf"]).apply(null, arguments);
  });
var _fluid_sequencer_set_time_scale = (Module[
  "_fluid_sequencer_set_time_scale"
] = function () {
  return (_fluid_sequencer_set_time_scale = Module[
    "_fluid_sequencer_set_time_scale"
  ] =
    Module["asm"]["Lf"]).apply(null, arguments);
});
var _fluid_sequencer_add_midi_event_to_buffer = (Module[
  "_fluid_sequencer_add_midi_event_to_buffer"
] = function () {
  return (_fluid_sequencer_add_midi_event_to_buffer = Module[
    "_fluid_sequencer_add_midi_event_to_buffer"
  ] =
    Module["asm"]["Mf"]).apply(null, arguments);
});
var _fluid_sequencer_count_clients = (Module["_fluid_sequencer_count_clients"] =
  function () {
    return (_fluid_sequencer_count_clients = Module[
      "_fluid_sequencer_count_clients"
    ] =
      Module["asm"]["Nf"]).apply(null, arguments);
  });
var _fluid_sequencer_get_client_id = (Module["_fluid_sequencer_get_client_id"] =
  function () {
    return (_fluid_sequencer_get_client_id = Module[
      "_fluid_sequencer_get_client_id"
    ] =
      Module["asm"]["Of"]).apply(null, arguments);
  });
var _fluid_sequencer_get_client_name = (Module[
  "_fluid_sequencer_get_client_name"
] = function () {
  return (_fluid_sequencer_get_client_name = Module[
    "_fluid_sequencer_get_client_name"
  ] =
    Module["asm"]["Pf"]).apply(null, arguments);
});
var _new_fluid_sequencer = (Module["_new_fluid_sequencer"] = function () {
  return (_new_fluid_sequencer = Module["_new_fluid_sequencer"] =
    Module["asm"]["Qf"]).apply(null, arguments);
});
var _new_fluid_sequencer2 = (Module["_new_fluid_sequencer2"] = function () {
  return (_new_fluid_sequencer2 = Module["_new_fluid_sequencer2"] =
    Module["asm"]["Rf"]).apply(null, arguments);
});
var _delete_fluid_sequencer = (Module["_delete_fluid_sequencer"] = function () {
  return (_delete_fluid_sequencer = Module["_delete_fluid_sequencer"] =
    Module["asm"]["Sf"]).apply(null, arguments);
});
var _fluid_sequencer_get_tick = (Module["_fluid_sequencer_get_tick"] =
  function () {
    return (_fluid_sequencer_get_tick = Module["_fluid_sequencer_get_tick"] =
      Module["asm"]["Tf"]).apply(null, arguments);
  });
var _fluid_sequencer_client_is_dest = (Module[
  "_fluid_sequencer_client_is_dest"
] = function () {
  return (_fluid_sequencer_client_is_dest = Module[
    "_fluid_sequencer_client_is_dest"
  ] =
    Module["asm"]["Uf"]).apply(null, arguments);
});
var _fluid_sequencer_send_now = (Module["_fluid_sequencer_send_now"] =
  function () {
    return (_fluid_sequencer_send_now = Module["_fluid_sequencer_send_now"] =
      Module["asm"]["Vf"]).apply(null, arguments);
  });
var _fluid_sequencer_remove_events = (Module["_fluid_sequencer_remove_events"] =
  function () {
    return (_fluid_sequencer_remove_events = Module[
      "_fluid_sequencer_remove_events"
    ] =
      Module["asm"]["Wf"]).apply(null, arguments);
  });
var _fluid_sequencer_get_time_scale = (Module[
  "_fluid_sequencer_get_time_scale"
] = function () {
  return (_fluid_sequencer_get_time_scale = Module[
    "_fluid_sequencer_get_time_scale"
  ] =
    Module["asm"]["Xf"]).apply(null, arguments);
});
var _new_fluid_audio_driver = (Module["_new_fluid_audio_driver"] = function () {
  return (_new_fluid_audio_driver = Module["_new_fluid_audio_driver"] =
    Module["asm"]["Yf"]).apply(null, arguments);
});
var _new_fluid_audio_driver2 = (Module["_new_fluid_audio_driver2"] =
  function () {
    return (_new_fluid_audio_driver2 = Module["_new_fluid_audio_driver2"] =
      Module["asm"]["Zf"]).apply(null, arguments);
  });
var _delete_fluid_audio_driver = (Module["_delete_fluid_audio_driver"] =
  function () {
    return (_delete_fluid_audio_driver = Module["_delete_fluid_audio_driver"] =
      Module["asm"]["_f"]).apply(null, arguments);
  });
var _fluid_audio_driver_register = (Module["_fluid_audio_driver_register"] =
  function () {
    return (_fluid_audio_driver_register = Module[
      "_fluid_audio_driver_register"
    ] =
      Module["asm"]["$f"]).apply(null, arguments);
  });
var _new_fluid_midi_driver = (Module["_new_fluid_midi_driver"] = function () {
  return (_new_fluid_midi_driver = Module["_new_fluid_midi_driver"] =
    Module["asm"]["ag"]).apply(null, arguments);
});
var _delete_fluid_midi_driver = (Module["_delete_fluid_midi_driver"] =
  function () {
    return (_delete_fluid_midi_driver = Module["_delete_fluid_midi_driver"] =
      Module["asm"]["bg"]).apply(null, arguments);
  });
var _new_fluid_file_renderer = (Module["_new_fluid_file_renderer"] =
  function () {
    return (_new_fluid_file_renderer = Module["_new_fluid_file_renderer"] =
      Module["asm"]["cg"]).apply(null, arguments);
  });
var _delete_fluid_file_renderer = (Module["_delete_fluid_file_renderer"] =
  function () {
    return (_delete_fluid_file_renderer = Module[
      "_delete_fluid_file_renderer"
    ] =
      Module["asm"]["dg"]).apply(null, arguments);
  });
var _fluid_file_set_encoding_quality = (Module[
  "_fluid_file_set_encoding_quality"
] = function () {
  return (_fluid_file_set_encoding_quality = Module[
    "_fluid_file_set_encoding_quality"
  ] =
    Module["asm"]["eg"]).apply(null, arguments);
});
var _fluid_file_renderer_process_block = (Module[
  "_fluid_file_renderer_process_block"
] = function () {
  return (_fluid_file_renderer_process_block = Module[
    "_fluid_file_renderer_process_block"
  ] =
    Module["asm"]["fg"]).apply(null, arguments);
});
var _fluid_ladspa_is_active = (Module["_fluid_ladspa_is_active"] = function () {
  return (_fluid_ladspa_is_active = Module["_fluid_ladspa_is_active"] =
    Module["asm"]["gg"]).apply(null, arguments);
});
var _fluid_ladspa_activate = (Module["_fluid_ladspa_activate"] = function () {
  return (_fluid_ladspa_activate = Module["_fluid_ladspa_activate"] =
    Module["asm"]["hg"]).apply(null, arguments);
});
var _fluid_ladspa_deactivate = (Module["_fluid_ladspa_deactivate"] =
  function () {
    return (_fluid_ladspa_deactivate = Module["_fluid_ladspa_deactivate"] =
      Module["asm"]["ig"]).apply(null, arguments);
  });
var _fluid_ladspa_reset = (Module["_fluid_ladspa_reset"] = function () {
  return (_fluid_ladspa_reset = Module["_fluid_ladspa_reset"] =
    Module["asm"]["jg"]).apply(null, arguments);
});
var _fluid_ladspa_check = (Module["_fluid_ladspa_check"] = function () {
  return (_fluid_ladspa_check = Module["_fluid_ladspa_check"] =
    Module["asm"]["kg"]).apply(null, arguments);
});
var _fluid_ladspa_host_port_exists = (Module["_fluid_ladspa_host_port_exists"] =
  function () {
    return (_fluid_ladspa_host_port_exists = Module[
      "_fluid_ladspa_host_port_exists"
    ] =
      Module["asm"]["lg"]).apply(null, arguments);
  });
var _fluid_ladspa_add_buffer = (Module["_fluid_ladspa_add_buffer"] =
  function () {
    return (_fluid_ladspa_add_buffer = Module["_fluid_ladspa_add_buffer"] =
      Module["asm"]["mg"]).apply(null, arguments);
  });
var _fluid_ladspa_buffer_exists = (Module["_fluid_ladspa_buffer_exists"] =
  function () {
    return (_fluid_ladspa_buffer_exists = Module[
      "_fluid_ladspa_buffer_exists"
    ] =
      Module["asm"]["ng"]).apply(null, arguments);
  });
var _fluid_ladspa_add_effect = (Module["_fluid_ladspa_add_effect"] =
  function () {
    return (_fluid_ladspa_add_effect = Module["_fluid_ladspa_add_effect"] =
      Module["asm"]["og"]).apply(null, arguments);
  });
var _fluid_ladspa_effect_can_mix = (Module["_fluid_ladspa_effect_can_mix"] =
  function () {
    return (_fluid_ladspa_effect_can_mix = Module[
      "_fluid_ladspa_effect_can_mix"
    ] =
      Module["asm"]["pg"]).apply(null, arguments);
  });
var _fluid_ladspa_effect_set_mix = (Module["_fluid_ladspa_effect_set_mix"] =
  function () {
    return (_fluid_ladspa_effect_set_mix = Module[
      "_fluid_ladspa_effect_set_mix"
    ] =
      Module["asm"]["qg"]).apply(null, arguments);
  });
var _fluid_ladspa_effect_port_exists = (Module[
  "_fluid_ladspa_effect_port_exists"
] = function () {
  return (_fluid_ladspa_effect_port_exists = Module[
    "_fluid_ladspa_effect_port_exists"
  ] =
    Module["asm"]["rg"]).apply(null, arguments);
});
var _fluid_ladspa_effect_set_control = (Module[
  "_fluid_ladspa_effect_set_control"
] = function () {
  return (_fluid_ladspa_effect_set_control = Module[
    "_fluid_ladspa_effect_set_control"
  ] =
    Module["asm"]["sg"]).apply(null, arguments);
});
var _fluid_ladspa_effect_link = (Module["_fluid_ladspa_effect_link"] =
  function () {
    return (_fluid_ladspa_effect_link = Module["_fluid_ladspa_effect_link"] =
      Module["asm"]["tg"]).apply(null, arguments);
  });
var ___errno_location = (Module["___errno_location"] = function () {
  return (___errno_location = Module["___errno_location"] =
    Module["asm"]["ug"]).apply(null, arguments);
});
var stackSave = (Module["stackSave"] = function () {
  return (stackSave = Module["stackSave"] = Module["asm"]["vg"]).apply(
    null,
    arguments
  );
});
var stackRestore = (Module["stackRestore"] = function () {
  return (stackRestore = Module["stackRestore"] = Module["asm"]["wg"]).apply(
    null,
    arguments
  );
});
var stackAlloc = (Module["stackAlloc"] = function () {
  return (stackAlloc = Module["stackAlloc"] = Module["asm"]["xg"]).apply(
    null,
    arguments
  );
});
var ___cxa_is_pointer_type = (Module["___cxa_is_pointer_type"] = function () {
  return (___cxa_is_pointer_type = Module["___cxa_is_pointer_type"] =
    Module["asm"]["yg"]).apply(null, arguments);
});
Module["ccall"] = ccall;
Module["cwrap"] = cwrap;
Module["FS"] = FS;
var calledRun;
function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
}
dependenciesFulfilled = function runCaller() {
  if (!calledRun) run();
  if (!calledRun) dependenciesFulfilled = runCaller;
};
function run(args) {
  args = args || arguments_;
  if (runDependencies > 0) {
    return;
  }
  preRun();
  if (runDependencies > 0) {
    return;
  }
  function doRun() {
    if (calledRun) return;
    calledRun = true;
    Module["calledRun"] = true;
    if (ABORT) return;
    initRuntime();
    if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]();
    postRun();
  }
  if (Module["setStatus"]) {
    Module["setStatus"]("Running...");
    setTimeout(function () {
      setTimeout(function () {
        Module["setStatus"]("");
      }, 1);
      doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module["run"] = run;
function exit(status, implicit) {
  EXITSTATUS = status;
  procExit(status);
}
function procExit(code) {
  EXITSTATUS = code;
  if (!keepRuntimeAlive()) {
    if (Module["onExit"]) Module["onExit"](code);
    ABORT = true;
  }
  quit_(code, new ExitStatus(code));
}
if (Module["preInit"]) {
  if (typeof Module["preInit"] == "function")
    Module["preInit"] = [Module["preInit"]];
  while (Module["preInit"].length > 0) {
    Module["preInit"].pop()();
  }
}
run();