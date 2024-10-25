// NULL0 AS HEADER

class Dimensions {
  constructor(){}
  width:u32;
  height:u32;
}

const _shared_mem = new Uint8Array(1024*1024)

// this lets host get the pointer for the shared memory
export function shared_pointer(): Uint8Array {
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

function set_u32_arg(value:u32):void {
  store<usize>(changetype<usize>(_shared_mem) + cart_shared_arg_offset, changetype<usize>(value))
  console.log(`set_u32_arg: ${value.toString()}`)
  host_set_bytes(cart_shared_arg_offset, 4)
  cart_shared_arg_offset += 4
}

function set_string_arg(value:string):void {
  const l:u32 = value.length + 1
  const b = String.UTF8.encode(value, true)
  console.log(typeof b)
  let c:u32 = 0
  // for (c=0;c<l;c++) {
  //   _shared_mem[cart_shared_arg_offset + c]=b.buffer[c]
  // }
  console.log(`set_string_arg: ${ _shared_mem.slice(cart_shared_arg_offset + c, cart_shared_arg_offset + c+l).toString()}`)
  host_set_bytes(cart_shared_arg_offset, l)
  cart_shared_arg_offset += l
}

function get_Dimensions_ret(): Dimensions {
  const out = new Dimensions()
  store<usize>(changetype<usize>(out), changetype<usize>(_shared_mem) + cart_shared_ret_offset)
  cart_shared_ret_offset += 8
  return out
}

function measure_text(font: u32, text: string): Dimensions {
  set_u32_arg(font)
  set_string_arg(text)
  host_call(Op.MEASURE_TEXT)
  return get_Dimensions_ret()
}

// CART CODE
