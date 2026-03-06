"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import CreatableSelect from 'react-select/creatable';
import { useDropzone } from 'react-dropzone';
import { X } from "lucide-react";

// Define Option Type for Select
type OptionType = { value: string; label: string };

export default function NewProductModal({ onSuccess }: { onSuccess: () => void }) {
    const [open, setOpen] = useState(false);
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

    // Dynamic Specs
    const [isAC, setIsAC] = useState(true); // AC by default

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

    // Fetch Master Data on Mount
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

                setCompanies(compRes.map((c: any) => ({ value: c.id, label: c.name })));
                setMotorTypes(mtRes.map((m: any) => ({ value: m.id, label: m.name })));
                setPoles(poleRes.map((p: any) => ({ value: p.id, label: p.poleNumber })));
                setVoltages(voltRes.map((v: any) => ({ value: v.id, label: `${v.voltageValue} ${v.unit}` })));
                setFrequencies(freqRes.map((f: any) => ({ value: f.id, label: `${f.frequencyValue} ${f.unit}` })));
                setApplications(appRes.map((a: any) => ({ value: a.id, label: a.name })));
            } catch (err) {
                console.error("Failed to load master data", err);
                toast.error("Failed to load select options");
            }
        };

        if (open) {
            fetchMasterData()
            // setAll data anull 
            setFormData({
                name: "",
                sku: "",
                summary: "",
            });
            setSelectedCompany(null);
            setSelectedMotorType(null);
            setImages([]);
            setAcKw("");
            setTotalMotors("");
            setMotorsPerGroup("");
            setSelectedPole(null);
            setSelectedVoltage(null);
            setSelectedFrequency(null);
            setSelectedAcApp(null);
            setDcArmatureVoltage("");
            setDcKw("");
            setDcFieldVoltage("");
            setDcFieldCurrent("");
            setSelectedDcApp(null);
        };
    }, [open]);


    // Update isAC based on Motor Type Selection
    useEffect(() => {
        if (selectedMotorType) {
            // Very simple heuristic for demo: if it explicitly says DC or Brushed DC, it's DC. Otherwise AC.
            const isDcType = selectedMotorType.label.toUpperCase().includes("DC");
            setIsAC(!isDcType);
        }
    }, [selectedMotorType]);


    // Generic handler for creating new master entities
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

            if (!res.ok) {
                throw new Error(data.error || "Failed to create new entry");
            }

            // Assume returning object has id and we need to map the label dynamically based on what was inserted
            let label = inputValue;
            if (endpoint.includes('voltages')) label = `${data.voltageValue} ${data.unit}`;
            if (endpoint.includes('frequencies')) label = `${data.frequencyValue} ${data.unit}`;

            const newOption: OptionType = { value: data.id, label };
            setStateAction((prev) => [...prev, newOption]);
            setSelectionAction(newOption);
            toast.success("Created new entry successfully");
        } catch (err: any) {
            console.error("Failed to create new entry", err);
            toast.error(err.message || "Failed to create new entry");
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

        if (!selectedCompany || !selectedMotorType) {
            toast.error("Please select a Company and Motor Type");
            return;
        }

        setLoading(true);

        // Map Specs
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

            images.forEach((file) => {
                formDataObj.append("image", file);
            });

            const res = await fetch("/api/v1/products", {
                method: "POST",
                body: formDataObj
            });
            console.log("--------------------->", res)
            if (res.ok) {
                toast.success("Product created successfully.");
                setOpen(false);
                // Reset State
                setFormData({ name: "", sku: "", summary: "" });
                setSelectedCompany(null);
                setSelectedMotorType(null);
                setSelectedPole(null);
                setSelectedVoltage(null);
                setSelectedFrequency(null);
                setSelectedAcApp(null);
                setSelectedDcApp(null);
                setAcKw(""); setTotalMotors(""); setMotorsPerGroup("");
                setDcArmatureVoltage(""); setDcKw(""); setDcFieldVoltage(""); setDcFieldCurrent("");
                setImages([]);
                onSuccess();
            } else {
                const errorData = await res.json().catch(() => ({}));
                toast.error(errorData.error || "Failed to create product.");
            }
        } catch (err: any) {
            toast.error(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-white shadow-md transition-all">Add New Product</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[100vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-primary text-xl">Add New Product</DialogTitle>
                    <DialogDescription>
                        Create a new motor driver product with strict Master Data adherence.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="company">Company *</Label>
                            <CreatableSelect
                                id="company"
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
                            <Label htmlFor="motorType">Motor Type *</Label>
                            <CreatableSelect
                                id="motorType"
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
                            <Label htmlFor="name">Product Name *</Label>
                            <Input id="name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sku">SKU / Part No *</Label>
                            <Input id="sku" required value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="summary">Summary</Label>
                        <Textarea id="summary" value={formData.summary} onChange={e => setFormData({ ...formData, summary: e.target.value })} className="resize-none" rows={2} />
                    </div>

                    <div className="space-y-2">
                        <Label>Product Images</Label>
                        <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50 bg-gray-50'}`}>
                            <input {...getInputProps()} />
                            <div className="flex flex-col items-center justify-center space-y-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
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
                                            placeholder="Select or Create..."
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
                                            placeholder="Select or Create..."
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
                                            placeholder="Select or Create..."
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
                                            placeholder="Select or Create..."
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
                                            placeholder="Select or Create..."
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <Button type="submit" className="w-full mt-6 h-12 text-lg" disabled={loading}>
                        {loading ? "Creating Product..." : "Create Product"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
