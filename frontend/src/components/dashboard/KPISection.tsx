import { Users, Send, Mail, Eye, ShoppingCart } from 'lucide-react';
import { KPIStatCard } from './KPIStatCard';
import { useDashboardStore } from '../../store/useDashboardStore';

export function KPISection() {
  const { stats, campaigns } = useDashboardStore();

  const formatLakhs = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  // Conversions are roughly estimated from revenue for the demo, since event tracking isn't implemented
  const estimatedConversions = Math.floor(stats.totalRevenue / 3800);

  const kpiData = [
    {
      label: 'Total Customers',
      value: stats.totalCustomers.toLocaleString('en-IN'),
      isLoading: stats.isLoading,
      growth: '+8.4%',
      icon: Users,
      iconBgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      label: 'Campaigns Sent',
      value: campaigns.list.length.toString(),
      isLoading: campaigns.isLoading,
      growth: '+2',
      icon: Send,
      iconBgColor: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      label: 'Revenue Generated',
      value: formatLakhs(stats.totalRevenue),
      isLoading: stats.isLoading,
      growth: '+16.7%',
      icon: Mail,
      iconBgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Avg Open Rate',
      value: '42.6%', // Note: Needs tracking pixel implementation in real app
      isLoading: campaigns.isLoading,
      growth: '+6.3%',
      icon: Eye,
      iconBgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
    {
      label: 'Conversions',
      value: estimatedConversions.toLocaleString('en-IN'),
      isLoading: stats.isLoading,
      growth: '+11.2%',
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
