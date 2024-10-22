// this will get loaded in host and share memory with cart

#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <emscripten.h>

#define SHARED_MEM_SIZE 1024*1024
unsigned char _shared_mem[SHARED_MEM_SIZE] = {0};

// this lets host get the pointer for the shared memory
void* shared_pointer() {
  return (void*) &_shared_mem;
}

// from host, copy bytes to cart
EM_JS(void, __copy_bytes_to_cart, (void* val, unsigned int offset, unsigned int size), {
  for (let i=0;i<size;i++) {
    Module.cart.view.setUint8(offset + Module.cart.shared_loc + i, Module.HEAPU8[offset + Module.shared_loc  + i])
  }
});
void copy_bytes_to_cart(void* val, unsigned int offset, unsigned int size) {
  memcpy(&_shared_mem, val, size);
  __copy_bytes_to_cart(val, offset, size);
}

// shared types
typedef struct {
  unsigned int width;
  unsigned int height;
} Dimensions;

// shared functions (routed through call)
void measure_text() {
  // pull params out of shared mem]
  unsigned int font = 0;
  memcpy(&font, &_shared_mem, sizeof(int));
  unsigned int len = strlen((const char *)&_shared_mem + sizeof(int));
  char* text = malloc(len + 1);
  memcpy(text, _shared_mem + sizeof(int), len + 1);

  printf("MEASURE (%d): %s\n", font, text);

  // fake ret-val
  Dimensions d = {.width=100, .height=200};
  copy_bytes_to_cart(&d, 0, sizeof(d));
}

// these are the types of functions you can call
typedef enum {
  OP_MEASURE_TEXT
} Op;


void call(Op op) {
  switch(op) {
    case OP_MEASURE_TEXT:
      measure_text();
      break;
    default:
      fprintf(stderr, "Unknown op: %d\n", op);
  }

}
