
import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform, Variants, AnimatePresence, useInView } from 'framer-motion';
import { X, Search } from 'lucide-react';
import { galleryData } from '../data/index';

// Define the interface
interface GalleryItem {
  id: string;
  src: string;
  title: string;
  category: string;
  tags?: readonly string[]; 
  contain?: boolean;
  description?: string;
  dimensions?: string;
  fileSize?: string;
  format?: string;
}

// --- FILTER CATEGORIES CONFIGURATION ---
const FILTERS = [
  { id: 'ALL', label: 'All Work' },
  { id: 'MOTION', label: 'Motion & Video', types: ['Animation', 'GIF', 'Animated Sticker'] },
  { id: 'BRANDING', label: 'Branding', types: ['Logo', 'Banner'] },
  { id: 'ILLUSTRATION', label: 'Illustration', types: ['Illustration', 'Comic'] },
  { id: 'WEB3', label: 'Web3 & NFT', types: ['NFT'] },
  { id: 'SOCIAL', label: 'Social & Viral', types: ['Social Media', 'Meme', 'Sticker'] },
];

const BATCH_SIZE = 15; // Number of items to load per "page"

const Gallery: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null); 
  const searchInputRef = useRef<HTMLInputElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null); // Ref for infinite scroll trigger
  
  // State
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  
  // Progressive Loading State
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);

  // Check screen size for parallax logic
  useEffect(() => {
    const checkSize = () => setIsDesktop(window.innerWidth >= 768);
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Parallax Layers for Columns (Only active on Desktop)
  const yCol1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const yCol2 = useTransform(scrollYProgress, [0, 1], [0, -250]); 
  const yCol3 = useTransform(scrollYProgress, [0, 1], [0, -50]);

  // Lock scroll when overlay is open
  useEffect(() => {
    if (selectedCategory) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [selectedCategory]);

  // Handle Click Outside to Collapse Search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        if (!searchQuery) {
            setIsSearchOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchQuery]);

  // --- INFINITE SCROLL OBSERVER ---
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting) {
        setVisibleCount((prev) => prev + BATCH_SIZE);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
        root: null,
        rootMargin: "400px", // Load next batch well before user hits bottom
        threshold: 0
    });
    
    if (loadMoreRef.current) {
        observer.observe(loadMoreRef.current);
    }

    return () => {
        if (loadMoreRef.current) observer.unobserve(loadMoreRef.current);
    }
  }, [handleObserver, activeFilter, searchQuery]); // Re-attach when data source changes

  // Reset visible count when filter or search changes
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [activeFilter, searchQuery]);


  const handleScrollToGallery = () => {
    if (containerRef.current) {
        containerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const transitionConfig = {
    duration: 1.2,
    ease: [0.16, 1, 0.3, 1] as [number, number, number, number]
  };

  const textVariants: Variants = {
    hidden: { opacity: 0, y: 60, filter: 'blur(10px)' },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: 'blur(0px)',
      transition: transitionConfig
    }
  };

  // Updated Image Variants for "Bottom-Up" Motion
  const imageVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.98, 
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  // --- DATA FILTERING LOGIC ---
  const allWorkData = useMemo(() => {
    // Unique filtering logic: Ensure some variety if needed, or just return all
    // For now, returning all data sorted or as-is
    return galleryData; 
  }, []);

  const activeData = useMemo(() => {
    let filtered = allWorkData;

    // Apply Category Filter
    if (activeFilter !== 'ALL') {
        const currentFilter = FILTERS.find(f => f.id === activeFilter);
        if (currentFilter && currentFilter.types) {
            filtered = filtered.filter(item => currentFilter.types!.includes(item.category));
        }
    }

    // Apply Search Filter
    if (searchQuery.trim()) {
        const terms = searchQuery.toLowerCase().trim().split(/\s+/);
        filtered = filtered.filter(item => {
            const itemTags = item.tags ? item.tags.join(' ') : '';
            const searchableText = `${item.title} ${item.category} ${item.description || ''} ${itemTags}`.toLowerCase();
            return terms.every(term => searchableText.includes(term));
        });
    }

    return filtered;
  }, [activeFilter, allWorkData, searchQuery]);

  // --- SLICE DATA FOR PROGRESSIVE LOADING ---
  const visibleData = useMemo(() => {
      return activeData.slice(0, visibleCount);
  }, [activeData, visibleCount]);


  // --- MASONRY COLUMN SPLIT (For Visible Data Only) ---
  const masonryColumns = useMemo(() => {
    if (activeFilter !== 'ALL' && !searchQuery) return [[], [], []];
    // Also use masonry for ALL even with search if no query, but here we want search to be grid
    
    const cols: GalleryItem[][] = [[], [], []];
    visibleData.forEach((item, i) => {
        cols[i % 3].push(item);
    });
    return cols;
  }, [visibleData, activeFilter, searchQuery]);


  return (
    <section id="gallery" ref={containerRef} className="relative w-full bg-white text-black py-24 md:py-32 overflow-hidden">
      
      {/* HEADER & FILTER BAR */}
      <div className="container mx-auto px-4 relative mb-12">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end border-b border-black pb-6 gap-6">
          <motion.h2 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-10%" }}
            variants={textVariants}
            className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9]"
          >
            Works
          </motion.h2>

          {/* FILTER BUTTONS */}
          <div className="flex flex-wrap gap-2 md:gap-3 items-center">
             {FILTERS.map((filter) => (
                <button
                    key={filter.id}
                    onClick={() => {
                        setActiveFilter(filter.id);
                        setSearchQuery(''); 
                        window.scrollTo({
                            top: containerRef.current?.offsetTop ? containerRef.current.offsetTop - 100 : 0,
                            behavior: 'smooth'
                        });
                    }}
                    className={`
                        px-4 py-2 rounded-full border border-black font-mono text-xs md:text-sm uppercase tracking-wider transition-all duration-300
                        ${activeFilter === filter.id 
                            ? 'bg-black text-white scale-105' 
                            : 'bg-transparent text-black hover:bg-black/5'}
                    `}
                    data-hover="true"
                >
                    {filter.label}
                </button>
             ))}
          </div>

          {/* SEARCH */}
          <div className="flex items-center mb-1 md:mb-3" ref={searchContainerRef}>
            <AnimatePresence mode="wait">
                {isSearchOpen ? (
                    <motion.div 
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: "auto", opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="flex items-center border-b border-black pb-1"
                    >
                        <Search className="w-5 h-5 mr-3 text-gray-500" />
                        <input 
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="FIND..."
                            className="w-32 md:w-48 bg-transparent outline-none font-mono text-base uppercase placeholder:text-gray-300"
                        />
                        <button onClick={() => { setSearchQuery(''); setIsSearchOpen(false); }} className="ml-2">
                            <X className="w-5 h-5 hover:text-red-500 transition-colors" />
                        </button>
                    </motion.div>
                ) : (
                    <motion.button 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => { setIsSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 100); }}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <Search className="w-6 h-6 md:w-8 md:h-8" />
                    </motion.button>
                )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      {searchQuery ? (
        // --- SEARCH RESULTS GRID ---
        <div className="container mx-auto px-4 min-h-[50vh]">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="flex items-center gap-4 mb-12"
            >
                <span className="font-mono text-sm text-gray-400 uppercase tracking-widest">
                    Searching for "{searchQuery}" — {activeData.length} Results
                </span>
            </motion.div>

            {visibleData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {visibleData.map((item, i) => (
                        <ProjectItem 
                            key={`${item.id}-${i}`}
                            item={item}
                            aspect="aspect-square"
                            variants={imageVariants}
                            contain={item.contain}
                            delay={0} // No stagger for infinite scroll items to appear faster
                            priority={i < 6} // Eager load top 6
                            onClick={() => setSelectedCategory(item.category)}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 opacity-50 border border-dashed border-gray-300 rounded-lg">
                    <Search size={48} className="mb-4 text-gray-300" />
                    <p className="font-mono uppercase text-lg text-gray-400">No matches found</p>
                </div>
            )}
        </div>
      ) : (
        <div className="container mx-auto px-4 relative min-h-[50vh]">
            
            {activeFilter === 'ALL' ? (
                // --- MASONRY PARALLAX LAYOUT (ALL WORK) ---
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full items-start">
                    
                    {/* Column 1 */}
                    <motion.div 
                        style={{ y: isDesktop ? yCol1 : 0 }} 
                        className="flex flex-col gap-12"
                    >
                        {masonryColumns[0].map((item, i) => (
                            <ProjectItem 
                                key={item.id} 
                                item={item} 
                                aspect="auto" 
                                variants={imageVariants} 
                                delay={0} 
                                priority={i < 2} // Eager load top items
                                onClick={() => setSelectedCategory(item.category)} 
                            />
                        ))}
                    </motion.div>

                    {/* Column 2 */}
                    <motion.div 
                        style={{ y: isDesktop ? yCol2 : 0 }} 
                        className="flex flex-col gap-12 md:pt-24"
                    >
                        {masonryColumns[1].map((item, i) => (
                            <ProjectItem 
                                key={item.id} 
                                item={item} 
                                aspect="auto" 
                                variants={imageVariants} 
                                delay={0} 
                                priority={i < 2} 
                                onClick={() => setSelectedCategory(item.category)} 
                            />
                        ))}
                    </motion.div>

                    {/* Column 3 */}
                    <motion.div 
                        style={{ y: isDesktop ? yCol3 : 0 }} 
                        className="flex flex-col gap-12 md:pt-12"
                    >
                        {masonryColumns[2].map((item, i) => (
                            <ProjectItem 
                                key={item.id} 
                                item={item} 
                                aspect="auto" 
                                variants={imageVariants} 
                                delay={0} 
                                priority={i < 2} 
                                onClick={() => setSelectedCategory(item.category)} 
                            />
                        ))}
                    </motion.div>
                </div>
            ) : (
                // --- CLEAN GRID LAYOUT (SPECIFIC FILTERS) ---
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {visibleData.map((item, i) => (
                        <ProjectItem 
                            key={item.id}
                            item={item}
                            aspect="aspect-square" 
                            variants={imageVariants}
                            contain={item.contain}
                            delay={0}
                            priority={i < 6}
                            onClick={() => setSelectedCategory(item.category)}
                        />
                    ))}
                    {visibleData.length === 0 && (
                        <div className="col-span-full py-20 text-center">
                            <p className="font-mono text-gray-400 uppercase">No projects found in this category.</p>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
      )}

      {/* INFINITE SCROLL TRIGGER */}
      {visibleCount < activeData.length && (
          <div ref={loadMoreRef} className="w-full h-20 flex items-center justify-center mt-10">
              <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin opacity-50" />
          </div>
      )}

      {/* FOOTER WIZARD */}
      <DiscoveryWizard onBrowse={handleScrollToGallery} />

      {/* DETAIL OVERLAY */}
      <AnimatePresence>
        {selectedCategory && (
          <ConceptDetailOverlay 
            category={selectedCategory} 
            onClose={() => setSelectedCategory(null)} 
          />
        )}
      </AnimatePresence>

    </section>
  );
};

// ... (Rest of Wizard components remain exactly same as before) ...
// RE-EXPORTING FOR COMPLETENESS OF THE FILE

// --- OPTION ITEM FOR WIZARD ---
const OptionItem = ({ label, index, hoveredOption, onHover, onLeave, onClick }: any) => {
  const isHovered = hoveredOption === label;
  const isDimmed = hoveredOption !== null && !isHovered;

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ 
        opacity: isDimmed ? 0.2 : 1, 
        x: isHovered ? 20 : 0, 
        scale: isDimmed ? 0.95 : (isHovered ? 1.1 : 1),
        filter: isDimmed ? "blur(3px)" : "blur(0px)",
      }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative cursor-pointer group flex items-center justify-center py-1 md:py-2 w-full"
      onMouseEnter={() => onHover(label)}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      <h4 
        className="text-5xl md:text-8xl font-black uppercase tracking-tighter transition-all duration-300"
        style={{ 
            color: isHovered ? 'transparent' : '#FFFFFF',
            WebkitTextStroke: isHovered ? '1px #FFFFFF' : '0px',
        }}
      >
        {label}
      </h4>
    </motion.div>
  );
};

// --- DISCOVERY WIZARD COMPONENT ---
const DiscoveryWizard: React.FC<{ onBrowse: () => void }> = ({ onBrowse }) => {
    const [step, setStep] = useState<number>(0);
    const [selections, setSelections] = useState<{type?: string; style?: string; subject?: string}>({});
    const [results, setResults] = useState<GalleryItem[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [hoveredOption, setHoveredOption] = useState<string | null>(null);

    const handleSearch = () => {
        const { type, style, subject } = selections;
        
        const filtered = galleryData.filter(item => {
            let typeMatch = false;
            let styleMatch = false;
            let subjectMatch = false;

            if (type === 'BRANDING') typeMatch = ['Logo', 'Banner'].includes(item.category);
            else if (type === 'ARTWORK') typeMatch = ['Illustration', 'NFT', 'Comic'].includes(item.category);
            else if (type === 'MOTION') typeMatch = ['GIF', 'Sticker', 'Animated Sticker', 'Animation'].includes(item.category);
            else if (type === 'SOCIAL') typeMatch = ['Social Media'].includes(item.category);
            else typeMatch = true;

            const tags = (item as any).tags || [];

            if (!style) styleMatch = true;
            else {
                const searchTags = style === 'MINIMALIST' ? ['minimalist', 'clean', 'simple', 'sleek', 'modern', 'professional'] :
                                   style === 'CUTE' ? ['cute', 'chibi', 'kawaii', 'happy', 'sweet', 'adorable'] :
                                   style === 'DARK' ? ['dark', 'gothic', 'mysterious', 'horror', 'shadow', 'vampire', 'demon'] :
                                   style === 'VIBRANT' ? ['vibrant', 'colorful', 'bright', 'neon', 'dynamic', 'energetic'] : [];
                
                styleMatch = tags.some((t: string) => searchTags.includes(t.toLowerCase()));
            }

            if (!subject) subjectMatch = true;
            else {
                const searchTags = subject === 'CHARACTERS' ? ['character', 'girl', 'boy', 'portrait', 'mascot', 'animal', 'cat', 'dog', 'person', 'woman', 'man'] :
                                   subject === 'NATURE' ? ['nature', 'flower', 'floral', 'forest', 'plant', 'tree', 'water', 'ocean', 'sky', 'cloud'] :
                                   subject === 'TECH' ? ['tech', 'technology', 'sci-fi', 'futuristic', 'cyberpunk', 'robot', 'digital', 'crypto', 'blockchain'] :
                                   subject === 'ABSTRACT' ? ['abstract', 'geometric', 'pattern', 'shape', 'design', 'artistic', 'creative'] : [];
                
                subjectMatch = tags.some((t: string) => searchTags.includes(t.toLowerCase()));
            }

            return typeMatch && styleMatch && subjectMatch;
        });

        setResults(filtered);
        setShowResults(true);
    };

    const resetWizard = () => {
        setStep(0);
        setSelections({});
        setShowResults(false);
        setResults([]);
        setHoveredOption(null);
    };

    return (
        <>
        <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 1 }}
            className="w-full bg-black text-white py-32 md:py-48 mt-32 relative overflow-hidden flex flex-col items-center justify-center min-h-[80vh]"
        >
            {step > 0 && (
                <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
                    <motion.div 
                        className="h-full bg-white"
                        initial={{ width: 0 }}
                        animate={{ width: `${(step / 3) * 100}%` }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                    />
                </div>
            )}

            <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
                <AnimatePresence mode="wait">
                    {step === 0 && (
                        <motion.div 
                            key="step0"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, filter: 'blur(10px)' }}
                            className="flex flex-col items-center gap-12"
                        >
                            <h3 className="text-[10vw] md:text-[8vw] font-black uppercase tracking-tighter leading-none mix-blend-overlay opacity-80">
                                LOST?
                            </h3>
                            <div className="flex flex-col items-center gap-6">
                                <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/60">
                                    Let us guide your vision
                                </p>
                                <div className="mt-8">
                                    <button 
                                        className="text-xl md:text-2xl font-bold uppercase tracking-tight flex items-center gap-2 hover:tracking-widest transition-all duration-300"
                                        onClick={() => setStep(1)}
                                    >
                                        Start Discovery
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 1, 2, 3 content omitted for brevity but logic remains same */}
                    {step === 1 && (
                        <motion.div 
                            key="step1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, y: -50 }}
                            className="flex flex-col items-center w-full"
                        >
                            <motion.span 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                                className="font-mono text-xs text-white/40 uppercase tracking-widest mb-12"
                            >
                                01 / Format
                            </motion.span>
                            
                            <div className="flex flex-col items-center gap-0 w-full" onMouseLeave={() => setHoveredOption(null)}>
                                {['BRANDING', 'ARTWORK', 'MOTION', 'SOCIAL'].map((opt, i) => (
                                    <OptionItem 
                                        key={opt} 
                                        label={opt} 
                                        index={i}
                                        hoveredOption={hoveredOption}
                                        onHover={setHoveredOption}
                                        onLeave={() => {}}
                                        onClick={() => {
                                            setSelections(prev => ({...prev, type: opt}));
                                            setStep(2);
                                            setHoveredOption(null);
                                        }} 
                                    />
                                ))}
                            </div>
                            <button onClick={() => setStep(0)} className="mt-16 text-xs font-mono uppercase text-white/30 hover:text-white transition-colors">[ Go Back ]</button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div 
                            key="step2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, y: -50 }}
                            className="flex flex-col items-center w-full"
                        >
                            <motion.span 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                                className="font-mono text-xs text-white/40 uppercase tracking-widest mb-12"
                            >
                                02 / Aesthetic
                            </motion.span>
                            <div className="flex flex-col items-center gap-0 w-full" onMouseLeave={() => setHoveredOption(null)}>
                                {['MINIMALIST', 'CUTE', 'DARK', 'VIBRANT'].map((opt, i) => (
                                    <OptionItem 
                                        key={opt} 
                                        label={opt} 
                                        index={i}
                                        hoveredOption={hoveredOption}
                                        onHover={setHoveredOption}
                                        onLeave={() => {}}
                                        onClick={() => {
                                            setSelections(prev => ({...prev, style: opt}));
                                            setStep(3);
                                            setHoveredOption(null);
                                        }} 
                                    />
                                ))}
                            </div>
                            <div className="flex gap-8 mt-16">
                                <button onClick={() => setStep(1)} className="text-xs font-mono uppercase text-white/30 hover:text-white transition-colors">[ Back ]</button>
                                <button onClick={() => setStep(3)} className="text-xs font-mono uppercase text-white/30 hover:text-white transition-colors">[ Skip ]</button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div 
                            key="step3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, y: -50 }}
                            className="flex flex-col items-center w-full"
                        >
                            <motion.span 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                                className="font-mono text-xs text-white/40 uppercase tracking-widest mb-12"
                            >
                                03 / Focus
                            </motion.span>
                            <div className="flex flex-col items-center gap-0 w-full" onMouseLeave={() => setHoveredOption(null)}>
                                {['CHARACTERS', 'NATURE', 'TECH', 'ABSTRACT'].map((opt, i) => (
                                    <OptionItem 
                                        key={opt} 
                                        label={opt} 
                                        index={i}
                                        hoveredOption={hoveredOption}
                                        onHover={setHoveredOption}
                                        onLeave={() => {}}
                                        onClick={() => {
                                            setSelections(prev => ({...prev, subject: opt}));
                                            const newSelections = { ...selections, subject: opt };
                                            setTimeout(() => {
                                                setSelections(newSelections);
                                                handleSearch();
                                            }, 200);
                                        }} 
                                    />
                                ))}
                            </div>
                            <div className="flex gap-8 mt-16">
                                <button onClick={() => setStep(2)} className="text-xs font-mono uppercase text-white/30 hover:text-white transition-colors">[ Back ]</button>
                                <button onClick={() => handleSearch()} className="text-xs font-mono uppercase text-white/30 hover:text-white transition-colors">[ Show All ]</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <div className="absolute inset-0 opacity-[0.07] pointer-events-none mix-blend-overlay"
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none" />
        </motion.div>

        <AnimatePresence>
            {showResults && (
                <WizardResultOverlay 
                    results={results} 
                    criteria={selections} 
                    onClose={resetWizard} 
                />
            )}
        </AnimatePresence>
        </>
    );
}

const WizardResultOverlay: React.FC<{ results: GalleryItem[]; criteria: any; onClose: () => void }> = ({ results, criteria, onClose }) => {
    const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

    return (
        <>
        <motion.div
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[60] bg-black text-white overflow-y-auto overflow-x-hidden"
        >
            <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10 px-4 py-6 md:px-8 flex justify-between items-center">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                        {criteria.type && <span>{criteria.type}</span>}
                        {criteria.style && <span>/ {criteria.style}</span>}
                        {criteria.subject && <span>/ {criteria.subject}</span>}
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mt-1">
                        Matches ({results.length})
                    </h2>
                </div>
                <div className="flex gap-4 items-center">
                    <button onClick={onClose} className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                        <X size={24} />
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                {results.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {results.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="group cursor-none"
                                onClick={() => setSelectedImage(item)}
                                data-hover="true"
                                data-cursor-text="VIEW"
                            >
                                <div className={`w-full aspect-square relative overflow-hidden bg-gray-900 ${item.contain ? 'p-8' : ''}`}>
                                    <img src={item.src} alt={item.title} className={`w-full h-full ${item.contain ? 'object-contain' : 'object-cover'} transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100`} />
                                </div>
                                <div className="mt-4 border-t border-white/20 pt-2 flex justify-between items-baseline">
                                    <h3 className="text-lg font-bold uppercase">{item.title}</h3>
                                    <span className="text-xs font-mono text-gray-500">{item.category}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 opacity-50">
                        <Search size={64} className="mb-4" />
                        <p className="font-mono uppercase text-lg">No exact matches found.</p>
                        <p className="text-sm text-gray-500">Try adjusting your choices or starting over.</p>
                    </div>
                )}
            </div>
        </motion.div>

        <AnimatePresence>
            {selectedImage && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => setSelectedImage(null)}
                    className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 cursor-zoom-out"
                >
                    <motion.img
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        src={selectedImage.src}
                        alt={selectedImage.title}
                        className="max-w-full max-h-full object-contain shadow-2xl"
                        onClick={(e) => e.stopPropagation()} 
                    />
                    <button onClick={() => setSelectedImage(null)} className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
                        <X size={48} />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
        </>
    );
};

const ConceptDetailOverlay: React.FC<{ category: string; onClose: () => void }> = ({ category, onClose }) => {
    // ... (Same as before)
    const items = useMemo(() => galleryData.filter(item => item.category === category), [category]);
    const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  
    return (
      <>
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: "0%" }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} 
        className="fixed inset-0 z-[60] bg-white text-black overflow-y-auto overflow-x-hidden"
      >
        <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-black/10 px-4 py-6 md:px-8 flex justify-between items-center">
          <div>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">{category}</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-full border border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors cursor-none"
            data-hover="true"
          >
            <X size={24} />
          </button>
        </div>
  
        <div className="container mx-auto px-4 py-12 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + (index * 0.1), duration: 0.8, ease: "easeOut" }}
                className="flex flex-col gap-4 group"
              >
                <div 
                  className={`w-full ${item.contain ? 'bg-gray-100 p-8 aspect-square' : 'aspect-[4/5]'} relative overflow-hidden bg-gray-50 cursor-none`}
                  onClick={() => setSelectedImage(item)}
                  data-hover="true"
                  data-cursor-text="ZOOM"
                >
                  <img 
                    src={item.src} 
                    alt={item.title} 
                    loading="lazy"
                    decoding="async"
                    className={`w-full h-full ${item.contain ? 'object-contain' : 'object-cover'} transition-transform duration-700 group-hover:scale-105`}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>
  
                <div className="flex flex-col border-t border-black pt-4">
                  <div className="flex justify-between items-baseline">
                      <h3 className="text-xl font-bold uppercase tracking-tight">{item.title}</h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        <div className="w-full py-12 text-center border-t border-black/10 mt-12">
            <p className="font-mono text-xs text-gray-400 uppercase">End of Concept</p>
        </div>
      </motion.div>
  
      <AnimatePresence>
          {selectedImage && (
              <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setSelectedImage(null)}
                  className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 cursor-zoom-out"
              >
                  <motion.img
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      transition={{ type: "spring", damping: 25, stiffness: 200 }}
                      src={selectedImage.src}
                      alt={selectedImage.title}
                      className="max-w-full max-h-full object-contain shadow-2xl"
                      onClick={(e) => e.stopPropagation()} 
                  />
                  
                  <button onClick={() => setSelectedImage(null)} className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors" data-hover="true">
                      <X size={48} />
                  </button>
              </motion.div>
          )}
      </AnimatePresence>
      </>
    );
};

