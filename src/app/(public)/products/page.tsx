import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";


export const dynamic = "force-dynamic";

export default async function CatalogPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
    const resolvedParams = await searchParams;
    const torque = resolvedParams?.torque as string;
    const speed = resolvedParams?.speed as string;
    const motorTypeId = resolvedParams?.motorTypeId as string;
    const applicationId = resolvedParams?.applicationId as string;
    const voltageId = resolvedParams?.voltageId as string;
    const frequencyId = resolvedParams?.frequencyId as string;

    let productsList: any[] = [];

    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        if (torque && speed) {
            // Call the Search API
            const queryParams = new URLSearchParams();
            queryParams.append('torque', torque);
            queryParams.append('speed', speed);
            if (motorTypeId) queryParams.append('motorTypeId', motorTypeId);
            if (applicationId) queryParams.append('applicationId', applicationId);
            if (voltageId) queryParams.append('voltageId', voltageId);
            if (frequencyId) queryParams.append('frequencyId', frequencyId);

            const res = await fetch(`${baseUrl}/api/v1/engine/search?${queryParams.toString()}`, {
                cache: 'no-store'
            });

            if (res.ok) {
                const data = await res.json();
                productsList = data.results || [];
            } else {
                console.error("Failed to fetch search results");
            }
        } else {
            // Standard fetch all API
            const res = await fetch(`${baseUrl}/api/v1/products`, {
                cache: 'no-store'
            });
            if (res.ok) {
                const data = await res.json();
                productsList = Array.isArray(data) ? data : (data.products || []);
            } else {
                console.error("Failed to fetch products");
            }
        }
    } catch (err) {
        console.error(err);
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-primary">Driver Catalog</h1>
                {torque && speed ? (
                    <p className="text-muted-foreground mt-2">
                        Showing results for Smart Search (Torque: {torque} Nm, Speed: {speed} RPM).
                    </p>
                ) : (
                    <p className="text-muted-foreground mt-2">Browse the full catalog of motor drivers.</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {productsList.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-secondary/10 rounded-lg">
                        <h3 className="text-lg font-medium text-foreground">No matching drivers found</h3>
                        <p className="text-muted-foreground mt-1">Try changing your search parameters.</p>
                        <Link href="/">
                            <Button variant="outline" className="mt-4 border-primary/20 text-primary">Back to Smart Search</Button>
                        </Link>
                    </div>
                ) : (
                    productsList.map((product: any) => (
                        <Card key={product.id} className="flex flex-col group overflow-hidden border-secondary/20 hover:border-primary/40 transition-all hover:shadow-lg">
                            <div className="aspect-video w-full bg-secondary/20 flex items-center justify-center relative overflow-hidden">
                                {product.images && product.images.length > 0 ? (
                                    <img src={product.images[0]} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                                ) : (
                                    <div className="text-muted-foreground font-medium">No Image</div>
                                )}
                                <Badge className="absolute top-2 right-2 bg-white/90 text-primary shadow-sm hover:bg-white">{product.motorTypeName}</Badge>
                            </div>
                            <CardHeader className="pb-3 flex-1 pt-4">
                                <div className="text-xs text-muted-foreground mb-1 font-mono">{product.sku}</div>
                                <CardTitle className="text-lg text-primary leading-tight line-clamp-2">{product.name}</CardTitle>
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{product.summary}</p>
                            </CardHeader>
                            <CardFooter className="pt-2 border-t border-secondary/10 bg-secondary/5 mt-auto">
                                <Link href={`/product/${product.id}`} className="w-full">
                                    <Button variant="secondary" className="w-full bg-white text-primary border border-secondary shadow-sm hover:bg-primary hover:text-white transition-colors">
                                        View Specifications
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
