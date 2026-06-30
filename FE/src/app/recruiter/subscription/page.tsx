'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import toast from 'react-hot-toast';
import { CheckIcon, ZapIcon, BriefcaseIcon, SparklesIcon, Loader2Icon } from 'lucide-react';

interface Plan {
  id: string;
  code: string;
  name: string;
  priceMonthly: number;
  maxJobs: number;
  aiScoring: boolean;
  aiRecommend: boolean;
  description: string;
}

interface CurrentSub {
  id?: string;
  plan: Plan;
  status: string;
  startedAt?: string;
  expiresAt?: string;
  jobsUsed: number;
  jobsRemaining: number;
}

const planIcons: Record<string, React.ReactNode> = {
  FREE:  <BriefcaseIcon className="h-6 w-6" />,
  BASIC: <ZapIcon       className="h-6 w-6" />,
  PRO:   <SparklesIcon  className="h-6 w-6" />,
};

const planColors: Record<string, string> = {
  FREE:  'border-gray-200',
  BASIC: 'border-[#b2dfcf]',
  PRO:   'border-purple-500',
};

export default function RecruiterSubscriptionPage() {
  const [plans,       setPlans]       = useState<Plan[]>([]);
  const [current,    setCurrent]     = useState<CurrentSub | null>(null);
  const [loading,    setLoading]     = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router       = useRouter();

  // ─── Load plans + current subscription ────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      const [plansRes, subRes] = await Promise.all([
        axiosInstance.get<Plan[]>('/api/subscriptions/plans'),
        axiosInstance.get<CurrentSub>('/api/recruiter/subscription'),
      ]);
      setPlans(plansRes.data);
      setCurrent(subRes.data);
    } catch {
      toast.error('Không thể tải thông tin gói dịch vụ');
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Handle VNPay return URL ───────────────────────────────────────────────
  useEffect(() => {
    const vnpResponseCode = searchParams.get('vnp_ResponseCode');
    if (!vnpResponseCode) {
      loadData();
      return;
    }

    // Build query string from all vnp_ params to send to backend for verification
    const allParams = Object.fromEntries(searchParams.entries());
    const query = new URLSearchParams(allParams).toString();

    axiosInstance.get<{ success: boolean; message: string }>(
      `/api/recruiter/payment/verify?${query}`
    ).then(res => {
      if (res.data.success) {
        toast.success(res.data.message || 'Thanh toán thành công!');
      } else {
        toast.error(res.data.message || 'Thanh toán thất bại');
      }
    }).catch(() => {
      toast.error('Không thể xác minh thanh toán, vui lòng liên hệ hỗ trợ');
    }).finally(() => {
      // Clean up vnp_ params from URL, then reload data
      router.replace('/recruiter/subscription');
      loadData();
    });
  }, []); // run once on mount

  // ─── Subscribe handlers ────────────────────────────────────────────────────
  const handleFreeDowngrade = async () => {
    setSubscribing('FREE');
    try {
      const res = await axiosInstance.post<CurrentSub>('/api/recruiter/subscription', {
        planCode:   'FREE',
        paymentRef: 'FREE-PLAN',
      });
      setCurrent(res.data);
      toast.success('Đã chuyển về gói Miễn phí');
    } catch {
      toast.error('Thao tác thất bại, vui lòng thử lại');
    } finally {
      setSubscribing(null);
    }
  };

  const handlePaidSubscribe = async (planCode: string) => {
    setSubscribing(planCode);
    try {
      const res = await axiosInstance.post<{ paymentUrl: string; txnRef: string }>(
        '/api/recruiter/payment/create',
        { planCode }
      );
      // Redirect browser to VNPay payment page
      window.location.href = res.data.paymentUrl;
    } catch {
      toast.error('Không thể tạo liên kết thanh toán, vui lòng thử lại');
      setSubscribing(null);
    }
  };

  const handleSubscribe = (planCode: string) => {
    if (current?.plan.code === planCode) return;
    if (planCode === 'FREE') {
      handleFreeDowngrade();
    } else {
      handlePaidSubscribe(planCode);
    }
  };

  const isCurrent = (code: string) => current?.plan.code === code;

  // ─── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2Icon className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Gói dịch vụ</h1>
      <p className="text-gray-500 mb-8">Chọn gói phù hợp để đăng tin tuyển dụng và sử dụng AI</p>

      {/* Current subscription banner */}
      {current && (
        <div className="bg-[#e8f5f0] border border-[#b2dfcf] rounded-xl p-5 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#0d7a5f] font-medium">Gói hiện tại</p>
              <p className="text-xl font-bold text-blue-900 mt-1">{current.plan.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#0d7a5f]">
                Đã đăng: <span className="font-bold">{current.jobsUsed}</span>
                {current.plan.maxJobs !== -1 && <> / {current.plan.maxJobs} tin</>}
              </p>
              {current.expiresAt && (
                <p className="text-xs text-[#0d7a5f] mt-1">
                  Hết hạn: {new Date(current.expiresAt).toLocaleDateString('vi-VN')}
                </p>
              )}
            </div>
          </div>
          {current.plan.maxJobs !== -1 && (
            <div className="mt-3">
              <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (current.jobsUsed / current.plan.maxJobs) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-[#0d7a5f] mt-1">Còn lại: {current.jobsRemaining} tin</p>
            </div>
          )}
        </div>
      )}

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(plan => (
          <div
            key={plan.code}
            className={`bg-white rounded-2xl border-2 ${planColors[plan.code] ?? 'border-gray-200'} p-6 relative ${
              isCurrent(plan.code) ? 'ring-2 ring-offset-2 ring-blue-500' : ''
            }`}
          >
            {isCurrent(plan.code) && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                Gói hiện tại
              </span>
            )}

            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${
              plan.code === 'PRO'   ? 'bg-purple-100 text-purple-600' :
              plan.code === 'BASIC' ? 'bg-[#e8f5f0] text-[#0d7a5f]' :
                                      'bg-gray-100 text-gray-600'
            }`}>
              {planIcons[plan.code]}
            </div>

            <h2 className="text-lg font-bold text-gray-900">{plan.name}</h2>
            <p className="text-2xl font-extrabold text-gray-900 mt-2">
              {plan.priceMonthly === 0
                ? 'Miễn phí'
                : `${plan.priceMonthly.toLocaleString('vi-VN')}₫/tháng`}
            </p>

            <ul className="mt-4 space-y-2 mb-6">
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckIcon className="h-4 w-4 text-green-500 shrink-0" />
                {plan.maxJobs === -1 ? 'Đăng tin không giới hạn' : `Tối đa ${plan.maxJobs} tin`}
              </li>
              <li className={`flex items-center gap-2 text-sm ${plan.aiScoring ? 'text-gray-700' : 'text-gray-400 line-through'}`}>
                <CheckIcon className={`h-4 w-4 shrink-0 ${plan.aiScoring ? 'text-green-500' : 'text-gray-300'}`} />
                Chấm điểm AI
              </li>
              <li className={`flex items-center gap-2 text-sm ${plan.aiRecommend ? 'text-gray-700' : 'text-gray-400 line-through'}`}>
                <CheckIcon className={`h-4 w-4 shrink-0 ${plan.aiRecommend ? 'text-green-500' : 'text-gray-300'}`} />
                Gợi ý ứng viên AI
              </li>
            </ul>

            <button
              onClick={() => handleSubscribe(plan.code)}
              disabled={isCurrent(plan.code) || subscribing !== null}
              className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${
                isCurrent(plan.code)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : plan.code === 'PRO'
                  ? 'bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60'
                  : plan.code === 'BASIC'
                  ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-60'
              }`}
            >
              {subscribing === plan.code && (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              )}
              {isCurrent(plan.code) ? 'Đang sử dụng' :
               subscribing === plan.code ? 'Đang chuyển đến VNPay...' :
               plan.code === 'FREE' ? 'Chuyển về FREE' :
               'Thanh toán qua VNPay'}
            </button>

            {/* VNPay badge for paid plans */}
            {plan.code !== 'FREE' && !isCurrent(plan.code) && (
              <p className="text-center text-xs text-gray-400 mt-2">
                🔒 Thanh toán an toàn qua VNPay
              </p>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 text-center mt-8">
        Thanh toán qua cổng VNPay — hỗ trợ thẻ ATM nội địa, Visa/Mastercard và QR Code.
        Gói được kích hoạt ngay sau khi thanh toán thành công.
      </p>
    </div>
  );
}
