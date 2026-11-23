import { useState, useMemo, useEffect } from 'react';
import {
  Search,
  ShoppingBag,
  Plus,
  Phone,
  MapPin,
  Truck,
  ShieldAlert,
  UtensilsCrossed,
  MessageCircle,
  ArrowUpLeft,
  ArrowUpRight,
  Instagram,
  Music2,
  ChefHat,
} from 'lucide-react';
import {
  BRAND_ASSETS,
  CATEGORIES,
  MENU_ITEMS,
  RESTAURANT_INFO,
  CategoryId,
  Language,
  MenuItem,
  formatIQD,
} from './data/menuData';
import { FoodImage } from './components/FoodImage';
import { MenuItemModal, ConfiguredCartItem } from './components/MenuItemModal';
import { CartDrawer } from './components/CartDrawer';

export default function App() {
  const [lang, setLang] = useState<Language>('ckb');
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<ConfiguredCartItem[]>([]);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  const isRtl = lang !== 'en';
  const pick = (ckb: string, ar: string, en: string) =>
    lang === 'ckb' ? ckb : lang === 'ar' ? ar : en;

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [isRtl, lang]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return MENU_ITEMS.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        item.nameCkb.toLowerCase().includes(q) ||
        item.nameAr.toLowerCase().includes(q) ||
        item.nameEn.toLowerCase().includes(q) ||
        item.descriptionCkb.toLowerCase().includes(q) ||
        item.descriptionAr.toLowerCase().includes(q) ||
        item.descriptionEn.toLowerCase().includes(q) ||
        item.metaCkb.toLowerCase().includes(q)
      );
    });
  }, [activeCategory, searchQuery]);

  const cartCount = useMemo(
    () => cart.reduce((sum, entry) => sum + entry.quantity, 0),
    [cart]
  );

  const cartSubtotal = useMemo(
    () => cart.reduce((sum, entry) => sum + entry.unitPrice * entry.quantity, 0),
    [cart]
  );

  const handleAddConfiguredItem = (configured: ConfiguredCartItem) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((c) => c.cartKey === configured.cartKey);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + configured.quantity,
        };
        return updated;
      }
      return [...prev, configured];
    });
    setRecentlyAddedId(configured.item.id);
    setTimeout(() => setRecentlyAddedId(null), 1100);
  };

  const handleQuickAdd = (item: MenuItem) => {
    const defaultVariant = item.variants[0];
    const cartKey = `${item.id}__${defaultVariant.id}__mild____`;
    handleAddConfiguredItem({
      cartKey,
      item,
      variant: defaultVariant,
      spice: 'mild',
      extras: [],
      note: '',
      quantity: 1,
      unitPrice: item.basePrice + defaultVariant.priceDelta,
    });
  };

  const handleUpdateQty = (cartKey: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((entry) =>
          entry.cartKey === cartKey
            ? { ...entry, quantity: entry.quantity + delta }
            : entry
        )
        .filter((entry) => entry.quantity > 0)
    );
  };

  const handleRemoveItem = (cartKey: string) => {
    setCart((prev) => prev.filter((entry) => entry.cartKey !== cartKey));
  };

  const ArrowIcon = isRtl ? ArrowUpLeft : ArrowUpRight;

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#121110] text-[#F7F4EF] flex flex-col"
    >
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-40 bg-[#121110]/92 backdrop-blur-md border-b border-[#262320]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          <a
            href="#top"
            className="font-display text-xl font-extrabold tracking-tight text-[#F7F4EF] whitespace-nowrap shrink-0"
          >
            {pick(
              RESTAURANT_INFO.brandCkb,
              RESTAURANT_INFO.brandAr,
              RESTAURANT_INFO.brandEn
            )}
          </a>

          <nav
            aria-label={pick('ناڤیگەیشنی سەرەکی', 'القائمة الرئيسية', 'Primary Navigation')}
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#C7C2BC]"
          >
            <a
              href="#menu"
              className="hover:text-[#F7F4EF] transition-colors whitespace-nowrap shrink-0"
            >
              {pick('مێنوو', 'القائمة', 'Menu')}
            </a>
            <a
              href="#specialties"
              className="hover:text-[#F7F4EF] transition-colors whitespace-nowrap shrink-0"
            >
              {pick('تایبەتمەندییەکان', 'ما يميزنا', 'Craftsmanship')}
            </a>
            <a
              href="#location"
              className="hover:text-[#F7F4EF] transition-colors whitespace-nowrap shrink-0"
            >
              {pick('ناونیشان', 'العنوان', 'Location')}
            </a>
            <a
              href="#contact"
              className="hover:text-[#F7F4EF] transition-colors whitespace-nowrap shrink-0"
            >
              {pick('پەیوەندی', 'اتصل بنا', 'Contact')}
            </a>
          </nav>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#D92323] hover:bg-[#B81C1C] text-white text-sm font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span>{pick('سەبەتە', 'السلة', 'Cart')}</span>
              <span className="font-num px-1.5 py-0.5 rounded bg-black/30 text-xs">
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="flex-1">
        {/* Section 1: Asymmetric Hero + 4-Column Branch Info Strip */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-between bg-[#1A1816] border border-[#2A2623] rounded-2xl p-6 sm:p-10">
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <img
                    src={BRAND_ASSETS.logo}
                    alt={pick('لۆگۆی گەسی سازی', 'شعار كص سازي', 'Gasi Sazi Logo')}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-[#2F2B28] shrink-0 shadow-md"
                  />
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-[#F5B700]">
                      {pick(
                        RESTAURANT_INFO.sloganCkb,
                        RESTAURANT_INFO.sloganAr,
                        RESTAURANT_INFO.sloganEn
                      )}
                    </p>
                    <p className="text-xs sm:text-sm text-[#A8A29E] mt-1">
                      {pick(
                        'سلێمانی · شەقامی سالم · تەنیشت پردی خەسرەو خاڵ',
                        'السليمانية · شارع سالم · بجانب جسر خسرو خال',
                        'Sulaymaniyah · Salim Street · Khasraw Khal Bridge'
                      )}
                    </p>
                  </div>
                </div>

                <h1
                  style={{ textWrap: 'balance' }}
                  className="font-display text-3xl sm:text-5xl font-extrabold text-[#F7F4EF] leading-[1.22] tracking-tight"
                >
                  {pick(
                    'گەسی ڕەسەن، بەرگر، پیتزا و ڕیزۆ بە تامی تایبەتی سازی',
                    'أصالة الگص، البركر، البيتزا والريزو بنكهة سازي الخاصة',
                    'Authentic Shawarma, Burgers, Rizo & Pizza from Gasi Sazi'
                  )}
                </h1>

                <p className="text-sm sm:text-base text-[#C7C2BC] leading-relaxed max-w-xl">
                  {pick(
                    'لەفەی گەسی گۆشت و مریشک، نەفەر و کیلۆ، بەرگری برژاو، ڕیزۆ، کنتاکی، پیتزای گەرم و موقەبیلاتی تازەی ڕۆژانە بە گەیاندنی خێرا بۆ هەموو سلێمانی.',
                    'لفات الگص لحم ودجاج، نفر وكيلو، بركر مشوي، ريزو، كنتاكي، بيتزا ساخنة ومقبلات يومية طازجة مع خدمة توصيل سريعة.',
                    'Beef & chicken gas wraps, full platters by the kilo, flame-grilled burgers, crispy tenders, rizo bowls, stone-oven pizzas, and fresh meze.'
                  )}
                </p>
              </div>

              <div className="pt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#menu"
                  className="px-6 py-3.5 rounded-xl bg-[#D92323] hover:bg-[#B81C1C] text-white font-semibold text-sm sm:text-base inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
                >
                  <span>{pick('بینینی مێنوو و داواکردن', 'تصفح القائمة والطلب', 'Browse Menu & Order')}</span>
                  <ArrowIcon className="w-4 h-4" />
                </a>
                <a
                  href={RESTAURANT_INFO.orderPhones[0].href}
                  className="px-5 py-3.5 rounded-xl bg-[#221F1C] hover:bg-[#2B2724] border border-[#322E2A] text-[#F7F4EF] font-medium text-sm sm:text-base inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
                >
                  <Phone className="w-4 h-4 text-[#F5B700]" />
                  <span className="font-num" dir="ltr">
                    {RESTAURANT_INFO.orderPhones[0].display}
                  </span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-6 relative rounded-2xl overflow-hidden border border-[#2A2623] min-h-[300px] sm:min-h-[400px] bg-[#1A1816]">
              <FoodImage
                src={BRAND_ASSETS.heroBanner}
                alt={pick(
                  'لەفەی گەسی گۆشتی سازی لە بەردەم سیخی گەرمدا',
                  'لفة گص لحم سازي طازجة من السيخ',
                  'Freshly carved Sazi Beef Gas Wrap by the rotisserie'
                )}
                className="w-full h-full lg:h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
              <div className="absolute bottom-5 start-5 end-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs text-[#E7E5E4]">
                    {pick('ژەمی پێشنیارکراو', 'اختيارنا اليوم', "Today's Signature")}
                  </p>
                  <p className="font-display text-lg sm:text-xl font-bold text-white">
                    {pick(
                      'لەفەی گەسی گۆشتی تازە',
                      'لفة گص لحم طازج',
                      'Fresh Carved Beef Gas Wrap'
                    )}
                  </p>
                </div>
                <span className="font-num text-base sm:text-lg font-bold text-[#F5B700] whitespace-nowrap shrink-0">
                  {formatIQD(3500, lang)}
                </span>
              </div>
            </div>
          </div>

          {/* 4-column Authentic Restaurant Info Strip */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#181614] border border-[#272320] rounded-xl p-4 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#D92323] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-[#A8A29E]">
                  {pick('ناونیشان', 'العنوان', 'Location')}
                </p>
                <p className="text-sm font-semibold text-[#F7F4EF] mt-0.5">
                  {pick(
                    'شەقامی سالم، تەنیشت پردی خەسرەو خاڵ',
                    'شارع سالم، بجانب جسر خسرو خال',
                    'Salim St., beside Khasraw Khal Bridge'
                  )}
                </p>
              </div>
            </div>

            <div className="bg-[#181614] border border-[#272320] rounded-xl p-4 flex items-start gap-3">
              <Phone className="w-5 h-5 text-[#D92323] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-[#A8A29E]">
                  {pick('ژمارەکانی داواکاری', 'أرقام الطلب', 'Order Hotlines')}
                </p>
                <p className="font-num text-sm font-semibold text-[#F7F4EF] mt-0.5" dir="ltr">
                  0770 249 1515
                </p>
                <p className="text-xs text-[#A8A29E] font-num" dir="ltr">
                  0770 126 3050 · 0770 544 4944
                </p>
              </div>
            </div>

            <div className="bg-[#181614] border border-[#272320] rounded-xl p-4 flex items-start gap-3">
              <Truck className="w-5 h-5 text-[#D92323] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-[#A8A29E]">
                  {pick('خزمەتگوزاری گەیاندن', 'خدمة التوصيل', 'Delivery Service')}
                </p>
                <p className="text-sm font-semibold text-[#F7F4EF] mt-0.5">
                  {pick(
                    'گەیاندنی خێرا بەردەستە لە سلێمانی',
                    'التوصيل السريع متوفر في السليمانية',
                    'Fast delivery across Sulaymaniyah'
                  )}
                </p>
              </div>
            </div>

            <a
              href={RESTAURANT_INFO.complaintsPhone.href}
              className="bg-[#181614] border border-[#272320] hover:border-[#3E3833] rounded-xl p-4 flex items-start gap-3 transition-colors"
            >
              <ShieldAlert className="w-5 h-5 text-[#F5B700] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-[#A8A29E]">
                  {pick('بۆ گلەیی و پێشنیار', 'للشكاوى والمقترحات', 'Complaints & Feedback')}
                </p>
                <p className="font-num text-sm font-semibold text-[#F5B700] mt-0.5" dir="ltr">
                  {RESTAURANT_INFO.complaintsPhone.display}
                </p>
              </div>
            </a>
          </div>
        </section>

        {/* Section 2: Interactive Digital Menu */}
        <section
          id="menu"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-[#23201D]"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <p className="text-xs font-medium text-[#F5B700] mb-1.5">
                {pick(
                  'مێنووی فەرمیی خواردنەکانی سازی',
                  'القائمة الرسمية لمطعم كص سازي',
                  'Official Gasi Sazi Digital Menu'
                )}
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F7F4EF]">
                {pick(
                  'گەس، بەرگر، ڕیزۆ، پیتزا و فنگەر',
                  'الگص، البركر، الريزو، البيتزا والفنگر',
                  'Shawarma, Burgers, Rizo, Pizza & More'
                )}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-[#78716C] absolute top-1/2 -translate-y-1/2 start-3.5 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={pick('گەڕان لە مێنوو...', 'بحث في القائمة...', 'Search menu...')}
                  className="w-full rounded-xl bg-[#1A1816] border border-[#2B2724] ps-10 pe-4 py-2.5 text-sm text-[#F7F4EF] placeholder:text-[#78716C] focus:outline-none focus:border-[#D92323]"
                />
              </div>

              <div
                role="group"
                aria-label={pick('زمان', 'اللغة', 'Language')}
                className="flex items-center p-1 rounded-xl bg-[#1A1816] border border-[#2B2724]"
              >
                {(
                  [
                    { id: 'ckb', label: 'کوردی' },
                    { id: 'ar', label: 'عربي' },
                    { id: 'en', label: 'EN' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLang(item.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      lang === item.id
                        ? 'bg-[#D92323] text-white'
                        : 'text-[#C7C2BC] hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8">
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#D92323] text-white'
                      : 'bg-[#1A1816] border border-[#292522] text-[#C7C2BC] hover:text-[#F7F4EF] hover:border-[#3D3733]'
                  }`}
                >
                  {pick(cat.labelCkb, cat.labelAr, cat.labelEn)}
                </button>
              );
            })}
          </div>

          {/* 3-Column Menu Grid */}
          {filteredItems.length === 0 ? (
            <div className="bg-[#181614] border border-[#272320] rounded-2xl p-12 text-center">
              <p className="text-base font-semibold text-[#F7F4EF] mb-2">
                {pick('هیچ خواردنێک نەدۆزرایەوە', 'لم يتم العثور على أصناف', 'No dishes match your search')}
              </p>
              <p className="text-sm text-[#A8A29E] mb-5">
                {pick(
                  'وشەی گەڕان بگۆڕە یان هەموو مێنوو پیشان بدە.',
                  'جرّب كلمة بحث أخرى أو اعرض كل القائمة.',
                  'Try another search term or view all categories.'
                )}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="px-5 py-2.5 rounded-xl bg-[#D92323] text-white text-sm font-semibold cursor-pointer"
              >
                {pick('پیشاندانی هەموو مێنوو', 'عرض كل القائمة', 'Show All Dishes')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => {
                const isJustAdded = recentlyAddedId === item.id;
                const featuredText = pick(
                  item.featuredLabelCkb ?? '',
                  item.featuredLabelAr ?? '',
                  item.featuredLabelEn ?? ''
                );
                const hasMultipleVariants = item.variants.length > 1;
                return (
                  <article
                    key={item.id}
                    className="group bg-[#181614] border border-[#292522] hover:border-[#423B36] rounded-2xl overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-0.5"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedItem(item)}
                      className="relative aspect-[4/3] w-full overflow-hidden bg-[#121110] text-start cursor-pointer"
                    >
                      <FoodImage
                        src={item.image}
                        alt={pick(item.nameCkb, item.nameAr, item.nameEn)}
                        className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03] ${
                          item.imagePosClass ?? 'object-center'
                        }`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#181614]/85 via-transparent to-transparent" />
                      {featuredText && (
                        <span className="absolute top-3 start-3 px-2.5 py-1 rounded-lg bg-[#121110]/85 border border-[#2D2926] text-xs font-medium text-[#F5B700]">
                          {featuredText}
                        </span>
                      )}
                    </button>

                    <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                      <div>
                        <p className="text-xs text-[#A8A29E] mb-1.5">
                          {pick(item.metaCkb, item.metaAr, item.metaEn)}
                        </p>
                        <button
                          type="button"
                          onClick={() => setSelectedItem(item)}
                          className="text-start cursor-pointer"
                        >
                          <h3 className="font-display text-lg font-bold text-[#F7F4EF] group-hover:text-[#F5B700] transition-colors">
                            {pick(item.nameCkb, item.nameAr, item.nameEn)}
                          </h3>
                        </button>
                        <p className="text-sm text-[#A8A29E] mt-2 leading-relaxed line-clamp-2">
                          {pick(item.descriptionCkb, item.descriptionAr, item.descriptionEn)}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#24211E] flex items-center justify-between gap-3">
                        <div>
                          <span className="font-num text-base font-bold text-[#F5B700]">
                            {hasMultipleVariants
                              ? `${pick('لە ', 'من ', 'From ')}${formatIQD(item.basePrice, lang)}`
                              : formatIQD(item.basePrice, lang)}
                          </span>
                          <span className="block text-[11px] text-[#78716C]">
                            {hasMultipleVariants
                              ? pick(
                                  `${item.variants.length} جۆر و قەبارە`,
                                  `${item.variants.length} أحجام وخيارات`,
                                  `${item.variants.length} sizes & options`
                                )
                              : pick('ئامادەکردنی دەستبەجێ', 'تحضير فوري', 'Made fresh to order')}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setSelectedItem(item)}
                            className="px-3.5 py-2 rounded-xl bg-[#221F1C] hover:bg-[#2C2824] border border-[#322E2A] text-xs font-medium text-[#E7E5E4] transition-colors whitespace-nowrap cursor-pointer"
                          >
                            {pick('هەڵبژاردن', 'تخصيص', 'Options')}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAdd(item)}
                            aria-label={pick('زیادکردنی خێرا', 'إضافة سريعة', 'Quick add')}
                            className={`h-9 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                              isJustAdded
                                ? 'bg-emerald-600 text-white'
                                : 'bg-[#D92323] hover:bg-[#B81C1C] text-white'
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>
                              {isJustAdded
                                ? pick('زیادکرا', 'تمت الإضافة', 'Added')
                                : pick('زیادکردن', 'أضف', 'Add')}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Section 3: Brand Craftsmanship & Authentic Kitchen Showcase */}
        <section
          id="specialties"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 border-t border-[#23201D]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-5 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <p className="text-xs font-medium text-[#F5B700]">
                  {pick('تایبەتمەندییەکانی گەسی سازی', 'ما يميز مطعم كص سازي', 'The Gasi Sazi Standard')}
                </p>
                <h2
                  style={{ textWrap: 'balance' }}
                  className="font-display text-2xl sm:text-3xl font-bold text-[#F7F4EF] leading-snug"
                >
                  {pick(
                    'لە سازی تام و بۆنێکی دیکەی هەیە',
                    'في سازي طعم ونكهة مختلفة عن الجميع',
                    'Crafted Fresh Daily on Salim Street'
                  )}
                </h2>
                <p className="text-sm sm:text-base text-[#A8A29E] leading-relaxed">
                  {pick(
                    'لە ئامادەکردنی گەسی ڕۆژانە و برژاندنی بەرگر لەسەر ئاگرەوە، تا پاکەتکردنی تایبەتی گەرمهێڵەرەوە بۆ گەیاندن.',
                    'من تجهيز سيخ الگص اليومي وشوي البركر على اللهب، وصولاً إلى التغليف الحراري الخاص بالتوصيل.',
                    'From hand-stacked shawarma spits and flame-seared burgers to custom heat-retaining delivery boxes.'
                  )}
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-[#181614] border border-[#282421] rounded-xl p-4 flex items-start gap-3">
                  <ChefHat className="w-5 h-5 text-[#D92323] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-display text-sm font-bold text-[#F7F4EF]">
                      {pick('٠١. گۆشتی تازە و بەهاراتی تایبەت', '٠١. لحوم طازجة وتتبيلة خاصة', '01. Daily Fresh Meats & Marinades')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#A8A29E] mt-1">
                      {pick(
                        'گۆشت و مریشکی تازە هەموو ڕۆژێک بە پێکهاتەی سروشتی دەبەسترێن.',
                        'يتم تحضير اللحوم والدجاج يومياً بأجود البهارات الطبيعية.',
                        'Beef and chicken spits prepared fresh every morning with balanced house spices.'
                      )}
                    </p>
                  </div>
                </div>

                <div className="bg-[#181614] border border-[#282421] rounded-xl p-4 flex items-start gap-3">
                  <UtensilsCrossed className="w-5 h-5 text-[#F5B700] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-display text-sm font-bold text-[#F7F4EF]">
                      {pick('٠٢. صۆصی تایبەتی سازی و موقەبیلاتی ڕۆژانە', '٠٢. صوص سازي والمقبلات اليومية', '02. Signature Sauce & Fresh Meze')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#A8A29E] mt-1">
                      {pick(
                        'صۆصی تایبەتی سازی و بارێکی دەوڵەمەندی موقەبیلاتی تازە بۆ تەواوکردنی ژەمەکەت.',
                        'صوص سازي السري وبوفيه مقبلات طازجة لإكمال وجبتك.',
                        'Our signature house dipping sauce paired with daily freshly prepared salads and meze.'
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="relative rounded-2xl overflow-hidden border border-[#2A2623] min-h-[280px] bg-[#181614]">
                <FoodImage
                  src={BRAND_ASSETS.flameGrill}
                  alt={pick('چیزبەرگەری گەرم لەسەر گڕ لە سازی', 'تشيز بركر مشوي على اللهب في سازي', 'Flame-seared Sazi cheeseburger on the grill')}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <p className="absolute bottom-4 start-4 end-4 text-sm font-semibold text-white">
                  {pick('تامی ڕاستەقینەی چیزبەرگەر لەسەر ئاگر', 'بركر مشوي على اللهب الحقيقي', 'Flame-Grilled Cheeseburgers')}
                </p>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-[#2A2623] min-h-[280px] bg-[#181614]">
                <FoodImage
                  src={BRAND_ASSETS.packagingSpread}
                  alt={pick('پاکەت و بۆکسی تایبەتی گەیاندنی گەسی سازی', 'تغليف وصناديق التوصيل الخاصة بمطعم سازي', 'Sazi branded takeout boxes and fresh wrap')}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <p className="absolute bottom-4 start-4 end-4 text-sm font-semibold text-white">
                  {pick('بۆکسی تایبەتی سازی بۆ دیلیڤەری خێرا', 'تغليف خاص يحفظ حرارة الطعام', 'Signature Insulated Delivery Boxes')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Branch Location, All Order Numbers, Complaints & Socials */}
        <section
          id="location"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16"
        >
          <div
            id="contact"
            className="bg-[#181614] border border-[#292522] rounded-2xl p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            <div className="lg:col-span-7 space-y-5">
              <div>
                <p className="text-xs font-medium text-[#F5B700] mb-1">
                  {pick('سەردانمان بکە یان پەیوەندی بکە', 'زورونا أو اتصلوا بنا', 'Visit or Call Direct')}
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F7F4EF]">
                  {pick('مەتعەم گەسی سازی — سلێمانی', 'مطعم كص سازي — السليمانية', 'Gasi Sazi — Sulaymaniyah')}
                </h2>
              </div>

              <div className="space-y-3 text-sm text-[#C7C2BC]">
                <p className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#D92323] shrink-0 mt-1" />
                  <span>
                    {pick(
                      RESTAURANT_INFO.addressCkb,
                      RESTAURANT_INFO.addressAr,
                      RESTAURANT_INFO.addressEn
                    )}
                  </span>
                </p>
                <p className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-[#F5B700] shrink-0" />
                  <span>
                    {pick(
                      'خزمەتگوزاری گەیاندن بۆ سەرجەم گەڕەکەکانی سلێمانی بەردەستە',
                      'خدمة التوصيل متوفرة لكافة مناطق السليمانية',
                      'Delivery service available across Sulaymaniyah'
                    )}
                  </span>
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href={`https://wa.me/${RESTAURANT_INFO.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-xl bg-[#D92323] hover:bg-[#B81C1C] text-sm font-semibold text-white inline-flex items-center gap-2 transition-colors whitespace-nowrap"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{pick('داواکردن لە واتساپ', 'الطلب عبر واتساب', 'Order via WhatsApp')}</span>
                </a>

                <a
                  href={RESTAURANT_INFO.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 rounded-xl bg-[#221F1C] hover:bg-[#2C2824] border border-[#322E2A] text-sm font-medium text-[#F7F4EF] inline-flex items-center gap-2 transition-colors whitespace-nowrap"
                >
                  <Instagram className="w-4 h-4 text-[#F5B700]" />
                  <span dir="ltr">{RESTAURANT_INFO.instagramHandle}</span>
                </a>

                <a
                  href={RESTAURANT_INFO.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 rounded-xl bg-[#221F1C] hover:bg-[#2C2824] border border-[#322E2A] text-sm font-medium text-[#F7F4EF] inline-flex items-center gap-2 transition-colors whitespace-nowrap"
                >
                  <Music2 className="w-4 h-4 text-[#F5B700]" />
                  <span dir="ltr">{RESTAURANT_INFO.tiktokHandle}</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-xl bg-[#121110] border border-[#282421] space-y-3">
                <p className="text-xs font-medium text-[#A8A29E]">
                  {pick('ژمارەکانی مەتعەم بۆ داواکاری:', 'أرقام المطعم للطلبات:', 'Restaurant Order Numbers:')}
                </p>
                <div className="grid grid-cols-1 gap-2.5">
                  {RESTAURANT_INFO.orderPhones.map((phoneItem) => (
                    <a
                      key={phoneItem.display}
                      href={phoneItem.href}
                      className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-[#1A1816] border border-[#2B2724] hover:border-[#D92323] transition-colors"
                    >
                      <span className="inline-flex items-center gap-2 text-xs text-[#C7C2BC]">
                        <Phone className="w-3.5 h-3.5 text-[#D92323]" />
                        <span>{pick('پەیوەندی', 'اتصال', 'Call')}</span>
                      </span>
                      <span className="font-num text-sm font-bold text-[#F7F4EF]" dir="ltr">
                        {phoneItem.display}
                      </span>
                    </a>
                  ))}
                </div>
              </div>

              <a
                href={RESTAURANT_INFO.complaintsPhone.href}
                className="flex items-center justify-between px-5 py-3.5 rounded-xl bg-[#121110] border border-[#2F2A24] hover:border-[#F5B700] transition-colors"
              >
                <span className="inline-flex items-center gap-2.5 text-xs sm:text-sm font-medium text-[#F5B700]">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{pick('بۆ گلەیی و پێشنیار', 'للشكاوى والمقترحات', 'Complaints & Feedback')}</span>
                </span>
                <span className="font-num text-sm font-bold text-[#F7F4EF]" dir="ltr">
                  {RESTAURANT_INFO.complaintsPhone.display}
                </span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-[#23201D] bg-[#100F0E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#78716C]">
          <div className="flex items-center gap-3">
            <img
              src={BRAND_ASSETS.logo}
              alt={pick('گەسی سازی', 'كص سازي', 'Gasi Sazi')}
              className="w-7 h-7 rounded-lg object-cover"
            />
            <p>
              © {new Date().getFullYear()}{' '}
              {pick(
                'مەتعەم گەسی سازی — شەقامی سالم، سلێمانی',
                'مطعم كص سازي — شارع سالم، السليمانية',
                'Gasi Sazi Restaurant — Salim Street, Sulaymaniyah'
              )}
            </p>
          </div>
          <div className="flex items-center gap-5">
            <a href="#menu" className="hover:text-[#D6D3D1] transition-colors">
              {pick('مێنوو', 'القائمة', 'Menu')}
            </a>
            <a href="#specialties" className="hover:text-[#D6D3D1] transition-colors">
              {pick('تایبەتمەندییەکان', 'ما يميزنا', 'Craftsmanship')}
            </a>
            <a href="#location" className="hover:text-[#D6D3D1] transition-colors">
              {pick('ناونیشان و پەیوەندی', 'العنوان والاتصال', 'Contact')}
            </a>
          </div>
        </div>
      </footer>

      {/* Mobile Compact Cart Trigger when items > 0 (respects <= 15% mobile sticky cap) */}
      {cartCount > 0 && !cartOpen && (
        <div className="fixed bottom-4 inset-x-4 z-30 md:hidden">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="w-full py-3 px-4 rounded-xl bg-[#D92323] text-white font-semibold text-sm flex items-center justify-between shadow-xl cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span>
                {pick(
                  `بینینی سەبەتە (${cartCount})`,
                  `عرض السلة (${cartCount})`,
                  `View Order (${cartCount})`
                )}
              </span>
            </span>
            <span className="font-num font-bold">{formatIQD(cartSubtotal, lang)}</span>
          </button>
        </div>
      )}

      {selectedItem && (
        <MenuItemModal
          item={selectedItem}
          lang={lang}
          onClose={() => setSelectedItem(null)}
          onAdd={handleAddConfiguredItem}
        />
      )}

      <CartDrawer
        isOpen={cartOpen}
        lang={lang}
        items={cart}
        onClose={() => setCartOpen(false)}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onClearCart={() => setCart([])}
      />
    </div>
  );
}
