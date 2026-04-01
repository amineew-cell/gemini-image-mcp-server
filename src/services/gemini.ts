import { GoogleGenAI, HarmBlockThreshold, HarmCategory, Modality } from '@google/genai';
import { readFile } from 'fs/promises';
import { extname, isAbsolute, resolve } from 'path';
import { existsSync } from 'fs';
import { ErrorCode } from '@modelcontextprotocol/sdk/types.js';

import { ensureMcpError, internalError, invalidParams } from '../utils/errors.js';
import type { GenerateImageArgs, EditImageArgs, AspectRatio, ImageSize } from '../types/index.js';

const DEFAULT_MODEL = 'gemini-3-pro-image-preview';

export interface ImageData {
    base64: string;
    mimeType: string;
}

export class GeminiService {
    private ai: GoogleGenAI;

    constructor(apiKey: string) {
        this.ai = new GoogleGenAI({ apiKey });
    }

    private getSafetySettings() {
        return [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ];
    }

    async generateImage(args: GenerateImageArgs): Promise<ImageData> {
        const model = args.model ?? DEFAULT_MODEL;
        const aspectRatio = args.aspectRatio ?? '1:1';
        const imageSize = args.imageSize ?? '1K';

        let fullPrompt = args.description;
        if (args.style) {
            fullPrompt += ` The style should be ${args.style}.`;
        }

        const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
            { text: fullPrompt },
        ];

        if (args.images) {
            for (const imagePath of args.images) {
                parts.push(await toInlinePart(imagePath));
            }
        }

        return this.callGemini(model, parts, aspectRatio, imageSize);
    }

    async editImage(args: EditImageArgs): Promise<ImageData> {
        const model = args.model ?? DEFAULT_MODEL;
        const aspectRatio = args.aspectRatio;
        const imageSize = args.imageSize;

        const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
            { text: args.description },
            await toInlinePart(args.image),
        ];

        return this.callGemini(model, parts, aspectRatio, imageSize);
    }

    private async callGemini(
        model: string,
        parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }>,
        aspectRatio?: AspectRatio,
        imageSize?: ImageSize,
    ): Promise<ImageData> {
        const imageConfig: Record<string, string> = {};
        if (aspectRatio) {
            imageConfig.aspectRatio = aspectRatio;
        }
        if (imageSize) {
            imageConfig.imageSize = imageSize;
        }

        let response;
        try {
            response = await this.ai.models.generateContent({
                model,
                contents: parts as any,
                config: {
                    responseModalities: [Modality.TEXT, Modality.IMAGE],
                    safetySettings: this.getSafetySettings(),
                    ...(Object.keys(imageConfig).length > 0 ? { imageConfig } : {}),
                },
            });
        } catch (error: any) {
            const detail = error?.message || error?.toString?.() || 'unknown';
            throw ensureMcpError(error, ErrorCode.InternalError, `Gemini image generation request failed: ${detail}`, {
                stage: 'GeminiService.generateContent',
            });
        }

        const candidate = response.candidates?.[0];
        if (!candidate?.content?.parts) {
            const finishReason = candidate?.finishReason ?? 'unknown';
            throw internalError(`Gemini finish reason: ${String(finishReason)}`, {
                reason: 'emptyCandidate',
                finishReason: String(finishReason),
            });
        }

        for (const part of candidate.content.parts) {
            if (part.inlineData?.data && part.inlineData?.mimeType) {
                return {
                    base64: part.inlineData.data,
                    mimeType: part.inlineData.mimeType,
                };
            }
        }

        throw internalError('Gemini response did not contain image data', {
            reason: 'missingInlineData',
        });
    }
}

type InlinePart = { inlineData: { mimeType: string; data: string } };

async function toInlinePart(imgPathRaw: string): Promise<InlinePart> {
    const imagePath = isAbsolute(imgPathRaw) ? imgPathRaw : resolve(imgPathRaw);
    if (!existsSync(imagePath)) {
        throw invalidParams(`Context image not found: ${imagePath}`, { imagePath });
    }

    let buffer: Buffer;
    try {
        buffer = await readFile(imagePath);
    } catch (error) {
        throw invalidParams(`Unable to read context image: ${imagePath}`, {
            imagePath,
            cause: error instanceof Error ? error.message : String(error),
        });
    }

    const base64 = buffer.toString('base64');
    const ext = extname(imagePath).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' :
        ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
            ext === '.webp' ? 'image/webp' : 'image/png';

    return { inlineData: { mimeType, data: base64 } };
}
