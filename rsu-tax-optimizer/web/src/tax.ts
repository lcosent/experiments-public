export interface TaxBreakdown {
  federal: number;
  state: number;
  fica_ss: number;
  fica_medicare: number;
  addl_medicare: number;
  niit: number;
  total: number;
}

export const FEDERAL_BRACKETS_SINGLE = [
  { floor: 0, rate: 0.10 },
  { floor: 12000, rate: 0.12 },
  { floor: 49000, rate: 0.22 },
  { floor: 105000, rate: 0.24 },
  { floor: 201000, rate: 0.32 },
  { floor: 256000, rate: 0.35 },
  { floor: 640000, rate: 0.37 },
];

export const FEDERAL_BRACKETS_MFJ = [
  { floor: 0, rate: 0.10 },
  { floor: 24000, rate: 0.12 },
  { floor: 98000, rate: 0.22 },
  { floor: 211000, rate: 0.24 },
  { floor: 403000, rate: 0.32 },
  { floor: 513000, rate: 0.35 },
  { floor: 770000, rate: 0.37 },
];

export const STD_DEDUCTION: Record<string, number> = {
  single: 15000,
  married_filing_jointly: 30000
};

export const SS_WAGE_BASE = 176100;
export const SS_RATE = 0.062;
export const MEDICARE_RATE = 0.0145;
export const ADDL_MEDICARE_THRESHOLD: Record<string, number> = {
  single: 200000,
  married_filing_jointly: 250000
};
export const ADDL_MEDICARE_RATE = 0.009;
export const NIIT_RATE = 0.038;
export const NIIT_THRESHOLD: Record<string, number> = {
  single: 200000,
  married_filing_jointly: 250000
};

export const SUPPLEMENTAL_LOW = 0.22;
export const SUPPLEMENTAL_HIGH = 0.37;
export const SUPPLEMENTAL_HIGH_THRESHOLD = 1000000;

export function applyBrackets(taxable: number, bands: { floor: number; rate: number }[]): number {
  let tax = 0;
  for (let i = 0; i < bands.length; i++) {
    const floor = bands[i].floor;
    const rate = bands[i].rate;
    const ceiling = i + 1 < bands.length ? bands[i + 1].floor : Infinity;
    
    if (taxable > floor) {
      const sliceAmount = Math.min(taxable, ceiling) - floor;
      tax += sliceAmount * rate;
    } else {
      break;
    }
  }
  return Math.round(tax * 100) / 100;
}

export function stateTax(state: string, taxable: number, _filing?: string): number {
  const st = state.toUpperCase();
  if (["WA", "TX", "FL", "TN", "NV"].includes(st)) {
    return 0.0;
  }
  if (st === "CA") {
    const bands = [
      { floor: 0, rate: 0.01 },
      { floor: 10000, rate: 0.02 },
      { floor: 24000, rate: 0.04 },
      { floor: 38000, rate: 0.06 },
      { floor: 53000, rate: 0.08 },
      { floor: 67000, rate: 0.093 },
      { floor: 340000, rate: 0.103 },
      { floor: 408000, rate: 0.113 },
      { floor: 680000, rate: 0.123 },
    ];
    return applyBrackets(taxable, bands);
  }
  if (st === "NY") {
    const bands = [
      { floor: 0, rate: 0.04 },
      { floor: 8500, rate: 0.045 },
      { floor: 11700, rate: 0.0525 },
      { floor: 13900, rate: 0.055 },
      { floor: 80650, rate: 0.06 },
      { floor: 215400, rate: 0.0685 },
      { floor: 1077550, rate: 0.0965 },
      { floor: 5000000, rate: 0.103 },
    ];
    return applyBrackets(taxable, bands);
  }
  return 0.0;
}

export function incomeTax(
  wages: number,
  capitalGainsLt: number,
  capitalGainsSt: number,
  state: string,
  filing: string
): TaxBreakdown {
  const brackets = filing === "married_filing_jointly" ? FEDERAL_BRACKETS_MFJ : FEDERAL_BRACKETS_SINGLE;
  const std = STD_DEDUCTION[filing] || 15000;

  const ordinaryIncome = wages + capitalGainsSt;
  const taxableOrd = Math.max(0.0, ordinaryIncome - std);
  const federalOrd = applyBrackets(taxableOrd, brackets);

  // LTCG simplified
  const ltcgTopThreshold = filing === "married_filing_jointly" ? 535000 : 480000;
  let federalLtcg = 0;
  if (capitalGainsLt + taxableOrd <= ltcgTopThreshold) {
    federalLtcg = capitalGainsLt * 0.15;
  } else {
    federalLtcg = capitalGainsLt * 0.20;
  }

  const fedTotal = federalOrd + federalLtcg;

  const ss = Math.min(wages, SS_WAGE_BASE) * SS_RATE;
  const medicare = wages * MEDICARE_RATE;
  const addlMedTaxable = Math.max(0.0, wages - (ADDL_MEDICARE_THRESHOLD[filing] || 200000));
  const addlMed = addlMedTaxable * ADDL_MEDICARE_RATE;

  const niitTaxable = Math.max(0.0, (wages + capitalGainsLt + capitalGainsSt) - (NIIT_THRESHOLD[filing] || 200000));
  const niit = Math.min(niitTaxable, capitalGainsLt + capitalGainsSt) * NIIT_RATE;

  const stateTaxValue = stateTax(state, taxableOrd, filing) + stateTax(state, capitalGainsLt + capitalGainsSt, filing);

  const total = fedTotal + stateTaxValue + ss + medicare + addlMed + niit;

  return {
    federal: Math.round(fedTotal * 100) / 100,
    state: Math.round(stateTaxValue * 100) / 100,
    fica_ss: Math.round(ss * 100) / 100,
    fica_medicare: Math.round(medicare * 100) / 100,
    addl_medicare: Math.round(addlMed * 100) / 100,
    niit: Math.round(niit * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

export function supplementalWithholding(rsuIncome: number): number {
  if (rsuIncome <= SUPPLEMENTAL_HIGH_THRESHOLD) {
    return rsuIncome * SUPPLEMENTAL_LOW;
  }
  return (
    SUPPLEMENTAL_HIGH_THRESHOLD * SUPPLEMENTAL_LOW +
    (rsuIncome - SUPPLEMENTAL_HIGH_THRESHOLD) * SUPPLEMENTAL_HIGH
  );
}
