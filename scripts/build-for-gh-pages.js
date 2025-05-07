const fs = require('fs');
const path = require('path');

// This script modifies the built app to work on GitHub Pages

// Function to create the 404.html file that will redirect to index.html
function create404Redirect() {
  const redirectContent = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>NoteShare</title>
    <script type="text/javascript">
      // Single Page Apps for GitHub Pages
      // MIT License
      // https://github.com/rafgraph/spa-github-pages
      var pathSegmentsToKeep = 1; // Change this if your repo is not in the root
      
      var l = window.location;
      l.replace(
        l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
        l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
        l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
        (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
        l.hash
      );
    </script>
  </head>
  <body>
    Redirecting...
  </body>
</html>
`;

  fs.writeFileSync(path.resolve('dist', '404.html'), redirectContent);
  console.log('✅ Created 404.html');
}

// Function to modify index.html to handle redirects
function updateIndexHtml() {
  const indexPath = path.resolve('dist', 'index.html');
  
  if (!fs.existsSync(indexPath)) {
    console.error('❌ index.html not found in dist folder. Build the project first.');
    process.exit(1);
  }

  let indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Add redirect script right after <head>
  const redirectScript = `
  <script type="text/javascript">
    // Single Page Apps for GitHub Pages
    // MIT License
    // https://github.com/rafgraph/spa-github-pages
    (function(l) {
      if (l.search[1] === '/' ) {
        var decoded = l.search.slice(1).split('&').map(function(s) { 
          return s.replace(/~and~/g, '&')
        }).join('?');
        window.history.replaceState(null, null,
            l.pathname.slice(0, -1) + decoded + l.hash
        );
      }
    }(window.location))
  </script>
  `;
  
  indexContent = indexContent.replace('</head>', redirectScript + '</head>');
  
  fs.writeFileSync(indexPath, indexContent);
  console.log('✅ Updated index.html with SPA redirect script');
}

// Create a GitHub workflow file for GitHub Pages
function createGithubWorkflow() {
  const workflowDir = path.resolve('.github', 'workflows');
  
  if (!fs.existsSync(workflowDir)) {
    fs.mkdirSync(workflowDir, { recursive: true });
  }
  
  const workflowContent = `
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout 🛎️
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install Dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Prepare for GitHub Pages
        run: node scripts/build-for-gh-pages.js

      - name: Deploy to GitHub Pages
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: dist
          branch: gh-pages
`;

  fs.writeFileSync(path.resolve(workflowDir, 'gh-pages.yml'), workflowContent);
  console.log('✅ Created GitHub workflow file');
}

// Build the project for GitHub Pages (client-only, no server)
const { execSync } = require('child_process');

function buildForGitHubPages() {
  try {
    console.log('🔄 Building project for GitHub Pages...');
    
    // Run Vite build with special config for static deployment
    execSync('vite build --config vite.config.ts --outDir dist', { stdio: 'inherit' });
    
    console.log('✅ Build completed successfully');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// Execute all functions
console.log('🔄 Preparing project for GitHub Pages deployment...');
buildForGitHubPages();
create404Redirect();
updateIndexHtml();

console.log('✅ All done! Your app is ready for GitHub Pages deployment');
console.log('ℹ️ The GitHub workflow will handle the deployment to GitHub Pages');