import { Header } from '@/components/layout/header';
import { VisionWeaverClient } from '@/components/vision-weaver/vision-weaver-client';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <VisionWeaverClient />
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground border-t">
        <p>&copy; {new Date().getFullYear()} Vision Weaver. Powered by AI.</p>
      </footer>
    </div>
  );
}
