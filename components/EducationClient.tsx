'use client';

import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useInView } from 'framer-motion';
import { Education as EducationType } from '@/lib/portfolio-data';
import { GraduationCap } from 'lucide-react';

interface EducationClientProps {
  educationHistory: EducationType[];
}

const EducationClient = ({ educationHistory }: EducationClientProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

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

  return (
    <section ref={ref} id="education" className="py-20 bg-gray-50 dark:bg-gray-800">
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
            My <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Education</span>
          </motion.h2>
          
          <motion.div 
            variants={itemVariants}
            className="w-24 h-1 bg-gradient-to-r from-primary to-purple-600 mx-auto mb-12 rounded-full"
          />
        
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 h-full w-1 bg-primary"></div>
            
            {/* Education Items */}
            {educationHistory.map((item, index) => (
              <motion.div 
                key={item.id}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className={`relative mb-12 md:mb-0 md:pb-12 ${index % 2 === 0 ? 'md:text-right md:pr-12 md:mr-auto md:ml-0 md:w-1/2' : 'md:text-left md:pl-12 md:ml-auto md:mr-0 md:w-1/2 md:mt-24'}`}
              >
                {/* Timeline Dot */}
                <motion.div 
                  whileHover={{ scale: 1.2 }}
                  className="absolute left-0 md:left-1/2 transform -translate-x-1/2 -translate-y-1/4 w-6 h-6 rounded-full bg-primary border-4 border-white dark:border-gray-800 flex items-center justify-center"
                >
                  <GraduationCap size={12} className="text-white" />
                </motion.div>
                
                {/* Content */}
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="ml-8 md:ml-0 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="inline-block bg-gradient-to-r from-primary/10 to-purple-500/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-3">
                    {item.period}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.degree}</h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-2 font-medium">{item.institution}</p>
                  <p className="text-gray-600 dark:text-gray-400">{item.location}</p>
                  {(item.cgpa || item.percentage) && (
                    <div className="mt-3 inline-block bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                      {item.cgpa ? `CGPA: ${item.cgpa}` : `Percentage: ${item.percentage}`}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
        </motion.div>
      </div>
    </section>
  );
};

export default EducationClient;
