import { Users, Send, Mail, Eye, ShoppingCart } from 'lucide-react';
import { KPIStatCard } from './KPIStatCard';
import { useDashboardStore } from '../../store/useDashboardStore';

export function KPISection() {
  const { stats, campaigns, analytics } = useDashboardStore();

  const formatLakhs = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const opened = analytics?.summary?.opened || 0;
  const delivered = analytics?.summary?.delivered || 0;
  const purchased = analytics?.summary?.purchased || 0;
  const openRate = delivered > 0 ? ((opened / delivered) * 100).toFixed(1) : '0.0';

  const kpiData = [
    {
      label: 'Total Customers',
      value: stats.totalCustomers.toLocaleString('en-IN'),
      isLoading: stats.isLoading,
      icon: Users,
      iconBgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      label: 'Campaigns Sent',
      value: campaigns.list.length.toString(),
      isLoading: campaigns.isLoading,
      icon: Send,
      iconBgColor: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      label: 'Revenue Generated',
      value: formatLakhs(stats.totalRevenue),
      isLoading: stats.isLoading,
      icon: Mail,
      iconBgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Avg Open Rate',
      value: `${openRate}%`,
      isLoading: !analytics,
      icon: Eye,
      iconBgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
    {
      label: 'Conversions',
      value: purchased.toLocaleString('en-IN'),
      isLoading: !analytics,
      icon: ShoppingCart,
      iconBgColor: 'bg-pink-100',
      iconColor: 'text-pink-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {kpiData.map((kpi, index) => (
        <KPIStatCard key={index} {...kpi} />
      ))}
    </div>
  );
}
