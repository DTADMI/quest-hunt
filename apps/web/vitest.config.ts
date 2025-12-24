import {defineConfig} from 'vitest/config';
import path from 'node:path';

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname),
        },
    },
    css: {
        // Disable loading PostCSS/Tailwind pipeline during Vitest runs
        postcss: null,
    },
    test: {
        environment: 'node',
        include: ['tests/**/*.{test,spec}.ts']
    },
});
