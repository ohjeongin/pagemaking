import sharp from "sharp";

interface CompositionOptions {
    width: number;
    backgroundColor: string;
}

interface ImageLayer {
    buffer: Buffer;
}

interface Section {
    title: string;
    content: string;
}

interface StructuredContent {
    intro: Section;
    features: Section;
    specs: Section;
    shipping: Section;
}

export async function composeDetailPage(
    images: ImageLayer[],
    sections: StructuredContent,
    options: CompositionOptions = { width: 860, backgroundColor: "#ffffff" }
) {
    const { width, backgroundColor } = options;

    // Helper to create text SVG as buffer
    const createTextSection = async (title: string, content: string, isSmall = false) => {
        const padding = 80;
        const contentLines = content.split('\n');
        const lineHeight = 40;
        const titleHeight = 60;
        const sectionHeight = titleHeight + (contentLines.length * lineHeight) + (padding * 2);

        const svg = `
      <svg width="${width}" height="${sectionHeight}" viewBox="0 0 ${width} ${sectionHeight}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${backgroundColor}"/>
        <text x="50%" y="${padding + 20}" font-family="Arial, sans-serif" font-size="24" font-weight="900" text-anchor="middle" fill="#10b981">${title.toUpperCase()}</text>
        ${contentLines.map((line, i) => `
          <text x="50%" y="${padding + titleHeight + (i * lineHeight)}" font-family="Arial, sans-serif" font-size="18" font-weight="bold" text-anchor="middle" fill="#3f3f46">${line}</text>
        `).join('')}
      </svg>
    `;
        return { buffer: Buffer.from(svg), height: sectionHeight };
    };

    // 1. Process all images to fixed 860px width
    const processedImages = await Promise.all(
        images.map(async (img) => {
            const metadata = await sharp(img.buffer).metadata();
            const height = Math.round((metadata.height || 0) * (width / (metadata.width || 1)));
            const resizedBuffer = await sharp(img.buffer)
                .resize({ width })
                .toBuffer();
            return { buffer: resizedBuffer, height };
        })
    );

    // 2. Prepare all layers (Interleaved)
    const layers: { buffer: Buffer, height: number }[] = [];

    // Layer Pattern: Intro Text -> Main Image -> Features Text -> Sub Images -> Specs Text -> Shipping Text
    layers.push(await createTextSection(sections.intro.title, sections.intro.content));
    if (processedImages[0]) layers.push(processedImages[0]);

    layers.push(createTextSection(sections.features.title, sections.features.content) as any);
    // Add remaining images
    for (let i = 1; i < processedImages.length; i++) {
        layers.push(processedImages[i]);
    }

    layers.push(await createTextSection(sections.specs.title, sections.specs.content));
    layers.push(await createTextSection(sections.shipping.title, sections.shipping.content));

    // Resolve all promises in layers
    const resolvedLayers = await Promise.all(
        layers.map(async (l) => (l instanceof Promise ? await l : l))
    );

    // 3. Calculate total height
    const totalHeight = resolvedLayers.reduce((sum, img) => sum + img.height, 0);

    // 4. Create canvas and composite
    let currentY = 0;
    const compositeArray = resolvedLayers.map((img) => {
        const item = {
            input: img.buffer,
            top: currentY,
            left: 0,
        };
        currentY += img.height;
        return item;
    });

    const finalImage = await sharp({
        create: {
            width,
            height: totalHeight,
            channels: 4,
            background: backgroundColor,
        },
    })
        .composite(compositeArray)
        .jpeg({ quality: 90 })
        .toBuffer();

    return finalImage;
}
