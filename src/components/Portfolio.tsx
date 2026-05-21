import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';
import { ExternalLink, Smartphone, Globe, Code2, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

type Project = Database['public']['Tables']['projects']['Row'];

const Portfolio = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProjects(data || []);
      } catch (error: any) {
        console.error('Error fetching projects:', error);
        toast({
          variant: "destructive",
          title: "Error loading portfolio",
          description: error.message
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [toast]);

  // Removed IntersectionObserver logic to ensure portfolio is always visible


  if (loading) {
    return (
      <section id="portfolio" className="section-padding overflow-hidden min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground animate-pulse">Loading amazing projects...</p>
        </div>
      </section>
    );
  }
  return (
    <section id="portfolio" className="section-padding overflow-hidden">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <span className="text-accent text-sm font-semibold tracking-widest uppercase">Portfolio</span>
          <h2 className="fluid-h2 font-display font-black tracking-tight mt-3 mb-6">
            Our <span className="gradient-text">Work</span>
          </h2>
          <p className="text-foreground font-semibold max-w-2xl mx-auto text-lg leading-relaxed">
            Explore our successful implementations across web, mobile, and enterprise solutions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.length === 0 ? (
            <div className="col-span-full text-center py-20 glass rounded-[2rem] border border-dashed border-border">
              <p className="text-muted-foreground">No projects to show yet. Add them from the admin dashboard!</p>
            </div>
          ) : (
            projects.map((project, i) => (
              <div
                key={project.id}
                className="group relative rounded-[2rem] overflow-hidden aspect-[4/5] md:aspect-[4/3] cursor-pointer bg-card hover-lift border border-border/40"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {/* Background Image, Gradient & Overlay */}
                {project.image_url ? (
                  <img src={project.image_url} alt={project.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${project.color || 'from-primary/20 to-accent/20'} opacity-40 group-hover:opacity-60 transition-opacity duration-700`} />
                )}
                <div className={`absolute inset-0 ${project.image_url ? 'bg-gradient-to-t from-background/95 via-background/60 to-background/10 group-hover:via-background/40' : 'bg-background/20 backdrop-blur-[2px] group-hover:backdrop-blur-none'} transition-all duration-700`} />
                
                {/* Project Content */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-accent font-black mb-3">
                      {project.type === 'web' ? <Globe className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
                      {project.category}
                    </span>
                    <h3 className="text-2xl font-display font-black text-foreground mb-3">{project.title}</h3>
                    <p className="text-sm font-semibold text-foreground mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 max-w-[250px] leading-relaxed">
                      {project.description}
                    </p>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                      {project.live_url && (
                        <a 
                          href={project.live_url} 
                          target={project.live_url === '/' ? '_self' : '_blank'} 
                          rel="noopener noreferrer"
                          className="px-5 h-10 rounded-full bg-foreground text-background text-xs font-bold flex items-center gap-2 hover:bg-accent hover:text-foreground transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Visit Site <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {project.apk_url && (
                        <a 
                          href={project.apk_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 h-10 rounded-full bg-accent text-foreground text-xs font-bold flex items-center gap-2 hover:bg-foreground hover:text-background transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Get APK <Smartphone className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Static labels (Hidden on Hover) */}
                <div className="absolute top-8 left-8 group-hover:opacity-0 transition-opacity duration-300">
                   <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                      <Code2 className="w-6 h-6 text-foreground/80" />
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
