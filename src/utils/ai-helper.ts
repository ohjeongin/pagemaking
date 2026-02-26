/**
 * AI Helper Utility for G-Editor Features
 */

export interface MarketingCopy {
    headline: string;
    subtext: string;
    cta: string;
}

export const generateMarketingCopy = async (keywords: string): Promise<MarketingCopy> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock logic: In a real scenario, this would call an OpenAI/Gemini API
    const keywordList = keywords.split(',').map(k => k.trim());
    const mainKeyword = keywordList[0] || '우리의 상품';

    return {
        headline: `[PICK] ${mainKeyword}, 생활의 품격을 바꾸다`,
        subtext: `${keywords}의 완벽한 조화로 완성된 프리미엄 디자인. 직접 그 차이를 경험해보세요.`,
        cta: '지금 바로 구매하기'
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
