/**
 * Script to update analytics import paths throughout the codebase
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

// Define import mappings (old path -> new path)
const importMappings = [
  // Client actions
  {
    find: '@repo/analytics/posthog/actions/client-actions',
    replace: '@repo/analytics'
  },
  // Server actions
  {
    find: '@repo/analytics/posthog/actions/server-actions',
    replace: '@repo/analytics/server'
  },
  // PageViewTracker
  {
    find: '@repo/analytics/posthog/components/page-view-tracker',
    replace: '@repo/analytics'
  },
  // Client hooks
  {
    find: '@repo/analytics/posthog/client',
    replace: '@repo/analytics'
  },
  // Server analytics
  {
    find: '@repo/analytics/posthog/server',
    replace: '@repo/analytics/server'
  }
];

// File extensions to process
const extensions = ['.ts', '.tsx', '.js', '.jsx', '.mdx'];

// Function to get all files recursively
const getAllFiles = function(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      // Skip node_modules, dist, build directories
      if (['node_modules', 'dist', 'build', '.next'].includes(file)) {
        return;
      }
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      const filePath = path.join(dirPath, file);
      // Check if it has one of our target extensions
      if (extensions.some(ext => filePath.endsWith(ext))) {
        arrayOfFiles.push(path.join(dirPath, file));
      }
    }
  });

  return arrayOfFiles;
};

// Get all files from apps and packages directories
const appFiles = getAllFiles(path.join(REPO_ROOT, 'apps'));
const packageFiles = getAllFiles(path.join(REPO_ROOT, 'packages'));
const files = [...appFiles, ...packageFiles];

// Filter out files we want to exclude
const filteredFiles = files.filter(file => {
  return !file.includes('/packages/analytics/posthog/') && 
         !file.includes('/packages/analytics/compat/');
});

console.log(`Found ${filteredFiles.length} files to process`);

// Track changes
let totalFilesUpdated = 0;
let totalImportsUpdated = 0;

// Process each file
for (const filePath of filteredFiles) {
  let content = fs.readFileSync(filePath, 'utf8');
  let fileUpdated = false;
  
  // Apply each mapping
  for (const { find, replace } of importMappings) {
    const regex = new RegExp(`from ['"]${find}(\\/[^'"]*)?['"]`, 'g');
    const newContent = content.replace(regex, (match, subpath) => {
      if (subpath) {
        return `from '${replace}${subpath}'`;
      }
      return `from '${replace}'`;
    });
    
    if (newContent !== content) {
      content = newContent;
      fileUpdated = true;
      totalImportsUpdated++;
    }
  }
  
  // Save the file if changes were made
  if (fileUpdated) {
    fs.writeFileSync(filePath, content, 'utf8');
    totalFilesUpdated++;
    console.log(`Updated imports in: ${filePath.replace(REPO_ROOT, '')}`);
  }
}

console.log(`
Analytics Import Update Complete:
--------------------------------
Files updated: ${totalFilesUpdated}
Import statements updated: ${totalImportsUpdated}
`);
