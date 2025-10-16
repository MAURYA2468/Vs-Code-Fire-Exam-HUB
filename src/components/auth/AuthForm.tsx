"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserRole } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

interface AuthFormProps {
  mode: "login" | "signup";
  userRole: UserRole;
}

const baseSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const loginSchema = baseSchema;

const signupSchema = baseSchema.extend({
    name: z.string().min(1, 'Name is required'),
    teacherId: z.string().optional(),
    registerNumber: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.teacherId === undefined && data.registerNumber === undefined) {
        // This case should ideally not happen if userRole is always student or teacher
    } else if (data.teacherId !== undefined && data.registerNumber !== undefined) {
        // This case should also not happen.
    }
});


export function AuthForm({ mode, userRole }: AuthFormProps) {
  const { login, signup } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const title = mode === "login" ? "Log In" : "Sign Up";
  const userType = userRole.charAt(0).toUpperCase() + userRole.slice(1);
  const oppositeMode = mode === "login" ? "signup" : "login";
  const oppositeText = mode === "login" ? "Don't have an account?" : "Already have an account?";

  const formSchema = mode === 'login' ? loginSchema : signupSchema.superRefine((data, ctx) => {
      if (userRole === 'teacher' && !data.teacherId) {
          ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Teacher ID is required.",
              path: ["teacherId"],
          });
      }
      if (userRole === 'student' && !data.registerNumber) {
          ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Register Number is required.",
              path: ["registerNumber"],
          });
      }
  });


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      teacherId: "",
      registerNumber: ""
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    try {
      if (mode === "login") {
        const user = await login(values.email, values.password, userRole);
        if (!user) {
          throw new Error("Invalid email or password. Please try again.");
        }
      } else {
        const { name, email, password, teacherId, registerNumber } = values as z.infer<typeof signupSchema>;
        const details: { teacherId?: string; registerNumber?: string } = {};
        if (userRole === "teacher") {
          details.teacherId = teacherId;
        }
        if (userRole === "student") {
          details.registerNumber = registerNumber;
        }
        await signup(name, email, password, userRole, details);
      }
      router.push(`/${userRole}/dashboard`);
    } catch (err: any) {
        if (err.message !== "Validation failed") {
            setError(err.message);
        }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm border-none bg-transparent shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        <CardDescription>
          to the {userType} Portal
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {mode === "signup" && (
              <>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 {userRole === 'teacher' && (
                  <FormField
                    control={form.control}
                    name="teacherId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teacher ID</FormLabel>
                        <FormControl>
                          <Input placeholder="T-12345" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {userRole === 'student' && (
                  <FormField
                    control={form.control}
                    name="registerNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Register Number</FormLabel>
                        <FormControl>
                          <Input placeholder="R-54321" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="m@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between">
                    <FormLabel>Password</FormLabel>
                    {mode === 'login' && (
                       <Link href="#" className="text-xs text-primary hover:underline">
                        Forgot password?
                      </Link>
                    )}
                  </div>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {title}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          {oppositeText}{" "}
          <Link href={`/${oppositeMode}/${userRole}`} className="underline text-primary">
            {oppositeMode === "login" ? "Log in" : "Sign up"}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
