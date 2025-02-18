import { Link, useLocation } from "react-router-dom";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { useEffect, useRef, useState } from "react";

const SubNav = () => {
  const { data: config, isLoading, isError } = useSiteConfig();
  const location = useLocation();
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const links = [
    { path: "/", label: "Notícias" },
    { path: "/eventos", label: "Eventos" },
    { path: "/lugares", label: "Lugares" },
    { path: "/products", label: "Marketplace" },
  ];

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (scrollContainerRef.current) {
      if (isLeftSwipe) {
        scrollContainerRef.current.scrollLeft += 100;
      }
      if (isRightSwipe) {
        scrollContainerRef.current.scrollLeft -= 100;
      }
    }
  };

  if (isLoading) {
    return (
      <nav className="w-full border-b mt-16 h-12 animate-pulse bg-gray-200" />
    );
  }

  if (isError || !config) {
    return (
      <nav className="w-full border-b mt-16 bg-gray-800">
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="flex justify-center space-x-8 py-2">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-white hover:opacity-80 transition-opacity"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav 
      className="w-full border-b mt-16 shadow-sm"
      style={{ 
        background: `linear-gradient(to right, ${config.navbar_color}, ${config.primary_color})`,
        borderColor: `${config.primary_color}20`
      }}
    >
      <div className="max-w-screen-2xl mx-auto px-4 overflow-hidden">
        <div 
          ref={scrollContainerRef}
          className="flex space-x-8 py-2 overflow-x-auto scrollbar-hide"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`relative px-3 py-1 rounded-lg transition-all duration-300 hover:scale-105 whitespace-nowrap ${
                location.pathname === link.path 
                  ? "font-medium shadow-sm" 
                  : "hover:opacity-80"
              }`}
              style={{
                color: config.text_color,
                background: location.pathname === link.path 
                  ? `${config.primary_color}15`
                  : 'transparent',
              }}
            >
              {link.label}
              {location.pathname === link.path && (
                <span 
                  className="absolute bottom-0 left-0 w-full h-0.5 rounded-full transition-all duration-300"
                  style={{
                    background: config.text_color
                  }}
                />
              )}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default SubNav;
