"use client";
import { useState } from "react";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function InquiryModal({ productId, productName }: { productId: string, productName: string }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        customerName: "",
        customerEmail: "",
        companyName: "",
        message: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/v1/inquiries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, productId })
            });

            if (res.ok) {
                toast.success("Inquiry sent successfully. Our team will contact you soon.");
                setOpen(false);
                setFormData({ customerName: "", customerEmail: "", companyName: "", message: "" });
            } else {
                toast.error("Failed to submit inquiry.");
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
                <Button className="h-12 flex-1 bg-primary hover:bg-primary/90 text-white shadow-md text-base">Request Quote</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-primary text-xl">Contact Sales</DialogTitle>
                    <DialogDescription>
                        Inquire about pricing and availability for {productName}.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                            id="name"
                            required
                            value={formData.customerName}
                            onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            value={formData.customerEmail}
                            onChange={e => setFormData({ ...formData, customerEmail: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="company">Company (Optional)</Label>
                        <Input
                            id="company"
                            value={formData.companyName}
                            onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                            id="message"
                            placeholder="Tell us about your project requirements..."
                            value={formData.message}
                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                            className="resize-none"
                            rows={3}
                        />
                    </div>
                    <Button type="submit" className="w-full mt-2" disabled={loading}>
                        {loading ? "Sending..." : "Submit Inquiry"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
