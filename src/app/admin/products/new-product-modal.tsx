"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function NewProductModal({ onSuccess }: { onSuccess: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        sku: "",
        summary: "",
        motorType: "BLDC",
    });
    const [image, setImage] = useState<File | null>(null);

    const [specs, setSpecs] = useState({
        minVoltage: "",
        maxVoltage: "",
        maxContinuousCurrent: "",
        peakCurrent: "",
        ratedPower: "",
        maxRpm: "",
        weightKg: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Convert spec strings to numbers where necessary
        const processedSpecs = Object.fromEntries(
            Object.entries(specs).map(([k, v]) => [k, v === "" ? null : Number(v)])
        );

        try {
            const formDataObj = new FormData();
            formDataObj.append("name", formData.name);
            formDataObj.append("sku", formData.sku);
            formDataObj.append("summary", formData.summary);
            formDataObj.append("motorType", formData.motorType);
            formDataObj.append("specs", JSON.stringify(processedSpecs));
            if (image) {
                formDataObj.append("image", image);
            }

            const res = await fetch("/api/v1/products", {
                method: "POST",
                body: formDataObj
            });

            if (res.ok) {
                toast.success("Product created successfully.");
                setOpen(false);
                setFormData({ name: "", sku: "", summary: "", motorType: "BLDC" });
                setSpecs({ minVoltage: "", maxVoltage: "", maxContinuousCurrent: "", peakCurrent: "", ratedPower: "", maxRpm: "", weightKg: "" });
                setImage(null);
                onSuccess();
            } else {
                toast.error("Failed to create product.");
            }
        } catch (err) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-white shadow-md transition-all">Add New Product</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[100vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-primary text-xl">Add New Product</DialogTitle>
                    <DialogDescription>
                        Create a new motor driver product.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Product Name *</Label>
                            <Input id="name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sku">SKU / Part No *</Label>
                            <Input id="sku" required value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="motorType">Motor Type *</Label>
                        <select
                            id="motorType"
                            required
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.motorType}
                            onChange={e => setFormData({ ...formData, motorType: e.target.value })}
                        >
                            <option value="BLDC">BLDC</option>
                            <option value="Stepper">Stepper</option>
                            <option value="Servo">Servo</option>
                            <option value="Brushed DC">Brushed DC</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="summary">Summary</Label>
                        <Textarea id="summary" value={formData.summary} onChange={e => setFormData({ ...formData, summary: e.target.value })} className="resize-none" rows={2} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="image">Product Image</Label>
                        <Input id="image" type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)} />
                    </div>

                    <div className="pt-4 border-t">
                        <h3 className="text-sm font-medium mb-3">Technical Specifications</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="minVoltage">Min Voltage (V)</Label>
                                <Input id="minVoltage" type="number" step="0.1" value={specs.minVoltage} onChange={e => setSpecs({ ...specs, minVoltage: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="maxVoltage">Max Voltage (V)</Label>
                                <Input id="maxVoltage" type="number" step="0.1" value={specs.maxVoltage} onChange={e => setSpecs({ ...specs, maxVoltage: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="peakCurrent">Peak Current (A)</Label>
                                <Input id="peakCurrent" type="number" step="0.1" value={specs.peakCurrent} onChange={e => setSpecs({ ...specs, peakCurrent: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="maxContinuousCurrent">Continuous Current (A)</Label>
                                <Input id="maxContinuousCurrent" type="number" step="0.1" value={specs.maxContinuousCurrent} onChange={e => setSpecs({ ...specs, maxContinuousCurrent: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ratedPower">Rated Power (W)</Label>
                                <Input id="ratedPower" type="number" step="0.1" value={specs.ratedPower} onChange={e => setSpecs({ ...specs, ratedPower: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="maxRpm">Max RPM</Label>
                                <Input id="maxRpm" type="number" value={specs.maxRpm} onChange={e => setSpecs({ ...specs, maxRpm: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    <Button type="submit" className="w-full mt-4" disabled={loading}>
                        {loading ? "Saving..." : "Create Product"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
