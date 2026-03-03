
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InquiryModal from "./inquiry-modal";

export default async function ProductDetails({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/v1/products/${id}`, {
        cache: 'no-store'
    });

    if (!res.ok) {
        notFound();
    }

    const data = await res.json();
    const { specs, ...product } = data;

    if (!product || !product.id) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Gallery Column */}
                <div className="space-y-4">
                    <div className="aspect-square bg-white rounded-xl border border-secondary/20 shadow-sm flex items-center justify-center p-8">
                        {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" />
                        ) : (
                            <div className="text-muted-foreground/50 text-xl font-medium">Image Preview Unavailable</div>
                        )}
                    </div>
                </div>

                {/* Info Column */}
                <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-2(3">
                        <Badge variant="outline" className="border-primary/20 text-primary font-mono text-xs">{product.sku}</Badge>
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20">{product.motorType}</Badge>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mt-2 mb-4">{product.name}</h1>
                    <p className="text-lg text-muted-foreground mb-8 leading-relaxed">{product.summary}</p>

                    <Card className="border-secondary/20 shadow-sm mb-8 bg-white/50 backdrop-blur-sm">
                        <CardHeader className="pb-3 border-b border-secondary/10 bg-secondary/5 rounded-t-lg">
                            <CardTitle className="text-lg text-primary">Technical Specifications</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {specs ? (
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 text-sm">
                                    <div className="border-b border-border/40 pb-2">
                                        <dt className="text-muted-foreground mb-1">Operating Voltage</dt>
                                        <dd className="font-medium">{specs.minVoltage}V - {specs.maxVoltage}V</dd>
                                    </div>
                                    <div className="border-b border-border/40 pb-2">
                                        <dt className="text-muted-foreground mb-1">Peak Current</dt>
                                        <dd className="font-medium">{specs.peakCurrent} A</dd>
                                    </div>
                                    <div className="border-b border-border/40 pb-2">
                                        <dt className="text-muted-foreground mb-1">Continuous Current</dt>
                                        <dd className="font-medium">{specs.maxContinuousCurrent} A</dd>
                                    </div>
                                    <div className="border-b border-border/40 pb-2">
                                        <dt className="text-muted-foreground mb-1">Rated Power</dt>
                                        <dd className="font-medium">{specs.ratedPower} W</dd>
                                    </div>
                                    <div className="border-b border-border/40 pb-2">
                                        <dt className="text-muted-foreground mb-1">Max RPM</dt>
                                        <dd className="font-medium">{specs.maxRpm || 'N/A'}</dd>
                                    </div>
                                    <div className="border-b border-border/40 pb-2">
                                        <dt className="text-muted-foreground mb-1">Weight</dt>
                                        <dd className="font-medium">{specs.weightKg} kg</dd>
                                    </div>
                                </dl>
                            ) : (
                                <p className="text-sm text-muted-foreground">Detailed specifications are pending upload.</p>
                            )}
                        </CardContent>
                    </Card>

                    <div className="mt-auto flex flex-col sm:flex-row gap-4 pt-4">
                        <InquiryModal productId={product.id} productName={product.name} />
                        {product.datasheetUrl && (
                            <Button variant="outline" className="h-12 border-primary/20 text-primary hover:bg-primary/5">
                                Download Datasheet
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
