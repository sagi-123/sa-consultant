import { Target, Eye, Zap } from 'lucide-react';
import logo from '@/assets/logo.png';

const cards = [
  {
    icon: Target,
    title: 'Our Mission',
    description: 'To empower businesses with innovative digital solutions and exceptional staffing services that drive measurable growth and lasting success.',
    image: '/images/about-mission.png',
  },
  {
    icon: Eye,
    title: 'Our Vision',
    description: 'To be the most trusted global partner for businesses seeking transformation through technology, talent, and strategic consulting.',
    image: '/images/about-vision.png',
  },
  {
    icon: Zap,
    title: 'Our Values',
    description: 'Excellence, integrity, and innovation guide everything we do. We believe in building partnerships that create real, sustainable impact.',
    image: '/images/about-values.png',
  },
];

const About = () => (
  <section id="about" className="section-padding relative overflow-hidden">
    <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-primary/10 blur-[100px]" />

    <div className="container mx-auto relative z-10">
      <div className="flex justify-center mb-10 scroll-reveal">
        <img src={logo} alt="SA Consultant logo" className="h-32 md:h-56 w-auto object-contain hover-lift" />
      </div>
      <div className="text-center mb-16 scroll-reveal">
        <span className="text-accent text-sm font-semibold tracking-widest uppercase">About Us</span>
        <h2 className="fluid-h2 font-display font-black tracking-tight mt-3 mb-6">
          Who We <span className="gradient-text">Are</span>
        </h2>
        <p className="text-foreground font-medium max-w-2xl mx-auto leading-relaxed text-lg">
          SA Consultant & Staffing Solutions is a premium consulting firm that blends digital innovation with top-tier staffing expertise to help businesses thrive in a competitive landscape.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {cards.map((card, i) => (
          <div
            key={card.title}
            className={`scroll-reveal glass rounded-2xl p-6 hover-glow group flex flex-col justify-between h-full cursor-pointer ${
              i % 2 === 0 ? 'hover-card-lift' : 'hover-card-lift-alt'
            }`}
            style={{ transitionDelay: `${i * 150}ms` }}
          >
            <div>
              {/* Beautiful Card Image */}
              <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-6 border border-white/10 group-hover:border-primary/30 transition-all duration-500 ease-out shadow-md">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                {/* Subtle overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />

                {/* Floating icon badge */}
                <div className="absolute bottom-3 left-3 w-10 h-10 rounded-lg bg-background/90 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg">
                  <card.icon size={18} className="text-primary" />
                </div>
              </div>

              <h3 className="text-xl font-display font-bold mb-3 text-foreground group-hover:text-primary transition-colors duration-300">
                {card.title}
              </h3>
              <p className="text-foreground/80 font-medium leading-relaxed">
                {card.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default About;
