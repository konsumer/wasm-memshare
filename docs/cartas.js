import * as __import0 from "wasi_snapshot_preview1";
import * as __import1 from "host";
async function instantiate(module, imports = {}) {
  const __module0 = imports.wasi_snapshot_preview1;
  const __module1 = imports.host;
  const adaptedImports = {
    wasi_snapshot_preview1: Object.assign(Object.create(__module0), {
      fd_write(fd, iovs, iovs_len, nwritten) {
        // ~lib/bindings/wasi_snapshot_preview1/fd_write(u32, usize, usize, usize) => u16
        fd = fd >>> 0;
        iovs = iovs >>> 0;
        iovs_len = iovs_len >>> 0;
        nwritten = nwritten >>> 0;
        return __module0.fd_write(fd, iovs, iovs_len, nwritten);
      },
      proc_exit(rval) {
        // ~lib/bindings/wasi_snapshot_preview1/proc_exit(u32) => void
        rval = rval >>> 0;
        __module0.proc_exit(rval);
      },
    }),
    host: Object.assign(Object.create(__module1), {
      set_bytes(offset, size) {
        // ../../../../../../tmp/tmp/host_set_bytes(u32, u32) => void
        offset = offset >>> 0;
        size = size >>> 0;
        __module1.set_bytes(offset, size);
      },
    }),
  };
  const { exports } = await WebAssembly.instantiate(module, adaptedImports);
  const memory = exports.memory || imports.env.memory;
  const adaptedExports = Object.setPrototypeOf({
    shared_pointer() {
      // ../../../../../../tmp/tmp/shared_pointer() => ~lib/arraybuffer/ArrayBuffer
      return __liftBuffer(exports.shared_pointer() >>> 0);
    },
  }, exports);
  function __liftBuffer(pointer) {
    if (!pointer) return null;
    return memory.buffer.slice(pointer, pointer + new Uint32Array(memory.buffer)[pointer - 4 >>> 2]);
  }
  exports._start();
  return adaptedExports;
}
export const {
  memory,
  shared_pointer,
  load,
} = await (async url => instantiate(
  await (async () => {
    const isNodeOrBun = typeof process != "undefined" && process.versions != null && (process.versions.node != null || process.versions.bun != null);
    if (isNodeOrBun) { return globalThis.WebAssembly.compile(await (await import("node:fs/promises")).readFile(url)); }
    else { return await globalThis.WebAssembly.compileStreaming(globalThis.fetch(url)); }
  })(), {
    wasi_snapshot_preview1: __maybeDefault(__import0),
    host: __maybeDefault(__import1),
  }
))(new URL("cartas.wasm", import.meta.url));
function __maybeDefault(module) {
  return typeof module.default === "object" && Object.keys(module).length == 1
    ? module.default
    : module;
}
