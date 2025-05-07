import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

// Simplified home page without components that use Auth or AudioPlayer contexts
export default function Home() {
  return (
    <>
      <Helmet>
        <title>NoteShare - Share Your Sound</title>
        <meta name="description" content="Discover and share music with NoteShare. Listen to trending tracks, follow your favorite artists, and upload your own music." />
        <meta property="og:title" content="NoteShare - Share Your Sound" />
        <meta property="og:description" content="Discover and share music with NoteShare. Listen to trending tracks, follow your favorite artists, and upload your own music." />
      </Helmet>

      <div className="p-4 md:p-8 space-y-8">
        {/* Hero Section */}
        <section className="bg-card p-8 rounded-xl">
          <h1 className="text-3xl md:text-4xl font-bold font-poppins mb-4">Welcome to NoteShare</h1>
          <p className="text-muted-foreground mb-6 max-w-xl">
            A platform for music lovers to discover, share, and enjoy music together.
            We're currently working on some technical updates to improve your experience.
          </p>
          
          <div className="flex flex-col space-y-4">
            <div className="p-4 bg-muted rounded-md">
              <h2 className="text-xl font-semibold mb-2">Features Coming Soon</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>Discover trending tracks from around the world</li>
                <li>Follow your favorite artists and get updates</li>
                <li>Create and share playlists with your friends</li>
                <li>Upload and share your own music</li>
              </ul>
            </div>
            
            <div className="p-4 bg-primary/10 rounded-md">
              <h2 className="text-xl font-semibold mb-2">Technical Update</h2>
              <p className="mb-2">
                We're currently resolving some issues with our application structure.
                Thank you for your patience!
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
