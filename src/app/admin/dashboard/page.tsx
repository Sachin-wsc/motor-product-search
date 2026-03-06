"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
    const router = useRouter();
    const [inquiries, setInquiries] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalProducts: "--",
        activeEquations: "--",
        totalInquiries: "--"
    });

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            router.push("/admin/login");
            return;
        }

        const fetchInquiries = () => {
            fetch("/api/v1/inquiries").then(res => res.json()).then(data => {
                if (Array.isArray(data)) {
                    // Sort by newest first
                    const sorted = [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                    setInquiries(sorted);
                }
            }).catch(console.error);
        };

        fetchInquiries();

        // Fetch stats
        fetch("/api/v1/stats").then(res => res.json()).then(data => {
            if (data && !data.error) {
                setStats({
                    totalProducts: data.totalProducts,
                    activeEquations: data.activeEquations,
                    totalInquiries: data.totalInquiries
                });
            }
        }).catch(console.error);

        // Define refetch function on window or pass it if necessary, but we can do it locally
        // Instead of useEffect dependencies, we can just define a scoped function to handle status
    }, [router]);

    const handleGenerateQuote = async (id: string) => {
        try {
            const res = await fetch(`/api/v1/inquiries/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "Quote Sent" })
            });

            if (res.ok) {
                toast.success("Quote generated and sent to customer!");
                setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status: "Quote Sent" } : inq));
            } else {
                const errorData = await res.json().catch(() => ({}));
                toast.error(errorData.error || "Failed to generate quote.");
            }
        } catch (err: any) {
            toast.error(err.message || "An error occurred");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
                <p className="text-muted-foreground">Overview of platform metrics and recent quote requests.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalProducts}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Equations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeEquations}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalInquiries}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Recent Quote Requests</CardTitle>
                </CardHeader>
                <CardContent>
                    {inquiries.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No recent inquiries found.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Company</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {inquiries.slice(0, 10).map((inq) => (
                                    <TableRow key={inq.id}>
                                        <TableCell>{new Date(inq.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">{inq.customerName}</div>
                                            <div className="text-sm text-muted-foreground">{inq.customerEmail}</div>
                                        </TableCell>
                                        <TableCell>{inq.companyName || "-"}</TableCell>
                                        <TableCell>
                                            <Badge variant={inq.status === 'New' ? 'default' : inq.status === 'Quote Sent' ? 'secondary' : 'outline'} className={inq.status === 'Quote Sent' ? "bg-green-100 text-green-800" : ""}>{inq.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {inq.status === 'New' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleGenerateQuote(inq.id)}
                                                    className="border-primary/20 text-primary hover:bg-primary hover:text-white transition-colors"
                                                >
                                                    Generate Quote
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
