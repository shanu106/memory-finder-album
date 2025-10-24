import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Albums = () => {
  // Mock data for demonstration
  const albums = [
    {
      id: 1,
      title: "Sarah & James Wedding",
      date: "2025-01-15",
      coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
      photoCount: 245,
    },
    {
      id: 2,
      title: "Emma & Michael Wedding",
      date: "2024-12-20",
      coverImage: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800",
      photoCount: 312,
    },
    {
      id: 3,
      title: "Lisa & David Wedding",
      date: "2024-11-10",
      coverImage: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800",
      photoCount: 198,
    },
  ];

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
              <Link to="/find-photos">
                <Button variant="outline">Find My Photos</Button>
              </Link>
              <Link to="/admin">
                <Button variant="ghost">Admin</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="py-12 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-4xl font-bold mb-4">Wedding Albums</h2>
          <p className="text-muted-foreground text-lg">
            Browse our collection of beautiful wedding memories
          </p>
        </div>
      </section>

      {/* Search */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search albums by couple name or date..." 
              className="pl-10 py-6"
            />
          </div>
        </div>
      </section>

      {/* Albums Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {albums.map((album) => (
              <Card key={album.id} className="group overflow-hidden hover:shadow-elegant transition-all cursor-pointer">
                <Link to={`/album/${album.id}`}>
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={album.coverImage} 
                      alt={album.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="font-serif text-2xl font-bold mb-1">{album.title}</h3>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(album.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {album.photoCount} photos
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <Button className="w-full" variant="outline">
                      View Album
                    </Button>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Albums;
