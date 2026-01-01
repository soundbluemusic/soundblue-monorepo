// ========================================
// Shopping Domain Dictionary - 쇼핑/상업 도메인 사전
// 쇼핑/결제/배송 관련 어휘
// ========================================

export const SHOPPING_KO_EN: Record<string, string> = {
  // === 쇼핑 일반 (General Shopping) ===
  쇼핑: 'shopping',
  온라인쇼핑: 'online shopping',
  오프라인: 'offline',

  // === 결제 (Payment) ===
  결제: 'payment',
  현금: 'cash',
  카드: 'card',
  신용카드: 'credit card',
  체크카드: 'debit card',
  계좌이체: 'bank transfer',
  영수증: 'receipt',

  // === 할인/프로모션 (Discounts/Promotions) ===
  할인: 'discount',
  세일: 'sale',
  쿠폰: 'coupon',
  포인트: 'points',
  적립: 'accumulation',

  // === 반품/교환 (Returns/Exchange) ===
  환불: 'refund',
  교환: 'exchange',
  반품: 'return',

  // === 배송 (Delivery) ===
  배송: 'delivery',
  택배: 'courier',
  무료배송: 'free shipping',
  당일배송: 'same-day delivery',

  // === 주문 (Order) ===
  주문: 'order',
  장바구니: 'cart',
  위시리스트: 'wishlist',
  재고: 'stock',
  품절: 'sold out',

  // === 가격 (Price) ===
  가격: 'price',
  원가: 'cost',
  정가: 'regular price',
  할인가: 'sale price',
  부가세: 'VAT',
  면세: 'duty-free',
};

export const SHOPPING_EN_KO: Record<string, string> = Object.fromEntries(
  Object.entries(SHOPPING_KO_EN).map(([ko, en]) => [en.toLowerCase(), ko]),
);
