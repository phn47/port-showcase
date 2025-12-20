import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const menuItems = [
  { id: 1, label: 'Home', href: '#home' },
  { id: 2, label: 'Gallery', href: '#gallery' },
  { id: 3, label: 'Timeline', href: '#timeline' },
  { id: 4, label: 'Services', href: '#services' },
  { id: 5, label: 'Blog', href: '/blog' },
  { id: 6, label: 'Contact', href: '#contact' },
];

const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsOpen(false);

    // Allow menu closing animation to start
    setTimeout(() => {
      if (href.startsWith('/')) {
        navigate(href);
      } else {
        // Internal Link
        if (location.pathname !== '/') {
          navigate('/');
          setTimeout(() => {
            const element = document.querySelector(href);
            if (element) element.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        } else {
          const element = document.querySelector(href);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    }, 500);
  };

  // Smoother, slower animation using an exponential-like Bezier curve
  const sidebarVariants: Variants = {
    closed: {
      x: "100%",
      transition: {
        duration: 1.2, // Slower duration
        ease: [0.83, 0, 0.17, 1] // Premium 'Expo' ease
      }
    },
    open: {
      x: "0%",
      transition: {
        duration: 1.2,
        ease: [0.83, 0, 0.17, 1]
      }
    }
  };

  const itemVariants: Variants = {
    closed: { y: 50, opacity: 0 },
    open: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: 0.4 + (i * 0.15), // Increased delay for "stagger" effect
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1]
      }
    })
  };

  return (
    <>
      {/* Fixed Header Bar */}
      <nav className="fixed top-0 left-0 w-full z-50 px-8 py-8 flex justify-between items-center pointer-events-none text-white mix-blend-difference">
        {/* Logo */}
        <div className="pointer-events-auto">
          <div
            className="w-16 h-16 relative cursor-pointer overflow-hidden flex items-center justify-center transform -ml-2 md:-ml-0"
            onMouseEnter={(e) => {
              const video = e.currentTarget.querySelector('video') as HTMLVideoElement;
              if (video) {
                video.currentTime = 0;
                video.play();
              }
            }}
          >
            <video
              src="https://res.cloudinary.com/dpcmdnqbb/video/upload/logo_lb7ivc.mp4"
              className="w-full h-full object-contain scale-150"
              muted
              playsInline
            // No loop, so it stops after 1 time
            />
          </div>
        </div>

        {/* Menu Trigger - Toggles between MENU text and Close Icon */}
        <div className="pointer-events-auto cursor-pointer flex items-center justify-end w-32 h-10" onClick={toggleMenu} data-hover="true">
          <AnimatePresence mode="wait">
            {!isOpen ? (
              <motion.div
                key="menu-text"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="group"
              >
                <span className="font-mono text-[20px] group-hover:hidden">[ MENU ]</span>
                <span className="font-mono text-[20px] hidden group-hover:block font-bold">[ OPEN ]</span>
              </motion.div>
            ) : (
              <motion.div
                key="close-icon"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <X size={40} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Full Screen Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            className="fixed inset-0 z-40 bg-black text-white flex flex-col justify-center items-center"
          >
            {/* Note: Internal close button removed to use the fixed nav toggle instead */}

            {/* Menu Links */}
            <div className="flex flex-col items-center justify-center space-y-8">
              {menuItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  custom={i}
                  variants={itemVariants}
                  className="overflow-hidden"
                >
                  <a
                    href={item.href}
                    className="block text-6xl md:text-8xl font-black uppercase tracking-tighter hover:text-gray-400 transition-colors duration-300 relative group"
                    onClick={(e) => handleNavClick(e, item.href)}
                    data-hover="true"
                  >
                    <span className="relative z-10">{item.label}</span>
                    {/* Hover Strikethrough Line */}
                    <span className="absolute left-0 top-1/2 w-full h-2 bg-white -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-in-out z-0 mix-blend-difference" />
                  </a>
                </motion.div>
              ))}
            </div>

            {/* Background Texture/Grid inside Menu */}
            <div className="absolute inset-0 pointer-events-none opacity-10"
              style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;