import React, { useState, useEffect } from 'react';
import { MessageSquare, Mail, Camera, CheckCircle2, Link2, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';

const INTEGRATIONS = [
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    provider: 'Twilio',
    icon: MessageSquare,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: 'Send automated WhatsApp messages to customers.',
  },
  {
    id: 'email',
    name: 'Email Marketing',
    provider: 'SendGrid',
    icon: Mail,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: 'Dispatch beautifully formatted HTML emails.',
  },
  {
    id: 'instagram',
    name: 'Instagram Direct',
    provider: 'Meta Graph API',
    icon: Camera,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    description: 'Send automated DM sequences via Instagram.',
  }
];

export const Integrations = () => {
  const [connections, setConnections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem('omni_integrations');
    if (saved) {
      setConnections(JSON.parse(saved));
    }
  }, []);

  const toggleConnection = (id: string) => {
    setConnections(prev => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem('omni_integrations', JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="w-full">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {INTEGRATIONS.map((integration) => {
          const isConnected = !!connections[integration.id];
          const Icon = integration.icon;

          return (
            <Card key={integration.id} className="relative overflow-hidden group">
              {isConnected && (
                <div className="absolute top-0 right-0 p-4">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
              )}
              <CardHeader className="pb-4">
                <div className={`w-12 h-12 rounded-xl ${integration.bgColor} flex items-center justify-center mb-4`}>
                  <Icon className={`h-6 w-6 ${integration.color}`} />
                </div>
                <CardTitle className="text-xl">{integration.name}</CardTitle>
                <CardDescription className="text-sm font-medium text-gray-500">
                  via {integration.provider}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-6 h-10">
                  {integration.description}
                </p>
                <button
                  onClick={() => toggleConnection(integration.id)}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${
                    isConnected 
                      ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100' 
                      : 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-sm'
                  }`}
                >
                  <Link2 className="h-4 w-4" />
                  {isConnected ? 'Disconnect' : 'Connect Account'}
                </button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
