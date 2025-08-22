const Education = () => {
  const educationHistory = [
    {
      id: 1,
      degree: 'B.Sc. in Information Technology',
      institution: 'K.P.B Hinduja College, Mumbai University',
      period: '2022 - 2025',
      grade: 'CGPA: 8.62',
    },
    {
      id: 2,
      degree: 'HSC (12th Grade)',
      institution: 'Akbar Peerbhoy College, Mumbai',
      period: '2021 - 2022',
      grade: 'Percentage: 75.83%',
    },
    {
      id: 3,
      degree: 'SSC (10th Grade)',
      institution: 'Anjuman-I-Islam Allana English High School (I.C.S.E), Mumbai',
      period: '2019 - 2020',
      grade: 'Percentage: 70.60%',
    },
  ];

  return (
    <section id="education" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          My <span className="text-primary">Education</span>
        </h2>
        
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 h-full w-1 bg-primary"></div>
            
            {/* Education Items */}
            {educationHistory.map((item, index) => (
              <div 
                key={item.id} 
                className={`relative mb-12 md:mb-0 md:pb-12 ${index % 2 === 0 ? 'md:text-right md:pr-12 md:mr-auto md:ml-0 md:w-1/2' : 'md:text-left md:pl-12 md:ml-auto md:mr-0 md:w-1/2 md:mt-24'}`}
              >
                {/* Timeline Dot */}
                <div className="absolute left-0 md:left-1/2 transform -translate-x-1/2 -translate-y-1/4 w-6 h-6 rounded-full bg-primary border-4 border-white dark:border-gray-800"></div>
                
                {/* Content */}
                <div className="ml-8 md:ml-0 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
                  <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-2">
                    {item.period}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{item.degree}</h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">{item.institution}</p>
                  <p className="text-gray-600 dark:text-gray-400">{item.grade}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Education;