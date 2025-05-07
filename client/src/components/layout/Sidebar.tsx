import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCallback } from "react";
import { UploadIcon, HomeIcon, CompassIcon, TrendingUpIcon, HeartIcon, HeadphonesIcon, Disc3Icon, UserIcon, SettingsIcon, InfoIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import UploadDialog from "@/components/tracks/UploadDialog";

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleUploadClick = useCallback(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to upload tracks",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  return (
    <aside className="desktop-menu w-60 flex-shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col h-full overflow-y-auto py-6 px-3 hidden md:block">
      <div className="flex items-center gap-2 px-3 mb-8">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <MusicIcon className="text-white text-xl" />
        </div>
        <h1 className="text-2xl font-bold font-poppins text-sidebar-foreground">NoteShare</h1>
      </div>

      <nav className="space-y-1 mb-6">
        <NavLink href="/" active={location === "/"}>
          <HomeIcon className="w-5 h-5" />
          <span>Home</span>
        </NavLink>
        
        <NavLink href="/discover" active={location === "/discover"}>
          <CompassIcon className="w-5 h-5" />
          <span>Discover</span>
        </NavLink>
        
        <NavLink href="/trending" active={location === "/trending"}>
          <TrendingUpIcon className="w-5 h-5" />
          <span>Trending</span>
        </NavLink>

        {user && (
          <NavLink href="/liked" active={location === "/liked"}>
            <HeartIcon className="w-5 h-5" />
            <span>Liked</span>
          </NavLink>
        )}
      </nav>

      {user && (
        <div className="px-3">
          <h2 className="text-xs uppercase tracking-wider text-sidebar-foreground/60 font-semibold mb-2">
            Your Library
          </h2>
          <div className="space-y-1">
            <NavLink href="/playlists" active={location === "/playlists"}>
              <HeadphonesIcon className="w-5 h-5" />
              <span>Playlists</span>
            </NavLink>
            
            <NavLink href="/albums" active={location === "/albums"}>
              <Disc3Icon className="w-5 h-5" />
              <span>Albums</span>
            </NavLink>
            
            <NavLink href={`/profile/${user.username}`} active={location.startsWith("/profile")}>
              <UserIcon className="w-5 h-5" />
              <span>Profile</span>
            </NavLink>
          </div>
        </div>
      )}
      
      <div className="mt-auto pt-6 px-3">
        <Dialog>
          <DialogTrigger asChild onClick={handleUploadClick}>
            <Button className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
              <UploadIcon className="w-4 h-4" />
              <span>Upload Track</span>
            </Button>
          </DialogTrigger>
          
          {user && <UploadDialog />}
        </Dialog>
        
        <div className="mt-6 border-t border-sidebar-border pt-4">
          <NavLink href="/settings" active={location === "/settings"}>
            <SettingsIcon className="w-5 h-5" />
            <span>Settings</span>
          </NavLink>
          
          <NavLink href="/help" active={location === "/help"}>
            <InfoIcon className="w-5 h-5" />
            <span>Help</span>
          </NavLink>
          
          {user?.isAdmin && (
            <NavLink href="/admin" active={location === "/admin"}>
              <ShieldIcon className="w-5 h-5" />
              <span>Admin</span>
            </NavLink>
          )}
        </div>
      </div>
    </aside>
  );
}

function NavLink({ 
  href, 
  active, 
  children 
}: { 
  href: string; 
  active: boolean; 
  children: React.ReactNode;
}) {
  return (
    <Link href={href}>
      <a className={cn(
        "flex items-center gap-3 font-medium py-2 px-3 rounded-lg transition-colors",
        active 
          ? "text-sidebar-foreground bg-sidebar-accent/10" 
          : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/10"
      )}>
        {children}
      </a>
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

function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
