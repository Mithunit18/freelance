"use client";

import { Upload, Link as LinkIcon, X, Image as ImageIcon, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWizardStore } from '@/stores/WizardStore';
import { Input, Label, Button } from "@vision-match/ui-web";
import { useState } from 'react';

export function ReferenceImagesStep() {
  const { referenceImages, setReferenceImages, pinterestLink, setPinterestLink } = useWizardStore();
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    const newImages = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      url: URL.createObjectURL(file),
      file
    }));
    setReferenceImages([...referenceImages, ...newImages]);
  };

  const removeImage = (id: string) => {
    setReferenceImages(referenceImages.filter(img => img.id !== id));
  };

  return (
    <div>
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 mb-4"
        >
          <Sparkles className="h-3.5 w-3.5 text-pink-500" />
          <span className="text-xs font-medium text-gray-600">Step 6 of 9</span>
        </motion.div>
        
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Share your inspiration
        </h2>
        <p className="text-gray-500">
          Upload reference images or share a Pinterest board link.
        </p>
      </div>

      <div className="space-y-6">
        {/* Upload Area */}
        <div>
          <Label className="text-gray-700 mb-2 block font-medium">
            Upload Reference Images (Optional)
          </Label>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragActive
                ? 'border-pink-500 bg-pink-50'
                : 'border-gray-200 hover:border-pink-300 bg-white'
            }`}
          >
            <input
              type="file"
              id="file-upload"
              multiple
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-1">
                <span className="text-pink-500 font-medium">Click to upload</span> or drag and drop
              </p>
              <p className="text-sm text-gray-400">
                PNG, JPG, GIF up to 10MB each
              </p>
            </label>
          </div>

          {/* Preview Grid */}
          {referenceImages.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-4">
              {referenceImages.map((img) => (
                <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeImage(img.id)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pinterest Link */}
        <div>
          <Label htmlFor="pinterest" className="text-gray-700 mb-2 block font-medium">
            Pinterest Board Link (Optional)
          </Label>
          <div className="relative">
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="pinterest"
              type="url"
              placeholder="https://www.pinterest.com/your-board"
              value={pinterestLink}
              onChange={(e) => setPinterestLink(e.target.value)}
              className="pl-12 h-12 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-pink-400"
            />
          </div>
        </div>

        {referenceImages.length === 0 && !pinterestLink && (
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-4">
            <ImageIcon className="h-5 w-5 text-pink-500" />
            <p>Reference images help creators understand your style preferences better</p>
          </div>
        )}
      </div>
    </div>
  );
}
