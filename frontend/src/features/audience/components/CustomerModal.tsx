import { X, Loader2, User, MapPin, Star, Mail, Phone, Calendar, Globe, Shirt, Palette, TrendingUp, ShoppingBag, Package } from 'lucide-react';

export function CustomerModal({
  selectedCustomerId, setSelectedCustomerId, loadingDetails, customerDetails
}: any) {
  if (!selectedCustomerId) return null;

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

  return (
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
  );
}
