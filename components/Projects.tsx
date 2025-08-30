import Image from 'next/image';

const Projects = () => {
  const projects = [
    {
      id: 1,
      title: 'Gotcha (E-Commerce Website)',
      description: 'Developed a full-fledged e-commerce platform with product listing, shopping cart, and authentication features.',
      image: '/projects/exam-elite.svg',
      technologies: ['Next.js', 'React', 'Node.js', 'MongoDB'],
    },
    {
      id: 2,
      title: 'Portfolio Website',
      description: 'Designed and deployed a responsive personal portfolio website to showcase projects and technical skills.',
      image: '/projects/portfolio.svg',
      technologies: ['Next.js', 'React', 'Tailwind CSS', 'TypeScript'],
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