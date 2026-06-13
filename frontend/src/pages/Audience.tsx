import { apiFetch } from '../lib/api';
import { useEffect, useState, useMemo } from 'react';
import { Mail, Phone, User, ChevronLeft, ChevronRight, Filter, Users, X, Sparkles, Bot, Loader2, Download, Package, ShoppingBag, TrendingUp, RefreshCw, MapPin, Star, Calendar, Palette, Shirt, Globe, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useLocation } from 'react-router-dom';

interface AudienceCustomer {
  customer_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  total_lifetime_value: number;
  total_orders: number;
  avg_transactional_value: number;
  last_ordered_item: string;
  last_ordered_date: string;
  preferred_category: string;
  preferred_day: string;
  favoured_channel: string;
  gender?: string;
  loyalty_tier?: string;
}

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export function Audience() {
  const queryParams = useQuery();
  
  const [customers, setCustomers] = useState<AudienceCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);

  // Filters state
  const [city, setCity] = useState(queryParams.get('city') || '');
  const [loyalty, setLoyalty] = useState(queryParams.get('loyalty_tier') || '');
  const [inactiveDays, setInactiveDays] = useState(queryParams.get('inactive_days') || '');
  const [minSpend, setMinSpend] = useState(queryParams.get('min_spend') || '');

  // AI Filter State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiReply, setAiReply] = useState('');
  const [isGeneratingAiFilter, setIsGeneratingAiFilter] = useState(false);

  // Customer Modal State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | number | null>(null);
  const [customerDetails, setCustomerDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const handleAiFilter = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingAiFilter(true);
    
    try {
      const response = await apiFetch('/api/customers/ai-filter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt })
      });
      const data = await response.json();
      
      if (data.success && data.filters) {
        setCity(data.filters.city || '');
        setInactiveDays(data.filters.inactive_days || '');
        setMinSpend(data.filters.min_spend || '');
        setLoyalty(data.filters.loyalty_tier || '');
        setAiReply(data.reply || '');
        setPage(1);
      }
    } catch (e) {
      console.error('Failed to parse AI filter', e);
    } finally {
      setIsGeneratingAiFilter(false);
    }
  };

  const handleExportCsv = () => {
    const params = new URLSearchParams();
    if (city) params.append('city', city);
    if (loyalty) params.append('loyalty_tier', loyalty);
    if (inactiveDays) params.append('inactive_days', inactiveDays);
    if (minSpend) params.append('min_spend', minSpend);

    const exportUrl = `/api/customers/export?${params.toString()}`;
    window.open(exportUrl, '_blank');
  };

  // Quick segment logic
  const handleQuickSegment = (segment: string) => {
    if (segment === 'Dormant') {
      setInactiveDays('60');
      setCity(''); setLoyalty(''); setMinSpend('');
    } else if (segment === 'VIP') {
      setMinSpend('5000');
      setLoyalty('Platinum');
      setCity(''); setInactiveDays('');
    } else if (segment === 'Clear') {
      setCity(''); setLoyalty(''); setMinSpend(''); setInactiveDays('');
    }
    setPage(1);
  };

  const renderPaletteSwatches = (palette: string) => {
    const palettes: Record<string, string[]> = {
      'Earth Tones': ['#8B5A2B', '#CD853F', '#556B2F'],
      'Monochrome': ['#1a1a1a', '#808080', '#e5e5e5'],
      'Pastels': ['#FFB6C1', '#ADD8E6', '#98FB98'],
      'Jewel Tones': ['#50C878', '#0F52BA', '#9966CC'],
      'Neutrals': ['#F5F5DC', '#D3D3D3', '#A9A9A9'],
      'Vibrant': ['#FF3B30', '#34C759', '#007AFF'],
      'Dark': ['#121212', '#2A2A2A', '#404040'],
      'Brights': ['#FF1493', '#00FFFF', '#FFD700'],
    };
    
    const colors = palettes[palette];
    if (!colors) return <span className="text-sm font-medium text-gray-900 capitalize">{palette || 'Any'}</span>;
    
    return (
      <div className="flex items-center gap-1.5 mt-0.5">
        <div className="flex -space-x-1.5">
          {colors.map((c, i) => (
            <div key={i} className="w-4 h-4 rounded-full border border-white shadow-sm ring-1 ring-black/5" style={{ backgroundColor: c }} />
          ))}
        </div>
        <span className="text-sm font-medium text-gray-900 capitalize ml-1">{palette}</span>
      </div>
    );
  };

  useEffect(() => {
    const fetchAudience = async () => {
      setLoading(true);
      try {
        let url = `/api/customers?page=${page}&limit=12`;
        if (city) url += `&city=${encodeURIComponent(city)}`;
        if (loyalty) url += `&loyalty_tier=${encodeURIComponent(loyalty)}`;
        if (inactiveDays) url += `&inactive_days=${encodeURIComponent(inactiveDays)}`;
        if (minSpend) url += `&min_spend=${encodeURIComponent(minSpend)}`;

        const response = await apiFetch(url);
        const data = await response.json();
        if (data.success) {
          setCustomers(data.customers);
          setTotalPages(data.pagination.totalPages);
          setTotalCustomers(data.pagination.total);
        }
      } catch (error) {
        console.error('Failed to fetch audience', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAudience();
  }, [page, city, loyalty, inactiveDays, minSpend]);

  useEffect(() => {
    if (!selectedCustomerId) {
      setCustomerDetails(null);
      return;
    }
    const fetchDetails = async () => {
      setLoadingDetails(true);
      try {
        const response = await apiFetch(`/api/customers/${selectedCustomerId}`);
        const data = await response.json();
        if (data.success) {
          setCustomerDetails(data.customer);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingDetails(false);
      }
    };
    fetchDetails();
  }, [selectedCustomerId]);

  return (
    <div className="p-6 max-w-[1458px] mx-auto w-full flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Sidebar Filters */}
      <div className="w-full md:w-64 flex-shrink-0 space-y-6">
        
        {/* AI Filter */}
        <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Bot className="h-4 w-4 text-[#0f62fe]" /> AI Filter
          </h3>
          <p className="text-[11px] text-gray-500 mb-4">Describe the audience you want to find.</p>
          <div className="space-y-3">
            <textarea 
               value={aiPrompt}
               onChange={(e) => setAiPrompt(e.target.value)}
               placeholder="e.g. Find me users in Delhi who haven't shopped in 60 days..."
               className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0f62fe] transition-all resize-none shadow-sm"
               rows={3}
            />
            <button 
               onClick={handleAiFilter}
               disabled={isGeneratingAiFilter || !aiPrompt.trim()}
               className="w-full flex items-center justify-center gap-2 bg-[#0f62fe] hover:bg-[#0353e9] disabled:opacity-50 text-white font-bold py-2 rounded-lg text-[12px] transition-colors shadow-md"
            >
              {isGeneratingAiFilter ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              {isGeneratingAiFilter ? 'Analyzing...' : 'Apply AI Filter'}
            </button>
            {aiReply && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs text-[#0f62fe] border border-blue-100 animate-in fade-in slide-in-from-top-2">
                <span className="font-bold flex items-center gap-1 mb-1">
                  <Bot className="h-3 w-3" /> AI Director
                </span>
                {aiReply}
              </div>
            )}
          </div>
        </div>

        {/* Normal Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Filter className="h-4 w-4 text-[#0f62fe]" /> Filter Audience
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Loyalty Tier</label>
              <select 
                value={loyalty} 
                onChange={(e) => { setLoyalty(e.target.value); setPage(1); }}
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0f62fe] focus:ring-1 focus:ring-[#0f62fe] transition-all"
              >
                <option value="">All Tiers</option>
                <option value="Platinum">Platinum</option>
                <option value="Gold">Gold</option>
                <option value="Silver">Silver</option>
                <option value="Standard">Standard</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">City</label>
              <select 
                value={city} 
                onChange={(e) => { setCity(e.target.value); setPage(1); }}
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0f62fe] focus:ring-1 focus:ring-[#0f62fe] transition-all"
              >
                <option value="">All Cities</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Bangalore">Bangalore</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Inactive Days (Minimum)</label>
              <input 
                type="number" 
                placeholder="e.g. 60"
                value={inactiveDays}
                onChange={(e) => { setInactiveDays(e.target.value); setPage(1); }}
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0f62fe] focus:ring-1 focus:ring-[#0f62fe] transition-all"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Minimum Lifetime Spend (₹)</label>
              <input 
                type="number" 
                placeholder="e.g. 5000"
                value={minSpend}
                onChange={(e) => { setMinSpend(e.target.value); setPage(1); }}
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0f62fe] focus:ring-1 focus:ring-[#0f62fe] transition-all"
              />
            </div>

            {(city || loyalty || inactiveDays || minSpend) && (
              <button 
                onClick={() => handleQuickSegment('Clear')}
                className="w-full mt-2 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <X className="h-4 w-4" /> Clear All Filters
              </button>
            )}
          </div>
        </div>

        <div className="bg-[#F8F9FB] rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#0f62fe]" /> AI Segments
          </h3>
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => handleQuickSegment('VIP')}
              className="px-3 py-2 text-left text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-[#0f62fe] hover:shadow-sm transition-all"
            >
              👑 VIP Customers ({'>'}₹5k spend)
            </button>
            <button 
              onClick={() => { setAiPrompt("Find VIP customers who prefer Summer collections"); handleAiFilter(); }}
              className="px-3 py-2 text-left text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-[#0f62fe] hover:shadow-sm transition-all"
            >
              💤 Dormant Users ({'>'}60 days inactive)
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-4">
        
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Audience Results
            <span className="ml-3 inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-[#0f62fe] border border-blue-100">
              {totalCustomers.toLocaleString()} users
            </span>
          </h2>
          <button 
            onClick={handleExportCsv}
            disabled={totalCustomers === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-semibold text-sm rounded-lg hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 space-y-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-[#0f62fe]" />
            <p className="text-sm font-medium">Analyzing segments...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 bg-white rounded-xl border border-gray-200 border-dashed text-center">
            <div className="h-12 w-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 mb-4">
              <Users className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">No customers found</h3>
            <p className="text-xs text-gray-500 mt-1.5 max-w-sm mx-auto mb-6">
              Try adjusting your filters to broaden your audience segment.
            </p>
            <button 
              onClick={() => handleQuickSegment('Clear')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-[12px] font-semibold transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {customers.map((customer) => (
                <div 
                  key={customer.customer_id} 
                  onClick={() => setSelectedCustomerId(customer.customer_id)}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm relative overflow-hidden flex flex-col hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
                >
                  <div className="p-5 flex gap-4 items-start">
                    <div className={`h-16 w-16 rounded-full flex-shrink-0 overflow-hidden border flex items-center justify-center ${customer.gender === 'female' ? 'bg-pink-50 border-pink-100' : 'bg-blue-50 border-blue-100'}`}>
                      <User className={`h-8 w-8 ${customer.gender === 'female' ? 'text-pink-500' : 'text-[#0f62fe]'}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold text-gray-900 leading-none">
                          {customer.first_name} {customer.last_name}
                        </h3>
                        {customer.loyalty_tier && (
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            customer.loyalty_tier === 'Gold' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            customer.loyalty_tier === 'Platinum' ? 'bg-gray-100 text-gray-800 border-gray-300' :
                            'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {customer.loyalty_tier}
                          </span>
                        )}
                      </div>
                      
                      <div className="text-[12px] text-gray-500 flex items-center flex-wrap gap-1">
                        <span>Last Ordered</span>
                        <span className="text-[#0f62fe] font-medium max-w-[120px] truncate">{customer.last_ordered_item}</span>
                        {customer.last_ordered_date && (
                          <>
                            <span className="text-gray-300 mx-0.5">•</span>
                            <span>{formatDistanceToNow(new Date(customer.last_ordered_date))} ago</span>
                          </>
                        )}
                      </div>
                      
                      <div className="flex gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-gray-600 text-[12px]">
                          <Phone className="h-3.5 w-3.5 text-gray-400" />
                          {customer.phone || '+91 1234567890'}
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600 text-[12px] truncate">
                          <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                          <span className="truncate max-w-[100px]">{customer.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 border-t border-gray-50 bg-gray-50/50">
                    <div className="p-3 text-center border-r border-gray-50">
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Total LTV</p>
                      <p className="font-bold text-gray-900 text-sm">₹{customer.total_lifetime_value?.toLocaleString('en-IN') || '0'}</p>
                    </div>
                    <div className="p-3 text-center border-r border-gray-50">
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Orders</p>
                      <p className="font-bold text-gray-900 text-sm">{customer.total_orders}</p>
                    </div>
                    <div className="p-3 text-center">
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Channel</p>
                      <p className="font-bold text-[#0f62fe] text-sm">{customer.favoured_channel}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                <div className="text-sm font-medium text-gray-600">
                  Page <span className="font-bold text-gray-900">{page}</span> of {totalPages}
                </div>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Customer Details Modal */}
      {selectedCustomerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedCustomerId(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>
            
            {loadingDetails ? (
              <div className="flex-1 flex flex-col items-center justify-center py-32 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-[#0f62fe]" />
                <p className="text-sm font-medium text-gray-500">Loading customer profile...</p>
              </div>
            ) : customerDetails ? (
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 sm:p-8 bg-gradient-to-b from-[#f8f9fb] to-white border-b border-gray-100">
                  <div className="flex items-center gap-5">
                    <div className="h-20 w-20 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                      <User className="h-10 w-10 text-[#0f62fe]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        {customerDetails.customer_profile.demographics.name}
                        {customerDetails.customer_profile.loyalty.tier && (
                          <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                            customerDetails.customer_profile.loyalty.tier === 'Gold' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            customerDetails.customer_profile.loyalty.tier === 'Platinum' ? 'bg-gray-100 text-gray-800 border-gray-300' :
                            'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {customerDetails.customer_profile.loyalty.tier}
                          </span>
                        )}
                      </h2>
                      <div className="flex gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-gray-400" /> {customerDetails.customer_profile.demographics.city}</span>
                        <span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-yellow-500" /> {customerDetails.customer_profile.loyalty.points_balance} pts</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-8">
                  {/* Personal Details */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><User className="h-4 w-4 text-[#0f62fe]" /> Personal Profile</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-2">
                      <div className="flex items-start gap-2.5 bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                        <Mail className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Email Address</p>
                          <p className="text-sm font-medium text-gray-900 truncate max-w-[130px]">{customerDetails.customer_profile.demographics.email}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5 bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                        <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Phone Number</p>
                          <p className="text-sm font-medium text-gray-900">{customerDetails.customer_profile.demographics.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5 bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                        <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Date of Birth</p>
                          <p className="text-sm font-medium text-gray-900">{customerDetails.customer_profile.demographics.date_of_birth || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5 bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                        <Globe className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Location</p>
                          <p className="text-sm font-medium text-gray-900">{customerDetails.customer_profile.demographics.city}, {customerDetails.customer_profile.demographics.country}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5 bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                        <Shirt className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Size Preferences</p>
                          <p className="text-sm font-medium text-gray-900">
                            Top: {customerDetails.customer_profile.preferences.top_size || '-'} | Btm: {customerDetails.customer_profile.preferences.bottom_size || '-'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5 bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                        <Palette className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Color Palette</p>
                          {renderPaletteSwatches(customerDetails.customer_profile.preferences.color_palette)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial Metrics */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-[#0f62fe]" /> Financial Metrics</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Lifetime Value</p>
                        <p className="text-xl font-bold text-gray-900">₹{customerDetails.financial_metrics.total_lifetime_value.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Avg Order Value</p>
                        <p className="text-xl font-bold text-gray-900">₹{customerDetails.financial_metrics.average_order_value.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Return Rate</p>
                        <p className={`text-xl font-bold ${
                          customerDetails.financial_metrics.return_rate_percentage > 10 ? 'text-red-600' : 
                          customerDetails.financial_metrics.return_rate_percentage > 0 ? 'text-green-600' : 
                          'text-gray-900'
                        }`}>
                          {customerDetails.financial_metrics.return_rate_percentage}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Purchase History */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><ShoppingBag className="h-4 w-4 text-[#0f62fe]" /> Recent Orders</h3>
                  {customerDetails.purchase_history && customerDetails.purchase_history.length > 0 ? (
                    <div className="space-y-4">
                      {customerDetails.purchase_history.map((order: any) => (
                        <div key={order.order_id} className="border border-gray-100 rounded-xl p-4 flex flex-col gap-3 hover:border-gray-200 transition-colors">
                          <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-gray-700">Order #{order.order_id.toString().slice(0, 8)}</span>
                              <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${
                                order.status === 'Completed' || order.status === 'Shipped' ? 'bg-green-50 text-green-700' :
                                order.status === 'Pending' ? 'bg-yellow-50 text-yellow-700' :
                                'bg-red-50 text-red-700'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            <span className="text-xs font-semibold text-gray-500">{order.date}</span>
                          </div>
                          <div className="space-y-2">
                            {order.items.map((item: any, idx: number) => (
                              <div key={idx} className="flex justify-between items-center bg-gray-50/50 p-2 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 bg-white border border-gray-200 rounded-md flex items-center justify-center">
                                    <Package className="h-4 w-4 text-gray-400" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-gray-900">
                                      {item.product_name}
                                      {item.quantity > 1 && <span className="ml-1 text-xs font-bold text-gray-400">x{item.quantity}</span>}
                                    </p>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">{item.category}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-bold text-gray-900">₹{item.price_paid.toLocaleString('en-IN')}</p>
                                  {item.discount_reason && (
                                    <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">{item.discount_reason}</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 text-sm bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                      No purchase history available.
                    </div>
                  )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center py-32 text-red-500 font-medium">Failed to load details.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
