import { copyFile } from 'fs/promises';
import { resolve } from 'path';

// Copy SQL.js WebAssembly to Nitro's public folder after build
(async () => {
    const src = resolve('./node_modules/sql.js/dist/sql-wasm.wasm');
    const dest = resolve('./.output/server/node_modules/sql.js/dist/sql-wasm.wasm');
    await copyFile(src, dest);
    console.log('✅ sql-wasm.wasm copied to .output/server/node_modules/sql.js/dist/');
})();