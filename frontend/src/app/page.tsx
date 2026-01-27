"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, Shield, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/30">

      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-primary rounded-md" />
            <span className="font-semibold text-lg tracking-tight">SmartTrack</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-muted">
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="shadow-lg shadow-primary/20">
                Get Started
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 pt-32 pb-12 md:pb-24">
        <section className="container mx-auto max-w-7xl px-6 flex flex-col items-center text-center space-y-8">
          <div className="inline-flex items-center rounded-full border border-border bg-secondary/50 px-3 py-1 text-sm text-muted-foreground backdrop-blur-xl">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            v2.0 is now live
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground max-w-4xl leading-[1.1]">
            Intelligent Curriculum & <br className="hidden sm:inline" />
            <span className="text-primary">
              Automated Attendance
            </span>
          </h1>

          <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
            The modern operating system for academic institutions. Eliminate manual tracking,
            optimize learning paths, and get real-time insights with a single platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-4">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base font-semibold">
                Start Free Trial
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-base bg-background text-muted-foreground hover:text-foreground">
                View Demo
              </Button>
            </Link>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="container mx-auto max-w-7xl px-6 py-24">
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Zap className="h-6 w-6 text-yellow-500" />}
              title="Lightning Fast"
              description="QR scanning takes milliseconds. No more waiting in lines or passing sheets."
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6 text-primary" />}
              title="Secure & Reliable"
              description="Enterprise-grade security for student data. Role-based access built-in."
            />
            <FeatureCard
              icon={<CheckCircle2 className="h-6 w-6 text-emerald-500" />}
              title="AI Recommendations"
              description="Smart suggestions for curriculum improvements based on real performance data."
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-12">
        <div className="container mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-muted-foreground">
            © 2026 SmartTrack Inc. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Twitter</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="bg-card border-border hover:bg-secondary/50 transition-colors">
      <CardHeader>
        <div className="h-12 w-12 rounded-lg bg-secondary/80 flex items-center justify-center mb-4 border border-border">
          {icon}
        </div>
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-muted-foreground text-base leading-relaxed">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
