import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { CustomCursor } from '@/components/ui/CustomCursor';
import Navigation from '@/components/layout/Navigation';
import Hero from '@/components/sections/Hero';
import Marquee from '@/components/ui/Marquee';
import Gallery from '@/components/sections/Gallery';
import Timeline from '@/components/sections/Timeline';
import Services from '@/components/sections/Services';
import Contact from '@/components/sections/Contact';
import FloatingControls from '@/components/ui/FloatingControls';
import { Preloader } from '@/components/common/Preloader';
import { SmoothScroll } from '@/components/common/SmoothScroll';
import { AdminApp } from '@/features/admin/AdminApp';
import { PublicBlogPage } from '@/pages/PublicBlogPage';
import { PublicBlogPostPage } from '@/pages/PublicBlogPostPage';

import { AnimatedRoutes } from '@/components/common/AnimatedRoutes';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="bg-white min-h-screen text-black cursor-none">
        <CustomCursor />
        <AnimatedRoutes />
      </div>
    </BrowserRouter>
  );
};

export default App;
