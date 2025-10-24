import { Button } from "@/components/ui/button";
import { Camera, Heart, Lock, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-wedding.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="font-serif text-2xl font-bold text-primary">Moments Studio</h1>
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

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 md:grid-cols-2 md:gap-8 items-center">
            <div className="space-y-6">
              <div className="inline-block rounded-full bg-primary/10 px-4 py-2">
                <span className="text-sm font-medium text-primary">Smart Photo Recognition</span>
              </div>
              <h2 className="font-serif text-4xl font-bold leading-tight md:text-6xl">
                Your Wedding Memories,
                <span className="block text-primary"> Beautifully Organized</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Experience the magic of finding your photos instantly with our intelligent face recognition technology. 
                Secure, elegant, and effortlessly yours.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/albums">
                  <Button size="lg" className="shadow-elegant">
                    Browse Albums
                    <Heart className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/find-photos">
                  <Button size="lg" variant="outline">
                    Find My Photos
                    <Camera className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-primary opacity-20 blur-3xl"></div>
              <img 
                src={heroImage}
                alt="Beautiful wedding couple at sunset" 
                className="relative rounded-2xl shadow-elegant w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="font-serif text-3xl font-bold mb-4">Why Choose Moments Studio</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Professional wedding photography meets cutting-edge technology
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="group p-8 rounded-2xl bg-gradient-subtle shadow-card hover:shadow-elegant transition-all">
              <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3">
                <Camera className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-serif text-xl font-semibold mb-3">Smart Recognition</h4>
              <p className="text-muted-foreground">
                Upload a selfie and instantly find all photos where you appear. No more endless scrolling through albums.
              </p>
            </div>
            <div className="group p-8 rounded-2xl bg-gradient-subtle shadow-card hover:shadow-elegant transition-all">
              <div className="mb-4 inline-flex rounded-xl bg-accent/10 p-3">
                <Lock className="h-6 w-6 text-accent" />
              </div>
              <h4 className="font-serif text-xl font-semibold mb-3">Secure Access</h4>
              <p className="text-muted-foreground">
                Only authorized guests can view full albums. Your special moments stay private and protected.
              </p>
            </div>
            <div className="group p-8 rounded-2xl bg-gradient-subtle shadow-card hover:shadow-elegant transition-all">
              <div className="mb-4 inline-flex rounded-xl bg-primary-glow/10 p-3">
                <Sparkles className="h-6 w-6 text-primary-glow" />
              </div>
              <h4 className="font-serif text-xl font-semibold mb-3">Elegant Viewing</h4>
              <p className="text-muted-foreground">
                Enjoy your photos in a beautiful, interactive album viewer designed for the perfect browsing experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h3 className="font-serif text-3xl font-bold mb-4">Ready to Find Your Moments?</h3>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Start exploring beautiful wedding albums or upload a photo to find yourself
          </p>
          <Link to="/find-photos">
            <Button size="lg" className="shadow-glow">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="font-serif">© 2025 Moments Studio. Capturing memories, creating magic.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
