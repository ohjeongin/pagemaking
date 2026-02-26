"use client";

import { useCallback, useState } from "react";

interface UploadedFile {
    file: File;
    preview: string;
    type: "main" | "sub";
}

export default function UploadSection() {
    const [isDragging, setIsDragging] = useState(false);
    const [files, setFiles] = useState<UploadedFile[]>([]);

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleFiles = (incomingFiles: File[]) => {
        const newFiles: UploadedFile[] = incomingFiles.map((file, index) => ({
            file,
            preview: URL.createObjectURL(file),
            type: files.length === 0 && index === 0 ? "main" : "sub",
        }));
        setFiles((prev) => [...prev, ...newFiles]);
    };

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) {
            handleFiles(Array.from(e.dataTransfer.files));
        }
    }, [files]);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFiles(Array.from(e.target.files));
        }
    };

    const mainImage = files.find((f) => f.type === "main");
    const subImages = files.filter((f) => f.type === "sub");

    return (
        <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">
                    상품 이미지를 업로드하세요
                </h2>
                <p className="mt-4 text-lg text-zinc-500 font-medium leading-relaxed">
                    대표 이미지와 상품의 특징이 잘 드러나는 서브 이미지들을 올려주세요. <br />
                    AI가 자동으로 내용을 분석합니다.
                </p>
            </div>

            <div className="relative group">
                <div
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    className={`relative flex min-h-[440px] flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed transition-all duration-300 shadow-sm ${isDragging
                            ? "border-emerald-500 bg-emerald-50/50 ring-8 ring-emerald-500/5 shadow-inner scale-[0.99]"
                            : "border-zinc-200 bg-zinc-50/50 hover:bg-white hover:border-emerald-400/50 hover:shadow-xl hover:shadow-emerald-500/5"
                        }`}
                >
                    <input
                        type="file"
                        multiple
                        onChange={onFileChange}
                        className="absolute inset-0 cursor-pointer opacity-0 z-10"
                        aria-label="File upload"
                    />
                    <div className="flex flex-col items-center gap-6 text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-white text-emerald-500 shadow-md border border-zinc-100 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-10 w-10"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-zinc-900 tracking-tight">여기에 파일을 끌어다 놓으세요</p>
                            <p className="mt-2 text-base text-zinc-500 font-semibold px-4 py-1.5 bg-zinc-100 rounded-full inline-block">
                                PNG, JPG, WEBP (최대 10MB)
                            </p>
                        </div>
                    </div>

                    <div className="mt-12 flex flex-wrap justify-center gap-4">
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-[11px] uppercase tracking-widest text-zinc-400 font-black">Main Image</span>
                            <div className="h-24 w-24 rounded-2xl bg-white border border-zinc-100 shadow-sm flex items-center justify-center overflow-hidden">
                                {mainImage ? (
                                    <img src={mainImage.preview} alt="Main preview" className="h-full w-full object-cover" />
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-zinc-300"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6.75a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6.75v11.25A1.5 1.5 0 003.75 18.75z" /></svg>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-[11px] uppercase tracking-widest text-zinc-400 font-black">Sub Details ({subImages.length})</span>
                            <div className="flex gap-2">
                                {subImages.slice(0, 2).map((img, i) => (
                                    <div key={i} className="h-24 w-24 rounded-2xl bg-white border border-zinc-100 shadow-sm overflow-hidden">
                                        <img src={img.preview} alt={`Sub ${i}`} className="h-full w-full object-cover" />
                                    </div>
                                ))}
                                <div className="h-24 w-24 rounded-2xl bg-white border border-zinc-100 shadow-sm border-dashed flex items-center justify-center text-zinc-300">
                                    <span className="text-2xl font-bold">+</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
