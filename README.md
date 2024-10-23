This implements a very simple system for sharing memory and serializing things between host and cart.

The example shows:

- host compiled with emscripten/native (wamr)
- cart can use WASI (direct file access, etc) or functions implemented in host
- cart uses `measure_text()`, which has a string-param, and returns a struct
- central hosty router `void call(Op op)` is exposed to wasm, and it figures out all args/ret
- sort of like [extism](https://extism.org/), but much smaller
- all params are crammed into same place as return, so multiple args will need to be copied as a single struct/array


ideas:

- I think a union could help with simplifying passing different types

