# Acorn-VisualForce

This is plugin for [Acorn](http://marijnhaverbeke.nl/acorn/) - a tiny, fast JavaScript parser, written completely in JavaScript.

It was created as an experimental parser for VisualForce inline JS.

## Usage

You can use module directly in order to get Acorn instance with plugin installed:

```javascript
const acorn = require('@salesforce/acorn-visualforce');
```

Or you can use `inject.js` for injecting plugin into your own version of Acorn like following:

```javascript
const acorn = require('@salesforce/acorn-visualforce/dist/inject')(require('./custom-acorn'));
```

Then, use `plugins` option whenever you need to support VisualForce merge fields while parsing:

```javascript
const code = 'var foo = {! JSENCODE(someApexVariable) };'
const ast = acorn.parse(code, {
  plugins: { vfel: true }
});
```

Produces:
```json
{
    "type": "Program",
    "start": 0,
    "end": 42,
    "body": [{
        "type": "VariableDeclaration",
        "start": 0,
        "end": 42,
        "declarations": [{
            "type": "VariableDeclarator",
            "start": 4,
            "end": 41,
            "id": {
                "type": "Identifier",
                "start": 4,
                "end": 7,
                "name": "foo"
            },
            "init": {
                "type": "VFELExpression",
                "start": 10,
                "end": 41,
                "value": {
                    "type": "CallExpression",
                    "start": 12,
                    "end": 39,
                    "callee": {
                        "type": "Identifier",
                        "start": 12,
                        "end": 21,
                        "name": "JSENCODE"
                    },
                    "arguments": [{
                        "type": "Identifier",
                        "start": 22,
                        "end": 38,
                        "name": "someApexVariable"
                    }]
                }
            }
        }],
        "kind": "var"
    }],
    "sourceType": "script"
}
```

The injector function also supports an optional second parameter that allows to force-inject the plugin, so that there is no need to specify the plugins options to parse or tokenize functions. This is useful for monkey-patching other parser wrappers such as `espree` that force their own plugin options.

```javascript
const acorn = require('@salesforce/acorn-visualforce/dist/inject')(require('./custom-acorn'), true);
const code = 'var foo = {! JSENCODE(someApexVariable) };'
const ast = acorn.parse(code);
```

## License

This plugin is issued under the [BSD-3-Clause](./LICENSE) license.
