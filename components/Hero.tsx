'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { PersonalInfo } from '@/lib/portfolio-data';
import { Download, Mail, MapPin, Phone } from 'lucide-react';
import { CldImage } from 'next-cloudinary';

const Hero = () => {
  const [personalData, setPersonalData] = useState<PersonalInfo | null>(null);
  const [personalStatement, setPersonalStatement] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/portfolio');
        const data = await response.json();
        setPersonalData(data.personal);
        setPersonalStatement(data.personalStatement);
      } catch (error) {
        console.error('Failed to fetch personal data:', error);
      }
    };
    fetchData();
  }, []);

  if (!personalData) {
    return (
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </section>
    );
  }

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
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const imageVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { scale: 1, opacity: 1 }
  };

  const floatingAnimation = {
    y: [-10, 10, -10],
    transition: {
      duration: 3,
      repeat: Infinity
    }
  };

  return (
    <section id="hero" className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
        />
      </div>

      <motion.div 
        className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="md:w-1/2 mb-10 md:mb-0">
          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Hi, I&apos;m{' '}
            <motion.span 
              className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600"
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {personalData.name}
            </motion.span>
          </motion.h1>
          
          <motion.h2 
            variants={itemVariants}
            className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-6 font-medium"
          >
            {personalData.title}
          </motion.h2>
          
          <motion.div 
            variants={itemVariants}
            className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600 dark:text-gray-400"
          >
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-primary" />
              {personalData.location}
            </div>
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-primary" />
              {personalData.phone}
            </div>
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-primary" />
              {personalData.email}
            </div>
          </motion.div>
          
          <motion.p 
            variants={itemVariants}
            className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg leading-relaxed"
          >
            {personalStatement}
          </motion.p>
          
          <motion.div 
            variants={itemVariants}
            className="flex flex-wrap gap-4"
          >
            <motion.a 
              href="/Hanzala_Khan_Resume.pdf" 
              download
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary-dark hover:to-purple-700 text-white font-medium py-3 px-6 rounded-full transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download size={20} className="mr-2" />
              Download Resume
            </motion.a>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                href="#contact" 
                className="border-2 border-primary text-primary hover:bg-primary hover:text-white dark:text-white font-medium py-3 px-6 rounded-full transition-all duration-300 flex items-center hover:shadow-lg transform hover:-translate-y-1"
              >
                <Mail size={20} className="mr-2" />
                Contact Me
              </Link>
            </motion.div>
          </motion.div>
        </div>
        
        <motion.div 
          className="md:w-1/2 flex justify-center"
          variants={imageVariants}
        >
          <motion.div 
            className="relative w-64 h-64 md:w-80 md:h-80"
            animate={floatingAnimation}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full animate-pulse"></div>
            <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-2xl bg-gradient-to-br from-primary/10 to-purple-500/10">
              {personalData.image.includes('cloudinary.com') || personalData.image.includes('res.cloudinary.com') ? (
                <CldImage 
                  src={personalData.image} 
                  alt={personalData.name} 
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                  priority
                />
              ) : (
                <Image 
                  src={personalData.image} 
                  alt={personalData.name} 
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                  priority
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;