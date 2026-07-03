import type { ReportMeta } from "@/lib/api";

const CATEGORY_COLORS: Record<string, string> = {
  "Market Report": "bg-blue-50 text-blue-700",
  "Benchmark Report": "bg-emerald-50 text-emerald-700",
  "Industry Study": "bg-violet-50 text-violet-700",
  "Annual Report": "bg-amber-50 text-amber-700",
};

function formatDate(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function ReportCard({ report }: { report: ReportMeta }) {
  return (
    <a
      href={`/reports/${report.slug}`}
      className="group block rounded-xl border border-[#e5e7eb] bg-white overflow-hidden hover:shadow-lg hover:shadow-[#1a3c8f]/10 hover:-translate-y-0.5 transition-all duration-200"
    >
      {report.hero_image_url ? (
        <div className="h-40 w-full overflow-hidden bg-[#f0f4ff]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={report.hero_image_url} alt={report.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
      ) : (
        <div className="h-40 w-full bg-gradient-to-br from-[#1a3c8f] to-[#0f2460] flex items-center justify-center">
          <span className="text-white/90 text-xs font-semibold tracking-widest uppercase">Intugine Reports</span>
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          {report.category && (
            <span className={`text-[0.68rem] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${CATEGORY_COLORS[report.category] || "bg-slate-100 text-slate-700"}`}>
              {report.category}
            </span>
          )}
          {report.is_featured && (
            <span className="text-[0.68rem] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#92400e]">Featured</span>
          )}
        </div>
        <h3 className="text-[0.98rem] font-bold text-[#0f2460] leading-snug mb-2 group-hover:text-[#1a3c8f]">
          {report.title}
        </h3>
        {report.summary && (
          <p className="text-[0.82rem] text-[#6b7280] leading-relaxed mb-3 line-clamp-3">{report.summary}</p>
        )}
        <div className="flex items-center justify-between text-[0.75rem] text-[#9ca3af]">
          <span>{formatDate(report.published_date)}</span>
          {report.read_time_minutes && <span>{report.read_time_minutes} min read</span>}
        </div>
      </div>
    </a>
  );
}
