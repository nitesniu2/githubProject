#!/usr/bin/env node

require('dotenv').config(); // Load .env file into process.env
const https = require('https');

let retryCount = 0;
const maxRetries = 3;
let token = process.env.GITHUB_TOKEN

function fetchGitHubActivity(username) {
    if (!username) {
        console.error('Usage: ./GithubUserActivity.js <username>');
        process.exit(1);
    }

    const url = `https://api.github.com/users/${username}/events`;

    /*const headers = {
        'Authorization': ')
    }*/

    const options = {
        method: 'GET',
        headers: {
            'User-Agent': 'github-activity-cli',
            'Authorization': `Bearer ${token}`, // Optional
        },
    };

    const req = https.request(url, options, (res) => {
        if (res.statusCode === 404) {
            console.error(`Error: User '${username}' not found.`);
            process.exit(1);
        } else if (res.statusCode !== 200) {
            console.error(`Error: Failed to fetch activity. Status code: ${res.statusCode}`);
            process.exit(1);
        }

        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                const events = JSON.parse(data);
                if (events.length === 0) {
                    console.log(`No recent activity found for user '${username}'.`);
                    return;
                }
                displayActivity(events);
            } catch (error) {
                console.error('Error parsing response:', error.message);
            }
        });
    });

    req.on('error', (e) => {
        if (retryCount < maxRetries) {
            console.error(`Error: ${e.message}. Retrying... (${retryCount + 1}/${maxRetries})`);
            retryCount++;
            fetchGitHubActivity(username);
        } else {
            console.error(`Error: ${e.message}. Exceeded retry limit.`);
            process.exit(1);
        }
    });

    req.end();
}

function displayActivity(events) {
    events.slice(0, 5).forEach((event) => {
        switch (event.type) {
            case 'PushEvent':
                console.log(`Pushed ${event.payload.commits.length} commit(s) to ${event.repo.name}`);
                break;
            case 'IssuesEvent':
                console.log(`Opened a new issue in ${event.repo.name}`);
                break;
            case 'WatchEvent':
                console.log(`Starred ${event.repo.name}`);
                break;
            case 'ForkEvent':
                console.log(`Forked ${event.repo.name}`);
                break;
            default:
                console.log(`Performed ${event.type} in ${event.repo.name}`);
        }
    });
}

// Get username from CLI arguments
const username = process.argv[2];
console.log(username);
fetchGitHubActivity(username);
