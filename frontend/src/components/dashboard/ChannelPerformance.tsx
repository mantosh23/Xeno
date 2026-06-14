import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useAnalyticsStore } from '../../features/dashboard/hooks/useAnalyticsStore';
import { useNavigate } from 'react-router-dom';

const CHANNEL_COLORS: Record<string, string> = {
  WhatsApp: '#10B981',
  Instagram: '#E1306C',
  Facebook: '#1877F2',
  Email: '#3B82F6',
  SMS: '#EF4444'
};

/**
 * ChannelPerformance Component
 * 
 * @returns {JSX.Element}
 */
export function ChannelPerformance() {
  const analytics = useAnalyticsStore((s) => s.analytics);
  const navigate = useNavigate();
  const isLoading = useAnalyticsStore((s) => s.isLoading);
  
  let data: any[] = [];
  if (analytics?.channelBreakdown) {
    const breakdown = analytics.channelBreakdown;
    let totalMetric = 0;
    
    // Use delivered if sent is 0 (happens if webhooks skip 'sent' state)
    Object.values(breakdown).forEach((ch: any) => {
      totalMetric += Math.max(ch.sent, ch.delivered, 0);
    });
    
    data = Object.keys(breakdown).map((channel) => {
      const metric = Math.max(breakdown[channel].sent, breakdown[channel].delivered, 0);
      const percentage = totalMetric > 0 ? Math.round((metric / totalMetric) * 100) : 0;
      return {
        name: channel,
        value: percentage,
        color: CHANNEL_COLORS[channel] || '#8B5CF6'
      };
    }).sort((a, b) => b.value - a.value);
  }
  return (
    <Card className="flex flex-col h-full w-full">
      <CardHeader>
        <CardTitle>Channel Performance</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center pt-0">
        <div className="flex flex-row flex-wrap w-full items-center justify-center gap-x-6 gap-y-2">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-row flex-wrap w-full items-center justify-center gap-x-6 gap-y-2"
              >
                <div className="h-[120px] w-[120px] relative flex-shrink-0 skeleton rounded-full" />
                <div className="flex flex-col gap-3 min-w-[130px]">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-[3px] skeleton" />
                      <div className="h-4 w-16 skeleton rounded" />
                      <div className="h-4 w-8 skeleton rounded ml-auto" />
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="chart"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-row flex-wrap w-full items-center justify-center gap-x-6 gap-y-2"
              >
                {data.length > 0 ? (
                  <>
                    <div className="h-[120px] w-[120px] relative flex-shrink-0">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <PieChart>
                          <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={35}
                            outerRadius={55}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                            isAnimationActive={true}
                            animationDuration={1500}
                            animationEasing="ease-in-out"
                          >
                            {data.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                            itemStyle={{ color: '#111827', fontWeight: 600 }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="flex flex-col gap-2 min-w-[130px]">
                      {data.map((item) => (
                        <div key={item.name} className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-[3px] flex-shrink-0" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-[13px] font-medium text-gray-700">{item.name}</span>
                          <span className="text-[13px] font-bold text-gray-900 ml-auto">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[120px] w-full bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                    <p className="text-sm font-medium text-gray-400">No channel data available</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
      <div className="border-t border-gray-100 p-4 flex justify-center mt-auto">
        <button onClick={() => navigate('/campaigns')} className="text-sm font-semibold text-[#0f62fe] flex items-center gap-2 hover:opacity-80 transition-opacity">
          View Channel Report <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}
