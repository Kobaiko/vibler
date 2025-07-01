'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LayeredAdEditor from '@/components/ui/LayeredAdEditor';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface Creative {
  id: string;
  platform: string;
  headline: string;
  description: string;
  call_to_action: string;
  tone: string;
  target_audience: string;
  product_service?: string;
  image_url?: string;
  conversion_score: number;
  created_at: string;
  composition?: {
    baseImage: string;
    finalComposition: string;
    layers: any[];
    dimensions: { width: number; height: number; };
  };
}

export default function EditCreativePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [creative, setCreative] = useState<Creative | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCreativeData = () => {
      try {
        const creativeId = searchParams.get('id');
        if (!creativeId) {
          setError('No creative ID provided');
          setLoading(false);
          return;
        }

        const sessionData = sessionStorage.getItem(`vibler-creative-${creativeId}`);
        if (sessionData) {
          setCreative(JSON.parse(sessionData));
          setLoading(false);
          return;
        }

        const localData = localStorage.getItem('current_creative_edit');
        if (localData) {
          setCreative(JSON.parse(localData));
          setLoading(false);
          return;
        }

        setError('Creative data not found');
        setLoading(false);
      } catch (error) {
        console.error('Error loading creative:', error);
        setError('Failed to load creative data');
        setLoading(false);
      }
    };

    loadCreativeData();
  }, [searchParams]);

  const handleSave = (layers: any[], imageDataUrl: string) => {
    if (!creative) return;

    try {
      const headlineLayer = layers.find((l: any) => l.id === 'headline');
      const descriptionLayer = layers.find((l: any) => l.id === 'description');
      const ctaLayer = layers.find((l: any) => l.id === 'cta-button');
      
      const updatedCreative = {
        ...creative,
        headline: headlineLayer?.content || creative.headline,
        description: descriptionLayer?.content || creative.description,
        call_to_action: ctaLayer?.content || creative.call_to_action,
        composition: {
          baseImage: creative.image_url || '',
          finalComposition: imageDataUrl,
          layers: layers,
          dimensions: { width: 1080, height: 1080 }
        }
      };

      if (creative.id) {
        sessionStorage.setItem(`vibler-creative-${creative.id}`, JSON.stringify(updatedCreative));
      }

      alert('Creative saved successfully!');
      
      if (window.opener) {
        window.close();
      } else {
        router.push('/dashboard/creative');
      }
      
    } catch (error) {
      console.error('Error saving creative:', error);
      alert('Error saving creative. Please try again.');
    }
  };

  const handleClose = () => {
    if (window.opener) {
      window.close();
    } else {
      router.push('/dashboard/creative');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading creative editor...</p>
        </div>
      </div>
    );
  }

  if (error || !creative) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Creative not found'}</p>
          <Button onClick={handleClose} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button onClick={handleClose} variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Creative</h1>
              <p className="text-gray-600">{creative.platform} • {creative.headline}</p>
            </div>
          </div>
        </div>

                    <LayeredAdEditor 
              creative={creative}
              onSave={handleSave}
              onCancel={handleClose}
            />
      </div>
    </div>
  );
}
