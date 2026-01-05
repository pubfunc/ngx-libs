#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

/**
 * Bumps the version of all packages in the packages directory
 * Usage: npx tsx scripts/bump-version.ts [patch|minor|major]
 */

type VersionType = 'patch' | 'minor' | 'major';

interface ParsedVersion {
  major: number;
  minor: number;
  patch: number;
}

interface PackageInfo {
  path: string;
  name: string;
  version: string;
}

interface PackageUpdate {
  oldVersion: string;
  newVersion: string;
  name: string;
}

interface PackageJson {
  name?: string;
  version: string;
}

const VERSION_TYPES: readonly VersionType[] = ['patch', 'minor', 'major'] as const;

function parseVersion(version: string): ParsedVersion {
  const parts = version.split('.').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    throw new Error(`Invalid version format: ${version}`);
  }
  return {
    major: parts[0],
    minor: parts[1],
    patch: parts[2],
  };
}

function bumpVersion(version: string, type: VersionType): string {
  const parsed = parseVersion(version);

  switch (type) {
    case 'major':
      return `${parsed.major + 1}.0.0`;
    case 'minor':
      return `${parsed.major}.${parsed.minor + 1}.0`;
    case 'patch':
      return `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`;
    default:
      throw new Error(`Invalid version type: ${type}`);
  }
}

function findPackageJsonFiles(dir: string): string[] {
  const packageJsonFiles: string[] = [];

  function walkDir(currentPath: string): void {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules and dist directories
        if (entry.name !== 'node_modules' && entry.name !== 'dist') {
          walkDir(fullPath);
        }
      } else if (entry.name === 'package.json') {
        // Only include package.json files in the packages directory
        if (currentPath.includes(path.join('packages', path.sep))) {
          packageJsonFiles.push(fullPath);
        }
      }
    }
  }

  walkDir(dir);
  return packageJsonFiles;
}

function updatePackageVersion(packageJsonPath: string, newVersion: string): PackageUpdate {
  const content = fs.readFileSync(packageJsonPath, 'utf8');
  const packageJson: PackageJson = JSON.parse(content);
  const oldVersion = packageJson.version;

  if (!packageJson.name) {
    throw new Error(`Package at ${packageJsonPath} is missing a name field`);
  }

  packageJson.version = newVersion;

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');

  return { oldVersion, newVersion, name: packageJson.name };
}

function getRootDir(): string {
  // Support both CommonJS and ES modules
  try {
    if (typeof __dirname !== 'undefined') {
      return path.resolve(__dirname, '..');
    }
  } catch {
    // Fall through to ESM path
  }
  // ES module fallback
  const __filename = fileURLToPath(import.meta.url);
  return path.resolve(dirname(__filename), '..');
}

function main(): void {
  const versionType = (process.argv[2] || 'patch') as VersionType;

  if (!VERSION_TYPES.includes(versionType)) {
    console.error(`Error: Invalid version type "${versionType}"`);
    console.error(`Usage: npx tsx scripts/bump-version.ts [patch|minor|major]`);
    console.error(`Default: patch`);
    process.exit(1);
  }

  const rootDir = getRootDir();
  const packageJsonFiles = findPackageJsonFiles(rootDir);

  if (packageJsonFiles.length === 0) {
    console.error('Error: No package.json files found in packages directory');
    process.exit(1);
  }

  // Read all packages to determine the highest current version
  const packages: PackageInfo[] = packageJsonFiles.map((filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    const packageJson: PackageJson = JSON.parse(content);
    if (!packageJson.name) {
      throw new Error(`Package at ${filePath} is missing a name field`);
    }
    return {
      path: filePath,
      name: packageJson.name,
      version: packageJson.version,
    };
  });

  // Find the highest version to use as baseline
  const versions = packages.map((pkg) => pkg.version);
  const highestVersion = versions.reduce((max, version) => {
    const parsed = parseVersion(version);
    const maxParsed = parseVersion(max);

    if (parsed.major > maxParsed.major) return version;
    if (parsed.major < maxParsed.major) return max;
    if (parsed.minor > maxParsed.minor) return version;
    if (parsed.minor < maxParsed.minor) return max;
    if (parsed.patch > maxParsed.patch) return version;
    return max;
  });

  const newVersion = bumpVersion(highestVersion, versionType);

  console.log(`Bumping all packages from ${highestVersion} to ${newVersion} (${versionType})`);
  console.log('');

  // Update all packages
  const updates = packages.map((pkg) => {
    return updatePackageVersion(pkg.path, newVersion);
  });

  // Display results
  updates.forEach(({ name, oldVersion, newVersion }) => {
    console.log(`  ${name}: ${oldVersion} → ${newVersion}`);
  });

  console.log('');
  console.log(`✓ Successfully bumped ${updates.length} package(s) to version ${newVersion}`);
}

main();
