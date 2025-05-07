import { User } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";
import { UserPlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/hooks/useUser";
import { useToast } from "@/hooks/use-toast";

interface ArtistCardProps {
  user: User;
  followersCount: number;
  isFollowing?: boolean;
  className?: string;
}

export default function ArtistCard({ 
  user, 
  followersCount, 
  isFollowing: initialIsFollowing = false,
  className 
}: ArtistCardProps) {
  const { user: currentUser } = useAuth();
  const { toggleFollow } = useUser();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isHovered, setIsHovered] = useState(false);
  
  const handleFollowClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to follow users",
        variant: "destructive",
      });
      return;
    }
    
    if (currentUser.id === user.id) {
      toast({
        title: "Cannot follow yourself",
        description: "You cannot follow your own account",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await toggleFollow(user.id);
      setIsFollowing(!isFollowing);
      
      toast({
        title: isFollowing ? "Unfollowed" : "Following",
        description: isFollowing 
          ? `You are no longer following ${user.displayName}` 
          : `You are now following ${user.displayName}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className={cn("text-center", className)}>
      <Link href={`/profile/${user.username}`}>
        <a>
          <div 
            className="relative mx-auto w-24 h-24 rounded-full overflow-hidden mb-2 group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Avatar className="w-full h-full">
              <AvatarImage src={user.profilePicture} alt={user.displayName} className="w-full h-full object-cover" />
              <AvatarFallback className="text-2xl">{user.displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            
            {currentUser && currentUser.id !== user.id && (
              <div 
                className={cn(
                  "absolute inset-0 bg-primary/40 flex items-center justify-center transition-opacity",
                  isHovered ? "opacity-100" : "opacity-0"
                )}
              >
                <button 
                  className="text-white hover:scale-110 transition-transform"
                  onClick={handleFollowClick}
                >
                  <UserPlusIcon className="h-6 w-6" />
                </button>
              </div>
            )}
          </div>
          <h3 className="font-medium text-foreground">{user.displayName}</h3>
          <p className="text-muted-foreground text-xs">{followersCount} followers</p>
        </a>
      </Link>
    </div>
  );
}
