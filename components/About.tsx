const About = () => {
  return (
    <section id="about" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          About <span className="text-primary">Me</span>
        </h2>
        
        <div className="max-w-3xl mx-auto">
          <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg">
            I am a motivated and detail-oriented Bachelor of Science in Information Technology graduate with strong foundations in software development and mobile app design. Seeking an opportunity as a Software Developer or Android App Developer to apply my skills in Next.js, React, Node.js, Python, and Kotlin for building efficient and user-friendly applications.
          </p>
          
          <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg">
            During my academic journey, I developed an e-commerce website with product listing, shopping cart, and authentication features. I also designed and deployed a responsive personal portfolio website to showcase my projects and technical skills.
          </p>
          
          <p className="text-gray-700 dark:text-gray-300 text-lg">
            I am known for being a quick learner, team player, and fast learner. I am passionate about leveraging technology to solve real-world problems and eager to begin my professional career where I can apply my technical skills and continue to grow as a developer.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;