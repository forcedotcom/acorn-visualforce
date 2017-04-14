/**
 * @author Marat Vyshegorodtsev
 * @license BSD-3-Clause
 * For full license text, see LICENSE file in the repo root
 * or https://opensource.org/licenses/BSD-3-Clause
 */

const acorn = require('acorn')
const acornInjector = require('./inject')

module.exports = acornInjector(acorn)
