"use client"
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Logo from '@/components/Logo';

const FeatureTag = ({ text }: { text: string }) => (
  <div className="rounded-full bg-black/30 px-4 py-2 text-sm text-white backdrop-blur-sm">
    {text}
  </div>
);

const TestCategory = ({ text, active = false }: { text: string, active?: boolean }) => (
  <Button variant={active ? 'default' : 'ghost'} className={`rounded-full px-6 py-2 text-base font-medium ${active ? '' : 'text-muted-foreground'}`}>
    {text}
  </Button>
);

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'notesight-hero');

  return (
    <div className="flex min-h-screen flex-col bg-background p-4 sm:p-6 md:p-8">
      <header className="container mx-auto flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Pricing</Link>
          <Link href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">FAQ</Link>
          <Link href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Contact us</Link>
        </nav>
        <div className="flex items-center gap-2">
            <Button variant="default" className="rounded-full" asChild>
                <Link href="/login/student">Sign in</Link>
            </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto flex flex-col items-center justify-center">
        <div className="w-full max-w-7xl rounded-3xl bg-card p-6 sm:p-10 lg:p-12 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left Column */}
                <div className="flex flex-col items-start text-left">
                    <div className="mb-4 rounded-xl bg-primary/10 p-3">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
                        Boost your Test <br />
                        <span className="relative inline-block">
                            <span className="absolute inset-x-0 bottom-1.5 h-3 bg-yellow-300"></span>
                            <span className="relative z-10">Scores</span>
                        </span> with <br /> NoteSightAI
                    </h1>
                    <p className="mt-6 text-base text-muted-foreground max-w-md">
                        Standardized Tests, AP Tests and Courses. High School and University Courses.
                    </p>
                    <div className="mt-8 flex items-center gap-4">
                        <Button size="lg" className="rounded-full px-8 py-6 text-base">Get started</Button>
                        <Button size="lg" variant="secondary" className="rounded-full bg-foreground text-background hover:bg-foreground/80 px-8 py-6 text-base">Free Assessment</Button>
                    </div>
                </div>

                {/* Right Column */}
                <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] rounded-2xl overflow-hidden">
                    {heroImage && (
                        <Image 
                            src={heroImage.imageUrl}
                            alt={heroImage.description}
                            fill
                            className="object-cover"
                            data-ai-hint={heroImage.imageHint}
                        />
                    )}
                    <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-2">
                        <FeatureTag text="AI Tutor" />
                        <FeatureTag text="Note Taking" />
                        <FeatureTag text="Flash Cards" />
                        <FeatureTag text="Practice Tests" />
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <TestCategory text="SAT" />
            <TestCategory text="PSAT" />
            <TestCategory text="SSAT" />
            <TestCategory text="Standardized Tests" active />
            <TestCategory text="ACT" />
            <TestCategory text="GMAT" />
            <TestCategory text="MCAT" />
            <TestCategory text="LSAT" />
        </div>
      </main>
    </div>
  );
}
