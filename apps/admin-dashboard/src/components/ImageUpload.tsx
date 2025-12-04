import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import api from '../services/api';

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, className }) => {
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<string | undefined>(value);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setPreview(value);
    }, [value]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Create local preview
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await api.post('/upload/image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const imageUrl = response.data.data.url;
            onChange(imageUrl);
            // No need to setPreview here as the useEffect will handle it when value changes
            // But for immediate feedback if parent updates slowly:
            setPreview(imageUrl);
        } catch (error) {
            console.error('Upload failed:', error);
            // Revert preview if upload fails
            setPreview(value);
            alert('Failed to upload image. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = () => {
        onChange('');
        setPreview(undefined);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className={`flex flex-col gap-4 ${className}`}>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
            />

            {preview ? (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border bg-muted">
                    <img
                        src={preview}
                        alt="Upload preview"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                        <Button
                            variant="destructive"
                            size="icon"
                            onClick={handleRemove}
                            type="button"
                            className="h-8 w-8"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    {loading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-white" />
                        </div>
                    )}
                </div>
            ) : (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-48 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors flex flex-col items-center justify-center cursor-pointer bg-muted/50 hover:bg-muted"
                >
                    {loading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Upload className="h-8 w-8" />
                            <span className="text-sm font-medium">Click to upload image</span>
                            <span className="text-xs">SVG, PNG, JPG or GIF (max. 5MB)</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
