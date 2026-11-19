import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  onBookClick: () => void;
}

const NAV_LINKS = [
  { href: '#about', label: 'About' },
  { href: '#rooms', label: 'Rooms' },
  { href: '#facilities', label: 'Facilities' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#contact', label: 'Contact' },
];

export function Header({ onBookClick }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[#0F291E]/10 bg-[#FAF7F0]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-8 px-6 lg:px-10">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#home"
          className="font-serif text-2xl font-semibold tracking-tight text-[#0F291E] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B38A3E]"
        >
          Hotel Uzbegim
        </a>

        {/* Zone 2: Concise single-line navigation links */}
        <nav aria-label="Primary Navigation" className="hidden md:flex items-center gap-7 text-sm font-medium text-[#17221B]/80">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative py-1 whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-[#0F291E] after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-[#B38A3E] after:transition-all after:duration-200 hover:after:w-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B38A3E]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onBookClick}
            className="hidden sm:inline-flex items-center justify-center rounded-sm bg-[#0F291E] px-5 py-2.5 text-xs font-semibold tracking-wider uppercase text-[#FAF7F0] whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-[#193D2D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B38A3E]"
          >
            Book Your Stay
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex h-11 w-11 items-center justify-center rounded-sm border border-[#0F291E]/15 text-[#0F291E] md:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B38A3E]"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-[#0F291E]/10 bg-[#FAF7F0] px-6 py-5 md:hidden">
          <nav aria-label="Mobile Navigation" className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex min-h-[44px] items-center border-b border-[#0F291E]/8 text-base font-medium text-[#17221B] hover:text-[#0F291E]"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#reviews"
              onClick={() => setMobileOpen(false)}
              className="flex min-h-[44px] items-center border-b border-[#0F291E]/8 text-base font-medium text-[#17221B] hover:text-[#0F291E]"
            >
              Guest Reviews
            </a>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onBookClick();
              }}
              className="mt-3 flex min-h-[44px] w-full items-center justify-center rounded-sm bg-[#0F291E] px-5 py-3 text-xs font-semibold tracking-wider uppercase text-[#FAF7F0]"
            >
              Book Your Stay
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
