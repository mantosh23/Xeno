import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiFetch } from '../../../services/api';
import { supabase } from '../../../services/supabase';
import { useCampaignStore } from '../hooks/useCampaignStore';

export function useCampaignDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDevSimulatorOpen, setIsDevSimulatorOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', goal: '', offer: '', status: '' });
  const [isSaving, setIsSaving] = useState(false);

  const editCampaignInWizard = () => {
    const store = useCampaignStore.getState();
    store.reset();
    store.setSavedCampaignId(campaign.id);
    store.setGoal(campaign.goal || '');
    if (campaign.strategy) {
      store.setStrategy(campaign.strategy);
      if (campaign.strategy.content) store.setChannelContent(campaign.strategy.content);
      if (campaign.strategy.creatives) store.setCreatives(campaign.strategy.creatives);
    }
    store.setStep(1);
    navigate('/campaigns?view=create-campaign');
  };

  const handleLaunchNow = async () => {
    setIsSaving(true);
    try {
      const res = await apiFetch(`/api/campaigns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Active' })
      });
      const json = await res.json();
      if (json.success) {
        setCampaign(json.campaign);
        toast.success('Campaign launched successfully!');
        
        // The user explicitly requested to "flood it with random data after the lauch okay>"
        // So we trigger the simulator with a high count to populate the charts.
        toast.loading('Generating initial analytics data...', { id: 'simulateToast' });
        await apiFetch(`/api/campaigns/${id}/simulate?count=3000`);
        toast.success('Analytics data populated!', { id: 'simulateToast' });
      } else {
        toast.error(json.error || 'Failed to launch campaign');
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStopCampaign = async () => {
    setIsSaving(true);
    try {
      const res = await apiFetch(`/api/campaigns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Stopped' })
      });
      const json = await res.json();
      if (json.success) {
        setCampaign(json.campaign);
        toast.success('Campaign stopped successfully!');
      } else {
        toast.error(json.error || 'Failed to stop campaign');
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
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
        const ch = payload.new.channel;
        setAnalytics((prev: any) => {
          if (!prev) return prev;
          const s = { ...prev.summary };
          const cb = { ...prev.channelBreakdown };
          if (!cb[ch]) cb[ch] = { sent: 0, delivered: 0, opened: 0, clicked: 0, purchased: 0 };
          else cb[ch] = { ...cb[ch] };
          
          const type = ev.toLowerCase();
          const inc = (t: string) => {
              if (s[t] !== undefined) s[t]++;
              if (cb[ch][t] !== undefined) cb[ch][t]++;
          };

          if (type === 'sent') { inc('sent'); }
          if (type === 'delivered') { inc('sent'); inc('delivered'); }
          if (type === 'opened') { inc('sent'); inc('delivered'); inc('opened'); }
          if (type === 'clicked') { inc('sent'); inc('delivered'); inc('opened'); inc('clicked'); }
          if (type === 'purchased') { inc('sent'); inc('delivered'); inc('opened'); inc('clicked'); inc('purchased'); }
          if (type === 'viewed') { inc('sent'); inc('delivered'); inc('opened'); }
          
          return { ...prev, summary: s, channelBreakdown: cb };
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
    isDevSimulatorOpen,
    setIsDevSimulatorOpen,
    editForm,
    setEditForm,
    isSaving,
    editCampaignInWizard,
    handleLaunchNow,
    handleStopCampaign,
    handleSaveCampaign,
  };
}
