import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/migrate.ts'],
  format: ['cjs'],
  outDir: 'dist',
  clean: true,
  noExternal: [/^@wanderaza\//],
});
