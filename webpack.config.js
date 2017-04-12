/**
 * @author Marat Vyshegorodtsev
 * @license BSD-3-Clause
 * For full license text, see LICENSE file in the repo root
 * or https://opensource.org/licenses/BSD-3-Clause
 */

const path = require('path')
const config = require('./package.json')


const externals = Object.keys(config.dependencies).reduce((result, dep) => Object.assign(result, { [dep]: `commonjs2 ${ dep }` }), {})
externals['./inject'] = 'commonjs2 ./inject'

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
		rules: [
			{
				test: /\.json$/,
				loader: 'json-loader',
			},
			{
				test: /\.js$/,
				loader: 'babel-loader',
			},
		],
	},
}
