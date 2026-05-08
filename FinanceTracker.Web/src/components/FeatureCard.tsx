import type { ReactNode } from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon }) => {
  return (
    <div className="max-w-sm p-6 bg-dark-900 border border-dark-800 rounded-2xl shadow hover:shadow-lg hover:border-primary-500/50 transition-all duration-300 group">
      <div className="w-12 h-12 rounded-xl bg-dark-800 text-primary-400 flex items-center justify-center mb-4 group-hover:bg-primary-500/20 group-hover:text-primary-300 transition-colors">
        {icon}
      </div>
      <a href="#">
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-white">{title}</h5>
      </a>
      <p className="mb-3 font-normal text-dark-400">{description}</p>
    </div>
  );
};

export default FeatureCard;
