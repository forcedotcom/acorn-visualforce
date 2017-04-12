# VFEL-ES Specification

VisualForce Expression Language (VFEL) is a syntax extension to ECMAScript (ES) adding a Java Unified Expression Language-like island grammar to the spec. It is NOT intended to be implemented by engines or browsers. **It is NOT a proposal to incorporate VFEL-ES into the ECMAScript spec itself.** It's intended to be used by various preprocessors (transpilers) to transform these tokens into standard ECMAScript or execution-safe variants of VFEL.

```
// Using VFEL-ES to merge a value from Salesforce Apex context to ES
const isAdmin = {! isAdmin }; // where isAdmin is a Controller class field
if(isAdmin) {
    document.write('<span>Hello, {! $User.Name }</span>'); // use in strings
}
```

## Rationale

The purpose of this specification is to define a concrete syntax for embedding Salesforce server-side generated values into VisualForce script context. A generic but well defined syntax enables a community of independent parsers and syntax highlighters to conform to a single specification.

Embedding a new syntax in an existing language is a risky venture. Other syntax implementors or the existing language may introduce another incompatible syntax extension.

This specification heavily relies on the JSX language extension and maintains compatibility with it.

## Syntax

VFEL-ES extends the PrimaryExpression, StringLiteral, and TemplateLiteral in the [ECMAScript 6th Edition (ECMA-262)](https://tc39.github.io/ecma262/) grammar as follows (only the additions are shown for brevity).

```
PrimaryExpression ::
    MergeField

TemplateLiteral ::
    VFEL*TemplateHead VFELExpression TemplateSpans*

TemplateMiddleList ::
    VFELTemplateMiddle VFELExpression
    TemplateMiddleList[?Yield] VFELTemplateMiddle VFELExpression

TemplateCharacter ::
    { [lookahead ≠ ! ]
    SourceCharacter but not one of ` or \ or $ or { or LineTerminator

VFELTemplateHead ::
    ` TemplateCharacters[opt] {!

VFELTemplateMiddle ::
    } TemplateCharacters[opt] {!

StringLiteral ::
    VFELStringLiteralHead VFELExpression VFELStringLiteralSpans

VFELStringLiteralHead ::
    ' SingleStringCharacters[opt] {!
    " DoubleStringCharacters[opt] {!

VFELStringLiteralSpans ::
    VFELStringLiteralTail
    VFELStringLiteralMidlleList

VFELStringLiteralTail ::
    } SingleStringCharacters[opt] if the string is single-quoted
    } DoubleStringCharacters[opt] if the string is double-quoted

VFELStringLiteralMidlleList ::
      VFELStringLiteralMiddle VFELExpression
      VFELStringLiteralMidlleList VFELStringLiteralMiddle VFELExpression

VFELStringLiteralMiddle ::
    } SingleStringCharacters[opt] {!  if the string is single-quoted
    } DoubleStringCharacters[opt] {!  if the string is double-quoted


SingleStringCharacters ::
    { [lookahead ≠ ! ]
    SourceCharacter but not one of ' or \ or { or LineTerminator

SingleStringCharacters ::
    { [lookahead ≠ ! ]
    SourceCharacter but not one of " or \ or { or LineTerminator

MergeField ::
    {! VFELExpression }

VFELExpression ::
    VFELPrimaryExpression
    VFELSelectorExpression
    VFELFunctionCall
    VFELUnaryExpression
    VFELBinaryExpression

VFELPrimaryExpression ::
    ( VFELExpression )
    VFELLiteral
    VFELIdentifier
    VFELMapExpression

VFELSelectorExpression ::
    VFELExpression [ VFELExpression ]
    VFELExpression . VFELIdentifier

VFELFunctionCall ::
    VFELIdentifier ( VFELExpressionList )

VFELUnaryExpression ::
    ! VFELExpression
    NOT VFELExpression
    - VFELExpression

VFELBinaryExpression ::
    VFELExpression * VFELExpression
    VFELExpression / VFELExpression
    VFELExpression ^ VFELExpression
    VFELExpression + VFELExpression
    VFELExpression - VFELExpression
    VFELExpression & VFELExpression
    VFELExpression > VFELExpression
    VFELExpression < VFELExpression
    VFELExpression >= VFELExpression
    VFELExpression <= VFELExpression
    VFELExpression <> VFELExpression
    VFELExpression != VFELExpression
    VFELExpression = VFELExpression
    VFELExpression == VFELExpression
    VFELExpression && VFELExpression
    VFELExpression || VFELExpression

VFELLiteral ::
    ' VFELQStringCharacters[opt] '
    " VFELQQStringCharacters[opt] "
    DecimalIntegerLiteral
    DecimalIntegerLiteral . DecimalDigits
    NULL
    TRUE
    FALSE

VFELQStringCharacters ::
    SourceCharacter but not one of ' or \
    \ VFELEscapeSequence

VFELQQStringCharacters ::
    SourceCharacter but not one of " or \
    \ VFELEscapeSequence        

VFELEscapeSequence ::
  "
  '
  t
  n
  r

VFELIdentifier ::
    VFELIdentifierStart VFELIdentifierCharacter

VFELIdentifierStart ::
    $, _, or any character in the range of a-z, A-Z

VFELIdentifierCharacter ::
    $, _, ., #, :, any character in the range of a-z, A-Z, 0-9, \u0080-\ufffe

VFELMapExpression ::
    [ VFELNameValueParameterList ]

VFELNameValueParameterList ::
    VFELNameValueParameter
    VFELNameValueParameter , VFELNameValueParameterList

VFELNameValueParameter ::
    VFELIdentifier = VFELExpression

VFELExpressionList ::
    VFELExpression
    VFELExpression , VFELExpressionList
```

## Parser Implementations

acorn-visualforce: acorn plugin (wrapper) to add support for VFEL-ES.

VFELExpression implementation could be shortened by interpreting it as an a native ECMAScript AssignmentExpression and then renaming the nodes correspondingly.

VFELBinaryExpression is always left associative, including exponentiation operator `^` unlike ES native ExponentiationExpression.

All identifiers and built-in literals (null, true, false) are case-insensitive.

## Prior Art

VFEL-ES syntax is similar to [Java Unified Expression Language](https://en.wikipedia.org/wiki/Unified_Expression_Language) and [Facebook JSX](https://facebook.github.io/jsx/) combined together.
