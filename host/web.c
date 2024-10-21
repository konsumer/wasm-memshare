// this will get loaded in host and share memory with cart

#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <emscripten.h>

#define SHARED_MEM_SIZE 1024*1024
unsigned char _shared_mem[SHARED_MEM_SIZE] = {0};

typedef struct {
  unsigned int width;
  unsigned int height;
} Dimensions;

EM_JS(void, __cart_set_bytes, (unsigned int size, unsigned char* hShared), {
  // copy bytes from host-shared to cart-shared
  const cShared = Module.cart_shared_pointer;
  for (let b=0;b<size;b++) {
    Module.cart.view.setUint8(cShared + b, Module.HEAPU8[hShared + b]);
  }
});

// this lets host get the pointer for the shared memory
void* shared_pointer() {
  return (void*) &_shared_mem;
}

// I think I could use a union (for all types that can be stored in _shared_mem) to simplofy this.

void cart_set_bytes(unsigned int size, unsigned char* value){
  if (size > SHARED_MEM_SIZE) {
    return;
  }
  memcpy(_shared_mem, value, size);
  __cart_set_bytes(size, _shared_mem);
}

void cart_set_dimensions(Dimensions* out) {
  cart_set_bytes(sizeof(Dimensions), (unsigned char*)out);
}

char* cart_get_string() {
  unsigned int l = strlen((char*)_shared_mem);
  char* str = malloc(l+1);
  str[l] = 0;
  memcpy(str, _shared_mem, l);
  return str;
}

// re-arrange params/return using shared mem

void measure_text(unsigned int font) {
  char* str = cart_get_string();
  Dimensions out = {.width=100, .height=200};
  cart_set_dimensions(&out);
}
