module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ({

/***/ 3:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * @author Marat Vyshegorodtsev
 * @license BSD-3-Clause
 * For full license text, see LICENSE file in the repo root
 * or https://opensource.org/licenses/BSD-3-Clause
 */

module.exports = function (acorn) {
	var forceInject = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
	var tt = acorn.tokTypes,
	    tc = acorn.tokContexts,
	    TokContext = acorn.TokContext,
	    TokenType = acorn.TokenType;

	// new tokens and contexts

	tc.vfel_expr = new TokContext('{!...}', true, true);
	tt.vfelExpressionStart = new TokenType('vfelExpressionStart', {
		beforeExpr: true,
		startsExpr: true
	});
	tt.vfelExpressionEnd = new TokenType('vfelExpressionEnd');

	/* eslint-disable no-underscore-dangle */
	/* Underscore dangle keywords are used by acorn */
	var vfelKeywords = new Map([[/^null$/i, tt._null], [/^true$/i, tt._true], [/^false$/i, tt._false], [/^not$/i, tt.prefix]]);
	/* eslint-enable no-underscore-dangle */

	// reusing existing tokens for vfel
	var singleCharacterTokens = {
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
		94: _extends({}, tt.bitwiseXOR, {
			binop: 11
		}), // '^' is a left-associative '**' in VFEL
		125: tt.vfelExpressionEnd };

	var doubleCharacterTokens = {
		33: function _(next) {
			return next === 61 ? [tt.equality, 2] : [tt.prefix, 1];
		}, // '!=' and '!'
		38: function _(next) {
			return next === 38 ? [tt.logicalAND, 2] : [tt.bitwiseAND, 1];
		}, // '&&' and '&'
		60: function _(next) {
			if (next === 61) return [tt.relational, 2]; // '<='
			if (next === 62) return [tt.equality, 2]; // '<>'
			return [tt.relational, 1]; // '<'
		},
		61: function _(next) {
			return next === 61 ? [tt.equality, 2] : [tt.equality, 1];
		}, // '==' and '='
		// note, single '=' is not tt.eq, since VFEL doesn't allow assignments
		62: function _(next) {
			return next === 61 ? [tt.relational, 2] : [tt.relational, 1];
		}, // '>=' and '>'
		124: function _(next) {
			return next === 124 ? [tt.logicalOR, 2] : null;
		} };

	tt.vfelExpressionStart.updateContext = function vfelExprStartUpdateContext() {
		this.context.push(tc.vfel_expr); // Now everything is a VFEL expression tokens
	};
	tt.vfelExpressionEnd.updateContext = function vfelExprEndUpdateContext() {
		this.context.pop();
	};

	var vfelParser = {
		vfel_readToken: function vfel_readToken() {
			// Rewriting original readToken, since vfel tokens are a subset of JS tokens
			this.vfel_skipSpace();

			for (;;) {
				if (this.pos >= this.input.length) this.raise(this.start, 'Unterminated VFEL expression');

				var character = this.input.charCodeAt(this.pos);

				// Identifier
				if (this.vfel_isIdentifierStartChar(character)) return this.vfel_readWord();
				if (singleCharacterTokens[character]) {
					this.pos += 1;
					return this.finishToken(singleCharacterTokens[character], String.fromCharCode(character));
				}

				if (doubleCharacterTokens[character]) {
					var next = this.input.charCodeAt(this.pos + 1);

					var _doubleCharacterToken = doubleCharacterTokens[character](next),
					    _doubleCharacterToken2 = _slicedToArray(_doubleCharacterToken, 2),
					    token = _doubleCharacterToken2[0],
					    charsConsumed = _doubleCharacterToken2[1];

					var tokenValue = this.input.slice(this.pos, this.pos + charsConsumed);
					this.pos += charsConsumed;
					return token ? this.finishToken(token, tokenValue) : this.unexpected();
				}

				// Numbers from 0 to 9
				if (character >= 48 && character <= 57) return this.vfel_readNumber();

				// Double quoted and single quoted strings
				if (character === 34 || character === 39) return this.vfel_readString(character);

				this.raise(this.pos, 'Unexpected character in VFEL expression \'' + String.fromCharCode(character) + '\'');
			}
		},
		vfel_readString: function vfel_readString(quoteType) {
			var out = '';
			this.pos += 1; // consuming opening quote
			var chunkStart = this.pos;

			for (;;) {
				if (this.pos >= this.input.length) this.raise(this.start, 'Unterminated string');
				var ch = this.input.charCodeAt(this.pos);
				if (ch === quoteType) break;
				if (ch === 92) {
					// '\'
					out += this.input.slice(chunkStart, this.pos);
					out += this.vfel_readEscapedChar();
					chunkStart = this.pos;
				} else {
					this.pos += 1;
					if (acorn.isNewLine(ch) && this.options.locations) {
						this.curLine += 1;
						this.lineStart = this.pos;
					}
				}
			}
			out += this.input.slice(chunkStart, this.pos);
			this.pos += 1; // consuming closing quote
			return this.finishToken(tt.string, out);
		},
		vfel_readEscapedChar: function vfel_readEscapedChar() {
			this.pos += 1; // consuming '\'
			var nextCharacter = this.input.charCodeAt(this.pos);
			switch (nextCharacter) {
				case 92:
					this.pos += 1;return '\\'; // in VFEL, two backslashes turn into one
				case 39:
					this.pos += 1;return "\\'"; // but, \' renders as \', not '
				case 34:
					this.pos += 1;return '"'; // but, \" renders as "
				// \n, \t, \r are allowed and rendered literally
				case 110:case 114:case 116:
					this.pos += 1;return '\\' + String.fromCharCode(nextCharacter);
				// any other escape sequence produces "Syntax Error in VFEL"
				default:
					this.raiseRecoverable('Escape sequences other than \\t, \\r and \\n are not allowed in VFEL');return '';
			}
		},
		vfel_readNumber: function vfel_readNumber() {
			var start = this.pos;
			var isFloat = false;

			// numbers (in VFEL numbers always start with digits)
			this.vfel_consumeDigitsSlice(); // consuming the integer part
			if (this.input.charCodeAt(this.pos) === 46) {
				// '.'
				this.pos += 1; // consuming the dot
				isFloat = true;
				this.vfel_consumeDigitsSlice(); // consuming the fractional part
			}
			var result = this.input.slice(start, this.pos); // consuming the whole number
			return this.finishToken(tt.num, isFloat ? parseFloat(result) : parseInt(result, 10));
		},
		vfel_consumeDigitsSlice: function vfel_consumeDigitsSlice() {
			var start = this.pos;
			var character = void 0;
			do {
				this.pos += 1; // first character is already checked for a digit, can skip it
				character = this.input.charAt(this.pos);
			} while (/[0-9]/.test(character));
			return this.input.slice(start, this.pos);
		},
		vfel_readWord: function vfel_readWord() {
			var _this = this;

			// null, false, true, identifier
			var start = this.pos;

			// consuming the first character, since it was verified already in vfel_readToken()
			// and then reading the remaining characters
			var charCode = void 0;
			do {
				this.pos += 1;
				charCode = this.input.charCodeAt(this.pos);
			} while (this.vfel_isIdentifierChar(charCode));

			var producedWord = this.input.slice(start, this.pos);
			var isKeyword = false;
			// checking if the name is a keyword
			vfelKeywords.forEach(function (token, keyword) {
				if (keyword.test(producedWord)) {
					_this.finishToken(token, producedWord);
					isKeyword = true;
				}
			});
			// not a keyword, return as identifier
			if (!isKeyword) this.finishToken(tt.name, producedWord);
		},
		vfel_skipSpace: function vfel_skipSpace() {
			var isWhitespace = true;
			while (isWhitespace && this.pos < this.input.length) {
				var ch = this.input.charCodeAt(this.pos);
				switch (ch) {
					case 32:case 160:
						// ' '
						this.pos += 1;
						break;
					case 13:
						// '\r'
						this.pos += 1;
						if (this.options.locations && this.input.charCodeAt(this.pos + 1) !== 10) {
							// not \r\n, just \r
							this.curLine += 1;
							this.lineStart = this.pos;
						}
						break;
					case 10:case 8232:case 8233:
						// '\n'
						this.pos += 1;
						if (this.options.locations) {
							this.curLine += 1;
							this.lineStart = this.pos;
						}
						break;
					case 47:
						// '/'
						if (this.input.charCodeAt(this.pos + 1) === 42) // '*'
							this.skipBlockComment();else isWhitespace = false;

						break;

					default:
						if (ch > 8 && ch < 14) this.pos += 1;else if (ch >= 5760 && acorn.nonASCIIwhitespace.test(String.fromCharCode(ch))) this.pos += 1;else isWhitespace = false;

				}
			}
		},
		vfel_parseMergeField: function vfel_parseMergeField() {
			var startPos = this.start; // remembering where VFEL expression started
			var startLoc = this.startLoc;
			this.next(); // consuming '{!'
			this.inMergeField = true;
			return this.vfel_parseMergeFieldAt(startPos, startLoc);
		},
		vfel_parseMergeFieldAt: function vfel_parseMergeFieldAt(startPos, startLoc) {
			var node = this.startNodeAt(startPos, startLoc);
			node.value = this.parseMaybeAssign();
			this.next(); // consuming vfelExpressionEnd '}'
			this.inMergeField = false;
			return this.finishNode(node, 'VFELExpression');
		},
		vfel_parseMapExpressionList: function vfel_parseMapExpressionList() {
			var elements = []; // this.parseExprList(tt.bracketR, true, true, refDestructuringErrors);
			var first = true;
			while (!this.eat(tt.bracketR)) {
				if (!first) this.expect(tt.comma);else first = false;
				var mapEntry = this.startNode();
				if (this.type !== tt.name) this.unexpected();
				mapEntry.key = this.value;
				this.next();
				this.expect(tt.equality);
				mapEntry.value = this.parseMaybeUnary();
				elements.push(this.finishNode(mapEntry, 'MapEntry'));
				// consume tt.name, tt.equality, parseExprAtom
			}
			return elements;
		},
		vfel_isIdentifierChar: function vfel_isIdentifierChar(charCode) {
			return (/[a-zA-Z0-9$_.#:\u0080-\ufffe]/.test(String.fromCharCode(charCode))
			);
		},
		vfel_isIdentifierStartChar: function vfel_isIdentifierStartChar(charCode) {
			return (/[a-zA-Z$_]/.test(String.fromCharCode(charCode))
			);
		},
		readVfelExpression: function readVfelExpression() {
			return acorn.parseExpressionAt(this.input, this.pos, this.options);
			// const expressions = []
			// for (let offset = stringValue.indexOf('{!'); offset !== -1; offset = stringValue.indexOf('{!', offset + 1))
			// 	expressions.push(acorn.parseExpressionAt(stringValue, offset, this.options))
			//
			// return expressions
		}
	};

	Object.assign(acorn.Parser.prototype, vfelParser);

	var vfelPlugin = {
		vfel: function vfel(instance) {
			instance.extend('parseExprAtom', function (inner) {
				return function vfelExtendedParseExprAtom(refDestructuringErrors) {
					if (this.type === tt.vfelExpressionStart) return this.vfel_parseMergeField();

					if (this.curContext() === tc.vfel_expr) switch (this.type) {
						case tt.bracketL:
							{
								var node = this.startNode();
								this.next();
								node.elements = this.vfel_parseMapExpressionList();
								return this.finishNode(node, 'MapExpression');
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
							return this.unexpected();
						/* eslint-enable no-underscore-dangle */
						default:
							return inner.call(this, refDestructuringErrors);
					}

					return inner.call(this, refDestructuringErrors);
				};
			});

			instance.extend('readToken', function (inner) {
				return function vfelExtendedReadToken(code) {
					// we are parsing a VFEL expression at the moment, use our own tokenizer
					if (this.curContext() === tc.vfel_expr) return this.vfel_readToken();

					// if we read '{!' in Javascript context, then
					// we switch context to VFEL, otherwise it is still JS
					var next = this.input.charCodeAt(this.pos + 1);
					if (code === 123 && next === 33) {
						// got '{!', it means it is a VFEL expression start, taking over
						this.pos += 2;
						return this.finishToken(tt.vfelExpressionStart);
					}

					// calling the original function since it is just JS
					return inner.call(this, code);
				};
			});

			instance.extend('updateContext', function (inner) {
				return function vfelExtendedUpdateContext(prevType) {
					// disallow switching to other contexts inside of vfel_expr context
					if (this.curContext() === tc.vfel_expr && this.type !== tt.vfelExpressionEnd) return;
					inner.call(this, prevType);
				};
			});

			instance.extend('readString', function () {
				return function vfelExtendedReadString(quote) {
					this.pos += 1; // consuming opening quote
					var out = '',
					    chunkStart = this.pos;
					for (;;) {
						if (this.pos >= this.input.length) this.raise(this.start, 'Unterminated string constant');
						var ch = this.input.charCodeAt(this.pos);
						if (ch === 10 || ch === 13 || ch === 0x2028 || ch === 0x2029) this.raise(this.start, 'Unterminated string constant');

						// Found closing quote, done reading string
						if (ch === quote) break;

						// Read escaped char and start over
						if (ch === 92) {
							// '\'
							out += this.input.slice(chunkStart, this.pos);
							out += this.readEscapedChar(false);
							chunkStart = this.pos;
							continue;
						}

						// Found '{!', read VFEL expression and start over
						if (ch === 123 && this.input.charCodeAt(this.pos + 1) === 33) {
							var vfelExpr = this.readVfelExpression();

							if (vfelExpr && vfelExpr.end) {
								// parsed a vfelExpression inside string, moving further
								this.pos = vfelExpr.end;
								if (Array.isArray(this.vfelExpressionsInString)) this.vfelExpressionsInString.push(vfelExpr);else this.vfelExpressionsInString = [vfelExpr];
							} else
								// could not parse a vfelExpression, just consuming {! as regular characters
								this.pos += 2;

							continue;
						}

						// Consuming all other chars
						this.pos += 1;
					}

					out += this.input.slice(chunkStart, this.pos);
					this.pos += 1; // consuming closing quote
					return this.finishToken(tt.string, out);
				};
			});

			instance.extend('parseLiteral', function (inner) {
				return function vfelExtendedParseLiteral(value) {
					var node = inner.call(this, value);
					if (Array.isArray(this.vfelExpressionsInString) && this.vfelExpressionsInString.length) {
						node.vfelExpressions = [].concat(_toConsumableArray(this.vfelExpressionsInString));
						this.vfelExpressionsInString = [];
					}
					return node;
				};
			});

			instance.extend('finishNode', function (inner) {
				return function vfelExtendedFinishNode(node, type) {
					// Hack: parse VFELExpression as AssignmentExpression
					// and then rename native ES nodes to VFEL nodes
					if (this.inMergeField) {
						var allowedNodeTypes = new Set(['UnaryExpression', 'BinaryExpression', 'LogicalExpression', 'MemberExpression', 'CallExpression', 'Literal', 'ParenthesizedExpression', 'Identifier', 'MapEntry', 'MapExpression']);
						if (allowedNodeTypes.has(type)) return inner.call(this, node, 'VFEL' + type);
						this.raise(node.start, 'Unexpected node type ' + type + ' in VFEL context');
					}

					return inner.call(this, node, type);
				};
			});
		}
	};

	Object.assign(acorn.plugins, vfelPlugin);

	// override plugin settings
	if (forceInject) {
		var originalLoadPlugins = acorn.Parser.prototype.loadPlugins;
		acorn.Parser.prototype.loadPlugins = function loadPlugins(pluginConfigs) {
			originalLoadPlugins.call(this, Object.assign(pluginConfigs, { vfel: true }));
		};
	}

	return acorn;
};

/***/ })

/******/ });