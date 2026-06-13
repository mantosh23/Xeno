import { apiFetch } from '../lib/api';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Target, Users, Calendar, Image as ImageIcon, FileText, ListTree, Activity, DollarSign, CheckCircle2 } from 'lucide-react';
import { useDashboardStore } from '../store/useDashboardStore';
import { supabase } from '../lib/supabase';

export const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    if (!id) return;
    const channel = supabase.channel('engagements_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'engagements', filter: `campaign_id=eq.${id}` }, (payload) => {
        const ev = payload.new.event_type;
        setAnalytics((prev: any) => {
          if (!prev) return prev;
          const s = { ...prev.summary };
          if (ev === 'Delivered') s.sent = (s.sent || 0) + 1;
          if (ev === 'Opened') s.opened = (s.opened || 0) + 1;
          if (ev === 'Clicked') s.clicked = (s.clicked || 0) + 1;
          if (ev === 'Purchased') s.purchased = (s.purchased || 0) + 1;
          return { ...prev, summary: s };
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      await apiFetch(`http://localhost:3001/api/campaigns/${id}/simulate`);
    } catch (err) {
      console.error('Simulation trigger failed', err);
    }
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [campRes, analyticsRes] = await Promise.all([
          apiFetch(`http://localhost:3001/api/campaigns/${id}`),
          apiFetch(`http://localhost:3001/api/campaigns/${id}/analytics`)
        ]);

        const campData = await campRes.json();
        const analyticsData = await analyticsRes.json();

        if (campData.success) setCampaign(campData.campaign);
        else setError(campData.error || 'Failed to load campaign');

        if (analyticsData.success) setAnalytics(analyticsData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4 text-gray-500">
          <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
          <p className="font-semibold tracking-wider uppercase text-sm">Loading Deep Analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="flex-1 p-8">
        <button onClick={() => navigate('/campaigns')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors font-semibold">
          <ArrowLeft className="h-4 w-4" /> Back to Campaigns
        </button>
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 font-medium">
          Error: {error || 'Campaign not found'}
        </div>
      </div>
    );
  }

  const { strategy } = campaign;

  return (
    <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
      
      {/* Header */}
      <div className="mb-8">
        <button onClick={() => navigate('/campaigns')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors font-bold text-sm">
          <ArrowLeft className="h-4 w-4" /> Back to Campaigns
        </button>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                campaign.status === 'active' ? 'bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]' : 'bg-gray-100 text-gray-600 border border-gray-200'
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full mr-2 ${campaign.status === 'active' ? 'bg-[#2563EB] animate-pulse' : 'bg-gray-400'}`} />
                {campaign.status || 'Draft'}
              </span>
              <span className="text-sm font-semibold text-gray-500 flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {new Date(campaign.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{campaign.name || 'Untitled Campaign'}</h1>
          </div>
          <div className="flex gap-3">
             <button className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-sm">
               Edit Campaign
             </button>
             <button 
                onClick={handleSimulate}
                disabled={isSimulating}
                className="px-6 py-2.5 bg-[#2563EB] text-white font-bold rounded-xl hover:bg-[#1D4ED8] disabled:opacity-70 transition-colors shadow-sm text-sm flex items-center gap-2">
                {isSimulating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
                {isSimulating ? 'Simulating...' : 'View Live Simulator'}
              </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Performance Overview (if analytics exist) */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-extrabold text-gray-900 mb-6 flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#2563EB]" />
              Real-Time Performance
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-gray-100">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Delivered</p>
                <p className="text-2xl font-black text-gray-900">{analytics?.summary?.sent?.toLocaleString() || '0'}</p>
              </div>
              <div className="bg-[#EFF6FF] rounded-2xl p-5 border border-[#DBEAFE]">
                <p className="text-[11px] font-bold text-[#2563EB]/70 uppercase tracking-wider mb-1">Opened</p>
                <p className="text-2xl font-black text-[#2563EB]">{analytics?.summary?.opened?.toLocaleString() || '0'}</p>
              </div>
              <div className="bg-[#FEFCE8] rounded-2xl p-5 border border-[#FEF08A]">
                <p className="text-[11px] font-bold text-[#EAB308]/70 uppercase tracking-wider mb-1">Clicked</p>
                <p className="text-2xl font-black text-[#EAB308]">{analytics?.summary?.clicked?.toLocaleString() || '0'}</p>
              </div>
              <div className="bg-[#ECFDF5] rounded-2xl p-5 border border-[#A7F3D0]">
                <p className="text-[11px] font-bold text-[#10B981]/70 uppercase tracking-wider mb-1">Converted</p>
                <p className="text-2xl font-black text-[#10B981]">{analytics?.summary?.purchased?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </div>

          {/* Automated Journey / Sequence */}
          {strategy?.steps && (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-sm font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                <ListTree className="h-5 w-5 text-[#2563EB]" />
                Automated Journey Sequence
              </h3>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-gray-100 before:via-gray-100 before:to-transparent">
                {strategy.steps.map((step: any, i: number) => (
                  <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-[#EFF6FF] text-[#2563EB] font-bold text-sm shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      {i + 1}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl bg-[#F8FAFC] border border-gray-100 group-hover:bg-white group-hover:border-[#2563EB]/20 group-hover:shadow-md transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Day {step.day}</span>
                        <span className="inline-flex items-center rounded-md bg-white border border-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-600 shadow-sm">
                          {step.channel}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-800 leading-relaxed">{step.content_idea || step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Generated Copy */}
          {strategy?.copy && Object.keys(strategy.copy).length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-sm font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#2563EB]" />
                Personalized AI Copy
              </h3>
              <div className="space-y-4">
                {Object.entries(strategy.copy).map(([channel, copyObj]: [string, any]) => (
                  <div key={channel} className="bg-[#F8FAFC] rounded-2xl p-5 border border-gray-100">
                    <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#2563EB]"></span>
                      {channel}
                    </div>
                    {typeof copyObj === 'string' ? (
                      <p className="text-sm font-medium text-gray-800 whitespace-pre-wrap leading-relaxed">{copyObj}</p>
                    ) : (
                      <div className="space-y-4">
                        {copyObj.subject && (
                          <div className="bg-white p-3 rounded-xl border border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Subject</p>
                            <p className="text-sm font-bold text-gray-900">{copyObj.subject}</p>
                          </div>
                        )}
                        {copyObj.body && (
                          <div className="bg-white p-4 rounded-xl border border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Body</p>
                            <p className="text-sm font-medium text-gray-800 whitespace-pre-wrap leading-relaxed">{copyObj.body}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Sidebar details) */}
        <div className="space-y-8">
          
          {/* Creative Display */}
          {strategy?.creatives && strategy.creatives.length > 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-[#2563EB]" />
                <h3 className="text-sm font-extrabold text-gray-900">AI Creative</h3>
              </div>
              <div className="p-4 bg-[#F8FAFC]">
                <div className="rounded-2xl overflow-hidden shadow-sm relative group aspect-[4/5]">
                  <img 
                    src={strategy.creatives[0].startsWith('http') || strategy.creatives[0].startsWith('data:') ? strategy.creatives[0] : `data:image/jpeg;base64,${strategy.creatives[0]}`} 
                    alt="Creative" 
                    className="w-full h-full object-cover bg-gray-50" 
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                </div>
              </div>
            </div>
          )}

          {/* Overview / Strategy Box */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-extrabold text-gray-900 mb-6 flex items-center gap-2">
              <Target className="h-5 w-5 text-[#2563EB]" />
              Strategy Brief
            </h3>
            
            <div className="space-y-6">
              <div>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Campaign Goal</p>
                <p className="text-sm font-medium text-gray-900 leading-relaxed bg-[#F8FAFC] p-4 rounded-xl border border-gray-100">{campaign.goal || 'Not specified'}</p>
              </div>

              <div>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Target Audience</p>
                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-gray-100 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <Users className="h-5 w-5 text-[#2563EB]" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-gray-900">{campaign.audience_size ? campaign.audience_size.toLocaleString() : '—'}</p>
                    <p className="text-[11px] font-semibold text-gray-500">Perfect match customers</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Estimated Revenue</p>
                <div className="bg-[#ECFDF5] p-4 rounded-xl border border-[#A7F3D0] flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <DollarSign className="h-5 w-5 text-[#10B981]" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-[#10B981]">₹{(campaign.potential_revenue ? (campaign.potential_revenue / 100000).toFixed(1) : '0')}L</p>
                    <p className="text-[11px] font-semibold text-emerald-700/70">Potential impact</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
