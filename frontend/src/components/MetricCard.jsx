import { TrendingUp } from 'lucide-react';
import { AreaChart, Area } from 'recharts';

const MetricCard = ({ title, value, change, icon, chart, isNegative = false }) => (
  <div className="bg-[#1F2937] rounded-xl p-6">
    <div className="flex justify-between items-start mb-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <h3 className="text-gray-400 text-sm">{title}</h3>
        </div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
      <span className={`flex items-center text-sm ${
        isNegative ? "text-red-400" : "text-green-400"
      }`}>
        <TrendingUp className={`w-4 h-4 mr-1 ${isNegative ? "transform rotate-180" : ""}`} />
        {change}
      </span>
    </div>
    {chart}
  </div>
);

export default MetricCard;