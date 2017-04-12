/**
 * @author Marat Vyshegorodtsev
 * @license BSD-3-Clause
 * For full license text, see LICENSE file in the repo root
 * or https://opensource.org/licenses/BSD-3-Clause
 */

import acornApexInjector from './inject'
// acorn uses rollup that is not compatible with webpack import
const acorn = require('acorn')

export default acornApexInjector(acorn)
