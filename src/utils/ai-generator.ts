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

// Simulated AI JSON Response Pipeline Output
export const getMockAIResult = (): GeneratedSectionData[] => {
    return [
        {
            sectionType: 'Hero_Intro',
            toneAndManner: '감성적인',
            content: {
                headline: '매일 아침 다림질,\n이제 그만하세요.',
                subtext: '수면 부족 30대 직장인을 위한\n단 1초 완결 구김 방지 컬렉션',
                highlightWords: ['다림질', '1초 완결'],
            },
            suggestedImagePrompt: 'modern minimalist bedroom with soft morning light'
        },
        {
            sectionType: 'Solution_Feature',
            toneAndManner: '전문적인',
            content: {
                headline: '세탁 후 수축률 0.1% 미만',
                subtext: '수만 번의 건조기 테스트를 통과한\n에어로 쿨링 원단의 압도적 복원력',
                highlightWords: ['수축률 0.1%', '에어로 쿨링 원단'],
            },
        },
        {
            sectionType: 'Social_Proof',
            toneAndManner: '홈쇼핑스타일',
            content: {
                headline: '1,700개의 리뷰가 증명합니다',
                subtext: '“세탁기 돌리고 바로 입고 나갔는데\n새 옷 산 줄 알았대요!” - 네이버페이 구매자 김**님',
                highlightWords: ['1,700개', '새 옷 산 줄'],
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
