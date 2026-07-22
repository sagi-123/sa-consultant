import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';
import WebinarFlashcards from './WebinarFlashcards';

const SCENES = [
  {
    badge: "✦ SA Consultant & Staffing ✦",
    title: "Empowering Businesses with Smart Digital & Staffing Solutions",
    subtitle: "Website Creation | Digital Marketing | Staffing | Content Creation",
    description: "Partner with one of the best consultants in USA to drive growth, innovation, and lasting success with our premier digital and staffing services."
  },
  {
    badge: "✦ Web & App Development ✦",
    title: "Custom Websites & Mobile Applications Built for Scale",
    subtitle: "React | Next.js | Node.js | iOS & Android",
    description: "We build fast, secure, and modern digital platforms tailored to your business needs, ensuring top-tier user experience."
  },
  {
    badge: "✦ Digital Marketing & Growth ✦",
    title: "Strategic Marketing to Grow Your Digital Footprint",
    subtitle: "SEO | Social Media | Performance Marketing | Analytics",
    description: "Reach your target audience, increase conversions, and maximize your ROI with our data-driven growth strategies."
  },
  {
    badge: "✦ IT Staffing & Talent Acquisition ✦",
    title: "Connecting You with Top-Tier Professionals in USA",
    subtitle: "Tech Staffing | Recruitment | Contract & Full-Time Solutions",
    description: "Scale your engineering and product teams quickly with vetted, high-performing professionals customized for your domain."
  },
  {
    badge: "✦ Let's Build Your Success Story ✦",
    title: "Ready to Accelerate Your Business Growth?",
    subtitle: "Website Creation | Digital Marketing | Staffing | Content Creation",
    description: "Get in touch with us today to learn how our premier digital and staffing services can drive growth and innovation."
  }
];

