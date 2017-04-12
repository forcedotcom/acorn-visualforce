/**
 * @author Marat Vyshegorodtsev
 * @license BSD-3-Clause
 * For full license text, see LICENSE file in the repo root
 * or https://opensource.org/licenses/BSD-3-Clause
 */
import acorn from '../dist'
import ecmaRegressionFixture from './ecma-regression-fixture'
import fixture from './test-fixture'
import test from 'tape'

test('Parsing different VFEL expressions to AST', assert => {
	const tests = Object.keys(fixture)
	assert.plan(tests.length)
	tests.forEach(codeSnippet => {
		const ast = acorn.parse(codeSnippet, { plugins: { vfel: true } })
		assert.deepEqual(ast, fixture[codeSnippet], `Parsing '${ codeSnippet }'`)
	})
})

test('Original acorn tests to check for regressions', assert => {
	const tests = Object.keys(ecmaRegressionFixture)
	assert.plan(tests.length)
	tests.forEach(codeSnippet => {
		const ast = acorn.parse(codeSnippet, {
			plugins: { vfel: true },
			locations: true,
		})
		assert.deepEqual(ast, ecmaRegressionFixture[codeSnippet], `Parsing '${ codeSnippet }'`)
	})
})

// console.log(JSON.stringify(acorn.parseExpressionAt('\'foo{! BAR() }baz\'', 0, { plugins: { vfel: true }, locations: true, ranges: true}), 4, 4));