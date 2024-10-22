WASI_SDK_ROOT:=/opt/wasi-sdk

all: webroot/host.mjs webroot/cart.wasm

#%.wasm: %.c
#	${WASI_SDK_ROOT}/bin/clang -O3 --sysroot=${WASI_SDK_ROOT}/share/wasi-sysroot -Wl,--no-entry -o $@ $^

webroot/cart.wasm: cart/main.c
	${WASI_SDK_ROOT}/bin/clang -O3 --sysroot=${WASI_SDK_ROOT}/share/wasi-sysroot -Wl,--no-entry -nostartfiles -o $@ $^

webroot/host.mjs: host/web.c
	emcc --no-entry -sEXPORTED_RUNTIME_METHODS=stringToUTF8 -sPURE_WASI=1 -sERROR_ON_UNDEFINED_SYMBOLS=0 -sEXPORTED_FUNCTIONS=@host/functions.txt -o $@ $^

.PHONY: run clean

run:
	npx -y live-server webroot

clean:
	rm -f webroot/host.mjs webroot/cart.wasm
