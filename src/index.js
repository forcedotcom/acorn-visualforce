/**
 * @author Marat Vyshegorodtsev
 * @license BSD-3-Clause
 * For full license text, see LICENSE file in the repo root
 * or https://opensource.org/licenses/BSD-3-Clause
 */

const acorn = require('acorn')
const acornJSXInjector = require('acorn-jsx/inject')
const acornVFELInjector = require('./inject')

module.exports = acornVFELInjector(acornJSXInjector(acorn), true)
