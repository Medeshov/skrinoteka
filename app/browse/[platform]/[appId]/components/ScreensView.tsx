'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ScreenModal } from './ScreenModal';
import { LazyImage } from './LazyImage';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'next/navigation';

interface Screen {
  id: string;
  name: string;
  image: {
    url: string;
  };
  platform: { name: string }[];
}

interface ScreensViewProps {
  screens: Screen[];
  appName: string;
}

const ScreensView = ({ screens, appName }: ScreensViewProps) => {
  const [selectedScreenIndex, setSelectedScreenIndex] = useState<number | null>(null);
  const [loadingStates, setLoadingStates] = useState<boolean[]>(new Array(screens.length).fill(true));
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const platform = params.platform as string;
  const isDesktop = platform === 'desktop';

  // Handle URL parameters
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const screenParam = params.get('screen');
    
    if (screenParam) {
      try {
        const index = parseInt(screenParam) - 1;
        if (index >= 0 && index < screens.length) {
          setSelectedScreenIndex(index);
        } else {
          // Invalid index, remove screen parameter
          params.delete('screen');
          router.replace(`${pathname}?${params.toString()}`);
        }
      } catch (error) {
        // Invalid number format, remove screen parameter
        params.delete('screen');
        router.replace(`${pathname}?${params.toString()}`);
      }
    } else {
      setSelectedScreenIndex(null);
    }
  }, [searchParams, screens.length, pathname, router]);

  const updateURL = (index: number | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (index !== null && index >= 0 && index < screens.length) {
      params.set('tab', 'screens');
      params.set('screen', (index + 1).toString());
    } else {
      params.delete('screen');
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleNext = () => {
    if (selectedScreenIndex !== null && selectedScreenIndex < screens.length - 1) {
      const newIndex = selectedScreenIndex + 1;
      setSelectedScreenIndex(newIndex);
      updateURL(newIndex);
    }
  };

  const handlePrev = () => {
    if (selectedScreenIndex !== null && selectedScreenIndex > 0) {
      const newIndex = selectedScreenIndex - 1;
      setSelectedScreenIndex(newIndex);
      updateURL(newIndex);
    }
  };

  const handleScreenClick = (index: number) => {
    if (index >= 0 && index < screens.length) {
      setSelectedScreenIndex(index);
      updateURL(index);
    }
  };

  const handleClose = () => {
    setSelectedScreenIndex(null);
    updateURL(null);
  };

  const handleImageLoad = (index: number) => {
    setLoadingStates(prev => {
      const newStates = [...prev];
      newStates[index] = false;
      return newStates;
    });
  };

  return (
    <div className="grid gap-4">
      <h2 className="text-4xl font-semibold text-zinc-900">Экраны</h2>
      <div className={`grid ${isDesktop ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-4`}>
        {screens.map((screen, index) => {
          if (!screen.image?.url) return null;
          
          return (
            <div
              key={`screen-${screen.id}-${index}`}
              className={`relative ${isDesktop ? 'aspect-[16/9]' : 'aspect-[390/844]'} cursor-pointer group`}
              onClick={() => handleScreenClick(index)}
              role="listitem"
              aria-label={`${appName} screen ${index + 1}`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleScreenClick(index)
                }
              }}
            >
              <div className="relative w-full h-full overflow-hidden rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 transition-colors shadow-sm">
                {loadingStates[index] && (
                  <Skeleton className="absolute inset-0 z-10" />
                )}
                <LazyImage
                  src={screen.image.url}
                  alt={`${appName} screen ${index + 1}`}
                  className="w-full h-full object-cover object-top"
                  priority={index === 0}
                  onLoad={() => handleImageLoad(index)}
                />
              </div>
            </div>
          );
        })}
      </div>

      {selectedScreenIndex !== null && (
        <ScreenModal
          isOpen={true}
          onClose={handleClose}
          screens={screens.map(s => ({ url: s.image.url, id: s.id }))}
          currentIndex={selectedScreenIndex}
          onNext={handleNext}
          onPrev={handlePrev}
          appName={appName}
          platform={isDesktop ? 'desktop' : 'mobile'}
        />
      )}
    </div>
  );
};

ScreensView.displayName = 'ScreensView';
export default ScreensView;
