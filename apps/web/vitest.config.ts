import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/.next/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@ltoc/database': path.resolve(__dirname, '../../packages/database/src'),
      '@ltoc/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@ltoc/utils': path.resolve(__dirname, '../../packages/utils/src'),
    },
  },
})