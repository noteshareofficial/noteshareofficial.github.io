import { Helmet } from 'react-helmet';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UsersIcon, MusicIcon, ShieldIcon, BanIcon, CheckCircleIcon } from 'lucide-react';

export default function Admin() {
  const { user } = useAuth();
  
  // Check if user is admin
  if (!user?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-6 max-w-md">
          <ShieldIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You don't have permission to access the admin dashboard.
          </p>
          <Button asChild>
            <a href="/">Return to Home</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - NoteShare</title>
        <meta name="description" content="NoteShare Admin Dashboard" />
      </Helmet>
      
      <div className="p-4 md:p-8 space-y-8">
        <section className="bg-card p-6 rounded-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage users, tracks, and reports</p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full flex items-center">
                <ShieldIcon className="h-3 w-3 mr-1" />
                <span>Admin Mode</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-muted p-4 rounded-lg">
              <UsersIcon className="h-8 w-8 text-primary/50 mb-2" />
              <div className="text-2xl font-bold">120</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </div>
            
            <div className="bg-muted p-4 rounded-lg">
              <MusicIcon className="h-8 w-8 text-primary/50 mb-2" />
              <div className="text-2xl font-bold">350</div>
              <div className="text-sm text-muted-foreground">Total Tracks</div>
            </div>
            
            <div className="bg-muted p-4 rounded-lg">
              <BanIcon className="h-8 w-8 text-destructive/50 mb-2" />
              <div className="text-2xl font-bold">5</div>
              <div className="text-sm text-muted-foreground">Active Reports</div>
            </div>
          </div>
        </section>
        
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid grid-cols-3 md:w-auto md:inline-flex">
            <TabsTrigger value="users" className="flex items-center gap-1">
              <UsersIcon className="h-4 w-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-1">
              <MusicIcon className="h-4 w-4" />
              <span>Content</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-1">
              <BanIcon className="h-4 w-4" />
              <span>Reports</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="mt-6">
            <div className="bg-card p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-4">User Management</h2>
              
              <div className="relative overflow-x-auto rounded-md border">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Username</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { username: 'johndoe', email: 'john@example.com', status: 'Active' },
                      { username: 'janedoe', email: 'jane@example.com', status: 'Active' },
                      { username: 'suspended_user', email: 'suspended@example.com', status: 'Suspended' }
                    ].map((user, index) => (
                      <tr key={user.username} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                        <td className="px-4 py-3 font-medium">{user.username}</td>
                        <td className="px-4 py-3">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                            user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status === 'Active' ? <CheckCircleIcon className="h-3 w-3 mr-1" /> : <BanIcon className="h-3 w-3 mr-1" />}
                            {user.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Button size="sm" variant="ghost">Edit</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="content" className="mt-6">
            <div className="bg-card p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-4">Content Management</h2>
              <p className="text-muted-foreground">
                Content management features will appear here in the full application.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="reports" className="mt-6">
            <div className="bg-card p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-4">Reports</h2>
              <p className="text-muted-foreground">
                User reports and content flagging will appear here in the full application.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}