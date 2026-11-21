import { useState, useRef, useEffect } from 'react';
import {
  ShoppingBag,
  ArrowRight,
  Menu,
  X,
  Sparkles,
  Package,
  Award,
  Flame,
  Check,
  Instagram,
  Facebook
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from 'framer-motion';
import BottleSplashAnimation from './components/BottleSplashAnimation';

// Scroll-linked section wrapper: sections ease in as they enter and soften as they leave,
// so one section blends into the next instead of cutting hard.
function SmoothSection({ variant = 'default', children, ...rest }) {
  const ref = useRef(null);
  const isHero = variant === 'hero';
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: isHero ? ['start start', 'end start'] : ['start end', 'end start'],
  });
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });

  const opacity = useTransform(p, isHero ? [0, 1] : [0, 0.2, 0.88, 1], isHero ? [1, 0.2] : [0.15, 1, 1, 0.55]);
  const y = useTransform(p, isHero ? [0, 1] : [0, 0.2], isHero ? [0, -60] : [70, 0]);
  const scale = useTransform(p, isHero ? [0, 1] : [0, 0.2], isHero ? [1, 0.95] : [0.97, 1]);

  return (
    <motion.section ref={ref} style={{ opacity, y, scale, willChange: 'transform, opacity' }} {...rest}>
      {children}
    </motion.section>
  );
}

// Deterministic floating gold particles (decorative only)
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  top: (i * 53 + 7) % 100,
  size: 2 + (i % 3),
  duration: 7 + (i % 5) * 1.6,
  delay: (i % 6) * 0.9,
  drift: i % 2 === 0 ? 14 : -14,
}));

function FloatingParticles({ count = 18 }) {
  return (
    <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
      {PARTICLES.slice(0, count).map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-goldColor"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            boxShadow: '0 0 8px rgba(196,154,88,0.7)',
          }}
          animate={{ y: [0, -40, 0], x: [0, p.drift, 0], opacity: [0, 0.7, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[2px] origin-left z-[60] bg-gradient-to-r from-secondaryColor via-goldColor to-[#f5dfa9]"
    />
  );
}

// Gentle idle float + hover spin for benefit icons
const iconFloat = (delay = 0) => ({
  animate: { y: [0, -5, 0] },
  transition: { duration: 3.2, delay, repeat: Infinity, ease: 'easeInOut' },
  whileHover: { rotate: [0, -12, 12, 0], scale: 1.12, transition: { duration: 0.6 } },
});

const products = [
  {
    id: 'gold-edition',
    name: 'NROR – Gold Edition',
    subtitle: 'Burgundy & Gold Visual Identity',
    format: '250 ML Eau de Parfum',
    price: 499,
    description: 'An unforgettable harmony of velvety rose, deep amber resonance, and smoked woody undertones housed in a rich burgundy flacon with satin gold accents.',
    image: '/nror-noir-rouge.jpg',
    badge: 'Gold Edition'
  },
  {
    id: 'silver-edition',
    name: 'NROR – Silver Edition',
    subtitle: 'Burgundy & Silver Visual Identity',
    format: '250 ML Eau de Parfum',
    price: 499,
    description: 'An architectural expression of crisp modern florals, luminous citrus facets, and silver cashmere woods in a spun silver and burgundy presentation.',
    image: '/nror-lumina-silver.jpg',
    badge: 'Silver Edition'
  }
];

const appleEase = [0.16, 1, 0.3, 1];

const textReveal = {
  hidden: { opacity: 0, y: 32, filter: 'blur(8px)' },
  visible: (custom = 0) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.9,
      delay: custom,
      ease: appleEase,
    }
  })
};

// Container stagger
const containerStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.1,
    }
  }
};

// Card / Item subtle rise & scale
const cardVariant = {
  hidden: { opacity: 0, y: 44, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.85,
      ease: appleEase,
    }
  }
};

