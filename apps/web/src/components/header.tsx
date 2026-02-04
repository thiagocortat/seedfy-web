"use client";

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full bg-card/80 backdrop-blur-md z-50 border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-2xl text-primary">
          Seedfy
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/#features" className="text-muted-foreground hover:text-primary transition-colors">
            Funcionalidades
          </Link>
          <Link href="/#faq" className="text-muted-foreground hover:text-primary transition-colors">
            FAQ
          </Link>
          <Link 
            href="https://apps.apple.com" 
            className="bg-primary text-primary-foreground px-4 py-2 rounded-full hover:bg-primary/90 transition-colors font-medium"
          >
            Baixar App
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-foreground"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 w-full bg-card border-b border-border p-4 md:hidden flex flex-col gap-4 shadow-lg">
            <Link 
              href="/#features" 
              className="text-muted-foreground hover:text-primary py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Funcionalidades
            </Link>
            <Link 
              href="/#faq" 
              className="text-muted-foreground hover:text-primary py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </Link>
            <Link 
              href="https://apps.apple.com" 
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Baixar App
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
