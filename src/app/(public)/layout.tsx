"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/80 backdrop-blur-md">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        {/* Logo placeholder */}
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <span className="text-white font-bold leading-none">M</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight text-primary">MotorSelect</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-6">
                        <Link
                            href="/"
                            className={`text-sm font-medium transition-colors hover:text-primary ${pathname === '/' ? 'text-primary' : 'text-muted-foreground'}`}
                        >
                            Smart Search
                        </Link>
                        <Link
                            href="/products"
                            className={`text-sm font-medium transition-colors hover:text-primary ${pathname.startsWith('/products') ? 'text-primary' : 'text-muted-foreground'}`}
                        >
                            Catalog
                        </Link>
                        <Link href="/admin/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                            Admin Gateway
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="flex-1">
                {children}
            </main>

            <footer className="border-t py-12 bg-muted/30">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} MotorSelect Engineering Platform. All rights reserved.</p>
                </div>
            </footer>
            <Toaster />
        </div>
    );
}
