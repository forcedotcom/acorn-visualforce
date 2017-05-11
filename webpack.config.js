/**
 * @author Marat Vyshegorodtsev
 * @license BSD-3-Clause
 * For full license text, see LICENSE file in the repo root
 * or https://opensource.org/licenses/BSD-3-Clause
 */

const path = require('path')
const config = require('./package.json')


const externals = {
	acorn: 'commonjs2 acorn',
	'acorn-jsx/inject': 'commonjs2 acorn-jsx/inject',
	'./inject': 'commonjs2 ./inject',
}

module.exports = {
	context: path.resolve(__dirname, 'src'),
	entry: {
		inject: './inject.js',
		index: './index.js',
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: '[name].js',
		libraryTarget: 'commonjs2',
	},
	target: 'node',
	externals,
	module: {
		rules: [ {
			test: /\.js$/,
			loader: 'babel-loader',
		}, {
			test: /\.js$/,
			loader: 'eslint-loader',
			exclude: /node_modules/,
		} ],
	},
}
