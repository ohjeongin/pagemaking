import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const productName = formData.get("productName") as string || "미지정 상품";
        const tone = formData.get("tone") as string || "감성적인";
        const mainImage = formData.get("mainImage") as File;

        if (!mainImage) {
            return NextResponse.json({ error: "대표 이미지가 필요합니다." }, { status: 400 });
        }

        // AI Simulation with specific Tone & Sections
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const aiResponse = {
            keywords: [productName, tone, "프리미엄", "네이버 추천"],
            sections: {
                intro: {
                    title: "INTRO: 마음을 사로잡는 첫인상",
                    content: `${tone} 분위기로 완성된 ${productName}을(를) 소개합니다. 공간의 가치를 더해주는 단 하나의 선택입니다.`,
                },
                features: {
                    title: "FEATURES: 특별한 이유",
                    content: "1. 독보적인 감각의 디자인\n2. 엄선된 소재의 견고함\n3. 일상의 편의를 생각한 기능성",
                },
                specs: {
                    title: "SPECIFICATION: 제품 상세 정보",
                    content: "소재: 프리미엄 에코 소재\n크기: 300 x 450 mm\n제조국: 대한민국",
                },
                shipping: {
                    title: "SHIPPING: 안전한 배송 약속",
                    content: "평일 오후 2시 이전 주문 시 당일 발송됩니다. 정성을 다해 안전하게 포장하여 보내드립니다.",
                }
            }
        };

        return NextResponse.json(aiResponse);
    } catch (error) {
        console.error("AI Generation Error:", error);
        return NextResponse.json({ error: "AI 분석 중 오류가 발생했습니다." }, { status: 500 });
    }
}
