// import this header in your cart

#pragma once

#include <string.h>
#include <stdlib.h>
#include <stdio.h>

#define SHARED_MEM_SIZE 1024*1024
unsigned char _shared_mem[SHARED_MEM_SIZE] = {0};

// this lets host get the pointer for the shared memory
__attribute__((export_name("shared_pointer")))
void* shared_pointer() {
  return (void*) &_shared_mem;
}

// copy bytes from cart to host
__attribute__((import_module("host"), import_name("set_bytes")))
void __host_set_bytes( unsigned int offset, unsigned int size);
void host_set_bytes(unsigned int size, unsigned char* value, unsigned int offset){
  if (size > SHARED_MEM_SIZE) {
    return;
  }
  memcpy(_shared_mem + offset, value, size);
  __host_set_bytes(offset, size);
}

// these are the types of functions you can call
typedef enum {
  OP_MEASURE_TEXT
} Op;

// this tells the host to call a function
__attribute__((import_module("host"), import_name("call")))
void host_call(Op op);

// shared types
typedef struct {
  unsigned int width;
  unsigned int height;
} Dimensions;

typedef enum GamepadButton {
  GAMEPAD_BUTTON_UNKNOWN = 0,     // Unknown button, just for error checking
  GAMEPAD_BUTTON_UP = 1,          // Gamepad left DPAD up button
  GAMEPAD_BUTTON_RIGHT,           // Gamepad left DPAD right button
  GAMEPAD_BUTTON_DOWN,            // Gamepad left DPAD down button
  GAMEPAD_BUTTON_LEFT,            // Gamepad left DPAD left button
  GAMEPAD_BUTTON_Y,               // Gamepad right button up (i.e. PS3: Triangle, Xbox: Y)
  GAMEPAD_BUTTON_B,               // Gamepad right button right (i.e. PS3: Square, Xbox: X)
  GAMEPAD_BUTTON_A,               // Gamepad right button down (i.e. PS3: Cross, Xbox: A)
  GAMEPAD_BUTTON_X,               // Gamepad right button left (i.e. PS3: Circle, Xbox: B)
  GAMEPAD_BUTTON_LEFT_SHOULDER,   // Gamepad top/back trigger left (first), it could be a trailing button
  GAMEPAD_BUTTON_LEFT_TRIGGER,    // Gamepad top/back trigger left (second), it could be a trailing button
  GAMEPAD_BUTTON_RIGHT_SHOULDER,  // Gamepad top/back trigger right (one), it could be a trailing button
  GAMEPAD_BUTTON_RIGHT_TRIGGER,   // Gamepad top/back trigger right (second), it could be a trailing button
  GAMEPAD_BUTTON_SELECT,          // Gamepad center buttons, left one (i.e. PS3: Select)
  GAMEPAD_BUTTON_MENU,            // Gamepad center buttons, middle one (i.e. PS3: PS, Xbox: XBOX)
  GAMEPAD_BUTTON_START,           // Gamepad center buttons, right one (i.e. PS3: Start)
  GAMEPAD_BUTTON_LEFT_THUMB,      // Gamepad joystick pressed button left
  GAMEPAD_BUTTON_RIGHT_THUMB,     // Gamepad joystick pressed button right
} GamepadButton;

// implement these in yur cart

__attribute__((export_name("load")))
void load();

__attribute__((export_name("update")))
void update();

__attribute__((export_name("buttonUp")))
void buttonUp(GamepadButton button);

__attribute__((export_name("buttonDown")))
void buttonDown(GamepadButton button);

// the actual interface (in cart)

Dimensions measure_text(unsigned int font, char* text) {
  // serialize input into _shared_mem, as bytes
  host_set_bytes(sizeof(int), (unsigned char*) &font, 0);
  host_set_bytes(strlen(text) + 1, (unsigned char*) text, sizeof(int));

  host_call(OP_MEASURE_TEXT);
  
  // copy return out of _shared_mem, as Dimensions and return it
  Dimensions* out = malloc(sizeof(Dimensions));
  memcpy(out, &_shared_mem, sizeof(Dimensions));
  return *out;
}


