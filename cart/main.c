#include "null0.h"

void load() {
  Dimensions* d = measure_text(0, "Hello World");
  printf("cart measure (in load): %ux%u\n", d->width, d->height);
  free(d);
}