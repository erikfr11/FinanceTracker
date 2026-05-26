import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  color?: 'green' | 'red' | 'blue' | 'yellow';
}

const colorMap = {
  green: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
  red: 'from-red-500/20 to-red-500/5 border-red-500/30',
  blue: 'from-primary-500/20 to-primary-500/5 border-primary-500/30',
  yellow: 'from-amber-500/20 to-amber-500/5 border-amber-500/30',
};

const iconBgMap = {
  green: 'bg-emerald-500/20 text-emerald-400',
  red: 'bg-red-500/20 text-red-400',
  blue: 'bg-primary-500/20 text-primary-400',
  yellow: 'bg-amber-500/20 text-amber-400',
};

const KpiCard = ({ title, value, icon, trend, trendLabel, color = 'blue' }: KpiCardProps) => {
  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} border rounded-2xl p-5 transition-all hover:scale-[1.02]`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBgMap[color]}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trendLabel}
          </div>
        )}
      </div>
      <p className="text-sm text-dark-400 mb-1">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
};

export default KpiCard;
