import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Plus, ArrowRight, Play, Pause, Clock, Users, MessageSquare, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { useDashboardStore } from '../store/useDashboardStore';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const IconMap: any = {
  Clock,
  Users,
  MessageSquare
};

export const Automations = () => {
  const navigate = useNavigate();
  const { automations, fetchAutomations, toggleAutomation, deleteAutomation } = useDashboardStore();

  React.useEffect(() => {
    fetchAutomations();
  }, [fetchAutomations]);

  const handleToggle = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      await toggleAutomation(id, newStatus);
      toast.success(newStatus === 'active' ? 'Automation activated' : 'Automation paused');
    } catch (error) {
      toast.error('Failed to toggle automation');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this automation?')) {
      try {
        await deleteAutomation(id);
        toast.success('Automation deleted');
      } catch (error) {
        toast.error('Failed to delete automation');
      }
    }
  };

  return (
    <div className="flex-1 p-8 max-w-[1458px] mx-auto w-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Automations</h1>
          <p className="text-gray-500 mt-2">Design and manage background workflows to engage your audience automatically.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/automations/new')}
          className="bg-[#0f62fe] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#0353e9] transition-all shadow-sm"
        >
          <Plus className="h-5 w-5" />
          Create Workflow
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {automations.isLoading ? (
          <div className="col-span-3 py-12 flex justify-center text-gray-400">Loading workflows...</div>
        ) : (
          automations.list.map((workflow) => {
            const Icon = IconMap[workflow.icon] || Zap;
          const isActive = workflow.status === 'active';
          
          return (
            <Card 
              key={workflow.id} 
              onClick={() => navigate(`/automations/${workflow.id}`)}
              className="relative overflow-hidden group hover:border-[#0f62fe]/30 hover:shadow-md cursor-pointer transition-all"
            >
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${workflow.bgColor}`}>
                    <Icon className={`h-6 w-6 ${workflow.color}`} />
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(workflow.id);
                      }}
                      className="p-1.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete Automation"
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggle(workflow.id, workflow.status);
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all hover:opacity-80 ${isActive ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                      {isActive ? <Play className="h-3 w-3 fill-current" /> : <Pause className="h-3 w-3 fill-current" />}
                      {isActive ? 'Active' : 'Paused'}
                    </motion.button>
                  </div>
                </div>
                <CardTitle className="text-lg">{workflow.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-6 h-10">{workflow.description}</p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Trigger</span>
                    <span className="font-semibold text-gray-900">{workflow.triggers}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Actions</span>
                    <span className="font-semibold text-gray-900">{workflow.actions}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                  <div>
                    <div className="text-xs text-gray-500 font-medium mb-0.5">Converted</div>
                    <div className="font-bold text-gray-900">{workflow.stats_converted} <span className="text-gray-400 font-normal text-xs">/ {workflow.stats_sent}</span></div>
                  </div>
                  <button className="text-[#0f62fe] p-2 hover:bg-blue-50 rounded-lg transition-colors">
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </CardContent>
            </Card>
          );
        }))}

        <button 
          onClick={() => navigate('/automations/new')}
          className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:text-[#0f62fe] hover:border-[#0f62fe] hover:bg-blue-50/50 transition-all min-h-[320px]"
        >
          <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
            <Plus className="h-6 w-6" />
          </div>
          <span className="font-bold">Build from scratch</span>
          <span className="text-sm mt-1">Start a blank workflow canvas</span>
        </button>
      </div>
    </div>
  );
};
