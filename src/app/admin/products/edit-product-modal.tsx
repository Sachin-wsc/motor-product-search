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

import * as yup from "yup";

type OptionType = { value: string; label: string };

const productSchema = yup.object().shape({
    company: yup.object().nullable().required("Company is required"),
    motorType: yup.object().nullable().required("Motor Type is required"),
    name: yup.string().required("Product Name is required"),
    sku: yup.string().required("SKU / Part No is required"),
});

const initialFormState = {
    name: "",
    sku: "",
    summary: "",
    company: null as OptionType | null,
    motorType: null as OptionType | null,
    isAC: true,
    acKw: "",
    totalMotors: "",
    motorsPerGroup: "",
    pole: null as OptionType | null,
    voltage: null as OptionType | null,
    frequency: null as OptionType | null,
    acApp: null as OptionType | null,
    dcArmatureVoltage: "",
    dcKw: "",
    dcFieldVoltage: "",
    dcFieldCurrent: "",
    dcApp: null as OptionType | null,
};

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

    // Unified Form State
    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [images, setImages] = useState<(File & { preview: string })[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [documentFile, setDocumentFile] = useState<File | null>(null);

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
                    const initCompany = comps.find((c: any) => c.value === product.companyId) || null;
                    const initMotorType = mTypes.find((m: any) => m.value === product.motorTypeId) || null;

                    let updatedIsAc = true;
                    if (initMotorType) {
                        const isDcType = initMotorType.label.toUpperCase().includes("DC");
                        updatedIsAc = !isDcType;
                    }

                    const specs = product.specs || {};

                    setFormData({
                        name: product.name || "",
                        sku: product.sku || "",
                        summary: product.summary || "",
                        company: initCompany,
                        motorType: initMotorType,
                        isAC: updatedIsAc,

                        acKw: specs.acKw?.toString() || "",
                        totalMotors: specs.totalMotors?.toString() || "",
                        motorsPerGroup: specs.motorsPerGroup?.toString() || "",
                        pole: pols.find((p: any) => p.value === specs.poleId) || null,
                        voltage: volts.find((v: any) => v.value === specs.voltageId) || null,
                        frequency: freqs.find((f: any) => f.value === specs.frequencyId) || null,
                        acApp: apps.find((a: any) => a.value === specs.acApplicationId) || null,

                        dcArmatureVoltage: specs.dcArmatureVoltage?.toString() || "",
                        dcKw: specs.dcKw?.toString() || "",
                        dcFieldVoltage: specs.dcFieldVoltage?.toString() || "",
                        dcFieldCurrent: specs.dcFieldCurrent?.toString() || "",
                        dcApp: apps.find((a: any) => a.value === specs.dcApplicationId) || null,
                    });

                    setImages([]); // Clear images on modal open for new uploads
                    setExistingImages(product.images || []);
                    setDocumentFile(null);
                    setErrors({});
                }
            } catch (err) {
                console.error("Failed to load master data", err);
                toast.error("Failed to load select options");
            }
        };

        if (open) fetchMasterData();
    }, [open, product]);

    useEffect(() => {
        if (formData.motorType) {
            const isDcType = formData.motorType.label.toUpperCase().includes("DC");
            setFormData(prev => ({ ...prev, isAC: !isDcType }));
        }
    }, [formData.motorType]);

    const handleCreateOption = async (
        inputValue: string,
        endpoint: string,
        payloadKey: string,
        setStateAction: React.Dispatch<React.SetStateAction<OptionType[]>>
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

            let label = inputValue;
            if (endpoint.includes('voltages')) label = `${data.voltageValue} ${data.unit}`;
            if (endpoint.includes('frequencies')) label = `${data.frequencyValue} ${data.unit}`;

            const newOption: OptionType = { value: data.id, label };
            setStateAction((prev) => [...prev, newOption]);
            toast.success("Created new entry successfully");
            return newOption;
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
        setErrors({});

        try {
            await productSchema.validate(formData, { abortEarly: false });
        } catch (validationErrors) {
            if (validationErrors instanceof yup.ValidationError) {
                const newErrors: Record<string, string> = {};
                validationErrors.inner.forEach((error) => {
                    if (error.path) {
                        newErrors[error.path] = error.message;
                    }
                });
                setErrors(newErrors);
                toast.error("Please fill in all required fields.");
                return;
            }
        }

        setLoading(true);

        const specs = {
            isAC: formData.isAC,
            acKw: formData.acKw ? Number(formData.acKw) : null,
            poleId: formData.pole?.value || null,
            voltageId: formData.voltage?.value || null,
            frequencyId: formData.frequency?.value || null,
            acApplicationId: formData.acApp?.value || null,
            totalMotors: formData.totalMotors ? Number(formData.totalMotors) : null,
            motorsPerGroup: formData.motorsPerGroup ? Number(formData.motorsPerGroup) : null,
            dcArmatureVoltage: formData.dcArmatureVoltage ? Number(formData.dcArmatureVoltage) : null,
            dcKw: formData.dcKw ? Number(formData.dcKw) : null,
            dcFieldVoltage: formData.dcFieldVoltage ? Number(formData.dcFieldVoltage) : null,
            dcFieldCurrent: formData.dcFieldCurrent ? Number(formData.dcFieldCurrent) : null,
            dcApplicationId: formData.dcApp?.value || null,
        };

        try {
            const formDataObj = new FormData();
            formDataObj.append("name", formData.name);
            formDataObj.append("sku", formData.sku);
            formDataObj.append("summary", formData.summary);
            formDataObj.append("companyId", formData.company!.value);
            formDataObj.append("motorTypeId", formData.motorType!.value);
            formDataObj.append("specs", JSON.stringify(specs));
            formDataObj.append("existingImages", JSON.stringify(existingImages));

            images.forEach((file) => {
                formDataObj.append("image", file);
            });

            if (documentFile) {
                formDataObj.append("document", documentFile);
            }

            const res = await fetch(`/api/v1/products/${product.id}`, {
                method: "PUT",
                body: formDataObj
            });

            if (res.ok) {
                toast.success("Product updated successfully.");
                onOpenChange(false);
                onSuccess();
            } else {
                const errorData = await res.json().catch(() => ({}));
                toast.error(errorData.error || "Failed to update product.");
            }
        } catch (err: any) {
            toast.error(err.message || "An error occurred");
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
                                value={formData.company}
                                onChange={(val) => setFormData(prev => ({ ...prev, company: val }))}
                                onCreateOption={async (val) => {
                                    const newOpt = await handleCreateOption(val, "/api/v1/master/companies", "name", setCompanies);
                                    if (newOpt) setFormData(prev => ({ ...prev, company: newOpt }));
                                }}
                                isDisabled={loading}
                                placeholder="Select or type..."
                            />
                            {errors.companyId && <p className="text-sm text-red-500">{errors.companyId}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-motorType">Motor Type *</Label>
                            <CreatableSelect
                                id="edit-motorType"
                                isClearable
                                options={motorTypes}
                                value={formData.motorType}
                                onChange={(val) => setFormData(prev => ({ ...prev, motorType: val }))}
                                onCreateOption={async (val) => {
                                    const newOpt = await handleCreateOption(val, "/api/v1/master/motor-types", "name", setMotorTypes);
                                    if (newOpt) setFormData(prev => ({ ...prev, motorType: newOpt }));
                                }}
                                isDisabled={loading}
                                placeholder="Select or type..."
                            />
                            {errors.motorTypeId && <p className="text-sm text-red-500">{errors.motorTypeId}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Product Name *</Label>
                            <Input id="edit-name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-sku">SKU / Part No *</Label>
                            <Input id="edit-sku" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} />
                            {errors.sku && <p className="text-sm text-red-500">{errors.sku}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-summary">Summary</Label>
                        <Textarea id="edit-summary" value={formData.summary} onChange={e => setFormData({ ...formData, summary: e.target.value })} className="resize-none" rows={2} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-document">Upload Document</Label>
                        {product?.documentUrl && <div className="text-xs mb-1"><a href={product.documentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">View current document</a></div>}
                        <Input id="edit-document" type="file" accept=".pdf,.doc,.docx" onChange={e => setDocumentFile(e.target.files?.[0] || null)} />
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
                    {formData.motorType && (
                        <div className="pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-primary">
                                    Technical Specifications ({formData.isAC ? "AC Motor" : "DC Motor"})
                                </h3>
                            </div>

                            {formData.isAC ? (
                                /* AC MOTOR SPECS */
                                <div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                    <div className="space-y-2">
                                        <Label>AC kW</Label>
                                        <Input type="number" step="0.01" value={formData.acKw} onChange={e => setFormData(prev => ({ ...prev, acKw: e.target.value }))} placeholder="e.g. 5.5" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Poles</Label>
                                        <CreatableSelect
                                            isClearable
                                            options={poles}
                                            value={formData.pole}
                                            onChange={(val) => setFormData(prev => ({ ...prev, pole: val }))}
                                            onCreateOption={async (val) => {
                                                const newOpt = await handleCreateOption(val, "/api/v1/master/poles", "poleNumber", setPoles);
                                                if (newOpt) setFormData(prev => ({ ...prev, pole: newOpt }));
                                            }}
                                            isDisabled={loading}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Voltage</Label>
                                        <CreatableSelect
                                            isClearable
                                            options={voltages}
                                            value={formData.voltage}
                                            onChange={(val) => setFormData(prev => ({ ...prev, voltage: val }))}
                                            onCreateOption={async (val) => {
                                                const newOpt = await handleCreateOption(val, "/api/v1/master/voltages", "voltageValue", setVoltages);
                                                if (newOpt) setFormData(prev => ({ ...prev, voltage: newOpt }));
                                            }}
                                            isDisabled={loading}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Frequency</Label>
                                        <CreatableSelect
                                            isClearable
                                            options={frequencies}
                                            value={formData.frequency}
                                            onChange={(val) => setFormData(prev => ({ ...prev, frequency: val }))}
                                            onCreateOption={async (val) => {
                                                const newOpt = await handleCreateOption(val, "/api/v1/master/frequencies", "frequencyValue", setFrequencies);
                                                if (newOpt) setFormData(prev => ({ ...prev, frequency: newOpt }));
                                            }}
                                            isDisabled={loading}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Application</Label>
                                        <CreatableSelect
                                            isClearable
                                            options={applications}
                                            value={formData.acApp}
                                            onChange={(val) => setFormData(prev => ({ ...prev, acApp: val }))}
                                            onCreateOption={async (val) => {
                                                const newOpt = await handleCreateOption(val, "/api/v1/master/applications", "name", setApplications);
                                                if (newOpt) setFormData(prev => ({ ...prev, acApp: newOpt }));
                                            }}
                                            isDisabled={loading}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Total Motors</Label>
                                        <Input type="number" step="1" value={formData.totalMotors} onChange={e => setFormData(prev => ({ ...prev, totalMotors: e.target.value }))} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Motors Per Group</Label>
                                        <Input type="number" step="1" value={formData.motorsPerGroup} onChange={e => setFormData(prev => ({ ...prev, motorsPerGroup: e.target.value }))} />
                                    </div>
                                </div>
                            ) : (
                                /* DC MOTOR SPECS */
                                <div className="grid grid-cols-2 gap-4 bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                                    <div className="space-y-2">
                                        <Label>DC Armature Voltage (V)</Label>
                                        <Input type="number" step="0.01" value={formData.dcArmatureVoltage} onChange={e => setFormData(prev => ({ ...prev, dcArmatureVoltage: e.target.value }))} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>DC kW</Label>
                                        <Input type="number" step="0.01" value={formData.dcKw} onChange={e => setFormData(prev => ({ ...prev, dcKw: e.target.value }))} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>DC Field Voltage (V)</Label>
                                        <Input type="number" step="0.01" value={formData.dcFieldVoltage} onChange={e => setFormData(prev => ({ ...prev, dcFieldVoltage: e.target.value }))} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>DC Field Current (A)</Label>
                                        <Input type="number" step="0.01" value={formData.dcFieldCurrent} onChange={e => setFormData(prev => ({ ...prev, dcFieldCurrent: e.target.value }))} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Application</Label>
                                        <CreatableSelect
                                            isClearable
                                            options={applications}
                                            value={formData.dcApp}
                                            onChange={(val) => setFormData(prev => ({ ...prev, dcApp: val }))}
                                            onCreateOption={async (val) => {
                                                const newOpt = await handleCreateOption(val, "/api/v1/master/applications", "name", setApplications);
                                                if (newOpt) setFormData(prev => ({ ...prev, dcApp: newOpt }));
                                            }}
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
