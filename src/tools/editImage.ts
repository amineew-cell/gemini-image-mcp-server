import { ErrorCode, Tool } from '@modelcontextprotocol/sdk/types.js';

import { GeminiService } from '../services/gemini.js';
import { ImageService } from '../services/imageService.js';
import { ensureMcpError, invalidParams } from '../utils/errors.js';
import { EditImageArgs, SUPPORTED_ASPECT_RATIOS, SUPPORTED_IMAGE_SIZES } from '../types/index.js';

export const editImageTool: Tool = {
  name: 'edit_image',
  description:
    'Modify an existing image using Google Gemini AI based on a text instruction. Provide the path to the image you want to edit and describe the changes that should be applied.',
  inputSchema: {
    type: 'object',
    properties: {
      description: {
        type: 'string',
        description:
          'Describe the changes that should be applied to the provided image. Be specific about elements to add, remove, or modify.',
      },
      image: {
        type: 'string',
        description: 'Path to the image file that should be edited. Can be absolute or relative to the server.',
      },
      aspectRatio: {
        type: 'string',
        enum: [...SUPPORTED_ASPECT_RATIOS],
        description: 'Output aspect ratio. Use to change the aspect ratio of the edited image. Valid values: 1:1, 1:4, 1:8, 2:3, 3:2, 3:4, 4:1, 4:3, 4:5, 5:4, 8:1, 9:16, 16:9, 21:9.',
      },
      imageSize: {
        type: 'string',
        enum: [...SUPPORTED_IMAGE_SIZES],
        description: 'Output image size (longest dimension). 512 is Flash models only. Must be uppercase K (1K, 2K, 4K).',
      },
      model: {
        type: 'string',
        description: 'Gemini model ID. Options include gemini-3-pro-image-preview (complex/high-fidelity) and gemini-3.1-flash-image-preview (fast/cost-efficient). Default: gemini-3-pro-image-preview.',
      },
      outputPath: {
        type: 'string',
        description:
          'Optional path where the edited image should be saved. If omitted, saves in the current working directory using an auto-generated filename.',
      },
    },
    required: ['description', 'image'],
  },
};

export async function handleEditImage(
  args: EditImageArgs,
  geminiService: GeminiService,
  imageService: ImageService
) {
  const description = args.description?.trim();
  if (!description) {
    throw invalidParams('Description is required to edit an image');
  }

  if (!args.image || !args.image.trim()) {
    throw invalidParams('Image path is required to edit an image');
  }

  try {
    const imageData = await geminiService.editImage({
      description,
      image: args.image,
      aspectRatio: args.aspectRatio,
      imageSize: args.imageSize,
      model: args.model,
    });

    const filePath = await imageService.saveImage(imageData, {
      description,
      outputPath: args.outputPath,
    });

    return {
      content: [
        {
          type: 'text',
          text: filePath,
        },
      ],
    };
  } catch (error) {
    throw ensureMcpError(error, ErrorCode.InternalError, 'Failed to edit image', {
      stage: 'edit_image.tool',
    });
  }
}
