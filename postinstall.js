/* eslint-env node */

if (require('fs').existsSync('./ember-cli-build.js')) {
  const patchPackage = require('child_process').exec('patch-package');
  patchPackage.stdout.pipe(process.stdout);
  patchPackage.stderr.pipe(process.stderr);
}
