'use client';

import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useInView } from 'framer-motion';
import { Achievement } from '@/lib/portfolio-data';
import { Award, Calendar, ExternalLink, Building, CreditCard, Clock } from 'lucide-react';

interface AchievementsClientProps {
  achievements: Achievement[];
}

const AchievementsClient = ({ achievements }: AchievementsClientProps) => {
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

  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: { scale: 1, opacity: 1 }
  };

  // Separate achievements and certificates
  const achievementsList = achievements.filter(item => item.type !== 'certificate');
  const certificatesList = achievements.filter(item => item.type === 'certificate');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long'
    });
  };

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const sixMonthsFromNow = new Date(now.setMonth(now.getMonth() + 6));
    return expiry <= sixMonthsFromNow;
  };

  return (
    <section ref={ref} id="achievements" className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
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
            Achievements & <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Certificates</span>
          </motion.h2>
          
          <motion.div 
            variants={itemVariants}
            className="w-24 h-1 bg-gradient-to-r from-primary to-purple-600 mx-auto mb-16 rounded-full"
          />

          {/* Achievements Section */}
          {achievementsList.length > 0 && (
            <motion.div variants={containerVariants} className="mb-16">
              <motion.h3 
                variants={itemVariants}
                className="text-2xl font-bold mb-8 text-center text-gray-800 dark:text-gray-200 flex items-center justify-center gap-2"
              >
                <Award className="text-primary" size={28} />
                Achievements
              </motion.h3>
              
              <motion.div 
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {achievementsList.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    variants={cardVariants}
                    whileHover={{ 
                      y: -5,
                      transition: { duration: 0.2 }
                    }}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-primary/20 dark:border-primary/30 hover:shadow-xl transition-shadow duration-300 group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-xl flex items-center justify-center group-hover:from-primary/20 group-hover:to-purple-500/20 transition-colors">
                        <Award size={24} className="text-primary" />
                      </div>
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
                        🥇 Achievement
                      </span>
                    </div>

                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                      {achievement.title}
                    </h4>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">
                      {achievement.description}
                    </p>

                    <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-primary" />
                        {formatDate(achievement.date)}
                      </div>
                      
                      {achievement.organization && (
                        <div className="flex items-center gap-2">
                          <Building size={16} className="text-primary" />
                          {achievement.organization}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* Certificates Section */}
          {certificatesList.length > 0 && (
            <motion.div variants={containerVariants}>
              <motion.h3 
                variants={itemVariants}
                className="text-2xl font-bold mb-8 text-center text-gray-800 dark:text-gray-200 flex items-center justify-center gap-2"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  🏆
                </div>
                Certificates
              </motion.h3>
              
              <motion.div 
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {certificatesList.map((certificate, index) => (
                  <motion.div
                    key={certificate.id}
                    variants={cardVariants}
                    whileHover={{ 
                      y: -5,
                      transition: { duration: 0.2 }
                    }}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-purple-200 dark:border-purple-700 hover:shadow-xl transition-shadow duration-300 group relative overflow-hidden"
                  >
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-3xl"></div>
                    
                    <div className="flex items-start justify-between mb-4 relative z-10">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500/10 to-purple-600/20 rounded-xl flex items-center justify-center group-hover:from-purple-500/20 group-hover:to-purple-600/30 transition-colors">
                        🏆
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100 px-3 py-1 rounded-full text-xs font-medium">
                          Certificate
                        </span>
                        {certificate.expiryDate && isExpiringSoon(certificate.expiryDate) && (
                          <span className="bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            <Clock size={10} />
                            Expiring Soon
                          </span>
                        )}
                      </div>
                    </div>

                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 transition-colors relative z-10">
                      {certificate.title}
                    </h4>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed relative z-10">
                      {certificate.description}
                    </p>

                    <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 relative z-10">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-purple-600" />
                        Issued: {formatDate(certificate.date)}
                      </div>
                      
                      {certificate.organization && (
                        <div className="flex items-center gap-2">
                          <Building size={16} className="text-purple-600" />
                          {certificate.organization}
                        </div>
                      )}

                      {certificate.credentialId && (
                        <div className="flex items-center gap-2">
                          <CreditCard size={16} className="text-purple-600" />
                          ID: {certificate.credentialId}
                        </div>
                      )}

                      {certificate.expiryDate && (
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-purple-600" />
                          Expires: {formatDate(certificate.expiryDate)}
                        </div>
                      )}

                      {certificate.credentialUrl && (
                        <motion.a
                          href={certificate.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium mt-2"
                          whileHover={{ x: 3 }}
                        >
                          <ExternalLink size={16} />
                          View Certificate
                        </motion.a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* Empty state - this won't show since we return null if no achievements */}
        </motion.div>
      </div>
    </section>
  );
};

export default AchievementsClient;
