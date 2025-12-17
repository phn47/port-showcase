
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

const services = [
  { id: 1, name: "Web3 Development", image: "https://i.ibb.co/Jw3g2Fj8/96-result.webp" },
  { id: 2, name: "Motion Art", image: "https://res.cloudinary.com/dpcmdnqbb/video/upload/v1765940924/2_kzi0sr.mp4" },
  { id: 3, name: "Web portfolio", image: "https://i.ibb.co/8gkWvpXG/70-result.webp" },
  { id: 4, name: "Brand pages", image: "https://i.ibb.co/kkHmfFq/ver-1-result.webp" },
  { id: 5, name: "Web Funnels", image: "https://i.ibb.co/fdysG9wd/221rr-banner-result.webp" }
];

const isVideo = (src: string) => {
    return src?.toLowerCase().match(/\.(mp4|webm|mov)$/);
};

const Services: React.FC = () => {
  const [hoveredService, setHoveredService] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    }
  };

  const itemVariant: Variants = {
    hidden: { opacity: 0, x: -50 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.2, duration: 1.2, ease: [0.16, 1, 0.3, 1] } 
    })
  };

  return (
    <section 
        id="services"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative w-full bg-white py-32 overflow-hidden cursor-none"
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col">
          {services.map((service, i) => (
            <motion.div 
              key={service.id}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-10%" }}
              variants={itemVariant}
              className="relative border-b border-gray-200 py-12 group"
              onMouseEnter={() => setHoveredService(service.id)}
              onMouseLeave={() => setHoveredService(null)}
              data-hover="true"
            >
              <h2 className="text-6xl md:text-9xl font-black uppercase text-gray-200 transition-all duration-300 group-hover:text-black group-hover:translate-x-12 select-none">
                {service.name}
              </h2>
              <span className="absolute top-1/2 right-4 -translate-y-1/2 font-mono text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                0{service.id}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Floating Reveal Image */}
      <AnimatePresence>
        {hoveredService && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
                opacity: 1, 
                scale: 1, 
                x: mousePos.x + 20, 
                y: mousePos.y - 150 
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 150, damping: 15 }}
            className="absolute top-0 left-0 w-64 h-48 pointer-events-none z-20 overflow-hidden border-2 border-black bg-black"
          >
             {(() => {
                 const currentService = services.find(s => s.id === hoveredService);
                 if (!currentService) return null;
                 
                 return isVideo(currentService.image) ? (
                    <video
                        src={currentService.image}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover grayscale"
                    />
                 ) : (
                    <img 
                        src={currentService.image} 
                        alt="Preview" 
                        className="w-full h-full object-cover grayscale"
                    />
                 );
             })()}
             <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Services;
