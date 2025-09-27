import { PortfolioData, PersonalInfo, Education, Project, Achievement, Skills } from './portfolio-data';

// Input sanitization utilities
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remove inline event handlers
    .slice(0, 10000); // Limit length to prevent DoS
}

export function sanitizeUrl(input: string): string {
  if (typeof input !== 'string') return '';
  
  const cleaned = input.trim();
  
  // Allow empty URLs
  if (!cleaned) return '';

  // Preserve local paths (e.g., /profile.jpg)
  if (cleaned.startsWith('/')) {
    return cleaned;
  }
  
  // Ensure URL starts with http:// or https://
  if (!/^https?:\/\//i.test(cleaned)) {
    return `https://${cleaned}`;
  }
  
  // Block dangerous protocols
  if (/^(javascript|vbscript|file):/i.test(cleaned)) {
    return '';
  }
  
  return cleaned.slice(0, 2000); // Limit URL length
}

export function sanitizeEmail(input: string): string {
  if (typeof input !== 'string') return '';
  
  const email = input.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  return emailRegex.test(email) ? email : '';
}

// Validation schemas
interface ValidationError {
  field: string;
  message: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  sanitizedData?: PortfolioData;
}

export function validatePersonalInfo(personal: PersonalInfo): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!personal.name?.trim()) {
    errors.push({ field: 'personal.name', message: 'Name is required' });
  } else if (personal.name.length > 100) {
    errors.push({ field: 'personal.name', message: 'Name must be less than 100 characters' });
  }
  
  if (!personal.title?.trim()) {
    errors.push({ field: 'personal.title', message: 'Title is required' });
  } else if (personal.title.length > 200) {
    errors.push({ field: 'personal.title', message: 'Title must be less than 200 characters' });
  }
  
  if (personal.email && !sanitizeEmail(personal.email)) {
    errors.push({ field: 'personal.email', message: 'Invalid email format' });
  }
  
  if (personal.phone && personal.phone.length > 20) {
    errors.push({ field: 'personal.phone', message: 'Phone number must be less than 20 characters' });
  }
  
  if (personal.location && personal.location.length > 100) {
    errors.push({ field: 'personal.location', message: 'Location must be less than 100 characters' });
  }
  
  return errors;
}

export function validateEducation(education: Education[]): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (education.length > 10) {
    errors.push({ field: 'education', message: 'Maximum 10 education entries allowed' });
  }
  
  education.forEach((edu, index) => {
    if (!edu.institution?.trim()) {
      errors.push({ field: `education[${index}].institution`, message: 'Institution is required' });
    }
    
    if (!edu.degree?.trim()) {
      errors.push({ field: `education[${index}].degree`, message: 'Degree is required' });
    }
    
    if (edu.institution && edu.institution.length > 200) {
      errors.push({ field: `education[${index}].institution`, message: 'Institution name too long' });
    }
    
    if (edu.degree && edu.degree.length > 200) {
      errors.push({ field: `education[${index}].degree`, message: 'Degree name too long' });
    }
  });
  
  return errors;
}

export function validateProjects(projects: Project[]): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (projects.length > 20) {
    errors.push({ field: 'projects', message: 'Maximum 20 projects allowed' });
  }
  
  projects.forEach((project, index) => {
    if (!project.name?.trim()) {
      errors.push({ field: `projects[${index}].name`, message: 'Project name is required' });
    }
    
    if (!project.description?.trim()) {
      errors.push({ field: `projects[${index}].description`, message: 'Project description is required' });
    }
    
    if (project.name && project.name.length > 100) {
      errors.push({ field: `projects[${index}].name`, message: 'Project name too long' });
    }
    
    if (project.description && project.description.length > 1000) {
      errors.push({ field: `projects[${index}].description`, message: 'Project description too long' });
    }
    
    if (project.technologies && project.technologies.length > 20) {
      errors.push({ field: `projects[${index}].technologies`, message: 'Maximum 20 technologies per project' });
    }
    
    // Validate URLs
    if (project.liveLink && !sanitizeUrl(project.liveLink)) {
      errors.push({ field: `projects[${index}].liveLink`, message: 'Invalid live link URL' });
    }
    
    if (project.githubLink && !sanitizeUrl(project.githubLink)) {
      errors.push({ field: `projects[${index}].githubLink`, message: 'Invalid GitHub link URL' });
    }
  });
  
  return errors;
}

