"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import Image from "next/image";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col selection:bg-primary/20">
            <header className="sticky top-0 z-50 w-full pt-4 px-4 sm:px-6 lg:px-8 pb-2">
                <div className="container max-w-[1600px] mx-auto flex items-center justify-between gap-4">
                    {/* Logo Pill */}
                    <Link href="/" className="bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 rounded-full pl-2 pr-6 py-1.5 flex items-center gap-3 shrink-0 group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">

                        <Image src="/Logo-sqare.png" alt="Logo" width={150} height={120} />
                    </Link>

                    {/* Navigation Pill */}

                    {/* Actions Area */}
                    <div className="flex items-center space-x-4 shrink-0">

                        {/* Admin Gateway Pill */}
                        <div className="bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 rounded-full px-2 py-1.5 hidden md:flex items-center space-x-1 shrink-0">
                            <Link
                                href="/"
                                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${pathname === '/' ? 'bg-primary text-primary-foreground' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                            >
                                Smart Search
                            </Link>
                            <Link
                                href="/products"
                                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${pathname.startsWith('/products') ? 'bg-primary text-primary-foreground' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                            >
                                Catalog
                            </Link>
                            <Link
                                href="/admin/login"
                                // className="bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 rounded-full pl-4 pr-1.5 py-1.5 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                                className="px-5 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-none">Login</span>
                                <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 overflow-hidden shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" x2="3" y1="12" y2="12" /></svg>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                {children}
            </main>

            <footer className="border-t py-4 bg-muted/30">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} MotorSelect Engineering Platform. All rights reserved.</p>
                </div>
            </footer>
            <Toaster />
        </div>
    );
}
