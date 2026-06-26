import { useState, useRef } from 'react';
import { Globe, Megaphone, Users, Palette } from 'lucide-react';

const services = [
  {
    icon: Globe,
    title: 'Website Creation',
    description: 'Stunning, high-performance websites and web applications tailored to your brand and built for conversion.',
    features: ['Custom Design', 'SEO Optimized', 'Mobile First'],
    image: '/images/service-website.png',
  },
  {
    icon: Megaphone,
    title: 'Digital Marketing',
    description: 'Data-driven marketing strategies that amplify your brand presence and deliver measurable ROI.',
    features: ['Social Media', 'PPC Campaigns', 'Analytics'],
    image: '/images/service-marketing.png',
  },
  {
    icon: Users,
    title: 'Staffing Solutions',
    description: 'Connect with vetted, top-tier talent to build high-performing teams that drive business success.',
    features: ['Executive Search', 'Contract Staffing', 'RPO'],
    image: '/images/service-staffing.png',
  },
  {
    icon: Palette,
    title: 'Content Creation',
    description: 'Engaging digital content that tells your story, captivates audiences, and builds brand authority.',
    features: ['Video Production', 'Copywriting', 'Branding'],
    image: '/images/service-content.png',
  },
];

interface ServiceCardProps {
  service: typeof services[number];
  index: number;
}

const ServiceCard = ({ service, index }: ServiceCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState('');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Dynamic 3D tilt calculation
    const rotateX = ((centerY - y) / centerY) * 12; // up to 12 degrees
    const rotateY = ((x - centerX) / centerX) * 12;

    setTransformStyle(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
  };

  const handleMouseLeave = () => {
    setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="scroll-reveal glass rounded-2xl p-6 hover-glow group relative overflow-hidden transition-all duration-300 ease-out cursor-pointer flex flex-col justify-between h-full"
      style={{
        transform: transformStyle,
        transitionDelay: `${index * 100}ms`,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Shimmer line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] gradient-bg opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" />

      <div className="flex flex-col h-full justify-between">
        {/* Beautiful Service Image */}
        <div 
          className="relative w-full aspect-video rounded-xl overflow-hidden mb-6 border border-white/10 group-hover:border-primary/30 transition-all duration-500 ease-out shadow-md"
          style={{ transform: 'translateZ(20px)' }}
        >
          <img 
            src={service.image} 
            alt={service.title} 
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          {/* Subtle overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
          
          {/* Floating icon badge */}
          <div className="absolute bottom-3 left-3 w-10 h-10 rounded-lg bg-background/90 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg">
            <service.icon size={18} className="text-primary" />
          </div>
        </div>

        {/* Content Section */}
        <div style={{ transform: 'translateZ(30px)' }} className="flex-grow flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-display font-bold mb-3 text-foreground group-hover:text-primary transition-colors duration-300">
              {service.title}
            </h3>
            <p className="text-foreground/80 font-medium text-sm leading-relaxed mb-5">
              {service.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 mt-auto">
            {service.features.map((f) => (
              <span 
                key={f} 
                className="text-xs px-3 py-1 rounded-full bg-secondary text-foreground font-bold border border-primary/20"
                style={{ transform: 'translateZ(10px)' }}
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Services = () => (
  <section id="services" className="section-padding relative">
    <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-[#3b82f6]/10 blur-[120px]" />

    <div className="container mx-auto relative z-10">
      <div className="text-center mb-16 scroll-reveal">
        <span className="text-accent text-sm font-semibold tracking-widest uppercase">Our Services</span>
        <h2 className="fluid-h2 font-display font-black tracking-tight mt-3 mb-6">
          What We <span className="gradient-text">Offer</span>
        </h2>
        <p className="text-foreground font-semibold max-w-2xl mx-auto text-lg leading-relaxed">
          Comprehensive solutions designed to elevate your business to new heights.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((service, i) => (
          <ServiceCard key={service.title} service={service} index={i} />
        ))}
      </div>
    </div>
  </section>
);

export default Services;
