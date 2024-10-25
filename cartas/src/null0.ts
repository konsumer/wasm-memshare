// NULL0 AS HEADER

class Dimensions {
  constructor(){}
  width:u32;
  height:u32;
}

const _shared_mem = new ArrayBuffer(1024*1024)

// this lets host get the pointer for the shared memory
export function shared_pointer(): ArrayBuffer {
  return _shared_mem
}

enum Op {
  MEASURE_TEXT
}

// copy bytes from cart to host
@external("host", "set_bytes")
declare function host_set_bytes(offset:u32, size: u32):void

// call a function in host
@external("host", "call")
declare function host_call(op:Op):void

let cart_shared_arg_offset:u32 = 0
let cart_shared_ret_offset:u32 = 0

function set_arg<T>(arg: T): void {
  if (isString<T>()){
    const b = Uint8Array.wrap(String.UTF8.encode(arg, true))
    Uint8Array.wrap(_shared_mem).set(b, cart_shared_arg_offset)
    host_set_bytes(cart_shared_arg_offset, b.byteLength)
    cart_shared_arg_offset += b.byteLength
  } else if (isReference<T>()) {
    memory.copy(changetype<usize>(_shared_mem) + cart_shared_arg_offset, changetype<usize>(arg), offsetof<T>())
    host_set_bytes(cart_shared_arg_offset, offsetof<T>())
    cart_shared_arg_offset += offsetof<T>()
  } else {
    store<T>(changetype<usize>(_shared_mem) + cart_shared_arg_offset, arg)
    host_set_bytes(cart_shared_arg_offset, sizeof<T>())
    cart_shared_arg_offset += sizeof<T>()
  }
  console.log(`CART set_arg: ${cart_shared_arg_offset.toString()}`)
}

function get_ret<T>(): T {
  const ret = instantiate<T>()
  memory.copy(changetype<usize>(ret), changetype<usize>(_shared_mem) + cart_shared_ret_offset, offsetof<T>())
  cart_shared_ret_offset += offsetof<T>()
  console.log(`CART get_ret: ${offsetof<T>().toString()}`)
  return ret
}

function measure_text(font: u32, text: string): Dimensions {
  set_arg<u32>(font)
  set_arg<string>(text)
  host_call(Op.MEASURE_TEXT)
  return get_ret<Dimensions>()
}

// CART CODE
