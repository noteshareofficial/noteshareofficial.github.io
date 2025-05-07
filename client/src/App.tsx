import { useState } from "react";
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Discover from "@/pages/discover";
import Trending from "@/pages/trending";
import Profile from "@/pages/profile";
import TrackDetail from "@/pages/track-detail";
import Admin from "@/pages/admin";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  HomeIcon, 
  CompassIcon, 
  TrendingUpIcon, 
  UserIcon, 
  UploadIcon,
  LogInIcon
} from "lucide-react";
import AuthDialog from "@/components/auth/AuthDialog";

function NavLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link href={href}>
      <div className="px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground flex items-center gap-1.5 cursor-pointer">
        {icon}
        <span>{children}</span>
      </div>
    </Link>
  );
}

function MusicIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

// App component without direct Firebase auth integration
function App() {  
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  
  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen">
        {/* Navbar */}
        <header className="bg-card border-b border-border px-4 py-3">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <MusicIcon className="text-white h-5 w-5" />
              </div>
              <Link href="/">
                <div className="font-bold text-xl cursor-pointer">NoteShare</div>
              </Link>
            </div>
            
            <nav className="hidden md:flex items-center space-x-1">
              <NavLink href="/" icon={<HomeIcon className="h-4 w-4" />}>Home</NavLink>
              <NavLink href="/discover" icon={<CompassIcon className="h-4 w-4" />}>Discover</NavLink>
              <NavLink href="/trending" icon={<TrendingUpIcon className="h-4 w-4" />}>Trending</NavLink>
              <NavLink href="/profile/user" icon={<UserIcon className="h-4 w-4" />}>Profile</NavLink>
            </nav>
            
            <div className="flex items-center gap-2">
              <Button 
                size="sm"
                className="flex items-center gap-1"
                onClick={() => setAuthDialogOpen(true)}
              >
                <LogInIcon className="h-4 w-4" />
                <span>Login</span>
              </Button>
              <Button size="sm" className="flex items-center gap-1">
                <UploadIcon className="h-4 w-4" />
                <span>Upload</span>
              </Button>
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="container mx-auto px-4 py-8">
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/discover" component={Discover} />
              <Route path="/trending" component={Trending} />
              <Route path="/profile/:username" component={Profile} />
              <Route path="/track/:id" component={TrackDetail} />
              <Route path="/admin" component={Admin} />
              <Route component={NotFound} />
            </Switch>
          </div>
        </main>
        
        {/* Footer */}
        <footer className="bg-card border-t border-border px-4 py-6">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-sm text-muted-foreground">© 2025 NoteShare. All rights reserved.</p>
              </div>
              <div className="flex space-x-6">
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms</a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Contact</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
      
      {/* Auth Dialog */}
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
      
      <Toaster />
    </TooltipProvider>
  );
}

export default App;