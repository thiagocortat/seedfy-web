"use client";

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@seedfy/ui';

interface PublicHeaderClientProps {
  webAppUrl: string;
}

export function PublicHeaderClient({ webAppUrl }: PublicHeaderClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="fixed top-0 w-full bg-background/80 backdrop-blur-md z-50 border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-2xl text-primary" onClick={closeMenu}>
          Seedfy
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-muted-foreground hover:text-primary transition-colors font-medium">
            Produto
          </Link>
          <Link href={webAppUrl} className="text-muted-foreground hover:text-primary transition-colors font-medium">
            Web App
          </Link>
          <Link href="/features" className="text-muted-foreground hover:text-primary transition-colors font-medium">
            Mobile App
          </Link>
          <Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors font-medium">
            FAQ
          </Link>
          <Link href="/support" className="text-muted-foreground hover:text-primary transition-colors font-medium">
            Suporte
          </Link>
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Entrar</Button>
          </Link>
          <Link href="/signup">
            <Button>Criar conta</Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-foreground"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 w-full bg-background border-b border-border p-4 md:hidden flex flex-col gap-4 shadow-lg animate-in slide-in-from-top-5">
            <Link 
              href="/" 
              className="text-muted-foreground hover:text-primary py-2 font-medium"
              onClick={closeMenu}
            >
              Produto
            </Link>
            <Link 
              href={webAppUrl} 
              className="text-muted-foreground hover:text-primary py-2 font-medium"
              onClick={closeMenu}
            >
              Web App
            </Link>
            <Link 
              href="/features" 
              className="text-muted-foreground hover:text-primary py-2 font-medium"
              onClick={closeMenu}
            >
              Mobile App
            </Link>
            <Link 
              href="/faq" 
              className="text-muted-foreground hover:text-primary py-2 font-medium"
              onClick={closeMenu}
            >
              FAQ
            </Link>
            <Link 
              href="/support" 
              className="text-muted-foreground hover:text-primary py-2 font-medium"
              onClick={closeMenu}
            >
              Suporte
            </Link>
            <hr className="border-border" />
            <Link href="/login" onClick={closeMenu} className="w-full">
              <Button variant="outline" className="w-full">Entrar</Button>
            </Link>
            <Link href="/signup" onClick={closeMenu} className="w-full">
              <Button className="w-full">Criar conta</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
