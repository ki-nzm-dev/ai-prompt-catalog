'use client'

import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ユーザー指定の理想的なジャンル順序
const GENRE_ORDER = [
  "品質", "フレーム", "人物", "体形", "顔の特徴", 
  "髪型", "髪色", "表情", "服装", "動作", "場所", "視点"
];

export default function Home() {
  const [prompts, setPrompts] = useState<any[]>([])
  const [activeGenre, setActiveGenre] = useState(GENRE_ORDER[0])
  const [selectedPromptIds, setSelectedPromptIds] = useState<number[]>([])
  const [copiedType, setCopiedType] = useState<'pos' | 'neg' | null>(null)

  useEffect(() => {
    const fetchPrompts = async () => {
      // confirmedのみ取得（未分類はフロントで除外するか、ここでも除外可能）
      const { data } = await supabase
        .from('m_prompts')
        .select('*')
        .eq('status', 'confirmed')
        .order('prompt_id')
      if (data) setPrompts(data)
    }
    fetchPrompts()
  }, [])

  // ジャンルの重複なしリストを作成し、指定順序でソート
  // データに存在しないジャンルもタブとして表示したい場合は GENRE_ORDER をそのまま使う
  // ここでは「データが存在するものだけ」を表示するロジックにしています
  const availableGenres = Array.from(new Set(prompts.map(p => p.genre)));
  const sortedGenres = GENRE_ORDER.filter(g => availableGenres.includes(g));
  
  // 未分類やネガティブを除外して表示
  const filteredPrompts = prompts.filter(p => 
    p.genre === activeGenre && p.genre !== '未分類' && p.genre !== 'ネガティブ'
  );

  // ネガティブプロンプト専用リスト
  const negativePrompts = prompts.filter(p => p.genre === 'ネガティブ');

  // 選択トグル
  const togglePrompt = (id: number) => {
    setSelectedPromptIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  // 選択データの抽出
  const selectedObjects = prompts.filter(p => selectedPromptIds.includes(p.prompt_id))
  
  // テキスト生成
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
      {/* ヘッダーエリア */}
      <div className="bg-[#1e1e1e] border-b border-gray-800 p-6 sticky top-0 z-10 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI Prompt Builder</h1>
            <p className="text-xs text-gray-400 mt-1">ステップ順に選ぶだけで80点のプロンプトが完成します</p>
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
        {/* メイン：ポジティブプロンプト選択エリア */}
        <div className="mb-10">
          <h2 className="text-sm font-bold text-blue-400 mb-4 uppercase tracking-wider">1. イメージを構築（Positive）</h2>
          
          {/* ジャンルタブ（指定順序） */}
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

          {/* プロンプトカード一覧 */}
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

        {/* サブ：ネガティブプロンプト選択エリア（別枠表示） */}
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

      {/* フッター：出力エリア */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#121212]/95 backdrop-blur border-t border-gray-800 p-4 shadow-2xl z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4">
          
          {/* Positive Output */}
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

          {/* Negative Output */}
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