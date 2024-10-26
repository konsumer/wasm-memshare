WASI_SDK_ROOT:=/opt/wasi-sdk

all: docs/host.mjs docs/cart.wasm docs/cartas.wasm

#%.wasm: %.c
#	${WASI_SDK_ROOT}/bin/clang -O3 --sysroot=${WASI_SDK_ROOT}/share/wasi-sysroot -Wl,--no-entry -o $@ $^

docs/cart.wasm: cart/main.c cart/null0.h
	${WASI_SDK_ROOT}/bin/clang -O3 --sysroot=${WASI_SDK_ROOT}/share/wasi-sysroot -Wl,--no-entry -nostartfiles -o $@ $<

docs/host.mjs: host/host.c
	emcc --no-entry -sERROR_ON_UNDEFINED_SYMBOLS=0 -sEXPORTED_FUNCTIONS=@host/functions.txt -Os -sWASM=1 -o $@ $^

docs/cartas.wasm: cartas/src/index.ts cartas/src/null0.ts
	cd cartas && npm ci && npm run build:release


.PHONY: run clean

run:
	npx -y live-server docs

clean:
	rm -f docs/host.* docs/cart.wasm docs/cartas.*
