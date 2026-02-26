"use client";

import React, { useEffect, useRef, useState, createRef } from 'react';
import * as fabric from 'fabric';
import { SectionData } from './EditorContainer';
import { Copy, Plus, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';

interface CanvasWorkareaProps {
    sections: SectionData[];
    activeSectionId: string;
    onSectionSelect: (id: string) => void;
    onResizeSection: (id: string, newHeight: number) => void;
    onCanvasReady?: (id: string, canvas: fabric.Canvas) => void;
    onDropImages?: (files: File[]) => void;
    onAddSection?: (afterId: string) => void;
    onDeleteSection?: (id: string) => void;
    onDuplicateSection?: (id: string) => void;
    onMoveSection?: (id: string, direction: 'up' | 'down') => void;
}

const CanvasWorkarea: React.FC<CanvasWorkareaProps> = ({ sections, activeSectionId, onSectionSelect, onResizeSection, onCanvasReady, onDropImages, onAddSection, onDeleteSection, onDuplicateSection, onMoveSection }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});
    const fabricCanvasRefs = useRef<{ [key: string]: fabric.Canvas }>({});

    // Initialize Fabric Canvases on mount and section changes
    useEffect(() => {
        if (!containerRef.current) return;
        const containerWidth = containerRef.current.clientWidth;

        sections.forEach(section => {
            const canvasEl = canvasRefs.current[section.id];
            if (!fabricCanvasRefs.current[section.id] && canvasEl) {
                const fabricCanvas = new fabric.Canvas(canvasEl, {
                    width: 860, // Fixed Naver SmartStore Width
                    height: section.height,
                    backgroundColor: '#ffffff',
                    preserveObjectStacking: true,
                });

                fabricCanvasRefs.current[section.id] = fabricCanvas;
                if (onCanvasReady) {
                    onCanvasReady(section.id, fabricCanvas);
                }
            } else if (fabricCanvasRefs.current[section.id]) {
                const canvas = fabricCanvasRefs.current[section.id];
                if (canvas.getHeight() !== section.height) {
                    canvas.setDimensions({ width: canvas.getWidth(), height: section.height });
                    canvas.requestRenderAll();
                }
            }
        });

        // Cleanup removed sections
        Object.keys(fabricCanvasRefs.current).forEach(id => {
            if (!sections.find(s => s.id === id)) {
                fabricCanvasRefs.current[id].dispose();
                delete fabricCanvasRefs.current[id];
            }
        });
    }, [sections, onCanvasReady]);

    useEffect(() => {
        if (!containerRef.current) return;

        const handleDrop = (e: DragEvent) => {
            e.preventDefault();
            if (e.dataTransfer?.files && e.dataTransfer.files.length > 0 && onDropImages) {
                onDropImages(Array.from(e.dataTransfer.files));
            }
        };

        const handleDragOver = (e: DragEvent) => e.preventDefault();

        const container = containerRef.current;
        container.addEventListener('drop', handleDrop);
        container.addEventListener('dragover', handleDragOver);

        return () => {
            container.removeEventListener('drop', handleDrop);
            container.removeEventListener('dragover', handleDragOver);
        };
    }, [onDropImages]);

    return (
        <div ref={containerRef} className="relative w-full min-h-full bg-zinc-100 flex flex-col items-center py-10 gap-8">
            {sections.map((section, index) => (
                <div key={section.id} className="flex flex-col items-center flex-shrink-0">
                    {/* Section Toolbar (Miricanvas Style) */}
                    <div className={`w-[860px] flex items-center justify-between px-3 py-1.5 mb-1 rounded-t-lg transition-all duration-200 ${activeSectionId === section.id ? 'opacity-100' : 'opacity-0 hover:opacity-60'}`}>
                        <span className="text-xs font-bold text-zinc-500 select-none">
                            {index + 1} 페이지
                        </span>
                        <div className="flex items-center gap-0.5">
                            <button
                                onClick={() => onDuplicateSection?.(section.id)}
                                className="p-1.5 rounded-md hover:bg-white hover:shadow-sm text-zinc-400 hover:text-blue-600 transition-all" title="복제"
                            >
                                <Copy size={15} />
                            </button>
                            <button
                                onClick={() => onAddSection?.(section.id)}
                                className="p-1.5 rounded-md hover:bg-white hover:shadow-sm text-zinc-400 hover:text-emerald-600 transition-all" title="아래에 새 페이지 추가"
                            >
                                <Plus size={15} />
                            </button>
                            <div className="w-px h-4 bg-zinc-300 mx-1" />
                            <button
                                onClick={() => onMoveSection?.(section.id, 'up')}
                                disabled={index === 0}
                                className="p-1.5 rounded-md hover:bg-white hover:shadow-sm text-zinc-400 hover:text-zinc-700 transition-all disabled:opacity-20 disabled:cursor-not-allowed" title="위로"
                            >
                                <ArrowUp size={15} />
                            </button>
                            <button
                                onClick={() => onMoveSection?.(section.id, 'down')}
                                disabled={index === sections.length - 1}
                                className="p-1.5 rounded-md hover:bg-white hover:shadow-sm text-zinc-400 hover:text-zinc-700 transition-all disabled:opacity-20 disabled:cursor-not-allowed" title="아래로"
                            >
                                <ArrowDown size={15} />
                            </button>
                            <div className="w-px h-4 bg-zinc-300 mx-1" />
                            <button
                                onClick={() => onDeleteSection?.(section.id)}
                                disabled={sections.length <= 1}
                                className="p-1.5 rounded-md hover:bg-white hover:shadow-sm text-zinc-400 hover:text-red-500 transition-all disabled:opacity-20 disabled:cursor-not-allowed" title="삭제"
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    </div>
                    {/* Section Canvas Block */}
                    <div
                        id={`section-wrapper-${section.id}`}
                        style={{ height: section.height }}
                        className={`relative flex flex-col items-center shadow-2xl transition-colors duration-200 border-[3px] rounded-lg overflow-hidden bg-white w-[860px] ${activeSectionId === section.id ? 'border-blue-500 shadow-blue-500/20' : 'border-transparent shadow-zinc-300/50 hover:border-zinc-300'}`}
                    >
                        <div className="cursor-pointer" onClick={() => onSectionSelect(section.id)}>
                            <canvas ref={el => { canvasRefs.current[section.id] = el; }} />
                        </div>
                        {/* Bottom Resize Handle */}
                        <div
                            className="w-full h-8 cursor-ns-resize flex items-center justify-center bg-transparent group absolute bottom-0 left-0 right-0 hover:bg-zinc-200/50 transition-colors z-50"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                onSectionSelect(section.id);

                                const startY = e.clientY;
                                const startHeight = section.height;
                                const canvas = fabricCanvasRefs.current[section.id];

                                const wrapper = document.getElementById(`section-wrapper-${section.id}`);
                                const indicator = document.getElementById(`section-indicator-${section.id}`);

                                const handleMouseMove = (mouseEvent: MouseEvent) => {
                                    const deltaY = mouseEvent.clientY - startY;
                                    const newHeight = Math.max(200, startHeight + deltaY);

                                    // Direct DOM manipulation for 60fps lag-free resizing
                                    if (wrapper) {
                                        wrapper.style.height = `${newHeight}px`;
                                    }
                                    if (indicator) {
                                        indicator.innerText = `↕ ${Math.round(newHeight)}px`;
                                    }
                                };

                                const handleMouseUp = (mouseEvent: MouseEvent) => {
                                    const deltaY = mouseEvent.clientY - startY;
                                    const newHeight = Math.max(200, startHeight + deltaY);

                                    // Finally commit to Fabric and React state
                                    if (canvas) {
                                        canvas.setDimensions({ width: canvas.getWidth(), height: newHeight });
                                        canvas.requestRenderAll();
                                    }
                                    onResizeSection(section.id, newHeight);
                                    window.removeEventListener('mousemove', handleMouseMove);
                                    window.removeEventListener('mouseup', handleMouseUp);
                                };

                                window.addEventListener('mousemove', handleMouseMove);
                                window.addEventListener('mouseup', handleMouseUp);
                            }}
                        >
                            {/* Thin indicator line that appears on hover */}
                            <div className="w-16 h-1 rounded-full bg-zinc-300 group-hover:bg-blue-500 transition-colors pointer-events-none" />
                            <span id={`section-indicator-${section.id}`} className="absolute right-4 text-[11px] text-zinc-500 font-bold font-mono select-none opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none drop-shadow-sm">↕ {Math.round(section.height)}px</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CanvasWorkarea;
