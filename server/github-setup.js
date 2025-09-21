import { Octokit } from '@octokit/rest'

let connectionSettings;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
export async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

// Create repository function
export async function createRepository(name, description, isPrivate = false) {
  try {
    const octokit = await getUncachableGitHubClient();
    
    const response = await octokit.rest.repos.createForAuthenticatedUser({
      name: name,
      description: description,
      private: isPrivate,
      auto_init: false // Don't initialize with README since we have existing code
    });

    console.log(`Repository created successfully: ${response.data.html_url}`);
    return {
      success: true,
      url: response.data.html_url,
      cloneUrl: response.data.clone_url,
      sshUrl: response.data.ssh_url
    };
  } catch (error) {
    console.error('Error creating repository:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Get user info
export async function getUserInfo() {
  try {
    const octokit = await getUncachableGitHubClient();
    const response = await octokit.rest.users.getAuthenticated();
    return response.data;
  } catch (error) {
    console.error('Error getting user info:', error.message);
    return null;
  }
}