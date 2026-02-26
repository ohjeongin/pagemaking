"use client";

import { useState, useEffect } from "react";
import { Edit3, Check, Save } from "lucide-react";

interface AISection {
    title: string;
    content: string;
}

interface AIResponse {
    keywords: string[];
    sections: {
        intro: AISection;
        features: AISection;
        specs: AISection;
        shipping: AISection;
    };
}

interface GeneratorUIProps {
    files: File[];
    productName: string;
    tone: string;
}

export default function GeneratorUI({ files, productName, tone }: GeneratorUIProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiData, setAiData] = useState<AIResponse | null>(null);
    const [compositeUrl, setCompositeUrl] = useState<string | null>(null);
    const [editingKey, setEditingKey] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (files.length === 0) {
            alert("먼저 이미지를 업로드해주세요.");
            return;
        }

        setIsGenerating(true);
        try {
            const formData = new FormData();
            formData.append("productName", productName);
            formData.append("tone", tone);

            files.forEach((file, i) => {
                if (i === 0) formData.append("mainImage", file);
                else formData.append("subImages", file);
            });

            // 1. Get Structured AI Copywriting
            const analysisRes = await fetch("/api/generate", {
                method: "POST",
                body: formData,
            });
            const data = await analysisRes.json();
            setAiData(data);

            // 2. Initial Composition (Will be rerun after edits if needed)
            await fetchComposition(data);

        } catch (error) {
            console.error("Generation failed", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const fetchComposition = async (currentData: AIResponse) => {
        const formData = new FormData();
        files.forEach((file, i) => {
            if (i === 0) formData.append("mainImage", file);
            else formData.append("subImages", file);
        });
        formData.append("sections", JSON.stringify(currentData.sections));

        const composeRes = await fetch("/api/compose", {
            method: "POST",
            body: formData,
        });
        const blob = await composeRes.blob();
        const url = URL.createObjectURL(blob);
        setCompositeUrl(url);
    };

    const updateSection = (key: keyof AIResponse["sections"], field: "title" | "content", value: string) => {
        if (!aiData) return;
        const updated = {
            ...aiData,
            sections: {
                ...aiData.sections,
                [key]: { ...aiData.sections[key], [field]: value }
            }
        };
        setAiData(updated);
    };

    const handleInlineEditComplete = () => {
        setEditingKey(null);
        if (aiData) fetchComposition(aiData); // Re-generate composite image after edit
    };

    return (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-t border-zinc-100 bg-zinc-50/30">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <div className="space-y-10">
                    <div>
                        <h2 className="text-4xl font-black text-zinc-900 tracking-tight leading-tight">3. 상세페이지 <br />AI 마법 도구</h2>
                        <p className="mt-4 text-zinc-500 font-medium text-lg leading-relaxed">
                            설정된 정보와 이미지를 바탕으로 AI가 섹션별 최적화 시안을 생성합니다. <br />
                            <span className="text-emerald-600 font-bold">텍스트를 클릭하면 바로 수정할 수 있습니다.</span>
                        </p>
                    </div>

                    <div className="space-y-8">
                        <div className="rounded-[2.5rem] bg-white border border-zinc-200/60 p-8 shadow-xl shadow-zinc-200/20">
                            <div className="flex items-center justify-between mb-8">
                                <h4 className="text-[12px] font-black text-emerald-600 uppercase tracking-[0.2em]">Structured AI Content</h4>
                                {aiData && <span className="text-[10px] font-bold text-zinc-400">클릭하여 내용 수정</span>}
                            </div>

                            <div className="space-y-6">
                                {aiData ? (
                                    Object.entries(aiData.sections).map(([key, section]) => (
                                        <div key={key} className="group relative p-6 rounded-2xl bg-zinc-50 border border-zinc-100 hover:border-emerald-200 transition-colors">
                                            {editingKey === key ? (
                                                <div className="space-y-3">
                                                    <input
                                                        className="w-full bg-white font-black text-sm text-zinc-900 p-2 rounded-lg border border-zinc-200 outline-none focus:border-emerald-500"
                                                        value={section.title}
                                                        onChange={(e) => updateSection(key as any, "title", e.target.value)}
                                                    />
                                                    <textarea
                                                        className="w-full bg-white font-medium text-sm text-zinc-600 p-2 rounded-lg border border-zinc-200 outline-none focus:border-emerald-500 min-h-[80px]"
                                                        value={section.content}
                                                        onChange={(e) => updateSection(key as any, "content", e.target.value)}
                                                    />
                                                    <button
                                                        onClick={handleInlineEditComplete}
                                                        className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-[11px] font-black shadow-sm"
                                                    >
                                                        <Check size={14} /> 저장 후 다시 합성
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="cursor-pointer" onClick={() => setEditingKey(key)}>
                                                    <span className="text-[10px] text-emerald-600 font-black uppercase tracking-wider block mb-2">{section.title}</span>
                                                    <p className="text-sm text-zinc-700 leading-relaxed font-bold">
                                                        {section.content}
                                                    </p>
                                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Edit3 size={14} className="text-zinc-300" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10">
                                        <p className="text-zinc-300 font-bold">이미지 업로드 후 생성하기를 눌러주세요.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            className="w-full h-20 rounded-[2rem] bg-zinc-900 flex items-center justify-center gap-4 text-xl font-black text-white transition-all hover:bg-emerald-500 shadow-2xl shadow-zinc-900/20 active:scale-95 disabled:bg-zinc-300"
                            disabled={isGenerating}
                        >
                            {isGenerating ? (
                                <>
                                    <div className="h-6 w-6 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>섹션별 문구 생성 중...</span>
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
                                    <span>860px 커스텀 상세페이지 생성</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="relative group">
                    <div className="absolute -inset-4 bg-emerald-500/10 blur-[80px] opacity-50 group-hover:opacity-100 transition duration-1000" />
                    <div className="relative aspect-[2/3] w-full max-w-md mx-auto rounded-[3rem] bg-white border border-zinc-200/50 overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] border-2">
                        <div className="p-4 h-full flex flex-col">
                            <div className="flex-1 flex flex-col items-center justify-center text-center overflow-auto scrollbar-hide">
                                {isGenerating ? (
                                    <div className="p-8 space-y-6 w-full">
                                        <div className="h-4 w-3/4 mx-auto bg-zinc-100 rounded-full animate-pulse" />
                                        <div className="h-80 w-full bg-zinc-50 rounded-[2.5rem] animate-pulse border border-zinc-100" />
                                        <div className="h-3 w-full bg-zinc-100 rounded-full animate-pulse" />
                                        <div className="h-40 w-full bg-zinc-50 rounded-[2.5rem] animate-pulse border border-zinc-100" />
                                    </div>
                                ) : compositeUrl ? (
                                    <img src={compositeUrl} alt="Composite result" className="w-full object-contain shadow-inner" />
                                ) : (
                                    <div className="space-y-6">
                                        <div className="h-24 w-24 mx-auto rounded-[2rem] bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-200 shadow-inner">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6.75a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6.75v11.25A1.5 1.5 0 003.75 18.75z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-xl font-black text-zinc-900">결과물이 여기에 표시됩니다</p>
                                            <p className="mt-2 text-sm text-zinc-400 font-bold uppercase tracking-widest">Fixed 860px Preview</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {compositeUrl && (
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 rounded-full bg-zinc-900 border border-zinc-800 shadow-2xl">
                                <a href={compositeUrl} download="smartstore_detail_page.jpg" className="text-white hover:text-emerald-400 transition-colors flex items-center gap-2 font-bold text-sm">
                                    <Save size={18} />
                                    이미지로 저장하기
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
