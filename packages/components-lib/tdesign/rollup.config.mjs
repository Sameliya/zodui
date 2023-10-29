// @ts-check
import { defineConfig } from 'rollup'
import autoprefixer from 'autoprefixer'
import copy from "rollup-plugin-copy";
import { dts } from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'
import postcss from 'rollup-plugin-postcss'

import pkg from './package.json' assert { type: 'json' }

const commonOutputOptions = {
  dir: 'dist',
  exports: 'named',
  sourcemap: true
}

const external = Object
  .keys(pkg.dependencies)
  .concat(/@zodui\/core\/.*/)

export default defineConfig([
  {
    input: ['src/index.ts', 'src/react.tsx'],
    output: [
      {
        ...commonOutputOptions,
        format: 'esm',
        entryFileNames: '[name].esm.js'
      },
      // {
      //   ...commonOutputOptions,
      //   format: 'iife',
      //   entryFileNames: '[name].iife.js'
      // },
      // {
      //   ...commonOutputOptions,
      //   name: 'ZodReact',
      //   format: 'umd',
      //   entryFileNames: '[name].umd.js'
      // }
    ],
    plugins: [
      postcss({
        plugins: [autoprefixer],
        minimize: true,
        sourceMap: true,
        extract: 'index.css'
      }),
      esbuild()
    ],
    external
  },
  {
    input: ['src/index.ts', 'src/react.tsx'],
    output: {
      dir: 'dist',
      entryFileNames: ({ name }) => `${name.replace(/^src\//, '')}.d.ts`
    },
    plugins: [
      {
        transform(code, id) {
          if (id.endsWith('.scss')) {
            return { code: `export default undefined`, map: null }
          }
        }
      },
      dts({ tsconfig: './tsconfig.dts.json' }),
      copy({
        targets: [
          { src: 'src/react.fix.d.ts', dest: 'dist' },
        ]
      })
    ],
    external
  }
])
