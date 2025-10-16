
import Image from 'next/image';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function CampaignPage() {
    const campaignHeroImage = PlaceHolderImages.find(p => p.id === 'about-us-hero');

    return (
        <div className="w-full font-sans">
            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <header className="flex h-24 items-center justify-between">
                    <Logo />
                    <nav className="hidden items-center space-x-8 md:flex">
                        <Link href="/" className="text-sm font-medium text-gray-500 hover:text-primary">HOME</Link>
                        <Link href="/about" className="text-sm font-medium text-gray-500 hover:text-primary">ABOUT US</Link>
                        <Link href="/campaign" className="border-b-2 border-primary text-sm font-semibold text-primary">OUR CAMPAIGN</Link>
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
            </div>

            <main className="container mx-auto px-4 py-16">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Our Campaign</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                        Join us in our mission to make education accessible and assessments equitable for everyone.
                    </p>
                </div>

                <div className="mt-20 grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
                    <div className="relative aspect-[3/2] rounded-2xl overflow-hidden shadow-2xl">
                         {campaignHeroImage && (
                            <Image
                                src={campaignHeroImage.imageUrl}
                                alt={campaignHeroImage.description}
                                fill
                                className="object-cover"
                                data-ai-hint={campaignHeroImage.imageHint}
                            />
                        )}
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">The Future of Learning Campaign</h2>
                        <div className="mt-4 h-1 w-20 bg-primary"></div>
                        <p className="mt-6 text-base text-gray-600">
                            We believe that every student deserves the opportunity to succeed. Our campaign focuses on providing robust, free tools for educators and creating a fair, stress-free testing environment for learners. By supporting us, you help bridge the digital divide and empower the next generation of thinkers, creators, and leaders.
                        </p>
                        <p className="mt-6 text-base text-gray-600">
                           Your contribution helps us maintain and improve the platform, develop new features, and expand our reach to underserved communities. Together, we can build a future where technology enhances education for all.
                        </p>
                         <div className="mt-8 flex gap-4">
                            <Button size="lg" className="rounded-full bg-primary px-8 py-3 text-base font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:bg-primary/90">
                                Donate Now
                            </Button>
                             <Button size="lg" variant="outline" className="rounded-full border-primary text-primary px-8 py-3 text-base font-semibold shadow-lg transition-transform hover:scale-105 hover:bg-primary/10">
                                Learn More
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
