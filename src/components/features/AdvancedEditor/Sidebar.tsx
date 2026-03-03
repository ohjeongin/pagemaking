"use client";

import React, { useRef } from 'react';
import { Type, Image as ImageIcon, Sparkles, Plus, Layout, BringToFront, SendToBack, Square, Circle, Minus, Wand2 } from 'lucide-react';
import { BlockType } from '@/utils/block-templates';

interface SidebarProps {
    onAddText: (fontFamily: string) => void;
    onAddImages: (files: File[]) => void;
    onAddBlock: (type: BlockType) => void;
    onGenerateCopy: (keywords: string) => void;
    onGenerateBackground: (style: string) => void;
    onSetSolidBackground?: (color: string) => void;
    onSetTextureBackground?: (url: string) => void;
    onSetGradientBackground?: (stops: { color: string, offset: number }[]) => void;
    onGenerateAIDetail?: (keywords?: string) => void;
    onAddShape?: (type: 'rect' | 'circle' | 'line') => void;
    onAddAIImage?: (prompt: string) => void;
}

const FONTS = [
    { name: 'Pretendard', family: 'var(--font-noto-sans-kr)' },
    { name: 'Montserrat', family: 'var(--font-montserrat)' },
    { name: 'Noto Sans KR', family: 'Noto Sans KR' },
];

