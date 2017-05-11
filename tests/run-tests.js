/**
 * @author Marat Vyshegorodtsev
 * @license BSD-3-Clause
 * For full license text, see LICENSE file in the repo root
 * or https://opensource.org/licenses/BSD-3-Clause
 */
const test = require('tape')
const originalAcorn = require('acorn')
const acorn = require('../dist')
const fixture = require('./test-fixture')
const ecmaRegressionFixture = require('./ecma-regression-fixture')


test('Parsing different VFEL expressions to AST', assert => {
	const tests = Object.keys(fixture)
	assert.plan(tests.length)
	tests.forEach(codeSnippet => {
		const ast = acorn.parse(codeSnippet, {
			plugins: {
				jsx: true,
				vfel: true,
			},
		})
		// console.log(JSON.stringify(ast, 4, 4))
		assert.deepEqual(ast, fixture[codeSnippet], `Parsing '${ codeSnippet }'`)
	})
})

test('Original acorn tests to check for regressions', assert => {
	assert.plan(ecmaRegressionFixture.length)
	ecmaRegressionFixture.forEach(codeSnippet => {
		const originalAST = originalAcorn.parse(codeSnippet)
		const vfelAST = acorn.parse(codeSnippet, {
			plugins: {
				jsx: true,
				vfel: true,
			},
		})
		assert.deepEqual(vfelAST, originalAST, `Parsing '${ codeSnippet }'`)
	})
})
