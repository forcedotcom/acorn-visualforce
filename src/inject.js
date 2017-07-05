/**
 * @author Marat Vyshegorodtsev
 * @license BSD-3-Clause
 * For full license text, see LICENSE file in the repo root
 * or https://opensource.org/licenses/BSD-3-Clause
 */

const { getQualifiedJSXName } = require('./utils')

module.exports = function (acorn, forceInject = false) {
	const { tokTypes: tt, tokContexts: tc, TokContext, TokenType, Token } = acorn

  // new tokens and contexts
	tc.vfel_expr = new TokContext('{!...}', true, false) // isExpr = true, preserveSpace = false
	tt.vfelExpressionStart = new TokenType('vfelExpressionStart', {
		beforeExpr: true,
		startsExpr: true,
	})
	tt.vfelExpressionEnd = new TokenType('vfelExpressionEnd')
	tt.metastring = new TokenType('metastring', { startsExpr: true }) // a string with additional metadata to be attached to it

	tt.vfelExpressionStart.updateContext = function vfelExprStartUpdateContext () {
		this.context.push(tc.vfel_expr) // Now everything is a VFEL expression tokens
	}
	tt.vfelExpressionEnd.updateContext = function vfelExprEndUpdateContext () {
		this.context.pop()
	}

	// override JSX behavior to support <apex:*> tags
	if (tt.jsxTagEnd && typeof tt.jsxTagEnd.updateContext === 'function')
		tt.jsxTagEnd.updateContext = function vfelJSXTagEndUpdateContext (prevType) {
			const out = this.context.pop() // popping out of j_oTag or j_cTag context

			if (out === tc.j_oTag)
				if (prevType === tt.slash) // self-closing tag
					this.context.pop() // popping out of j_expr started by this tag
				else
					this.context.push(tc.b_stat) // after opening tag everything is just another code block


			if (out === tc.j_cTag) {
				this.context.pop() // popping out of b_stat started by the corresponding opening tag
				this.context.pop() // popping out of j_expr started by the corresponding opening tag
			}

			this.exprAllowed = true
		}


  /* eslint-disable no-underscore-dangle */
  /* Underscore dangle keywords are used by acorn */
	const vfelKeywords = new Map([
    [ /^null$/i, tt._null ],
    [ /^true$/i, tt._true ],
    [ /^false$/i, tt._false ],
    [ /^not$/i, tt.prefix ],
	])
  /* eslint-enable no-underscore-dangle */

  // reusing existing tokens for vfel
	const singleCharacterTokens = {
		40: tt.parenL, // '('
		41: tt.parenR, // ')'
		42: tt.star, // '*'
		43: tt.plusMin, // '+'
		44: tt.comma, // ','
		45: tt.plusMin, // '-'
		46: tt.dot, // '.'
		47: tt.slash, // '/'
		91: tt.bracketL, // '['
		93: tt.bracketR, // ']'
		94: {
			...tt.bitwiseXOR,
			binop: 11,
		}, // '^' is a left-associative '**' in VFEL
		125: tt.vfelExpressionEnd, // '}'
	}

	const doubleCharacterTokens = {
		33: next => next === 61 ? [ tt.equality, 2 ] : [ tt.prefix, 1 ], // '!=' and '!'
		38: next => next === 38 ? [ tt.logicalAND, 2 ] : [ tt.bitwiseAND, 1 ], // '&&' and '&'
		60: next => {
			if (next === 61) return [ tt.relational, 2 ] // '<='
			if (next === 62) return [ tt.equality, 2 ] // '<>'
			return [ tt.relational, 1 ] // '<'
		},
		61: next => next === 61 ? [ tt.equality, 2 ] : [ tt.equality, 1 ], // '==' and '='
    // note, single '=' is not tt.eq, since VFEL doesn't allow assignments
		62: next => next === 61 ? [ tt.relational, 2 ] : [ tt.relational, 1 ], // '>=' and '>'
		124: next => next === 124 ? [ tt.logicalOR, 2 ] : null,     // '||', '|' is not allowed
	}

	const vfelParser = {
		// vfelExpressionsInString: [],

		vfel_readToken () {
      // Rewriting original readToken, since vfel tokens are a subset of JS tokens
			this.vfel_skipSpace()

			for (;;) {
				if (this.pos >= this.input.length)
					this.raise(this.start, 'Unterminated VFEL expression')

				const character = this.input.charCodeAt(this.pos)

        // Identifier
				if (this.vfel_isIdentifierStartChar(character)) return this.vfel_readWord()
				if (singleCharacterTokens[character]) {
					this.pos += 1
					return this.finishToken(singleCharacterTokens[character], String.fromCharCode(character))
				}

				if (doubleCharacterTokens[character]) {
					const next = this.input.charCodeAt(this.pos + 1)
					const [ token, charsConsumed ] = doubleCharacterTokens[character](next)
					const tokenValue = this.input.slice(this.pos, this.pos + charsConsumed)
					this.pos += charsConsumed
					return token ? this.finishToken(token, tokenValue) : this.unexpected()
				}

        // Numbers from 0 to 9
				if (character >= 48 && character <= 57) return this.vfel_readNumber()

        // Double quoted and single quoted strings
				if (character === 34 || character === 39) return this.vfel_readString(character)

				this.raise(this.pos, `Unexpected character in VFEL expression '${ String.fromCharCode(character) }'`)
			}
		},

		vfel_readString (quoteType) {
			let out = ''
			this.pos += 1 // consuming opening quote
			let chunkStart = this.pos

			for (;;) {
				if (this.pos >= this.input.length) this.raise(this.start, 'Unterminated string')
				const ch = this.input.charCodeAt(this.pos)
				if (ch === quoteType) break
				if (ch === 92) { // '\'
					out += this.input.slice(chunkStart, this.pos)
					out += this.vfel_readEscapedChar()
					chunkStart = this.pos
				} else {
					this.pos += 1
					if (acorn.isNewLine(ch) && this.options.locations) {
						this.curLine += 1
						this.lineStart = this.pos
					}
				}
			}
			out += this.input.slice(chunkStart, this.pos)
			this.pos += 1 // consuming closing quote
			return this.finishToken(tt.string, out)
		},

		vfel_readEscapedChar () {
			this.pos += 1 // consuming '\'
			const nextCharacter = this.input.charCodeAt(this.pos)
			switch (nextCharacter) {
				case 92: this.pos += 1; return '\\'  // in VFEL, two backslashes turn into one
				case 39: this.pos += 1; return "\\'" // but, \' renders as \', not '
				case 34: this.pos += 1; return '"' // but, \" renders as "
        // \n, \t, \r are allowed and rendered literally
				case 110: case 114: case 116: this.pos += 1; return `\\${ String.fromCharCode(nextCharacter) }`
        // any other escape sequence produces "Syntax Error in VFEL"
				default: this.raiseRecoverable('Escape sequences other than \\t, \\r and \\n are not allowed in VFEL'); return ''
			}
		},

		vfel_readNumber () {
			const start = this.pos
			let isFloat = false

      // numbers (in VFEL numbers always start with digits)
			this.vfel_consumeDigitsSlice() // consuming the integer part
			if (this.input.charCodeAt(this.pos) === 46) { // '.'
				this.pos += 1 // consuming the dot
				isFloat = true
				this.vfel_consumeDigitsSlice() // consuming the fractional part
			}
			const result = this.input.slice(start, this.pos) // consuming the whole number
			return this.finishToken(tt.num, isFloat ? parseFloat(result) : parseInt(result, 10))
		},

		vfel_consumeDigitsSlice () {
			const start = this.pos
			let character
			do {
				this.pos += 1 // first character is already checked for a digit, can skip it
				character = this.input.charAt(this.pos)
			} while (/[0-9]/.test(character))
			return this.input.slice(start, this.pos)
		},

		vfel_readWord () {
      // null, false, true, identifier
			const start = this.pos

      // consuming the first character, since it was verified already in vfel_readToken()
      // and then reading the remaining characters
			let charCode
			do {
				this.pos += 1
				charCode = this.input.charCodeAt(this.pos)
			} while (this.vfel_isIdentifierChar(charCode))

			const producedWord = this.input.slice(start, this.pos)
			let isKeyword = false
      // checking if the name is a keyword
			vfelKeywords.forEach((token, keyword) => {
				if (keyword.test(producedWord)) {
					this.finishToken(token, producedWord)
					isKeyword = true
				}
			})
      // not a keyword, return as identifier
			if (!isKeyword) this.finishToken(tt.name, producedWord)
		},

		// There is only a minor difference between original skipSpace and vfel_skipSpace — there are no line comments in VFEL
		vfel_skipSpace () {
			let isWhitespace = true
			while (isWhitespace && this.pos < this.input.length) {
				const ch = this.input.charCodeAt(this.pos)
				switch (ch) {
					case 32: case 160: // ' '
						this.pos += 1
						break
					case 13: // '\r'
						this.pos += 1
						if (this.options.locations
              && this.input.charCodeAt(this.pos + 1) !== 10) { // not \r\n, just \r
							this.curLine += 1
							this.lineStart = this.pos
						}
						break
					case 10: case 8232: case 8233: // '\n'
						this.pos += 1
						if (this.options.locations) {
							this.curLine += 1
							this.lineStart = this.pos
						}
						break
					case 47: // '/'
						if (this.input.charCodeAt(this.pos + 1) === 42)  // '*'
							this.skipBlockComment()
						else
              isWhitespace = false

						break

					default:
						if (ch > 8 && ch < 14)
							this.pos += 1
						else if (ch >= 5760 && acorn.nonASCIIwhitespace.test(String.fromCharCode(ch)))
							this.pos += 1
						else
              isWhitespace = false

				}
			}
		},

		vfel_parseExpression () {
			const node = this.vfel_parseExpressionOnly()
			// moving the parser further
			this.nextToken()
			return node
		},

		// this exists for parsing merge fields in strings without trying to tokenize the remainder of the string
		vfel_parseExpressionOnly () {
			const node = this.startNodeAt(this.start, this.startLoc)
			this.expect(tt.vfelExpressionStart) // consuming '{!'
			this.inMergeField = true
			node.value = this.parseMaybeAssign()
			this.inMergeField = false
			// consuming '}' without continuing tokenization, basically this.expect(tt.vfelExpressionEnd)
			// but without this.nextToken() in the end
			if (this.type !== tt.vfelExpressionEnd) this.raiseRecoverable('Unterminated VFEL expression')
			if (this.options.onToken) this.options.onToken(new Token(this))
			this.lastTokEnd = this.end
			this.lastTokStart = this.start
			this.lastTokEndLoc = this.endLoc
			this.lastTokStartLoc = this.startLoc
			return this.finishNode(node, 'VFELExpression')
		},

		vfel_parseMapExpressionList () {
			const elements = [] // this.parseExprList(tt.bracketR, true, true, refDestructuringErrors);
			let first = true
			while (!this.eat(tt.bracketR)) {
				if (!first)
					this.expect(tt.comma)
				else first = false
				const mapEntry = this.startNode()
				if (this.type !== tt.name) this.unexpected()
				mapEntry.key = this.value
				this.next()
				this.expect(tt.equality)
				mapEntry.value = this.parseMaybeUnary()
				elements.push(this.finishNode(mapEntry, 'MapEntry'))
        // consume tt.name, tt.equality, parseExprAtom
			}
			return elements
		},

		vfel_isIdentifierChar (charCode) {
			return /[a-zA-Z0-9$_.#:\u0080-\ufffe]/.test(String.fromCharCode(charCode))
		},

		vfel_isIdentifierStartChar (charCode) {
			return /[a-zA-Z$_]/.test(String.fromCharCode(charCode))
		},

		extractVfelExpression () {
			const p = new acorn.Parser(this.options, this.input, this.pos)
			p.nextToken()
			return p.vfel_parseExpressionOnly()
		},

		jsx_parseElementAt (startPos, startLoc) {
	    const node = this.startNodeAt(startPos, startLoc)
	    const children = []
	    const openingElement = this.jsx_parseOpeningElementAt(startPos, startLoc)
	    let closingElement = null

	    if (!openingElement.selfClosing) {
	      contents: for (;;)
	        switch (this.type) {
	        case tt.jsxTagStart:
	          startPos = this.start; startLoc = this.startLoc
	          this.next()
	          if (this.eat(tt.slash)) {
	            closingElement = this.jsx_parseClosingElementAt(startPos, startLoc)
	            break contents
	          }
	          children.push(this.jsx_parseElementAt(startPos, startLoc))
	          break

	        default:
	          children.push(this.parseStatement(true)) // declaration = true
	        }

	      if (getQualifiedJSXName(closingElement.name) !== getQualifiedJSXName(openingElement.name))
	        this.raiseRecoverable(
	          closingElement.start,
	          'Expected corresponding closing tag for <' + getQualifiedJSXName(openingElement.name) + '>')

	    }

	    node.openingElement = openingElement
	    node.closingElement = closingElement
	    node.children = children

	    return this.finishNode(node, 'JSXElement')
	  },

	}

	Object.assign(acorn.Parser.prototype, vfelParser)


	const vfelPlugin = {
		vfel (instance) {
			instance.extend('parseExprAtom', inner => function vfelExtendedParseExprAtom (refDestructuringErrors) {
				if (this.type === tt.vfelExpressionStart)
					return this.vfel_parseExpression()


				if (this.curContext() === tc.vfel_expr)
					switch (this.type) {
						case tt.bracketL: {
							const node = this.startNode()
							this.next()
							node.elements = this.vfel_parseMapExpressionList()
							return this.finishNode(node, 'MapExpression')
						}
            /* eslint-disable no-underscore-dangle */
						case tt._super:
						case tt._this:
						case tt._function:
						case tt._class:
						case tt._new:
						case tt.regexp:
						case tt.braceL:
						case tt.backQuote:
							return this.unexpected()
            /* eslint-enable no-underscore-dangle */
						default:
							return inner.call(this, refDestructuringErrors)
					}

				if (this.type === tt.metastring) return this.parseLiteral(this.value)

				return inner.call(this, refDestructuringErrors)
			})

			instance.extend('readToken', inner => function vfelExtendedReadToken (code) {
				const curContext = this.curContext()
				const nextCharCode = this.input.charCodeAt(this.pos + 1)


				// we are parsing a VFEL expression at the moment, use our own tokenizer
				if (curContext === tc.vfel_expr)
					return this.vfel_readToken()

				if (tc.j_oTag && curContext === tc.j_oTag) {
					if (code === 123) // {
						this.raise(this.pos, "Unexpected '{' inside of a tag (apex tags do not support JSX expressions)")

					if (code === 34 || code === 39)  // " and '
						return this.readString(code) // reverting it back from jsx_readString
				}

        // if we read '{!' in Javascript context, then
        // we switch context to VFEL, otherwise it is still JS
				if (code === 123 && nextCharCode === 33) {
          // got '{!', it means it is a VFEL expression start, taking over
					this.pos += 2
					return this.finishToken(tt.vfelExpressionStart)
				}

        // calling the original function since it is just JS
				return inner.call(this, code)
			})

			instance.extend('updateContext', inner => function vfelExtendedUpdateContext (prevType) {
				const curContext = this.curContext()
				// disallow switching to other contexts inside of vfel_expr context
				if (curContext === tc.vfel_expr && this.type !== tt.vfelExpressionEnd) return

				inner.call(this, prevType)
			})

			instance.extend('readString', () => function vfelExtendedReadString (quote) {
				this.pos += 1 // consuming opening quote
				let out = '',
					chunkStart = this.pos
				for (;;) {
					if (this.pos >= this.input.length) this.raise(this.start, 'Unterminated string constant')
					const ch = this.input.charCodeAt(this.pos)
					if (ch === 10 || ch === 13 || ch === 0x2028 || ch === 0x2029) this.raise(this.start, 'Unterminated string constant: new line found')

          // Found closing quote, done reading string
					if (ch === quote) break

          // Read escaped char and start over
					if (ch === 92) { // '\'
						out += this.input.slice(chunkStart, this.pos)
						out += this.readEscapedChar(false)
						chunkStart = this.pos
						continue
					}

          // Found '{!', read VFEL expression and start over
					if (ch === 123 && this.input.charCodeAt(this.pos + 1) === 33) {
						const vfelExpr = this.extractVfelExpression()

						if (vfelExpr && vfelExpr.end) {
              // parsed a vfelExpression inside string, moving further
							this.pos = vfelExpr.end
							if (Array.isArray(this.vfelExpressionsInString))
								this.vfelExpressionsInString.push(vfelExpr)
							else
                this.vfelExpressionsInString = [ vfelExpr ]

						} else
              // could not parse a vfelExpression, just consuming {! as regular characters
              this.pos += 2

						continue
					}

          // Consuming all other chars
				  this.pos += 1
				}

				out += this.input.slice(chunkStart, this.pos)
				this.pos += 1 // consuming closing quote

				if (Array.isArray(this.vfelExpressionsInString) && this.vfelExpressionsInString.length > 0)
					return this.finishToken(tt.metastring, out)
				 else
					return this.finishToken(tt.string, out)
			})

			instance.extend('parseLiteral', inner => function vfelExtendedParseLiteral (value) {

				if (this.type === tt.metastring) {
					const node = this.startNode()
					node.value = value
					node.raw = this.input.slice(this.start, this.end)
					if (Array.isArray(this.vfelExpressionsInString) && this.vfelExpressionsInString.length) {
						node.vfelExpressions = [ ...this.vfelExpressionsInString ]
						this.vfelExpressionsInString = []

					}
					this.next()
					return this.finishNode(node, 'MetaString')
				}

				return inner.call(this, value)
			})

			instance.extend('parsePropertyName', inner => function vfelExtendedParsePropertyName (prop) {
				if (this.type === tt.metastring)
					return prop.key = this.parseExprAtom()

				return inner.call(this, prop)
			})

			instance.extend('finishNode', inner => function vfelExtendedFinishNode (node, type) {
        // Hack: parse VFELExpression as AssignmentExpression
        // and then rename native ES nodes to VFEL nodes
				if (this.inMergeField) {
					const allowedNodeTypes = new Set([
						'UnaryExpression',
						'BinaryExpression',
						'LogicalExpression',
						'MemberExpression',
						'CallExpression',
						'Literal',
						'ParenthesizedExpression',
						'Identifier',
						'MapEntry',
						'MapExpression',
					])
					if (allowedNodeTypes.has(type)) return inner.call(this, node, `VFEL${ type }`)
					this.raise(node.start, `Unexpected node type ${ type } in VFEL context`)
				}

				return inner.call(this, node, type)
			}),

			instance.extend('jsx_parseAttributeValue', inner => function vfelExtendedJSXParseAttributeValue () {
				if (this.type === tt.metastring) return this.parseLiteral(this.value)
				return inner.call(this)
			})


		},
	}

	Object.assign(acorn.plugins, vfelPlugin)

	// override plugin settings
	if (forceInject) {
		const originalLoadPlugins = acorn.Parser.prototype.loadPlugins
		acorn.Parser.prototype.loadPlugins = function loadPlugins (pluginConfigs) {
			if (pluginConfigs.jsx && pluginConfigs.vfel) // jsx and vfel are specified in plugin settings, respecting them
				originalLoadPlugins.call(this, pluginConfigs)
			else
				originalLoadPlugins.call(this, {
					...pluginConfigs,
					jsx: true,
					vfel: true,
				})
		}
	}

	return acorn
}