const Sidebar: React.FC<SidebarProps> = ({ onAddText, onAddImages, onAddBlock, onGenerateCopy, onGenerateBackground, onSetSolidBackground, onSetTextureBackground, onSetGradientBackground, onGenerateAIDetail, onAddShape, onAddAIImage }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [keywords, setKeywords] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [selectedStyle, setSelectedStyle] = React.useState('감성 스튜디오');
    const [customColor, setCustomColor] = React.useState('#fde047');
    const [aiImagePrompt, setAiImagePrompt] = React.useState('');
    const [aiImageLoading, setAiImageLoading] = React.useState(false);
    const [gradientStops, setGradientStops] = React.useState([
        { color: '#3b82f6', offset: 0 },
        { color: '#8b5cf6', offset: 1 }
    ]);

    const addGradientStop = () => {
        if (gradientStops.length >= 4) return;
        const lastStop = gradientStops[gradientStops.length - 1];
        setGradientStops([...gradientStops, { color: '#ffffff', offset: Math.min(1, lastStop.offset + 0.1) }]);
    };

    const removeGradientStop = (index: number) => {
        if (gradientStops.length <= 2) return;
        setGradientStops(gradientStops.filter((_, i) => i !== index));
    };

    const updateGradientStop = (index: number, key: 'color' | 'offset', value: string | number) => {
        const newStops = [...gradientStops];
        newStops[index] = { ...newStops[index], [key]: value };
        // Ensure offsets are reasonably sorted? The user can do what they want.
        setGradientStops(newStops);
    };

    const assetCategories = [
        { name: '미니멀 배경', items: ['https://picsum.photos/seed/minimal1/400/600', 'https://picsum.photos/seed/minimal2/400/600'] },
        { name: '자연 & 감성', items: ['https://picsum.photos/seed/nature1/400/600', 'https://picsum.photos/seed/nature2/400/600'] },
        { name: '기술 & 미래', items: ['https://picsum.photos/seed/tech1/400/600', 'https://picsum.photos/seed/tech2/400/600'] },
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onAddImages(Array.from(e.target.files));
        }
    };

    const handleAssetClick = async (url: string) => {
        try {
            // Use Image element with crossOrigin to avoid CORS issues
            const imgEl = new Image();
            imgEl.crossOrigin = 'anonymous';
            imgEl.src = url;
            await new Promise<void>((resolve, reject) => {
                imgEl.onload = () => resolve();
                imgEl.onerror = () => reject(new Error('Image load failed'));
            });

            const fabricImg = new (await import('fabric')).FabricImage(imgEl);
            // We need to pass it as a File to onAddImages, so let's create a canvas and export
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = imgEl.naturalWidth;
            tempCanvas.height = imgEl.naturalHeight;
            const ctx = tempCanvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(imgEl, 0, 0);
                tempCanvas.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], 'asset.jpg', { type: 'image/jpeg' });
                        onAddImages([file]);
                    }
                }, 'image/jpeg', 0.95);
            }
        } catch (error) {
            console.error('Failed to load asset:', error);
            // Fallback: try fetch with no-cors
            try {
                const response = await fetch(url);
                const blob = await response.blob();
                const file = new File([blob], 'asset.jpg', { type: 'image/jpeg' });
                onAddImages([file]);
            } catch (e2) {
                console.error('Fallback also failed:', e2);
            }
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onAddImages(Array.from(e.dataTransfer.files));
        }
    };

    return (
        <aside className="w-80 h-full glass-panel border-r border-zinc-100 flex flex-col shadow-sm">
            <div className="p-6 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
                {/* Basic Tools */}
                <section>
                    <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4">도구함</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => onAddText('var(--font-noto-sans-kr)')}
                            className="flex flex-col items-center justify-center p-4 rounded-2xl border border-zinc-100 bg-zinc-50 hover:bg-white hover:border-emerald-500 hover:text-emerald-600 transition-all group"
                        >
                            <Type className="mb-2 text-zinc-400 group-hover:text-emerald-500" size={24} />
                            <span className="text-xs font-bold">텍스트 추가</span>
                        </button>

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            className="flex flex-col items-center justify-center p-4 rounded-2xl border border-zinc-100 bg-zinc-50 hover:bg-white hover:border-emerald-500 hover:text-emerald-600 transition-all group"
                        >
                            <ImageIcon className="mb-2 text-zinc-400 group-hover:text-emerald-500" size={24} />
                            <span className="text-xs font-bold">이미지 업로드</span>
                            <input
                                type="file"
                                multiple
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                            />
                        </button>
                    </div>
                </section>

                {/* Shape Library */}
                <section>
                    <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4">도형 추가</h3>
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={() => onAddShape?.('rect')}
                            className="flex flex-col items-center justify-center p-3 rounded-2xl border border-zinc-100 bg-zinc-50 hover:bg-white hover:border-blue-500 hover:text-blue-600 transition-all group"
                        >
                            <Square className="mb-1.5 text-zinc-400 group-hover:text-blue-500" size={22} />
                            <span className="text-[10px] font-bold">사각형</span>
                        </button>
                        <button
                            onClick={() => onAddShape?.('circle')}
                            className="flex flex-col items-center justify-center p-3 rounded-2xl border border-zinc-100 bg-zinc-50 hover:bg-white hover:border-blue-500 hover:text-blue-600 transition-all group"
                        >
                            <Circle className="mb-1.5 text-zinc-400 group-hover:text-blue-500" size={22} />
                            <span className="text-[10px] font-bold">원형</span>
                        </button>
                        <button
                            onClick={() => onAddShape?.('line')}
                            className="flex flex-col items-center justify-center p-3 rounded-2xl border border-zinc-100 bg-zinc-50 hover:bg-white hover:border-blue-500 hover:text-blue-600 transition-all group"
                        >
                            <Minus className="mb-1.5 text-zinc-400 group-hover:text-blue-500" size={22} />
                            <span className="text-[10px] font-bold">선</span>
                        </button>
                    </div>
                </section>

                {/* AI Image Generation */}
                <section className="p-5 rounded-2xl bg-violet-50 border border-violet-100 space-y-4">
                    <div className="flex items-center gap-2">
                        <Wand2 size={16} className="text-violet-600" />
                        <span className="text-xs font-black text-violet-600 uppercase tracking-wider">AI 이미지 생성</span>
                    </div>
                    <textarea
                        value={aiImagePrompt}
                        onChange={(e) => setAiImagePrompt(e.target.value)}
                        placeholder="예: 홈 카페 인테리어, 상품 배경 이미지, 감성적 일러스트..."
                        className="w-full p-3 rounded-xl bg-white border border-violet-200 text-xs resize-none h-20 focus:outline-none focus:ring-2 focus:ring-violet-400 placeholder:text-violet-300"
                    />
                    <button
                        onClick={async () => {
                            if (!aiImagePrompt.trim() || !onAddAIImage) return;
                            setAiImageLoading(true);
                            await onAddAIImage(aiImagePrompt);
                            setAiImageLoading(false);
                        }}
                        disabled={aiImageLoading || !aiImagePrompt.trim()}
                        className="w-full py-2.5 rounded-xl bg-violet-500 text-white font-black text-xs hover:bg-violet-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <Wand2 size={14} />
                        {aiImageLoading ? '생성 중...' : 'AI 이미지 생성하기'}
                    </button>
                </section>

                {/* AI Copywriting */}
                <section className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-4">
                    <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-emerald-600" />
                        <h3 className="text-xs font-black text-emerald-900 uppercase tracking-widest">AI 카피 생성</h3>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-emerald-600/60 uppercase">상품 키워드</label>
                        <textarea
                            value={keywords}
                            onChange={(e) => setKeywords(e.target.value)}
                            placeholder="예: 미니멀한 원목 테이블, 신혼부부 추천"
                            className="w-full bg-white border border-emerald-100 rounded-xl py-2 px-3 text-xs font-medium focus:outline-none focus:border-emerald-500 min-h-[80px] resize-none"
                        />
                    </div>
                    <button
                        onClick={() => onGenerateCopy(keywords)}
                        disabled={!keywords || loading}
                        className="w-full py-3 rounded-xl bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-500/20 hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'AI 분석 중...' : '마케팅 문구 생성하기'}
                    </button>
                </section>

                {/* Fonts */}
                <section>
                    <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4">폰트 (상업용 무료)</h3>
                    <div className="space-y-2">
                        {FONTS.map((font) => (
                            <button
                                key={font.name}
                                onClick={() => onAddText(font.family)}
                                className="w-full p-4 rounded-xl border border-zinc-100 text-left hover:border-emerald-500 transition-all font-bold text-sm flex justify-between items-center group"
                                style={{ fontFamily: font.family }}
                            >
                                {font.name}
                                <Plus size={14} className="text-zinc-300 group-hover:text-emerald-500" />
                            </button>
                        ))}
                    </div>
                </section>

                {/* Asset Library */}
                <section>
                    <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4">에셋 라이브러리</h3>
                    <div className="space-y-6">
                        {assetCategories.map(category => (
                            <div key={category.name} className="space-y-3">
                                <p className="text-[11px] font-black text-zinc-900 ml-1">{category.name}</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {category.items.map((url, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleAssetClick(url)}
                                            className="aspect-[3/4] rounded-xl bg-zinc-100 border border-zinc-200 overflow-hidden cursor-pointer hover:border-emerald-500 transition-all shadow-sm"
                                        >
                                            <img src={url} alt="asset thumbnail" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Layout Blocks (G-Editor Skins) */}
                <section className="space-y-4">
                    <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">레이아웃 블록 (스킨)</h3>
                    <div className="space-y-2">
                        <button
                            onClick={() => onAddBlock('intro')}
                            className="w-full flex items-center gap-3 p-4 rounded-2xl bg-zinc-50 border border-zinc-100 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group"
                        >
                            <div className="p-2.5 rounded-xl bg-white shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                <Layout size={18} />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-black text-zinc-900">인트로 타이틀</p>
                                <p className="text-[10px] text-zinc-400 font-bold">감성적인 첫인상 블록</p>
                            </div>
                        </button>

                        <button
                            onClick={() => onAddBlock('specs')}
                            className="w-full flex items-center gap-3 p-4 rounded-2xl bg-zinc-50 border border-zinc-100 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group"
                        >
                            <div className="p-2.5 rounded-xl bg-white shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                <BringToFront size={18} />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-black text-zinc-900">주요 기능 설명</p>
                                <p className="text-[10px] text-zinc-400 font-bold">이미지 + 텍스트 그리드</p>
                            </div>
                        </button>

                        <button
                            onClick={() => onAddBlock('reviews')}
                            className="w-full flex items-center gap-3 p-4 rounded-2xl bg-zinc-50 border border-zinc-100 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group"
                        >
                            <div className="p-2.5 rounded-xl bg-white shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                <SendToBack size={18} />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-black text-zinc-900">구매 안내 / 리뷰</p>
                                <p className="text-[10px] text-zinc-400 font-bold">신뢰도를 높이는 안내 블록</p>
                            </div>
                        </button>

                        <button
                            onClick={() => onAddBlock('masonry')}
                            className="w-full flex items-center gap-3 p-4 rounded-2xl bg-zinc-50 border border-zinc-100 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group"
                        >
                            <div className="p-2.5 rounded-xl bg-white shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                <Layout size={18} className="rotate-90" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-black text-zinc-900">메이슨리 그리드</p>
                                <p className="text-[10px] text-zinc-400 font-bold">감각적인 이미지 배치</p>
                            </div>
                        </button>

                        <button
                            onClick={() => onAddBlock('info-table')}
                            className="w-full flex items-center gap-3 p-4 rounded-2xl bg-zinc-50 border border-zinc-100 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group"
                        >
                            <div className="p-2.5 rounded-xl bg-white shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                <Type size={18} />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-black text-zinc-900">안내 사항 표</p>
                                <p className="text-[10px] text-zinc-400 font-bold">상품 요약 정보 레이아웃</p>
                            </div>
                        </button>
                    </div>
                </section>

                {/* Background Styling */}
                <section className="p-5 rounded-2xl bg-zinc-900 text-white space-y-6">
                    <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-emerald-400" />
                        <h3 className="text-xs font-black uppercase tracking-widest">배경 스타일링</h3>
                    </div>

                    {/* 1. Solid Colors (HEX Custom) */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-500 uppercase">단색 배경 (Solid)</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={customColor}
                                onChange={(e) => setCustomColor(e.target.value)}
                                className="w-10 h-10 rounded cursor-pointer bg-zinc-800 border-0"
                            />
                            <div className="flex-1 flex bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden">
                                <span className="text-zinc-500 px-3 py-2 text-xs font-bold border-r border-zinc-700">HEX</span>
                                <input
                                    type="text"
                                    value={customColor}
                                    onChange={(e) => setCustomColor(e.target.value)}
                                    className="w-full bg-transparent px-3 py-2 text-xs font-bold focus:outline-none"
                                />
                            </div>
                            <button
                                onClick={() => onSetSolidBackground && onSetSolidBackground(customColor)}
                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
                            >
                                적용
                            </button>
                        </div>
                    </div>

                    {/* 2. Gradient Colors */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black text-zinc-500 uppercase">그라디언트 (Gradient)</label>
                            <button
                                onClick={addGradientStop}
                                disabled={gradientStops.length >= 4}
                                className="text-[9px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-50"
                            >
                                + 색상 추가
                            </button>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-2">
                                {gradientStops.map((stop, index) => (
                                    <div key={index} className="flex flex-col gap-1 bg-zinc-800/50 p-2 rounded-lg border border-zinc-800">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[9px] text-zinc-400 font-bold">Stop {index + 1}</span>
                                            {gradientStops.length > 2 && (
                                                <button onClick={() => removeGradientStop(index)} className="text-red-400 hover:text-red-300 text-[9px] font-bold">삭제</button>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input type="color" value={stop.color} onChange={(e) => updateGradientStop(index, 'color', e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-zinc-800 border-0" />
                                            <input type="text" value={stop.color} onChange={(e) => updateGradientStop(index, 'color', e.target.value)} className="w-20 bg-zinc-800 rounded border border-zinc-700 px-2 py-1.5 text-[10px] font-bold focus:outline-none" />
                                            <div className="flex-1 flex items-center gap-1">
                                                <input
                                                    type="range"
                                                    min="0" max="1" step="0.01"
                                                    value={stop.offset}
                                                    onChange={(e) => updateGradientStop(index, 'offset', parseFloat(e.target.value))}
                                                    className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                                                />
                                                <span className="text-[9px] text-zinc-500 w-6 text-right">{Math.round(stop.offset * 100)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => onSetGradientBackground && onSetGradientBackground(gradientStops)}
                                className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/20 shadow-md hover:scale-[1.02] text-white font-black text-xs rounded-xl transition-all flex items-center justify-center border-0"
                            >
                                그라디언트 생성/적용
                            </button>
                        </div>
                    </div>

                    {/* 3. Textures / Patterns */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-500 uppercase">질감 오버레이 (Overlay)</label>
                        <div className="grid grid-cols-4 gap-2">
                            {[
                                { name: '종이', url: 'https://www.transparenttextures.com/patterns/handmade-paper.png' },
                                { name: '콘크리트', url: 'https://www.transparenttextures.com/patterns/concrete-wall.png' },
                                { name: '대리석', url: 'https://www.transparenttextures.com/patterns/stardust.png' },
                                { name: '캔버스', url: 'https://www.transparenttextures.com/patterns/woven.png' }
                            ].map((texture, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => onSetTextureBackground && onSetTextureBackground(texture.url)}
                                    className="aspect-square rounded-md bg-zinc-800 border border-zinc-700 overflow-hidden hover:border-emerald-500 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 relative group"
                                    title={texture.name}
                                >
                                    <div className="w-full h-full bg-zinc-300 relative">
                                        <img src={texture.url} alt={texture.name} crossOrigin="anonymous" className="absolute top-0 left-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 mix-blend-multiply" />
                                    </div>
                                    <span className="absolute bottom-0 left-0 w-full text-[8px] font-bold bg-black/70 text-center py-0.5">{texture.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 4. AI Detail Page Prototype */}
                    <div className="space-y-4 pt-4 border-t border-zinc-800">
                        <label className="text-[12px] font-black text-blue-400 uppercase flex items-center gap-2">
                            <Sparkles size={14} /> ⚡ AI 기획 봇 (프로토타입)
                        </label>

                        <p className="text-[10px] text-zinc-400 leading-relaxed font-semibold">
                            입력된 리뷰 데이터 분석을 기반으로,<br />
                            <span className="text-blue-300">훅(Hook) → 특장점 → 고객 리뷰</span> 순서의 특화 상세페이지 레이아웃을 자동 생성합니다.
                        </p>

                        <button
                            onClick={() => onGenerateAIDetail && onGenerateAIDetail()}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 shadow-blue-500/20 shadow-lg text-white font-black text-xs rounded-xl transition-all flex items-center justify-center gap-2 border-0 group"
                        >
                            <Sparkles size={14} className="group-hover:animate-pulse" />
                            고객 리뷰 기반 전체 레이아웃 자동 생성
                        </button>
                    </div>

                    {/* 5. AI Background Generation */}
                    <div className="space-y-3 pt-4 border-t border-zinc-800">
                        <label className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1">
                            <Sparkles size={12} /> AI 배경 생성 (스마트 가이드)
                        </label>

                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            className="h-16 rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-800/50 flex flex-col items-center justify-center text-center group hover:border-emerald-500 transition-all cursor-pointer"
                        >
                            <p className="text-[10px] font-bold text-zinc-400">희망 이미지 드래그 (선택)</p>
                        </div>

                        <select
                            value={selectedStyle}
                            onChange={(e) => setSelectedStyle(e.target.value)}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 px-3 text-xs font-bold focus:outline-none focus:border-emerald-500"
                        >
                            <option>감성 스튜디오 (기본)</option>
                            <option>자연광 카페 (포근함)</option>
                            <option>도심 테크 (현대적)</option>
                            <option>미니멀 인테리어 (깔끔함)</option>
                            <option>대자연 풍경 (광활함)</option>
                            <option>사이버펑크 네온 (화려함)</option>
                            <option>초현실주의 아트 (창의적)</option>
                        </select>

                        <button
                            onClick={() => onGenerateBackground(selectedStyle)}
                            className="w-full py-2.5 rounded-xl bg-emerald-500 text-white font-black text-xs hover:bg-emerald-600 transition-all"
                        >
                            AI 배경 생성하기
                        </button>
                    </div>
                </section>
            </div>

            {/* AI Assistant (One-click layout) */}
            <div className="p-6 bg-zinc-50/50 border-t border-zinc-100 mt-auto">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-3">
                    <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-emerald-600" />
                        <span className="text-xs font-black text-emerald-600 uppercase tracking-wider">AI 레이아웃 자동 생성</span>
                    </div>
                    <p className="text-[10px] text-emerald-600/60">키워드를 기반으로 Hero, 기능소개, 리뷰 섹션을 한번에 자동 생성합니다.</p>
                    <button
                        onClick={() => onGenerateAIDetail?.(keywords || undefined)}
                        disabled={!keywords.trim()}
                        className="w-full py-3 rounded-xl bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus size={14} /> AI 결과물 생성하기
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
