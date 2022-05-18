const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    mode: process.env.NODE_ENV || 'development',
    entry: {
        main: './src/index.ts',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'deliverex-api-client.js',
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
            },
        ],
    },
    optimization: {
        minimizer: [new TerserPlugin()],
    },
};
