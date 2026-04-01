export const SUPPORTED_ASPECT_RATIOS = [
  '1:1', '1:4', '1:8', '2:3', '3:2', '3:4',
  '4:1', '4:3', '4:5', '5:4', '8:1', '9:16', '16:9', '21:9'
] as const;

export type AspectRatio = typeof SUPPORTED_ASPECT_RATIOS[number];

export const SUPPORTED_IMAGE_SIZES = ['512', '1K', '2K', '4K'] as const;
export type ImageSize = typeof SUPPORTED_IMAGE_SIZES[number];

export interface GenerateImageArgs {
  description: string;
  aspectRatio?: AspectRatio;
  imageSize?: ImageSize;
  model?: string;
  style?: string;
  outputPath?: string;
  watermarkPath?: string;
  watermarkPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  images?: string[];
}

export interface EditImageArgs {
  description: string;
  image: string;
  aspectRatio?: AspectRatio;
  imageSize?: ImageSize;
  model?: string;
  outputPath?: string;
}
