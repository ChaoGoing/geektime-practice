import commonjs from "@rollup/plugin-commonjs";


export default {
  input: ['./client.js'],
  output: {
    file: './dist/client.js',
    format: 'umd',
    name: 'client'
  },
  plugins: [commonjs()],
}