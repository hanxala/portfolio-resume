'use client';

import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useInView } from 'framer-motion';
import { Skills as SkillsType } from '@/lib/portfolio-data';
import { CheckCircle, Code, Database, GitBranch, Smartphone } from 'lucide-react';

interface SkillsClientProps {
  skillsData: SkillsType;
  softSkills: string[];
}

const SkillsClient = ({ skillsData, softSkills }: SkillsClientProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const skillVariants = {
    hidden: { width: 0 },
    visible: (level: number) => ({ width: `${level}%` })
  };

  const getSkillLevel = (skill: string): number => {
    const skillLevels: { [key: string]: number } = {
      'Next.js': 85,
      'React': 85,
      'HTML': 90,
      'CSS': 85,
      'JavaScript': 80,
      'Node.js': 75,
      'MongoDB': 70,
      'Firebase': 75,
      'Git': 80,
      'GitHub': 80,
      'Python': 70,
      'Kotlin (Android Studio)': 75,
      'Kotlin': 75
    };
    return skillLevels[skill] || 70;
  };

  const getSkillIcon = (category: string) => {
    switch (category) {
      case 'frontend':
        return Code;
      case 'backend':
        return Database;
      case 'versionControl':
        return GitBranch;
      case 'programming':
        return Smartphone;
      default:
        return Code;
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'frontend':
        return 'Frontend';
      case 'backend':
        return 'Backend';
      case 'versionControl':
        return 'Version Control';
      case 'programming':
        return 'Programming';
      default:
        return category;
    }
  };

  return (
    <section ref={ref} id="skills" className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
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
            My <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Skills</span>
          </motion.h2>
          
          <motion.div 
            variants={itemVariants}
            className="w-24 h-1 bg-gradient-to-r from-primary to-purple-600 mx-auto mb-16 rounded-full"
          />
          
          {/* Technical Skills */}
          <motion.div 
            variants={containerVariants}
            className="mb-16"
          >
            <motion.h3 
              variants={itemVariants}
              className="text-2xl font-bold mb-8 text-center text-gray-800 dark:text-gray-200"
            >
              Technical Skills
            </motion.h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {Object.entries(skillsData).map(([category, skills]) => {
                const IconComponent = getSkillIcon(category);
                return (
                  <motion.div
                    key={category}
                    variants={itemVariants}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-xl flex items-center justify-center mr-3">
                        <IconComponent size={20} className="text-primary" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {getCategoryTitle(category)}
                      </h4>
                    </div>
                    
                    <div className="space-y-4">
                      {skills.map((skill: string, index: number) => {
                        const level = getSkillLevel(skill);
                        return (
                          <div key={index}>
                            <div className="flex justify-between mb-2">
                              <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                                {skill}
                              </span>
                              <span className="text-primary font-semibold text-sm">
                                {level}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                              <motion.div 
                                className="bg-gradient-to-r from-primary to-purple-600 h-2 rounded-full"
                                variants={skillVariants}
                                custom={level}
                                initial="hidden"
                                animate={isInView ? "visible" : "hidden"}
                                transition={{ duration: 1.2, delay: 0.2 }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
          
          {/* Soft Skills */}
          <motion.div variants={containerVariants}>
            <motion.h3 
              variants={itemVariants}
              className="text-2xl font-bold mb-8 text-center text-gray-800 dark:text-gray-200"
            >
              Soft Skills
            </motion.h3>
            
            <motion.div 
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto"
            >
              {softSkills.map((skill: string, index: number) => (
                <motion.div 
                  key={index}
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.05,
                    transition: { duration: 0.2 }
                  }}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 flex items-center justify-center group hover:shadow-xl transition-shadow duration-300"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <CheckCircle 
                      size={24} 
                      className="text-primary mr-3 group-hover:text-purple-600 transition-colors" 
                    />
                  </motion.div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium text-center">
                    {skill}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default SkillsClient;
