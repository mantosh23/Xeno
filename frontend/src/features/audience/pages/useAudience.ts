import { useEffect, useState, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { apiFetch } from '../../../services/api';
import { usePageCacheStore } from '../../dashboard/hooks/usePageCacheStore';

export interface AudienceCustomer {
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

export function useAudience() {
  const queryParams = useQuery();
  const { getCache, setCache } = usePageCacheStore();
  const cacheKey = 'Audience';
  const cached = getCache(cacheKey) || {};
  
  const [customers, setCustomers] = useState<AudienceCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(cached.page || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);

  // Filters state (prefer URL params if present, else cache)
  const [city, setCity] = useState(queryParams.get('city') || cached.city || '');
  const [loyalty, setLoyalty] = useState(queryParams.get('loyalty_tier') || cached.loyalty || '');
  const [inactiveDays, setInactiveDays] = useState(queryParams.get('inactive_days') || cached.inactiveDays || '');
  const [minSpend, setMinSpend] = useState(queryParams.get('min_spend') || cached.minSpend || '');

  // AI Filter State
  const [aiPrompt, setAiPrompt] = useState(cached.aiPrompt || '');
  const [aiReply, setAiReply] = useState(cached.aiReply || '');
  const [advancedFilters, setAdvancedFilters] = useState<any[]>(cached.advancedFilters || []);
  const [isGeneratingAiFilter, setIsGeneratingAiFilter] = useState(false);

  // Customer Modal State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | number | null>(null);
  const [customerDetails, setCustomerDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const stateRef = useRef({ page, city, loyalty, inactiveDays, minSpend, aiPrompt, aiReply, advancedFilters });
  stateRef.current = { page, city, loyalty, inactiveDays, minSpend, aiPrompt, aiReply, advancedFilters };

  useEffect(() => {
    return () => {
      setCache(cacheKey, stateRef.current);
    };
  }, []);

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
      
      if (data.success) {
        if (data.filters) {
          setCity(data.filters.city || '');
          setInactiveDays(data.filters.inactive_days || '');
          setMinSpend(data.filters.min_spend || '');
          setLoyalty(data.filters.loyalty_tier || '');
        }
        if (data.advanced_filters) {
          setAdvancedFilters(data.advanced_filters);
        }
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
      setCity(''); setLoyalty(''); setMinSpend(''); setInactiveDays(''); setAdvancedFilters([]); setAiPrompt(''); setAiReply('');
    }
    setPage(1);
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
        if (advancedFilters && advancedFilters.length > 0) {
          url += `&advanced_filters=${encodeURIComponent(JSON.stringify(advancedFilters))}`;
        }

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
  }, [page, city, loyalty, inactiveDays, minSpend, advancedFilters]);

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

  return {
    customers,
    loading,
    page,
    setPage,
    totalPages,
    totalCustomers,
    city,
    setCity,
    loyalty,
    setLoyalty,
    inactiveDays,
    setInactiveDays,
    minSpend,
    setMinSpend,
    aiPrompt,
    setAiPrompt,
    aiReply,
    advancedFilters,
    isGeneratingAiFilter,
    selectedCustomerId,
    setSelectedCustomerId,
    customerDetails,
    loadingDetails,
    handleAiFilter,
    handleExportCsv,
    handleQuickSegment,
  };
}
