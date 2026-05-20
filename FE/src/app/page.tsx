import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { BriefcaseIcon, SparklesIcon, UsersIcon, TrendingUpIcon } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-24 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium mb-6">
            <SparklesIcon className="h-4 w-4" />
            Tích hợp AI thông minh
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Tìm việc làm <span className="text-yellow-300">phù hợp nhất</span>
            <br />với bạn
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Nền tảng tuyển dụng thông minh giúp kết nối ứng viên tài năng với nhà tuyển dụng hàng đầu.
            AI phân tích CV và gợi ý việc làm phù hợp nhất.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/jobs"
              className="rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-blue-700 shadow-lg hover:bg-blue-50 transition-colors"
            >
              Tìm việc ngay
            </Link>
            <Link
              href="/register"
              className="rounded-xl border-2 border-white/40 bg-white/10 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/20 transition-colors"
            >
              Đăng ký miễn phí
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 text-center">
            {[
              { label: 'Việc làm', value: '10,000+' },
              { label: 'Ứng viên', value: '50,000+' },
              { label: 'Công ty', value: '2,000+' },
              { label: 'Tuyển dụng thành công', value: '15,000+' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-bold text-blue-600">{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">Tại sao chọn RecruitAI?</h2>
            <p className="mt-4 text-gray-600 text-lg">Công nghệ AI tiên tiến giúp quá trình tuyển dụng trở nên dễ dàng hơn</p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <FeatureCard
              icon={<SparklesIcon className="h-7 w-7 text-blue-600" />}
              title="AI Phân tích CV"
              desc="Hệ thống AI tự động phân tích và chấm điểm CV, giúp bạn biết mức độ phù hợp với từng vị trí."
            />
            <FeatureCard
              icon={<TrendingUpIcon className="h-7 w-7 text-green-600" />}
              title="Gợi ý việc làm thông minh"
              desc="Dựa trên kỹ năng và kinh nghiệm, AI gợi ý những công việc phù hợp nhất với bạn."
            />
            <FeatureCard
              icon={<UsersIcon className="h-7 w-7 text-purple-600" />}
              title="Kết nối trực tiếp"
              desc="Kết nối ứng viên và nhà tuyển dụng nhanh chóng, minh bạch và hiệu quả."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16 text-white text-center">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-3xl font-bold mb-4">Sẵn sàng bắt đầu?</h2>
          <p className="text-blue-100 mb-8 text-lg">Tạo hồ sơ ngay hôm nay và để AI tìm công việc mơ ước cho bạn.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/register"
              className="rounded-xl bg-white px-8 py-3.5 font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
            >
              Đăng ký ứng viên
            </Link>
            <Link
              href="/register"
              className="rounded-xl border-2 border-white/40 bg-white/10 px-8 py-3.5 font-semibold hover:bg-white/20 transition-colors"
            >
              Đăng tin tuyển dụng
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
        <p>© 2024 RecruitAI — Hệ thống tuyển dụng thông minh tích hợp AI.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="inline-flex rounded-xl bg-gray-50 p-3 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
