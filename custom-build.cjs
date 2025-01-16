// Let node/vscode know that we are using CommonJS modules
// @ts-check

const axios = require('axios');
const path = require('path');
const fs = require('fs');
const tar = require('tar');

/**
 * Replaces a value in a file and writes the updated content back.
 * @param {string} searchValue - The value to search for in the file.
 * @param {string} replaceValue - The value to replace the search value with.
 * @param {string} filePath - The path to the file to update.
 * @param {object} [options] - Optional configuration object.
 * @param {string} [options.regex] - Custom regex to use for the replacement.
 */
function replaceDefault(searchValue, replaceValue, filePath, options = {}) {
  // Resolve the full path to the file
  const resolvedPath = path.resolve(filePath);

  // Determine the search pattern (regex or plain search)
  const searchPattern = options.regex
    ? new RegExp(options.regex, 'g') // Use custom regex if provided
    : new RegExp(searchValue, 'g'); // Default to searching for the searchValue

  // Read the file
  fs.readFile(resolvedPath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading the file "${resolvedPath}":`, err);
      return;
    }

    // Replace the value using the determined pattern
    const updatedData = data.replace(searchPattern, replaceValue);

    // Write the updated content back to the file
    fs.writeFile(resolvedPath, updatedData, 'utf8', (err) => {
      if (err) {
        console.error(`Error writing to the file "${resolvedPath}":`, err);
      } else {
        console.log(`File "${resolvedPath}" updated successfully.`);
      }
    });
  });
}

// Replace default gitea configuration

// UI settings
const settings = path.join(__dirname, 'modules/setting/ui.go');
replaceDefault('gitea-auto', 'catppuccin-frappe-lavender', settings);

// Branding
//replaceDefault('Gitea - Git with a cup of tea', '', settings);
//replaceDefault('Gitea (Git with a cup of tea) is a painless self-hosted Git service written in Go', '', settings);

// Download catppuccino themes
const themes = path.join(__dirname, 'public/css/themes');

// Get latest version of catppuccino (https://github.com/catppuccin/gitea/releases/download/v1.0.1/catppuccin-gitea.tar.gz)
axios.get('https://api.github.com/repos/catppuccin/gitea/releases/latest').then((response) => {
  const version = response.data.tag_name;
  const downloadUrl = `https://github.com/catppuccin/gitea/releases/download/${version}/catppuccin-gitea.tar.gz`;
  const downloadPath = path.join(__dirname, 'public/css/themes/catppuccin-gitea.tar.gz');

  // Download the file, then extract it
  axios({
    method: 'get',
    url: downloadUrl,
    responseType: 'stream'
  }).then((response) => {
    response.data.pipe(fs.createWriteStream(downloadPath)).on('close', () => {
      // Extract the downloaded file
      tar.x({
        file: downloadPath,
        cwd: themes
      }).then(() => {
        console.log('Catppuccino themes downloaded and extracted successfully.');
      }).catch((err) => {
        console.error('Error extracting catppuccino themes:', err);
      });
    });
  }).catch((err) => {
    console.error('Error downloading catppuccino themes:', err);
  });
}).catch((err) => {
  console.error('Error getting latest catppuccino version:', err);
});
