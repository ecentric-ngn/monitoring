const fs = require('fs');
const path = require('path');

// Path to the dist directory
const distDir = path.join(__dirname, 'dist/sakai-ng');

// Function to recursively update paths in all files
function updatePaths(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.lstatSync(filePath);

        if (stat.isDirectory()) {
            updatePaths(filePath); // Recursively handle directories
        } else if (file.endsWith('.html') || file.endsWith('.js') || file.endsWith('.css')) {
            let content = fs.readFileSync(filePath, 'utf8');
            // Replace relative paths to correct base href
            content = content.replace(/"\.\.\/\.\.\/\.\.\/assets/g, '"/crps-cinet/assets');
            content = content.replace(/"\.\.\/\.\.\/assets/g, '"/crps-cinet/assets');
            content = content.replace(/"\.\.\/assets/g, '"/crps-cinet/assets');
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated paths in: ${filePath}`);
        }
    });
}

// Run the path update function on the dist directory
updatePaths(distDir);

console.log('Paths in all files have been adjusted.');
