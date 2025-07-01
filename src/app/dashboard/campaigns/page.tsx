'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Plus, Calendar, Target, Users, Palette, Eye, Edit, Trash2, Download } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  brand: any;
  icp: any;
  strategy: any;
  creatives: any[];
  created_at: string;
  status: string;
}

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    // Load campaigns from localStorage
    const savedCampaigns = localStorage.getItem('campaigns');
    if (savedCampaigns) {
      setCampaigns(JSON.parse(savedCampaigns));
    }
  }, []);

  const handleDeleteCampaign = (campaignId: string) => {
    const updatedCampaigns = campaigns.filter(c => c.id !== campaignId);
    setCampaigns(updatedCampaigns);
    localStorage.setItem('campaigns', JSON.stringify(updatedCampaigns));
  };

  const handleDownloadCampaign = (campaign: Campaign) => {
    const blob = new Blob([JSON.stringify(campaign, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${campaign.name.replace(/\s+/g, '_')}_campaign.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
              <p className="text-gray-600 mt-2">
                Manage all your marketing campaigns in one place
              </p>
            </div>
            <Button 
              onClick={() => router.push('/wizard')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </div>
        </div>

        {/* Campaigns Grid */}
        {campaigns.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first marketing campaign using our guided wizard
            </p>
            <Button 
              onClick={() => router.push('/wizard')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Start Your First Campaign
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant={campaign.status === 'active' ? 'default' : 'secondary'}
                      className={campaign.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {campaign.status}
                    </Badge>
                    <span className="text-sm text-gray-500 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(campaign.created_at)}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{campaign.name}</CardTitle>
                  <CardDescription>
                    {campaign.brand?.brandName} • {campaign.brand?.industry}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Campaign Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {campaign.strategy?.targetChannels?.primary?.length || 0}
                        </div>
                        <div className="text-xs text-blue-700">Channels</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {campaign.creatives?.length || 0}
                        </div>
                        <div className="text-xs text-green-700">Creatives</div>
                      </div>
                    </div>

                    {/* Key Info */}
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Users className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">Target: {campaign.icp?.jobTitle}</span>
                      </div>
                      
                      {campaign.strategy?.targetChannels?.primary && (
                        <div className="flex items-start text-sm">
                          <Target className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                          <div>
                            <span className="text-gray-600">Primary: </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {campaign.strategy.targetChannels.primary.slice(0, 2).map((channel: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {channel}
                                </Badge>
                              ))}
                              {campaign.strategy.targetChannels.primary.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{campaign.strategy.targetChannels.primary.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 pt-4 border-t">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => router.push(`/dashboard/campaign/${campaign.id}`)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadCampaign(campaign)}
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteCampaign(campaign.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        {campaigns.length > 0 && (
          <div className="mt-12 bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="p-4 h-auto flex-col"
                onClick={() => router.push('/wizard')}
              >
                <Plus className="w-6 h-6 mb-2 text-purple-600" />
                <span className="font-medium">Create New Campaign</span>
                <span className="text-sm text-gray-500">Start the guided wizard</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="p-4 h-auto flex-col"
                onClick={() => router.push('/dashboard/creative')}
              >
                <Palette className="w-6 h-6 mb-2 text-pink-600" />
                <span className="font-medium">Creative Generator</span>
                <span className="text-sm text-gray-500">Create individual ads</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="p-4 h-auto flex-col"
                onClick={() => router.push('/dashboard')}
              >
                <Target className="w-6 h-6 mb-2 text-blue-600" />
                <span className="font-medium">Dashboard</span>
                <span className="text-sm text-gray-500">View all tools</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 