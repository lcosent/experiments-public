import { incomeTax } from './tax';

export interface Vest {
  date: string;
  shares: number;
  cumulative_shares: number;
}

export interface Profile {
  filing_status: string;
  state: string;
  salary_w2_usd: number;
  vests: Vest[];
  current_price: number;
  drift_annual: number;
  vol_annual: number;
}

export interface StrategyResult {
  name: string;
  after_tax_usd: number[];
  median: number;
  p25: number;
  p75: number;
  downside_risk: number;
}

// Seeded random generator
function mulberry32(a: number) {
  return function() {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function standardNormal(rand: () => number): number {
  let u = 0, v = 0;
  while(u === 0) u = rand();
  while(v === 0) v = rand();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function gbmPath(
  start: number,
  mu: number,
  sigma: number,
  years: number,
  rand: () => number
): number[] {
  const steps = Math.max(Math.floor(years * 252), 1);
  const dt = years / steps;
  const path: number[] = [];
  
  let currentLog = Math.log(start);
  for (let i = 0; i < steps; i++) {
    const z = standardNormal(rand);
    currentLog += (mu - 0.5 * sigma ** 2) * dt + sigma * Math.sqrt(dt) * z;
    path.push(Math.exp(currentLog));
  }
  return path;
}

export function generateVestSchedule(
  totalShares: number,
  startDateStr: string,
  cliffMonths: number = 12,
  totalMonths: number = 48,
  frequency: string = 'monthly'
): Vest[] {
  let periodMonths = 1;
  if (frequency === 'quarterly') periodMonths = 3;
  if (frequency === 'annual') periodMonths = 12;

  const start = new Date(startDateStr);
  const schedule: Vest[] = [];
  const periodsAfterCliff = Math.floor((totalMonths - cliffMonths) / periodMonths);
  const sharesAtCliff = (totalShares * cliffMonths) / totalMonths;
  const sharesPerPeriod = (totalShares - sharesAtCliff) / Math.max(periodsAfterCliff, 1);

  let cumulative = 0;
  
  // Cliff vest
  const cliffDate = addMonths(start, cliffMonths);
  cumulative += sharesAtCliff;
  schedule.push({
    date: cliffDate.toISOString().split('T')[0],
    shares: sharesAtCliff,
    cumulative_shares: Math.round(cumulative * 100) / 100
  });

  for (let i = 1; i <= periodsAfterCliff; i++) {
    const d = addMonths(cliffDate, i * periodMonths);
    cumulative += sharesPerPeriod;
    schedule.push({
      date: d.toISOString().split('T')[0],
      shares: sharesPerPeriod,
      cumulative_shares: Math.round(cumulative * 100) / 100
    });
  }

  return schedule;
}

function addMonths(d: Date, n: number): Date {
  const newDate = new Date(d.getTime());
  const currentMonth = newDate.getMonth();
  newDate.setMonth(currentMonth + n);
  return newDate;
}

export function simulate(profile: Profile, runs: number = 1000): StrategyResult[] {
  const futureVests = profile.vests;
  if (futureVests.length === 0) return [];

  const today = new Date();
  const lastVestDate = new Date(futureVests[futureVests.length - 1].date);
  const horizonYears = Math.max((lastVestDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 365.25), 0.1);

  const rand = mulberry32(42);

  const sellImmediately: number[] = [];
  const holdOneYear: number[] = [];
  const holdToVestEnd: number[] = [];

  for (let r = 0; r < runs; r++) {
    const path = gbmPath(profile.current_price, profile.drift_annual, profile.vol_annual, Math.max(horizonYears + 1, 1.5), rand);

    // 1. SELL IMMEDIATELY
    let annualRsuIncome = 0;
    for (const v of futureVests) {
      const vDate = new Date(v.date);
      const days = Math.max((vDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24), 0);
      const dayIndex = Math.min(Math.floor(days * 252 / 365.25), path.length - 1);
      const price = path[dayIndex];
      annualRsuIncome += price * v.shares;
    }
    const breakdown = incomeTax(
      profile.salary_w2_usd + annualRsuIncome,
      0,
      0,
      profile.state,
      profile.filing_status
    );
    const baseline = incomeTax(profile.salary_w2_usd, 0, 0, profile.state, profile.filing_status);
    const rsuTax = breakdown.total - baseline.total;
    sellImmediately.push(annualRsuIncome - rsuTax);

    // 2. HOLD ONE YEAR
    let hold1yAfterTax = 0;
    for (const v of futureVests) {
      const vDate = new Date(v.date);
      const daysVest = Math.max((vDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24), 0);
      const dayIndexVest = Math.min(Math.floor(daysVest * 252 / 365.25), path.length - 1);
      const dayIndexSale = Math.min(dayIndexVest + 252, path.length - 1);
      
      const priceVest = path[dayIndexVest];
      const priceSale = path[dayIndexSale];
      const ordinaryValue = priceVest * v.shares;
      const gain = (priceSale - priceVest) * v.shares;
      
      const ordTax = supplementalEstimate(ordinaryValue, profile);
      const ltcgTax = Math.max(gain, 0) * 0.20 + Math.max(gain, 0) * 0.038;
      hold1yAfterTax += priceSale * v.shares - ordTax - Math.max(ltcgTax, 0);
    }
    holdOneYear.push(hold1yAfterTax);

    // 3. HOLD TO VEST END
    const terminalPrice = path[path.length - 1];
    let holdEndAfterTax = 0;
    for (const v of futureVests) {
      const vDate = new Date(v.date);
      const daysVest = Math.max((vDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24), 0);
      const dayIndexVest = Math.min(Math.floor(daysVest * 252 / 365.25), path.length - 1);
      
      const priceVest = path[dayIndexVest];
      const ordinaryValue = priceVest * v.shares;
      const ordTax = supplementalEstimate(ordinaryValue, profile);
      const gain = (terminalPrice - priceVest) * v.shares;
      
      const ltcgTax = Math.max(gain, 0) * 0.20 + Math.max(gain, 0) * 0.038;
      holdEndAfterTax += terminalPrice * v.shares - ordTax - Math.max(ltcgTax, 0);
    }
    holdToVestEnd.push(holdEndAfterTax);
  }

  return [
    createStrategyResult("Sell Immediately", sellImmediately),
    createStrategyResult("Hold One Year", holdOneYear),
    createStrategyResult("Hold to Vest End", holdToVestEnd),
  ];
}

function supplementalEstimate(rsuValue: number, profile: Profile): number {
  const base = incomeTax(profile.salary_w2_usd, 0, 0, profile.state, profile.filing_status).total;
  const plus = incomeTax(profile.salary_w2_usd + rsuValue, 0, 0, profile.state, profile.filing_status).total;
  return plus - base;
}

function createStrategyResult(name: string, afterTax: number[]): StrategyResult {
  const sorted = [...afterTax].sort((a, b) => a - b);
  const len = sorted.length;
  
  const median = sorted[Math.floor(len * 0.5)];
  const p25 = sorted[Math.floor(len * 0.25)];
  const p75 = sorted[Math.floor(len * 0.75)];
  
  // Downside risk: 90th percentile drawdown below median
  const drawdowns: number[] = [];
  for (const v of afterTax) {
    if (v < median) {
      drawdowns.push((median - v) / median);
    }
  }
  let downsideRisk = 0.0;
  if (drawdowns.length > 0) {
    const sortedDrawdowns = [...drawdowns].sort((a, b) => a - b);
    downsideRisk = sortedDrawdowns[Math.floor(sortedDrawdowns.length * 0.9)];
  }

  return {
    name,
    after_tax_usd: afterTax,
    median: Math.round(median),
    p25: Math.round(p25),
    p75: Math.round(p75),
    downside_risk: Math.round(downsideRisk * 10000) / 100 // percentage
  };
}
