"use client";

import { Upload, Link as LinkIcon, X, Image as ImageIcon } from 'lucide-react';
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
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">
        Share your inspiration
      </h2>
      <p className="text-slate-300 mb-8">
        Upload reference images or share a Pinterest board link.
      </p>

      <div className="space-y-6">
        {/* Upload Area */}
        <div>
          <Label className="text-white mb-2 block">
            Upload Reference Images (Optional)
          </Label>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragActive
                ? 'border-cyan-500 bg-cyan-500/10'
                : 'border-white/20 hover:border-cyan-500/50'
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
              <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-white mb-1">
                <span className="text-cyan-400 font-medium">Click to upload</span> or drag and drop
              </p>
              <p className="text-sm text-slate-400">
                PNG, JPG, GIF up to 10MB each
              </p>
            </label>
          </div>

          {/* Preview Grid */}
          {referenceImages.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-4">
              {referenceImages.map((img) => (
                <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden bg-slate-900">
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
          <Label htmlFor="pinterest" className="text-white mb-2 block">
            Pinterest Board Link (Optional)
          </Label>
          <div className="relative">
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              id="pinterest"
              type="url"
              placeholder="https://www.pinterest.com/your-board"
              value={pinterestLink}
              onChange={(e) => setPinterestLink(e.target.value)}
              className="pl-12 h-12 bg-slate-900/50 border-white/10 text-white"
            />
          </div>
        </div>

        {referenceImages.length === 0 && !pinterestLink && (
          <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-900/30 rounded-lg p-4">
            <ImageIcon className="h-5 w-5" />
            <p>Reference images help creators understand your style preferences better</p>
          </div>
        )}
      </div>
    </div>
  );
}
