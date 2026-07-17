"use client";

import { useCallback, useRef, useState } from "react";
import { ImagePlus, X, ChevronLeft, ChevronRight, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface ImageEntry {
  blob: string;
  filename: string;
}

interface ImageUploadProps {
  value?: ImageEntry[];
  onChange: (images: ImageEntry[]) => void;
}

export function ImageUpload({ value = [], onChange }: ImageUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const dragRef = useRef<number | null>(null);

  const addImages = useCallback((files: FileList) => {
    const newImages: ImageEntry[] = [];
    const pending = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (pending.length === 0) return;

    let loaded = 0;
    for (const file of pending) {
      const reader = new FileReader();
      reader.onload = (e) => {
        newImages.push({ blob: e.target!.result as string, filename: file.name });
        loaded++;
        if (loaded === pending.length) {
          onChange([...value, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    }
  }, [value, onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) addImages(e.dataTransfer.files);
  }, [addImages]);

  const handleSelect = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files?.length) addImages(files);
    };
    input.click();
  }, [addImages]);

  const removeImage = useCallback((index: number) => {
    const next = value.filter((_, i) => i !== index);
    onChange(next);
    if (currentIndex >= next.length && next.length > 0) {
      setCurrentIndex(next.length - 1);
    }
  }, [value, onChange, currentIndex]);

  const moveImage = useCallback((from: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
    setCurrentIndex(to);
  }, [value, onChange]);

  const handleDragStart = useCallback((e: React.DragEvent, idx: number) => {
    dragRef.current = idx;
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setOverIdx(idx);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDropReorder = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault();
    const from = dragRef.current;
    if (from !== null && from !== idx) {
      moveImage(from, idx);
    }
    setDragIdx(null);
    setOverIdx(null);
    dragRef.current = null;
  }, [moveImage]);

  const handleDragEnd = useCallback(() => {
    setDragIdx(null);
    setOverIdx(null);
    dragRef.current = null;
  }, []);

  return (
    <div
      className={`relative rounded-lg border-2 border-dashed p-4 transition-colors ${
        dragOver
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-muted-foreground/50"
      }`}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
    >
      {value.length > 0 ? (
        <div className="space-y-3">
          <div className="relative">
            <Image
              src={value[currentIndex].blob}
              alt={value[currentIndex].filename}
              width={400}
              height={300}
              className="rounded-lg object-contain w-full max-h-64 mx-auto bg-muted"
            />
            {value.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setCurrentIndex((p) => (p === 0 ? value.length - 1 : p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setCurrentIndex((p) => (p === value.length - 1 ? 0 : p + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {value.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`w-2 h-2 rounded-full ${
                        i === currentIndex ? "bg-white" : "bg-white/50"
                      }`}
                      onClick={() => setCurrentIndex(i)}
                    />
                  ))}
                </div>
              </>
            )}
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6"
              onClick={() => removeImage(currentIndex)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {value.map((img, i) => (
              <div
                key={i}
                draggable
                onDragStart={(e) => handleDragStart(e, i)}
                onDragEnter={(e) => handleDragEnter(e, i)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropReorder(e, i)}
                onDragEnd={handleDragEnd}
                className={`relative w-16 h-16 rounded-md overflow-hidden border-2 cursor-grab active:cursor-grabbing ${
                  i === currentIndex ? "border-primary" : "border-transparent"
                } ${dragIdx === i ? "opacity-40" : ""} ${
                  overIdx === i && dragIdx !== null && dragIdx !== i ? "border-dashed border-muted-foreground" : ""
                }`}
                onClick={() => setCurrentIndex(i)}
              >
                <Image
                  src={img.blob}
                  alt={img.filename}
                  fill
                  className="object-cover pointer-events-none"
                />
                <div className="absolute top-0 left-0 p-0.5">
                  <GripVertical className="h-3 w-3 text-white drop-shadow-md" />
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelect}
              className="h-16 w-16"
            >
              <ImagePlus className="h-5 w-5" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="flex flex-col items-center gap-2 py-4 cursor-pointer"
          onClick={handleSelect}
        >
          <ImagePlus className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Drag & drop or click to upload
          </p>
          <p className="text-xs text-muted-foreground">Supports multiple images</p>
          <Button type="button" variant="secondary" size="sm">
            Select Images
          </Button>
        </div>
      )}
    </div>
  );
}
