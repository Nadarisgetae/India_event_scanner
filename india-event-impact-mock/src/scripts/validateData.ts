// ============================================
// DATA VALIDATION SCRIPT
// Run with: npx tsx src/scripts/validateData.ts
// ============================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');

interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
}

function validateUniverse(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const universePath = path.join(DATA_DIR, 'universe.json');
  if (!fs.existsSync(universePath)) {
    errors.push('universe.json not found');
    return { passed: false, errors, warnings };
  }

  const universe = JSON.parse(fs.readFileSync(universePath, 'utf-8'));
  const symbols = new Set<string>();

  universe.forEach((company: any, idx: number) => {
    if (!company.symbol) errors.push(`Company ${idx}: missing symbol`);
    else if (symbols.has(company.symbol)) errors.push(`Duplicate symbol: ${company.symbol}`);
    else symbols.add(company.symbol);

    if (!company.name) errors.push(`${company.symbol}: missing name`);
    if (!company.sector) errors.push(`${company.symbol}: missing sector`);
    if (!company.market_cap_bucket) warnings.push(`${company.symbol}: missing market_cap_bucket`);
    if (!company.price_series || !Array.isArray(company.price_series)) errors.push(`${company.symbol}: invalid price_series`);
    if (!company.resilience_band) warnings.push(`${company.symbol}: missing resilience_band`);
    if (!company.tags || !Array.isArray(company.tags)) warnings.push(`${company.symbol}: missing tags`);
  });

  if (universe.length < 45) warnings.push(`Only ${universe.length} companies in universe (expected ~50)`);

  return { passed: errors.length === 0, errors, warnings };
}

function validateScenarios(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Market scenarios
  const marketDir = path.join(DATA_DIR, 'scenarios', 'market');
  const marketFiles = ['MA-1.json', 'MA-2.json', 'MA-3.json', 'MA-G.json'];

  marketFiles.forEach(file => {
    const filePath = path.join(marketDir, file);
    if (!fs.existsSync(filePath)) {
      errors.push(`Missing market scenario: ${file}`);
      return;
    }
    const scenario = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    if (!scenario.id) errors.push(`${file}: missing id`);
    if (!scenario.event) errors.push(`${file}: missing event`);
    if (!scenario.channels) errors.push(`${file}: missing channels`);
    if (!scenario.macro) errors.push(`${file}: missing macro`);
    if (!scenario.sectors) errors.push(`${file}: missing sectors`);
    if (!scenario.companies) errors.push(`${file}: missing companies`);
    if (!scenario.uncertain) errors.push(`${file}: missing uncertain`);
    if (!scenario.scenarios) errors.push(`${file}: missing scenarios`);
    if (!scenario.timeline) errors.push(`${file}: missing timeline`);
    if (!scenario.watchlist) errors.push(`${file}: missing watchlist`);
    if (!scenario.analogues) errors.push(`${file}: missing analogues`);
    if (!scenario.assumptions) errors.push(`${file}: missing assumptions`);
    if (!scenario.appendix) errors.push(`${file}: missing appendix`);

    // Validate companies have required fields
    scenario.companies?.forEach((c: any, i: number) => {
      if (!c.symbol) errors.push(`${file}: company ${i} missing symbol`);
      if (!c.bucket) errors.push(`${file}: company ${i} (${c.symbol}) missing bucket`);
      if (typeof c.impact_score !== 'number') errors.push(`${file}: company ${i} missing impact_score`);
    });

    // Check bucket thresholds consistency
    scenario.companies?.forEach((c: any) => {
      const score = c.impact_score;
      const bucket = c.bucket;
      let expectedBucket: string;
      if (score <= -3.5) expectedBucket = 'danger';
      else if (score <= -1.5) expectedBucket = 'negative';
      else if (score <= 1.5) expectedBucket = 'neutral';
      else if (score <= 3.5) expectedBucket = 'positive';
      else expectedBucket = 'gain';

      if (bucket !== expectedBucket) {
        warnings.push(`${file}: ${c.symbol} score ${score} -> bucket ${bucket} (expected ${expectedBucket})`);
      }
    });
  });

  // Company scenarios
  const companyDir = path.join(DATA_DIR, 'scenarios', 'company');
  const companyFiles = ['MB-1.json', 'MB-2.json', 'MB-3.json', 'MB-4.json'];

  companyFiles.forEach(file => {
    const filePath = path.join(companyDir, file);
    if (!fs.existsSync(filePath)) {
      errors.push(`Missing company scenario: ${file}`);
      return;
    }
    const scenario = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    if (!scenario.id) errors.push(`${file}: missing id`);
    if (!scenario.company) errors.push(`${file}: missing company`);
    if (!scenario.event) errors.push(`${file}: missing event`);
    if (!scenario.channels) errors.push(`${file}: missing channels`);
    if (!scenario.dimensions) errors.push(`${file}: missing dimensions`);
    if (!scenario.resilience) errors.push(`${file}: missing resilience`);
    if (!scenario.market_view) errors.push(`${file}: missing market_view`);
    if (!scenario.macro_backdrop) errors.push(`${file}: missing macro_backdrop`);
    if (!scenario.peers) errors.push(`${file}: missing peers`);
    if (!scenario.strategy) errors.push(`${file}: missing strategy`);
    if (!scenario.scenarios) errors.push(`${file}: missing scenarios`);
    if (!scenario.analogues) errors.push(`${file}: missing analogues`);
    if (!scenario.limitations) errors.push(`${file}: missing limitations`);
    if (!scenario.appendix) errors.push(`${file}: missing appendix`);

    // Validate dimensions (should be 13)
    if (scenario.dimensions && scenario.dimensions.length !== 13) {
      warnings.push(`${file}: expected 13 dimensions, got ${scenario.dimensions.length}`);
    }

    // Validate strategy has both tabs
    if (scenario.strategy) {
      if (!scenario.strategy.immediate_0_30d) warnings.push(`${file}: missing immediate_0_30d actions`);
      if (!scenario.strategy.short_term_1_6m) warnings.push(`${file}: missing short_term_1_6m actions`);
      if (!scenario.strategy.long_term_6_24m) warnings.push(`${file}: missing long_term_6_24m actions`);
      if (!scenario.strategy.kpis_to_track) warnings.push(`${file}: missing kpis_to_track`);
      if (!scenario.strategy.trigger_points) warnings.push(`${file}: missing trigger_points`);
    }
  });

  return { passed: errors.length === 0, errors, warnings };
}

