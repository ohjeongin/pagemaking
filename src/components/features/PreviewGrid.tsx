"use client";

export default function PreviewGrid() {
    const mockImages = [
        { id: 1, type: "main", src: "https://via.placeholder.com/300?text=Main+Image" },
        { id: 2, type: "sub", src: "https://via.placeholder.com/300?text=Sub+1" },
        { id: 3, type: "sub", src: "https://via.placeholder.com/300?text=Sub+2" },
    ];

    return (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 border-t border-zinc-100">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-bold text-zinc-900 tracking-tight">업로드된 이미지</h3>
                    <p className="text-sm text-zinc-500 font-medium mt-1">총 3장의 이미지가 준비되었습니다.</p>
                </div>
                <button className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors">
                    전체 삭제
                </button>
            </div>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {mockImages.map((img) => (
                    <div key={img.id} className="group relative aspect-square overflow-hidden rounded-3xl border border-zinc-100 bg-white shadow-sm transition-all hover:shadow-xl hover:border-emerald-500/20">
                        <img src={img.src} alt={`Upload ${img.id}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-zinc-900/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center gap-2">
                            <button className="p-3 rounded-full bg-white text-red-500 shadow-xl hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        {img.type === "main" && (
                            <div className="absolute top-3 left-3 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-black text-white shadow-md">
                                REPRESENTATIVE
                            </div>
                        )}
                    </div>
                ))}
                <button className="flex aspect-square flex-col items-center justify-center rounded-3xl border-2 border-dashed border-zinc-200 bg-zinc-50 text-zinc-400 transition-all hover:bg-white hover:border-emerald-400 hover:text-emerald-500 group/btn">
                    <div className="h-12 w-12 rounded-2xl bg-white border border-zinc-100 flex items-center justify-center mb-3 shadow-sm group-hover/btn:bg-emerald-500 group-hover/btn:text-white transition-colors duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">Add Image</span>
                </button>
            </div>
        </div>
    );
}
