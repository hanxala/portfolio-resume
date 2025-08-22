const About = () => {
  return (
    <section id="about" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          About <span className="text-primary">Me</span>
        </h2>
        
        <div className="max-w-3xl mx-auto">
          <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg">
            I am a motivated and enthusiastic fresher with a Bachelor's degree in Information Technology from K.P.B Hinduja College, Mumbai University. My passion lies in Android app development and full-stack technologies, with a strong foundation in Kotlin, Firebase, and web development.
          </p>
          
          <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg">
            During my academic journey, I developed an Android application using Kotlin and Firebase that allows students to participate in quizzes and coding competitions. This project helped me gain practical experience in mobile app development, user authentication, and real-time database management.
          </p>
          
          <p className="text-gray-700 dark:text-gray-300 text-lg">
            I am known for quick learning, time management, and collaborative teamwork. I am eager to begin my professional career as a Software or Android Developer where I can apply my technical skills and continue to grow as a developer.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;