export function validateSkills(skills: Skills): ValidationError[] {
  const errors: ValidationError[] = [];
  
  const skillCategories = Object.keys(skills);
  
  skillCategories.forEach(category => {
    const categorySkills = skills[category as keyof Skills];
    
    if (Array.isArray(categorySkills)) {
      if (categorySkills.length > 50) {
        errors.push({ field: `skills.${category}`, message: `Maximum 50 skills allowed in ${category}` });
      }
      
      categorySkills.forEach((skill, index) => {
        if (typeof skill !== 'string' || skill.length > 50) {
          errors.push({ field: `skills.${category}[${index}]`, message: 'Skill name must be a string under 50 characters' });
        }
      });
    }
  });
  
  return errors;
}

export function validateAchievements(achievements: Achievement[]): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (achievements.length > 50) {
    errors.push({ field: 'achievements', message: 'Maximum 50 achievements allowed' });
  }
  
  achievements.forEach((achievement, index) => {
    if (!achievement.title?.trim()) {
      errors.push({ field: `achievements[${index}].title`, message: 'Achievement title is required' });
    }
    
    if (!achievement.description?.trim()) {
      errors.push({ field: `achievements[${index}].description`, message: 'Achievement description is required' });
    }
    
    if (!achievement.date) {
      errors.push({ field: `achievements[${index}].date`, message: 'Achievement date is required' });
    } else {
      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(achievement.date)) {
        errors.push({ field: `achievements[${index}].date`, message: 'Invalid date format (YYYY-MM-DD required)' });
      }
    }
    
    // Validate URLs in achievements
    if (achievement.credentialUrl && !sanitizeUrl(achievement.credentialUrl)) {
      errors.push({ field: `achievements[${index}].credentialUrl`, message: 'Invalid credential URL' });
    }
  });
  
  return errors;
}

// Main validation function
export function validatePortfolioData(data: any): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Basic structure validation
  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errors: [{ field: 'root', message: 'Invalid data structure' }]
    };
  }
  
  // Validate each section
  if (data.personal) {
    errors.push(...validatePersonalInfo(data.personal));
  } else {
    errors.push({ field: 'personal', message: 'Personal information is required' });
  }
  
  if (data.education) {
    errors.push(...validateEducation(data.education));
  }
  
  if (data.projects) {
    errors.push(...validateProjects(data.projects));
  }
  
  if (data.skills) {
    errors.push(...validateSkills(data.skills));
  }
  
  if (data.achievements) {
    errors.push(...validateAchievements(data.achievements));
  }
  
  // Sanitize data if validation passes
  let sanitizedData: PortfolioData | undefined;
  
  if (errors.length === 0) {
    sanitizedData = sanitizePortfolioData(data);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData
  };
}

