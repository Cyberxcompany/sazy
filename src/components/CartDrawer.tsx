import { useState, FormEvent } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Truck,
  Store,
  CheckCircle2,
  Copy,
  Check,
  MessageCircle,
  Phone,
} from 'lucide-react';
import { ConfiguredCartItem } from './MenuItemModal';
import { Language, RESTAURANT_INFO, formatIQD } from '../data/menuData';
import { FoodImage } from './FoodImage';

interface CartDrawerProps {
  isOpen: boolean;
  lang: Language;
  items: ConfiguredCartItem[];
  onClose: () => void;
  onUpdateQty: (cartKey: string, delta: number) => void;
  onRemoveItem: (cartKey: string) => void;
  onClearCart: () => void;
}

interface ConfirmedOrder {
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  mode: 'delivery' | 'pickup';
  total: number;
  summaryText: string;
}

export function CartDrawer({
  isOpen,
  lang,
  items,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
}: CartDrawerProps) {
  const [mode, setMode] = useState<'delivery' | 'pickup'>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const pick = (ckb: string, ar: string, en: string) =>
    lang === 'ckb' ? ckb : lang === 'ar' ? ar : en;

  const subtotal = items.reduce((sum, entry) => sum + entry.unitPrice * entry.quantity, 0);

  const buildOrderSummaryText = (orderNum: string) => {
    const lines = items.map((entry) => {
      const title = pick(entry.item.nameCkb, entry.item.nameAr, entry.item.nameEn);
      const variant = pick(
        entry.variant.labelCkb,
        entry.variant.labelAr,
        entry.variant.labelEn
      );
      const extrasList = entry.extras
        .map((e) => pick(e.labelCkb, e.labelAr, e.labelEn))
        .join('، ');
      return `• ${entry.quantity}x ${title} (${variant})${
        extrasList ? ` + [${extrasList}]` : ''
      }${entry.note ? ` — ${entry.note}` : ''} = ${formatIQD(
        entry.unitPrice * entry.quantity,
        lang
      )}`;
    });

    const header = pick(
      `داواکاریی نوێ #${orderNum} — گەسی سازی`,
      `طلب جديد #${orderNum} — كص سازي`,
      `New Order #${orderNum} — Gasi Sazi`
    );
    const typeLabel =
      mode === 'delivery'
        ? pick('جۆر: گەیاندن (دیلیڤەری)', 'النوع: توصيل', 'Type: Delivery')
        : pick('جۆر: وەرگرتن لە مەتعەم', 'النوع: استلام من المطعم', 'Type: Pickup');
    const customerLine = pick(
      `کڕیار: ${customerName} | مۆبایل: ${phone}`,
      `الزبون: ${customerName} | الهاتف: ${phone}`,
      `Customer: ${customerName} | Phone: ${phone}`
    );
    const addrLine =
      mode === 'delivery'
        ? pick(
            `ناونیشان: ${address}`,
            `العنوان: ${address}`,
            `Address: ${address}`
          )
        : '';
    const totalLine = pick(
      `کۆی خواردنەکان: ${formatIQD(subtotal, lang)}`,
      `مجموع الطلب: ${formatIQD(subtotal, lang)}`,
      `Items Total: ${formatIQD(subtotal, lang)}`
    );

    return [header, typeLabel, customerLine, addrLine, '---', ...lines, '---', totalLine]
      .filter(Boolean)
      .join('\n');
  };

  const handleSubmitOrder = (e: FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim()) {
      setErrorMsg(
        pick(
          'تکایە ناو و ژمارە مۆبایل بنووسە.',
          'يرجى كتابة الاسم ورقم الهاتف.',
          'Please enter your name and phone number.'
        )
      );
      return;
    }
    if (mode === 'delivery' && !address.trim()) {
      setErrorMsg(
        pick(
          'تکایە ناونیشان و گەڕەک بنووسە بۆ گەیاندن.',
          'يرجى كتابة المنطقة والعنوان للتوصيل.',
          'Please enter your delivery neighborhood and street.'
        )
      );
      return;
    }
    setErrorMsg('');
    const orderNumber = String(Math.floor(1000 + Math.random() * 9000));
    const summaryText = buildOrderSummaryText(orderNumber);
    setConfirmedOrder({
      orderNumber,
      customerName: customerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      mode,
      total: subtotal,
      summaryText,
    });
    onClearCart();
  };

  const handleCopySummary = async () => {
    if (!confirmedOrder) return;
    try {
      await navigator.clipboard.writeText(confirmedOrder.summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleResetAndClose = () => {
    setConfirmedOrder(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-xs"
      onClick={handleResetAndClose}
      role="dialog"
      aria-modal="true"
      aria-label={pick('سەبەتەی داواکاری', 'سلة الطلبات', 'Order Cart')}
    >
      <aside
        className="w-full max-w-md bg-[#161412] border-s border-[#2B2724] h-full flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[#2B2724] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#D92323]" />
            <h2 className="font-display text-lg font-bold text-[#F7F4EF]">
              {pick('سەبەتەی داواکاری', 'سلة الطلبات', 'Your Order')}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            aria-label={pick('داخستن', 'إغلاق', 'Close')}
            className="w-10 h-10 rounded-xl bg-[#1F1C1A] border border-[#2B2724] flex items-center justify-center text-[#D6D3D1] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmedOrder ? (
          <div className="p-6 flex-1 overflow-y-auto flex flex-col justify-between gap-6">
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-[#1E1B18] border border-[#2D2926]">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-xs text-[#A8A29E]">
                      {pick('پسوولەی داواکاری', 'وصل الطلب', 'Order Receipt')}
                    </p>
                    <h3 className="font-display text-lg font-bold text-[#F7F4EF]">
                      {pick(
                        `داواکاریی #${confirmedOrder.orderNumber} ئامادەیە`,
                        `الطلب #${confirmedOrder.orderNumber} جاهز للإرسال`,
                        `Order #${confirmedOrder.orderNumber} Ready`
                      )}
                    </h3>
                  </div>
                </div>
                <p className="text-sm text-[#C7C2BC] leading-relaxed">
                  {pick(
                    'داواکارییەکەت ڕێکخرا. دەتوانیت ڕاستەوخۆ بینێریت بۆ واتساپی مەتعەم گەسی سازی یان پەیوەندی بە ژمارەکانەوە بکەیت.',
                    'تم تجهيز تفاصيل طلبك. يمكنك إرسالها مباشرة عبر واتساب مطعم كص سازي أو الاتصال بنا.',
                    'Your order summary is ready. Send it directly via WhatsApp or call any of our hotlines to confirm.'
                  )}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#121110] border border-[#2B2724]">
                <pre className="text-xs text-[#D6D3D1] whitespace-pre-wrap font-sans leading-6">
                  {confirmedOrder.summaryText}
                </pre>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="py-3 px-4 rounded-xl bg-[#1F1C1A] border border-[#2D2926] hover:border-[#443E3A] text-sm font-medium text-[#F7F4EF] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span>
                    {copied
                      ? pick('کۆپی کرا', 'تم النسخ', 'Copied')
                      : pick('کۆپیکردنی داواکاری', 'نسخ الطلب', 'Copy Summary')}
                  </span>
                </button>

                <a
                  href={`https://wa.me/${RESTAURANT_INFO.whatsappNumber}?text=${encodeURIComponent(
                    confirmedOrder.summaryText
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 rounded-xl bg-[#D92323] hover:bg-[#B81C1C] text-sm font-semibold text-white flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{pick('ناردن بۆ واتساپ', 'إرسال عبر واتساب', 'Send on WhatsApp')}</span>
                </a>
              </div>

              <div className="p-4 rounded-xl bg-[#1A1816] border border-[#2A2623] space-y-2">
                <p className="text-xs text-[#A8A29E]">
                  {pick('ژمارەکانی داواکاریی گەسی سازی:', 'أرقام الطلب المباشر:', 'Direct Order Lines:')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {RESTAURANT_INFO.orderPhones.map((p) => (
                    <a
                      key={p.display}
                      href={p.href}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121110] border border-[#2B2724] hover:border-[#D92323] text-xs font-num text-[#F7F4EF] transition-colors"
                      dir="ltr"
                    >
                      <Phone className="w-3 h-3 text-[#F5B700]" />
                      <span>{p.display}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetAndClose}
              className="w-full py-3 rounded-xl border border-[#2D2926] text-sm font-medium text-[#D6D3D1] hover:text-white hover:bg-[#1F1C1A] transition-colors cursor-pointer"
            >
              {pick('گەڕانەوە بۆ مێنوو', 'العودة للقائمة', 'Back to Menu')}
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <ShoppingBag className="w-12 h-12 text-[#57534E] mb-4" strokeWidth={1.5} />
            <h3 className="font-display text-lg font-semibold text-[#F7F4EF] mb-2">
              {pick('سەبەتەکەت بەتاڵە', 'السلة فارغة', 'Your cart is empty')}
            </h3>
            <p className="text-sm text-[#A8A29E] max-w-xs mb-6">
              {pick(
                'لە مێنووەکەوە گەس، بەرگر، ڕیزۆ یان پیتزای دڵخوازی خۆت هەڵبژێرە و زیادی بکە.',
                'اختر ما تشتهيه من الگص أو البركر أو الريزو أو البيتزا وأضفه للسلة.',
                'Choose your favorite shawarma, burgers, rizo, or pizza from the menu.'
              )}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-[#D92323] hover:bg-[#B81C1C] text-sm font-semibold text-white transition-colors cursor-pointer"
            >
              {pick('گەڕانەوە بۆ مێنوو', 'تصفح القائمة', 'Explore Menu')}
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#11100F] border border-[#2B2724] rounded-xl">
                <button
                  type="button"
                  onClick={() => setMode('delivery')}
                  className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    mode === 'delivery'
                      ? 'bg-[#D92323] text-white'
                      : 'text-[#A8A29E] hover:text-[#F7F4EF]'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  <span>{pick('دیلیڤەری', 'توصيل', 'Delivery')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('pickup')}
                  className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    mode === 'pickup'
                      ? 'bg-[#D92323] text-white'
                      : 'text-[#A8A29E] hover:text-[#F7F4EF]'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  <span>{pick('وەرگرتن لە مەتعەم', 'استلام', 'Pickup')}</span>
                </button>
              </div>

              <div className="divide-y divide-[#272320]">
                {items.map((entry) => (
                  <div key={entry.cartKey} className="py-4 first:pt-0 flex gap-3.5">
                    <FoodImage
                      src={entry.item.image}
                      alt={pick(entry.item.nameCkb, entry.item.nameAr, entry.item.nameEn)}
                      className={`w-16 h-16 rounded-xl object-cover shrink-0 bg-[#1F1C1A] ${
                        entry.item.imagePosClass ?? 'object-center'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-semibold text-[#F7F4EF] truncate">
                          {pick(entry.item.nameCkb, entry.item.nameAr, entry.item.nameEn)}
                        </h4>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(entry.cartKey)}
                          aria-label={pick('سڕینەوە', 'حذف', 'Remove item')}
                          className="text-[#78716C] hover:text-red-400 transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-[#A8A29E] mt-0.5">
                        {pick(
                          entry.variant.labelCkb,
                          entry.variant.labelAr,
                          entry.variant.labelEn
                        )}
                        {entry.extras.length > 0 &&
                          ` · ${entry.extras
                            .map((e) => pick(e.labelCkb, e.labelAr, e.labelEn))
                            .join('، ')}`}
                      </p>
                      {entry.note && (
                        <p className="text-xs text-[#F5B700] mt-1 truncate">{entry.note}</p>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1.5 bg-[#1F1C1A] border border-[#2D2926] rounded-lg p-0.5">
                          <button
                            type="button"
                            onClick={() => onUpdateQty(entry.cartKey, -1)}
                            aria-label={pick('کەمکردن', 'إنقاص', 'Decrease')}
                            className="w-7 h-7 rounded flex items-center justify-center text-[#D6D3D1] hover:bg-[#2A2623] cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-num w-6 text-center text-xs font-semibold text-[#F7F4EF]">
                            {entry.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQty(entry.cartKey, 1)}
                            aria-label={pick('زیادکردن', 'زيادة', 'Increase')}
                            className="w-7 h-7 rounded flex items-center justify-center text-[#D6D3D1] hover:bg-[#2A2623] cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="font-num text-sm font-semibold text-[#F7F4EF]">
                          {formatIQD(entry.unitPrice * entry.quantity, lang)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <form
                id="checkout-form"
                onSubmit={handleSubmitOrder}
                className="space-y-3 pt-2 border-t border-[#272320]"
              >
                <h4 className="text-sm font-semibold text-[#F7F4EF]">
                  {pick(
                    'زانیاریی گەیاندن (خزمەتگوزاری گەیاندن بەردەستە)',
                    'معلومات الطلب (خدمة التوصيل متوفرة)',
                    'Customer Details (Delivery Available)'
                  )}
                </h4>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={pick('ناوی تەواو', 'الاسم الكامل', 'Full Name')}
                  className="w-full rounded-xl bg-[#11100F] border border-[#2B2724] px-3.5 py-2.5 text-sm text-[#F7F4EF] placeholder:text-[#78716C] focus:outline-none focus:border-[#D92323]"
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={pick(
                    'ژمارەی مۆبایل (نموونە: 0770...)',
                    'رقم الهاتف (مثال: 0770...)',
                    'Phone Number (e.g. 0770...)'
                  )}
                  className="w-full rounded-xl bg-[#11100F] border border-[#2B2724] px-3.5 py-2.5 text-sm text-[#F7F4EF] placeholder:text-[#78716C] focus:outline-none focus:border-[#D92323]"
                />
                {mode === 'delivery' && (
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={pick(
                      'گەڕەک و ناونیشانی ورد لە سلێمانی',
                      'الحي والعنوان الدقيق في السليمانية',
                      'Neighborhood & Street Address in Sulaymaniyah'
                    )}
                    className="w-full rounded-xl bg-[#11100F] border border-[#2B2724] px-3.5 py-2.5 text-sm text-[#F7F4EF] placeholder:text-[#78716C] focus:outline-none focus:border-[#D92323]"
                  />
                )}
                {errorMsg && <p className="text-xs text-red-400">{errorMsg}</p>}
              </form>
            </div>

            <div className="p-6 border-t border-[#2B2724] bg-[#121110] space-y-4 shrink-0">
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between text-[#A8A29E]">
                  <span>{pick('کۆی خواردنەکان', 'مجموع الطلب', 'Subtotal')}</span>
                  <span className="font-num">{formatIQD(subtotal, lang)}</span>
                </div>
                {mode === 'delivery' && (
                  <div className="flex items-center justify-between text-xs text-[#A8A29E]">
                    <span>{pick('خزمەتگوزاری گەیاندن', 'التوصيل', 'Delivery')}</span>
                    <span>
                      {pick(
                        'بەپێی گەڕەک دیاری دەکرێت',
                        'حسب المنطقة',
                        'Calculated by area'
                      )}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-base font-bold text-[#F7F4EF] pt-2 border-t border-[#25221F]">
                  <span>{pick('کۆی گشتی', 'المجموع الكلي', 'Total')}</span>
                  <span className="font-num text-[#F5B700]">{formatIQD(subtotal, lang)}</span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                className="w-full py-3.5 px-6 rounded-xl bg-[#D92323] hover:bg-[#B81C1C] text-white font-semibold text-sm sm:text-base transition-colors cursor-pointer"
              >
                {pick(
                  'ئامادەکردنی داواکاری',
                  'تأكيد وإرسال الطلب',
                  'Confirm Order'
                )}
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
