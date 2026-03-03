import * as fabric from 'fabric';

export type SectionType = 'Hero_Intro' | 'Solution_Feature' | 'Social_Proof';

export interface GeneratedSectionData {
    sectionType: SectionType;
    toneAndManner: '감성적인' | '전문적인' | '홈쇼핑스타일';
    content: {
        headline: string;
        subtext: string;
        highlightWords: string[];
    };
    suggestedImagePrompt?: string;
}

export interface ReviewInsight {
    productId: string;
    targetAudience: string;
    buyingTriggers: string[];
    painPoints: string[];
}

// Keyword-aware AI content generation
export const getMockAIResult = (keywords?: string): GeneratedSectionData[] => {
    const keywordList = (keywords || '').split(',').map(k => k.trim()).filter(Boolean);
    const mainKeyword = keywordList[0] || '프리미엄 제품';
    const subKeywords = keywordList.slice(1).join(', ') || '품질, 디자인';

    return [
        {
            sectionType: 'Hero_Intro',
            toneAndManner: '감성적인',
            content: {
                headline: `${mainKeyword},\n당신의 일상을 바꾸다.`,
                subtext: `${subKeywords}의 완벽한 조화로 완성된\n프리미엄 ${mainKeyword} 컬렉션`,
                highlightWords: [mainKeyword, '일상을 바꾸다'],
            },
            suggestedImagePrompt: `modern minimalist ${mainKeyword} product photography`
        },
        {
            sectionType: 'Solution_Feature',
            toneAndManner: '전문적인',
            content: {
                headline: `왜 ${mainKeyword}인가요?`,
                subtext: `${subKeywords}을 위해 설계된\n차별화된 기술력과 압도적 품질`,
                highlightWords: [mainKeyword, subKeywords],
            },
        },
        {
            sectionType: 'Social_Proof',
            toneAndManner: '홈쇼핑스타일',
            content: {
                headline: `${mainKeyword} 실사용 후기`,
                subtext: `"${mainKeyword} 써보니까 진짜 달라요!\n다른 제품 못 쓰겠어요" - 네이버페이 구매자 김**님`,
                highlightWords: [`${mainKeyword}`, '진짜 달라요'],
            },
        }
    ];
};

export const createAISectionObjects = (section: GeneratedSectionData, startY: number, canvasWidth: number): fabric.Object[] => {
    const centerX = canvasWidth / 2;
    const objects: fabric.Object[] = [];

    switch (section.sectionType) {
        case 'Hero_Intro': {
            // Dark elegant background plate
            objects.push(new fabric.Rect({
                left: 0, top: startY, width: canvasWidth, height: 600,
                fill: '#18181b', selectable: false,
            }));

            objects.push(new fabric.IText(section.content.headline, {
                left: centerX, top: startY + 200,
                fontSize: 64, fontFamily: 'Noto Sans KR', fontWeight: '900', fill: '#ffffff',
                textAlign: 'center', originX: 'center', lineHeight: 1.3
            }));

            objects.push(new fabric.IText(section.content.subtext, {
                left: centerX, top: startY + 400,
                fontSize: 24, fontFamily: 'Noto Sans KR', fontWeight: '400', fill: '#a1a1aa',
                textAlign: 'center', originX: 'center', lineHeight: 1.6
            }));
            break;
        }

        case 'Solution_Feature': {
            // Light Minimalist plate
            objects.push(new fabric.Rect({
                left: 0, top: startY, width: canvasWidth, height: 500,
                fill: '#f8fafc', selectable: false,
            }));

            // Accent Bar
            objects.push(new fabric.Rect({
                left: centerX - 30, top: startY + 100, width: 60, height: 6, fill: '#10b981', originX: 'center'
            }));

            objects.push(new fabric.IText(section.content.headline, {
                left: centerX, top: startY + 160,
                fontSize: 48, fontFamily: 'Noto Sans KR', fontWeight: '800', fill: '#0f172a',
                textAlign: 'center', originX: 'center'
            }));

            objects.push(new fabric.IText(section.content.subtext, {
                left: centerX, top: startY + 280,
                fontSize: 22, fontFamily: 'Noto Sans KR', fontWeight: '500', fill: '#475569',
                textAlign: 'center', originX: 'center', lineHeight: 1.7
            }));
            break;
        }

        case 'Social_Proof': {
            // Soft warm plate
            objects.push(new fabric.Rect({
                left: 0, top: startY, width: canvasWidth, height: 500,
                fill: '#fffbeb', selectable: false,
            }));

            // Review Card background
            objects.push(new fabric.Rect({
                left: centerX, top: startY + 280, width: 800, height: 200,
                fill: '#ffffff', stroke: '#fef3c7', strokeWidth: 2, rx: 16, ry: 16,
                originX: 'center', originY: 'center', shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.05)', blur: 20, offsetY: 10 })
            }));

            objects.push(new fabric.IText(section.content.headline, {
                left: centerX, top: startY + 100,
                fontSize: 36, fontFamily: 'Noto Sans KR', fontWeight: '900', fill: '#d97706',
                textAlign: 'center', originX: 'center'
            }));

            objects.push(new fabric.IText(section.content.subtext, {
                left: centerX, top: startY + 280,
                fontSize: 26, fontFamily: 'Noto Sans KR', fontWeight: '700', fill: '#1e293b',
                fontStyle: 'italic', textAlign: 'center', originX: 'center', originY: 'center', lineHeight: 1.5
            }));
            break;
        }
    }

    return objects;
};
