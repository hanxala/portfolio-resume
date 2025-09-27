import fs from 'fs';
import path from 'path';
import { getDatabaseStorage } from './database';
import { saveToCloud, loadFromCloud } from './cloud-storage';

const dataPath = path.join(process.cwd(), 'lib', 'data.json');

// Initialize database storage
let dbStorage: any = null;
try {
  if (process.env.DATABASE_PROVIDER) {
    dbStorage = getDatabaseStorage();
  }
} catch (error) {
  console.warn('Database storage not available:', error);
}

export interface PersonalInfo {
  name: string;
  title: string;
  location: string;
  phone: string;
  email: string;
  linkedin: string;
  image: string;
}

export interface Education {
  id: number;
  institution: string;
  degree: string;
  cgpa?: string;
  percentage?: string;
  location: string;
  period: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  technologies: string[];
  liveLink?: string;
  githubLink?: string;
  featured: boolean;
}

export interface Skills {
  frontend: string[];
  backend: string[];
  versionControl: string[];
  programming: string[];
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  date: string;
  organization?: string;
  type?: 'achievement' | 'certificate';
  credentialId?: string;
  credentialUrl?: string;
  expiryDate?: string;
}

export interface PortfolioData {
  personal: PersonalInfo;
  personalStatement: string;
  education: Education[];
  projects: Project[];
  skills: Skills;
  softSkills: string[];
  hobbies: string[];
  achievements: Achievement[];
}

export async function getPortfolioData(): Promise<PortfolioData> {
  try {
    // Priority 1: Try database storage (persistent across deployments)
    if (dbStorage) {
      try {
        const dbData = await dbStorage.getPortfolioData();
        if (dbData) {
          console.log('Data loaded from persistent database');
          const normalized = normalizePortfolioData(dbData);
          productionData = normalized; // Cache for subsequent requests
          return normalized;
        }
      } catch (dbError) {
        console.warn('Database fetch failed, trying alternatives:', dbError);
      }
    }
    
    // Priority 2: Try cloud storage
    try {
      const cloudData = await loadFromCloud();
      if (cloudData) {
        console.log('Data loaded from cloud storage');
        const normalized = normalizePortfolioData(cloudData);
        productionData = normalized;
        return normalized;
      }
    } catch (cloudError) {
      console.warn('Cloud storage fetch failed:', cloudError);
    }
    
    // Priority 3: Check memory cache (production)
    if ((process.env.VERCEL || process.env.NODE_ENV === 'production') && productionData) {
      console.log('Using cached data from memory');
      return productionData;
    }
    
    // Priority 4: File system (development/fallback)
    const targetPath = getTempDataPath();
    
    let fileContents: string;
    try {
      fileContents = fs.readFileSync(targetPath, 'utf8');
    } catch (tempError) {
      // Fallback to original data file
      fileContents = fs.readFileSync(dataPath, 'utf8');
    }
    
    let data = JSON.parse(fileContents);

    // Normalize any malformed URLs from previous versions
    data = normalizePortfolioData(data);
    
    // Cache in memory
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      productionData = data;
    }
    
    console.log('Data loaded from file system');
    return data;
  } catch (error) {
    console.error('Error reading portfolio data:', error);
    throw new Error('Failed to load portfolio data');
  }
}

// Normalize data to fix malformed URLs from older sanitizer
function normalizePortfolioData(data: PortfolioData): PortfolioData {
  try {
    const cloned = JSON.parse(JSON.stringify(data));
    const img = cloned?.personal?.image;
    if (typeof img === 'string') {
      // Convert patterns like https:///profile.jpg -> /profile.jpg
      if (img.startsWith('https:///')) {
        cloned.personal.image = img.replace(/^https:\/\/+/, '/');
      }
      // If it's a bare hostname without protocol, leave it to sanitizer later
    }
    return cloned;
  } catch {
    return data;
  }
}

// Global storage for production environment
let productionData: PortfolioData | null = null;

// Simple file-based storage for production (using /tmp directory)
const getTempDataPath = () => {
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    return '/tmp/portfolio-data.json';
  }
  return dataPath;
};

export async function savePortfolioData(data: PortfolioData, adminEmail?: string): Promise<void> {
  try {
    // Always store in memory for fast access
    productionData = data;
    
    const email = adminEmail || 'unknown@admin.com';
    const savePromises: Promise<any>[] = [];
    
    // Priority 1: Save to database (persistent across deployments)
    if (dbStorage) {
      savePromises.push(
        dbStorage.savePortfolioData(data, email)
          .then(() => console.log('✅ Data saved to persistent database'))
          .catch((error: any) => {
            console.error('❌ Database save failed:', error);
            throw error;
          })
      );
    }
    
    // Priority 2: Save to cloud storage (backup)
    savePromises.push(
      saveToCloud(data, email)
        .then(() => console.log('✅ Data backed up to cloud storage'))
        .catch((error: any) => console.warn('⚠️ Cloud backup failed:', error))
    );
    
    // Priority 3: File system save (local development)
    if (process.env.NODE_ENV === 'development') {
      savePromises.push(
        new Promise<void>((resolve, reject) => {
          try {
            fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
            console.log('✅ Data saved to local file');
            resolve();
          } catch (error) {
            console.warn('⚠️ Local file save failed:', error);
            reject(error);
          }
        })
      );
    } else {
      // Production: still try temp file for immediate access
      const targetPath = getTempDataPath();
      try {
        fs.writeFileSync(targetPath, JSON.stringify(data, null, 2), 'utf8');
        console.log('✅ Data cached in temp storage');
      } catch (tmpError) {
        console.warn('⚠️ Temp file save failed:', tmpError);
      }
    }
    
    // Wait for database save to complete, but don't fail on cloud/file errors
    try {
      await Promise.allSettled(savePromises);
      console.log('Portfolio data save operations completed');
    } catch (error) {
      console.error('Critical save error:', error);
      throw new Error('Failed to save portfolio data to persistent storage');
    }
    
  } catch (error) {
    console.error('Error saving portfolio data:', error);
    throw new Error('Failed to save portfolio data');
  }
}
