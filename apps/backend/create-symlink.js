const fs = require('fs');
const path = require('path');

// The symlink points to '../src' relative to the 'node_modules' directory.
const target = '../src';
const nodeModulesDir = path.join(__dirname, 'node_modules');
const destDir = path.join(nodeModulesDir, 'src');

// Ensure node_modules exists
if (!fs.existsSync(nodeModulesDir)) {
  fs.mkdirSync(nodeModulesDir);
}

if (!fs.existsSync(destDir)) {
  try {
    // Try creating a junction on Windows first
    fs.symlinkSync(target, destDir, 'junction');
    console.log('Created symlink (junction) to src');
  } catch (err) {
    try {
      // Try creating a standard symlink (Linux/macOS)
      fs.symlinkSync(target, destDir);
      console.log('Created standard symlink to src');
    } catch (err2) {
      console.error('Failed to create symlink:', err2);
      process.exit(1);
    }
  }
} else {
  console.log('Symlink to src already exists');
}
