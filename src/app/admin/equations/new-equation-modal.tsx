"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function NewEquationModal({ onSuccess }: { onSuccess: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        keyName: "",
        formulaString: "",
        constantValue: "",
        description: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...formData,
            constantValue: formData.constantValue ? Number(formData.constantValue) : null
        };

        try {
            const res = await fetch("/api/v1/equations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success("Equation configured successfully and set as active.");
                setOpen(false);
                setFormData({ keyName: "", formulaString: "", constantValue: "", description: "" });
                onSuccess();
            } else {
                toast.error("Failed to create equation configuration.");
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
                <Button className="bg-primary hover:bg-primary/90 text-white shadow-md">Add Formula</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add Equation Config</DialogTitle>
                    <DialogDescription>
                        Define a new dynamic constant or formula. This will become the active equation used for motor searches.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="keyName">Key Name *</Label>
                        <Input id="keyName" required placeholder="e.g. search_score_v2" value={formData.keyName} onChange={e => setFormData({ ...formData, keyName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="formulaString">Formula String *</Label>
                        <Input id="formulaString" required placeholder="e.g. (Voltage * 0.5) + (RPM * 0.1)" value={formData.formulaString} onChange={e => setFormData({ ...formData, formulaString: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="constantValue">Constant Value (Optional)</Label>
                        <Input id="constantValue" type="number" step="0.0001" placeholder="e.g. 1.5" value={formData.constantValue} onChange={e => setFormData({ ...formData, constantValue: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" placeholder="Describe the behavior of this formula..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="resize-none" rows={2} />
                    </div>

                    <Button type="submit" className="w-full mt-4" disabled={loading}>
                        {loading ? "Saving..." : "Save Configuration"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
