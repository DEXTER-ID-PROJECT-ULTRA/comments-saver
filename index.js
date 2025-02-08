require('dotenv').config();  // Load environment variables from .env file

const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

// GitHub credentials from environment variables
const GITHUB_USERNAME = ' purnapurna2007';
const GITHUB_REPO = 'DATA-JSON-REAL';
const GITHUB_TOKEN = process.env.TOKEN;
const GITHUB_FILE_PATH = 'comments.json';  // Path to your file in the repo

// Function to update the GitHub JSON file
async function updateGitHubFile(content) {
    const url = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`;

    try {
        // Fetch the existing content of the file
        const { data } = await axios.get(url, {
            headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
        });

        // Decode the existing content
        const decodedContent = JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'));

        // Push the new comment into the JSON
        decodedContent.push(content);

        // Update the file on GitHub with the new content
        await axios.put(url, {
            message: 'Add new comment with image',
            content: Buffer.from(JSON.stringify(decodedContent, null, 2)).toString('base64'),
            sha: data.sha
        }, {
            headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
        });

        console.log('GitHub file updated successfully!');
    } catch (error) {
        console.error('Error updating GitHub file:', error);
    }
}

// API endpoint to receive the data
app.get('/send-comments', async (req, res) => {
    const { email, imageUrl, massage } = req.query;

    if (!email || !imageUrl || !massage) {
        return res.status(400).send('Missing required parameters');
    }

    const newComment = {
        email,
        image: imageUrl,
        message: massage,
        created_at: new Date().toISOString()
    };

    // Save the data to the GitHub JSON file
    await updateGitHubFile(newComment);

    res.send('Comment saved successfully!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
