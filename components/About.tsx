'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { User, Target, Code, Lightbulb } from 'lucide-react';

const About = () => {
  const [personalStatement, setPersonalStatement] = useState('');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/portfolio');
        const data = await response.json();
        setPersonalStatement(data.personalStatement);
      } catch (error) {
        console.error('Failed to fetch personal statement:', error);
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

  const highlights = [
    {
      icon: User,
      title: "Quick Learner",
      description: "Rapidly adapt to new technologies and frameworks"
    },
    {
      icon: Target,
      title: "Goal-Oriented",
      description: "Focused on delivering efficient, user-friendly applications"
    },
    {
      icon: Code,
      title: "Full-Stack Skills",
      description: "Proficient in both frontend and backend development"
    },
    {
      icon: Lightbulb,
      title: "Problem Solver",
      description: "Passionate about leveraging technology for real-world solutions"
    }
  ];

  return (
    <section ref={ref} id="about" className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
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
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Me</span>
          </motion.h2>
          
          <motion.div 
            variants={itemVariants}
            className="w-24 h-1 bg-gradient-to-r from-primary to-purple-600 mx-auto mb-12 rounded-full"
          />
          
          <div className="max-w-4xl mx-auto">
            <motion.div 
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 mb-12"
            >
              <motion.p 
                variants={itemVariants}
                className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed text-center"
              >
                {personalStatement || "Loading..."}
              </motion.p>
            </motion.div>
            
            <motion.div 
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {highlights.map((highlight, index) => {
                const IconComponent = highlight.icon;
                return (
                  <motion.div
                    key={index}
                    variants={cardVariants}
                    whileHover={{ 
                      scale: 1.05,
                      transition: { duration: 0.2 }
                    }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 text-center hover:shadow-xl transition-shadow duration-300"
                  >
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-xl mb-4"
                    >
                      <IconComponent size={24} className="text-primary" />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {highlight.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {highlight.description}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;