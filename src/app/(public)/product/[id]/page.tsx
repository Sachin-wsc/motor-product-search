
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
                    <div className="aspect-square bg-white rounded-xl border border-secondary/20 shadow-sm flex items-center justify-center p-8 overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain" />
                        ) : (
                            <div className="text-muted-foreground/50 text-xl font-medium">Image Preview Unavailable</div>
                        )}
                    </div>
                    {product.images && product.images.length > 1 && (
                        <div className="grid grid-cols-4 gap-4">
                            {product.images.slice(1).map((imgUrl: string, idx: number) => (
                                <div key={idx} className="aspect-square bg-white rounded border border-secondary/20 p-2 flex items-center justify-center">
                                    <img src={imgUrl} alt={`${product.name} ${idx + 1}`} className="max-w-full max-h-full object-contain" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info Column */}
                <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-2(3">
                        <Badge variant="outline" className="border-primary/20 text-primary font-mono text-xs">{product.sku}</Badge>
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20">{product.motorTypeName}</Badge>
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
                                    {(specs.acKw !== null && specs.acKw !== undefined) ? (
                                        <>
                                            <div className="border-b border-border/40 pb-2">
                                                <dt className="text-muted-foreground mb-1">AC Power (kW)</dt>
                                                <dd className="font-medium">{specs.acKw} kW</dd>
                                            </div>
                                            {specs.poleNumber && (
                                                <div className="border-b border-border/40 pb-2">
                                                    <dt className="text-muted-foreground mb-1">Poles</dt>
                                                    <dd className="font-medium">{specs.poleNumber}</dd>
                                                </div>
                                            )}
                                            {specs.voltageValue && (
                                                <div className="border-b border-border/40 pb-2">
                                                    <dt className="text-muted-foreground mb-1">Voltage</dt>
                                                    <dd className="font-medium">{specs.voltageValue} {specs.voltageUnit}</dd>
                                                </div>
                                            )}
                                            {specs.frequencyValue && (
                                                <div className="border-b border-border/40 pb-2">
                                                    <dt className="text-muted-foreground mb-1">Frequency</dt>
                                                    <dd className="font-medium">{specs.frequencyValue} {specs.frequencyUnit}</dd>
                                                </div>
                                            )}
                                            {specs.acApplicationName && (
                                                <div className="border-b border-border/40 pb-2">
                                                    <dt className="text-muted-foreground mb-1">Application</dt>
                                                    <dd className="font-medium">{specs.acApplicationName}</dd>
                                                </div>
                                            )}
                                            {specs.totalMotors !== null && (
                                                <div className="border-b border-border/40 pb-2">
                                                    <dt className="text-muted-foreground mb-1">Total Motors</dt>
                                                    <dd className="font-medium">{specs.totalMotors}</dd>
                                                </div>
                                            )}
                                            {specs.motorsPerGroup !== null && (
                                                <div className="border-b border-border/40 pb-2">
                                                    <dt className="text-muted-foreground mb-1">Motors Per Group</dt>
                                                    <dd className="font-medium">{specs.motorsPerGroup}</dd>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <div className="border-b border-border/40 pb-2">
                                                <dt className="text-muted-foreground mb-1">DC Power (kW)</dt>
                                                <dd className="font-medium">{specs.dcKw} kW</dd>
                                            </div>
                                            {specs.dcArmatureVoltage !== null && (
                                                <div className="border-b border-border/40 pb-2">
                                                    <dt className="text-muted-foreground mb-1">Armature Voltage</dt>
                                                    <dd className="font-medium">{specs.dcArmatureVoltage} V</dd>
                                                </div>
                                            )}
                                            {specs.dcFieldVoltage !== null && (
                                                <div className="border-b border-border/40 pb-2">
                                                    <dt className="text-muted-foreground mb-1">Field Voltage</dt>
                                                    <dd className="font-medium">{specs.dcFieldVoltage} V</dd>
                                                </div>
                                            )}
                                            {specs.dcFieldCurrent !== null && (
                                                <div className="border-b border-border/40 pb-2">
                                                    <dt className="text-muted-foreground mb-1">Field Current</dt>
                                                    <dd className="font-medium">{specs.dcFieldCurrent} A</dd>
                                                </div>
                                            )}
                                            {specs.dcApplicationName && (
                                                <div className="border-b border-border/40 pb-2">
                                                    <dt className="text-muted-foreground mb-1">Application</dt>
                                                    <dd className="font-medium">{specs.dcApplicationName}</dd>
                                                </div>
                                            )}
                                        </>
                                    )}
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
