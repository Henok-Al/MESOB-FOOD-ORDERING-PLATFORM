import React, { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import api from '../services/api';
import { toast } from 'sonner';

interface ImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, disabled }) => {
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await api.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            onChange(response.data.data.imageUrl);
            toast.success('Image uploaded successfully');
        } catch (error: any) {
            console.error('Upload failed:', error);
            toast.error(error.response?.data?.message || 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        onChange('');
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
                {value ? (
                    <div className="relative w-40 h-40 rounded-md overflow-hidden border bg-muted">
                        <img src={value} alt="Upload" className="object-cover w-full h-full" />
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6"
                            onClick={handleRemove}
                            disabled={disabled}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center justify-center w-40 h-40 border-2 border-dashed rounded-md bg-muted/50 hover:bg-muted/80 transition-colors">
                        <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                            {uploading ? (
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            ) : (
                                <>
                                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                    <span className="text-xs text-muted-foreground font-medium">Upload Image</span>
                                </>
                            )}
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleUpload}
                                disabled={disabled || uploading}
                            />
                        </label>
                    </div>
                )}
            </div>
            {uploading && <p className="text-xs text-muted-foreground animate-pulse">Uploading image...</p>}
        </div>
    );
};
