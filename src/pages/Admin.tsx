import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FolderPlus, Users, Image } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Album {
  id: string;
  couple_names: string;
}

const Admin = () => {
  const { toast } = useToast();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [coupleNames, setCoupleNames] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState("");
  const [uploadPhotos, setUploadPhotos] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const coverPhotoInputRef = useRef<HTMLInputElement>(null);
  const photosInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      const { data, error } = await supabase
        .from('albums')
        .select('id, couple_names')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlbums(data || []);
    } catch (error) {
      console.error('Error fetching albums:', error);
    }
  };

  const handleCreateAlbum = async () => {
    if (!coupleNames || !eventDate || !coverPhoto) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields and select a cover photo",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const accessCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      const formData = new FormData();
      formData.append('action', 'create_album');
      formData.append('coupleNames', coupleNames);
      formData.append('eventDate', eventDate);
      formData.append('coverPhoto', coverPhoto);
      formData.append('accessCode', accessCode);

      const { data, error } = await supabase.functions.invoke('google-drive-upload', {
        body: formData,
      });

      if (error) throw error;

      toast({
        title: "Album Created",
        description: `Album created successfully! Access code: ${accessCode}`,
      });

      setCoupleNames("");
      setEventDate("");
      setCoverPhoto(null);
      if (coverPhotoInputRef.current) coverPhotoInputRef.current.value = "";
      fetchAlbums(); // Refresh albums list
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to create album",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadPhotos = async () => {
    if (!selectedAlbumId || uploadPhotos.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select an album and photos to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('action', 'upload_photos');
      formData.append('albumId', selectedAlbumId);
      uploadPhotos.forEach(photo => {
        formData.append('photos', photo);
      });

      const { data, error } = await supabase.functions.invoke('google-drive-upload', {
        body: formData,
      });

      if (error) throw error;

      toast({
        title: "Photos Uploaded",
        description: `Successfully uploaded ${uploadPhotos.length} photos`,
      });

      setUploadPhotos([]);
      if (photosInputRef.current) photosInputRef.current.value = "";
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload photos",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <h1 className="font-serif text-2xl font-bold text-primary">Moments Studio</h1>
            </Link>
            <div className="flex gap-4">
              <Link to="/albums">
                <Button variant="ghost">View Albums</Button>
              </Link>
              <Button variant="outline">Logout</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="py-12 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-4xl font-bold mb-4">Admin Dashboard</h2>
          <p className="text-muted-foreground text-lg">
            Manage albums, upload photos, and control access
          </p>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-primary/10 p-3">
                  <FolderPlus className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm text-muted-foreground">Total Albums</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-accent/10 p-3">
                  <Image className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">3,847</p>
                  <p className="text-sm text-muted-foreground">Total Photos</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-primary-glow/10 p-3">
                  <Users className="h-6 w-6 text-primary-glow" />
                </div>
                <div>
                  <p className="text-2xl font-bold">234</p>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-secondary/50 p-3">
                  <Upload className="h-6 w-6 text-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">89</p>
                  <p className="text-sm text-muted-foreground">Pending Uploads</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Create New Album */}
            <Card className="p-8 shadow-card">
              <h3 className="font-serif text-2xl font-bold mb-6">Create New Album</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Couple Names</Label>
                  <Input 
                    placeholder="e.g., Sarah & James" 
                    value={coupleNames}
                    onChange={(e) => setCoupleNames(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Event Date</Label>
                  <Input 
                    type="date" 
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cover Photo</Label>
                  <input
                    ref={coverPhotoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCoverPhoto(e.target.files?.[0] || null)}
                    className="hidden"
                    id="cover-photo-input"
                  />
                  <label 
                    htmlFor="cover-photo-input"
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {coverPhoto ? coverPhoto.name : "Click to upload cover photo"}
                    </p>
                  </label>
                </div>
                <Button 
                  className="w-full" 
                  size="lg" 
                  onClick={handleCreateAlbum}
                  disabled={isUploading}
                >
                  <FolderPlus className="mr-2 h-5 w-5" />
                  {isUploading ? "Creating..." : "Create Album"}
                </Button>
              </div>
            </Card>

            {/* Upload Photos */}
            <Card className="p-8 shadow-card">
              <h3 className="font-serif text-2xl font-bold mb-6">Upload Photos</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Album</Label>
                  <select className="w-full rounded-lg border border-input bg-background px-3 py-2">
                    <option value="">Select an album...</option>
                    {albums.map((album) => (
                      <option key={album.id} value={album.id}>
                        {album.couple_names}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Photos</Label>
                  <input
                    ref={photosInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setUploadPhotos(Array.from(e.target.files || []))}
                    className="hidden"
                    id="photos-input"
                  />
                  <label 
                    htmlFor="photos-input"
                    className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer flex flex-col items-center"
                  >
                    <Image className="h-12 w-12 mb-3 text-muted-foreground" />
                    <p className="font-medium mb-1">
                      {uploadPhotos.length > 0 
                        ? `${uploadPhotos.length} photos selected` 
                        : "Drop photos here or click to browse"
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports JPG, PNG • Max 50 files at once
                    </p>
                  </label>
                </div>
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleUploadPhotos}
                  disabled={isUploading}
                >
                  <Upload className="mr-2 h-5 w-5" />
                  {isUploading ? "Uploading..." : "Upload Photos"}
                </Button>
              </div>
            </Card>
          </div>

          {/* Manage Access */}
          <Card className="mt-8 p-8 shadow-card">
            <h3 className="font-serif text-2xl font-bold mb-6">Manage Album Access</h3>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Select Album</Label>
                  <select 
                    className="w-full rounded-lg border border-input bg-background px-3 py-2"
                    value={selectedAlbumId}
                    onChange={(e) => setSelectedAlbumId(e.target.value)}
                  >
                    <option value="">Select an album...</option>
                    {albums.map((album) => (
                      <option key={album.id} value={album.id}>
                        {album.couple_names}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>User Email</Label>
                  <Input type="email" placeholder="user@example.com" />
                </div>
              </div>
              <div className="flex gap-4">
                <Button>Grant Access</Button>
                <Button variant="outline">Revoke Access</Button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Admin;
