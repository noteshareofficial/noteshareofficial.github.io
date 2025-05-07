import { Helmet } from 'react-helmet';
import { useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserIcon, MusicIcon, HeadphonesIcon, UsersIcon, SettingsIcon } from 'lucide-react';

export default function Profile() {
  // Get username from URL
  const [, params] = useRoute('/profile/:username');
  const username = params?.username || 'user';
  
  // Placeholder user data
  const user = {
    username,
    displayName: username.charAt(0).toUpperCase() + username.slice(1),
    bio: 'This is a sample user profile. In a real application, this would show details about the user.',
    followers: 120,
    following: 45,
    tracks: 8,
    joined: 'January 2025'
  };

  return (
    <>
      <Helmet>
        <title>{user.displayName} - NoteShare</title>
        <meta name="description" content={`Check out ${user.displayName}'s profile on NoteShare. Listen to their tracks and playlists.`} />
      </Helmet>
      
      <div className="p-4 md:p-8 space-y-8">
        {/* Profile header */}
        <section className="bg-card p-6 rounded-xl">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Profile picture */}
            <div className="w-24 h-24 md:w-32 md:h-32 bg-primary/10 rounded-full flex items-center justify-center">
              <UserIcon className="w-12 h-12 md:w-16 md:h-16 text-primary/50" />
            </div>
            
            {/* User info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{user.displayName}</h1>
              <p className="text-muted-foreground mb-4">{user.bio}</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-semibold">{user.tracks}</div>
                  <div className="text-xs text-muted-foreground">Tracks</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-semibold">{user.followers}</div>
                  <div className="text-xs text-muted-foreground">Followers</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-semibold">{user.following}</div>
                  <div className="text-xs text-muted-foreground">Following</div>
                </div>
              </div>
              
              <div className="flex justify-center md:justify-start gap-2">
                <Button className="bg-primary hover:bg-primary/90">Follow</Button>
                <Button variant="outline">Share</Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Tabs for different content sections */}
        <Tabs defaultValue="tracks" className="w-full">
          <TabsList className="grid grid-cols-4 md:w-auto md:inline-flex">
            <TabsTrigger value="tracks" className="flex items-center gap-1">
              <MusicIcon className="h-4 w-4" />
              <span className="hidden md:inline">Tracks</span>
            </TabsTrigger>
            <TabsTrigger value="playlists" className="flex items-center gap-1">
              <HeadphonesIcon className="h-4 w-4" />
              <span className="hidden md:inline">Playlists</span>
            </TabsTrigger>
            <TabsTrigger value="following" className="flex items-center gap-1">
              <UsersIcon className="h-4 w-4" />
              <span className="hidden md:inline">Following</span>
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-1">
              <SettingsIcon className="h-4 w-4" />
              <span className="hidden md:inline">About</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tracks" className="mt-6">
            <div className="bg-card p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-4">Tracks</h2>
              <p className="text-muted-foreground">
                This user's tracks will appear here in the full application.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="playlists" className="mt-6">
            <div className="bg-card p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-4">Playlists</h2>
              <p className="text-muted-foreground">
                This user's playlists will appear here in the full application.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="following" className="mt-6">
            <div className="bg-card p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-4">Following</h2>
              <p className="text-muted-foreground">
                Users that this person follows will appear here in the full application.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="about" className="mt-6">
            <div className="bg-card p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-4">About</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-muted-foreground mb-1">Username</h3>
                  <p>{user.username}</p>
                </div>
                <div>
                  <h3 className="font-medium text-muted-foreground mb-1">Joined</h3>
                  <p>{user.joined}</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}