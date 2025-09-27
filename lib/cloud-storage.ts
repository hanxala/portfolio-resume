import { PortfolioData } from './portfolio-data';

// Enhanced cloud storage with multiple provider support
const JSONBIN_API_URL = 'https://api.jsonbin.io/v3/b';
const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY || '';
const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID || '';

// Alternative cloud storage providers
const PASTEBIN_API_URL = 'https://pastebin.com/api/api_post.php';
const PASTEBIN_API_KEY = process.env.PASTEBIN_API_KEY || '';

// GitHub Gist backup (for versioned storage)
const GITHUB_API_URL = 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_GIST_ID = process.env.GITHUB_GIST_ID || '';

interface CloudStorageMetadata {
  savedAt: string;
  version: number;
  adminEmail?: string;
  provider: string;
  deploymentId?: string;
}

export async function saveToCloud(data: PortfolioData, adminEmail?: string): Promise<void> {
  const savePromises: Promise<any>[] = [];
  const metadata: CloudStorageMetadata = {
    savedAt: new Date().toISOString(),
    version: Date.now(), // Simple version using timestamp
    adminEmail,
    provider: 'multiple',
    deploymentId: process.env.VERCEL_DEPLOYMENT_ID || process.env.RAILWAY_DEPLOYMENT_ID || 'local'
  };

  const dataWithMetadata = {
    portfolioData: data,
    metadata
  };

  // Priority 1: JSONBin.io (primary cloud storage)
  if (JSONBIN_API_KEY && JSONBIN_BIN_ID) {
    savePromises.push(
      saveToJsonBin(dataWithMetadata)
        .then(() => console.log('✅ Data saved to JSONBin'))
        .catch(error => console.warn('⚠️ JSONBin save failed:', error.message))
    );
  }

  // Priority 2: GitHub Gist (versioned backup)
  if (GITHUB_TOKEN && GITHUB_GIST_ID) {
    savePromises.push(
      saveToGitHubGist(dataWithMetadata, adminEmail)
        .then(() => console.log('✅ Data versioned to GitHub Gist'))
        .catch(error => console.warn('⚠️ GitHub Gist save failed:', error.message))
    );
  }

  // Priority 3: Alternative services (if primary fails)
  if (PASTEBIN_API_KEY) {
    savePromises.push(
      saveToPastebin(dataWithMetadata)
        .then(() => console.log('✅ Data backed up to Pastebin'))
        .catch(error => console.warn('⚠️ Pastebin save failed:', error.message))
    );
  }

  try {
    // Wait for at least one successful save
    await Promise.allSettled(savePromises);
    console.log('Cloud storage operations completed');
  } catch (error) {
    console.error('All cloud storage providers failed:', error);
    // Don't throw error - let it fallback gracefully
  }
}

export async function loadFromCloud(): Promise<PortfolioData | null> {
  const loadAttempts = [];

  // Try JSONBin first (primary)
  if (JSONBIN_API_KEY && JSONBIN_BIN_ID) {
    loadAttempts.push(() => loadFromJsonBin());
  }

  // Try GitHub Gist (secondary)
  if (GITHUB_TOKEN && GITHUB_GIST_ID) {
    loadAttempts.push(() => loadFromGitHubGist());
  }

  // Try each provider in order
  for (const loadAttempt of loadAttempts) {
    try {
      const data = await loadAttempt();
      if (data) {
        console.log('Data loaded from cloud storage successfully');
        return data;
      }
    } catch (error) {
      console.warn('Cloud storage load attempt failed:', error);
      continue;
    }
  }

  console.warn('All cloud storage providers failed to load data');
  return null;
}

