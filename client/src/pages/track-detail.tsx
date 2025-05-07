import { Helmet } from 'react-helmet';
import { useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { HeartIcon, MessageCircleIcon, Share2Icon, PlayIcon } from 'lucide-react';

export default function TrackDetail() {
  // Get track ID from URL
  const [, params] = useRoute('/track/:id');
  const trackId = params?.id;
  
  // Placeholder track data (in a real app, this would come from an API call)
  const track = {
    id: trackId,
    title: 'Sample Track',
    artist: 'Sample Artist',
    uploadDate: '2 weeks ago',
    plays: '10.5K',
    genre: 'Electronic',
    description: 'This is a sample track description. In a real application, this would contain information about the track provided by the artist.',
    waveform: 'https://images.unsplash.com/photo-1519419166318-4f5c601b8e6c?fit=crop&h=100&w=800',
    coverImage: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?fit=crop&w=300&h=300'
  };

  return (
    <>
      <Helmet>
        <title>{track.title} by {track.artist} - NoteShare</title>
        <meta name="description" content={`Listen to ${track.title} by ${track.artist} on NoteShare.`} />
      </Helmet>
      
      <div className="p-4 md:p-8 space-y-8">
        <section className="bg-card p-6 rounded-xl">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Track artwork */}
            <div className="md:w-64 flex-shrink-0">
              <img 
                src={track.coverImage} 
                alt={`${track.title} cover art`} 
                className="w-full aspect-square object-cover rounded-md"
              />
            </div>
            
            {/* Track info */}
            <div className="flex-1">
              <div className="mb-4">
                <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-full mb-2">
                  {track.genre}
                </span>
                <h1 className="text-2xl md:text-3xl font-bold mb-1">{track.title}</h1>
                <p className="text-muted-foreground">{track.artist}</p>
              </div>
              
              <div className="mb-6 flex items-center text-sm text-muted-foreground gap-4">
                <span>{track.uploadDate}</span>
                <span>{track.plays} plays</span>
              </div>
              
              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 mb-6">
                <Button className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2">
                  <PlayIcon className="h-4 w-4" />
                  <span>Play</span>
                </Button>
                
                <Button variant="outline" className="flex items-center gap-2">
                  <HeartIcon className="h-4 w-4" />
                  <span>Like</span>
                </Button>
                
                <Button variant="outline" className="flex items-center gap-2">
                  <MessageCircleIcon className="h-4 w-4" />
                  <span>Comment</span>
                </Button>
                
                <Button variant="outline" className="flex items-center gap-2">
                  <Share2Icon className="h-4 w-4" />
                  <span>Share</span>
                </Button>
              </div>
              
              {/* Waveform visualization (placeholder) */}
              <div className="mb-6">
                <img 
                  src={track.waveform} 
                  alt="Audio waveform" 
                  className="w-full h-24 object-cover rounded-md"
                />
              </div>
              
              {/* Track description */}
              <div>
                <h2 className="font-semibold mb-2">About</h2>
                <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                  {track.description}
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Comments section placeholder */}
        <section className="bg-card p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Comments</h2>
          <p className="text-muted-foreground text-sm">
            Comments will appear here in the full application.
          </p>
        </section>
      </div>
    </>
  );
}