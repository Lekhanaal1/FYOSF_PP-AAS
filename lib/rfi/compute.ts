/**
 * RFI Computation Library
 * 
 * Ported from build_rfi.py to TypeScript
 * Computes Regulatory Fragmentation Index (RFI) using Shannon entropy
 * and State Alignment Score (SAS)
 */

export interface PolicyRow {
  state: string;
  year: number;
  element: string;
  adopted: number; // 0 or 1
  source_file?: string;
}

export interface RFIResult {
  year: number;
  RFI: number; // Regulatory Fragmentation Index (0-1)
  H: number; // Shannon entropy
  H_max: number; // Maximum possible entropy
  SAS: Record<string, number>; // State Alignment Score per state
  adoptionMatrix: Record<string, Record<string, number>>; // state × element matrix
  p_j: Record<string, number>; // Element adoption probabilities
}

export interface PolicyMaster {
  state: string;
  year: number;
  element: string;
  adopted: number;
}

/**
 * Standardize US state names to two-letter codes
 */
export function standardizeStateName(state: string): string {
  const stateMap: Record<string, string> = {
    'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
    'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
    'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID',
    'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS',
    'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
    'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS',
    'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV',
    'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
    'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK',
    'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
    'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT',
    'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV',
    'wisconsin': 'WI', 'wyoming': 'WY', 'district of columbia': 'DC'
  };

  const normalized = state.trim().toLowerCase();
  
  if (stateMap[normalized]) {
    return stateMap[normalized];
  }

  // If already a two-letter code
  if (state.length === 2 && state.toUpperCase() in Object.values(stateMap)) {
    return state.toUpperCase();
  }

  return state.toUpperCase();
}

/**
 * Build policy master table from raw data
 * Cleans and deduplicates policy adoption data
 */
export function buildPolicyMaster(rows: PolicyRow[]): PolicyMaster[] {
  // Filter out rows with missing state or element
  const valid = rows.filter(r => r.state && r.element);

  // Normalize state names
  const normalized = valid.map(r => ({
    ...r,
    state: standardizeStateName(r.state),
    element: r.element.toLowerCase().trim().replace(/\n/g, ' '),
    year: r.year || new Date().getFullYear(),
    adopted: r.adopted || 0
  }));

  // Deduplicate: keep max adopted per state-year-element
  const grouped = new Map<string, PolicyMaster>();

  for (const row of normalized) {
    const key = `${row.state}|${row.year}|${row.element}`;
    const existing = grouped.get(key);

    if (!existing || row.adopted > existing.adopted) {
      grouped.set(key, {
        state: row.state,
        year: row.year,
        element: row.element,
        adopted: row.adopted
      });
    }
  }

  return Array.from(grouped.values());
}

/**
 * Compute RFI (Regulatory Fragmentation Index) using Shannon entropy
 * 
 * RFI = H / H_max where:
 * - H = Shannon entropy of element adoption probabilities
 * - H_max = maximum possible entropy (N * log(2))
 */
export function computeRFI(
  policyMaster: PolicyMaster[],
  year?: number
): RFIResult {
  // Filter by year if specified
  const filtered = year
    ? policyMaster.filter(p => p.year === year)
    : policyMaster;

  if (filtered.length === 0) {
    // Use latest year if none specified
    const years = [...new Set(policyMaster.map(p => p.year))].sort();
    const latestYear = years[years.length - 1] || new Date().getFullYear();
    return computeRFI(policyMaster, latestYear);
  }

  const targetYear = year || Math.max(...filtered.map(p => p.year));

  // Build adoption matrix A[state][element] = adopted (0 or 1)
  const adoptionMatrix: Record<string, Record<string, number>> = {};
  const states = new Set<string>();
  const elements = new Set<string>();

  for (const row of filtered) {
    if (!adoptionMatrix[row.state]) {
      adoptionMatrix[row.state] = {};
    }
    adoptionMatrix[row.state][row.element] = row.adopted;
    states.add(row.state);
    elements.add(row.element);
  }

  // Fill missing combinations with 0
  const stateList = Array.from(states);
  const elementList = Array.from(elements);

  for (const state of stateList) {
    if (!adoptionMatrix[state]) {
      adoptionMatrix[state] = {};
    }
    for (const element of elementList) {
      if (!(element in adoptionMatrix[state])) {
        adoptionMatrix[state][element] = 0;
      }
    }
  }

  // Compute State Alignment Score (SAS): mean adoption across elements for each state
  const SAS: Record<string, number> = {};
  for (const state of stateList) {
    const adoptions = elementList.map(el => adoptionMatrix[state][el] || 0);
    SAS[state] = adoptions.reduce((sum, val) => sum + val, 0) / elementList.length;
  }

  // Compute p_j: mean adoption across states for each element
  const p_j: Record<string, number> = {};
  for (const element of elementList) {
    const adoptions = stateList.map(state => adoptionMatrix[state][element] || 0);
    p_j[element] = adoptions.reduce((sum, val) => sum + val, 0) / stateList.length;
  }

  // Compute Shannon entropy H = -sum(p_j * log(p_j) + (1-p_j) * log(1-p_j))
  const eps = 1e-12;
  let H = 0;

  for (const element of elementList) {
    const p = Math.max(eps, Math.min(1 - eps, p_j[element]));
    H -= p * Math.log(p) + (1 - p) * Math.log(1 - p);
  }

  // Normalize by maximum possible entropy
  const N = elementList.length;
  const H_max = N * Math.log(2);
  const RFI = H_max > 0 ? H / H_max : 0;

  return {
    year: targetYear,
    RFI,
    H,
    H_max,
    SAS,
    adoptionMatrix,
    p_j
  };
}

