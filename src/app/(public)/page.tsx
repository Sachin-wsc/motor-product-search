"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function LandingPage() {
    const router = useRouter();
    const [torque, setTorque] = useState("");
    const [speed, setSpeed] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!torque || !speed) return;

        setIsLoading(true);
        try {
            // Typically we would pass these to /products as query params or locally store it
            // For this demo, we'll route to /products with the query params
            router.push(`/products?torque=${torque}&speed=${speed}`);
        } catch (err) {
            toast.error("Search failed");
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-50/50 via-white to-blue-50/30"></div>
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>

            <div className="container relative z-10 mx-auto px-4 py-16 text-center lg:py-32">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl/tight text-primary">
                    Find the Perfect Motor Driver
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                        For Your Engineering Needs
                    </span>
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground sm:text-xl">
                    Enter your mechanical and electrical constraints into our Smart Search Engine. Our mathematical model algorithm will instantly recommend the exact driver you need.
                </p>

                <div className="mt-10 max-w-xl mx-auto">
                    <Card className="shadow-xl border-0 ring-1 ring-black/5 bg-white/60 backdrop-blur-xl">
                        <CardContent className="p-6">
                            <form onSubmit={handleSearch} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                                    <div className="space-y-2">
                                        <Label htmlFor="torque">Desired Torque (Nm)</Label>
                                        <Input
                                            id="torque"
                                            type="number"
                                            step="0.01"
                                            placeholder="e.g. 5.5"
                                            required
                                            value={torque}
                                            onChange={e => setTorque(e.target.value)}
                                            className="h-12 bg-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="speed">Desired Speed (RPM)</Label>
                                        <Input
                                            id="speed"
                                            type="number"
                                            step="1"
                                            placeholder="e.g. 3000"
                                            required
                                            value={speed}
                                            onChange={e => setSpeed(e.target.value)}
                                            className="h-12 bg-white"
                                        />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full h-12 text-lg shadow-lg hover:shadow-xl transition-all" disabled={isLoading}>
                                    {isLoading ? "Calculating..." : "Run Smart Search"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
