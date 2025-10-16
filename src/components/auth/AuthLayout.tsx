import Logo from "@/components/Logo";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from 'next/image';
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authImage = PlaceHolderImages.find(p => p.id === 'auth-hero');

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-2xl border bg-card/60 shadow-2xl backdrop-blur-lg md:grid-cols-2">
        <div className="relative hidden min-h-[500px] items-center justify-center bg-primary/10 md:flex">
          {authImage && (
            <Image 
              src={authImage.imageUrl}
              alt={authImage.description}
              fill
              className="object-cover"
              data-ai-hint={authImage.imageHint}
            />
          )}
        </div>
        <div className="flex flex-col items-center justify-center p-8">
            <div className="mb-8">
              <Link href="/">
                <Logo />
              </Link>
            </div>
            <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
