import { Palette } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="bg-card border-b">
      <div className="container mx-auto px-4 py-4 flex items-center">
        <Link href="/" className="flex items-center gap-2 text-2xl font-headline text-primary-foreground hover:text-accent-foreground transition-colors">
          <Palette className="h-8 w-8 text-primary" />
          Vision Weaver
        </Link>
      </div>
    </header>
  );
}
