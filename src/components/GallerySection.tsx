import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { GalleryItem } from '../types/hotel';
import { ResilientImage } from './ResilientImage';

interface GallerySectionProps {
  items: GalleryItem[];
}

const CATEGORIES: Array<'All' | GalleryItem['category']> = [
  'All',
  'Exterior & Courtyard',
  'Rooms & Suites',
  'Reception',
  'Dining',
];

export function GallerySection({ items }: GallerySectionProps) {
  const [filter, setFilter] = useState<'All' | GalleryItem['category']>('All');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const visibleItems = filter === 'All' ? items : items.filter((item) => item.category === filter);

  useEffect(() => {
    if (activeIndex === null) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setActiveIndex(null);
      if (e.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev === null ? null : (prev + 1) % visibleItems.length));
      }
      if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) =>
          prev === null ? null : (prev - 1 + visibleItems.length) % visibleItems.length
        );
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeIndex, visibleItems.length]);

  const activeItem = activeIndex !== null ? visibleItems[activeIndex] : null;

  return (
    <section id="gallery" className="border-t border-[#0F291E]/10 bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9A7432]">
              Visual Archive
            </p>
            <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-[#0F291E] sm:text-4xl lg:text-5xl">
              Property Gallery
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-[#FAF7F0] p-1 border border-[#0F291E]/10">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => {
                  setFilter(category);
                  setActiveIndex(null);
                }}
                className={`min-h-[40px] px-3.5 py-2 text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                  filter === category
                    ? 'bg-[#0F291E] text-[#FAF7F0]'
                    : 'text-[#526058] hover:text-[#0F291E]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleItems.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className="group flex flex-col text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B38A3E]"
            >
              <div className="aspect-[4/3] w-full overflow-hidden border border-[#0F291E]/10 bg-[#F1EBE0]">
                <ResilientImage
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  aspectClassName="h-full w-full"
                />
              </div>
              <div className="mt-3 flex items-baseline justify-between gap-4">
                <h3 className="font-serif text-xl font-medium text-[#0F291E] group-hover:text-[#9A7432] transition-colors">
                  {item.title}
                </h3>
                <span className="text-xs text-[#526058] whitespace-nowrap">{item.category}</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-[#526058]">{item.caption}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {activeItem && activeIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeItem.title}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F291E]/95 p-4 sm:p-8"
        >
          <button
            type="button"
            onClick={() => setActiveIndex(null)}
            aria-label="Close gallery preview"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-sm border border-white/20 text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveIndex((activeIndex - 1 + visibleItems.length) % visibleItems.length)
            }
            aria-label="Previous photograph"
            className="mr-2 hidden h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-white/20 text-white hover:bg-white/10 sm:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="max-w-4xl w-full">
            <div className="aspect-[4/3] w-full overflow-hidden bg-black/30">
              <ResilientImage
                src={activeItem.imageUrl}
                alt={activeItem.title}
                className="h-full w-full object-contain"
                aspectClassName="h-full w-full"
              />
            </div>
            <div className="mt-4 flex flex-col gap-1 text-[#FAF7F0] sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-serif text-2xl font-medium">{activeItem.title}</h3>
                <p className="text-sm text-[#FAF7F0]/75">{activeItem.caption}</p>
              </div>
              <span className="text-xs tabular-nums text-[#D4B26A]">
                {activeIndex + 1} / {visibleItems.length}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveIndex((activeIndex + 1) % visibleItems.length)}
            aria-label="Next photograph"
            className="ml-2 hidden h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-white/20 text-white hover:bg-white/10 sm:flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </section>
  );
}
