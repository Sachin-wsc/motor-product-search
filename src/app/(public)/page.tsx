"use client";
import { useState, useEffect } from "react";
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

    // Advanced search states
    const [motorTypes, setMotorTypes] = useState<any[]>([]);
    const [applications, setApplications] = useState<any[]>([]);
    const [voltages, setVoltages] = useState<any[]>([]);
    const [frequencies, setFrequencies] = useState<any[]>([]);

    const [motorTypeId, setMotorTypeId] = useState("");
    const [applicationId, setApplicationId] = useState("");
    const [voltageId, setVoltageId] = useState("");
    const [frequencyId, setFrequencyId] = useState("");

    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                const [mtRes, appRes, voltRes, freqRes] = await Promise.all([
                    fetch("/api/v1/master/motor-types").then(res => res.json()),
                    fetch("/api/v1/master/applications").then(res => res.json()),
                    fetch("/api/v1/master/voltages").then(res => res.json()),
                    fetch("/api/v1/master/frequencies").then(res => res.json()),
                ]);

                if (Array.isArray(mtRes)) setMotorTypes(mtRes);
                if (Array.isArray(appRes)) setApplications(appRes);
                if (Array.isArray(voltRes)) setVoltages(voltRes);
                if (Array.isArray(freqRes)) setFrequencies(freqRes);
            } catch (err) {
                console.error("Failed to load generic master data", err);
            }
        };
        fetchMasterData();
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!torque || !speed) return;

        setIsLoading(true);
        try {
            const queryParams = new URLSearchParams();
            queryParams.append('torque', torque);
            queryParams.append('speed', speed);
            if (motorTypeId) queryParams.append('motorTypeId', motorTypeId);
            if (applicationId) queryParams.append('applicationId', applicationId);
            if (voltageId) queryParams.append('voltageId', voltageId);
            if (frequencyId) queryParams.append('frequencyId', frequencyId);

            router.push(`/products?${queryParams.toString()}`);
        } catch (err) {
            toast.error("Search failed");
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-[calc(100vh-10rem)] flex flex-col justify-center items-center overflow-hidden">
            <div className="container relative z-10 mx-auto px-4 py-3 text-center lg:py-16">
                <h1 className="font-extrabold tracking-tight sm:text-2xl md:text-4xl/tight text-primary">
                    Find the Perfect Motor Driver
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                        For Your Engineering Needs
                    </span>
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-[10px] text-muted-foreground sm:text-[16px]">
                    Enter your mechanical and electrical constraints into our Smart Search Engine. Our mathematical model algorithm will instantly recommend the exact driver you need.
                </p>

                <div className="mt-10 max-w-2xl mx-auto">
                    <Card className="shadow-xl border-0 ring-1 ring-black/5 bg-white/60 backdrop-blur-xl">
                        <CardContent className="p-6">
                            <form onSubmit={handleSearch} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                                    <div className="space-y-2">
                                        <Label htmlFor="torque">Desired Torque (Nm) *</Label>
                                        <Input
                                            id="torque"
                                            type="number"
                                            step="0.01"
                                            placeholder="e.g. 5.5"
                                            required
                                            value={torque}
                                            onChange={e => setTorque(e.target.value)}
                                            className="h-10 bg-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="speed">Desired Speed (RPM) *</Label>
                                        <Input
                                            id="speed"
                                            type="number"
                                            step="1"
                                            placeholder="e.g. 3000"
                                            required
                                            value={speed}
                                            onChange={e => setSpeed(e.target.value)}
                                            className="h-10 bg-white"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-200">
                                    <h3 className="text-sm font-semibold text-primary mb-4 text-left">Advanced Filters (Optional)</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                                        <div className="space-y-2">
                                            <Label htmlFor="motorType">Motor Type</Label>
                                            <select
                                                id="motorType"
                                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={motorTypeId}
                                                onChange={e => setMotorTypeId(e.target.value)}
                                            >
                                                <option value="">Any</option>
                                                {motorTypes.map(mt => (
                                                    <option key={mt.id} value={mt.id}>{mt.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="application">Application</Label>
                                            <select
                                                id="application"
                                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={applicationId}
                                                onChange={e => setApplicationId(e.target.value)}
                                            >
                                                <option value="">Any</option>
                                                {applications.map(app => (
                                                    <option key={app.id} value={app.id}>{app.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="voltage">Voltage (AC)</Label>
                                            <select
                                                id="voltage"
                                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={voltageId}
                                                onChange={e => setVoltageId(e.target.value)}
                                            >
                                                <option value="">Any</option>
                                                {voltages.map(v => (
                                                    <option key={v.id} value={v.id}>{`${v.voltageValue} ${v.unit}`}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="frequency">Frequency (AC)</Label>
                                            <select
                                                id="frequency"
                                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={frequencyId}
                                                onChange={e => setFrequencyId(e.target.value)}
                                            >
                                                <option value="">Any</option>
                                                {frequencies.map(f => (
                                                    <option key={f.id} value={f.id}>{`${f.frequencyValue} ${f.unit}`}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <Button type="submit" className="w-full h-12 text-lg shadow-lg hover:shadow-xl transition-all" disabled={isLoading}>
                                    {isLoading ? "Searching..." : "Run Smart Search"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
