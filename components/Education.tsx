import { getPortfolioData } from '@/lib/portfolio-data';
import EducationClient from './EducationClient';

const Education = async () => {
  // Get data server-side
  const data = await getPortfolioData();
  const educationHistory = data.education || [];

  // Only show section if there are education entries
  if (!educationHistory || educationHistory.length === 0) {
    return null;
  }

  return (
    <EducationClient educationHistory={educationHistory} />
  );
};

export default Education;
