import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Upload, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const FindPhotos = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSearch = () => {
    // Face recognition logic will be implemented here
    console.log("Searching for photos with face recognition...");
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
              <Link to="/admin">
                <Button variant="outline">Admin</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="py-12 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Recognition</span>
          </div>
          <h2 className="font-serif text-4xl font-bold mb-4">Find Your Photos</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Upload a selfie or take a photo, and we'll find all the beautiful moments where you appear
          </p>
        </div>
      </section>

      {/* Upload Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 shadow-card">
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="font-serif text-2xl font-semibold mb-2">Upload Your Photo</h3>
                  <p className="text-muted-foreground">
                    For best results, use a clear frontal photo of your face
                  </p>
                </div>

                {/* Upload Area */}
                <div className="border-2 border-dashed border-border rounded-2xl p-12 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    id="photo-upload"
                    accept="image/*"
                    capture="user"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  
                  {previewUrl ? (
                    <div className="space-y-4">
                      <div className="relative inline-block">
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          className="max-h-64 rounded-xl shadow-elegant"
                        />
                      </div>
                      <div className="flex gap-4 justify-center">
                        <label htmlFor="photo-upload">
                          <Button variant="outline" asChild>
                            <span>
                              <Upload className="mr-2 h-4 w-4" />
                              Choose Different Photo
                            </span>
                          </Button>
                        </label>
                        <Button onClick={handleSearch} className="shadow-elegant">
                          <Sparkles className="mr-2 h-4 w-4" />
                          Find My Photos
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="inline-flex rounded-full bg-primary/10 p-6">
                        <Camera className="h-12 w-12 text-primary" />
                      </div>
                      <div>
                        <label htmlFor="photo-upload">
                          <Button size="lg" asChild>
                            <span>
                              <Upload className="mr-2 h-5 w-5" />
                              Upload or Take Photo
                            </span>
                          </Button>
                        </label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Supports JPG, PNG • Max 10MB
                      </p>
                    </div>
                  )}
                </div>

                {/* How it Works */}
                <div className="rounded-xl bg-secondary/50 p-6">
                  <h4 className="font-semibold mb-3">How it works</h4>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    <li>1. Upload a clear photo of your face or take a selfie</li>
                    <li>2. Our AI analyzes your facial features securely</li>
                    <li>3. Get instant results showing all photos where you appear</li>
                    <li>4. Browse and download your favorite moments</li>
                  </ol>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FindPhotos;
