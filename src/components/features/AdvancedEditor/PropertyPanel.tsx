"use client";

import React, { useState, useEffect } from 'react';
import * as fabric from 'fabric';
import {
    BringToFront,
    SendToBack,
    Trash2,
    Type,
    Maximize,
    Palette,
    Layers,
    Sparkles
} from 'lucide-react';

interface PropertyPanelProps {
    canvas: fabric.Canvas | null;
    activeObject: fabric.Object | null;
    onUpdate: () => void;
    onDelete: () => void;
    onGroup?: () => void;
    onUngroup?: () => void;
}

const PropertyPanel: React.FC<PropertyPanelProps> = ({ canvas, activeObject, onUpdate, onDelete, onGroup, onUngroup }) => {
    const [localFontSize, setLocalFontSize] = useState(40);
    const [localOpacity, setLocalOpacity] = useState(1);
    const [localColor, setLocalColor] = useState('#111827');

    // Sync state when activeObject changes
    useEffect(() => {
        if (activeObject) {
            setLocalFontSize(Math.round(activeObject.get('fontSize') || 40));
            setLocalOpacity(activeObject.get('opacity') || 1);
            setLocalColor(activeObject.get('fill') as string || '#111827');
        }
    }, [activeObject]);

    if (!activeObject || !canvas) {
        return (
            <div className="w-80 h-full bg-white border-l border-zinc-100 flex flex-col p-6 items-center justify-center text-center">
                <Layers size={48} className="text-zinc-100 mb-4" />
                <p className="text-zinc-400 font-bold text-sm">수정할 요소를 <br />선택해주세요</p>
            </div>
        );
    }

    const isText = activeObject instanceof fabric.IText;
    const isImage = activeObject instanceof fabric.FabricImage;

    const handleFontSizeChange = (value: number) => {
        setLocalFontSize(value);
        activeObject.set('fontSize', value);
        // Reset scaling to ensure font size is absolute and prevent giant text
        activeObject.set({ scaleX: 1, scaleY: 1 });
        onUpdate();
    };

    const handleOpacityChange = (value: number) => {
        setLocalOpacity(value);
        activeObject.set('opacity', value);
        onUpdate();
    };

    const handleColorChange = (color: string) => {
        setLocalColor(color);
        activeObject.set('fill', color);
        onUpdate();
    };

    const applyFilter = (filterType: string, value: number) => {
        if (!isImage || !(activeObject instanceof fabric.FabricImage)) return;

        const filters = (activeObject as fabric.FabricImage).filters || [];
        let filter;

        if (filterType === 'Brightness') {
            filter = filters.find(f => f.type === 'Brightness') as any;
            if (!filter) {
                filter = new fabric.filters.Brightness({ brightness: value });
                filters.push(filter);
            } else {
                filter.brightness = value;
            }
        } else if (filterType === 'Contrast') {
            filter = filters.find(f => f.type === 'Contrast') as any;
            if (!filter) {
                filter = new fabric.filters.Contrast({ contrast: value });
                filters.push(filter);
            } else {
                filter.contrast = value;
            }
        }

        (activeObject as fabric.FabricImage).applyFilters();
        onUpdate();
    };

    const addBackground = (color: string) => {
        canvas.set('backgroundColor', color);
        canvas.requestRenderAll();
        onUpdate();
    };

    const bringToFront = () => {
        canvas.bringObjectToFront(activeObject);
        onUpdate();
    };

    const sendToBack = () => {
        canvas.sendObjectToBack(activeObject);
        onUpdate();
    };

    const handleRemoveBackground = async () => {
        if (!isImage || !(activeObject instanceof fabric.FabricImage)) return;

        try {
            // Apply a visual hint that it's processing
            activeObject.set('opacity', 0.5);
            canvas.requestRenderAll();

            // Simulate AI work
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Implementation of simulated "Nukki"
            // In a real app we'd swap the src or apply a mask
            activeObject.set({
                opacity: 1,
                stroke: '#10b981',
                strokeWidth: 2,
            });

            canvas.requestRenderAll();
            onUpdate();
        } catch (error) {
            console.error("Background removal failed:", error);
        }
    };

    return (
        <div className="w-80 h-full glass-panel border-l border-zinc-100 flex flex-col p-6 space-y-8 overflow-y-auto shadow-sm">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">속성 편집</h3>
                <button onClick={onDelete} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={16} />
                </button>
            </div>

            {/* Layer Control */}
            <div className="space-y-4">
                <h4 className="text-xs font-black text-zinc-900 border-l-4 border-emerald-500 pl-2">정렬 및 그룹</h4>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={bringToFront} className="flex items-center justify-center gap-2 p-3 rounded-xl border border-zinc-100 hover:border-emerald-500 hover:text-emerald-600 transition-all text-xs font-bold shadow-sm">
                        <BringToFront size={14} /> 맨 위로
                    </button>
                    <button onClick={sendToBack} className="flex items-center justify-center gap-2 p-3 rounded-xl border border-zinc-100 hover:border-emerald-500 hover:text-emerald-600 transition-all text-xs font-bold shadow-sm">
                        <SendToBack size={14} /> 맨 아래로
                    </button>
                    {activeObject.type && ['activeselection', 'ActiveSelection'].includes(activeObject.type) && onGroup && (
                        <button onClick={onGroup} className="col-span-2 flex items-center justify-center gap-2 p-3 rounded-xl bg-zinc-900 border border-zinc-900 text-white hover:bg-zinc-800 transition-all text-xs font-bold shadow-sm">
                            <Layers size={14} /> 그룹으로 묶기 (Ctrl+G)
                        </button>
                    )}
                    {activeObject.type && ['group', 'Group'].includes(activeObject.type) && onUngroup && (
                        <button onClick={onUngroup} className="col-span-2 flex items-center justify-center gap-2 p-3 rounded-xl bg-white border border-zinc-200 text-zinc-900 hover:border-emerald-500 hover:text-emerald-600 transition-all text-xs font-bold shadow-sm">
                            <Layers size={14} /> 그룹 해제하기 (Ctrl+Shift+G)
                        </button>
                    )}
                </div>
            </div>

            {/* Text Specific Controls */}
            {isText && (
                <div className="space-y-6">
                    <h4 className="text-xs font-black text-zinc-900 border-l-4 border-emerald-500 pl-2">텍스트 스타일</h4>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black text-zinc-400 uppercase">글자 크기</label>
                            <span className="text-xs font-black text-emerald-500">{localFontSize}px</span>
                        </div>
                        <input
                            type="range"
                            min="10"
                            max="200"
                            value={localFontSize}
                            onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-400 uppercase">글자 색상</label>
                        <div className="flex gap-2 flex-wrap mb-3">
                            {['#111827', '#ffffff', '#10b981', '#ef4444', '#3b82f6', '#f59e0b'].map(color => (
                                <button
                                    key={color}
                                    onClick={() => handleColorChange(color)}
                                    className={`w-8 h-8 rounded-full border shadow-sm transition-all hover:scale-110 ${localColor === color ? 'border-emerald-500 scale-110' : 'border-zinc-200'}`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                            <input
                                type="color"
                                value={localColor}
                                onChange={(e) => handleColorChange(e.target.value)}
                                className="w-8 h-8 rounded-lg border-0 p-0 cursor-pointer overflow-hidden"
                            />
                            <div className="flex-1">
                                <p className="text-[9px] font-black text-zinc-400 uppercase mb-1">커스텀 HEX</p>
                                <input
                                    type="text"
                                    value={localColor.toUpperCase()}
                                    onChange={(e) => handleColorChange(e.target.value)}
                                    className="w-full bg-transparent border-none text-[11px] font-bold text-zinc-900 focus:outline-none p-0"
                                    placeholder="#000000"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Specific Controls */}
            {isImage && (
                <div className="space-y-6">
                    <h4 className="text-xs font-black text-zinc-900 border-l-4 border-emerald-500 pl-2">이미지 보정</h4>

                    <div className="space-y-4">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-400 uppercase">투명도 ({Math.round(localOpacity * 100)}%)</label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={localOpacity}
                                onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
                                className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-400 uppercase">밝기 조절</label>
                            <input
                                type="range"
                                min="-1"
                                max="1"
                                step="0.05"
                                value="0"
                                onChange={(e) => applyFilter('Brightness', parseFloat(e.target.value))}
                                className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-400 uppercase">대비 조절</label>
                            <input
                                type="range"
                                min="-1"
                                max="1"
                                step="0.05"
                                value="0"
                                onChange={(e) => applyFilter('Contrast', parseFloat(e.target.value))}
                                className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles size={14} className="text-emerald-600" />
                            <span className="text-xs font-black text-emerald-600 uppercase tracking-wider">AI 이미지 도구</span>
                        </div>
                        <button
                            onClick={handleRemoveBackground}
                            className="w-full py-2.5 rounded-xl bg-white border border-zinc-200 text-zinc-900 font-bold text-[11px] hover:border-emerald-500 hover:text-emerald-600 transition-all mb-2 flex items-center justify-center gap-2"
                        >
                            배경 제거 (누끼)
                        </button>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-zinc-400 uppercase ml-1">배경 교체</label>
                            <div className="flex gap-2">
                                {['#ffffff', '#f3f4f6', '#111827', '#10b981'].map(color => (
                                    <button
                                        key={color}
                                        onClick={() => addBackground(color)}
                                        className="flex-1 h-8 rounded-lg border border-zinc-200 hover:scale-110 transition-all shadow-sm"
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Color Themes */}
            <div className="space-y-4">
                <h4 className="text-xs font-black text-zinc-900 border-l-4 border-emerald-500 pl-2">전체 컬러 테마 (원클릭)</h4>
                <div className="max-h-[300px] overflow-y-auto pr-1 space-y-4 styled-scrollbar">
                    {/* Basic */}
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">베이직 & 모던</p>
                        <div className="grid grid-cols-1 gap-2">
                            {[
                                { name: '블랙 앤 화이트', primary: '#111827', secondary: '#f3f4f6', bg: '#ffffff' },
                                { name: '모던 다크스틸', primary: '#f9fafb', secondary: '#374151', bg: '#1f2937' },
                                { name: '클래식 모노크롬', primary: '#ffffff', secondary: '#52525b', bg: '#000000' },
                            ].map((theme, idx) => (
                                <button
                                    key={`basic-${idx}`}
                                    onClick={() => {
                                        canvas.set('backgroundColor', theme.bg);
                                        canvas.getObjects().forEach(obj => {
                                            if (obj instanceof fabric.IText) {
                                                obj.set('fill', theme.primary);
                                            } else if (obj instanceof fabric.Rect) {
                                                obj.set('fill', theme.secondary);
                                            }
                                        });
                                        canvas.requestRenderAll();
                                        onUpdate();
                                    }}
                                    className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-100 bg-white hover:border-emerald-500 hover:shadow-sm transition-all group"
                                >
                                    <span className="text-[11px] font-bold text-zinc-600 group-hover:text-zinc-900 line-clamp-1">{theme.name}</span>
                                    <div className="flex gap-1.5 p-1 bg-zinc-50 rounded-lg shrink-0">
                                        <div className="w-4 h-4 rounded-md shadow-sm border border-zinc-200" style={{ backgroundColor: theme.primary }} title="Text Color" />
                                        <div className="w-4 h-4 rounded-md shadow-sm border border-zinc-200" style={{ backgroundColor: theme.bg }} title="Background" />
                                        <div className="w-4 h-4 rounded-md shadow-sm border border-zinc-200" style={{ backgroundColor: theme.secondary }} title="Accent" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Vivid & High Contrast */}
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">비비드 & 고대비</p>
                        <div className="grid grid-cols-1 gap-2">
                            {[
                                { name: '네온 사이버펑크', primary: '#22d3ee', secondary: '#f472b6', bg: '#0f172a' },
                                { name: '일렉트릭 팝', primary: '#ffffff', secondary: '#ec4899', bg: '#8b5cf6' },
                                { name: '썸머 스플래시', primary: '#ffffff', secondary: '#fbbf24', bg: '#06b6d4' },
                                { name: '애플 민트', primary: '#ffffff', secondary: '#34d399', bg: '#059669' },
                            ].map((theme, idx) => (
                                <button
                                    key={`vivid-${idx}`}
                                    onClick={() => {
                                        canvas.set('backgroundColor', theme.bg);
                                        canvas.getObjects().forEach(obj => {
                                            if (obj instanceof fabric.IText) {
                                                obj.set('fill', theme.primary);
                                            } else if (obj instanceof fabric.Rect) {
                                                obj.set('fill', theme.secondary);
                                            }
                                        });
                                        canvas.requestRenderAll();
                                        onUpdate();
                                    }}
                                    className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-100 bg-white hover:border-emerald-500 hover:shadow-sm transition-all group"
                                >
                                    <span className="text-[11px] font-bold text-zinc-600 group-hover:text-zinc-900 line-clamp-1">{theme.name}</span>
                                    <div className="flex gap-1.5 p-1 bg-zinc-50 rounded-lg shrink-0">
                                        <div className="w-4 h-4 rounded-md shadow-sm border border-zinc-200" style={{ backgroundColor: theme.primary }} title="Text Color" />
                                        <div className="w-4 h-4 rounded-md shadow-sm border border-zinc-200" style={{ backgroundColor: theme.bg }} title="Background" />
                                        <div className="w-4 h-4 rounded-md shadow-sm border border-zinc-200" style={{ backgroundColor: theme.secondary }} title="Accent" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Pastel & Soft */}
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">파스텔 & 소프트</p>
                        <div className="grid grid-cols-1 gap-2">
                            {[
                                { name: '스위트 피치', primary: '#be123c', secondary: '#ffe4e6', bg: '#fff1f2' },
                                { name: '라벤더 블룸', primary: '#6d28d9', secondary: '#ede9fe', bg: '#f5f3ff' },
                                { name: '크림 바닐라', primary: '#b45309', secondary: '#fef3c7', bg: '#fefce8' },
                                { name: '클라우드 스카이', primary: '#1d4ed8', secondary: '#e0e7ff', bg: '#eff6ff' },
                            ].map((theme, idx) => (
                                <button
                                    key={`pastel-${idx}`}
                                    onClick={() => {
                                        canvas.set('backgroundColor', theme.bg);
                                        canvas.getObjects().forEach(obj => {
                                            if (obj instanceof fabric.IText) {
                                                obj.set('fill', theme.primary);
                                            } else if (obj instanceof fabric.Rect) {
                                                obj.set('fill', theme.secondary);
                                            }
                                        });
                                        canvas.requestRenderAll();
                                        onUpdate();
                                    }}
                                    className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-100 bg-white hover:border-emerald-500 hover:shadow-sm transition-all group"
                                >
                                    <span className="text-[11px] font-bold text-zinc-600 group-hover:text-zinc-900 line-clamp-1">{theme.name}</span>
                                    <div className="flex gap-1.5 p-1 bg-zinc-50 rounded-lg shrink-0">
                                        <div className="w-4 h-4 rounded-md shadow-sm border border-zinc-200" style={{ backgroundColor: theme.primary }} title="Text Color" />
                                        <div className="w-4 h-4 rounded-md shadow-sm border border-zinc-200" style={{ backgroundColor: theme.bg }} title="Background" />
                                        <div className="w-4 h-4 rounded-md shadow-sm border border-zinc-200" style={{ backgroundColor: theme.secondary }} title="Accent" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyPanel;
