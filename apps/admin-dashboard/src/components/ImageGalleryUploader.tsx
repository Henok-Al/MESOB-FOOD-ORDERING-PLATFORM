import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import api from '../services/api';

interface ImageGalleryUploaderProps {
    value: string[];
    onChange: (images: string[]) => void;
    maxImages?: number;
}

const ImageGalleryUploader: React.FC<ImageGalleryUploaderProps> = ({
    value,
    onChange,
    maxImages = 10
}) => {
    const [images, setImages] = useState<string[]>(value || []);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (images.length + files.length > maxImages) {
            setError(`Maximum ${maxImages} images allowed`);
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const uploadPromises = Array.from(files).map(async (file) => {
                const formData = new FormData();
                formData.append('image', file);

                const response = await api.post('/upload/image', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                return response.data.data.url;
            });

            const uploadedUrls = await Promise.all(uploadPromises);
            const newImages = [...images, ...uploadedUrls];
            setImages(newImages);
            onChange(newImages);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to upload images');
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
        onChange(newImages);
    };


    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                    Image Gallery ({images.length}/{maxImages})
                </label>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                    {error}
                </div>
            )}

            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                    type="file"
                    id="gallery-upload"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={uploading || images.length >= maxImages}
                    className="hidden"
                />
                <label
                    htmlFor="gallery-upload"
                    className={`cursor-pointer ${uploading || images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                        {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, GIF up to 10MB
                    </p>
                </label>
            </div>

            {/* Image Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((url, index) => (
                        <div
                            key={index}
                            className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200"
                        >
                            <img
                                src={url}
                                alt={`Gallery ${index + 1}`}
                                className="w-full h-full object-cover"
                            />

                            {/* Overlay with actions */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleRemove(index)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                                    title="Remove"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Position indicator */}
                            <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                                {index + 1}
                            </div>

                            {index === 0 && (
                                <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                    Main
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {images.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-2 text-sm">No images uploaded yet</p>
                </div>
            )}
        </div>
    );
};

export default ImageGalleryUploader;
