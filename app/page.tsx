'use client'

import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const GENRE_ORDER = [
  "品質", "フレーム", "人物", "体形", "顔の特徴", 
  "髪型", "髪色", "表情", "服装", "動作", "場所", "視点"
];

export default function Home() {
  const [prompts, setPrompts] = useState<any[]>([])
  const [trendingPrompts, setTrendingPrompts] = useState<any[]>([]) // トレンド用
  const [activeGenre, setActiveGenre] = useState(GENRE_ORDER[0])
  const [selectedPromptIds, setSelectedPromptIds] = useState<number[]>([])
  const [copiedType, setCopiedType] = useState<'pos' | 'neg' | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      // 1. 全プロンプト取得
      const { data: allData } = await supabase
        .from('m_prompts')
        .select('*')
        .eq('status', 'confirmed')
        .order('prompt_id')
      if (allData) setPrompts(allData)

      // 2. トレンドランキング取得（先ほど作ったViewから）
      const { data: trendData } = await supabase
        .from('v_trending_positives') // View名を指定
        .select('*')
      if (trendData) setTrendingPrompts(trendData)
    }
    fetchData()
  }, [])

  const availableGenres = Array.from(new Set(prompts.map(p => p.genre)));
  const sortedGenres = GENRE_ORDER.filter(g => availableGenres.includes(g));
  
  const filteredPrompts = prompts.filter(p => 
    p.genre === activeGenre && p.genre !== '未分類' && p.genre !== 'ネガティブ'
  );

  const negativePrompts = prompts.filter(p => p.genre === 'ネガティブ');

  const togglePrompt = (id: number) => {
    setSelectedPromptIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const selectedObjects = prompts.filter(p => selectedPromptIds.includes(p.prompt_id))
  
  const posText = selectedObjects.filter(p => p.genre !== 'ネガティブ').map(p => p.token_en).join(', ')
  const negText = selectedObjects.filter(p => p.genre === 'ネガティブ').map(p => p.token_en).join(', ')

  const copy = (text: string, type: 'pos' | 'neg') => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedType(type)
    setTimeout(() => setCopiedType(null), 2000)
  }

  return (
    <main className="min-h-screen bg-[#121212] text-white pb-80">
      
      {/* ヒーローセクション */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-32 md:pb-32 bg-gradient-to-b from-blue-900/20 to-[#121212]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full -z-10 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-8 animate-pulse">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Civitai Monthly Trends Integrated
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-blue-400">
            魔法のようなプロンプトを、<br className="hidden md:block" />選ぶだけで。
          </h1>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <button 
              onClick={() => document.getElementById('tool-main')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-blue-900/40"
            >
              今すぐ作成を開始する
            </button>
          </div>
        </div>
      </section>

      <div id="tool-main" className="h-10"></div>

      {/* ヘッダーエリア */}
      <div className="bg-[#1e1e1e] border-b border-gray-800 p-6 sticky top-0 z-10 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">AI Prompt Builder</h1>
            </div>
            <a href="/blog" className="hidden md:block px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 text-sm font-bold text-gray-300 transition-colors border border-gray-700">
              📝 Trend Reports
            </a>
          </div>
          <button 
            onClick={() => setSelectedPromptIds([])}
            className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded transition-colors"
          >
            すべてクリア
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">

        {/* --- 🔥 追加: トレンド（人気）エリア --- */}
        {trendingPrompts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-sm font-bold text-yellow-400 mb-4 uppercase tracking-wider flex items-center gap-2">
              <span className="text-lg">🔥</span> Trending Now (Top 12)
              <span className="text-xs text-gray-500 font-normal ml-auto normal-case">迷ったらここから選べば間違いなし</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {trendingPrompts.map(p => {
                const isSelected = selectedPromptIds.includes(p.prompt_id);
                return (
                  <div
                    key={`trend-${p.prompt_id}`} // ID重複回避のためprefix
                    onClick={() => togglePrompt(p.prompt_id)}
                    className={`
                      relative p-3 rounded-md cursor-pointer border transition-all h-full group
                      ${isSelected 
                        ? 'border-yellow-500 bg-yellow-900/20 shadow-[0_0_15px_rgba(234,179,8,0.2)]' 
                        : 'border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10 hover:border-yellow-500/60'}
                    `}
                  >
                    <div className="absolute -top-2 -left-2 bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                      HOT
                    </div>
                    <p className="text-sm font-bold text-gray-200 mb-1">{p.token_jp}</p>
                    <p className="text-[10px] text-gray-500 font-mono break-words leading-tight">{p.token_en}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* --- トレンドエリア終了 --- */}

        {/* 通常選択エリア */}
        <div className="mb-10">
          <h2 className="text-sm font-bold text-blue-400 mb-4 uppercase tracking-wider">1. イメージを構築（Positive）</h2>
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
            {sortedGenres.map(genre => (
              <button
                key={genre}
                onClick={() => setActiveGenre(genre)}
                className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all border
                  ${activeGenre === genre 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/50' 
                    : 'bg-[#1e1e1e] border-gray-700 text-gray-400 hover:border-gray-500'}`}
              >
                {genre}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredPrompts.length > 0 ? (
              filteredPrompts.map(p => {
                const isSelected = selectedPromptIds.includes(p.prompt_id);
                return (
                  <div
                    key={p.prompt_id}
                    onClick={() => togglePrompt(p.prompt_id)}
                    className={`
                      relative p-3 rounded-md cursor-pointer border transition-all h-full flex flex-col justify-between group
                      ${isSelected 
                        ? 'border-blue-500 bg-blue-900/20 shadow-[0_0_10px_rgba(59,130,246,0.3)]' 
                        : 'border-gray-800 bg-[#1e1e1e] hover:border-gray-600 hover:bg-[#252525]'}
                    `}
                  >
                    <div>
                      <p className="text-sm font-bold text-gray-200 mb-1">{p.token_jp}</p>
                      <p className="text-[10px] text-gray-500 font-mono break-words leading-tight">{p.token_en}</p>
                    </div>
                    {isSelected && <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_5px_#3b82f6]"></div>}
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center text-gray-600 py-10 border border-dashed border-gray-800 rounded-lg">
                このジャンルのデータはまだありません
              </div>
            )}
          </div>
        </div>

        {/* ネガティブエリア */}
        <div className="mb-8 pt-8 border-t border-gray-800">
          <h2 className="text-sm font-bold text-red-400 mb-4 uppercase tracking-wider">2. 除外する要素（Negative）</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {negativePrompts.map(p => {
              const isSelected = selectedPromptIds.includes(p.prompt_id);
              return (
                <div
                  key={p.prompt_id}
                  onClick={() => togglePrompt(p.prompt_id)}
                  className={`
                    p-3 rounded-md cursor-pointer border transition-all
                    ${isSelected 
                      ? 'border-red-500 bg-red-900/20 shadow-[0_0_10px_rgba(239,68,68,0.3)]' 
                      : 'border-gray-800 bg-[#1a1515] hover:border-gray-600'}
                  `}
                >
                  <p className="text-sm font-bold text-gray-300">{p.token_jp}</p>
                  <p className="text-[10px] text-gray-600 font-mono">{p.token_en}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* フッター */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#121212]/95 backdrop-blur border-t border-gray-800 p-4 shadow-2xl z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <label className="text-[10px] font-bold text-blue-500 uppercase mb-1 block">Positive Prompt</label>
            <div className="bg-[#0a0a0a] text-gray-300 text-xs font-mono p-3 rounded border border-gray-700 h-20 overflow-y-auto custom-scrollbar">
              {posText || "タグを選択してください..."}
            </div>
            <button
              onClick={() => copy(posText, 'pos')}
              className="absolute top-8 right-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded transition-colors"
            >
              {copiedType === 'pos' ? 'COPIED!' : 'COPY'}
            </button>
          </div>
          <div className="flex-1 relative group">
            <label className="text-[10px] font-bold text-red-500 uppercase mb-1 block">Negative Prompt</label>
            <div className="bg-[#0a0a0a] text-gray-300 text-xs font-mono p-3 rounded border border-gray-700 h-20 overflow-y-auto custom-scrollbar">
              {negText || "ネガティブタグを選択してください..."}
            </div>
            <button
              onClick={() => copy(negText, 'neg')}
              className="absolute top-8 right-2 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded transition-colors"
            >
              {copiedType === 'neg' ? 'COPIED!' : 'COPY'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
