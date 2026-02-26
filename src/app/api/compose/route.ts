import { NextRequest, NextResponse } from "next/server";
import { composeDetailPage } from "@/lib/image-composer";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const mainImage = formData.get("mainImage") as File;
        const subImages = formData.getAll("subImages") as File[];
        const sectionsRaw = formData.get("sections") as string;

        if (!mainImage || !sectionsRaw) {
            return NextResponse.json({ error: "필수 정보가 부족합니다." }, { status: 400 });
        }

        const sections = JSON.parse(sectionsRaw);
        const mainBuffer = Buffer.from(await mainImage.arrayBuffer());
        const subBuffers = await Promise.all(
            subImages.map(async (file) => Buffer.from(await file.arrayBuffer()))
        );

        const imageLayers = [
            { buffer: mainBuffer },
            ...subBuffers.map(buffer => ({ buffer })),
        ];

        const finalImageBuffer = await composeDetailPage(imageLayers, sections, {
            width: 860,
            backgroundColor: "#ffffff",
        });

        return new NextResponse(new Uint8Array(finalImageBuffer), {
            headers: {
                "Content-Type": "image/jpeg",
                "Content-Disposition": 'attachment; filename="smartstore_detail_page.jpg"',
            },
        });
    } catch (error) {
        console.error("Composition Error:", error);
        return NextResponse.json({ error: "이미지 합성 중 오류가 발생했습니다." }, { status: 500 });
    }
}