function validateProfiles(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const profilesDir = path.join(DATA_DIR, 'profiles');
  if (!fs.existsSync(profilesDir)) {
    errors.push('profiles directory not found');
    return { passed: false, errors, warnings };
  }

  const requiredProfiles = ['ASIANPAINT.json', 'TCS.json', 'INDIGO.json', 'HDFCBANK.json'];
  requiredProfiles.forEach(file => {
    const filePath = path.join(profilesDir, file);
    if (!fs.existsSync(filePath)) {
      errors.push(`Missing profile: ${file}`);
      return;
    }
    const profile = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    if (!profile.symbol) errors.push(`${file}: missing symbol`);
    if (!profile.name) errors.push(`${file}: missing name`);
    if (!profile.sector) errors.push(`${file}: missing sector`);
    if (!profile.verification) errors.push(`${file}: missing verification`);
    if (!profile.confidence) errors.push(`${file}: missing confidence`);
    if (!profile.business_summary) errors.push(`${file}: missing business_summary`);
    if (!profile.revenue_mix) errors.push(`${file}: missing revenue_mix`);
    if (!profile.exposure_tags) errors.push(`${file}: missing exposure_tags`);
    if (!profile.resilience) errors.push(`${file}: missing resilience`);
    if (!profile.sources) errors.push(`${file}: missing sources`);
  });

  return { passed: errors.length === 0, errors, warnings };
}

function validateSectorMatrix(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const filePath = path.join(DATA_DIR, 'sectorMatrix.json');
  if (!fs.existsSync(filePath)) {
    errors.push('sectorMatrix.json not found');
    return { passed: false, errors, warnings };
  }

  const matrix = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const sectors = new Set<string>();
  const channels = new Set<string>();

  matrix.forEach((cell: any, idx: number) => {
    if (!cell.sector) errors.push(`Matrix row ${idx}: missing sector`);
    else sectors.add(cell.sector);

    if (!cell.channel) errors.push(`Matrix row ${idx}: missing channel`);
    else channels.add(cell.channel);

    if (typeof cell.sensitivity !== 'number') errors.push(`Matrix row ${idx}: missing sensitivity`);
    else if (cell.sensitivity < -5 || cell.sensitivity > 5) {
      errors.push(`Matrix row ${idx}: sensitivity ${cell.sensitivity} out of range [-5, 5]`);
    }

    if (!cell.reasoning) warnings.push(`Matrix row ${idx}: missing reasoning`);
  });

  if (sectors.size < 20) warnings.push(`Only ${sectors.size} sectors in matrix`);
  if (channels.size < 10) warnings.push(`Only ${channels.size} channels in matrix`);

  return { passed: errors.length === 0, errors, warnings };
}

