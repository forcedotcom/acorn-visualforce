/**
 * @author Marat Vyshegorodtsev
 * @license BSD-3-Clause
 * For full license text, see LICENSE file in the repo root
 * or https://opensource.org/licenses/BSD-3-Clause
 */

module.exports = {
  // this code is borrowed from acorn-jsx/inject.js under MIT license
	getQualifiedJSXName (object) {
		if (object.type === 'JSXIdentifier')
			return object.name

		if (object.type === 'JSXNamespacedName')
			return object.namespace.name + ':' + object.name.name

		if (object.type === 'JSXMemberExpression')
			return getQualifiedJSXName(object.object) + '.'
      + getQualifiedJSXName(object.property)
	},
}
