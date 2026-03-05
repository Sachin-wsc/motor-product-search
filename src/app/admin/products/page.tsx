"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import NewProductModal from "./new-product-modal";
import EditProductModal from "./edit-product-modal";

export default function AdminProducts() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Delete Confirmation State
    const [deletingProduct, setDeletingProduct] = useState<any | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const fetchProducts = () => {
        setLoading(true);
        fetch("/api/v1/products")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setProducts(data);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleConfirmDelete = async () => {
        if (!deletingProduct) return;
        try {
            const res = await fetch(`/api/v1/products/${deletingProduct.id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Product deleted successfully");
                setIsDeleteDialogOpen(false);
                setDeletingProduct(null);
                fetchProducts();
            } else {
                toast.error("Failed to delete product");
            }
        } catch (err) {
            toast.error("An error occurred while deleting");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-secondary/20">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Products Inventory</h1>
                    <p className="text-muted-foreground mt-1">Manage physical drivers and specifications in the catalog.</p>
                </div>
                <NewProductModal onSuccess={fetchProducts} />
            </div>

            <Card className="shadow-sm border-secondary/20 border">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-secondary/30">
                            <TableRow>
                                <TableHead className="font-semibold px-6">SKU / Part No</TableHead>
                                <TableHead className="font-semibold">Name</TableHead>
                                <TableHead className="font-semibold">Company</TableHead>
                                <TableHead className="font-semibold">Motor Type</TableHead>
                                <TableHead className="font-semibold">Status</TableHead>
                                <TableHead className="text-right font-semibold px-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">Loading inventory...</TableCell>
                                </TableRow>
                            ) : products.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">No products found. Add your first driver.</TableCell>
                                </TableRow>
                            ) : (
                                products.map((p) => (
                                    <TableRow key={p.id} className="hover:bg-secondary/10 transition-colors">
                                        <TableCell className="font-mono text-sm px-6">{p.sku}</TableCell>
                                        <TableCell className="font-medium text-primary">{p.name}</TableCell>
                                        <TableCell>{p.companyName}</TableCell>
                                        <TableCell>{p.motorTypeName}</TableCell>
                                        <TableCell>
                                            <Badge variant={p.isActive ? "default" : "secondary"} className={p.isActive ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}>
                                                {p.isActive ? "Active" : "Archived"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right px-6">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-primary hover:bg-primary/10 mr-2"
                                                onClick={() => {
                                                    setEditingProduct(p);
                                                    setIsEditModalOpen(true);
                                                }}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:bg-destructive/10"
                                                onClick={() => {
                                                    setDeletingProduct(p);
                                                    setIsDeleteDialogOpen(true);
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <EditProductModal
                product={editingProduct}
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                onSuccess={fetchProducts}
            />

            {/* Custom Delete Confirmation Modal */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Product</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{deletingProduct?.name}</strong>? This action cannot be undone and will remove all associated technical specifications.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleConfirmDelete}>
                            Yes, Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
