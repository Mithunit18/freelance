import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  iconColor?: string;
  badge?: {
    text: string;
    color: string;
  };
}

export default function StatCard({ icon: Icon, value, label, iconColor = 'text-primary', badge }: StatCardProps) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-8 h-8 ${iconColor}`} />
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <p className="text-gray-400">{label}</p>
      {badge && (
        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm ${badge.color}`}>
          {badge.text}
        </span>
      )}
    </div>
  );
}
