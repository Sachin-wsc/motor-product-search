"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import CreatableSelect from 'react-select/creatable';
import { useDropzone } from 'react-dropzone';
import { X } from "lucide-react";

type OptionType = { value: string; label: string };

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

    // Master Data States
    const [companies, setCompanies] = useState<OptionType[]>([]);
    const [motorTypes, setMotorTypes] = useState<OptionType[]>([]);
    const [poles, setPoles] = useState<OptionType[]>([]);
    const [voltages, setVoltages] = useState<OptionType[]>([]);
    const [frequencies, setFrequencies] = useState<OptionType[]>([]);
    const [applications, setApplications] = useState<OptionType[]>([]);

    // Form Data States
    const [formData, setFormData] = useState({
        name: "",
        sku: "",
        summary: "",
    });

    const [selectedCompany, setSelectedCompany] = useState<OptionType | null>(null);
    const [selectedMotorType, setSelectedMotorType] = useState<OptionType | null>(null);
    const [images, setImages] = useState<(File & { preview: string })[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);

    // Dynamic Specs
    const [isAC, setIsAC] = useState(true);

    // AC Specs
    const [acKw, setAcKw] = useState("");
    const [totalMotors, setTotalMotors] = useState("");
    const [motorsPerGroup, setMotorsPerGroup] = useState("");
    const [selectedPole, setSelectedPole] = useState<OptionType | null>(null);
    const [selectedVoltage, setSelectedVoltage] = useState<OptionType | null>(null);
    const [selectedFrequency, setSelectedFrequency] = useState<OptionType | null>(null);
    const [selectedAcApp, setSelectedAcApp] = useState<OptionType | null>(null);

    // DC Specs
    const [dcArmatureVoltage, setDcArmatureVoltage] = useState("");
    const [dcKw, setDcKw] = useState("");
    const [dcFieldVoltage, setDcFieldVoltage] = useState("");
    const [dcFieldCurrent, setDcFieldCurrent] = useState("");
    const [selectedDcApp, setSelectedDcApp] = useState<OptionType | null>(null);

    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                const [compRes, mtRes, poleRes, voltRes, freqRes, appRes] = await Promise.all([
                    fetch("/api/v1/master/companies").then(res => res.json()),
                    fetch("/api/v1/master/motor-types").then(res => res.json()),
                    fetch("/api/v1/master/poles").then(res => res.json()),
                    fetch("/api/v1/master/voltages").then(res => res.json()),
                    fetch("/api/v1/master/frequencies").then(res => res.json()),
                    fetch("/api/v1/master/applications").then(res => res.json()),
                ]);

                const comps = compRes.map((c: any) => ({ value: c.id, label: c.name }));
                const mTypes = mtRes.map((m: any) => ({ value: m.id, label: m.name }));
                const pols = poleRes.map((p: any) => ({ value: p.id, label: p.poleNumber }));
                const volts = voltRes.map((v: any) => ({ value: v.id, label: `${v.voltageValue} ${v.unit}` }));
                const freqs = freqRes.map((f: any) => ({ value: f.id, label: `${f.frequencyValue} ${f.unit}` }));
                const apps = appRes.map((a: any) => ({ value: a.id, label: a.name }));

                setCompanies(comps);
                setMotorTypes(mTypes);
                setPoles(pols);
                setVoltages(volts);
                setFrequencies(freqs);
                setApplications(apps);

                // Initialize form values from product
                if (product) {
                    setFormData({
                        name: product.name || "",
                        sku: product.sku || "",
                        summary: product.summary || "",
                    });

                    setSelectedCompany(comps.find((c: any) => c.value === product.companyId) || null);
                    const initMotorType = mTypes.find((m: any) => m.value === product.motorTypeId) || null;
                    setSelectedMotorType(initMotorType);

                    if (initMotorType) {
                        const isDcType = initMotorType.label.toUpperCase().includes("DC");
                        setIsAC(!isDcType);
                    }

                    if (product.specs) {
                        const specs = product.specs;
                        setAcKw(specs.acKw?.toString() || "");
                        setTotalMotors(specs.totalMotors?.toString() || "");
                        setMotorsPerGroup(specs.motorsPerGroup?.toString() || "");

                        setSelectedPole(pols.find((p: any) => p.value === specs.poleId) || null);
                        setSelectedVoltage(volts.find((v: any) => v.value === specs.voltageId) || null);
                        setSelectedFrequency(freqs.find((f: any) => f.value === specs.frequencyId) || null);
                        setSelectedAcApp(apps.find((a: any) => a.value === specs.acApplicationId) || null);

                        setDcArmatureVoltage(specs.dcArmatureVoltage?.toString() || "");
                        setDcKw(specs.dcKw?.toString() || "");
                        setDcFieldVoltage(specs.dcFieldVoltage?.toString() || "");
                        setDcFieldCurrent(specs.dcFieldCurrent?.toString() || "");
                        setSelectedDcApp(apps.find((a: any) => a.value === specs.dcApplicationId) || null);
                    }
                    setImages([]); // Clear images on modal open for new uploads
                    setExistingImages(product.images || []);
                }
            } catch (err) {
                console.error("Failed to load master data", err);
                toast.error("Failed to load select options");
            }
        };

        if (open) fetchMasterData();
    }, [open, product]);

    useEffect(() => {
        if (selectedMotorType) {
            const isDcType = selectedMotorType.label.toUpperCase().includes("DC");
            setIsAC(!isDcType);
        }
    }, [selectedMotorType]);

    const handleCreateOption = async (
        inputValue: string,
        endpoint: string,
        payloadKey: string,
        setStateAction: React.Dispatch<React.SetStateAction<OptionType[]>>,
        setSelectionAction: React.Dispatch<React.SetStateAction<OptionType | null>>
    ) => {
        setLoading(true);
        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [payloadKey]: inputValue })
            });
            const data = await res.json();

            let label = inputValue;
            if (endpoint.includes('voltages')) label = `${data.voltageValue} ${data.unit}`;
            if (endpoint.includes('frequencies')) label = `${data.frequencyValue} ${data.unit}`;

            const newOption: OptionType = { value: data.id, label };
            setStateAction((prev) => [...prev, newOption]);
            setSelectionAction(newOption);
            toast.success("Created new entry successfully");
        } catch (err) {
            toast.error("Failed to create new entry");
        } finally {
            setLoading(false);
        }
    };

    const removeImage = (index: number) => {
        setImages((prev) => {
            const newImages = [...prev];
            URL.revokeObjectURL(newImages[index].preview);
            newImages.splice(index, 1);
            return newImages;
        });
    };

    const removeExistingImage = (index: number) => {
        setExistingImages((prev) => {
            const newImages = [...prev];
            newImages.splice(index, 1);
            return newImages;
        });
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'image/*': []
        },
        onDrop: (acceptedFiles: File[]) => {
            setImages(prev => [
                ...prev,
                ...acceptedFiles.map((file: File) => Object.assign(file, {
                    preview: URL.createObjectURL(file)
                }))
            ]);
        }
    });

    // Cleanup previews on unmount
    useEffect(() => {
        return () => {
            images.forEach(file => URL.revokeObjectURL(file.preview));
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!product) return;
        if (!selectedCompany || !selectedMotorType) {
            toast.error("Please select a Company and Motor Type");
            return;
        }

        setLoading(true);

        const specs = {
            isAC,
            acKw: acKw ? Number(acKw) : null,
            poleId: selectedPole?.value || null,
            voltageId: selectedVoltage?.value || null,
            frequencyId: selectedFrequency?.value || null,
            acApplicationId: selectedAcApp?.value || null,
            totalMotors: totalMotors ? Number(totalMotors) : null,
            motorsPerGroup: motorsPerGroup ? Number(motorsPerGroup) : null,
            dcArmatureVoltage: dcArmatureVoltage ? Number(dcArmatureVoltage) : null,
            dcKw: dcKw ? Number(dcKw) : null,
            dcFieldVoltage: dcFieldVoltage ? Number(dcFieldVoltage) : null,
            dcFieldCurrent: dcFieldCurrent ? Number(dcFieldCurrent) : null,
            dcApplicationId: selectedDcApp?.value || null,
        };

        try {
            const formDataObj = new FormData();
            formDataObj.append("name", formData.name);
            formDataObj.append("sku", formData.sku);
            formDataObj.append("summary", formData.summary);
            formDataObj.append("companyId", selectedCompany.value);
            formDataObj.append("motorTypeId", selectedMotorType.value);
            formDataObj.append("specs", JSON.stringify(specs));
            formDataObj.append("existingImages", JSON.stringify(existingImages));

            images.forEach((file) => {
                formDataObj.append("image", file);
            });

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
            <DialogContent className="sm:max-w-[700px] max-h-[100vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-primary text-xl">Edit Product</DialogTitle>
                    <DialogDescription>
                        Update the motor driver product and its specifications.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-company">Company *</Label>
                            <CreatableSelect
                                id="edit-company"
                                isClearable
                                options={companies}
                                value={selectedCompany}
                                onChange={(val) => setSelectedCompany(val)}
                                onCreateOption={(val) => handleCreateOption(val, "/api/v1/master/companies", "name", setCompanies, setSelectedCompany)}
                                isDisabled={loading}
                                placeholder="Select or type..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-motorType">Motor Type *</Label>
                            <CreatableSelect
                                id="edit-motorType"
                                isClearable
                                options={motorTypes}
                                value={selectedMotorType}
                                onChange={(val) => setSelectedMotorType(val)}
                                onCreateOption={(val) => handleCreateOption(val, "/api/v1/master/motor-types", "name", setMotorTypes, setSelectedMotorType)}
                                isDisabled={loading}
                                placeholder="Select or type..."
                            />
                        </div>
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
                        <Label htmlFor="edit-summary">Summary</Label>
                        <Textarea id="edit-summary" value={formData.summary} onChange={e => setFormData({ ...formData, summary: e.target.value })} className="resize-none" rows={2} />
                    </div>

                    <div className="space-y-2">
                        <Label>Product Images (Upload to append/replace existing images)</Label>
                        <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50 bg-gray-50'}`}>
                            <input {...getInputProps()} />
                            <div className="flex flex-col items-center justify-center space-y-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                                {isDragActive ? (
                                    <p className="text-sm text-primary font-medium">Drop the images here...</p>
                                ) : (
                                    <p className="text-sm text-gray-600">Drag & drop some images here, or click to select files</p>
                                )}
                            </div>
                        </div>

                        {/* Image Previews */}
                        {images.length > 0 && (
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-4 mt-4">
                                {images.map((file, index) => (
                                    <div key={file.name} className="relative group aspect-square rounded-md overflow-hidden border border-gray-200">
                                        <img
                                            src={file.preview}
                                            className="w-full h-full object-cover"
                                            alt={`Preview ${index}`}
                                            onLoad={() => { URL.revokeObjectURL(file.preview) }}
                                        />
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                                            className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {/* Existing Image Previews */}
                        {existingImages.length > 0 && (
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-4 mt-4">
                                {existingImages.map((imageUrl, index) => (
                                    <div key={imageUrl} className="relative group aspect-square rounded-md overflow-hidden border border-gray-200">
                                        <img
                                            src={imageUrl}
                                            className="w-full h-full object-cover"
                                            alt={`Existing Preview ${index}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); removeExistingImage(index); }}
                                            className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Dynamic Specs Section based on AC/DC */}
                    {selectedMotorType && (
                        <div className="pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-primary">
                                    Technical Specifications ({isAC ? "AC Motor" : "DC Motor"})
                                </h3>
                            </div>

                            {isAC ? (
                                // AC MOTOR SPECS
                                <div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                    <div className="space-y-2">
                                        <Label>AC kW</Label>
                                        <Input type="number" step="0.01" value={acKw} onChange={e => setAcKw(e.target.value)} placeholder="e.g. 5.5" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Poles</Label>
                                        <CreatableSelect
                                            isClearable
                                            options={poles}
                                            value={selectedPole}
                                            onChange={(val) => setSelectedPole(val)}
                                            onCreateOption={(val) => handleCreateOption(val, "/api/v1/master/poles", "poleNumber", setPoles, setSelectedPole)}
                                            isDisabled={loading}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Voltage</Label>
                                        <CreatableSelect
                                            isClearable
                                            options={voltages}
                                            value={selectedVoltage}
                                            onChange={(val) => setSelectedVoltage(val)}
                                            onCreateOption={(val) => handleCreateOption(val, "/api/v1/master/voltages", "voltageValue", setVoltages, setSelectedVoltage)}
                                            isDisabled={loading}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Frequency</Label>
                                        <CreatableSelect
                                            isClearable
                                            options={frequencies}
                                            value={selectedFrequency}
                                            onChange={(val) => setSelectedFrequency(val)}
                                            onCreateOption={(val) => handleCreateOption(val, "/api/v1/master/frequencies", "frequencyValue", setFrequencies, setSelectedFrequency)}
                                            isDisabled={loading}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Application</Label>
                                        <CreatableSelect
                                            isClearable
                                            options={applications}
                                            value={selectedAcApp}
                                            onChange={(val) => setSelectedAcApp(val)}
                                            onCreateOption={(val) => handleCreateOption(val, "/api/v1/master/applications", "name", setApplications, setSelectedAcApp)}
                                            isDisabled={loading}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Total Motors</Label>
                                        <Input type="number" step="1" value={totalMotors} onChange={e => setTotalMotors(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Motors Per Group</Label>
                                        <Input type="number" step="1" value={motorsPerGroup} onChange={e => setMotorsPerGroup(e.target.value)} />
                                    </div>
                                </div>
                            ) : (
                                // DC MOTOR SPECS
                                <div className="grid grid-cols-2 gap-4 bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                                    <div className="space-y-2">
                                        <Label>DC Armature Voltage (V)</Label>
                                        <Input type="number" step="0.01" value={dcArmatureVoltage} onChange={e => setDcArmatureVoltage(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>DC kW</Label>
                                        <Input type="number" step="0.01" value={dcKw} onChange={e => setDcKw(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>DC Field Voltage (V)</Label>
                                        <Input type="number" step="0.01" value={dcFieldVoltage} onChange={e => setDcFieldVoltage(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>DC Field Current (A)</Label>
                                        <Input type="number" step="0.01" value={dcFieldCurrent} onChange={e => setDcFieldCurrent(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Application</Label>
                                        <CreatableSelect
                                            isClearable
                                            options={applications}
                                            value={selectedDcApp}
                                            onChange={(val) => setSelectedDcApp(val)}
                                            onCreateOption={(val) => handleCreateOption(val, "/api/v1/master/applications", "name", setApplications, setSelectedDcApp)}
                                            isDisabled={loading}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <Button type="submit" className="w-full mt-6 h-12 text-lg" disabled={loading}>
                        {loading ? "Saving..." : "Update Product"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
