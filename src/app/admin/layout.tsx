"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/admin/login";

    if (isLoginPage) {
        return (
            <div className="min-h-screen bg-muted/20 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                {children}
                <Toaster />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="bg-primary text-primary-foreground border-b border-primary/20 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <span className="font-bold text-xl tracking-tight">MotorAdmin</span>
                            </div>
                            <div className="ml-10 flex items-baseline space-x-4">
                                <Link href="/admin/dashboard" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === '/admin/dashboard' ? 'bg-primary-foreground/10 text-white' : 'hover:bg-primary-foreground/5 text-primary-foreground/80'}`}>Dashboard</Link>
                                <Link href="/admin/products" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname.startsWith('/admin/products') ? 'bg-primary-foreground/10 text-white' : 'hover:bg-primary-foreground/5 text-primary-foreground/80'}`}>Products</Link>
                                <Link href="/admin/equations" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === '/admin/equations' ? 'bg-primary-foreground/10 text-white' : 'hover:bg-primary-foreground/5 text-primary-foreground/80'}`}>Equations Engine</Link>
                            </div>
                        </div>
                        <div>
                            <button className="text-sm font-medium hover:text-white transition-colors" onClick={() => {
                                sessionStorage.removeItem("token");
                                window.location.href = "/admin/login";
                            }}>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {children}
            </main>
            <Toaster />
        </div>
    );
}