// --- UPDATED PROJECT ITEM WITH VIRTUALIZATION ---
interface ProjectItemProps {
    item: GalleryItem;
    aspect: string;
    variants: Variants;
    delay?: number;
    contain?: boolean;
    theme?: 'light' | 'dark';
    onClick?: () => void;
    priority?: boolean; 
}

const ProjectItem: React.FC<ProjectItemProps> = ({ 
    item, 
    aspect, 
    variants, 
    delay = 0, 
    contain = false,
    theme = 'light',
    onClick,
    priority = false
}) => {
    const isDark = theme === 'dark';
    const textColor = isDark ? 'text-white' : 'text-black';
    const subTextColor = isDark ? 'text-gray-400' : 'text-gray-500';
    const skeletonColor = isDark ? 'bg-gray-800' : 'bg-gray-100'; 
    const pulseColor = isDark ? 'bg-gray-700' : 'bg-gray-200';

    // Virtualization Logic: Detect when this component is in viewport
    const containerRef = useRef(null);
    // Large rootMargin to preload before user scrolls to it, and keep it a bit after they scroll past
    const isInView = useInView(containerRef, { margin: "800px 0px 800px 0px", once: false });

    const [imgLoaded, setImgLoaded] = useState(false);

    // Calculate aspect ratio for the placeholder container
    let containerStyle: React.CSSProperties = {
        // Optimization: Browser rendering performance
        contentVisibility: 'auto',
        containIntrinsicSize: '1px 300px', // Fallback height estimate
    };
    
    let containerClass = aspect; 

    if (aspect === 'auto') {
        containerClass = ''; 
        if (item.dimensions && item.dimensions.includes('x')) {
            const [w, h] = item.dimensions.split('x').map(Number);
            if (!isNaN(w) && !isNaN(h)) {
                containerStyle.aspectRatio = `${w} / ${h}`;
                containerStyle.containIntrinsicSize = `1px ${Math.round((h/w) * 300)}px`;
            }
        } else {
             // Fallback if dimensions missing
             containerStyle.aspectRatio = '3/4'; 
        }
    }

    return (
        <motion.div
            ref={containerRef}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-5%" }} // Animation trigger (separate from virtualization)
            variants={variants}
            transition={{ delay: delay }}
            className="flex flex-col w-full"
            onClick={onClick}
        >
            <div 
                className={`group relative ${containerClass} ${skeletonColor} overflow-hidden cursor-none mb-3 w-full`} 
                style={containerStyle}
                data-hover="true"
                data-cursor-text="VIEW"
            >
                {/* VIRTUALIZATION: Only render the heavy Image tag if within 800px of viewport */}
                {isInView ? (
                    <>
                        {/* SKELETON LOADER (Only show if image hasn't loaded yet) */}
                        {!imgLoaded && (
                            <div className={`absolute inset-0 z-10 animate-pulse ${pulseColor}`} />
                        )}

                        <img 
                            src={item.src} 
                            alt={item.title} 
                            loading={priority ? "eager" : "lazy"} 
                            // @ts-ignore
                            fetchPriority={priority ? "high" : "auto"} 
                            decoding="async" 
                            onLoad={() => setImgLoaded(true)}
                            className={`w-full h-full ${contain ? 'object-contain p-8' : 'object-cover'} transition-all duration-700 ease-out group-hover:scale-110 
                                ${imgLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-sm'}`}
                        />
                        
                        {/* Overlay Effect */}
                        {imgLoaded && (
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                        )}
                    </>
                ) : (
                    // Placeholder when off-screen to maintain layout height
                    <div className="w-full h-full" />
                )}
            </div>
            
            {/* Minimal Description */}
            <div className="flex flex-col items-start gap-1">
                <h3 className={`text-lg md:text-xl font-bold uppercase tracking-tight leading-none ${textColor}`}>{item.title}</h3>
                <span className={`font-mono text-[10px] md:text-xs uppercase tracking-widest ${subTextColor}`}>{item.category}</span>
            </div>
        </motion.div>
    );
}

export default Gallery;
