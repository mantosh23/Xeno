import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { CheckCircle2, Eye, ShoppingCart, UserPlus } from 'lucide-react';

const activities = [
  {
    icon: CheckCircle2,
    title: 'Campaign "Summer Revival" launched',
    time: '2 hours ago',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    icon: Eye,
    title: 'WhatsApp campaign opened by 1,380 users',
    time: '3 hours ago',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
  {
    icon: ShoppingCart,
    title: '102 conversions recorded',
    time: '4 hours ago',
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
  },
  {
    icon: UserPlus,
    title: 'New audience created: Dormant High Value',
    time: '1 day ago',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
];

import { useDashboardStore } from '../../store/useDashboardStore';

export function RecentActivity() {
  const { stats } = useDashboardStore();
  const isLoading = stats.isLoading;

  return (
    <Card className="flex flex-col h-full w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-0">
        <CardTitle>Recent Activity</CardTitle>
        <button className="text-sm font-semibold text-[#0f62fe] hover:opacity-80 transition-opacity">
          View All
        </button>
      </CardHeader>
      <CardContent className="flex-1 pt-0 pb-2">
        <div className="flex flex-col divide-y divide-gray-50">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-start gap-3 py-2">
                <div className="h-9 w-9 flex-shrink-0 rounded-[10px] skeleton" />
                <div className="flex flex-col flex-1 gap-2 mt-1">
                  <div className="h-3 w-3/4 skeleton rounded" />
                  <div className="h-2 w-1/4 skeleton rounded" />
                </div>
              </div>
            ))
          ) : (
            activities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className="flex items-start gap-3 py-2">
                  <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] ${activity.iconBg}`}>
                    <Icon className={`h-4 w-4 ${activity.iconColor}`} />
                  </div>
                  <div className="flex flex-col -mt-0.5">
                    <p className="text-[12px] font-semibold text-gray-900 leading-tight">
                      {activity.title}
                    </p>
                    <p className="text-[9px] font-medium text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
