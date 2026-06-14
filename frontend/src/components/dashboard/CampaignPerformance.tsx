import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { useDashboardStore } from '../../store/useDashboardStore';



export function CampaignPerformance() {
  const { selectedCampaignFilter, analytics } = useDashboardStore();
  const summary = analytics?.summary || { sent: 0, delivered: 0, opened: 0, clicked: 0, purchased: 0 };
  let data = analytics?.chartData || [];
  
  // If there's only 1 day of real data, Recharts will only draw a dot. 
  // Pad it with a previous empty day so it draws a line.
  if (data.length === 1) {
    const singleDate = new Date(data[0].date);
    singleDate.setDate(singleDate.getDate() - 1);
    const prevDateStr = singleDate.toISOString().split('T')[0];
    data = [
      { date: prevDateStr, sent: 0, delivered: 0, opened: 0, clicked: 0, purchased: 0 },
      ...data
    ];
  }
  const isLoading = !analytics;

  return (
    <Card className="flex flex-col h-full w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Campaign Performance</CardTitle>
        <button className="flex items-center gap-1 text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
          {selectedCampaignFilter}
          <ChevronDown className="h-4 w-4" />
        </button>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col pt-0">
        <div className="grid grid-cols-5 divide-x divide-gray-100 w-full mb-2 mt-1 pb-1">
          <div className="text-center px-0.5 sm:px-1">
            <p className="text-[10px] sm:text-[11px] font-medium text-gray-500 mb-0.5">Sent</p>
            {isLoading ? <div className="h-[18px] w-12 skeleton rounded mx-auto mt-0.5" /> : <p className="text-[13px] sm:text-[18px] font-bold text-[#3B82F6] leading-none">{summary.sent.toLocaleString()}</p>}
          </div>
          <div className="text-center px-0.5 sm:px-1">
            <p className="text-[10px] sm:text-[11px] font-medium text-gray-500 mb-0.5">Delivered</p>
            {isLoading ? <div className="h-[18px] w-12 skeleton rounded mx-auto mt-0.5" /> : <p className="text-[13px] sm:text-[18px] font-bold text-[#10B981] leading-none">{summary.delivered.toLocaleString()}</p>}
          </div>
          <div className="text-center px-0.5 sm:px-1">
            <p className="text-[10px] sm:text-[11px] font-medium text-gray-500 mb-0.5">Opened</p>
            {isLoading ? <div className="h-[18px] w-12 skeleton rounded mx-auto mt-0.5" /> : <p className="text-[13px] sm:text-[18px] font-bold text-[#0f62fe] leading-none">{summary.opened.toLocaleString()}</p>}
          </div>
          <div className="text-center px-0.5 sm:px-1">
            <p className="text-[10px] sm:text-[11px] font-medium text-gray-500 mb-0.5">Clicked</p>
            {isLoading ? <div className="h-[18px] w-12 skeleton rounded mx-auto mt-0.5" /> : <p className="text-[13px] sm:text-[18px] font-bold text-[#F59E0B] leading-none">{summary.clicked.toLocaleString()}</p>}
          </div>
          <div className="text-center px-0.5 sm:px-1">
            <p className="text-[10px] sm:text-[11px] font-medium text-gray-500 mb-0.5">Converted</p>
            {isLoading ? <div className="h-[18px] w-12 skeleton rounded mx-auto mt-0.5" /> : <p className="text-[13px] sm:text-[18px] font-bold text-[#EF4444] leading-none">{summary.purchased.toLocaleString()}</p>}
          </div>
        </div>

        <div className="h-[160px] w-[95%] mx-auto mt-2">
          {isLoading ? (
            <div className="w-full h-full skeleton rounded-lg mt-2" />
          ) : (
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#F3F4F6" vertical={true} horizontal={true} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#6B7280' }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#6B7280' }} 
                  tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  itemStyle={{ color: '#111827', fontWeight: 600 }}
                />
                <Line type="linear" dataKey="sent" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3, fill: '#3B82F6', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                <Line type="linear" dataKey="delivered" stroke="#10B981" strokeWidth={2} dot={{ r: 3, fill: '#10B981', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                <Line type="linear" dataKey="opened" stroke="#0f62fe" strokeWidth={2} dot={{ r: 3, fill: '#0f62fe', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                <Line type="linear" dataKey="clicked" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3, fill: '#F59E0B', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                <Line type="linear" dataKey="purchased" stroke="#EF4444" strokeWidth={2} dot={{ r: 3, fill: '#EF4444', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
      <div className="border-t border-gray-100 p-4 flex justify-center mt-auto">
        <button className="text-sm font-semibold text-[#0f62fe] flex items-center gap-2 hover:opacity-80 transition-opacity">
          View Full Analytics <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}
