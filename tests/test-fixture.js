/**
 * @author Marat Vyshegorodtsev
 * @license BSD-3-Clause
 * For full license text, see LICENSE file in the repo root
 * or https://opensource.org/licenses/BSD-3-Clause
 */

export default {
    // comments in Merge fields
	'{! /* comment */ foo }': {
		type: 'Program',
		start: 0,
		end: 22,
		body: [ {
			type: 'ExpressionStatement',
			start: 0,
			end: 22,
			expression: {
				type: 'VFELExpression',
				start: 0,
				end: 22,
				value: {
					type: 'VFELIdentifier',
					start: 2,
					end: 20,
					name: 'foo',
				},
			},
		} ],
		sourceType: 'script',
	},
    // logical operators
	"{!(Account.Name = 'John' && Account.Salary__c <> 0) || ($User.Name = 'Escape \\' Test' && NOT Account.Salary__c != 5)}": {
		type: 'Program',
		start: 0,
		end: 117,
		body: [ {
			type: 'ExpressionStatement',
			start: 0,
			end: 117,
			expression: {
				type: 'VFELExpression',
				start: 0,
				end: 117,
				value: {
					type: 'VFELLogicalExpression',
					start: 2,
					end: 116,
					left: {
						type: 'VFELLogicalExpression',
						start: 3,
						end: 50,
						left: {
							type: 'VFELBinaryExpression',
							start: 3,
							end: 24,
							left: {
								type: 'VFELIdentifier',
								start: 3,
								end: 15,
								name: 'Account.Name',
							},
							operator: '=',
							right: {
								type: 'VFELLiteral',
								start: 17,
								end: 24,
								value: 'John',
								raw: " 'John'",
							},
						},
						operator: '&&',
						right: {
							type: 'VFELBinaryExpression',
							start: 27,
							end: 50,
							left: {
								type: 'VFELIdentifier',
								start: 27,
								end: 45,
								name: 'Account.Salary__c',
							},
							operator: '<>',
							right: {
								type: 'VFELLiteral',
								start: 48,
								end: 50,
								value: 0,
								raw: ' 0',
							},
						},
					},
					operator: '||',
					right: {
						type: 'VFELLogicalExpression',
						start: 56,
						end: 115,
						left: {
							type: 'VFELBinaryExpression',
							start: 56,
							end: 85,
							left: {
								type: 'VFELIdentifier',
								start: 56,
								end: 66,
								name: '$User.Name',
							},
							operator: '=',
							right: {
								type: 'VFELLiteral',
								start: 68,
								end: 85,
								value: "Escape \\' Test",
								raw: " 'Escape \\' Test'",
							},
						},
						operator: '&&',
						right: {
							type: 'VFELBinaryExpression',
							start: 88,
							end: 115,
							left: {
								type: 'VFELUnaryExpression',
								start: 88,
								end: 110,
								operator: 'NOT',
								prefix: true,
								argument: {
									type: 'VFELIdentifier',
									start: 92,
									end: 110,
									name: 'Account.Salary__c',
								},
							},
							operator: '!=',
							right: {
								type: 'VFELLiteral',
								start: 113,
								end: 115,
								value: 5,
								raw: ' 5',
							},
						},
					},
				},
			},
		} ],
		sourceType: 'script',
	},
    // Maps
	'{!URLFOR($Action[objectType][methodName], objectId, [retURL=retURL])}': {
		type: 'Program',
		start: 0,
		end: 69,
		body: [ {
			type: 'ExpressionStatement',
			start: 0,
			end: 69,
			expression: {
				type: 'VFELExpression',
				start: 0,
				end: 69,
				value: {
					type: 'VFELCallExpression',
					start: 2,
					end: 68,
					callee: {
						type: 'VFELIdentifier',
						start: 2,
						end: 8,
						name: 'URLFOR',
					},
					arguments: [ {
						type: 'VFELMemberExpression',
						start: 9,
						end: 40,
						object: {
							type: 'VFELMemberExpression',
							start: 9,
							end: 28,
							object: {
								type: 'VFELIdentifier',
								start: 9,
								end: 16,
								name: '$Action',
							},
							property: {
								type: 'VFELIdentifier',
								start: 17,
								end: 27,
								name: 'objectType',
							},
							computed: true,
						},
						property: {
							type: 'VFELIdentifier',
							start: 29,
							end: 39,
							name: 'methodName',
						},
						computed: true,
					},
					{
						type: 'VFELIdentifier',
						start: 41,
						end: 50,
						name: 'objectId',
					},
					{
						type: 'VFELMapExpression',
						start: 51,
						end: 67,
						elements: [ {
							type: 'VFELMapEntry',
							start: 53,
							end: 66,
							key: 'retURL',
							value: {
								type: 'VFELIdentifier',
								start: 60,
								end: 66,
								name: 'retURL',
							},
						} ],
					},
					],
				},
			},
		} ],
		sourceType: 'script',
	},
    // Left associativity
	'{! 4^3^2 }': {
		type: 'Program',
		start: 0,
		end: 10,
		body: [ {
			type: 'ExpressionStatement',
			start: 0,
			end: 10,
			expression: {
				type: 'VFELExpression',
				start: 0,
				end: 10,
				value: {
					type: 'VFELBinaryExpression',
					start: 2,
					end: 8,
					left: {
						type: 'VFELBinaryExpression',
						start: 2,
						end: 6,
						left: {
							type: 'VFELLiteral',
							start: 2,
							end: 4,
							value: 4,
							raw: ' 4',
						},
						operator: '^',
						right: {
							type: 'VFELLiteral',
							start: 5,
							end: 6,
							value: 3,
							raw: '3',
						},
					},
					operator: '^',
					right: {
						type: 'VFELLiteral',
						start: 7,
						end: 8,
						value: 2,
						raw: '2',
					},
				},
			},
		} ],
		sourceType: 'script',
	},
    // Precedence
	'{! 3*5+6^7 }': {
		type: 'Program',
		start: 0,
		end: 12,
		body: [ {
			type: 'ExpressionStatement',
			start: 0,
			end: 12,
			expression: {
				type: 'VFELExpression',
				start: 0,
				end: 12,
				value: {
					type: 'VFELBinaryExpression',
					start: 2,
					end: 10,
					left: {
						type: 'VFELBinaryExpression',
						start: 2,
						end: 6,
						left: {
							type: 'VFELLiteral',
							start: 2,
							end: 4,
							value: 3,
							raw: ' 3',
						},
						operator: '*',
						right: {
							type: 'VFELLiteral',
							start: 5,
							end: 6,
							value: 5,
							raw: '5',
						},
					},
					operator: '+',
					right: {
						type: 'VFELBinaryExpression',
						start: 7,
						end: 10,
						left: {
							type: 'VFELLiteral',
							start: 7,
							end: 8,
							value: 6,
							raw: '6',
						},
						operator: '^',
						right: {
							type: 'VFELLiteral',
							start: 9,
							end: 10,
							value: 7,
							raw: '7',
						},
					},
				},
			},
		} ],
		sourceType: 'script',
	},
    // new lines in strings
	"{! '\n\nfoo\n\n' }": {
		type: 'Program',
		start: 0,
		end: 14,
		body: [ {
			type: 'ExpressionStatement',
			start: 0,
			end: 14,
			expression: {
				type: 'VFELExpression',
				start: 0,
				end: 14,
				value: {
					type: 'VFELLiteral',
					start: 2,
					end: 12,
					value: '\n\nfoo\n\n',
					raw: " '\n\nfoo\n\n'",
				},
			},
		} ],
		sourceType: 'script',
	},
  // Strings with VFEL expressions inside
	"'String with {! 'VFEL'} expression {! 'in'} it'": {
		type: 'Program',
		start: 0,
		end: 47,
		body: [
			{
				type: 'ExpressionStatement',
				start: 0,
				end: 47,
				expression: {
					type: 'Literal',
					start: 0,
					end: 47,
					value: "String with {! 'VFEL'} expression {! 'in'} it",
					raw: "'String with {! 'VFEL'} expression {! 'in'} it'",
					vfelExpressions: [
						{
							type: 'VFELExpression',
							start: 13,
							end: 23,
							value: {
								type: 'VFELLiteral',
								start: 15,
								end: 22,
								value: 'VFEL',
								raw: " 'VFEL'",
							},
						},
						{
							type: 'VFELExpression',
							start: 35,
							end: 43,
							value: {
								type: 'VFELLiteral',
								start: 37,
								end: 42,
								value: 'in',
								raw: " 'in'",
							},
						},
					],
				},
			},
		],
		sourceType: 'script',
	},
	// Double quoted test
	'"String with {! "VFEL"} expression {! "in"} it"': {
		type: 'Program',
		start: 0,
		end: 47,
		body: [
			{
				type: 'ExpressionStatement',
				start: 0,
				end: 47,
				expression: {
					type: 'Literal',
					start: 0,
					end: 47,
					value: 'String with {! "VFEL"} expression {! "in"} it',
					raw: '"String with {! "VFEL"} expression {! "in"} it"',
					vfelExpressions: [
						{
							type: 'VFELExpression',
							start: 13,
							end: 23,
							value: {
								type: 'VFELLiteral',
								start: 15,
								end: 22,
								value: 'VFEL',
								raw: ' "VFEL"',
							},
						},
						{
							type: 'VFELExpression',
							start: 35,
							end: 43,
							value: {
								type: 'VFELLiteral',
								start: 37,
								end: 42,
								value: 'in',
								raw: ' "in"',
							},
						},
					],
				},
			},
		],
		sourceType: 'script',
	},
}
