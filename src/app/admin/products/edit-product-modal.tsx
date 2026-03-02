"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function EditProductModal({
    product,
    open,
    onOpenChange,
    onSuccess
}: {
    product: any,
    open: boolean,
    onOpenChange: (open: boolean) => void,
    onSuccess: () => void
}) {
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

    useEffect(() => {
        if (product && open) {
            setFormData({
                name: product.name || "",
                sku: product.sku || "",
                summary: product.summary || "",
                motorType: product.motorType || "BLDC",
            });
            if (product.specs) {
                setSpecs({
                    minVoltage: product.specs.minVoltage || "",
                    maxVoltage: product.specs.maxVoltage || "",
                    maxContinuousCurrent: product.specs.maxContinuousCurrent || "",
                    peakCurrent: product.specs.peakCurrent || "",
                    ratedPower: product.specs.ratedPower || "",
                    maxRpm: product.specs.maxRpm || "",
                    weightKg: product.specs.weightKg || ""
                });
            } else {
                setSpecs({ minVoltage: "", maxVoltage: "", maxContinuousCurrent: "", peakCurrent: "", ratedPower: "", maxRpm: "", weightKg: "" });
            }
            setImage(null);
        }
    }, [product, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!product) return;
        setLoading(true);

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

            const res = await fetch(`/api/v1/products/${product.id}`, {
                method: "PUT",
                body: formDataObj
            });

            if (res.ok) {
                toast.success("Product updated successfully.");
                onOpenChange(false);
                onSuccess();
            } else {
                toast.error("Failed to update product.");
            }
        } catch (err) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-primary text-xl">Edit Product</DialogTitle>
                    <DialogDescription>
                        Update the motor driver product and its specifications.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Product Name *</Label>
                            <Input id="edit-name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-sku">SKU / Part No *</Label>
                            <Input id="edit-sku" required value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-motorType">Motor Type *</Label>
                        <select
                            id="edit-motorType"
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
                        <Label htmlFor="edit-summary">Summary</Label>
                        <Textarea id="edit-summary" value={formData.summary} onChange={e => setFormData({ ...formData, summary: e.target.value })} className="resize-none" rows={2} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-image">Product Image (Leave blank to keep current)</Label>
                        <Input id="edit-image" type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)} />
                    </div>

                    <div className="pt-4 border-t">
                        <h3 className="text-sm font-medium mb-3">Technical Specifications</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-minVoltage">Min Voltage (V)</Label>
                                <Input id="edit-minVoltage" type="number" step="0.1" value={specs.minVoltage} onChange={e => setSpecs({ ...specs, minVoltage: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-maxVoltage">Max Voltage (V)</Label>
                                <Input id="edit-maxVoltage" type="number" step="0.1" value={specs.maxVoltage} onChange={e => setSpecs({ ...specs, maxVoltage: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-peakCurrent">Peak Current (A)</Label>
                                <Input id="edit-peakCurrent" type="number" step="0.1" value={specs.peakCurrent} onChange={e => setSpecs({ ...specs, peakCurrent: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-maxContinuousCurrent">Continuous Current (A)</Label>
                                <Input id="edit-maxContinuousCurrent" type="number" step="0.1" value={specs.maxContinuousCurrent} onChange={e => setSpecs({ ...specs, maxContinuousCurrent: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-ratedPower">Rated Power (W)</Label>
                                <Input id="edit-ratedPower" type="number" step="0.1" value={specs.ratedPower} onChange={e => setSpecs({ ...specs, ratedPower: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-maxRpm">Max RPM</Label>
                                <Input id="edit-maxRpm" type="number" value={specs.maxRpm} onChange={e => setSpecs({ ...specs, maxRpm: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    <Button type="submit" className="w-full mt-4" disabled={loading}>
                        {loading ? "Saving..." : "Update Product"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
