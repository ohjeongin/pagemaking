"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import * as fabric from 'fabric';
import Sidebar from './Sidebar';
import CanvasWorkarea from './CanvasWorkarea';
import PropertyPanel from './PropertyPanel'; // Added import for PropertyPanel
import { Save, Download, ArrowLeft } from 'lucide-react';
import { createBlockObjects, BlockType } from '@/utils/block-templates';
import { generateMarketingCopy } from '@/utils/ai-helper';
import { removeBackgroundSimulated } from '@/utils/image-processor';
import { getMockAIResult, createAISectionObjects } from '@/utils/ai-generator';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export interface SectionData {
    id: string;
    height: number;
}

const EditorContainer: React.FC = () => {
    const canvasesRef = useRef<Map<string, fabric.Canvas>>(new Map());
    const [sections, setSections] = useState<SectionData[]>([
        { id: `section-1`, height: 2000 },
        { id: `section-2`, height: 2000 },
        { id: `section-3`, height: 2000 },
    ]);
    const [activeSectionId, setActiveSectionId] = useState<string>(sections[0].id);
    const [activeObject, setActiveObject] = useState<fabric.Object | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    const getActiveCanvas = useCallback(() => {
        return canvasesRef.current.get(activeSectionId);
    }, [activeSectionId]);

    const handleCanvasReady = useCallback((id: string, fabricCanvas: fabric.Canvas) => {
        canvasesRef.current.set(id, fabricCanvas);

        const onSelect = () => {
            if (activeSectionId === id) {
                setActiveObject(fabricCanvas.getActiveObject() || null);
            }
        };

        const onCleared = () => {
            if (activeSectionId === id) setActiveObject(null);
        };

        fabricCanvas.on('selection:created', onSelect);
        fabricCanvas.on('selection:updated', onSelect);
        fabricCanvas.on('selection:cleared', onCleared);

        setIsLoaded(true);
    }, [activeSectionId]);

    const handleResizeSection = useCallback((id: string, newHeight: number) => {
        setSections(prev => prev.map(s => s.id === id ? { ...s, height: newHeight } : s));
    }, []);

    const sectionCounter = useRef(sections.length);

    const handleAddSection = useCallback((afterId: string) => {
        sectionCounter.current += 1;
        const newSection: SectionData = { id: `section-${Date.now()}`, height: 2000 };
        setSections(prev => {
            const idx = prev.findIndex(s => s.id === afterId);
            const newSections = [...prev];
            newSections.splice(idx + 1, 0, newSection);
            return newSections;
        });
        setActiveSectionId(newSection.id);
    }, []);

    const handleDeleteSection = useCallback((id: string) => {
        setSections(prev => {
            if (prev.length <= 1) return prev; // Don't delete the last section
            const idx = prev.findIndex(s => s.id === id);
            const newSections = prev.filter(s => s.id !== id);
            // Dispose fabric canvas
            const canvas = canvasesRef.current.get(id);
            if (canvas) {
                canvas.dispose();
                canvasesRef.current.delete(id);
            }
            // Select adjacent section
            const newActiveIdx = Math.min(idx, newSections.length - 1);
            setActiveSectionId(newSections[newActiveIdx].id);
            return newSections;
        });
    }, []);

    const handleDuplicateSection = useCallback((id: string) => {
        const sourceCanvas = canvasesRef.current.get(id);
        if (!sourceCanvas) return;

        const newId = `section-${Date.now()}`;
        const sourceSection = sections.find(s => s.id === id);
        if (!sourceSection) return;

        const newSection: SectionData = { id: newId, height: sourceSection.height };

        // Store serialized canvas data for later hydration
        const canvasJSON = sourceCanvas.toJSON();

        setSections(prev => {
            const idx = prev.findIndex(s => s.id === id);
            const newSections = [...prev];
            newSections.splice(idx + 1, 0, newSection);
            return newSections;
        });
        setActiveSectionId(newId);

        // Use setTimeout to wait for the new canvas to be created by the useEffect
        setTimeout(() => {
            const newCanvas = canvasesRef.current.get(newId);
            if (newCanvas && canvasJSON) {
                newCanvas.loadFromJSON(canvasJSON).then(() => {
                    newCanvas.requestRenderAll();
                });
            }
        }, 200);
    }, [sections]);

    const handleMoveSection = useCallback((id: string, direction: 'up' | 'down') => {
        setSections(prev => {
            const idx = prev.findIndex(s => s.id === id);
            if (direction === 'up' && idx <= 0) return prev;
            if (direction === 'down' && idx >= prev.length - 1) return prev;
            const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
            const newSections = [...prev];
            [newSections[idx], newSections[swapIdx]] = [newSections[swapIdx], newSections[idx]];
            return newSections;
        });
    }, []);

    const handleUpdate = useCallback(() => {
        const canvas = getActiveCanvas();
        if (canvas) canvas.requestRenderAll();
    }, [getActiveCanvas]);

    const handleDelete = useCallback(() => {
        const canvas = getActiveCanvas();
        if (canvas) {
            const activeObjects = canvas.getActiveObjects();
            if (activeObjects.length > 0) {
                activeObjects.forEach(obj => canvas.remove(obj));
                canvas.discardActiveObject();
                setActiveObject(null);
                canvas.requestRenderAll();
            }
        }
    }, [getActiveCanvas]);

    const handleGroup = useCallback(() => {
        const canvas = getActiveCanvas();
        if (!canvas) return;
        const activeObj = canvas.getActiveObject();

        if (activeObj && activeObj.type === 'activeSelection') {
            const activeSelection = activeObj as fabric.ActiveSelection;
            const group = new fabric.Group(activeSelection.getObjects());
            activeSelection.removeAll();
            canvas.remove(activeSelection);
            canvas.add(group);
            canvas.setActiveObject(group);
            canvas.requestRenderAll();
            setActiveObject(group);
        }
    }, [getActiveCanvas]);

    const handleUngroup = useCallback(() => {
        const canvas = getActiveCanvas();
        if (!canvas) return;
        const activeObj = canvas.getActiveObject();

        if (activeObj && activeObj.type === 'group') {
            const group = activeObj as fabric.Group;
            const items = group.removeAll();
            canvas.remove(group);
            const activeSelection = new fabric.ActiveSelection(items, { canvas });
            canvas.add(activeSelection);
            canvas.setActiveObject(activeSelection);
            canvas.requestRenderAll();
            setActiveObject(activeSelection);
        }
    }, [getActiveCanvas]);

    // Global Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return; // Do not trigger commands when typing in inputs
            }

            if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault();
                handleDelete();
            } else if ((e.ctrlKey || e.metaKey) && e.key === 'g' && !e.shiftKey) {
                e.preventDefault();
                handleGroup();
            } else if ((e.ctrlKey || e.metaKey) && e.key === 'g' && e.shiftKey) {
                e.preventDefault();
                handleUngroup();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleDelete, handleGroup, handleUngroup]);

    const addText = useCallback((fontFamily: string) => {
        const canvas = getActiveCanvas();
        if (!canvas) return;

        const text = new fabric.IText('텍스트를 입력하세요', {
            left: 100,
            top: 100,
            fontFamily: fontFamily,
            fontSize: 40,
            fill: '#111827',
            fontWeight: 'bold',
            cornerColor: '#10b981',
            cornerSize: 10,
            transparentCorners: false,
            borderColor: '#10b981',
            cornerStyle: 'circle',
        });

        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.requestRenderAll();
        setActiveObject(text);
    }, [getActiveCanvas]);

    const addShape = useCallback((type: 'rect' | 'circle' | 'line') => {
        const canvas = getActiveCanvas();
        if (!canvas) return;

        const commonProps = {
            left: 100,
            top: 100,
            fill: '#3b82f6',
            stroke: '#1e40af',
            strokeWidth: 2,
            cornerColor: '#10b981',
            cornerSize: 10,
            transparentCorners: false,
            borderColor: '#10b981',
            cornerStyle: 'circle' as const,
        };

        let shape: fabric.Object;
        if (type === 'rect') {
            shape = new fabric.Rect({ ...commonProps, width: 200, height: 150, rx: 8, ry: 8 });
        } else if (type === 'circle') {
            shape = new fabric.Circle({ ...commonProps, radius: 80 });
        } else {
            shape = new fabric.Line([100, 100, 400, 100], {
                ...commonProps,
                fill: undefined,
                stroke: '#1e40af',
                strokeWidth: 4,
            });
        }

        canvas.add(shape);
        canvas.setActiveObject(shape);
        canvas.requestRenderAll();
        setActiveObject(shape);
    }, [getActiveCanvas]);

    const handleAlignObject = useCallback((direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
        const canvas = getActiveCanvas();
        if (!canvas) return;
        const obj = canvas.getActiveObject();
        if (!obj) return;

        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();
        const objBound = obj.getBoundingRect();

        switch (direction) {
            case 'left': obj.set('left', 0); break;
            case 'center': obj.set('left', (canvasWidth - objBound.width) / 2); break;
            case 'right': obj.set('left', canvasWidth - objBound.width); break;
            case 'top': obj.set('top', 0); break;
            case 'middle': obj.set('top', (canvasHeight - objBound.height) / 2); break;
            case 'bottom': obj.set('top', canvasHeight - objBound.height); break;
        }
        obj.setCoords();
        canvas.requestRenderAll();
    }, [getActiveCanvas]);

    const handleAddAIImage = useCallback(async (prompt: string) => {
        const canvas = getActiveCanvas();
        if (!canvas) return;

        // Placeholder: In production, this would call an AI image generation API
        // For now, use a placeholder image from picsum with the prompt as seed
        const seed = prompt.replace(/\s+/g, '-').substring(0, 30);
        const url = `https://picsum.photos/seed/${seed}/400/400`;

        try {
            const img = await fabric.FabricImage.fromURL(url, { crossOrigin: 'anonymous' });
            img.set({
                left: 100,
                top: 100,
                cornerColor: '#10b981',
                cornerSize: 10,
                transparentCorners: false,
                borderColor: '#10b981',
                cornerStyle: 'circle',
            });
            img.scaleToWidth(300);
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.requestRenderAll();
            setActiveObject(img);
        } catch (error) {
            console.error('AI Image generation failed:', error);
        }
    }, [getActiveCanvas]);

    const addImages = useCallback((files: File[]) => {
        const canvas = getActiveCanvas();
        if (!canvas) return;

        files.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = async (f) => {
                const data = f.target?.result as string;

                const imgElement = new Image();
                imgElement.src = data;
                imgElement.onload = () => {
                    const fabricImg = new fabric.FabricImage(imgElement as HTMLImageElement, {
                        left: 50 + (index * 20),
                        top: 50 + (index * 20),
                        cornerColor: '#10b981',
                        cornerSize: 10,
                        transparentCorners: false,
                        borderColor: '#10b981',
                        cornerStyle: 'circle',
                    });

                    const maxWidth = canvas.getWidth() * 0.8;
                    if (fabricImg.width > maxWidth) {
                        fabricImg.scaleToWidth(maxWidth);
                    }

                    canvas.add(fabricImg);
                    canvas.setActiveObject(fabricImg);
                    canvas.requestRenderAll();
                    setActiveObject(fabricImg);
                };
            };
            reader.readAsDataURL(file);
        });
    }, [getActiveCanvas]);

    const downloadImage = async () => {
        try {
            const zip = new JSZip();
            const totalWidth = 860; // SmartStore standard width

            // Calculate total height across all dynamic sections
            let totalHeight = 0;
            sections.forEach(section => {
                totalHeight += section.height;
            });

            // Create offscreen merged canvas
            const mergedCanvasEl = document.createElement('canvas');
            mergedCanvasEl.width = totalWidth;
            mergedCanvasEl.height = totalHeight;

            // Draw all sections sequentially
            const ctx = mergedCanvasEl.getContext('2d');
            if (!ctx) throw new Error("Could not get 2D context");

            let currentDrawY = 0;
            const extractedTextNodes: string[] = [];

            // Sort sections by their display order (already in sections array order)
            for (const section of sections) {
                const canvas = canvasesRef.current.get(section.id);
                if (canvas) {
                    // Extract text for SEO HTML
                    const objects = canvas.getObjects();
                    for (const obj of objects) {
                        if (obj instanceof fabric.IText || obj instanceof fabric.Textbox || obj.type === 'i-text' || obj.type === 'textbox') {
                            const textContent = (obj as any).text;
                            if (textContent && textContent.trim() !== '') {
                                extractedTextNodes.push(textContent.trim());
                            }
                        }
                    }

                    // Render to image
                    canvas.discardActiveObject();
                    canvas.requestRenderAll();
                    const sectionDataUrl = canvas.toDataURL({ format: 'jpeg', quality: 1, multiplier: 1 });

                    // Create an image object and draw it onto the merged canvas context
                    const img = new Image();
                    img.src = sectionDataUrl;
                    await new Promise(resolve => {
                        img.onload = () => {
                            ctx.drawImage(img, 0, currentDrawY);
                            currentDrawY += section.height;
                            resolve(null);
                        };
                    });
                } else {
                    currentDrawY += section.height; // blank placeholder if missing
                }
            }

            // Slice the merged canvas if needed (5000px chunks) required by SmartStore
            const MAX_SLICE_HEIGHT = 5000;
            let currentSliceY = 0;
            let sliceIndex = 1;

            while (currentSliceY < totalHeight) {
                const sliceHeight = Math.min(MAX_SLICE_HEIGHT, totalHeight - currentSliceY);

                const sliceCanvasEl = document.createElement('canvas');
                sliceCanvasEl.width = totalWidth;
                sliceCanvasEl.height = sliceHeight;
                const sliceCtx = sliceCanvasEl.getContext('2d');

                if (sliceCtx) {
                    sliceCtx.drawImage(
                        mergedCanvasEl,
                        0, currentSliceY, totalWidth, sliceHeight, // Source rect
                        0, 0, totalWidth, sliceHeight // Dest rect
                    );

                    const sliceDataUrl = sliceCanvasEl.toDataURL('image/jpeg', 0.95);
                    const base64Data = sliceDataUrl.split(',')[1];
                    const filename = `slice_${String(sliceIndex).padStart(2, '0')}.jpg`;

                    zip.file(filename, base64Data, { base64: true });
                }

                currentSliceY += sliceHeight;
                sliceIndex++;
            }

            // Generate SEO HTML File wrapping texts in tags
            let htmlContent = `<!DOCTYPE html>\n<html lang="ko">\n<head>\n<meta charset="UTF-8">\n<title>SmartStore SEO Data</title>\n</head>\n<body>\n`;
            htmlContent += `  <!-- 이 영역은 네이버 스마트스토어 검색엔진 최적화(SEO)를 위해 추출된 텍스트입니다. HTML을 복사하여 상세페이지에 함께 붙여넣기 하세요. -->\n`;
            htmlContent += `  <div style="width: 1px; height: 1px; overflow: hidden; position: absolute; left: -9999px;">\n`;
            extractedTextNodes.forEach(text => {
                htmlContent += `    <p>${text.replace(/\n/g, '<br/>')}</p>\n`;
            });
            htmlContent += `  </div>\n</body>\n</html>`;

            zip.file("seo_text_data.html", htmlContent);

            // Export ZIP
            const blob = await zip.generateAsync({ type: "blob" });
            saveAs(blob, "naver_smartstore_assets.zip");

        } catch (error) {
            console.error("ZIP Generation Failed:", error);
            alert("이미지 처리 중 오류가 발생했습니다.");
        }
    };

    // Copy-Paste Support
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            const imageFiles: File[] = [];
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const blob = items[i].getAsFile();
                    if (blob) imageFiles.push(blob);
                }
            }

            if (imageFiles.length > 0) {
                addImages(imageFiles);
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [addImages]);

    const handleAddBlock = useCallback((type: BlockType) => {
        const canvas = getActiveCanvas();
        if (!canvas) return;
        const centerX = canvas.getWidth() / 2;
        const centerY = canvas.getHeight() / 2;

        const objects = createBlockObjects(type, centerX, centerY);
        if (objects.length > 0) {
            canvas.add(...objects);
            canvas.requestRenderAll();
            handleUpdate();
        }
    }, [getActiveCanvas, handleUpdate]);

    const handleGenerateCopy = useCallback(async (keywords: string) => {
        const canvas = getActiveCanvas();
        if (!canvas) return;
        const centerX = canvas.getWidth() / 2;
        const centerY = canvas.getHeight() / 2;

        try {
            const copy = await generateMarketingCopy(keywords);

            const title = new fabric.IText(copy.headline, {
                left: centerX,
                top: centerY - 50,
                fontSize: 48,
                fontFamily: 'Noto Sans KR',
                fontWeight: '900',
                fill: '#111827',
                originX: 'center',
            });

            const desc = new fabric.IText(copy.subtext, {
                left: centerX,
                top: centerY + 40,
                fontSize: 20,
                fontFamily: 'Noto Sans KR',
                fill: '#374151',
                textAlign: 'center',
                originX: 'center',
                width: 500,
            });

            canvas.add(title, desc);
            canvas.setActiveObject(title);
            canvas.requestRenderAll();
        } catch (error) {
            console.error("AI Copy generation failed:", error);
        }
    }, [getActiveCanvas]);

    const handleSetSolidBackground = (color: string) => {
        const canvas = getActiveCanvas();
        if (!canvas) return;

        // Remove AI background image if it exists
        const objects = canvas.getObjects();
        const bgObjects = objects.filter(obj => obj.get('name') === 'ai_background');
        bgObjects.forEach(obj => canvas.remove(obj));

        canvas.backgroundImage = undefined; // clear texture if any
        canvas.set('backgroundColor', color);
        canvas.requestRenderAll();
        handleUpdate();
    };

    const handleSetGradientBackground = (stops: { color: string, offset: number }[]) => {
        const canvas = getActiveCanvas();
        if (!canvas) return;

        // Remove AI background image if it exists
        const objects = canvas.getObjects();
        const bgObjects = objects.filter(obj => obj.get('name') === 'ai_background');
        bgObjects.forEach(obj => canvas.remove(obj));

        canvas.backgroundImage = undefined; // clear texture if any

        const gradient = new fabric.Gradient({
            type: 'linear',
            coords: { x1: 0, y1: 0, x2: canvas.getWidth(), y2: canvas.getHeight() },
            colorStops: stops
        });

        canvas.set('backgroundColor', gradient);
        canvas.requestRenderAll();
        handleUpdate();
    };

    const handleSetTextureBackground = async (url: string) => {
        const canvas = getActiveCanvas();
        if (!canvas) return;

        try {
            const img = await fabric.FabricImage.fromURL(url, {
                crossOrigin: 'anonymous'
            });

            const objects = canvas.getObjects();

            // Remove existing texture overlay
            const existingOverlay = objects.find(obj => obj.get('name') === 'texture_overlay');
            if (existingOverlay) {
                canvas.remove(existingOverlay);
            }

            // Remove AI background objects
            const bgObjects = objects.filter(obj => obj.get('name') === 'ai_background');
            bgObjects.forEach(obj => canvas.remove(obj));

            canvas.backgroundImage = undefined; // Clear any old backgroundImages

            const pattern = new fabric.Pattern({
                source: img.getElement() as HTMLImageElement,
                repeat: 'repeat'
            });

            const rect = new fabric.Rect({
                left: 0,
                top: 0,
                width: canvas.getWidth(),
                height: canvas.getHeight(),
                fill: pattern,
                selectable: false,
                evented: false,
                name: 'texture_overlay',
                globalCompositeOperation: 'overlay', // Blend with background color
                opacity: 0.7
            });

            canvas.add(rect);
            canvas.sendObjectToBack(rect); // Place it right on top of the backgroundColor

            canvas.requestRenderAll();
            handleUpdate();
        } catch (error) {
            console.error("Failed to load texture:", error);
        }
    };

    const handleGenerateBackground = async (style: string) => {
        const canvas = getActiveCanvas();
        if (!canvas) return;

        // Map styles to high-quality stock URLs
        const styleMap: Record<string, string> = {
            '감성 스튜디오 (기본)': 'https://images.pexels.com/photos/1036936/pexels-photo-1036936.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            '자연광 카페 (포근함)': 'https://images.pexels.com/photos/1126728/pexels-photo-1126728.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            '도심 테크 (현대적)': 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            '미니멀 인테리어 (깔끔함)': 'https://images.pexels.com/photos/276528/pexels-photo-276528.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            '대자연 풍경 (광활함)': 'https://images.pexels.com/photos/414171/pexels-photo-414171.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            '사이버펑크 네온 (화려함)': 'https://images.pexels.com/photos/5405463/pexels-photo-5405463.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            '초현실주의 아트 (창의적)': 'https://images.pexels.com/photos/2884150/pexels-photo-2884150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        };

        const imageUrl = styleMap[style] || styleMap['감성 스튜디오 (기본)'];

        try {
            const img = await fabric.FabricImage.fromURL(imageUrl, {
                crossOrigin: 'anonymous'
            });

            // Remove previous background objects
            const objects = canvas.getObjects();
            const bgObjects = objects.filter(obj => obj.get('name') === 'ai_background');
            bgObjects.forEach(obj => canvas.remove(obj));
            canvas.backgroundImage = undefined;

            // Scaled to cover canvas
            const canvasAspectRatio = canvas.getWidth() / canvas.getHeight();
            const imgAspectRatio = img.width / img.height;

            if (canvasAspectRatio > imgAspectRatio) {
                img.scaleToWidth(canvas.getWidth());
            } else {
                img.scaleToHeight(canvas.getHeight());
            }

            img.set({
                left: 0,
                top: 0,
                selectable: false,
                evented: false,
                opacity: 0, // Fade in effect start
                name: 'ai_background'
            });

            canvas.add(img);
            canvas.sendObjectToBack(img);

            // Simple fade animation simulation
            let opacity = 0;
            const animate = () => {
                opacity += 0.1;
                img.set('opacity', opacity);
                canvas.requestRenderAll();
                if (opacity < 1) requestAnimationFrame(animate);
            };
            animate();

        } catch (error) {
            console.error("AI Background generation failed:", error);
        }
    };

    const handleGenerateAIDetail = () => {
        const canvas = getActiveCanvas();
        if (!canvas) return;

        // 1. Clear existing user objects, keep background if needed, but for prototype let's clear all
        canvas.clear();
        canvas.set('backgroundColor', '#f1f5f9');

        const aiData = getMockAIResult();
        const canvasWidth = canvas.getWidth();
        let currentY = 0;

        // 2. Iterate and stack sections
        aiData.forEach(section => {
            const sectionObjects = createAISectionObjects(section, currentY, canvasWidth);

            // Find the background rect to know the height of this section (it's the first one pushed)
            const bgRect = sectionObjects.find(obj => obj.type === 'rect' && obj.width === canvasWidth);
            const sectionHeight = bgRect ? (bgRect.height || 600) : 600;

            canvas.add(...sectionObjects);
            currentY += sectionHeight;
        });

        // 3. Dynamically resize canvas height to fit all sections
        canvas.setDimensions({ width: canvas.getWidth(), height: currentY });
        canvas.requestRenderAll();
        handleUpdate();
    };

    return (
        <div className="flex flex-col w-full h-screen bg-zinc-50 overflow-hidden font-sans">
            {/* Header */}
            <header className="h-16 bg-zinc-900 text-white flex items-center justify-between px-6 shadow-md z-10">
                <div className="flex items-center gap-4">
                    <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-black">AI</div>
                        <h1 className="font-black text-sm tracking-tight">Advanced Canvas Editor</h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors flex items-center gap-2 border border-zinc-700 rounded-xl">
                        <Save size={14} /> 임시 저장
                    </button>
                    <button
                        onClick={downloadImage}
                        className="px-5 py-2 text-xs font-black bg-white text-zinc-900 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-lg flex items-center gap-2"
                    >
                        <Download size={14} /> 이미지로 저장하기
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex flex-1 min-h-0 overflow-hidden">
                <Sidebar
                    onAddText={addText}
                    onAddImages={addImages}
                    onAddBlock={handleAddBlock}
                    onGenerateCopy={handleGenerateCopy}
                    onGenerateBackground={handleGenerateBackground}
                    onSetSolidBackground={handleSetSolidBackground}
                    onSetTextureBackground={handleSetTextureBackground}
                    onSetGradientBackground={handleSetGradientBackground}
                    onGenerateAIDetail={handleGenerateAIDetail}
                    onAddShape={addShape}
                    onAddAIImage={handleAddAIImage}
                />
                <main className="flex-1 min-h-0 overflow-y-auto relative w-full h-full bg-zinc-100">
                    <CanvasWorkarea
                        sections={sections}
                        activeSectionId={activeSectionId}
                        onSectionSelect={setActiveSectionId}
                        onResizeSection={handleResizeSection}
                        onCanvasReady={handleCanvasReady}
                        onDropImages={addImages}
                        onAddSection={handleAddSection}
                        onDeleteSection={handleDeleteSection}
                        onDuplicateSection={handleDuplicateSection}
                        onMoveSection={handleMoveSection}
                    />
                </main>
                <PropertyPanel
                    canvas={getActiveCanvas() || null}
                    activeObject={activeObject}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    onGroup={handleGroup}
                    onUngroup={handleUngroup}
                    onAlignObject={handleAlignObject}
                />
            </div>
        </div>
    );
};

export default EditorContainer;
