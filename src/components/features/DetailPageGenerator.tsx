"use client";

import { useCallback, useState } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
    rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import GeneratorUI from "./GeneratorUI";
import { GripVertical, X, CheckCircle2 } from "lucide-react";

interface UploadedFile {
    id: string;
    file: File;
    preview: string;
    type: "main" | "sub";
}

function SortableImage({ img, onRemove }: { img: UploadedFile, onRemove: (id: string) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: img.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="group relative aspect-square overflow-hidden rounded-3xl border border-zinc-100 bg-white shadow-sm transition-all hover:shadow-xl hover:border-emerald-500/20"
        >
            <img
                src={img.preview}
                alt="Upload"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div
                {...attributes}
                {...listeners}
                className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur rounded-lg shadow-sm border border-zinc-100 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <GripVertical size={16} className="text-zinc-400" />
            </div>
            <button
                onClick={() => onRemove(img.id)}
                className="absolute bottom-2 right-2 p-1.5 bg-white/90 backdrop-blur rounded-lg shadow-sm border border-zinc-100 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:bg-red-50"
            >
                <X size={16} />
            </button>
            {img.type === "main" && (
                <div className="absolute top-3 left-3 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-black text-white shadow-md flex items-center gap-1.5">
                    <CheckCircle2 size={10} />
                    대표 이미지
                </div>
            )}
        </div>
    );
}

export default function DetailPageGenerator() {
    const [isDragging, setIsDragging] = useState(false);
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [productName, setProductName] = useState("");
    const [tone, setTone] = useState("감성적인");

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleFiles = (incomingFiles: File[]) => {
        const newFiles: UploadedFile[] = incomingFiles.map((file) => ({
            id: Math.random().toString(36).substring(7),
            file,
            preview: URL.createObjectURL(file),
            type: files.length === 0 ? "main" : "sub",
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

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setFiles((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const removeFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const mainImage = files[0]; // Logic: always use the first one as main
    const subImages = files.slice(1);

    return (
        <>
            <section id="upload-section" className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">
                        1. 상품 정보 및 이미지 업로드
                    </h2>
                    <p className="mt-4 text-lg text-zinc-500 font-medium leading-relaxed">
                        상품명과 원하는 분위기를 선택하고 사진을 올려주세요. <br />
                        첫 번째 이미지가 대표 이미지가 됩니다.
                    </p>
                </div>

                {/* Product Info Inputs */}
                <div className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-200/20">
                    <div className="space-y-3">
                        <label className="text-[12px] font-black text-zinc-400 uppercase tracking-widest ml-1">상품명</label>
                        <input
                            type="text"
                            placeholder="예: 수제 원목 도마"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            className="w-full h-16 px-6 rounded-2xl bg-zinc-50 border border-zinc-100 focus:bg-white focus:border-emerald-500 transition-all outline-none font-bold placeholder:text-zinc-300"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[12px] font-black text-zinc-400 uppercase tracking-widest ml-1">톤앤매너</label>
                        <div className="flex gap-2 p-1.5 rounded-2xl bg-zinc-50 border border-zinc-100">
                            {["감성적인", "신뢰감 있는", "미니멀한", "강렬한"].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTone(t)}
                                    className={`flex-1 h-12 rounded-xl text-sm font-black transition-all ${tone === t
                                            ? "bg-white text-emerald-600 shadow-sm border border-emerald-100"
                                            : "text-zinc-400 hover:text-zinc-600"
                                        }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="relative group">
                    <div
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        className={`relative flex min-h-[400px] flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed transition-all duration-300 shadow-sm ${isDragging
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
                    </div>
                </div>
            </section>

            {files.length > 0 && (
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 border-t border-zinc-100">
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-zinc-900 tracking-tight">2. 이미지 순서 변경 (드래그)</h3>
                            <p className="text-sm text-zinc-500 font-medium mt-1">드래그하여 상세페이지에 들어갈 순서를 직접 정해 보세요.</p>
                        </div>
                        <button onClick={() => setFiles([])} className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors">
                            전체 삭제
                        </button>
                    </div>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={files.map(f => f.id)}
                            strategy={rectSortingStrategy}
                        >
                            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                {files.map((img) => (
                                    <SortableImage key={img.id} img={img} onRemove={removeFile} />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
            )}

            <GeneratorUI
                files={files.map(f => f.file)}
                productName={productName}
                tone={tone}
            />
        </>
    );
}
