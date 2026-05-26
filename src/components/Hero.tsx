import { ArrowRight, ChevronDown } from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';
import WebinarFlashcards from './WebinarFlashcards';

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen md:flex md:items-center md:justify-center overflow-hidden bg-white pt-20 md:pt-0">
      {/* Background Video Holder */}
      <div className="relative w-full aspect-video md:aspect-auto md:absolute md:inset-0 md:h-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster={heroBg}
          className="w-full h-full object-contain md:object-cover"
          style={{ filter: 'brightness(1.05) saturate(1.02)' }}
        >
          <source src="/office-bg.mp4" type="video/mp4" />
          <source src="https://videos.pexels.com/video-files/8125803/8125803-hd_1920_1080_25fps.mp4" type="video/mp4" />
        </video>
        {/* Subtle Overlay - only visible on desktop background or as a fade on mobile */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white/90 md:to-white/80" />
      </div>

      {/* Decorative Blur Orbs - Desktop only for cleaner mobile */}
      <div className="hidden md:block absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/20 blur-[120px] animate-float" />
      <div className="hidden md:block absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#3b82f6]/15 blur-[120px] animate-float" style={{ animationDelay: '3s' }} />

      {/* Content Container */}
      <div className="relative z-10 container mx-auto text-center px-4 sm:px-6 pt-10 pb-20 md:pt-36 md:pb-0">
        <div className="max-w-5xl mx-auto">
          {/* Webinar Flash Cards (Shows above the badge if any upcoming webinars are scheduled) */}
          <WebinarFlashcards />

          {/* Badge */}
          <div className="inline-flex items-center gap-3 px-6 py-3 sm:px-10 sm:py-5 rounded-full glass border border-primary/20 mb-6 sm:mb-8 animate-fade-in text-foreground shadow-2xl">
            <span className="w-4 h-4 rounded-full bg-primary animate-pulse" />
            <span className="text-lg sm:text-3xl font-black tracking-widest uppercase">SA Consultant & Staffing</span>
          </div>

          <h1 className="fluid-h1 font-display font-black tracking-tight leading-tight mb-6 sm:mb-8 text-gray-900 drop-shadow-sm text-3xl sm:text-5xl md:text-7xl">
            Empowering Businesses with{' '}
            <span className="gradient-text">Smart Digital &amp; Staffing Solutions</span>
          </h1>

          <p className="text-base sm:text-xl md:text-2xl text-foreground font-bold mb-4 sm:mb-6 px-2 tracking-wide">
            Website Creation &nbsp;|&nbsp; Digital Marketing &nbsp;|&nbsp; Staffing &nbsp;|&nbsp; Content Creation
          </p>

          <p className="text-sm sm:text-lg text-foreground font-semibold max-w-2xl mx-auto mb-10 sm:mb-12 px-2 leading-relaxed">
            We deliver world-class consulting and staffing services that drive growth,
            innovation, and lasting success for businesses worldwide.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4 sm:px-0">
            <a
              href="#services"
              className="gradient-bg px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-bold text-white hover-lift hover-glow inline-flex items-center justify-center gap-2 transition-all duration-300 w-full sm:w-auto text-base sm:text-lg shadow-xl shadow-primary/20"
            >
              Get Started <ArrowRight size={20} />
            </a>
            <a
              href="#contact"
              className="glass px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-bold text-foreground border-2 border-primary/10 hover-lift hover-glow inline-flex items-center justify-center transition-all duration-300 w-full sm:w-auto text-base sm:text-lg"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>

      {/* Scroll indicator - Desktop only */}
      <a
        href="#about"
        className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground animate-bounce"
      >
        <ChevronDown size={28} />
      </a>
    </section>
  );
};

export default Hero;
