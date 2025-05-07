import { Helmet } from 'react-helmet';

export default function Trending() {
  return (
    <>
      <Helmet>
        <title>Trending Music - NoteShare</title>
        <meta name="description" content="Explore trending tracks and popular artists on NoteShare." />
      </Helmet>
      
      <div className="p-4 md:p-8 space-y-8">
        <section className="bg-card p-8 rounded-xl">
          <h1 className="text-3xl font-bold mb-4">Trending Now</h1>
          <p className="text-muted-foreground max-w-3xl mb-8">
            Discover what's hot right now in the NoteShare community.
          </p>
          
          <div className="space-y-6">
            <div className="bg-muted p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Top Tracks This Week</h2>
              <div className="space-y-3">
                {[
                  { title: 'Summer Vibes', artist: 'DJ Sunny', plays: '12.5K' },
                  { title: 'Midnight Dreams', artist: 'Luna', plays: '10.2K' },
                  { title: 'Urban Beat', artist: 'The City Crew', plays: '9.7K' },
                  { title: 'Ocean Waves', artist: 'Serene', plays: '8.3K' },
                  { title: 'Mountain High', artist: 'Peak Climbers', plays: '7.9K' }
                ].map((track, index) => (
                  <div key={track.title} className="px-4 py-3 bg-background rounded-md flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-semibold text-muted-foreground">{index + 1}</span>
                      <div>
                        <p className="font-medium">{track.title}</p>
                        <p className="text-sm text-muted-foreground">{track.artist}</p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">{track.plays} plays</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-muted p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Trending Artists</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {[
                  'DJ Sunny',
                  'Luna',
                  'The City Crew',
                  'Serene',
                  'Peak Climbers'
                ].map(artist => (
                  <div key={artist} className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-2">
                      <span className="text-primary text-xl font-bold">{artist[0]}</span>
                    </div>
                    <p className="font-medium text-sm">{artist}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}