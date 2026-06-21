import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function validateUploadedFile(file: File): { isValid: boolean; error?: string } {
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];
  const fileExt = file.name.split('.').pop()?.toLowerCase();
  
  if (!fileExt || !allowedExtensions.includes(fileExt)) {
    return {
      isValid: false,
      error: `Invalid file type. Only ${allowedExtensions.join(', ')} are allowed.`
    };
  }
  
  const isPdf = fileExt === 'pdf';
  const maxSize = isPdf ? 20 * 1024 * 1024 : 5 * 1024 * 1024; // 20MB for PDF, 5MB for images
  const maxLabel = isPdf ? '20MB' : '5MB';
  
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size exceeds the limit of ${maxLabel}.`
    };
  }
  
  return { isValid: true };
}
