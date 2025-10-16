
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Github, Linkedin, Twitter } from 'lucide-react';
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

const teamMembers = [
    {
        name: 'Ankit Raj',
        role: '',
        avatarId: 'ankit-raj',
    },
    {
        name: 'Atish Ranjan',
        role: '',
        avatarId: 'atish-ranjan',
    },
    {
        name: 'Arem Yeswanth',
        role: '',
        avatarId: 'arem-yeswanth',
    },
];

export default function AboutUsPage() {
    const aboutHeroImage = PlaceHolderImages.find(p => p.id === 'about-us-hero');
    const teamAvatars = teamMembers.map(member => ({
        ...member,
        ...PlaceHolderImages.find(p => p.id === member.avatarId)
    }));

    return (
        <div className="w-full font-sans">
             <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <header className="flex h-24 items-center justify-between">
                    <Logo />
                    <nav className="hidden items-center space-x-8 md:flex">
                        <Link href="/" className="text-sm font-medium text-gray-500 hover:text-primary">HOME</Link>
                        <Link href="/about" className="border-b-2 border-primary text-sm font-semibold text-primary">ABOUT US</Link>
                        <Link href="/campaign" className="text-sm font-medium text-gray-500 hover:text-primary">OUR CAMPAIGN</Link>
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
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">About Exam Hub</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                        Pioneering the future of digital assessments to empower educators and inspire learners worldwide.
                    </p>
                </div>

                <div className="mt-20 grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Our Mission</h2>
                        <div className="mt-4 h-1 w-20 bg-primary"></div>
                        <p className="mt-6 text-base text-gray-600">
                            Our mission is to provide a seamless, secure, and intuitive platform that transforms the assessment experience. We are committed to equipping educators with powerful tools to create, manage, and grade exams, while offering students a fair and stress-free environment to showcase their knowledge.
                        </p>
                        <h2 className="mt-12 text-3xl font-bold tracking-tight text-gray-900">Our Vision</h2>
                        <div className="mt-4 h-1 w-20 bg-primary"></div>
                        <p className="mt-6 text-base text-gray-600">
                            We envision a world where education is accessible and assessments are a true measure of learning, not just memory. Exam Hub aims to be the leading global platform for online examinations, fostering a culture of continuous improvement and academic integrity.
                        </p>
                    </div>
                    <div className="relative aspect-[3/2] rounded-2xl overflow-hidden shadow-2xl">
                         {aboutHeroImage && (
                            <Image
                                src={aboutHeroImage.imageUrl}
                                alt={aboutHeroImage.description}
                                fill
                                className="object-cover"
                                data-ai-hint={aboutHeroImage.imageHint}
                            />
                        )}
                    </div>
                </div>

                <div className="mt-24">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Meet the Team</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                            The passionate minds dedicated to revolutionizing education.
                        </p>
                    </div>
                    <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {teamAvatars.map((member) => (
                            <Card key={member.name} className="text-center transition-transform hover:scale-105 hover:shadow-xl">
                                <CardContent className="p-6">
                                    <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary/20">
                                        {member.imageUrl && <AvatarImage src={member.imageUrl} alt={member.name} />}
                                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                                    {member.role && <p className="text-sm text-primary">{member.role}</p>}
                                    <div className="mt-4 flex justify-center space-x-3">
                                        <Link href="#" className="text-gray-400 hover:text-gray-500"><Twitter className="h-5 w-5" /></Link>
                                        <Link href="#" className="text-gray-400 hover:text-gray-500"><Linkedin className="h-5 w-5" /></Link>
                                        <Link href="#" className="text-gray-400 hover:text-gray-500"><Github className="h-5 w-5" /></Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
