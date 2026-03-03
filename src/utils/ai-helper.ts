/**
 * AI Helper Utility for G-Editor Features
 */

export interface MarketingCopy {
    headline: string;
    subtext: string;
    cta: string;
}

// Template bank for more varied, keyword-aware copy generation
const HEADLINE_TEMPLATES = [
    (kw: string) => `[BEST] ${kw}, 당신의 일상을 업그레이드하다`,
    (kw: string) => `${kw} 하나면 충분합니다`,
    (kw: string) => `왜 ${kw}인지, 직접 경험해보세요`,
    (kw: string) => `${kw}, 생활의 품격을 바꾸다`,
    (kw: string) => `지금 가장 핫한 ${kw} 🔥`,
];

const SUBTEXT_TEMPLATES = [
    (kw: string, sub: string) => `${sub}의 완벽한 조화로 완성된 프리미엄 ${kw}. 직접 그 차이를 경험해보세요.`,
    (kw: string, sub: string) => `${kw}만의 특별한 ${sub}로 매일이 달라집니다. 이미 10만 고객이 선택했습니다.`,
    (kw: string, sub: string) => `감각적인 ${sub} 디자인과 실용성을 동시에. ${kw}의 새로운 기준을 만나보세요.`,
];

const CTA_TEMPLATES = [
    '지금 바로 구매하기',
    '한정 수량 특가 보러가기 →',
    '자세히 보기',
    '오늘만 이 가격! 구매하기',
];

export const generateMarketingCopy = async (keywords: string): Promise<MarketingCopy> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const keywordList = keywords.split(',').map(k => k.trim()).filter(Boolean);
    const mainKeyword = keywordList[0] || '우리의 상품';
    const subKeywords = keywordList.slice(1).join(', ') || '품질, 디자인';

    // Use keyword length as a simple deterministic seed for variety
    const seed = mainKeyword.length + subKeywords.length;
    const headlineIdx = seed % HEADLINE_TEMPLATES.length;
    const subtextIdx = seed % SUBTEXT_TEMPLATES.length;
    const ctaIdx = seed % CTA_TEMPLATES.length;

    return {
        headline: HEADLINE_TEMPLATES[headlineIdx](mainKeyword),
        subtext: SUBTEXT_TEMPLATES[subtextIdx](mainKeyword, subKeywords),
        cta: CTA_TEMPLATES[ctaIdx],
    };
};

export const suggestBackgroundStyles = (productType: string) => {
    const styles = [
        { name: '감성 스튜디오', prompt: 'minimal studio with soft lighting' },
        { name: '자연광 카페', prompt: 'bright cafe interior with sunlight' },
        { name: '도심 테크', prompt: 'modern tech showroom, neon accents' },
        { name: '미니멀 인테리어', prompt: 'organized modern home living room' }
    ];
    return styles;
};
