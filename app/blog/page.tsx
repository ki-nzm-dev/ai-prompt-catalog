import Link from 'next/link'

// 記事データ（ここを編集すれば記事が増えます）
const BLOG_POSTS = [
  {
    id: 1,
    title: "【2026年1月第2週】Civitai急上昇ワードTOP10分析",
    excerpt: "今週は「cinematic lighting」などの照明系タグが激増。Ponyモデルでのリアル系描写の需要が高まっています。データに基づいたトレンド推移を解説。",
    date: "2026.01.13",
    category: "Trend Report",
    imageColor: "from-blue-600 to-purple-600" // サムネイル代わりのグラデーション
  },
  {
    id: 2,
    title: "「選べない」を解決する。AIプロンプト・ビルダー開発の裏側",
    excerpt: "なぜ辞書ではなく「パズル」なのか？エンジニア視点でCivitaiのAPIを解析し、初心者が躓くポイントをUXで解決した開発ログ。",
    date: "2026.01.10",
    category: "Dev Log",
    imageColor: "from-emerald-500 to-teal-500"
  },
  {
    id: 3,
    title: "失敗しない「ネガティブプロンプト」の鉄板設定",
    excerpt: "「mutated hands」だけでは足りない？統計データから導き出された、最も効果的に崩れを防ぐネガティブタグの組み合わせを公開。",
    date: "2026.01.08",
    category: "Tips",
    imageColor: "from-orange-500 to-red-500"
  },
]

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-[#121212] text-white">
      {/* ヘッダーエリア */}
      <div className="border-b border-gray-800 p-6 sticky top-0 z-10 bg-[#121212]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold tracking-tight hover:text-blue-400 transition-colors">
            ← AI Prompt Builder
          </Link>
          <div className="text-xs text-gray-500 font-mono">
            AI Analysis Reports
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* ブログタイトル */}
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              Insights & Trends
            </span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            膨大な生成データから導き出された「正解」を。<br />
            エンジニア視点の解析レポートと最新ニュース。
          </p>
        </div>

        {/* 記事グリッド */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BLOG_POSTS.map((post) => (
            <article 
              key={post.id}
              className="group bg-[#1e1e1e] rounded-2xl overflow-hidden border border-gray-800 hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-900/20"
            >
              {/* サムネイル画像エリア（グラデーションで代用） */}
              <div className={`h-48 w-full bg-gradient-to-br ${post.imageColor} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                {/* カテゴリバッジ */}
                <span className="absolute top-4 left-4 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-xs font-bold border border-white/10">
                  {post.category}
                </span>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 mb-3 text-xs text-gray-500 font-mono">
                  <span>{post.date}</span>
                  <span>•</span>
                  <span>By Admin</span>
                </div>
                
                <h2 className="text-xl font-bold mb-3 leading-snug group-hover:text-blue-400 transition-colors">
                  {post.title}
                </h2>
                
                <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 mb-6">
                  {post.excerpt}
                </p>

                <div className="flex items-center text-blue-400 text-sm font-bold group-hover:translate-x-1 transition-transform">
                  Read Report <span className="ml-1">→</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* フッター */}
      <footer className="mt-20 border-t border-gray-800 py-12 text-center text-gray-500 text-sm">
        <p>© 2026 AI Prompt Analyzer. Powered by Civitai Data.</p>
      </footer>
    </main>
  )
}
