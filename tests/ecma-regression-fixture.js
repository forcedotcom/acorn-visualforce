/**
 * @author Marat Vyshegorodtsev
 * @license BSD-3-Clause
 * For full license text, see LICENSE file in the repo root
 * or https://opensource.org/licenses/BSD-3-Clause
 */
// TODO port tests from acorn

export default {
	'null\n': {
		type: 'Program',
		sourceType: 'script',
		start: 0,
		end: 5,
		loc: {
			start: {
				line: 1,
				column: 0,
			},
			end: {
				line: 2,
				column: 0,
			},
		},
		body: [
			{
				type: 'ExpressionStatement',
				start: 0,
				end: 4,
				loc: {
					start: {
						line: 1,
						column: 0,
					},
					end: {
						line: 1,
						column: 4,
					},
				},
				expression: {
					type: 'Literal',
					start: 0,
					end: 4,
					loc: {
						start: {
							line: 1,
							column: 0,
						},
						end: {
							line: 1,
							column: 4,
						},
					},
					value: null,
					raw: 'null',
				},
			},
		],
	},

}
