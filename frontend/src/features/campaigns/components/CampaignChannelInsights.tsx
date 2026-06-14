import { BarChart3, Pause, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';

export function CampaignChannelInsights({ campaign, analytics }: any) {
  if (!campaign?.channels || campaign.channels.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-indigo-500" />
        Deep Channel Insights
      </h3>
      
      <div className="grid grid-cols-1 gap-6">
        {campaign.channels.map((channel: string) => {
          const isAd = channel === 'Facebook' || channel === 'Instagram';
          
          const getChannelLogo = (name: string) => {
            switch (name) {
              case 'Facebook': return 'https://cdn.simpleicons.org/facebook/000000';
              case 'Instagram': return 'https://cdn.simpleicons.org/instagram/000000';
              case 'WhatsApp': return 'https://cdn.simpleicons.org/whatsapp/000000';
              case 'Email': return 'https://cdn.simpleicons.org/gmail/000000';
              case 'SMS': return 'https://cdn.simpleicons.org/telegram/000000';
              default: return 'https://cdn.simpleicons.org/campaignmonitor/000000';
            }
          };
          const logoUrl = getChannelLogo(channel);

          if (isAd) {
            const chData = analytics?.channelBreakdown?.[channel] || { sent: 0, clicked: 0, purchased: 0 };
            const sent = Math.max(chData.sent || 0, 0);
            
            if (sent === 0) {
              return (
                <div key={channel} className="bg-white rounded-2xl p-6 border border-gray-200 flex flex-col items-center justify-center relative overflow-hidden h-[300px] shadow-sm">
                  <div className="absolute -bottom-6 -right-6 opacity-[0.03] pointer-events-none z-0">
                    <img src={logoUrl} alt={channel} className="w-40 h-40" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  </div>
                  <h4 className="text-gray-900 font-bold mb-2 z-10">{channel} Ads</h4>
                  <p className="text-gray-500 text-sm z-10">No engagement data yet. Run the Live Simulator.</p>
                </div>
              );
            }

            const adData = [
              { name: 'Views', value: chData.sent || 0, color: '#E0E7FF', pct: 100 },
              { name: 'Clicks', value: chData.clicked || 0, color: '#818CF8', pct: Math.round(((chData.clicked || 0) / sent) * 100) },
              { name: 'Leads', value: chData.purchased || 0, color: '#4F46E5', pct: Math.round(((chData.purchased || 0) / sent) * 100) },
            ];
            const spendData = [{ d: 1, v: 400 }, { d: 2, v: 520 }, { d: 3, v: 480 }, { d: 4, v: 610 }, { d: 5, v: 750 }, { d: 6, v: 680 }, { d: 7, v: 810 }];
            const cpcData = [{ d: 1, v: 6.2 }, { d: 2, v: 5.8 }, { d: 3, v: 5.5 }, { d: 4, v: 5.1 }, { d: 5, v: 5.4 }, { d: 6, v: 4.8 }, { d: 7, v: 5.04 }];

            return (
              <div key={channel} className="bg-white rounded-2xl p-6 border border-gray-200 flex flex-col justify-between relative overflow-hidden group shadow-sm">
                <div className="absolute -bottom-6 -right-6 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity z-0">
                  <img src={logoUrl} alt={channel} className="w-40 h-40" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      {channel} Ads
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded uppercase tracking-wider">Active</span>
                      <button className="p-1 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors" title={`Pause ${channel}`}>
                        <Pause className="h-4 w-4" fill="currentColor" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-50 p-4 pb-8 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden h-[96px] transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer group/card">
                      <div className="relative z-10 flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider group-hover/card:text-indigo-500 transition-colors">Spend</p>
                          <p className="text-xl font-bold text-gray-900 mt-1">₹4,250</p>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 w-full h-[45px] opacity-60">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={spendData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#818CF8" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#818CF8" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="v" stroke="#818CF8" strokeWidth={2} fillOpacity={1} fill="url(#colorSpend)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-4 pb-8 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden h-[96px] transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer group/card">
                      <div className="relative z-10 flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider group-hover/card:text-indigo-500 transition-colors">Avg CPC</p>
                          <p className="text-xl font-bold text-gray-900 mt-1">₹5.04</p>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 w-full h-[45px] opacity-60">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={cpcData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorCpc" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="v" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#colorCpc)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="h-[120px] w-full mt-auto relative z-10">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 text-center">Conversion Funnel</p>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={adData} layout="vertical" margin={{ top: 0, right: 80, left: 0, bottom: 0 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 600 }} width={45} />
                      <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '12px', fontWeight: 'bold' }} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20} label={(props: any) => {
                        const { x, y, width, height, value } = props;
                        const pct = sent > 0 ? Math.round((value / sent) * 100) : 0;
                        return (
                          <text x={x + width + 10} y={y + height / 2 + 4} fill="#374151" fontSize={11} fontWeight="bold">
                            {value.toLocaleString()} ({pct}%)
                          </text>
                        );
                      }}>
                        {adData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          } else {
            const chData = analytics?.channelBreakdown?.[channel] || { sent: 0, delivered: 0, opened: 0, clicked: 0, purchased: 0 };
            const sent = Math.max(chData.sent || 0, 0);

            if (sent === 0) {
              return (
                <div key={channel} className="bg-white rounded-2xl p-6 border border-gray-200 flex flex-col items-center justify-center relative overflow-hidden h-[300px] shadow-sm">
                  <div className="absolute -bottom-6 -right-6 opacity-[0.03] pointer-events-none z-0">
                    <img src={logoUrl} alt={channel} className="w-40 h-40" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  </div>
                  <h4 className="text-gray-900 font-bold mb-2 z-10">{channel} Broadcast</h4>
                  <p className="text-gray-500 text-sm z-10">No engagement data yet. Run the Live Simulator.</p>
                </div>
              );
            }

            const failed = Math.max(0, (chData.sent || 0) - (chData.delivered || 0));
            
            const broadcastData = [
              { name: 'Sent', value: chData.sent || 0, color: '#93C5FD', pct: 100 },
              { name: 'Delivered', value: chData.delivered || 0, color: '#6EE7B7', pct: Math.round(((chData.delivered || 0) / sent) * 100) },
              { name: 'Failed', value: failed, color: '#FCA5A5', pct: Math.round((failed / sent) * 100) },
              { name: 'Opened', value: chData.opened || 0, color: '#34D399', pct: Math.round(((chData.opened || 0) / sent) * 100) },
              { name: 'Clicked', value: chData.clicked || 0, color: '#059669', pct: Math.round(((chData.clicked || 0) / sent) * 100) },
              { name: 'Purchased', value: chData.purchased || 0, color: '#047857', pct: Math.round(((chData.purchased || 0) / sent) * 100) },
            ];

            return (
              <div key={channel} className="bg-white rounded-2xl p-6 border border-gray-200 flex flex-col justify-between relative overflow-hidden group shadow-sm">
                <div className="absolute -bottom-6 -right-6 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity z-0">
                  <img src={logoUrl} alt={channel} className="w-40 h-40" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-sm font-bold text-gray-900">{channel} Broadcast</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </span>
                    </div>
                  </div>
                  
                </div>
                
                <div className="h-[200px] w-full mt-4 relative z-10">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 text-center">Engagement Funnel</p>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={broadcastData} layout="vertical" margin={{ top: 0, right: 80, left: 0, bottom: 0 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 600 }} width={60} />
                      <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '12px', fontWeight: 'bold' }} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20} label={(props: any) => {
                        const { x, y, width, height, value } = props;
                        const pct = sent > 0 ? Math.round((value / sent) * 100) : 0;
                        return (
                          <text x={x + width + 10} y={y + height / 2 + 4} fill="#374151" fontSize={11} fontWeight="bold">
                            {value.toLocaleString()} ({pct}%)
                          </text>
                        );
                      }}>
                        {broadcastData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}
