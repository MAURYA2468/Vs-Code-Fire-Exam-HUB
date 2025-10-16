
"use client"
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { GraduationCap, BookOpen, Users, CheckCircle, ArrowRight, Star } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Footer from '@/components/Footer';

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="flex flex-col items-center p-6 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
      {icon}
    </div>
    <h3 className="mb-2 text-xl font-semibold">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

const TestimonialCard = ({ avatar, name, role, text }: { avatar: string, name: string, role: string, text: string }) => {
    const testimonialAvatar = PlaceHolderImages.find(p => p.id === avatar);
    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-4">
                    {testimonialAvatar && 
                        <Avatar>
                            <AvatarImage src={testimonialAvatar.imageUrl} alt={name} data-ai-hint={testimonialAvatar.imageHint} />
                            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    }
                    <div>
                        <p className="font-semibold">{name}</p>
                        <p className="text-sm text-muted-foreground">{role}</p>
                    </div>
                </div>
                <p className="text-muted-foreground">"{text}"</p>
                <div className="mt-4 flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
                </div>
            </CardContent>
        </Card>
    );
}

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'examhub-hero');

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto grid grid-cols-1 items-center gap-12 px-4 py-16 text-center md:grid-cols-2 md:py-24 md:text-left">
          <div className="space-y-6">
            <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              The Future of Seamless Examination
            </h1>
            <p className="text-lg text-muted-foreground">
              Create, distribute, and grade exams effortlessly with our AI-powered platform. Focus on teaching, not on paperwork.
            </p>
            <div className="flex flex-col justify-center gap-4 md:flex-row md:justify-start">
              <Button size="lg" asChild>
                <Link href="/signup/teacher">Get Started as a Teacher</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login/student">Take a Demo Exam</Link>
              </Button>
            </div>
          </div>
          <div className="relative mx-auto h-80 w-80 md:h-96 md:w-96">
            {heroImage && (
                <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-contain"
                data-ai-hint={heroImage.imageHint}
                />
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-background/50 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <h2 className="font-headline text-3xl font-bold md:text-4xl">Why Choose Exam Hub?</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Everything you need to streamline your assessment process, all in one platform.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              <FeatureCard
                icon={<BookOpen size={28} />}
                title="AI Question Generation"
                description="Generate diverse questions from your content in seconds."
              />
              <FeatureCard
                icon={<CheckCircle size={28} />}
                title="Automated Grading"
                description="Save hours with instant, accurate grading for objective questions."
              />
              <FeatureCard
                icon={<GraduationCap size={28} />}
                title="Flexible Test Creation"
                description="Build custom tests with various question types to fit your curriculum."
              />
              <FeatureCard
                icon={<Users size={28} />}
                title="Secure & Scalable"
                description="A reliable platform for classrooms of all sizes, with proctoring features."
              />
            </div>
          </div>
        </section>
        
        {/* Testimonials */}
        <section className="container mx-auto px-4 py-16 md:py-24">
             <div className="mx-auto mb-12 max-w-3xl text-center">
              <h2 className="font-headline text-3xl font-bold md:text-4xl">Loved by Educators</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                See what teachers and administrators are saying about Exam Hub.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <TestimonialCard 
                    avatar="testimonial-avatar-1"
                    name="Matt Haris"
                    role="Professor, Tech University"
                    text="Exam Hub has revolutionized how I conduct my weekly quizzes. The AI generation is a lifesaver, and the analytics help me pinpoint exactly where my students are struggling."
                />
                 <TestimonialCard 
                    avatar="testimonial-avatar-2"
                    name="Natalia Jones"
                    role="High School Teacher"
                    text="The automated grading feature has given me back my weekends! I can focus more on lesson planning and one-on-one student interaction. Highly recommend it!"
                />
            </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
            <div className="container mx-auto">
                <div className="mx-auto max-w-3xl rounded-2xl bg-primary p-10 text-center text-primary-foreground shadow-xl">
                    <h2 className="font-headline text-3xl font-bold">Ready to Transform Your Exams?</h2>
                    <p className="mt-4 text-lg opacity-90">
                        Join hundreds of educators and start creating smarter assessments today.
                    </p>
                    <Button size="lg" variant="secondary" className="mt-8" asChild>
                       <Link href="/signup/teacher">Sign Up for Free <ArrowRight className="ml-2" /></Link>
                    </Button>
                </div>
            </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
