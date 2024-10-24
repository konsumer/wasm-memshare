// this will get loaded in host and share memory with cart
// it will be compiled to waams (with emscripten) or native (WAMR)

#include <stdio.h>
#include <string.h>
#include <stdlib.h>

#ifdef EMSCRIPTEN
#include <emscripten.h>
#endif

#define SHARED_MEM_SIZE 1024*1024
unsigned char _shared_mem[SHARED_MEM_SIZE] = {0};

// this lets host get the pointer for the shared memory
void* shared_pointer() {
  return (void*) &_shared_mem;
}

#ifdef EMSCRIPTEN
// from host, copy bytes to cart
EM_JS(void, __copy_bytes_to_cart, (void* val, unsigned int offset, unsigned int size), {
  for (let i=0;i<size;i++) {
    Module.cart.view.setUint8(offset + Module.cart.shared_loc + i, Module.HEAPU8[offset + Module.shared_loc  + i])
  }
});
#else
void __copy_bytes_to_cart(void* val, unsigned int offset, unsigned int size){
  // TODO: set this up for WAMR
}
#endif
// copy actual bytes into shared-mem & tell cart to copy bytes from there into it's shared-mem
void copy_bytes_to_cart(void* val, unsigned int offset, unsigned int size) {
  memcpy(&_shared_mem, val, size);
  __copy_bytes_to_cart(val, offset, size);
}

// copy actual bytes out of shared-mem (which cart already added)
unsigned char* copy_bytes_from_cart(unsigned int offset, unsigned int size){
  unsigned char* ret = malloc(size);
  memcpy(ret,  (unsigned char*) (&_shared_mem + offset), size);
  return ret;
}

// shared types
typedef struct {
  unsigned int width;
  unsigned int height;
} Dimensions;


// type-wrappers
unsigned int cart_shared_arg_offset = 0;
unsigned int cart_shared_ret_offset = 0;

void add_string_ret(char* value) {
  unsigned int l = strlen(value);
  copy_bytes_to_cart((void*)value, cart_shared_ret_offset, l);
  cart_shared_ret_offset += l;
}
void add_u32_ret(unsigned int value){
  copy_bytes_to_cart((void*)&value, cart_shared_ret_offset, sizeof(value));
  cart_shared_ret_offset += sizeof(value);
}
void add_Dimensions_ret(Dimensions value){
  copy_bytes_to_cart((void*)&value, cart_shared_ret_offset, sizeof(value));
  cart_shared_ret_offset += sizeof(value);
}

char* get_string_arg() {
  unsigned int l = strlen((char*)&_shared_mem + cart_shared_arg_offset) + 1;
  char* ret = (char*)&_shared_mem + cart_shared_arg_offset;
  printf("get_string_arg: %u: %s\n", l, ret);
  cart_shared_arg_offset += l;
  return ret;
}
unsigned int get_u32_arg() {
  unsigned int* ret = (unsigned int*)copy_bytes_from_cart(cart_shared_arg_offset, sizeof(int));
  cart_shared_arg_offset += sizeof(int);
  return *ret;
}
Dimensions get_Dimensions_arg() {
  Dimensions* ret = (Dimensions*)copy_bytes_from_cart(cart_shared_arg_offset, sizeof(Dimensions));
  cart_shared_arg_offset += sizeof(Dimensions);
  return *ret;
}

// mock-function that might be called by this interface
Dimensions null0_measure_text(unsigned int font, char* text){
  printf("HOST null0_measure_text(%u, %s)\n", font, text);
  Dimensions ret = {.width=100, .height=200};
  return ret;
}


// these are the types of functions you can call
typedef enum {
  OP_MEASURE_TEXT
} Op;

void call(Op op) {
  cart_shared_arg_offset = 0;
  cart_shared_ret_offset = 0;

  switch(op) {
    case OP_MEASURE_TEXT:
      add_Dimensions_ret(null0_measure_text(get_u32_arg(), get_string_arg()));
      break;
    default:
      fprintf(stderr, "Unknown op: %d\n", op);
  }
}