'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser, UserButton } from '@clerk/nextjs';
import { CldUploadWidget, CldImage } from 'next-cloudinary';
import { 
  User, 
  BookOpen, 
  FolderOpen, 
  Code, 
  Award, 
  Save, 
  Plus, 
  Trash2, 
  Upload
} from 'lucide-react';
import { PortfolioData, Project, Education, Achievement } from '@/lib/portfolio-data';

// Get authorized admin emails from environment (fallback for client-side)
const getAuthorizedEmails = () => {
  // For client-side, we'll hardcode the emails since env vars are not accessible
  // In a production app, you'd fetch this from an API or use a different approach
  return [
    'hanzalakhan0913@gmail.com',
    'hanzalakhan0912@gmail.com'
  ];
};

const AUTHORIZED_EMAILS = getAuthorizedEmails();

export default function AdminPanel() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [data, setData] = useState<PortfolioData | null>(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        // Check authorization via API route
        const authResponse = await fetch('/api/admin/check');
        const authData = await authResponse.json();
        
        setIsAuthorized(authData.authorized);
        
        if (authData.authorized) {
          // Fetch portfolio data if authorized
          const portfolioResponse = await fetch('/api/portfolio');
          const portfolioData = await portfolioResponse.json();
          setData(portfolioData);
        } else {
          setMessage('Access denied. You are not authorized to access this admin panel.');
        }
      } catch (error) {
        console.error('Failed to check authorization or fetch data:', error);
        setMessage('Failed to load admin panel.');
      }
    };

    if (isSignedIn) {
      checkAuthAndFetchData();
    }
  }, [isSignedIn]);

  const handleSave = async () => {
    if (!data) return;
    
    console.log('Attempting to save data:', data);
    setIsSaving(true);
    try {
      const payload = {
        password: 'hanzala2025', // Keep this for now for API compatibility
        ...data,
      };
      console.log('Sending payload:', payload);
      
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log('Save successful!');
        const isProduction = window.location.hostname.includes('vercel.app');
        if (isProduction) {
          setMessage('✅ Data saved successfully! Note: In production, changes are temporary and will reset on redeployment. For permanent changes, edit locally and redeploy.');
        } else {
          setMessage('✅ Data saved successfully!');
        }
        setTimeout(() => setMessage(''), 8000);
      } else {
        const errorData = await response.json();
        console.error('Save failed with response:', errorData);
        throw new Error(errorData.error || 'Failed to save');
      }
    } catch (error) {
      console.error('Save error:', error);
      setMessage(`Failed to save data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (result: any, field: string) => {
    if (!data || !result || typeof result !== 'object' || !result.secure_url) return;
    
    if (field === 'profileImage') {
      setData({
        ...data,
        personal: {
          ...data.personal,
          image: result.secure_url
        }
      });
    }
    
    setMessage('Image uploaded successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const addProject = () => {
    if (!data) return;
    const newProject: Project = {
      id: Date.now(),
      name: 'New Project',
      description: 'Project description',
      technologies: [],
      featured: false,
    };
    setData({ ...data, projects: [...data.projects, newProject] });
  };

  const removeProject = (id: number) => {
    if (!data) return;
    setData({ ...data, projects: data.projects.filter(p => p.id !== id) });
  };

  const updateProject = (id: number, field: keyof Project, value: string | boolean | string[]) => {
    if (!data) return;
    setData({
      ...data,
      projects: data.projects.map(p => 
        p.id === id ? { ...p, [field]: value } : p
      ),
    });
  };

  const addEducation = () => {
    if (!data) return;
    const newEducation: Education = {
      id: Date.now(),
      institution: 'New Institution',
      degree: 'Degree',
      location: 'Location',
      period: 'Period',
    };
    setData({ ...data, education: [...data.education, newEducation] });
  };

  const removeEducation = (id: number) => {
    if (!data) return;
    setData({ ...data, education: data.education.filter(e => e.id !== id) });
  };

  const updateEducation = (id: number, field: keyof Education, value: string) => {
    if (!data) return;
    setData({
      ...data,
      education: data.education.map(e => 
        e.id === id ? { ...e, [field]: value } : e
      ),
    });
  };

  const addAchievement = () => {
    if (!data) return;
    const newAchievement: Achievement = {
      id: Date.now(),
      title: 'New Achievement',
      description: 'Achievement description',
      date: new Date().toISOString().split('T')[0],
    };
    setData({ ...data, achievements: [...data.achievements, newAchievement] });
  };

  const removeAchievement = (id: number) => {
    if (!data) return;
    setData({ ...data, achievements: data.achievements.filter(a => a.id !== id) });
  };

  const updateAchievement = (id: number, field: keyof Achievement, value: string) => {
    if (!data) return;
    setData({
      ...data,
      achievements: data.achievements.map(a => 
        a.id === id ? { ...a, [field]: value } : a
      ),
    });
  };

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is not signed in, Clerk middleware will redirect them to sign in
  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">Please sign in to access the admin panel.</p>
        </div>
      </div>
    );
  }

  // Check if user is authorized (specific email check)
  if (isSignedIn && !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You are not authorized to access this admin panel. Only specific email addresses have admin privileges.
          </p>
          <UserButton afterSignOutUrl="/" />
        </motion.div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'education', label: 'Education', icon: BookOpen },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'skills', label: 'Skills', icon: Code },
    { id: 'achievements', label: 'Achievements & Certificates', icon: Award },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex flex-wrap gap-3 justify-between items-center">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Portfolio Admin
            </h1>
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap w-full sm:w-auto">
            <div className="hidden sm:block text-sm text-gray-600 dark:text-gray-400">
              Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress}
            </div>
            <motion.button
              onClick={handleSave}
              disabled={isSaving}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary-dark hover:to-purple-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2"
            >
              <Save size={20} />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </motion.button>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Mobile Tabs */}
          <div className="lg:hidden mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3">
              <nav className="flex gap-2 overflow-x-auto pb-2">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors font-medium ${
                        activeTab === tab.id
                          ? 'bg-primary text-white shadow-md'
                          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                      }`}
                    >
                      <IconComponent size={18} />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block lg:w-64">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary text-white'
                          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                      }`}
                    >
                      <IconComponent size={20} />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-4 p-4 rounded-lg ${
                    message.includes('success')
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {message}
                </motion.div>
              )}

              {activeTab === 'personal' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Personal Information
                  </h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={data.personal.name}
                        onChange={(e) => setData({
                          ...data,
                          personal: { ...data.personal, name: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={data.personal.title}
                        onChange={(e) => setData({
                          ...data,
                          personal: { ...data.personal, title: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={data.personal.location}
                        onChange={(e) => setData({
                          ...data,
                          personal: { ...data.personal, location: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone
                      </label>
                      <input
                        type="text"
                        value={data.personal.phone}
                        onChange={(e) => setData({
                          ...data,
                          personal: { ...data.personal, phone: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={data.personal.email}
                        onChange={(e) => setData({
                          ...data,
                          personal: { ...data.personal, email: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        LinkedIn
                      </label>
                      <input
                        type="text"
                        value={data.personal.linkedin}
                        onChange={(e) => setData({
                          ...data,
                          personal: { ...data.personal, linkedin: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Profile Image
                    </label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      {data.personal.image && (
                        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300">
                          {data.personal.image.includes('cloudinary.com') || data.personal.image.includes('res.cloudinary.com') ? (
                            <CldImage
                              src={data.personal.image}
                              alt="Profile"
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <img
                              src={data.personal.image}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      )}
                      <CldUploadWidget
                        uploadPreset="portfolio_uploads"
                        onSuccess={(result) => handleImageUpload(result.info, 'profileImage')}
                        onError={(error) => {
                          console.error('Upload error:', error);
                          setMessage('Failed to upload image. Please check your Cloudinary settings.');
                        }}
                        options={{
                          maxFiles: 1,
                          resourceType: 'image',
                          clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
                          maxImageWidth: 800,
                          maxImageHeight: 800,
                          folder: 'portfolio'
                        }}
                      >
                        {({ open }) => (
                          <motion.button
                            type="button"
                            onClick={() => open()}
                            whileHover={{ scale: 1.05 }}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                          >
                            <Upload size={20} />
                            Upload Photo
                          </motion.button>
                        )}
                      </CldUploadWidget>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Personal Statement
                    </label>
                    <textarea
                      value={data.personalStatement}
                      onChange={(e) => setData({ ...data, personalStatement: e.target.value })}
                      rows={5}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'projects' && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Projects
                    </h2>
                    <motion.button
                      onClick={addProject}
                      whileHover={{ scale: 1.05 }}
                      className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <Plus size={20} />
                      Add Project
                    </motion.button>
                  </div>

                  <div className="space-y-4">
                    {data.projects.map((project) => (
                      <div
                        key={project.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      >
                        <div className="flex flex-col gap-3 mb-4">
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Project Name
                              </label>
                              <input
                                type="text"
                                value={project.name}
                                onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Live Link
                              </label>
                              <input
                                type="text"
                                value={project.liveLink || ''}
                                onChange={(e) => updateProject(project.id, 'liveLink', e.target.value)}
                                placeholder="example.com"
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>
                          
                          <div className="flex justify-end pt-2">
                            <button
                              onClick={() => removeProject(project.id)}
                              className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Description
                          </label>
                          <textarea
                            value={project.description}
                            onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Technologies (comma separated)
                          </label>
                          <input
                            type="text"
                            value={project.technologies.join(', ')}
                            onChange={(e) => updateProject(project.id, 'technologies', e.target.value.split(', ').map(t => t.trim()).filter(t => t))}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`featured-${project.id}`}
                            checked={project.featured}
                            onChange={(e) => updateProject(project.id, 'featured', e.target.checked)}
                            className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
                          />
                          <label htmlFor={`featured-${project.id}`} className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Featured Project
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'achievements' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Achievements & Certificates
                    </h2>
                    <div className="flex gap-2 flex-wrap w-full sm:w-auto">
                      <motion.button
                        onClick={() => {
                          const newAchievement = {
                            id: Date.now(),
                            title: 'New Achievement',
                            description: 'Achievement description',
                            date: new Date().toISOString().split('T')[0],
                            type: 'achievement' as const
                          };
                          setData({ ...data, achievements: [...data.achievements, newAchievement] });
                        }}
                        whileHover={{ scale: 1.05 }}
                        className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 w-full sm:w-auto"
                      >
                        <Plus size={20} />
                        Add Achievement
                      </motion.button>
                      <motion.button
                        onClick={() => {
                          const newCertificate = {
                            id: Date.now() + 1,
                            title: 'New Certificate',
                            description: 'Certificate description',
                            date: new Date().toISOString().split('T')[0],
                            type: 'certificate' as const
                          };
                          setData({ ...data, achievements: [...data.achievements, newCertificate] });
                        }}
                        whileHover={{ scale: 1.05 }}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 w-full sm:w-auto"
                      >
                        <Plus size={20} />
                        Add Certificate
                      </motion.button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {data.achievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`border-2 rounded-lg p-6 ${
                          achievement.type === 'certificate' 
                            ? 'border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/10'
                            : 'border-primary/20 dark:border-primary/30 bg-primary/5 dark:bg-primary/5'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              achievement.type === 'certificate'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100'
                                : 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light'
                            }`}>
                              {achievement.type === 'certificate' ? '🏆 Certificate' : '🥇 Achievement'}
                            </span>
                          </div>
                          
                          <button
                            onClick={() => removeAchievement(achievement.id)}
                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors self-start"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Type
                            </label>
                            <select
                              value={achievement.type || 'achievement'}
                              onChange={(e) => updateAchievement(achievement.id, 'type', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                              <option value="achievement">🥇 Achievement</option>
                              <option value="certificate">🏆 Certificate</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Title
                            </label>
                            <input
                              type="text"
                              value={achievement.title}
                              onChange={(e) => updateAchievement(achievement.id, 'title', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Organization/Issuer
                            </label>
                            <input
                              type="text"
                              value={achievement.organization || ''}
                              onChange={(e) => updateAchievement(achievement.id, 'organization', e.target.value)}
                              placeholder="e.g., Google, Microsoft, Coursera"
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Date Achieved/Issued
                            </label>
                            <input
                              type="date"
                              value={achievement.date}
                              onChange={(e) => updateAchievement(achievement.id, 'date', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                        </div>
                        
                        {achievement.type === 'certificate' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Credential ID
                              </label>
                              <input
                                type="text"
                                value={achievement.credentialId || ''}
                                onChange={(e) => updateAchievement(achievement.id, 'credentialId', e.target.value)}
                                placeholder="e.g., ABC123456"
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Credential URL
                              </label>
                              <input
                                type="url"
                                value={achievement.credentialUrl || ''}
                                onChange={(e) => updateAchievement(achievement.id, 'credentialUrl', e.target.value)}
                                placeholder="https://..."
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Expiry Date (Optional)
                              </label>
                              <input
                                type="date"
                                value={achievement.expiryDate || ''}
                                onChange={(e) => updateAchievement(achievement.id, 'expiryDate', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Description
                          </label>
                          <textarea
                            value={achievement.description}
                            onChange={(e) => updateAchievement(achievement.id, 'description', e.target.value)}
                            rows={3}
                            placeholder="Describe your achievement or certificate details..."
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                    ))}
                    
                    {data.achievements.length === 0 && (
                      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                        <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No achievements or certificates yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Add your achievements and certificates to showcase your accomplishments.
                        </p>
                        <div className="flex gap-2 justify-center flex-wrap">
                          <button
                            onClick={() => {
                              const newAchievement = {
                                id: Date.now(),
                                title: 'New Achievement',
                                description: 'Achievement description',
                                date: new Date().toISOString().split('T')[0],
                                type: 'achievement' as const
                              };
                              setData({ ...data, achievements: [...data.achievements, newAchievement] });
                            }}
                            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm w-full sm:w-auto"
                          >
                            Add Achievement
                          </button>
                          <button
                            onClick={() => {
                              const newCertificate = {
                                id: Date.now() + 1,
                                title: 'New Certificate',
                                description: 'Certificate description',
                                date: new Date().toISOString().split('T')[0],
                                type: 'certificate' as const
                              };
                              setData({ ...data, achievements: [...data.achievements, newCertificate] });
                            }}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm"
                          >
                            Add Certificate
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'education' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Education
                    </h2>
                    <motion.button
                      onClick={addEducation}
                      whileHover={{ scale: 1.05 }}
                      className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <Plus size={20} />
                      Add Education
                    </motion.button>
                  </div>

                  <div className="space-y-4">
                    {data.education.map((education) => (
                      <div
                        key={education.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                          <div className="grid grid-cols-1 gap-4 flex-1">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Institution
                              </label>
                              <input
                                type="text"
                                value={education.institution}
                                onChange={(e) => updateEducation(education.id, 'institution', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Degree
                              </label>
                              <input
                                type="text"
                                value={education.degree}
                                onChange={(e) => updateEducation(education.id, 'degree', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Location
                              </label>
                              <input
                                type="text"
                                value={education.location}
                                onChange={(e) => updateEducation(education.id, 'location', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Period
                              </label>
                              <input
                                type="text"
                                value={education.period}
                                onChange={(e) => updateEducation(education.id, 'period', e.target.value)}
                                placeholder="2022 - 2025"
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                CGPA/Percentage (Optional)
                              </label>
                              <input
                                type="text"
                                value={education.cgpa || education.percentage || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value.includes('%')) {
                                    // Clear cgpa and set percentage
                                    setData({
                                      ...data,
                                      education: data.education.map(e => 
                                        e.id === education.id ? { ...e, percentage: value, cgpa: undefined } : e
                                      ),
                                    });
                                  } else {
                                    // Clear percentage and set cgpa
                                    setData({
                                      ...data,
                                      education: data.education.map(e => 
                                        e.id === education.id ? { ...e, cgpa: value, percentage: undefined } : e
                                      ),
                                    });
                                  }
                                }}
                                placeholder="8.62 or 75.83%"
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>
                          
                          <div className="flex justify-end sm:justify-start">
                            <button
                              onClick={() => removeEducation(education.id)}
                              className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'skills' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Skills Management
                  </h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    {/* Technical Skills */}
                    <div className="space-y-6">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Technical Skills</h3>
                      
                      {Object.entries(data.skills).map(([category, skills]) => (
                        <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3 capitalize">
                            {category.replace(/([A-Z])/g, ' $1').trim()}
                          </h4>
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Skills (comma separated)
                            </label>
                            <textarea
                              value={skills.join(', ')}
                              onChange={(e) => {
                                const newSkills = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                                setData({
                                  ...data,
                                  skills: {
                                    ...data.skills,
                                    [category]: newSkills
                                  }
                                });
                              }}
                              rows={3}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Soft Skills */}
                    <div className="space-y-6">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Soft Skills</h3>
                      
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Soft Skills (comma separated)
                        </label>
                        <textarea
                          value={data.softSkills.join(', ')}
                          onChange={(e) => {
                            const newSoftSkills = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                            setData({ ...data, softSkills: newSoftSkills });
                          }}
                          rows={3}
                          placeholder="Time Management, Team Player, Fast Learner"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Hobbies (comma separated)
                        </label>
                        <textarea
                          value={data.hobbies.join(', ')}
                          onChange={(e) => {
                            const newHobbies = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                            setData({ ...data, hobbies: newHobbies });
                          }}
                          rows={2}
                          placeholder="Website Development, Developing Android Apps"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
