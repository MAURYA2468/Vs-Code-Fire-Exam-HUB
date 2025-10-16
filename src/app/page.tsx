
"use client"
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Search } from 'lucide-react';
import Logo from '@/components/Logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'about-us-hero');

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white font-sans">
      <div className="absolute left-0 top-0 h-full w-full">
        <div className="absolute -top-[10%] left-0 h-1/2 w-full -skew-y-6 transform" style={{ background: 'linear-gradient(to right, #e0f2e0, #c8e6c9)' }}></div>
        <div className="absolute bottom-0 left-0 h-1/2 w-full" style={{ background: 'linear-gradient(to right, #f1f8e9, #e8f5e9)' }}></div>
        <div className="absolute right-0 top-0 h-full w-2/5 rounded-bl-full" style={{ background: 'linear-gradient(to bottom, #dcedc8, #c8e6c9)' }}></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="flex h-24 items-center justify-between">
          <Logo />
          <nav className="hidden items-center space-x-8 md:flex">
            <Link href="#" className="border-b-2 border-primary text-sm font-semibold text-primary">HOME</Link>
            <Link href="#" className="text-sm font-medium text-gray-500 hover:text-primary">ABOUT US</Link>
            <Link href="#" className="text-sm font-medium text-gray-500 hover:text-primary">OUR CAMPAIGN</Link>
            <Link href="#" className="text-sm font-medium text-gray-500 hover:text-primary">NEWS</Link>
            <Link href="#" className="text-sm font-medium text-gray-500 hover:text-primary">CONTACT</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Search className="h-6 w-6 text-gray-500" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">Login</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/login/student">Student Login</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/login/teacher">Teacher Login</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default">Sign Up</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                 <DropdownMenuItem asChild>
                  <Link href="/signup/student">Student Sign Up</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/signup/teacher">Teacher Sign Up</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="mt-10 lg:mt-20">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
            <div className="pb-12">
              <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Welcome to Exam Hub The Future of Online Assessment</h1>
              <div className="mt-4 h-1 w-20 bg-primary"></div>
              <p className="mt-6 text-base text-gray-600">
                At Exam Hub, we are dedicated to revolutionizing the way assessments are conducted and taken. Our platform is meticulously designed for educational institutions, corporate bodies, and individual learners who seek a seamless, secure, and efficient online testing experience.
              </p>
              <div className="mt-8 flex gap-4">
                <Button size="lg" variant="outline" className="rounded-full border-primary text-primary px-8 py-3 text-base font-semibold shadow-lg transition-transform hover:scale-105 hover:bg-primary/10">
                  READ MORE
                </Button>
                 <Button size="lg" className="rounded-full bg-primary px-8 py-3 text-base font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:bg-primary/90">
                  GET STARTED
                </Button>
              </div>
            </div>
            <div className="relative">
                {heroImage && (
                    <Image
                        src={heroImage.imageUrl}
                        alt={heroImage.description}
                        width={600}
                        height={400}
                        className="object-contain"
                        data-ai-hint={heroImage.imageHint}
                    />
                )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
