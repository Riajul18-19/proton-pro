// Validate manifest.json integrity
const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, '..', 'Proton PRO', 'manifest.json');

try {
  const content = fs.readFileSync(manifestPath, 'utf8');
  const manifest = JSON.parse(content);

  console.log('🔍 Validating Proton PRO manifest.json...');
  console.log(`✓ Name: ${manifest.name}`);
  console.log(`✓ Version: ${manifest.version}`);
  console.log(`✓ Manifest Version: ${manifest.manifest_version}`);
  console.log(`✓ Permissions count: ${manifest.permissions?.length || 0}`);
  console.log(`✓ Background Service Worker: ${manifest.background?.service_worker}`);

  if (manifest.manifest_version !== 3) {
    throw new Error('Manifest version must be 3');
  }

  console.log('\n✨ Manifest validation PASSED! Ready for release.');
  process.exit(0);
} catch (err) {
  console.error('\n❌ Manifest validation FAILED:', err.message);
  process.exit(1);
}

