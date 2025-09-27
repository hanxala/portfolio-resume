'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';
import { Project } from '@/lib/portfolio-data';
import { ExternalLink, Github, Star } from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/portfolio');
        const data = await response.json();
        setProjects(data.projects);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      }
    };
    fetchData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const cardVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1 }
  };

  return (
    <section ref={ref} id="projects" className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <motion.h2 
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900 dark:text-white"
          >
            My <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Projects</span>
          </motion.h2>
          
          <motion.div 
            variants={itemVariants}
            className="w-24 h-1 bg-gradient-to-r from-primary to-purple-600 mx-auto mb-12 rounded-full"
          />
          
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {projects.map((project) => (
              <motion.div 
                key={project.id}
                variants={cardVariants}
                whileHover={{ 
                  y: -10,
                  transition: { duration: 0.2 }
                }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 group"
              >
                <div className="relative h-48 w-full bg-gradient-to-br from-primary/5 to-purple-500/5 overflow-hidden">
                  {project.featured && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Star size={12} fill="currentColor" />
                        Featured
                      </div>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-6xl font-bold text-primary/20 dark:text-white/10">
                      {project.name.charAt(0)}
                    </div>
                  </div>
                  
                  <motion.div 
                    className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"
                    whileHover={{
                      backgroundColor: 'rgba(0,0,0,0.1)'
                    }}
                  />
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    {project.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.map((tech, index) => (
                      <motion.span 
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        className="bg-gradient-to-r from-primary/10 to-purple-500/10 text-primary dark:text-purple-400 px-3 py-1 rounded-full text-sm font-medium border border-primary/20"
                      >
                        {tech}
                      </motion.span>
                    ))}
                  </div>
                  
                  <div className="flex gap-3">
                    {project.liveLink && (
                      <motion.a
                        href={`https://${project.liveLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors text-sm font-medium"
                        whileHover={{ x: 5 }}
                      >
                        <ExternalLink size={16} />
                        Live Demo
                      </motion.a>
                    )}
                    {project.githubLink && (
                      <motion.a
                        href={project.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors text-sm font-medium"
                        whileHover={{ x: 5 }}
                      >
                        <Github size={16} />
                        Code
                      </motion.a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          {projects.length === 0 && (
            <motion.div 
              variants={itemVariants}
              className="text-center py-12"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading projects...</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;
