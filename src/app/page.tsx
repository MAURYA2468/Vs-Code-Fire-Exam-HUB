import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FlaskConical, HelpCircle, BarChart, GraduationCap } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from "@/lib/utils";

const Header = () => (
  <header className="container mx-auto flex items-center justify-between py-4">
    <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-foreground">
      <div className="rounded-lg bg-primary p-2">
        <GraduationCap className="h-6 w-6 text-primary-foreground" />
      </div>
      <span className="font-headline">Exam Hub</span>
    </Link>
    <nav className="hidden items-center gap-6 md:flex">
      <Link href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Home</Link>
      <Link href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Test</Link>
      <Link href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Courses</Link>
      <Link href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">About Us</Link>
      <Link href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Contact Us</Link>
    </nav>
    <div className="flex items-center gap-2">
      <Button variant="ghost" asChild><Link href="/login/student">Sign In</Link></Button>
      <Button asChild><Link href="/signup/student">Sign Up</Link></Button>
    </div>
  </header>
);

const Stat = ({ value, label, className }: { value: string, label: string, className?: string }) => (
  <div className={cn("absolute rounded-lg border bg-card/80 p-3 text-center shadow-lg backdrop-blur-sm", className)}>
    <p className="text-lg font-bold text-primary">{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </div>
);

const TestimonialCard = ({ quote, name, avatarId }: { quote: string, name: string, avatarId: string }) => {
  const avatar = PlaceHolderImages.find(p => p.id === avatarId);
  return (
    <Card className="border-none bg-transparent shadow-none">
      <CardContent className="p-0">
        <blockquote className="space-y-4">
          <p className="text-3xl font-extrabold text-foreground">“</p>
          <p className="text-muted-foreground">{quote}</p>
          <footer className="flex items-center gap-3 pt-2">
            {avatar && (
              <Avatar>
                <AvatarImage src={avatar.imageUrl} alt={name} data-ai-hint={avatar.imageHint} />
                <AvatarFallback>{name.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
            <div>
              <p className="font-semibold">{name}</p>
              <p className="text-sm text-muted-foreground">Student</p>
            </div>
          </footer>
        </blockquote>
      </CardContent>
    </Card>
  );
};


const Footer = () => (
  <footer className="bg-card/50 py-12">
    <div className="container mx-auto grid grid-cols-1 gap-8 text-center md:grid-cols-4 md:text-left">
      <div>
        <h3 className="font-semibold text-foreground">Exam Hub</h3>
        <p className="mt-2 text-sm text-muted-foreground">© 2024 Exam Hub. All rights reserved.</p>
      </div>
      <div>
        <h3 className="font-semibold text-foreground">Navigation</h3>
        <ul className="mt-4 space-y-2">
          <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Test</Link></li>
          <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Courses</Link></li>
          <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">About Us</Link></li>
          <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Contact Us</Link></li>
        </ul>
      </div>
      <div>
        <h3 className="font-semibold text-foreground">Resources</h3>
        <ul className="mt-4 space-y-2">
          <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Blogs</Link></li>
          <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">News and Updates</Link></li>
          <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Career</Link></li>
        </ul>
      </div>
      <div>
        <h3 className="font-semibold text-foreground">Stay up to date</h3>
        <form className="mt-4 flex gap-2">
          <Input type="email" placeholder="Your email address" className="flex-1" />
          <Button>Submit</Button>
        </form>
        <div className="mt-4 flex justify-center gap-4 md:justify-start">
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Term & Condition</Link>
        </div>
      </div>
    </div>
  </footer>
);


export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'prep-hero');
  const teamAvatars = PlaceHolderImages.filter(p => p.id.startsWith('team-avatar-'));

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto py-12 md:py-24">
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
            <div className="max-w-lg">
              <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-6xl">
                Welcome to <span className="text-primary">Exam Hub</span>. Prepare with confidence.
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Excel every exam with our high yield MCQ's.
              </p>
              <div className="mt-8 flex w-full max-w-md items-center space-x-2">
                <Input type="text" placeholder="Find course" className="flex-1" />
                <Button type="submit">Search</Button>
              </div>
              <div className="mt-6 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {teamAvatars.map(avatar => (
                     <Avatar key={avatar.id} className="border-2 border-background">
                       <AvatarImage src={avatar.imageUrl} alt={avatar.description} data-ai-hint={avatar.imageHint} />
                       <AvatarFallback>{avatar.description.charAt(0)}</AvatarFallback>
                     </Avatar>
                  ))}
                </div>
                <div className="text-sm">
                  <span className="font-semibold">50+</span> Creative Team. <Link href="#" className="font-semibold text-primary underline">View Price</Link>
                </div>
              </div>
            </div>
            <div className="relative flex items-center justify-center">
              {heroImage && (
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  width={450}
                  height={550}
                  className="rounded-full object-cover shadow-2xl"
                  data-ai-hint={heroImage.imageHint}
                />
              )}
               <Stat value="500+" label="Free Course" className="left-0 top-1/4 -translate-x-1/2" />
               <Stat value="100K+" label="Online Students" className="right-0 top-1/3 translate-x-1/2" />
               <Stat value="100+" label="Satisfied Students" className="bottom-8 left-1/2" />
            </div>
          </div>
        </section>

        {/* What We Offer Section */}
        <section className="bg-card/50 py-20">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold">What We Offer</h2>
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
              <Card className="bg-background/50">
                <CardHeader className="items-center">
                  <div className="rounded-lg bg-primary/10 p-4 text-primary"><FlaskConical size={32} /></div>
                  <CardTitle>Live Tests</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Register for the Exam you want to appear. You can register in single click for the exam of your choice from dashboard.</p>
                </CardContent>
              </Card>
              <Card className="bg-background/50">
                <CardHeader className="items-center">
                   <div className="rounded-lg bg-primary/10 p-4 text-primary"><HelpCircle size={32} /></div>
                  <CardTitle>High Yield Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Take live test on time, you can take the missed test from dashboard. Live exams link appears only when the exam is live.</p>
                </CardContent>
              </Card>
              <Card className="bg-background/50">
                <CardHeader className="items-center">
                   <div className="rounded-lg bg-primary/10 p-4 text-primary"><BarChart size={32} /></div>
                  <CardTitle>Insightful Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Dashboard is true sense that help you analyze you performance. Everything you do at one place, your real preparations pal.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="container mx-auto py-20 text-center">
            <h2 className="text-3xl font-bold">Our Students are our biggest fans.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                We don't like to brag, but we don't mind letting our students do it for us. Here are a few things folks have said about our services over the years.
            </p>
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
                <TestimonialCard 
                    quote="This was an amazing course! I can't say enough good things about this course. Angela is an amazing instructor, and did an extremly great job teaching all that was promised in the course description."
                    name="Matt Haris"
                    avatarId="testimonial-avatar-1"
                />
                <TestimonialCard 
                    quote="This was an amazing course! I can't say enough good things about this course. Angela is an amazing instructor, and did an extremly great job teaching all that was promised in the course description."
                    name="Natalia Jones"
                    avatarId="testimonial-avatar-2"
                />
            </div>
        </section>
        
      </main>
      <Footer />
    </div>
  );
}
