import Link from "next/link";
import fs from "fs";
import path from "path";

export const metadata = {
  title: "FitMe AI 가상 피팅 블로그 & 스타일 가이드",
  description: "AI 가상 피팅 패션 트렌드, 온라인 쇼핑 꿀팁 및 스마트 의상 피팅 노하우를 확인하세요.",
};

interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  locale: string;
}

function getPosts(locale: string = "ko"): PostMeta[] {
  const dirPath = path.join(process.cwd(), "content", locale);
  if (!fs.existsSync(dirPath)) return [];

  const files = fs.readdirSync(dirPath);
  return files
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((file) => {
      const content = fs.readFileSync(path.join(dirPath, file), "utf-8");
      const titleMatch = content.match(/title:\s*"(.*?)"/);
      const descMatch = content.match(/description:\s*"(.*?)"/);
      const dateMatch = content.match(/date:\s*"(.*?)"/);

      return {
        slug: file.replace(/\.mdx?$/, ""),
        title: titleMatch ? titleMatch[1] : file,
        description: descMatch ? descMatch[1] : "",
        date: dateMatch ? dateMatch[1] : "2026-08-03",
        locale,
      };
    });
}

export default function BlogIndexPage() {
  const koPosts = getPosts("ko");
  const jaPosts = getPosts("ja");
  const enPosts = getPosts("en");

  const allPosts = [...koPosts, ...jaPosts, ...enPosts];

  return (
    <main className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700 mb-4"
          >
            ← FitMe 가상 피팅룸으로 돌아가기
          </Link>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
            FitMe AI 블로그 & 가이드
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            실패 없는 온라인 의상 쇼핑 노하우와 AI 피팅 활용법을 만나보세요.
          </p>
        </header>

        <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2">
          {allPosts.map((post) => (
            <article
              key={`${post.locale}-${post.slug}`}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">
                    {post.locale.toUpperCase()}
                  </span>
                  <time className="text-xs text-slate-400">{post.date}</time>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2 hover:text-indigo-600 transition-colors">
                  <Link href={`/blog/${post.slug}?lang=${post.locale}`}>
                    {post.title}
                  </Link>
                </h2>
                <p className="text-slate-600 text-sm line-clamp-3 mb-6">
                  {post.description}
                </p>
              </div>

              <Link
                href={`/blog/${post.slug}?lang=${post.locale}`}
                className="inline-flex items-center text-sm font-bold text-indigo-600 hover:text-indigo-700"
              >
                글 읽기 →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
