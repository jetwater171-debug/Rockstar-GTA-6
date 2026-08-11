const offers = Object.freeze({
  standard: Object.freeze({
    id: 'standard',
    title: 'GTA VI Standard',
    amountCents: 20798,
    currency: 'BRL',
  }),
  ultimate: Object.freeze({
    id: 'ultimate',
    title: 'GTA VI Ultimate',
    amountCents: 28930,
    currency: 'BRL',
  }),
  early: Object.freeze({
    id: 'early',
    title: 'GTA VI Acesso Antecipado',
    amountCents: 35990,
    currency: 'BRL',
  }),
});

function normalizeOfferId(value) {
  if (typeof value !== 'string') return '';
  const id = value.trim().toLowerCase();
  return /^[a-z0-9_-]{1,32}$/.test(id) ? id : '';
}

export function checkoutOffer(offerId) {
  const id = normalizeOfferId(offerId);
  return id && Object.hasOwn(offers, id) ? offers[id] : null;
}

export function publicCheckoutOffer(offerId) {
  const offer = checkoutOffer(offerId);
  if (!offer) return null;
  return {
    id: offer.id,
    title: offer.title,
    amountCents: offer.amountCents,
    currency: offer.currency,
  };
}

export const checkoutOfferIds = Object.freeze(Object.keys(offers));
