import { Link } from "wouter";
import { SearchIcon, MenuIcon, BellIcon, ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import AuthDialog from "@/components/auth/AuthDialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Sidebar from "./Sidebar";

export default function TopBar() {
  const [search, setSearch] = useState("");
  const { user, logout } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    // Handle search
    console.log("Search for:", search);
  }, [search]);

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  return (
    <header className="sticky top-0 bg-background/80 backdrop-blur-md z-10 px-4 md:px-8 py-4 border-b border-border flex justify-between items-center">
      <div className="flex items-center gap-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <MenuIcon className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <Sidebar />
          </SheetContent>
        </Sheet>
        
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <Input
            type="text"
            placeholder="Search tracks, artists, or playlists"
            className="w-full bg-muted/50 border border-border text-foreground placeholder-muted-foreground py-2 px-4 pr-10 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button 
            type="submit" 
            variant="ghost" 
            size="icon" 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <SearchIcon className="h-4 w-4" />
          </Button>
        </form>
      </div>
      
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
        >
          <BellIcon className="h-5 w-5 text-muted-foreground hover:text-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
        </Button>
        
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 hover:bg-muted/50 py-1 px-2 rounded">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.profilePicture} alt={user.displayName} />
                  <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-medium hidden md:inline">{user.displayName}</span>
                <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/profile/${user.username}`}>
                  <a className="cursor-pointer w-full">Profile</a>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <a className="cursor-pointer w-full">Settings</a>
                </Link>
              </DropdownMenuItem>
              {user.isAdmin && (
                <DropdownMenuItem asChild>
                  <Link href="/admin">
                    <a className="cursor-pointer w-full">Admin Dashboard</a>
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" className="text-foreground font-medium hover:text-primary">
                  Log in
                </Button>
              </DialogTrigger>
              <AuthDialog initialView="login" />
            </Dialog>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-lg transition-colors">
                  Sign up
                </Button>
              </DialogTrigger>
              <AuthDialog initialView="register" />
            </Dialog>
          </div>
        )}
      </div>
    </header>
  );
}
