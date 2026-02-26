"use client";

import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-100 bg-white/80 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 font-bold text-white shadow-sm">
                        AI
                    </div>
                    <span className="text-xl font-bold tracking-tight text-zinc-900 text-[1.1rem]">
                        Smart<span className="text-emerald-500">Store</span> Page
                    </span>
                </div>
                <div className="hidden space-x-8 md:flex">
                    <Link href="#" className="text-sm font-semibold text-zinc-500 transition-colors hover:text-emerald-600">
                        대시보드
                    </Link>
                    <Link href="#" className="text-sm font-semibold text-zinc-500 transition-colors hover:text-emerald-600">
                        템플릿
                    </Link>
                    <Link href="#" className="text-sm font-semibold text-zinc-500 transition-colors hover:text-emerald-600">
                        이력
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    <button className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95">
                        무료 체험하기
                    </button>
                </div>
            </div>
        </nav>
    );
}