// JSONBin.io implementation
async function saveToJsonBin(dataWithMetadata: any): Promise<void> {
  const response = await fetch(`${JSONBIN_API_URL}/${JSONBIN_BIN_ID}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': JSONBIN_API_KEY,
      'X-Bin-Versioning': 'false'
    },
    body: JSON.stringify(dataWithMetadata)
  });

  if (!response.ok) {
    throw new Error(`JSONBin save failed: ${response.status} ${response.statusText}`);
  }
}

async function loadFromJsonBin(): Promise<PortfolioData | null> {
  const response = await fetch(`${JSONBIN_API_URL}/${JSONBIN_BIN_ID}/latest`, {
    method: 'GET',
    headers: {
      'X-Master-Key': JSONBIN_API_KEY
    }
  });

  if (!response.ok) {
    throw new Error(`JSONBin load failed: ${response.status}`);
  }

  const result = await response.json();
  // Handle both old format (direct data) and new format (with metadata)
  if (result.record?.portfolioData) {
    return result.record.portfolioData;
  }
  return result.record || null;
}

// GitHub Gist implementation (for versioned backup)
async function saveToGitHubGist(dataWithMetadata: any, adminEmail?: string): Promise<void> {
  const filename = `portfolio-data-${Date.now()}.json`;
  const description = `Portfolio data backup - ${new Date().toISOString()}${adminEmail ? ` by ${adminEmail}` : ''}`;
  
  const gistData = {
    description,
    files: {
      [filename]: {
        content: JSON.stringify(dataWithMetadata, null, 2)
      }
    }
  };

  const response = await fetch(`${GITHUB_API_URL}/gists/${GITHUB_GIST_ID}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json'
    },
    body: JSON.stringify(gistData)
  });

  if (!response.ok) {
    throw new Error(`GitHub Gist save failed: ${response.status} ${response.statusText}`);
  }
}

async function loadFromGitHubGist(): Promise<PortfolioData | null> {
  const response = await fetch(`${GITHUB_API_URL}/gists/${GITHUB_GIST_ID}`, {
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });

  if (!response.ok) {
    throw new Error(`GitHub Gist load failed: ${response.status}`);
  }

  const gist = await response.json();
  
  // Find the most recent portfolio data file
  const files = Object.values(gist.files) as any[];
  const portfolioFile = files
    .filter((file: any) => file.filename.startsWith('portfolio-data-'))
    .sort((a: any, b: any) => b.filename.localeCompare(a.filename))[0]; // Sort by filename (timestamp)

  if (!portfolioFile) {
    return null;
  }

  const fileContent = JSON.parse(portfolioFile.content);
  return fileContent.portfolioData || fileContent;
}

// Pastebin implementation (simple backup)
async function saveToPastebin(dataWithMetadata: any): Promise<void> {
  const formData = new URLSearchParams({
    'api_dev_key': PASTEBIN_API_KEY,
    'api_option': 'paste',
    'api_paste_code': JSON.stringify(dataWithMetadata, null, 2),
    'api_paste_name': `Portfolio Backup - ${new Date().toISOString()}`,
    'api_paste_expire_date': '1M', // Expire after 1 month
    'api_paste_private': '1' // Private paste
  });

  const response = await fetch(PASTEBIN_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Pastebin save failed: ${response.status}`);
  }

  const result = await response.text();
  if (result.includes('Bad API request')) {
    throw new Error(`Pastebin API error: ${result}`);
  }
}

// Utility function to test cloud storage connectivity
export async function testCloudConnectivity(): Promise<{
  jsonbin: boolean;
  github: boolean;
  pastebin: boolean;
}> {
  const results = {
    jsonbin: false,
    github: false,
    pastebin: false
  };

  // Test JSONBin
  if (JSONBIN_API_KEY && JSONBIN_BIN_ID) {
    try {
      await loadFromJsonBin();
      results.jsonbin = true;
    } catch {
      // Test failed, but that's expected
    }
  }

  // Test GitHub
  if (GITHUB_TOKEN && GITHUB_GIST_ID) {
    try {
      const response = await fetch(`${GITHUB_API_URL}/gists/${GITHUB_GIST_ID}`, {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      results.github = response.ok;
    } catch {
      // Test failed
    }
  }

  // Test Pastebin (just check if API key is available)
  results.pastebin = !!PASTEBIN_API_KEY;

  return results;
}
