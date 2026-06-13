import { useEffect, useState } from 'react';
import { useDashboardStore } from '../store/useDashboardStore';
import { Megaphone, Calendar, Users, Target, Plus, ArrowRight, Search, MoreVertical, X, Loader2, PieChart as PieChartIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export function Campaigns() {
  const navigate = useNavigate();
  const { campaigns, fetchCampaigns, deleteCampaign, fetchCampaignAnalytics } = useDashboardStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
  const [campaignAnalytics, setCampaignAnalytics] = useState<any | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const filteredCampaigns = campaigns.list.filter((c) => {
    const matchesSearch = (c.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      setDeletingId(id);
      await deleteCampaign(id);
      setDeletingId(null);
    }
  };

  const handleOpenDetails = async (campaign: any) => {
    setSelectedCampaign(campaign);
    setIsLoadingAnalytics(true);
    const analytics = await fetchCampaignAnalytics(campaign.id);
    setCampaignAnalytics(analytics);
    setIsLoadingAnalytics(false);
  };

  return (
    <div className="p-6 max-w-[1458px] mx-auto w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search campaigns..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f62fe]/20 focus:border-[#0f62fe] transition-all"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f62fe]/20 focus:border-[#0f62fe] transition-all"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
        <Link 
          to="/create-campaign"
          className="inline-flex items-center justify-center gap-2 bg-[#0f62fe] hover:bg-[#0f62fe]/90 text-white px-5 py-2 rounded-xl font-semibold text-[13px] shadow-md active:scale-95 transition-all w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Create Campaign
        </Link>
      </div>

      {/* Campaigns Grid/Table */}
      {campaigns.isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400 space-y-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-[#0f62fe]" />
          <p className="text-sm font-medium">Loading your campaigns...</p>
        </div>
      ) : campaigns.list.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-xl border border-gray-200 border-dashed text-center">
          <div className="h-12 w-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 mb-4">
            <Megaphone className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">No campaigns yet</h3>
          <p className="text-xs text-gray-500 mt-1.5 max-w-sm mx-auto mb-6">
            You haven't created any campaigns. Generate your first AI-driven campaign to reach your perfect audience.
          </p>
          <Link 
            to="/create-campaign"
            className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-semibold text-[12px] shadow-sm hover:bg-gray-50 transition-all"
          >
            Create Your First Campaign
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCampaigns.map((camp: any) => (
            <div 
              key={camp.id} 
              onClick={() => navigate(`/campaigns/${camp.id}`)}
              className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md hover:border-gray-200 transition-all cursor-pointer group"
            >
              <div className="flex p-5 gap-5">
                {/* Left Image Section */}
                <div className="relative h-[150px] w-[150px] flex-shrink-0 overflow-hidden rounded-xl">
                  <img 
                    src={camp.strategy?.creatives?.[0] ? (camp.strategy.creatives[0].startsWith('http') || camp.strategy.creatives[0].startsWith('data:') ? camp.strategy.creatives[0] : `data:image/jpeg;base64,${camp.strategy.creatives[0]}`) : "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80"} 
                    className="absolute inset-0 h-full w-full object-cover bg-gray-50"
                    alt={camp.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null; // Prevent infinite loop if fallback fails
                      e.currentTarget.src = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80";
                    }}
                  />
                  {/* Status Badge overlay */}
                  <div className="absolute top-2 left-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      camp.status === 'active' ? 'bg-[#2563EB] text-white shadow-md' :
                      camp.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                      'bg-[#2563EB] text-white'
                    }`}>
                      {(camp.status || 'Draft')}
                    </span>
                  </div>
                </div>
                
                {/* Right Content Section */}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="mb-3">
                    <h3 className="text-[14px] font-bold text-gray-900 tracking-tight leading-snug line-clamp-2 mb-1">{camp.name || 'Summer Revival'}</h3>
                    <p className="text-[10px] text-gray-500 font-medium">
                      {(camp.channels || ['WhatsApp']).join(' • ')} • Started {new Date(camp.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                    <div>
                      <p className="text-[10px] font-medium text-gray-500 mb-0.5">Open Rate</p>
                      <p className="text-[14px] font-bold text-gray-900">{(Math.random() * (65 - 40) + 40).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-gray-500 mb-0.5">Click Rate</p>
                      <p className="text-[14px] font-bold text-gray-900">{(Math.random() * (20 - 8) + 8).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-gray-500 mb-0.5">Conversion</p>
                      <p className="text-[14px] font-bold text-gray-900">{(Math.random() * (5 - 1) + 1).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-gray-500 mb-0.5">Revenue</p>
                      <p className="text-[14px] font-bold text-[#10B981]">₹{(camp.potential_revenue ? (camp.potential_revenue / 100000).toFixed(1) : '2.2')}L</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bottom Action */}
              <div className="border-t border-gray-100 p-4 flex justify-center mt-auto">
                <button className="text-sm font-semibold text-[#2563EB] flex items-center gap-2 group-hover:opacity-80 transition-opacity">
                  View Campaign <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {filteredCampaigns.length === 0 && (
            <div className="col-span-full p-12 text-center text-sm text-gray-500 bg-white rounded-2xl border border-gray-100">
              No campaigns match your filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
