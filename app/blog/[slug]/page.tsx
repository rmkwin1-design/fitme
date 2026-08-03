import Link from "next/link";
import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface PageProps {
  params: { slug: string };
  searchParams: { lang?: string };
}

function getPostContent(slug: string, locale: string = "ko") {
  const filePath = path.join(process.cwd(), "content", locale, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const titleMatch = raw.match(/title:\s*"(.*?)"/);
  const descMatch = raw.match(/description:\s*"(.*?)"/);
  const dateMatch = raw.match(/date:\s*"(.*?)"/);
  const draftMatch = raw.match(/draft:\s*(true|false)/);

  // Remove frontmatter block
  const body = raw.replace(/^---[\s\S]*?---/, "").trim();

  return {
    title: titleMatch ? titleMatch[1] : slug,
    description: descMatch ? descMatch[1] : "",
    date: dateMatch ? dateMatch[1] : "2026-08-03",
    draft: draftMatch ? draftMatch[1] === "true" : false,
    body,
  };
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const locale = searchParams.lang || "ko";
  const post = getPostContent(params.slug, locale);

  if (!post) {
    return {
      title: "글을 찾을 수 없습니다",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fitme-nu-woad.vercel.app";

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${siteUrl}/blog/${params.slug}?lang=${locale}`,
      type: "article",
    },
  };
}

export default function BlogPostPage({ params, searchParams }: PageProps) {
  const locale = searchParams.lang || "ko";
  const post = getPostContent(params.slug, locale);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <article className="max-w-3xl mx-auto bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200/80">
        {post.draft && (
          <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-xl text-xs font-semibold">
            ⚠️ 이 글은 자동 생성된 초안(Draft)입니다. 아직 공개 검토 중입니다.
          </div>
        )}

        <nav className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            ← 목록으로 돌아가기
          </Link>
        </nav>

        <header className="mb-8 pb-8 border-b border-slate-100">
          <time className="text-xs font-semibold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2.5 py-1 rounded-full">
            {post.date}
          </time>
          <h1 className="mt-4 text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-3 text-lg text-slate-600">{post.description}</p>
        </header>

        <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed space-y-4">
          {post.body.split("\n\n").map((paragraph, idx) => {
            if (paragraph.startsWith("# ")) {
              return (
                <h1 key={idx} className="text-2xl font-bold text-slate-900 mt-6 mb-3">
                  {paragraph.replace("# ", "")}
                </h1>
              );
            }
            if (paragraph.startsWith("## ")) {
              return (
                <h2 key={idx} className="text-xl font-bold text-slate-900 mt-6 mb-3">
                  {paragraph.replace("## ", "")}
                </h2>
              );
            }
            if (paragraph.startsWith("### ")) {
              return (
                <h3 key={idx} className="text-lg font-bold text-slate-900 mt-4 mb-2">
                  {paragraph.replace("### ", "")}
                </h3>
              );
            }
            if (paragraph.startsWith("[")) {
              return (
                <div key={idx} className="my-6 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-center">
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center font-bold text-indigo-600 hover:text-indigo-700 text-lg"
                  >
                    👕 FitMe AI 가상 피팅 스튜디오 바로가기 →
                  </Link>
                </div>
              );
            }
            return <p key={idx}>{paragraph}</p>;
          })}
        </div>

        <footer className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-md hover:shadow-indigo-500/20"
          >
            👕 지금 바로 무료로 옷 입어보기
          </Link>
          <Link href="/blog" className="text-sm font-semibold text-slate-500 hover:text-slate-700">
            블로그 다른 글 보기
          </Link>
        </footer>
      </article>
    </main>
  );
}
