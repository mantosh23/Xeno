import { Download, Users, ChevronLeft, ChevronRight, User, Phone, Mail } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function AudienceList({
  customers, loading, totalCustomers, totalPages, page, setPage,
  setSelectedCustomerId, handleExportCsv, handleQuickSegment
}: any) {
  return (
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
            {customers.map((customer: any) => (
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
                onClick={() => setPage((p: number) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="text-sm font-medium text-gray-600">
                Page <span className="font-bold text-gray-900">{page}</span> of {totalPages}
              </div>
              <button
                onClick={() => setPage((p: number) => Math.min(totalPages, p + 1))}
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
  );
}
