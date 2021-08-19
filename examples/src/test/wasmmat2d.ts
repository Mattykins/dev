import init from '../../../rustwasm/pkg/rustwasm';

// init('/dev/rustwasm/pkg/rustwasm_bg.wasm').then(wasm => {
init('//wasm.test.local:8890/rustwasm_bg.wasm').then(wasm => {

    console.log('Matrix2D Test v3');

    const quadPointer = wasm.get_quad_pointer();
    const boundsPointer = wasm.get_bounds_pointer();

    // console.log(ptr);

    const quadMem = new Float32Array(wasm.memory.buffer, quadPointer, 8);
    const boundsMem = new Float32Array(wasm.memory.buffer, boundsPointer, 4);

    wasm.load_matrix(400, 300, 0, 1, 1, 0, 0, -4, -4, 4, 4);

    console.log(quadMem);
    console.log(boundsMem);

    wasm.load_matrix(100, 200, 0.67, 1, 1, 0, 0.2, -8, -18, 8, 32);

    console.log(quadMem);
    console.log(boundsMem);
 
});
