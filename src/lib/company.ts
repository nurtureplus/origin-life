/**
 * Legal and contact identity of the business.
 *
 * The policy pages read every company detail from here rather than hard-coding
 * it into prose, so the registered name, address and licence number are stated
 * in one place and can't disagree with each other across five documents.
 *
 * TODO before launch: replace every placeholder below with the real registered
 * details. Anything left as a placeholder renders visibly as "[…]" on the live
 * policy pages — that is deliberate. A policy page with a wrong address is
 * worse than one that is obviously unfinished.
 */
export const COMPANY = {
  /** Trading name shown to customers. */
  name: "OriginLife",
  /** Registered legal entity name, as on the incorporation certificate. */
  legalName: "[Registered company name]",
  registeredAddress: "[Registered address, city, state, PIN]",
  /** FSSAI licence for the business (products carry their own on the label). */
  fssaiLicense: "[FSSAI licence number]",
  gstin: "[GSTIN]",
  cin: "[CIN]",
  supportEmail: "hello@originlife.co",
  grievanceEmail: "[grievance officer email]",
  grievanceOfficer: "[Grievance officer name]",
  supportPhone: "[Support phone number]",
  supportHours: "Monday to Saturday, 10am – 6pm IST",
  /** Governing law / venue for disputes. */
  jurisdiction: "[City], India",
} as const;

/** Last review date shown on the policy pages. Update when the text changes. */
export const POLICY_LAST_UPDATED = "12 August 2026";

export const SHIPPING = {
  freeShippingThresholdPaise: 99900,
  dispatchWindow: "1–2 business days",
  metroDelivery: "2–4 business days",
  restOfIndiaDelivery: "4–7 business days",
  flatRatePaise: 9900,
  returnWindowDays: 7,
  refundWindowDays: 7,
} as const;