function validateTemplateVariants(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const filePath = path.join(DATA_DIR, 'templateVariants.json');
  if (!fs.existsSync(filePath)) {
    errors.push('templateVariants.json not found');
    return { passed: false, errors, warnings };
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  if (!data.template_rules || !Array.isArray(data.template_rules)) {
    errors.push('Missing template_rules array');
    return { passed: false, errors, warnings };
  }

  data.template_rules.forEach((rule: any, idx: number) => {
    if (!rule.exposure_tag) errors.push(`Template rule ${idx}: missing exposure_tag`);
    if (!rule.channels_affected) errors.push(`Template rule ${idx}: missing channels_affected`);
    if (typeof rule.default_impact !== 'number') errors.push(`Template rule ${idx}: missing default_impact`);
    if (!rule.reasoning_template) errors.push(`Template rule ${idx}: missing reasoning_template`);
  });

  if (!data.fallback) errors.push('Missing fallback rule');

  return { passed: errors.length === 0, errors, warnings };
}

function validateCrossReferences(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const universe = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'universe.json'), 'utf-8'));
  const symbols = new Set(universe.map((c: any) => c.symbol));

  // Check scenario companies exist in universe
  const marketDir = path.join(DATA_DIR, 'scenarios', 'market');
  ['MA-1.json', 'MA-2.json', 'MA-3.json', 'MA-G.json'].forEach(file => {
    const scenario = JSON.parse(fs.readFileSync(path.join(marketDir, file), 'utf-8'));
    scenario.companies?.forEach((c: any) => {
      if (!symbols.has(c.symbol)) {
        warnings.push(`${file}: company ${c.symbol} not in universe`);
      }
    });
    scenario.uncertain?.forEach((c: any) => {
      if (!symbols.has(c.symbol) && c.symbol !== 'ALL_OTHERS') {
        warnings.push(`${file}: uncertain company ${c.symbol} not in universe`);
      }
    });
  });

  const companyDir = path.join(DATA_DIR, 'scenarios', 'company');
  ['MB-1.json', 'MB-2.json', 'MB-3.json', 'MB-4.json'].forEach(file => {
    const scenario = JSON.parse(fs.readFileSync(path.join(companyDir, file), 'utf-8'));
    if (scenario.company?.symbol && !symbols.has(scenario.company.symbol)) {
      warnings.push(`${file}: company ${scenario.company.symbol} not in universe`);
    }
    scenario.peers?.forEach((p: any) => {
      if (!symbols.has(p.symbol)) {
        warnings.push(`${file}: peer ${p.symbol} not in universe`);
      }
    });
  });

  // Check profiles match universe
  const profilesDir = path.join(DATA_DIR, 'profiles');
  fs.readdirSync(profilesDir).forEach(file => {
    if (file.endsWith('.json')) {
      const profile = JSON.parse(fs.readFileSync(path.join(profilesDir, file), 'utf-8'));
      if (!symbols.has(profile.symbol)) {
        warnings.push(`Profile ${file}: symbol ${profile.symbol} not in universe`);
      }
    }
  });

  return { passed: errors.length === 0, errors, warnings };
}

function runAllValidations() {
  console.log('🔍 Running data validations...\n');

  const results = {
    universe: validateUniverse(),
    scenarios: validateScenarios(),
    profiles: validateProfiles(),
    sectorMatrix: validateSectorMatrix(),
    templateVariants: validateTemplateVariants(),
    crossReferences: validateCrossReferences(),
  };

  let allPassed = true;

  for (const [name, result] of Object.entries(results)) {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${name}`);

    result.errors.forEach(e => console.log(`  ❌ ERROR: ${e}`));
    result.warnings.forEach(w => console.log(`  ⚠️  WARN: ${w}`));

    if (!result.passed) allPassed = false;
    console.log('');
  }

  if (allPassed) {
    console.log('🎉 All validations passed!');
    process.exit(0);
  } else {
    console.log('💥 Some validations failed!');
    process.exit(1);
  }
}

runAllValidations();