/**
 * Block Templates for G-Editor Layout System
 */

import * as fabric from 'fabric';

export type BlockType = 'intro' | 'specs' | 'reviews' | 'masonry' | 'info-table';

export const createBlockObjects = (type: BlockType, centerX: number, centerY: number): fabric.Object[] => {
    switch (type) {
        case 'intro': {
            const rect = new fabric.Rect({
                left: centerX - 300,
                top: centerY - 200,
                width: 600,
                height: 400,
                fill: '#f8fafc',
                rx: 20,
                ry: 20,
            });
            const text = new fabric.IText('브랜드 타이틀\nBrand Headline', {
                left: centerX,
                top: centerY,
                fontSize: 60,
                fontFamily: 'Noto Sans KR',
                fontWeight: '900',
                fill: '#111827',
                textAlign: 'center',
                originX: 'center',
                originY: 'center',
            });
            return [rect, text];
        }
        case 'specs': {
            const title = new fabric.IText('PRODUCT FEATURES', {
                left: centerX,
                top: centerY - 100,
                fontSize: 24,
                fontFamily: 'Montserrat',
                fontWeight: '900',
                fill: '#10b981',
                originX: 'center',
            });
            const desc = new fabric.IText('제품의 특징을\n한 눈에 보여주세요', {
                left: centerX,
                top: centerY,
                fontSize: 32,
                fontFamily: 'Noto Sans KR',
                fontWeight: '500',
                fill: '#374151',
                textAlign: 'center',
                originX: 'center',
            });
            return [title, desc];
        }
        case 'reviews': {
            const quote = new fabric.IText('"" 진짜 최고의 품질입니다 ""', {
                left: centerX,
                top: centerY,
                fontSize: 32,
                fontFamily: 'Noto Sans KR',
                fontWeight: '500',
                fill: '#64748b',
                fontStyle: 'italic',
                textAlign: 'center',
                originX: 'center',
            });
            const author = new fabric.IText('- 네이버 페이 구매 고객 -', {
                left: centerX,
                top: centerY + 60,
                fontSize: 14,
                fontFamily: 'Noto Sans KR',
                fill: '#94a3b8',
                originX: 'center',
            });
            return [quote, author];
        }
        case 'masonry': {
            // Simulated 2x2 grid
            const items = [];
            const size = 180;
            const gap = 20;
            for (let i = 0; i < 2; i++) {
                for (let j = 0; j < 2; j++) {
                    items.push(new fabric.Rect({
                        left: centerX - size - gap / 2 + (j * (size + gap)),
                        top: centerY - size - gap / 2 + (i * (size + gap)),
                        width: size,
                        height: size,
                        fill: '#f1f5f9',
                        rx: 10,
                        ry: 10,
                    }));
                }
            }
            return items;
        }
        case 'info-table': {
            const tableBg = new fabric.Rect({
                left: centerX - 250,
                top: centerY - 150,
                width: 500,
                height: 300,
                fill: '#ffffff',
                stroke: '#e2e8f0',
                strokeWidth: 1,
            });
            const text = new fabric.IText('CHECKLIST / INFO\n\n상품명: 프리미엄 에디션\n소재: 원목 / 스테인리스\n제조: 대한민국', {
                left: centerX - 220,
                top: centerY - 120,
                fontSize: 16,
                fontFamily: 'Noto Sans KR',
                fill: '#475569',
                lineHeight: 1.8,
            });
            return [tableBg, text];
        }
        default:
            return [];
    }
};
