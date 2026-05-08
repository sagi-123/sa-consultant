import { Users2, Handshake, Rocket, HeartHandshake, ArrowRight } from 'lucide-react';

const programs = [
  {
    icon: Users2,
    title: 'Referral Program',
    description: 'Recommend our services and earn competitive rewards for every successful client partnership.',
    benefits: ['Financial Incentives', 'Quick Payouts', 'Marketing Support'],
  },
  {
    icon: Handshake,
    title: 'Strategic Alliances',
    description: 'Combine your unique expertise with our consulting framework to offer end-to-end solutions.',
    benefits: ['Shared Expertise', 'Expanded Service Portfolio', 'Joint Bidding'],
  },
  {
    icon: Rocket,
    title: 'Co-Marketing',
    description: 'Collaborate on webinars, whitepapers, and events to grow our mutual brand authority.',
    benefits: ['Wider Reach', 'Lead Generation', 'Shared Content Costs'],
  },
  {
    icon: HeartHandshake,
    title: 'Channel Partner',
    description: 'Incorporate SA Consultant solutions into your own product or service offerings.',
    benefits: ['Wholesale Pricing', 'Technical Integration', 'Dedicated Account Manager'],
  },
];

const Partnership = () => {
  return (
    <section id="partnership" className="section-padding relative overflow-hidden bg-background">
      {/* Decorative Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16 scroll-reveal">
          <span className="text-accent text-sm font-black tracking-[0.2em] uppercase mb-4 block">Collaboration</span>
          <h2 className="text-2xl sm:text-4xl font-display font-black tracking-tight mb-6">
            Our <span className="gradient-text">Partnership Program</span>
          </h2>
          <p className="text-foreground/80 font-medium text-lg max-w-3xl mx-auto leading-relaxed">
            We believe in the power of synergy. Join our network of innovators and professionals to unlock new growth opportunities and deliver exceptional value together.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {programs.map((program, i) => (
            <div 
              key={program.title}
              className="scroll-reveal glass p-8 md:p-10 rounded-[2.5rem] hover-lift hover-glow transition-all duration-500 border border-border group relative overflow-hidden"
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              {/* Subtle accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 gradient-bg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
                  <program.icon size={32} className="text-white" />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-2xl font-display font-black mb-4 group-hover:text-primary transition-colors">{program.title}</h3>
                  <p className="text-muted-foreground font-medium mb-6 leading-relaxed">
                    {program.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {program.benefits.map((benefit) => (
                      <span key={benefit} className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full bg-secondary text-foreground/70 border border-border">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="scroll-reveal glass-strong p-8 md:p-12 rounded-[3rem] text-center max-w-4xl mx-auto border-2 border-primary/10 relative overflow-hidden group">
          {/* Animated Background Shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
          
          <h3 className="text-3xl font-display font-black mb-6 relative z-10">Ready to build something <span className="gradient-text">great together?</span></h3>
          <p className="text-muted-foreground font-medium text-lg mb-10 max-w-2xl mx-auto relative z-10">
            Whether you're an individual consultant or a tech agency, we have a place for you in our ecosystem.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <a 
              href="#contact" 
              className="px-10 py-5 gradient-bg rounded-2xl font-black text-white hover-lift hover-glow transition-all duration-300 flex items-center justify-center gap-2"
            >
              Apply to Partner <ArrowRight size={20} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Partnership;