// Sanitization function
export function sanitizePortfolioData(data: any): PortfolioData {
  const sanitized = { ...data };
  
  // Sanitize personal info
  if (sanitized.personal) {
    sanitized.personal = {
      ...sanitized.personal,
      name: sanitizeString(sanitized.personal.name || ''),
      title: sanitizeString(sanitized.personal.title || ''),
      location: sanitizeString(sanitized.personal.location || ''),
      phone: sanitizeString(sanitized.personal.phone || ''),
      email: sanitizeEmail(sanitized.personal.email || ''),
      linkedin: sanitizeString(sanitized.personal.linkedin || ''),
      image: sanitizeUrl(sanitized.personal.image || '')
    };
  }
  
  // Sanitize personal statement
  if (sanitized.personalStatement) {
    sanitized.personalStatement = sanitizeString(sanitized.personalStatement);
  }
  
  // Sanitize education
  if (sanitized.education) {
    sanitized.education = sanitized.education.map((edu: any) => ({
      ...edu,
      institution: sanitizeString(edu.institution || ''),
      degree: sanitizeString(edu.degree || ''),
      location: sanitizeString(edu.location || ''),
      period: sanitizeString(edu.period || ''),
      cgpa: edu.cgpa ? sanitizeString(edu.cgpa) : undefined,
      percentage: edu.percentage ? sanitizeString(edu.percentage) : undefined
    }));
  }
  
  // Sanitize projects
  if (sanitized.projects) {
    sanitized.projects = sanitized.projects.map((project: any) => ({
      ...project,
      name: sanitizeString(project.name || ''),
      description: sanitizeString(project.description || ''),
      technologies: project.technologies ? project.technologies.map((tech: any) => sanitizeString(tech)) : [],
      liveLink: project.liveLink ? sanitizeUrl(project.liveLink) : undefined,
      githubLink: project.githubLink ? sanitizeUrl(project.githubLink) : undefined
    }));
  }
  
  // Sanitize skills
  if (sanitized.skills) {
    Object.keys(sanitized.skills).forEach(category => {
      if (Array.isArray(sanitized.skills[category])) {
        sanitized.skills[category] = sanitized.skills[category].map((skill: any) => sanitizeString(skill));
      }
    });
  }
  
  // Sanitize soft skills
  if (sanitized.softSkills) {
    sanitized.softSkills = sanitized.softSkills.map((skill: any) => sanitizeString(skill));
  }
  
  // Sanitize hobbies
  if (sanitized.hobbies) {
    sanitized.hobbies = sanitized.hobbies.map((hobby: any) => sanitizeString(hobby));
  }
  
  // Sanitize achievements
  if (sanitized.achievements) {
    sanitized.achievements = sanitized.achievements.map((achievement: any) => ({
      ...achievement,
      title: sanitizeString(achievement.title || ''),
      description: sanitizeString(achievement.description || ''),
      organization: achievement.organization ? sanitizeString(achievement.organization) : undefined,
      credentialId: achievement.credentialId ? sanitizeString(achievement.credentialId) : undefined,
      credentialUrl: achievement.credentialUrl ? sanitizeUrl(achievement.credentialUrl) : undefined
    }));
  }
  
  return sanitized;
}

// Rate limiting and security checks
export interface SecurityCheck {
  isAllowed: boolean;
  reason?: string;
  retryAfter?: number; // seconds
}

const requestCounts = new Map<string, { count: number; lastReset: number }>();

export function checkRateLimit(clientId: string, maxRequests: number = 10, windowMinutes: number = 5): SecurityCheck {
  const now = Date.now();
  const windowMs = windowMinutes * 60 * 1000;
  
  const existing = requestCounts.get(clientId);
  
  if (!existing || (now - existing.lastReset) > windowMs) {
    requestCounts.set(clientId, { count: 1, lastReset: now });
    return { isAllowed: true };
  }
  
  if (existing.count >= maxRequests) {
    const retryAfter = Math.ceil((windowMs - (now - existing.lastReset)) / 1000);
    return {
      isAllowed: false,
      reason: 'Rate limit exceeded',
      retryAfter
    };
  }
  
  existing.count++;
  return { isAllowed: true };
}

// Clean up old rate limit entries
setInterval(() => {
  const now = Date.now();
  const fiveMinutesAgo = now - (5 * 60 * 1000);
  
  for (const [clientId, data] of requestCounts.entries()) {
    if (data.lastReset < fiveMinutesAgo) {
      requestCounts.delete(clientId);
    }
  }
}, 60000); // Clean up every minute