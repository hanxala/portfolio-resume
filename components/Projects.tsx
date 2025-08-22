import Image from 'next/image';

const Projects = () => {
  const projects = [
    {
      id: 1,
      title: 'Exam Elite - Student Competition App',
      description: 'Developed an Android application using Kotlin and Firebase that allows students to participate in quizzes and coding competitions. Features include authentication, competition lists, and real-time leaderboard functionality.',
      image: '/projects/exam-elite.svg',
      technologies: ['Kotlin', 'Firebase', 'Android Studio'],
    },
    {
      id: 2,
      title: 'Personal Portfolio Website',
      description: 'Designed and developed a responsive personal portfolio website using Next.js and Tailwind CSS to showcase my projects and skills.',
      image: '/projects/portfolio.svg',
      technologies: ['Next.js', 'React', 'Tailwind CSS', 'TypeScript'],
    },
    {
      id: 3,
      title: 'Task Manager Application',
      description: 'Created a task management web application with features like task creation, deadline setting, priority levels, and progress tracking.',
      image: '/projects/task-manager.svg',
      technologies: ['HTML', 'CSS', 'JavaScript', 'LocalStorage API'],
    },
  ];

  return (
    <section id="projects" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          My <span className="text-primary">Projects</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div 
              key={project.id} 
              className="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden transition-transform hover:scale-105 hover:shadow-lg"
            >
              <div className="relative h-48 w-full bg-gray-200 dark:bg-gray-700">
                <Image 
                  src={project.image} 
                  alt={project.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{project.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, index) => (
                    <span 
                      key={index} 
                      className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;