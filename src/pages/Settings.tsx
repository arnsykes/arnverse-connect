import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, Camera, Eye, EyeOff, LogOut, Trash2, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Settings() {
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    displayName: user?.display_name || "",
    bio: user?.bio || "",
    avatar: user?.avatar || ""
  });
  
  // Username change state
  const [newUsername, setNewUsername] = useState("");
  const [usernameChangeDate] = useState(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)); // 6 days ago for demo
  const canChangeUsername = Date.now() - usernameChangeDate.getTime() >= 7 * 24 * 60 * 60 * 1000;
  const daysRemaining = Math.ceil((7 * 24 * 60 * 60 * 1000 - (Date.now() - usernameChangeDate.getTime())) / (24 * 60 * 60 * 1000));
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    privateAccount: false,
    allowComments: true,
    showOnlineStatus: true
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canChangeUsername) return;
    
    setIsLoading(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      toast({
        title: "Username updated",
        description: "Your username has been changed successfully.",
      });
      setNewUsername("");
    } catch (error) {
      toast({
        title: "Username change failed",
        description: "Failed to change username. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New passwords do not match.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast({
        title: "Password change failed",
        description: "Failed to change password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    // API call would go here
    toast({
      title: "Account deletion initiated",
      description: "Your account deletion request has been processed.",
      variant: "destructive"
    });
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Profile Settings */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your profile details and avatar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profileData.avatar} />
                <AvatarFallback>{user.display_name?.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <Button variant="outline" type="button">
                <Camera className="mr-2 h-4 w-4" />
                Change Avatar
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={profileData.displayName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                  className="glass"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={user.username}
                  disabled
                  className="glass opacity-50"
                />
                <p className="text-xs text-muted-foreground">
                  Username can be changed in the Username section below
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell the cosmos about yourself..."
                value={profileData.bio}
                onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                className="glass resize-none"
                rows={3}
              />
            </div>
            
            <Button type="submit" variant="cosmic" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Profile"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Username Change */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Username Change
            {!canChangeUsername && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {daysRemaining} days left
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            You can change your username once every 7 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUsernameChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newUsername">New Username</Label>
              <Input
                id="newUsername"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter new username"
                disabled={!canChangeUsername}
                className="glass"
              />
              {!canChangeUsername && (
                <p className="text-sm text-muted-foreground">
                  You can change your username again in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}.
                </p>
              )}
            </div>
            
            <Button 
              type="submit" 
              variant="outline" 
              disabled={!canChangeUsername || !newUsername.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing...
                </>
              ) : (
                "Change Username"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="glass pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="glass pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="glass"
              />
            </div>
            
            <Button type="submit" variant="outline" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
          <CardDescription>Control your account privacy and visibility</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Private Account</Label>
              <p className="text-sm text-muted-foreground">Only approved followers can see your posts</p>
            </div>
            <Switch
              checked={privacySettings.privateAccount}
              onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, privateAccount: checked }))}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Allow Comments</Label>
              <p className="text-sm text-muted-foreground">Let others comment on your posts</p>
            </div>
            <Switch
              checked={privacySettings.allowComments}
              onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, allowComments: checked }))}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Show Online Status</Label>
              <p className="text-sm text-muted-foreground">Display when you're active</p>
            </div>
            <Switch
              checked={privacySettings.showOnlineStatus}
              onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, showOnlineStatus: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
          <CardDescription>Manage your account access and data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" onClick={logout} className="w-full md:w-auto">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
          
          <Separator />
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full md:w-auto">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove all your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}