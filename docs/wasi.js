// TODO: flesh these out more. base-class is "you can log and stuff, and pre-inject files"
// TODO: make a WasiPreview1Zip that uses a zip-file as root filesystem

/* USAGE

const wasi_snapshot_preview1 = new WasiPreview1()
const w = {...(await WebAssembly.instantiateStreaming(fetch("whatever.wasm"), { wasi_snapshot_preview1 })).instance.exports}
wasi_snapshot_preview1.setWasm(w)
if (w._start) {
  w._start()
}
*/

const appendBuffer = (buffer1, buffer2) => {
  const tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength)
  tmp.set(new Uint8Array(buffer1), 0)
  tmp.set(new Uint8Array(buffer2), buffer1.byteLength)
  return tmp.buffer
}

const d = new TextDecoder()
const text_encoder = new TextDecoder()

function stdlogDefault (bytes) {
  const t = d.decode(bytes).replace(/\n$/g, '')
  if (t) {
    console.log(t)
  }
}

function stderrDefault (bytes) {
  const t = d.decode(bytes).replace(/\n$/g, '')
  if (t) {
    console.error(t)
  }
}

export class WasiPreview1 {
  constructor (settings = { args: [], env: {}, files: {}, stdlog: stdlogDefault, stderr: stderrDefault }) {
    this.args = settings.args
    this.env = settings.env
    this.files = settings.files
    this.stdlog = settings.stdlog
    this.stderr = settings.stderr

    // expose this to wasi functions
    this.fd_write = this.fd_write.bind(this)
  }

  // after WASM has been initialized, pass it's exports here
  setWasm (wasm) {
    this.wasm = wasm
    this.wasm.view = new DataView(this.wasm.memory.buffer)

    // add some string-utils

    this.wasm.getStringLen = (offset) => {
      let i
      for (i = 0; i < (1024 * 1024); i++) {
        if (this.wasm.view.getUint8(offset + i) === 0) {
          break
        }
      }
      return i
    }

    this.wasm.getString = (offset, length = this.wasm.getStringLen()) => d.decode(this.wasm.memory.buffer.slice(offset, offset + length))
  }

  args_get (argv, argvBuf) {
    this.args.forEach((arg, i) => {
      this.wasm.view.setUint32(argv + i * 4, argvBuf, true)
      const variable = text_encoder.encode(`${arg}\0`)
      this.wasm.view.setUint8(variable, argvBuf)
      argvBuf += variable.byteLength
    })

    return 0
  }

  args_sizes_get () {}
  environ_get () {}
  environ_sizes_get () {}
  clock_res_get () {}
  clock_time_get () {}
  fd_advise () {}
  fd_allocate () {}
  fd_datasync () {}
  fd_fdstat_set_flags () {}
  fd_fdstat_set_rights () {}
  fd_filestat_get () {}
  fd_filestat_set_size () {}
  fd_filestat_set_times () {}
  fd_pread () {}
  fd_prestat_get () {}
  fd_prestat_dir_name () {}
  fd_pwrite () {}
  fd_read () {}
  fd_readdir () {}
  fd_renumber () {}
  fd_sync () {}
  fd_tell () {}
  fd_close () {
    return 0
  }

  fd_fdstat_get () {
    return 0
  }

  fd_seek () {
    return 0
  }

  path_create_directory () {}
  path_filestat_get () {}
  path_filestat_set_times () {}
  path_link () {}
  path_open () {}
  path_readlink () {}
  path_remove_directory () {}
  path_rename () {}
  path_symlink () {}
  path_unlink_file () {}
  poll_oneoff () {}
  proc_exit () {}
  sched_yield () {}
  random_get () {}
  sock_accept () {}
  sock_recv () {}
  sock_send () {}
  sock_shutdown () {}

  fd_write (fd, iovsPtr, iovsLength, bytesWrittenPtr) {
    // TODO: make this work for general files
    const iovs = new Uint32Array(
      this.wasm.memory.buffer,
      iovsPtr,
      iovsLength * 2
    )
    let bytes = new ArrayBuffer()
    let totalBytesWritten = 0
    for (let i = 0; i < iovsLength * 2; i += 2) {
      const offset = iovs[i]
      const length = iovs[i + 1]
      bytes = appendBuffer(bytes, this.wasm.memory.buffer.slice(offset, offset + length))
      totalBytesWritten += length
    }
    this.wasm.view.setInt32(bytesWrittenPtr, totalBytesWritten, true)

    if (fd === 1) {
      this.stdlog(bytes)
    } else if (fd === 2) {
      this.stderr(bytes)
    } else {
      console.log('fd_write:', fd)
    }

    return 0
  }
}
