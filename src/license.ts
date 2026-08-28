const LICENSE_KEY = 'sb_license:placeboard-inventory';
const VERDICT_KEY = 'sb_license_verdict:placeboard-inventory';
const VERIFY_URL = 'https://api.sociobot.in/api/v1/products/placeboard-inventory/verify';

interface Verdict { valid: boolean; checkedAt: number }

export function captureLicense(): boolean {
  const url = new URL(location.href);
  const license = url.searchParams.get('license');
  if (!license) return false;
  localStorage.setItem(LICENSE_KEY, license);
  localStorage.removeItem(VERDICT_KEY);
  url.searchParams.delete('license');
  history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  return true;
}

export function hasSupporterPack(): boolean {
  const verdict = localStorage.getItem(VERDICT_KEY);
  if (!verdict) return false;
  try { return Boolean((JSON.parse(verdict) as Verdict).valid); } catch { return false; }
}

export async function verifyLicense(force = false): Promise<{ valid: boolean; message: string }> {
  const license = localStorage.getItem(LICENSE_KEY);
  if (!license) return { valid: false, message: 'Paste the license from your receipt.' };
  const cached = localStorage.getItem(VERDICT_KEY);
  if (!force && cached) {
    try {
      const parsed = JSON.parse(cached) as Verdict;
      if (Date.now() - parsed.checkedAt < 86_400_000) return { valid: parsed.valid, message: parsed.valid ? 'Supporter pack is active.' : 'This license is no longer active.' };
    } catch {
      localStorage.removeItem(VERDICT_KEY);
    }
  }
  try {
    const response = await fetch(`${VERIFY_URL}?license=${encodeURIComponent(license)}`);
    if (!response.ok) throw new Error('License service unavailable');
    const result = await response.json() as { valid: boolean };
    localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: result.valid, checkedAt: Date.now() }));
    return { valid: result.valid, message: result.valid ? 'Supporter pack is active.' : 'This license is no longer active.' };
  } catch {
    return { valid: hasSupporterPack(), message: 'Could not check the license. Try again when you are online.' };
  }
}

export function saveLicense(value: string): void {
  localStorage.setItem(LICENSE_KEY, value.trim());
  localStorage.removeItem(VERDICT_KEY);
}
