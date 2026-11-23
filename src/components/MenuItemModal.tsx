import { useState } from 'react';
import { X, Plus, Minus, Flame, Check } from 'lucide-react';
import {
  MenuItem,
  MenuVariant,
  MenuExtra,
  EXTRAS,
  Language,
  formatIQD,
} from '../data/menuData';
import { FoodImage } from './FoodImage';

export interface ConfiguredCartItem {
  cartKey: string;
  item: MenuItem;
  variant: MenuVariant;
  spice: 'mild' | 'medium' | 'hot';
  extras: MenuExtra[];
  note: string;
  quantity: number;
  unitPrice: number;
}

interface MenuItemModalProps {
  item: MenuItem;
  lang: Language;
  onClose: () => void;
  onAdd: (configured: ConfiguredCartItem) => void;
}

export function MenuItemModal({ item, lang, onClose, onAdd }: MenuItemModalProps) {
  const [selectedVariant, setSelectedVariant] = useState<MenuVariant>(item.variants[0]);
  const [spice, setSpice] = useState<'mild' | 'medium' | 'hot'>('mild');
  const [selectedExtraIds, setSelectedExtraIds] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [quantity, setQuantity] = useState(1);

  const pick = (ckb: string, ar: string, en: string) =>
    lang === 'ckb' ? ckb : lang === 'ar' ? ar : en;

  const toggleExtra = (id: string) => {
    setSelectedExtraIds((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const selectedExtras = EXTRAS.filter((e) => selectedExtraIds.includes(e.id));
  const extrasSum = selectedExtras.reduce((sum, e) => sum + e.price, 0);
  const unitPrice = item.basePrice + selectedVariant.priceDelta + extrasSum;
  const totalPrice = unitPrice * quantity;

  const handleConfirm = () => {
    const extraSignature = [...selectedExtraIds].sort().join(',');
    const cartKey = `${item.id}__${selectedVariant.id}__${spice}__${extraSignature}__${note.trim()}`;
    onAdd({
      cartKey,
      item,
      variant: selectedVariant,
      spice,
      extras: selectedExtras,
      note: note.trim(),
      quantity,
      unitPrice,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={pick(item.nameCkb, item.nameAr, item.nameEn)}
    >
      <div
        className="w-full max-w-2xl bg-[#1A1816] border border-[#2D2926] rounded-t-2xl sm:rounded-2xl overflow-hidden max-h-[92vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-56 sm:h-64 w-full shrink-0 bg-[#121110]">
          <FoodImage
            src={item.image}
            alt={pick(item.nameCkb, item.nameAr, item.nameEn)}
            className={`w-full h-full object-cover ${item.imagePosClass ?? 'object-center'}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1816] via-[#1A1816]/35 to-transparent" />
          <button
            type="button"
            onClick={onClose}
            aria-label={pick('داخستن', 'إغلاق', 'Close')}
            className="absolute top-4 end-4 w-10 h-10 rounded-full bg-[#121110]/85 border border-[#2D2926] text-[#F7F4EF] flex items-center justify-center hover:bg-[#2A2623] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 start-6 end-6">
            <p className="text-xs text-[#E5E0DA] mb-1">
              {pick(item.metaCkb, item.metaAr, item.metaEn)}
            </p>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-[#F7F4EF]">
              {pick(item.nameCkb, item.nameAr, item.nameEn)}
            </h3>
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <p className="text-sm text-[#C7C2BC] leading-relaxed">
            {pick(item.descriptionCkb, item.descriptionAr, item.descriptionEn)}
          </p>

          <div>
            <h4 className="text-sm font-semibold text-[#F7F4EF] mb-3">
              {pick('قەبارە و جۆر هەڵبژێرە', 'اختر الحجم أو النوع', 'Choose Size / Option')}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {item.variants.map((variant) => {
                const active = selectedVariant.id === variant.id;
                const variantPrice = item.basePrice + variant.priceDelta;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setSelectedVariant(variant)}
                    className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-start transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#D92323]/15 border-[#D92323] text-[#F7F4EF]'
                        : 'bg-[#141311] border-[#2B2724] text-[#D6D3D1] hover:border-[#443E3A]'
                    }`}
                  >
                    <span className="text-sm font-medium">
                      {pick(variant.labelCkb, variant.labelAr, variant.labelEn)}
                    </span>
                    <span className="font-num text-xs font-semibold text-[#F5B700] shrink-0">
                      {formatIQD(variantPrice, lang)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {item.supportsSpice && (
            <div>
              <h4 className="text-sm font-semibold text-[#F7F4EF] mb-3 flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#D92323]" />
                <span>{pick('ئاستی تیژی', 'مستوى الحرارة', 'Spice Level')}</span>
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'mild', ckb: 'بێ تیژی', ar: 'بدون حار', en: 'Mild' },
                    { id: 'medium', ckb: 'مامناوەند', ar: 'وسط', en: 'Medium' },
                    { id: 'hot', ckb: 'تیژ', ar: 'حار', en: 'Spicy' },
                  ] as const
                ).map((lvl) => {
                  const active = spice === lvl.id;
                  return (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setSpice(lvl.id)}
                      className={`py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#D92323] border-[#D92323] text-white'
                          : 'bg-[#141311] border-[#2B2724] text-[#D6D3D1] hover:border-[#443E3A]'
                      }`}
                    >
                      {pick(lvl.ckb, lvl.ar, lvl.en)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold text-[#F7F4EF] mb-3">
              {pick('زیادکراوەکان (بژاردە)', 'الإضافات (اختياري)', 'Add Extras (Optional)')}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {EXTRAS.map((extra) => {
                const checked = selectedExtraIds.includes(extra.id);
                return (
                  <button
                    key={extra.id}
                    type="button"
                    onClick={() => toggleExtra(extra.id)}
                    className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-start transition-colors cursor-pointer ${
                      checked
                        ? 'bg-[#D92323]/15 border-[#D92323] text-[#F7F4EF]'
                        : 'bg-[#141311] border-[#2B2724] text-[#D6D3D1] hover:border-[#443E3A]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-4 h-4 rounded flex items-center justify-center border ${
                          checked
                            ? 'bg-[#D92323] border-[#D92323] text-white'
                            : 'border-[#57534E]'
                        }`}
                      >
                        {checked && <Check className="w-3 h-3" strokeWidth={3} />}
                      </span>
                      <span className="text-sm">
                        {pick(extra.labelCkb, extra.labelAr, extra.labelEn)}
                      </span>
                    </div>
                    <span className="font-num text-xs text-[#F5B700] shrink-0">
                      +{formatIQD(extra.price, lang)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="dish-note"
              className="block text-sm font-semibold text-[#F7F4EF] mb-2"
            >
              {pick('تێبینی بۆ چێشتلێنەر', 'ملاحظات إضافية', 'Special Instructions')}
            </label>
            <input
              id="dish-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={pick(
                'نموونە: بێ پیاز، سۆسی زیاتر، نانی برژاوتر...',
                'مثال: بدون بصل، صوص إضافي...',
                'e.g. No onions, extra Sazi sauce...'
              )}
              className="w-full rounded-xl bg-[#141311] border border-[#2B2724] px-4 py-3 text-sm text-[#F7F4EF] placeholder:text-[#78716C] focus:outline-none focus:border-[#D92323]"
            />
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t border-[#2B2724] bg-[#141311] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2 bg-[#1F1C1A] border border-[#2D2926] rounded-xl p-1">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label={pick('کەمکردن', 'إنقاص', 'Decrease')}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-[#F7F4EF] hover:bg-[#2A2623] transition-colors cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-num w-8 text-center text-sm font-semibold text-[#F7F4EF]">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              aria-label={pick('زیادکردن', 'زيادة', 'Increase')}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-[#F7F4EF] hover:bg-[#2A2623] transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-3 px-6 rounded-xl bg-[#D92323] hover:bg-[#B81C1C] text-white font-semibold text-sm sm:text-base flex items-center justify-between gap-3 transition-colors cursor-pointer"
          >
            <span className="whitespace-nowrap">
              {pick('زیادکردن بۆ سەبەتە', 'إضافة إلى السلة', 'Add to Order')}
            </span>
            <span className="font-num font-bold whitespace-nowrap">
              {formatIQD(totalPrice, lang)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
