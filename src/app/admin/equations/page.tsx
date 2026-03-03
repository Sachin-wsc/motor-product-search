"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import NewEquationModal from "./new-equation-modal";
import EditEquationModal from "./edit-equation-modal";

export default function AdminEquations() {
    const [equations, setEquations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingEquation, setEditingEquation] = useState<any | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const fetchEquations = () => {
        fetch("/api/v1/equations")
            .then(res => res.json())
            .then(data => {
                setEquations(data || []);
                // if (Array.isArray(data)) {
                //     // Sort so active is on top
                //     const sorted = [...data].sort((a, b) => {
                //         if (a.isActive && !b.isActive) return -1;
                //         if (!a.isActive && b.isActive) return 1;
                //         return 0;
                //     });
                //     setEquations(sorted);
                // }
            })
            .finally(() => setLoading(false));
    };

    const toggleEquation = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/v1/equations/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !currentStatus })
            });

            if (res.ok) {
                toast.success(`Equation ${!currentStatus ? 'activated' : 'deactivated'} successfully.`);
                fetchEquations();
            } else {
                toast.error("Failed to toggle equation status.");
            }
        } catch (err) {
            toast.error("An error occurred");
        }
    };

    useEffect(() => {
        fetchEquations();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white rounded-lg shadow-sm border border-secondary/20">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Smart Search Engine</h1>
                    <p className="text-muted-foreground mt-1">Configure logic, formulas, and safety multipliers determining catalog matches.</p>
                </div>
                <NewEquationModal onSuccess={fetchEquations} />
            </div>

            <Card className="shadow-sm border-secondary/20">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-secondary/30">
                            <TableRow>
                                <TableHead className="font-semibold px-6">Config Key</TableHead>
                                <TableHead className="font-semibold">Formula / Value</TableHead>
                                <TableHead className="font-semibold">Status</TableHead>
                                <TableHead className="font-semibold max-w-md hidden md:table-cell">Description</TableHead>
                                <TableHead className="text-right font-semibold px-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24">Loading configuration...</TableCell>
                                </TableRow>
                            ) : equations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No formulas constructed. Platform is using defaults.</TableCell>
                                </TableRow>
                            ) : (
                                equations.map((eq) => (
                                    <TableRow key={eq.id} className="hover:bg-secondary/10 transition-colors">
                                        <TableCell className="font-mono text-sm font-semibold text-primary px-6">{eq.keyName}</TableCell>
                                        <TableCell className="font-mono text-xs bg-muted/50 p-2 rounded">{eq.formulaString || eq.constantValue}</TableCell>
                                        <TableCell>
                                            <Badge variant={eq.isActive ? "default" : "secondary"} className={eq.isActive ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}>
                                                {eq.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground max-w-md hidden md:table-cell truncate">{eq.description}</TableCell>
                                        <TableCell className="text-right px-6 flex justify-end items-center gap-2">
                                            {!eq.isActive ? <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => toggleEquation(eq.id, eq.isActive)}
                                                className={`transition-colors ${eq.isActive ? "border-red-200 text-red-600 hover:bg-red-50" : "border-green-200 text-green-600 hover:bg-green-50"}`}
                                            >
                                                {eq.isActive ? "Deactivate" : "Activate"}
                                            </Button> : ""}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setEditingEquation(eq);
                                                    setIsEditModalOpen(true);
                                                }}
                                                className="text-primary border-primary/20 hover:bg-primary hover:text-white transition-colors"
                                            >
                                                Configure
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <EditEquationModal
                equation={editingEquation}
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                onSuccess={fetchEquations}
            />
        </div>
    );
}