const Hero = () => {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [activeScene, setActiveScene] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loadedImagesRef = useRef<HTMLImageElement[]>([]);

  // 1. Preload the 100 images with a 3.5s safety threshold
  useEffect(() => {
    console.log("[Hero] Starting preloading of 100 images...");
    const totalFrames = 100;
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;
    let isForced = false;

    const forceStart = () => {
      if (isForced) return;
      isForced = true;
      console.log("[Hero] Safety timeout reached, forcing canvas initialization");
      setImagesLoaded(true);
    };

    const timeoutId = setTimeout(forceStart, 3500);

    for (let i = 0; i < totalFrames; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(3, '0');
      img.src = `/images/hero-sequence/frame_${frameNum}.jpg`;
      img.onload = () => {
        loadedCount++;
        loadedImages[i] = img;
        setPreloadProgress(Math.round((loadedCount / totalFrames) * 100));

        if (loadedCount === totalFrames) {
          clearTimeout(timeoutId);
          loadedImagesRef.current = loadedImages;
          console.log("[Hero] All 100 images preloaded successfully");
          setImagesLoaded(true);
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === totalFrames) {
          clearTimeout(timeoutId);
          loadedImagesRef.current = loadedImages;
          setImagesLoaded(true);
        }
      };
    }

    return () => clearTimeout(timeoutId);
  }, []);

  // 2. Play the animation loop & manage scenes
  useEffect(() => {
    if (!imagesLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let startTime = performance.now();

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const drawImageCover = (img: HTMLImageElement) => {
      const cw = canvas.width / (window.devicePixelRatio || 1);
      const ch = canvas.height / (window.devicePixelRatio || 1);
      const iw = img.width;
      const ih = img.height;
      const r = Math.max(cw / iw, ch / ih);
      const nw = iw * r;
      const nh = ih * r;
      const cx = (cw - nw) / 2;
      const cy = (ch - nh) / 2;
      ctx.drawImage(img, cx, cy, nw, nh);
    };

    const animate = (time: number) => {
      const elapsed = Math.max(0, (time - startTime) / 1000); // time in seconds
      
      // Update the active scene every 6 seconds
      const sceneIndex = Math.floor((elapsed / 6) % SCENES.length);
      setActiveScene(sceneIndex);

      // Play the 100-frame sequence exactly once over the 30-second cycle
      const cycleDuration = 30; // 5 scenes * 6 seconds
      const cycleProgress = (elapsed % cycleDuration) / cycleDuration;
      const frameProgress = cycleProgress * 100; // 0 to 100

      const baseFrame = Math.floor(frameProgress) % 100;
      const nextFrame = (baseFrame + 1) % 100;
      const alpha = frameProgress % 1;

      const baseImg = loadedImagesRef.current[baseFrame];
      const nextImg = loadedImagesRef.current[nextFrame];

      // Draw base image fully opaque to prevent any black background bleed-through
      if (baseImg) {
        ctx.globalAlpha = 1.0;
        drawImageCover(baseImg);
      }
      // Cross-fade the next image smoothly on top
      if (nextImg && alpha > 0.001) {
        ctx.globalAlpha = alpha;
        drawImageCover(nextImg);
      }
      ctx.globalAlpha = 1.0;

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [imagesLoaded]);

  // Loading Screen Overlay
  if (!imagesLoaded) {
    return (
      <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#1A110B] text-white">
        <div className="relative flex flex-col items-center max-w-md w-full px-6 text-center">
          <div className="absolute w-72 h-72 rounded-full bg-primary/20 blur-[80px] animate-pulse" />
          
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 mb-8 animate-bounce">
            <span className="text-2xl font-black text-white">SA</span>
          </div>

          <h2 className="text-2xl font-display font-black tracking-tight mb-3">
            SA Consultant & Staffing
          </h2>
          <p className="text-slate-400 text-sm mb-8 font-medium">
            Preparing cinematic fly-through experience...
          </p>

          <div className="w-full h-1.5 bg-[#2C211B] rounded-full overflow-hidden mb-3">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent shadow-[0_0_12px_rgba(123,78,47,0.5)] transition-all duration-300 ease-out"
              style={{ width: `${preloadProgress}%` }}
            />
          </div>
          <span className="text-xs font-bold text-primary tracking-wider">
            {preloadProgress}% LOADED
          </span>
        </div>
      </div>
    );
  }

  const currentScene = SCENES[activeScene] || SCENES[0];

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black pt-20 md:pt-0">
      {/* Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'brightness(1)' }}
      />

      {/* Radial overlay to enrich readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />

      {/* Decorative Blur Orbs */}
      <div className="hidden md:block absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-[120px] animate-float pointer-events-none" />
      <div className="hidden md:block absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent/10 blur-[120px] animate-float pointer-events-none" style={{ animationDelay: '3s' }} />

      {/* Content Container */}
      <div className="relative z-10 container mx-auto text-center px-4 sm:px-6 pt-10 pb-20 md:pt-36 md:pb-0">
        <div className="max-w-5xl mx-auto transition-all duration-500">
          {/* Webinar Flash Cards */}
          <WebinarFlashcards />

          {/* Badge */}
          <div className="inline-flex items-center gap-3 px-6 py-3 sm:px-10 sm:py-5 rounded-full bg-black/60 backdrop-blur-md border border-primary/30 mb-6 sm:mb-8 text-white shadow-2xl">
            <span className="w-3.5 h-3.5 rounded-full bg-primary animate-pulse" />
            <span className="text-base sm:text-2xl font-black tracking-widest uppercase">{currentScene.badge}</span>
          </div>

          {/* Staggered Heading */}
          <h1 className="fluid-h1 font-display font-black tracking-tight leading-tight mb-6 sm:mb-8 text-white drop-shadow-sm text-3xl sm:text-5xl md:text-7xl">
            {currentScene.title.split('with ').length > 1 ? (
              <>
                {currentScene.title.split('with ')[0]}
                with <span className="gradient-text">{currentScene.title.split('with ')[1]}</span>
              </>
            ) : currentScene.title.split('Built ').length > 1 ? (
              <>
                {currentScene.title.split('Built ')[0]}
                <span className="gradient-text">Built {currentScene.title.split('Built ')[1]}</span>
              </>
            ) : currentScene.title.split('to ').length > 1 ? (
              <>
                {currentScene.title.split('to ')[0]}
                <span className="gradient-text">to {currentScene.title.split('to ')[1]}</span>
              </>
            ) : currentScene.title.split('in ').length > 1 ? (
              <>
                {currentScene.title.split('in ')[0]}
                <span className="gradient-text">in {currentScene.title.split('in ')[1]}</span>
              </>
            ) : (
              <span className="gradient-text">{currentScene.title}</span>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl md:text-2xl text-slate-200 font-bold mb-4 sm:mb-6 px-2 tracking-wide">
            {currentScene.subtitle}
          </p>

          {/* Description */}
          <p className="text-sm sm:text-lg text-slate-300 font-semibold max-w-2xl mx-auto mb-10 sm:mb-12 px-2 leading-relaxed">
            {currentScene.description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4 sm:px-0">
            <Link
              to="/services"
              className="gradient-bg px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-bold text-white hover-lift hover-glow inline-flex items-center justify-center gap-2 transition-all duration-300 w-full sm:w-auto text-base sm:text-lg shadow-xl shadow-primary/25"
            >
              Get Started <ArrowRight size={20} />
            </Link>
            <Link
              to="/contact"
              className="px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-bold text-white border-2 border-white/20 hover:bg-primary hover:border-primary active:bg-primary transition-all duration-300 w-full sm:w-auto text-base sm:text-lg inline-flex items-center justify-center hover-lift hover-glow"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <a
        href="#about"
        className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-400 hover:text-white transition-colors animate-bounce"
      >
        <ChevronDown size={28} />
      </a>
    </section>
  );
};

export default Hero;