// Divider expansion
const lineVariant = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: {
      duration: 1.1,
      ease: appleEase,
    }
  }
};

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(products[0]);
  const [toastMessage, setToastMessage] = useState('');

  const heroProgressRef = useRef(0);

  useEffect(() => {
    const normalizeWheel = (e) => {
      let d = e.deltaY;
      if (e.deltaMode === 1) d *= 16;
      else if (e.deltaMode === 2) d *= window.innerHeight;
      return Math.max(-80, Math.min(80, d));
    };

    const onWheel = (e) => {
      const isAtTop = window.scrollY <= 10;

      // 1. Scrolling down from top before frames complete: advance frames
      if (isAtTop && e.deltaY > 0 && heroProgressRef.current < 1) {
        e.preventDefault();
        const next = Math.min(1, heroProgressRef.current + normalizeWheel(e) * 0.0009);
        heroProgressRef.current = next;

      }
      // 2. Scrolling up when at the top: scrub backwards from last frame to first
      else if (isAtTop && e.deltaY < 0 && heroProgressRef.current > 0) {
        e.preventDefault();
        const prev = Math.max(0, heroProgressRef.current + normalizeWheel(e) * 0.0009);
        heroProgressRef.current = prev;

      }
    };

    // Touch support for mobile devices
    let touchStartY = 0;
    const onTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };

    const onTouchMove = (e) => {
      const isAtTop = window.scrollY <= 10;
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY;

      // Scrolling down before reaching end of splash
      if (isAtTop && deltaY > 0 && heroProgressRef.current < 1) {
        e.preventDefault();
        const next = Math.min(1, heroProgressRef.current + deltaY * 0.004);
        heroProgressRef.current = next;

        touchStartY = touchY;
      }
      // Scrolling up while at the top: reverse frames back towards frame 1
      else if (isAtTop && deltaY < 0 && heroProgressRef.current > 0) {
        e.preventDefault();
        const prev = Math.max(0, heroProgressRef.current + deltaY * 0.004);
        heroProgressRef.current = prev;

        touchStartY = touchY;
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  const handleAddToCart = (product) => {
    setCartCount(prev => prev + 1);
    setToastMessage(`${product.name} added to your bag.`);
    setTimeout(() => setToastMessage(''), 2800);
  };

  const navLinks = [
    { label: "Home", href: "#hero" },
    { label: "Our Collection", href: "#collection" },
    { label: "About NROR", href: "#about" },
    { label: "The Experience", href: "#experience" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <div className="min-h-screen bg-primaryColor text-silverColor font-sans antialiased selection:bg-secondaryColor selection:text-goldColor overflow-x-hidden">
      <ScrollProgressBar />
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: appleEase, delay: 0.1 }}
        className="fixed top-3 sm:top-4 inset-x-0 z-50 px-3 sm:px-6"
      >
        <div className="max-w-7xl mx-auto">
          {/* #4d1c2b */}
          <div className="relative h-16 sm:h-[68px] flex items-center justify-between rounded-full bg-[#4d1c2b]/50 backdrop-blur-lg shadow-[0_8px_32px_rgba(0,0,0,0.15)] pl-5 pr-2 sm:pl-7">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full p-[1.5px] bg-[#780F27]/20"
              style={{
                WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
              }}
            />

            {/* Left: Logo */}
            <motion.a
              href="#hero"
              className="flex flex-col items-center shrink-0 leading-none"
              aria-label="NROR home"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.3, ease: appleEase }}
            >
              <span className="font-serif text-2xl sm:text-3xl tracking-[0.25em] -mr-[0.25em] text-goldColor font-medium">
                NROR
              </span>
            </motion.a>

            {/* Center: Navigation (desktop) */}
            <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2 text-[13px] text-silverColor font-medium">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.08, ease: appleEase }}
                  className="text-shimmer bg-gradient-to-r from-[#f5dfa9] via-[#e2be79] via-[#c58b59] to-[#9e5b4e] bg-clip-text text-transparent hover:text-goldColor transition-colors whitespace-nowrap"
                  whileHover={{ scale: 1.05 }}
                >
                  {link.label}
                </motion.a>
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <motion.button
                onClick={() => handleAddToCart(selectedProduct)}
                className="relative w-10 h-10 flex items-center justify-center rounded-full text-goldColor hover:text-white border border-goldColor/30 hover:border-goldColor transition-colors"
                title="View Bag"
                aria-label="View bag"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
              >
                <ShoppingBag size={17} />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-secondaryColor text-goldColor text-[10px] font-bold rounded-full flex items-center justify-center border border-goldColor/40"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Pill CTA with circular arrow */}
              <motion.a
                href="#collection"
                className="hidden sm:inline-flex items-center gap-3 gold-gradient-btn rounded-full pl-6 pr-1.5 h-11 text-[13px] font-semibold"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.25, ease: appleEase }}
              >
                Shop Now
                <motion.span
                  className="w-8 h-8 rounded-full bg-primaryColor text-goldColor flex items-center justify-center"
                  whileHover={{ x: 2 }}
                >
                  <ArrowRight size={16} />
                </motion.span>
              </motion.a>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full text-goldColor hover:text-white border border-goldColor/30"
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile dropdown */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                transition={{ duration: 0.35, ease: appleEase }}
                className="lg:hidden mt-2 rounded-3xl bg-primaryColor/95 backdrop-blur-xl border border-goldColor/25 shadow-[0_8px_32px_rgba(0,0,0,0.35)] px-6 py-5 space-y-1"
              >
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-3 text-sm text-silverColor hover:text-goldColor border-b border-goldColor/10 last:border-0 font-medium"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="pt-4">
                  <a
                    href="#collection"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-3 w-full h-12 gold-gradient-btn rounded-full text-sm font-semibold"
                  >
                    Shop Now
                    <ArrowRight size={16} />
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* ALERT TOAST WITH SPRING MOTION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="fixed bottom-6 right-6 z-50 bg-primaryColor border border-goldColor text-silverColor px-5 py-3 rounded-xs shadow-2xl flex items-center space-x-3 text-xs"
          >
            <Check size={16} className="text-goldColor" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 01 – HERO BANNER (FIXED 100vh - NO HEIGHT EXTENSION) */}
      <SmoothSection variant="hero" id="hero" className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-primaryColor pt-20 sm:pt-24 lg:pt-0">
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.35, 0.2] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-[#780F27]/25 to-transparent rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1.15, 1, 1.15], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-[#C49A58]/10 rounded-full blur-3xl"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primaryColor/60 via-transparent to-primaryColor"></div>
          <FloatingParticles count={14} />
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">

            {/* Left Column: Brand Copy & Actions (Stays in place throughout) */}
            <div className="lg:col-span-6 text-center lg:text-left space-y-5 sm:space-y-6">

              <motion.p
                custom={0.2}
                variants={textReveal}
                initial="hidden"
                animate="visible"
                className="text-[11px] sm:text-xs uppercase tracking-eyebrow text-goldColor font-semibold"
              >
                AN INDIAN FRAGRANCE HOUSE
              </motion.p>

              <motion.h1
                custom={0.35}
                variants={textReveal}
                initial="hidden"
                animate="visible"
                className="text-shimmer bg-gradient-to-r from-[#f5dfa9] via-[#e2be79] via-[#c58b59] to-[#9e5b4e] bg-clip-text text-transparent font-serif text-4xl sm:text-5xl md:text-4xl lg:text-6xl font-bold tracking-tight leading-[1.08]"
              >
                LEAVE A LASTING IMPRESSION
              </motion.h1>

              <motion.p
                custom={0.5}
                variants={textReveal}
                initial="hidden"
                animate="visible"
                className="text-xs sm:text-sm md:text-[15px] text-silverColor/90 leading-relaxed font-light max-w-xl mx-auto lg:mx-0"
              >
                Crafted for those who define their own identity. Experience fragrance, elegance and individuality with NROR.
              </motion.p>

              <motion.div
                custom={0.65}
                variants={textReveal}
                initial="hidden"
                animate="visible"
                className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
              >
                <motion.a
                  href="#collection"
                  className="w-full sm:w-auto px-8 py-3.5 gold-gradient-btn text-xs uppercase tracking-[0.16em] rounded-xs text-center"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.2, ease: appleEase }}
                >
                  EXPLORE COLLECTION
                </motion.a>
                <motion.a
                  href="#about"
                  className="w-full sm:w-auto px-8 py-3.5 border border-goldColor/50 hover:border-goldColor hover:bg-goldColor/10 text-silverColor text-xs uppercase tracking-[0.16em] rounded-xs text-center transition-colors font-medium"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.2, ease: appleEase }}
                >
                  DISCOVER NROR
                </motion.a>
              </motion.div>
            </div>

            {/* Right Column: Scroll-Scrub Animation */}
            <div className="lg:col-span-6 flex items-center justify-center w-full pt-10">
              <BottleSplashAnimation progressRef={heroProgressRef} />
            </div>

          </div>
        </div>
      </SmoothSection>

      {/* SECTION 02 – BRAND INTRODUCTION */}
      <SmoothSection id="about" className="py-24 md:py-32 bg-primaryColor relative overflow-hidden">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={containerStagger}
          className="max-w-4xl mx-auto px-6 text-center space-y-6"
        >
          <motion.span
            variants={textReveal}
            className="text-[11px] uppercase tracking-eyebrow text-goldColor font-semibold block"
          >
            THE WORLD OF NROR
          </motion.span>

          <motion.h2
            variants={textReveal}
            className="text-shimmer bg-gradient-to-r from-[#f5dfa9] via-[#e2be79] via-[#c58b59] to-[#9e5b4e] bg-clip-text text-transparent font-serif text-3xl sm:text-4xl md:text-5xl font-normal leading-snug"
          >
            Beyond Fragrance. Beyond Ordinary.
          </motion.h2>

          <motion.div
            variants={lineVariant}
            className="w-20 h-0.5 bg-gradient-to-r from-transparent via-goldColor to-transparent mx-auto origin-center"
          />

          <motion.p
            variants={textReveal}
            className="text-sm md:text-base text-silverColor/85 leading-relaxed font-light pt-2 max-w-3xl mx-auto"
          >
            At NROR, we believe fragrance is more than just a scent. It is an expression of personality, a reflection of confidence and a memory that stays long after you leave. Every detail of NROR represents our commitment to elegance, sophistication and timeless luxury.
          </motion.p>

          <motion.p
            variants={textReveal}
            className="font-serif italic text-lg text-goldColor pt-3"
          >
            Discover the NROR difference.
          </motion.p>
        </motion.div>
      </SmoothSection>

      {/* SECTION 03 – PRODUCT COLLECTION */}
      <SmoothSection id="collection" className="py-24 md:py-32 relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12">

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={containerStagger}
            className="text-center max-w-2xl mx-auto mb-16 space-y-3"
          >
            <motion.span
              variants={textReveal}
              className="text-[11px] uppercase tracking-eyebrow text-goldColor font-semibold block"
            >
              THE SIGNATURE COLLECTION
            </motion.span>

            <motion.h2
              variants={textReveal}
              className="text-shimmer bg-gradient-to-r from-[#f5dfa9] via-[#e2be79] via-[#c58b59] to-[#9e5b4e] bg-clip-text text-transparent font-serif text-3xl sm:text-4xl md:text-5xl font-normal"
            >
              Find Your Signature.
            </motion.h2>

            <motion.div
              variants={lineVariant}
              className="w-20 h-0.5 bg-gradient-to-r from-transparent via-goldColor to-transparent mx-auto origin-center"
            />

            <motion.p
              variants={textReveal}
              className="text-xs sm:text-sm text-silverColor/80 leading-relaxed pt-2"
            >
              Discover the beauty of NROR through a collection designed to make every impression unforgettable.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 max-w-5xl mx-auto">
            {products.map((item, idx) => (
              <motion.div
                key={item.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={cardVariant}
                whileHover={{ y: -8, transition: { duration: 0.4, ease: appleEase } }}
                className="card-luxury rounded-xs overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Product Visual */}
                  <div className="relative aspect-[16/11] bg-black/40 overflow-hidden border-b border-goldColor/20">
                    <motion.img
                      src={item.image}
                      alt={item.name}
                      whileHover={{ scale: 1.08 }}
                      transition={{ duration: 0.8, ease: appleEase }}
                      className="w-full h-full object-cover"
                    />
                    <div aria-hidden="true" className="image-shine" />
                  </div>

                  {/* Card Content */}
                  <div className="p-7 sm:p-8 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-serif text-2xl sm:text-3xl font-normal text-white group-hover:text-goldColor transition-colors duration-300">
                          {item.name}
                        </h3>
                        <p className="text-xs text-goldColor uppercase tracking-wider mt-1 font-medium">
                          {item.subtitle}
                        </p>
                      </div>
                      <span className="font-serif text-2xl text-goldColor font-semibold">
                        ₹{item.price}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-silverColor/80 leading-relaxed font-light">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="p-7 sm:p-8 pt-0">
                  <motion.button
                    className="w-full py-3.5 gold-gradient-btn text-xs uppercase tracking-[0.16em] rounded-xs flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2, ease: appleEase }}
                  >
                    <ShoppingBag size={15} />
                    <span>DISCOVER NOW</span>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </SmoothSection>

      {/* SECTION 04 – BRAND BENEFITS */}
      <SmoothSection id="experience" className="py-24 md:py-32 bg-primaryColor relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12">

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={containerStagger}
            className="text-center max-w-2xl mx-auto mb-16 space-y-3"
          >
            <motion.h2
              variants={textReveal}
              className="font-serif text-3xl sm:text-4xl md:text-5xl text-white font-normal"
            >
              Luxury in Every Detail.
            </motion.h2>
            <motion.div
              variants={lineVariant}
              className="w-16 h-0.5 bg-gradient-to-r from-transparent via-goldColor to-transparent mx-auto origin-center"
            />
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerStagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {/* Benefit 1 */}
            <motion.div
              variants={cardVariant}
              whileHover={{ y: -6, transition: { duration: 0.35, ease: appleEase } }}
              className="card-luxury p-8 rounded-xs space-y-4 text-center sm:text-left"
            >
              <motion.div {...iconFloat(0)} className="w-12 h-12 rounded-xs bg-secondaryColor/30 border border-goldColor/40 flex items-center justify-center text-goldColor mx-auto sm:mx-0">
                <Sparkles size={20} />
              </motion.div>
              <h3 className="font-serif text-xl font-normal text-white">
                Distinctive Identity
              </h3>
              <p className="text-xs text-silverColor/75 leading-relaxed font-light">
                A fragrance that reflects your personality.
              </p>
            </motion.div>

            {/* Benefit 2 */}
            <motion.div
              variants={cardVariant}
              whileHover={{ y: -6, transition: { duration: 0.35, ease: appleEase } }}
              className="card-luxury p-8 rounded-xs space-y-4 text-center sm:text-left"
            >
              <motion.div {...iconFloat(0.4)} className="w-12 h-12 rounded-xs bg-secondaryColor/30 border border-goldColor/40 flex items-center justify-center text-goldColor mx-auto sm:mx-0">
                <Package size={20} />
              </motion.div>
              <h3 className="font-serif text-xl font-normal text-white">
                Premium Presentation
              </h3>
              <p className="text-xs text-silverColor/75 leading-relaxed font-light">
                Designed with sophisticated packaging and attention to detail.
              </p>
            </motion.div>

            {/* Benefit 3 */}
            <motion.div
              variants={cardVariant}
              whileHover={{ y: -6, transition: { duration: 0.35, ease: appleEase } }}
              className="card-luxury p-8 rounded-xs space-y-4 text-center sm:text-left"
            >
              <motion.div {...iconFloat(0.8)} className="w-12 h-12 rounded-xs bg-secondaryColor/30 border border-goldColor/40 flex items-center justify-center text-goldColor mx-auto sm:mx-0">
                <Award size={20} />
              </motion.div>
              <h3 className="font-serif text-xl font-normal text-white">
                Timeless Elegance
              </h3>
              <p className="text-xs text-silverColor/75 leading-relaxed font-light">
                Created for people who appreciate luxury.
              </p>
            </motion.div>

            {/* Benefit 4 */}
            <motion.div
              variants={cardVariant}
              whileHover={{ y: -6, transition: { duration: 0.35, ease: appleEase } }}
              className="card-luxury p-8 rounded-xs space-y-4 text-center sm:text-left"
            >
              <motion.div {...iconFloat(1.2)} className="w-12 h-12 rounded-xs bg-secondaryColor/30 border border-goldColor/40 flex items-center justify-center text-goldColor mx-auto sm:mx-0">
                <Flame size={20} />
              </motion.div>
              <h3 className="font-serif text-xl font-normal text-white">
                Make an Impression
              </h3>
              <p className="text-xs text-silverColor/75 leading-relaxed font-light">
                Let your presence be remembered.
              </p>
            </motion.div>
          </motion.div>

        </div>
      </SmoothSection>

      {/* SECTION 05 – EMOTIONAL BRAND STATEMENT */}
      <SmoothSection className="py-24 md:py-32 bg-gradient-to-b from-primaryColor via-secondaryColor/40 to-primaryColor text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(196,154,88,0.08)_0,transparent_70%)] pointer-events-none"></div>
        <FloatingParticles count={18} />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={containerStagger}
          className="max-w-4xl mx-auto px-6 relative z-10 space-y-6"
        >
          <motion.h2
            variants={textReveal}
            className="text-shimmer bg-gradient-to-r from-[#f5dfa9] via-[#e2be79] via-[#c58b59] to-[#9e5b4e] bg-clip-text text-transparent font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-wide leading-tight"
          >
            YOUR PRESENCE. YOUR IDENTITY. YOUR NROR.
          </motion.h2>

          <motion.div
            variants={lineVariant}
            className="w-24 h-0.5 bg-gradient-to-r from-transparent via-goldColor to-transparent mx-auto origin-center"
          />

          <motion.p
            variants={textReveal}
            className="font-serif italic text-lg sm:text-xl md:text-2xl text-goldColor font-light max-w-2xl mx-auto"
          >
            An unforgettable fragrance is not just worn. It is experienced.
          </motion.p>
        </motion.div>
      </SmoothSection>

      {/* SECTION 06 – FINAL CALL TO ACTION */}
      <SmoothSection id="contact" className="py-24 md:py-32 bg-primaryColor text-center relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-70px" }}
          variants={containerStagger}
          className="max-w-3xl mx-auto px-6 space-y-6"
        >
          <motion.h2
            variants={textReveal}
            className="text-shimmer bg-gradient-to-r from-[#f5dfa9] via-[#e2be79] via-[#c58b59] to-[#9e5b4e] bg-clip-text text-transparent font-serif text-3xl sm:text-4xl md:text-5xl font-normal"
          >
            Make Every Moment Memorable.
          </motion.h2>

          <motion.p
            variants={textReveal}
            className="text-xs sm:text-sm md:text-base text-silverColor/80 leading-relaxed font-light max-w-xl mx-auto"
          >
            Step into the world of NROR and discover a fragrance that speaks without words.
          </motion.p>

          <motion.div
            variants={textReveal}
            className="pt-4"
          >
            <motion.a
              href="#collection"
              className="inline-block px-10 py-4 gold-gradient-btn text-xs uppercase tracking-[0.18em] rounded-xs"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.25, ease: appleEase }}
            >
              EXPLORE THE COLLECTION
            </motion.a>
          </motion.div>
        </motion.div>
      </SmoothSection>

      {/* 5. FOOTER CONTENT */}
      <footer className="bg-primaryColor text-silverColor/70 text-xs py-16 relative">
        <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: appleEase }}
          className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-10"
        >
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-3">
            <span className="font-serif text-2xl text-white tracking-[0.2em] block font-medium">
              NROR
            </span>
            <p className="text-xs uppercase tracking-wider text-goldColor font-medium">
              THE ESSENCE OF ELEGANCE
            </p>
            <p className="text-xs text-silverColor/80 leading-relaxed font-light max-w-sm">
              A signature of sophistication. A statement of individuality.
            </p>
          </div>

          {/* Footer Links */}
          <div className="md:col-span-4 space-y-2">
            <p className="text-[11px] uppercase tracking-wider text-goldColor font-semibold mb-3">
              Explore
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
              <a href="#hero" className="link-underline hover:text-goldColor transition-colors">Home</a>
              <a href="#collection" className="link-underline hover:text-goldColor transition-colors">Collection</a>
              <a href="#about" className="link-underline hover:text-goldColor transition-colors">About Us</a>
              <a href="#contact" className="link-underline hover:text-goldColor transition-colors">Contact Us</a>
              <a href="#" className="link-underline hover:text-goldColor transition-colors">Privacy Policy</a>
              <a href="#" className="link-underline hover:text-goldColor transition-colors">Terms & Conditions</a>
            </div>
          </div>

          {/* Social Links */}
          <div className="md:col-span-3 space-y-2">
            <p className="text-[11px] uppercase tracking-wider text-goldColor font-semibold mb-3">
              Follow Us
            </p>
            <div className="flex items-center space-x-3">
              <motion.a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Follow NROR on Instagram"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-9 h-9 rounded-full border border-goldColor/30 flex items-center justify-center text-silverColor hover:text-goldColor hover:border-goldColor transition-colors"
              >
                <Instagram size={16} />
              </motion.a>
              <motion.a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Follow NROR on Facebook"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-9 h-9 rounded-full border border-goldColor/30 flex items-center justify-center text-silverColor hover:text-goldColor hover:border-goldColor transition-colors"
              >
                <Facebook size={16} />
              </motion.a>
            </div>
          </div>
        </motion.div>

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-7xl mx-auto px-6 md:px-12 mt-12 pt-6 border-t border-goldColor/15 flex flex-col sm:flex-row items-center justify-between text-[11px] text-silverColor/50 relative z-10"
        >
          <p>© 2026 NROR. All Rights Reserved.</p>
          <p className="mt-2 sm:mt-0 text-goldColor/70 uppercase tracking-widest font-mono text-[10px]">
            Beyond Fragrance. Beyond Ordinary.
          </p>
        </motion.div>
      </footer>

    </div>
  );
}
