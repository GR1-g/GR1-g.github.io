// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import css from "rollup-plugin-import-css";

export default {
    input: './main.tsx',
    output: {
        dir: 'output',
        format: 'iife',
        name: 'XXX',
        sourcemap: 'inline',
        // globals: {
        //   react: 'React'
        // }
    },
    plugins: [css(), typescript(), nodeResolve(), commonjs(), replace({
        preventAssignment: false,
        'process.env.NODE_ENV': '"development"'
    })]
};