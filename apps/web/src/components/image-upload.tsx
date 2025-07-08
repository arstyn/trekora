'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
  description?: string;
}

export function ImageUpload({
  images,
  onImagesChange,
  maxImages = 5,
  label = 'Images',
  description = 'Upload images (JPG, PNG, max 5MB each)',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (files.length + images.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);

    const newImages: string[] = [];
    let processed = 0;

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 5MB.`);
        processed++;
        if (processed === files.length) {
          setUploading(false);
          if (newImages.length > 0) {
            onImagesChange([...images, ...newImages]);
          }
        }
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        newImages.push(e.target?.result as string);
        processed++;

        if (processed === files.length) {
          setUploading(false);
          onImagesChange([...images, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    event.target.value = '';
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>{label}</Label>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <Image
              src={image || '/placeholder.svg'}
              alt={`Upload ${index + 1}`}
              width={200}
              height={150}
              className="w-full h-32 object-cover rounded-lg border"
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeImage(index)}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}

        {/* Upload Button */}
        {images.length < maxImages && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center h-32 hover:border-gray-400 transition-colors">
            <Upload className="w-6 h-6 text-gray-400 mb-2" />
            <Label
              htmlFor="image-upload"
              className="cursor-pointer text-sm text-gray-600 text-center"
            >
              {uploading ? 'Uploading...' : 'Add Image'}
            </Label>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </div>
        )}
      </div>

      {images.length > 0 && (
        <p className="text-sm text-gray-500">
          {images.length} of {maxImages} images uploaded
        </p>
      )}
    </div>
  );
}
