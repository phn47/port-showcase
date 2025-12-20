import React, { useRef } from 'react';
import { motion, useScroll, useSpring, Variants } from 'framer-motion';
import { useTimelineEntries } from '@/hooks/useTimeline';

const Timeline: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: entries } = useTimelineEntries({
    status: 'published',
    order: 'display_order.asc'
  });

  // 1. Setup Scroll Progress
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end 85%"]
  });

  // 2. Add Physics Spring for "Fluid" Drawing
  const pathLength = useSpring(scrollYProgress, {
    stiffness: 400,
    damping: 90,
    mass: 1
  });

  // Dynamic path based on entries count is tricky with fixed SVG viewBox.
  // We keep the stylized path but logically it aligns with 4-5 items.
  const pathData = "M 50 0 C 50 12, 20 12, 20 25 C 20 38, 80 38, 80 50 C 80 62, 20 62, 20 75 C 20 85, 50 85, 50 88";

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 100 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1.5, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section id="timeline" ref={containerRef} className="relative w-full min-h-[200vh] py-32 bg-white overflow-hidden text-black">

      {/* The Timeline SVG */}
      <svg className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          d={pathData}
          fill="none"
          stroke="#E5E5E5"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
        />
        <motion.path
          d={pathData}
          fill="none"
          stroke="#000"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          style={{ pathLength }}
        />
      </svg>

      <div className="container mx-auto px-4 relative z-10">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10%" }}
          variants={fadeInUp}
          className="text-6xl md:text-9xl font-black uppercase text-center mb-32 opacity-100 text-black"
        >
          9F Roadmap
        </motion.h2>

        {entries?.map((item, index) => {
          const isLast = index === entries.length - 1;
          const isEven = index % 2 === 0;

          // Special Layout for Last Item (Center aligned like "Future")
          if (isLast) {
            return (
              <motion.div
                key={item.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-10%" }}
                variants={fadeInUp}
                className="flex flex-col items-center justify-center text-center mb-0 relative z-10"
              >
                <div className="mb-8">
                  <div className="font-mono text-sm mb-2 text-black font-bold uppercase">{item.title}</div>
                  <h3 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-black">{item.date_label}</h3>
                  {item.body && (
                    <p className="font-mono text-sm max-w-xs mx-auto text-center mt-4 text-gray-800">
                      {item.body}
                    </p>
                  )}
                </div>
                {item.media_url && (
                  <div className="opacity-80 hover:opacity-100 transition-opacity">
                    {(item.media_url.match(/\.(mp4|webm|mov)$/i)) ? (
                      <video
                        src={item.media_url}
                        className="grayscale contrast-125 shadow-lg w-full max-w-2xl object-cover"
                        autoPlay muted loop playsInline
                      />
                    ) : (
                      <img
                        src={item.media_url}
                        className="grayscale contrast-125 shadow-lg w-full max-w-2xl object-cover"
                        alt={item.media_alt || item.title}
                      />
                    )}
                  </div>
                )}
              </motion.div>
            );
          }

          // Standard Layout (Left/Right alternating)
          return (
            <motion.div
              key={item.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-10%" }}
              variants={fadeInUp}
              className={`flex flex-col md:flex-row items-center ${isEven ? 'justify-start pl-0 md:pl-12' : 'justify-end text-right pr-0 md:pr-2'
                } mb-48 relative`}
            >
              {isEven ? (
                // LEFT ALIGN
                <>
                  <div className="md:w-1/3 p-4">
                    <div className="font-mono text-sm mb-2 text-black font-bold uppercase">{item.title}</div>
                    <h3 className="text-6xl font-bold uppercase mb-4 tracking-tighter text-black">{item.date_label}</h3>
                    {item.body && (
                      <p className="font-mono text-sm max-w-xs text-gray-800">
                        {item.body}
                      </p>
                    )}
                  </div>
                  {item.media_url && (
                    <div className="md:w-1/2 md:ml-12 opacity-80 hover:opacity-100 transition-opacity">
                      {(item.media_url.match(/\.(mp4|webm|mov)$/i)) ? (
                        <video
                          src={item.media_url}
                          className="grayscale contrast-125 shadow-lg w-full max-w-md object-cover"
                          autoPlay muted loop playsInline
                        />
                      ) : (
                        <img
                          src={item.media_url}
                          className="grayscale contrast-125 shadow-lg w-full max-w-md object-cover"
                          alt={item.media_alt || item.title}
                        />
                      )}
                    </div>
                  )}
                </>
              ) : (
                // RIGHT ALIGN
                <>
                  {item.media_url && (
                    <div className="md:w-1/2 md:mr-12 opacity-80 hover:opacity-100 transition-opacity order-2 md:order-1 flex justify-end">
                      {(item.media_url.match(/\.(mp4|webm|mov)$/i)) ? (
                        <video
                          src={item.media_url}
                          className="grayscale contrast-125 shadow-lg w-full max-w-md object-cover"
                          autoPlay muted loop playsInline
                        />
                      ) : (
                        <img
                          src={item.media_url}
                          className="grayscale contrast-125 shadow-lg w-full max-w-md object-cover"
                          alt={item.media_alt || item.title}
                        />
                      )}
                    </div>
                  )}
                  <div className="md:w-1/3 p-4 order-1 md:order-2">
                    <div className="font-mono text-sm mb-2 text-black font-bold uppercase">{item.title}</div>
                    <h3 className="text-6xl font-bold uppercase mb-4 tracking-tighter text-black">{item.date_label}</h3>
                    {item.body && (
                      <p className="font-mono text-sm max-w-xs text-gray-800 ml-auto">
                        {item.body}
                      </p>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          );
        })}

        {/* Fallback empty state */}
        {(!entries || entries.length === 0) && (
          <div className="text-center pb-32">
            <p className="font-mono uppercase text-gray-400">Loading timeline...</p>
          </div>
        )}

      </div>
    </section>
  );
};

export default Timeline;
