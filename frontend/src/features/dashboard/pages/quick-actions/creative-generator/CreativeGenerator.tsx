import { useSearchParams } from 'react-router-dom';
import { Download, Sparkles, Image as ImageIcon, Loader2, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../../../components/ui/Card';
import { apiFetch } from '../../../../../services/api';
import { useCreativeStore } from '../../../../creatives/hooks/useCreativeStore';

/**
 * CreativeGenerator Component
 * 
 * @returns {JSX.Element}
 */
export function CreativeGenerator() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { prompt, setPrompt, isGenerating, setIsGenerating, imageUrl, setImageUrl, error, setError } = useCreativeStore();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description for your creative.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const res = await apiFetch('http://localhost:3001/api/campaigns/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (data.success && data.image_url) {
        setImageUrl(data.image_url);
      } else {
        throw new Error(data.error || 'Failed to generate image');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating the image.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    
    // Create a temporary link to trigger download
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `creative_${new Date().getTime()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col p-6 max-w-[1200px] mx-auto w-full gap-4">
      <button 
        onClick={() => {
          searchParams.delete('view');
          setSearchParams(searchParams);
        }} 
        className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 self-start transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="flex flex-col h-full border border-gray-100 shadow-sm">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100">
            <CardTitle className="text-lg">Design Specifications</CardTitle>
            <CardDescription>Describe the exact image you need for your campaign.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-6 flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-gray-900">Creative Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Premium Indian fashion campaign poster. Stylish urban Indian model aged 20-35, deep purple and white studio backdrop..."
                className="w-full min-h-[160px] p-4 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f62fe] focus:border-transparent transition-all resize-none shadow-inner"
              />
              <p className="text-xs text-gray-500">Be as specific as possible about the subject, setting, colors, and mood.</p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="mt-auto self-end flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0f62fe] text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-500/20"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating Masterpiece...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Generate Creative
                </>
              )}
            </button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="flex flex-col h-full border border-gray-100 shadow-sm overflow-hidden bg-gray-50/30">
          <CardHeader className="bg-white border-b border-gray-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Generated Result</CardTitle>
              <CardDescription>Preview and download your creative asset</CardDescription>
            </div>
            {imageUrl && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition-all shadow-sm"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            )}
          </CardHeader>
          <CardContent className="flex-1 p-6 flex items-center justify-center min-h-[400px]">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-4 text-gray-400">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl opacity-50 animate-pulse"></div>
                  <Loader2 className="h-12 w-12 animate-spin text-[#0f62fe] relative z-10" />
                </div>
                <p className="text-sm font-medium animate-pulse text-[#0f62fe]">Crafting pixels using AI...</p>
              </div>
            ) : imageUrl ? (
              <div className="w-full h-full flex items-center justify-center group relative rounded-xl overflow-hidden shadow-lg border border-gray-100 bg-white">
                <img 
                  src={imageUrl} 
                  alt="Generated creative" 
                  className="max-w-full max-h-[500px] object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-full font-bold shadow-xl hover:scale-105 transition-transform"
                  >
                    <Download className="h-5 w-5" />
                    Download High-Res
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-gray-300">
                <ImageIcon className="h-16 w-16 stroke-[1.5]" />
                <p className="text-sm font-medium text-gray-400">Your generated image will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
