"use client";

import Navbar from "@/components/layout/Navbar";
import DetailPageGenerator from "@/components/features/DetailPageGenerator";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-zinc-900 selection:bg-emerald-500/10 pb-20 overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <div className="relative pt-44 pb-28 overflow-hidden bg-zinc-50/50">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute -top-48 -left-48 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full" />
          <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-emerald-500/10 blur-[130px] rounded-full" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-emerald-100 bg-white px-5 py-2 mb-10 shadow-sm">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
            <span className="text-[12px] font-black tracking-[0.2em] text-emerald-600 uppercase">AI SmartStore Engine v1.0</span>
          </div>
          <h1 className="text-6xl font-black tracking-tight text-zinc-900 sm:text-8xl lg:text-9xl leading-[1.1]">
            사진 한 장으로 <br />
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 bg-clip-text text-transparent">
              매출이 바뀌는 상세페이지
            </span>
          </h1>
          <p className="mx-auto mt-10 max-w-3xl text-xl text-zinc-500 font-semibold leading-relaxed sm:text-2xl">
            AI가 당신의 상품을 1초 만에 분석하여 <br className="hidden sm:block" />
            네이버 최적화 문구와 고퀄리티 디자인으로 한 번에 완성합니다.
          </p>
          <div className="mt-14 flex flex-wrap justify-center gap-6">
            <a href="/editor" className="h-20 rounded-[2rem] bg-zinc-900 px-10 text-xl font-black text-white shadow-2xl shadow-zinc-900/40 transition-all hover:bg-emerald-500 hover:scale-105 active:scale-95 flex items-center justify-center">
              지금 바로 무료로 만들기
            </a>
            <button className="h-20 rounded-[2rem] border-2 border-zinc-200 bg-white px-10 text-xl font-black text-zinc-900 transition-all hover:bg-zinc-50 hover:border-zinc-300 active:scale-95">
              샘플 디자인 보기
            </button>
          </div>
        </div>
      </div>

      <DetailPageGenerator />

      {/* Feature Section */}
      <section className="mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { title: "AI 상품 정밀 분석", desc: "고급 이미지 비전 AI가 제품의 재질, 용도, 핵심 특징을 완벽하게 파악합니다." },
            { title: "클릭을 부르는 문구", desc: "네이버 쇼핑 데이터 기반, 소비자 심리를 자극하는 헤드라인과 상세설명을 작성합니다." },
            { title: "디자인 시안 자동화", desc: "검증된 스마트스토어 상세페이지 템플릿에 맞춰 한 장의 긴 이미지를 생성합니다." }
          ].map((f, i) => (
            <div key={i} className="group p-10 rounded-[3rem] bg-white border border-zinc-100 shadow-xl shadow-zinc-200/20 hover:border-emerald-500/30 transition-all hover:shadow-2xl hover:shadow-emerald-500/5 hover:-translate-y-2 duration-500">
              <div className="h-16 w-16 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-900 mb-8 font-black border border-zinc-100 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-400 transition-all duration-500 text-xl">
                0{i + 1}
              </div>
              <h3 className="text-2xl font-black text-zinc-900 mb-4 tracking-tight">{f.title}</h3>
              <p className="text-zinc-500 leading-relaxed font-semibold text-base">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 pt-20 pb-16 px-4 bg-zinc-50/50">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 font-black text-white shadow-lg shadow-emerald-500/20">
              AI
            </div>
            <span className="text-2xl font-black tracking-tight text-zinc-900">
              SmartStore Page
            </span>
          </div>
          <div className="flex flex-col items-center md:items-end gap-2">
            <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest italic">Visual Excellence in AI Page Generation</p>
            <p className="text-zinc-500 text-sm font-medium">© 2026 AI SmartStore Page Service. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
