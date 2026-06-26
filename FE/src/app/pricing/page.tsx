'use client';

import { CheckIcon, SparklesIcon, ShieldCheckIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/contexts/AuthContext';

const BRAND = '#0d7a5f';

const plans = [
  {
    code: 'FREE',
    name: 'Miễn phí',
    priceLabel: '0₫',
    priceSub: 'mãi mãi',
    color: 'border-gray-200',
    badge: '',
    badgeColor: '',
    features: [
      'Đăng tối đa 3 tin tuyển dụng',
      'Xem hồ sơ ứng viên',
      'Quản lý đơn ứng tuyển',
      'Hỗ trợ email cơ bản',
    ],
    disabled: ['Chấm điểm AI', 'Gợi ý ứng viên AI', 'Tìm kiếm nâng cao'],
    cta: 'Bắt đầu miễn phí',
    href: '/register',
    primary: false,
  },
  {
    code: 'BASIC',
    name: 'Cơ bản',
    priceLabel: '499.000₫',
    priceSub: '/tháng',
    color: 'border-[#0d7a5f]',
    badge: 'Phổ biến nhất',
    badgeColor: 'bg-[#0d7a5f]',
    features: [
      'Đăng tối đa 15 tin tuyển dụng',
      'Xem hồ sơ ứng viên',
      'Quản lý đơn ứng tuyển',
      'Chấm điểm AI tự động',
      'Thông báo email ứng viên mới',
      'Hỗ trợ ưu tiên',
    ],
    disabled: ['Gợi ý ứng viên AI', 'Tìm kiếm nâng cao không giới hạn'],
    cta: 'Dùng thử 7 ngày miễn phí',
    href: '/recruiter/subscription',
    primary: true,
  },
  {
    code: 'PRO',
    name: 'Chuyên nghiệp',
    priceLabel: '1.299.000₫',
    priceSub: '/tháng',
    color: 'border-purple-400',
    badge: 'Tốt nhất',
    badgeColor: 'bg-purple-600',
    features: [
      'Đăng tin không giới hạn',
      'Xem hồ sơ ứng viên',
      'Quản lý đơn ứng tuyển',
      'Chấm điểm AI tự động',
      'Gợi ý ứng viên phù hợp bằng AI',
      'Tìm kiếm ngôn ngữ tự nhiên AI',
      'Thông báo email ứng viên mới',
      'Báo cáo & phân tích chi tiết',
      'Hỗ trợ ưu tiên 24/7',
    ],
    disabled: [],
    cta: 'Liên hệ tư vấn',
    href: '/recruiter/subscription',
    primary: false,
  },
];

export default function PricingPage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleCta = (plan: typeof plans[0]) => {
    if (plan.code === 'FREE') {
      if (user) {
        router.push(user.role === 'RECRUITER' ? '/recruiter/dashboard' : '/candidate/dashboard');
      } else {
        router.push('/register');
      }
      return;
    }
    // BASIC / PRO — cần là recruiter
    if (!user) {
      router.push('/login?redirect=/recruiter/subscription');
      return;
    }
    if (user.role !== 'RECRUITER') {
      router.push('/login?redirect=/recruiter/subscription');
      return;
    }
    router.push('/recruiter/subscription');
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface-tinted)' }}>
      <Navbar />

      {/* Hero */}
      <div className="text-center pt-14 pb-10 px-4">
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold mb-4"
          style={{ backgroundColor: 'var(--brand-light)', color: BRAND }}>
          <SparklesIcon className="h-3.5 w-3.5" /> Dịch vụ tuyển dụng AI
        </span>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Bảng giá dịch vụ</h1>
        <p className="text-gray-500 max-w-lg mx-auto">
          Chọn gói phù hợp với quy mô tuyển dụng của doanh nghiệp bạn.<br />
          Dùng thử 7 ngày miễn phí, không cần thẻ tín dụng.
        </p>

        {/* Auth hint */}
        {!user && (
          <p className="mt-3 text-sm text-gray-400">
            Đã có tài khoản nhà tuyển dụng?{' '}
            <Link href="/login?redirect=/recruiter/subscription" className="font-medium" style={{ color: BRAND }}>
              Đăng nhập để đăng ký gói
            </Link>
          </p>
        )}
        {user?.role === 'RECRUITER' && (
          <p className="mt-3 text-sm" style={{ color: BRAND }}>
            ✓ Bạn đang đăng nhập với tài khoản nhà tuyển dụng
          </p>
        )}
      </div>

      {/* Plans */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => (
            <div key={plan.code}
              className={`bg-white rounded-2xl border-2 ${plan.color} shadow-sm p-7 relative flex flex-col`}>

              {plan.badge && (
                <span className={`absolute -top-3 left-1/2 -translate-x-1/2 ${plan.badgeColor} text-white text-xs font-bold px-4 py-1 rounded-full`}>
                  {plan.badge}
                </span>
              )}

              <div className="mb-5">
                <h2 className="text-lg font-bold text-gray-900">{plan.name}</h2>
                <div className="flex items-baseline gap-1 mt-1.5">
                  <span className="text-3xl font-extrabold text-gray-900">{plan.priceLabel}</span>
                  <span className="text-sm text-gray-500">{plan.priceSub}</span>
                </div>
              </div>

              <ul className="space-y-2.5 mb-7 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckIcon className="w-4 h-4 text-[#0d7a5f] mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
                {plan.disabled.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-400 line-through">
                    <CheckIcon className="w-4 h-4 text-gray-300 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCta(plan)}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${
                  plan.primary
                    ? 'text-white'
                    : plan.code === 'PRO'
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={plan.primary ? { backgroundColor: BRAND } : {}}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Enterprise */}
        <div className="mt-12 rounded-2xl p-8 text-center border"
          style={{ backgroundColor: 'var(--brand-light)', borderColor: 'var(--brand-mid)' }}>
          <ShieldCheckIcon className="mx-auto h-8 w-8 mb-3" style={{ color: BRAND }} />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Doanh nghiệp lớn? Cần gói Enterprise?</h3>
          <p className="text-gray-600 mb-4 max-w-md mx-auto text-sm">
            Liên hệ để được tư vấn giải pháp tuyển dụng phù hợp với tính năng tuỳ chỉnh, SLA đảm bảo và hỗ trợ chuyên biệt.
          </p>
          <a href="mailto:contact@recruitai.vn"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: BRAND }}>
            Liên hệ ngay
          </a>
        </div>

        {/* FAQ row */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          {[
            { q: 'Có thể huỷ bất cứ lúc nào?', a: 'Có, huỷ subscription bất kỳ lúc nào, không phí phạt.' },
            { q: 'Thanh toán như thế nào?', a: 'Hỗ trợ chuyển khoản ngân hàng và cổng thanh toán trực tuyến.' },
            { q: 'Dùng thử có mất phí không?', a: '7 ngày đầu hoàn toàn miễn phí, không cần thẻ tín dụng.' },
          ].map(({ q, a }) => (
            <div key={q} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="font-semibold text-gray-900 text-sm mb-1">{q}</p>
              <p className="text-xs text-gray-500">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
