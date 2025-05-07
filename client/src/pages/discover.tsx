import { Helmet } from 'react-helmet';

export default function Discover() {
  return (
    <>
      <Helmet>
        <title>Discover Music - NoteShare</title>
        <meta name="description" content="Discover new music, artists, and genres on NoteShare." />
      </Helmet>
      
      <div className="p-4 md:p-8 space-y-8">
        <section className="bg-card p-8 rounded-xl">
          <h1 className="text-3xl font-bold mb-4">Discover Music</h1>
          <p className="text-muted-foreground max-w-3xl mb-8">
            Explore new sounds, artists, and genres. Find your next favorite track!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-muted p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Explore by Genre</h2>
              <p className="text-sm text-muted-foreground mb-4">Find music based on your favorite genres</p>
              <div className="flex flex-wrap gap-2">
                {['Pop', 'Rock', 'Hip Hop', 'Electronic', 'Jazz', 'Classical'].map(genre => (
                  <div key={genre} className="px-3 py-1 bg-background rounded-full text-sm">
                    {genre}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-muted p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">New Releases</h2>
              <p className="text-sm text-muted-foreground mb-4">The latest tracks from our community</p>
              <div className="space-y-2">
                {['Midnight Dreams', 'Summer Breeze', 'Urban Jungle', 'Ocean Waves'].map(track => (
                  <div key={track} className="px-3 py-2 bg-background rounded-md text-sm flex justify-between">
                    <span>{track}</span>
                    <span className="text-primary">Play</span>
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