/**
 * Compute RFI timeseries for all years
 */
export function computeRFITimeseries(
  policyMaster: PolicyMaster[]
): Array<{ year: number; RFI: number; H: number; H_max: number }> {
  const years = [...new Set(policyMaster.map(p => p.year))].sort();
  const results = [];

  for (const year of years) {
    const result = computeRFI(policyMaster, year);
    results.push({
      year: result.year,
      RFI: result.RFI,
      H: result.H,
      H_max: result.H_max
    });
  }

  return results;
}

/**
 * Parse raw data from PolicyData JSON string into PolicyRow format
 */
export function parsePolicyData(rawData: string, fileName: string): PolicyRow[] {
  try {
    const data = JSON.parse(rawData);
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    const rows: PolicyRow[] = [];
    const firstRow = data[0];

    // Heuristic column detection (similar to Python version)
    const columns = Object.keys(firstRow);
    const lowerColumns = columns.map(c => c.toLowerCase());

    let stateCol: string | null = null;
    let yearCol: string | null = null;
    let elementCol: string | null = null;
    let adoptedCol: string | null = null;

    // Find state column
    for (const col of columns) {
      const lower = col.toLowerCase();
      if (lower.includes('state') || lower.includes('st') || lower.includes('jurisdiction')) {
        stateCol = col;
        break;
      }
    }

    // Find year column
    for (const col of columns) {
      const lower = col.toLowerCase();
      if (lower.includes('year') || lower.includes('date') || lower.includes('yr')) {
        yearCol = col;
        break;
      }
    }

    // Find element column
    for (const col of columns) {
      const lower = col.toLowerCase();
      if (lower.includes('element') || lower.includes('policy') || lower.includes('measure') || 
          lower.includes('provision') || lower.includes('topic') || lower.includes('law')) {
        elementCol = col;
        break;
      }
    }

    // Find adopted column
    for (const col of columns) {
      const lower = col.toLowerCase();
      if (lower.includes('adopt') || lower.includes('yes') || lower.includes('no') || 
          lower.includes('flag') || lower.includes('implement') || lower.includes('enact')) {
        adoptedCol = col;
        break;
      }
    }

    // If element not found, use first non-state/year/adopted column
    if (!elementCol) {
      for (const col of columns) {
        if (col !== stateCol && col !== yearCol && col !== adoptedCol) {
          elementCol = col;
          break;
        }
      }
    }

    // Parse rows
    for (const row of data) {
      const state = stateCol ? String(row[stateCol] || '').trim() : '';
      const year = yearCol ? parseInt(String(row[yearCol] || '')) || new Date().getFullYear() : new Date().getFullYear();
      const element = elementCol ? String(row[elementCol] || '').trim() : '';
      const adoptedStr = adoptedCol ? String(row[adoptedCol] || '').toLowerCase().trim() : '0';
      const adopted = ['1', 'y', 'yes', 'true', 't'].includes(adoptedStr) ? 1 : 0;

      if (state && element) {
        rows.push({
          state,
          year,
          element,
          adopted,
          source_file: fileName
        });
      }
    }

    return rows;
  } catch (error) {
    console.error('Error parsing policy data:', error);
    return [];
  }
}

