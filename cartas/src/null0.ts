// NULL0 AS HEADER

class Dimensions {
  constructor(){}
  width:u32;
  height:u32;
}

const __shared_memory = new Uint8Array(1024*1024)

// this lets host get the pointer for the shared memory
export function shared_pointer(): Uint8Array {
  return __shared_memory
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


function measure_text(font:u32, text:string): Dimensions {
  // shared_memory_view.setUint32(0, font, true)
  const b=String.UTF8.encode(text, true)
  host_set_bytes(0, 5 + text.length)

  host_call(Op.MEASURE_TEXT)
  const out = new Dimensions()
  
  // TODO: copy shared mem to out
  return out
}

// CART CODE
