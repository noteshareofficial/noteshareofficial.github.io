import { Link, useLocation } from "wouter";
import { HomeIcon, SearchIcon, PlusIcon, HeartIcon, UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import UploadDialog from "@/components/tracks/UploadDialog";
import { useToast } from "@/hooks/use-toast";
import { useCallback } from "react";

export default function MobileNavigation() {
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
    <div className="mobile-menu fixed bottom-16 inset-x-0 bg-sidebar border-t border-sidebar-border py-2 px-4 z-10 md:hidden">
      <div className="flex justify-around">
        <NavItem href="/" active={location === "/"} icon={<HomeIcon className="text-lg w-5 h-5" />} label="Home" />
        
        <NavItem href="/discover" active={location === "/discover"} icon={<SearchIcon className="text-lg w-5 h-5" />} label="Search" />
        
        <Dialog>
          <DialogTrigger asChild onClick={handleUploadClick}>
            <button className={cn(
              "flex flex-col items-center",
              user ? "text-sidebar-foreground/60" : "text-sidebar-foreground/40"
            )}>
              <PlusIcon className="text-lg w-5 h-5" />
              <span className="text-xs mt-1">Upload</span>
            </button>
          </DialogTrigger>
          
          {user && <UploadDialog />}
        </Dialog>
        
        <NavItem 
          href={user ? "/liked" : "/login"} 
          active={location === "/liked"} 
          icon={<HeartIcon className="text-lg w-5 h-5" />} 
          label="Library" 
        />
        
        <NavItem 
          href={user ? `/profile/${user.username}` : "/login"} 
          active={location.startsWith("/profile")} 
          icon={<UserIcon className="text-lg w-5 h-5" />} 
          label="Profile" 
        />
      </div>
    </div>
  );
}

function NavItem({ 
  href, 
  active, 
  icon, 
  label 
}: { 
  href: string; 
  active: boolean; 
  icon: React.ReactNode; 
  label: string;
}) {
  return (
    <Link href={href}>
      <a className={cn(
        "flex flex-col items-center",
        active 
          ? "text-primary" 
          : "text-sidebar-foreground/60"
      )}>
        {icon}
        <span className="text-xs mt-1">{label}</span>
      </a>
    </Link>
  );
}
