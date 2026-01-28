'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, X, Loader2, Image as ImageIcon, Link as LinkIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value: string | null
  onChange: (url: string | null) => void
  bucket?: string
  folder?: string
  label?: string
  aspectRatio?: 'square' | 'video' | 'banner' | 'logo'
  maxSizeMB?: number
  accept?: string
  className?: string
}

const aspectRatioClasses = {
  square: 'aspect-square',
  video: 'aspect-video',
  banner: 'aspect-[3/1]',
  logo: 'aspect-[2/1]',
}

export function ImageUpload({
  value,
  onChange,
  bucket = 'conference-assets',
  folder = '',
  label = 'Image',
  aspectRatio = 'video',
  maxSizeMB = 5,
  accept = 'image/*',
  className,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlValue, setUrlValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const uploadFile = async (file: File) => {
    setError(null)

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File must be less than ${maxSizeMB}MB`)
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setError('Only image and video files are allowed')
      return
    }

    setIsUploading(true)

    try {
      // Generate unique filename
      const ext = file.name.split('.').pop()
      const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
      const path = folder ? `${folder}/${filename}` : filename

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path)

      onChange(publicUrl)
    } catch (err: any) {
      setError(err.message || 'Upload failed')
      console.error('Upload error:', err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadFile(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      uploadFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleUrlSubmit = () => {
    if (urlValue.trim()) {
      onChange(urlValue.trim())
      setShowUrlInput(false)
      setUrlValue('')
    }
  }

  const handleRemove = async () => {
    // If it's a Supabase URL, try to delete the file
    if (value && value.includes('supabase')) {
      try {
        const path = value.split(`${bucket}/`)[1]
        if (path) {
          await supabase.storage.from(bucket).remove([path])
        }
      } catch (err) {
        console.error('Failed to delete file:', err)
      }
    }
    onChange(null)
  }

  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium">{label}</label>

      {value ? (
        // Preview with remove button
        <div className={cn('relative rounded-lg border overflow-hidden bg-muted', aspectRatioClasses[aspectRatio])}>
          <Image
            src={value}
            alt={label}
            fill
            className="object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : showUrlInput ? (
        // URL input mode
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="flex-1"
            />
            <Button type="button" onClick={handleUrlSubmit} disabled={!urlValue.trim()}>
              Add
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowUrlInput(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        // Upload zone
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'relative rounded-lg border-2 border-dashed transition-colors',
            aspectRatioClasses[aspectRatio],
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50',
            isUploading && 'pointer-events-none opacity-50'
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
            {isUploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground text-center">
                  Drag & drop or click to upload
                </p>
                <p className="text-xs text-muted-foreground">
                  Max {maxSizeMB}MB
                </p>
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => inputRef.current?.click()}
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Browse
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowUrlInput(true)}
                  >
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Use URL
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}
