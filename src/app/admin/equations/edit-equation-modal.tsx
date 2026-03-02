"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function EditEquationModal({
    equation,
    open,
    onOpenChange,
    onSuccess
}: {
    equation: any,
    open: boolean,
    onOpenChange: (open: boolean) => void,
    onSuccess: () => void
}) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        keyName: "",
        formulaString: "",
        constantValue: "",
        description: "",
    });

    useEffect(() => {
        if (equation && open) {
            setFormData({
                keyName: equation.keyName || "",
                formulaString: equation.formulaString || "",
                constantValue: equation.constantValue || "",
                description: equation.description || "",
            });
        }
    }, [equation, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!equation) return;

        setLoading(true);

        const payload = {
            ...formData,
            constantValue: formData.constantValue ? Number(formData.constantValue) : null
        };

        try {
            const res = await fetch(`/api/v1/equations/${equation.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success("Equation updated successfully.");
                onOpenChange(false);
                onSuccess();
            } else {
                toast.error("Failed to update equation.");
            }
        } catch (err) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Equation Config</DialogTitle>
                    <DialogDescription>
                        Modify the formula or constant for this equation.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-keyName">Key Name *</Label>
                        <Input id="edit-keyName" required value={formData.keyName} onChange={e => setFormData({ ...formData, keyName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-formulaString">Formula String *</Label>
                        <Input id="edit-formulaString" required value={formData.formulaString} onChange={e => setFormData({ ...formData, formulaString: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-constantValue">Constant Value (Optional)</Label>
                        <Input id="edit-constantValue" type="number" step="0.0001" value={formData.constantValue} onChange={e => setFormData({ ...formData, constantValue: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-description">Description</Label>
                        <Textarea id="edit-description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="resize-none" rows={2} />
                    </div>

                    <Button type="submit" className="w-full mt-4" disabled={loading}>
                        {loading ? "Saving..." : "Update Configuration"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
