import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiFetch } from '../../../services/api';
import { supabase } from '../../../services/supabase';

export function useCampaignDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', goal: '', offer: '', status: '' });
  const [isSaving, setIsSaving] = useState(false);

  const openEditModal = () => {
    setEditForm({
      name: campaign?.name || '',
      goal: campaign?.goal || '',
      offer: campaign?.offer || '',
      status: campaign?.status || 'Draft'
    });
    setIsEditModalOpen(true);
  };

  const handleSaveCampaign = async () => {
    setIsSaving(true);
    try {
      const res = await apiFetch(`/api/campaigns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      const json = await res.json();
      if (json.success) {
        setCampaign(json.campaign);
        setIsEditModalOpen(false);
        toast.success('Campaign updated successfully');
      } else {
        toast.error(json.error || 'Failed to update campaign');
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      await apiFetch(`/api/campaigns/${id}/simulate`);
      toast.success('Simulation launched!');
    } catch (err) {
      toast.error('Simulation trigger failed');
      console.error('Simulation trigger failed', err);
    } finally {
      setIsSimulating(false);
    }
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [campRes, analyticsRes] = await Promise.all([
          apiFetch(`/api/campaigns/${id}`),
          apiFetch(`/api/campaigns/${id}/analytics`)
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

  return {
    id,
    navigate,
    campaign,
    analytics,
    loading,
    error,
    isSimulating,
    handleSimulate,
    isEditModalOpen,
    setIsEditModalOpen,
    editForm,
    setEditForm,
    isSaving,
    openEditModal,
    handleSaveCampaign,
  };
}
