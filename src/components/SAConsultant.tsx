import { Award, BarChart3, Lightbulb, Handshake, CheckCircle2 } from 'lucide-react';

const pillars = [
  {
    icon: Lightbulb,
    title: 'Strategic Planning',
    description: 'Bespoke roadmaps tailored to your unique business goals and market dynamics.',
  },
  {
    icon: BarChart3,
    title: 'Process Optimization',
    description: 'Streamlining operations to enhance efficiency and maximize sustainable growth.',
  },
  {
    icon: Handshake,
    title: 'Talent Strategy',
    description: 'Building high-performance cultures through elite staffing and leadership development.',
  },
  {
    icon: Award,
    title: 'Digital Transformation',
    description: 'Integrating cutting-edge technology to future-proof your business infrastructure.',
  },
];

const SAConsultant = () => {
  return (
    <section id="consultant" className="section-padding relative overflow-hidden bg-secondary/30">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-accent/5 blur-[120px]" />
      </div>

      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content Left */}
          <div className="scroll-reveal">
            <span className="text-accent text-sm font-black tracking-[0.2em] uppercase mb-4 block">Strategic Advisory</span>
            <h2 className="text-2xl sm:text-4xl font-display font-black tracking-tight mb-8">
              Elevate Your Business with <span className="gradient-text">Expert Consulting</span>
            </h2>
            
            <p className="text-foreground/80 font-medium text-lg leading-relaxed mb-10">
              At SA Consultant, we don't just provide services; we partner with you to build foundations for long-term excellence. Our consulting approach blends analytical rigor with creative innovation to solve your most complex challenges.
            </p>

            <div className="space-y-6">
              {[
                'Data-Driven Decision Making',
                'Global Talent Network Access',
                'Innovative Digital Solutions',
                'Sustainable Growth Frameworks'
              ].map((item) => (
                <div key={item} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <CheckCircle2 size={20} className="text-primary group-hover:text-white" />
                  </div>
                  <span className="font-bold text-foreground group-hover:text-primary transition-colors duration-300">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-12">
              <a 
                href="#contact" 
                className="inline-flex items-center justify-center px-8 py-4 gradient-bg rounded-xl font-black text-white hover-lift hover-glow transition-all duration-300 shadow-xl shadow-primary/20"
              >
                Book a Strategy Session
              </a>
            </div>
          </div>

          {/* Pillars Right */}
          <div className="grid sm:grid-cols-2 gap-6 scroll-reveal">
            {pillars.map((pillar, i) => (
              <div 
                key={pillar.title}
                className="glass p-8 rounded-3xl hover-lift hover-glow transition-all duration-500 border border-white/20 group"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-6 group-hover:gradient-bg transition-all duration-500">
                  <pillar.icon size={28} className="text-primary group-hover:text-white transition-colors duration-500" />
                </div>
                <h3 className="text-xl font-display font-black mb-3">{pillar.title}</h3>
                <p className="text-muted-foreground font-medium text-sm leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SAConsultant;
