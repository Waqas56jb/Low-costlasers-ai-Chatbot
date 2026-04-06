/**
 * Canonical shop links + images (og:image) for LowCostLasers.com inventory.
 * Used to linkify bot replies and attach product showcase cards when users ask for photos.
 */
const PRODUCTS = [
  {
    title: 'Candela GentleLase Laser Machine',
    url: 'https://lowcostlasers.com/product/candela-gentlelase-laser-machine/',
    image: 'https://lowcostlasers.com/wp-content/uploads/2023/02/gentlelase992.jpg',
    blurb: 'Hair removal (all skin types), pigmented & vascular lesions, wrinkle reduction.',
    match: ['Candela GentleLase Laser Machine', 'Candela Gentlelase', 'Candela GentleLase', 'GentleLase', 'Gentlelase'],
  },
  {
    title: '2022 Lumenis M22 Stellar (Fully Loaded)',
    url: 'https://lowcostlasers.com/product/2022-lumenis-m22-stellar-fully-loaded-with-q-switch-ipl-yag-resurfx/',
    image: 'https://lowcostlasers.com/wp-content/uploads/2024/08/s-l1600-6.webp',
    blurb: 'Q-switch, IPL, YAG, ResurFX — multi-application platform, very low usage.',
    match: ['Lumenis M22 Stellar', 'M22 Stellar', 'M22™', 'Lumenis M22', 'Stellar M22'],
  },
  {
    title: '2014 Lumenis LightSheer DUET',
    url: 'https://lowcostlasers.com/product/2014-lumenis-lightsheer-duet-laser-2-hand-pieces-9x9-et-hs-handpiece/',
    image: 'https://lowcostlasers.com/wp-content/uploads/2023/02/lightsheerduet2011.jpg',
    blurb: 'ET 9×9mm + HS handpieces — diode hair removal, larger spot sizes.',
    match: ['LightSheer DUET', 'Lightsheer Duet', 'Lumenis LightSheer DUET', 'LightSheer Duet'],
  },
  {
    title: 'PicoSure 2013 755 System',
    url: 'https://lowcostlasers.com/product/picosure-2013-755-system-accessories-and-includes-aray/',
    image: 'https://lowcostlasers.com/wp-content/uploads/2023/02/picosure322.jpg',
    blurb: 'Picosecond laser for tattoo removal & revitalization — includes Array.',
    match: ['PicoSure 2013', 'PicoSure', 'Cynosure PicoSure'],
  },
  {
    title: '2014 Lumenis LightSheer Desire',
    url: 'https://lowcostlasers.com/?s=lumenis+lightsheer+desire',
    image: null,
    blurb: 'Diode hair removal — XC + HS handpieces.',
    match: ['LightSheer Desire', 'Lightsheer Desire', 'Lumenis LightSheer Desire'],
  },
  {
    title: '2016 Aerolase LightPod Neo',
    url: 'https://lowcostlasers.com/?s=aerolase+lightpod+neo',
    image: null,
    blurb: '650-microsecond Nd:YAG for aesthetics & dermatology.',
    match: ['Aerolase LightPod Neo', 'LightPod Neo', 'Aerolase Neo'],
  },
  {
    title: 'Candela Alex Trivantage',
    url: 'https://lowcostlasers.com/?s=candela+alex+trivantage',
    image: null,
    blurb: '755nm, 532nm, 1064nm — tattoo & pigment.',
    match: ['Alex Trivantage', 'Candela Alex TriVantage', 'TriVantage'],
  },
  {
    title: 'Quanta Q-Plus C',
    url: 'https://lowcostlasers.com/?s=quanta+q-plus',
    image: null,
    blurb: 'Q-switched tattoo removal platform.',
    match: ['Quanta Q-Plus', 'Q-Plus C', 'Q Plus C'],
  },
  {
    title: 'Trinity Astanza Laser',
    url: 'https://lowcostlasers.com/?s=trinity+astanza',
    image: null,
    blurb: 'Nd:YAG + Ruby, multi-wavelength tattoo removal.',
    match: ['Trinity Astanza', 'Astanza Trinity'],
  },
  {
    title: 'Syneron VelaShape III',
    url: 'https://lowcostlasers.com/?s=velashape+iii',
    image: null,
    blurb: 'RF + IR body contouring & cellulite.',
    match: ['VelaShape III', 'Velashape III', 'VelaShape 3'],
  },
  {
    title: 'CUTERA TruSculpt Flex',
    url: 'https://lowcostlasers.com/?s=trusculpt+flex',
    image: null,
    blurb: 'Muscle sculpting / electrical muscle stimulation.',
    match: ['TruSculpt Flex', 'Tru Sculpt Flex', 'truSculpt Flex'],
  },
  {
    title: 'Cutera truSculpt iD',
    url: 'https://lowcostlasers.com/?s=trusculpt+id',
    image: null,
    blurb: 'RF body sculpting, hands-free applicators.',
    match: ['truSculpt iD', 'TruSculpt iD', 'trusculpt id'],
  },
  {
    title: 'Venus Legacy',
    url: 'https://lowcostlasers.com/?s=venus+legacy',
    image: null,
    blurb: 'RF tightening & cellulite.',
    match: ['Venus Legacy'],
  },
  {
    title: 'BTL EmSculpt RF',
    url: 'https://lowcostlasers.com/?s=btl+emsculpt',
    image: null,
    blurb: 'HIFEM + RF muscle & fat.',
    match: ['BTL EmSculpt', 'EmSculpt RF', 'Emsculpt RF'],
  },
  {
    title: 'Lumenis AcuPulse SurgiTouch',
    url: 'https://lowcostlasers.com/product/lumenis-acupulse-surgitouch-scanner-surgical-dental-orthopedic-laser/',
    image: null,
    blurb: 'CO2 surgical / aesthetic platform.',
    match: ['AcuPulse SurgiTouch', 'Lumenis AcuPulse', 'AcuPulse'],
  },
  {
    title: 'Syneron Candela CO2RE',
    url: 'https://lowcostlasers.com/?s=co2re',
    image: null,
    blurb: 'CO2 resurfacing & Intima handpiece options.',
    match: ['Candela CO2RE', 'CO2RE', 'Syneron CO2RE'],
  },
  {
    title: 'Lumenis ResurFX',
    url: 'https://lowcostlasers.com/?s=lumenis+resurfx',
    image: null,
    blurb: '1565nm fractional non-ablative.',
    match: ['Lumenis ResurFX', 'ResurFX'],
  },
  {
    title: 'Lumenis PiQo4',
    url: 'https://lowcostlasers.com/?s=piqo+4',
    image: null,
    blurb: 'Four wavelengths picosecond / Q-switch platform.',
    match: ['Lumenis PiQo', 'PiQo 4', 'PiQo4'],
  },
  {
    title: 'Cynosure Icon',
    url: 'https://lowcostlasers.com/?s=cynosure+icon',
    image: null,
    blurb: 'Multi-application aesthetic platform.',
    match: ['Cynosure Icon'],
  },
  {
    title: 'Syneron Elos Plus',
    url: 'https://lowcostlasers.com/?s=elos+plus',
    image: null,
    blurb: 'eLOS RF + optical — hair, skin rejuvenation.',
    match: ['Elos Plus', 'Syneron Elos Plus', 'eLos Plus'],
  },
  {
    title: 'InMode Optimas',
    url: 'https://lowcostlasers.com/?s=inmode+optimas',
    image: null,
    blurb: 'Diolaze, Lumecca, Morpheus8 family modalities.',
    match: ['InMode Optimas', 'Optimas'],
  },
  {
    title: 'InMode Empower RF Pro',
    url: 'https://lowcostlasers.com/?s=inmode+empower',
    image: null,
    blurb: 'Morpheus8, Tone, Body, FormaV suite.',
    match: ['InMode Empower', 'Empower RF Pro', 'Empower Pro'],
  },
  {
    title: 'Syneron Candela Profound',
    url: 'https://lowcostlasers.com/product/2017-syneron-candela-profound-laser-w-handpieces/',
    image: null,
    blurb: 'RF microneedling — SubQ + Dermal handpieces.',
    match: ['Candela Profound', 'Syneron Profound', 'Profound'],
  },
  {
    title: 'Candela VBeam Prima',
    url: 'https://lowcostlasers.com/?s=vbeam+prima',
    image: null,
    blurb: 'Pulsed dye vascular laser.',
    match: ['VBeam Prima', 'Vbeam Prima', 'Candela VBeam'],
  },
  {
    title: 'Alma Harmony XL',
    url: 'https://lowcostlasers.com/?s=alma+harmony+xl',
    image: null,
    blurb: 'IPL / multi-application platform.',
    match: ['Alma Harmony XL', 'Harmony XL'],
  },
  {
    title: 'Sciton Joule 7',
    url: 'https://lowcostlasers.com/?s=sciton+joule',
    image: null,
    blurb: 'BBL, fractional, resurfacing options.',
    match: ['Sciton Joule', 'Joule 7'],
  },
  {
    title: 'Sciton Profile BBL',
    url: 'https://lowcostlasers.com/?s=sciton+profile',
    image: null,
    blurb: 'BBL + multiple wavelengths.',
    match: ['Sciton Profile'],
  },
  {
    title: 'NeoGraft Hair Restoration',
    url: 'https://lowcostlasers.com/?s=neograft',
    image: null,
    blurb: 'Automated FUE hair restoration.',
    match: ['NeoGraft'],
  },
  {
    title: 'Lumenis UltraPulse 5000C',
    url: 'https://lowcostlasers.com/?s=ultrapulse+5000',
    image: null,
    blurb: 'CO2 ablative platform.',
    match: ['UltraPulse 5000', 'UltraPulse 5000C'],
  },
  {
    title: 'Lumenis NuEra Tight',
    url: 'https://lowcostlasers.com/?s=nuera+tight',
    image: null,
    blurb: 'Non-invasive RF tightening.',
    match: ['NuEra Tight', 'NuEra'],
  },
  {
    title: 'Inmode Evoke / EmFace',
    url: 'https://lowcostlasers.com/?s=inmode+evoke',
    image: null,
    blurb: 'Facial RF contouring.',
    match: ['InMode Evoke', 'Evoke', 'EmFace'],
  },
];

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Split markdown into alternating [text](url) segments vs plain text. */
function splitMarkdownLinks(text) {
  const re = /(\[[^\]]+\]\([^)]+\))/g;
  return text.split(re).filter((x) => x !== '');
}

function linkifyPlainSegment(segment) {
  const items = [];
  for (const p of PRODUCTS) {
    for (const phrase of p.match) items.push({ phrase, url: p.url });
  }
  items.sort((a, b) => b.phrase.length - a.phrase.length);

  let out = '';
  let i = 0;
  while (i < segment.length) {
    let matched = null;
    for (const { phrase, url } of items) {
      const len = phrase.length;
      if (i + len > segment.length) continue;
      const slice = segment.slice(i, i + len);
      if (slice.toLowerCase() !== phrase.toLowerCase()) continue;
      const before = i > 0 ? segment[i - 1] : '';
      const after = i + len < segment.length ? segment[i + len] : '';
      if (before && /\w/.test(before)) continue;
      if (after && /\w/.test(after)) continue;
      matched = { phrase: slice, url, len };
      break;
    }
    if (matched) {
      out += `[${matched.phrase}](${matched.url})`;
      i += matched.len;
    } else {
      out += segment[i];
      i += 1;
    }
  }
  return out;
}

function linkifyProductNamesInMarkdown(text) {
  if (!text || typeof text !== 'string') return text;
  return splitMarkdownLinks(text).map((part) => (part.startsWith('[') ? part : linkifyPlainSegment(part))).join('');
}

function userRequestedVisuals(userMessage) {
  if (!userMessage || typeof userMessage !== 'string') return false;
  return /\b(photo|photos|picture|pictures|image|images|pic|pics|show me|what does|look like|looks like|see the|visual)\b/i.test(
    userMessage
  );
}

/**
 * Return up to 3 products to show as image cards (photo requests).
 */
function pickShowcaseProducts(userMessage, botReply) {
  if (!userRequestedVisuals(userMessage)) return [];
  const hay = `${userMessage}\n${botReply || ''}`.toLowerCase();
  const out = [];
  for (const p of PRODUCTS) {
    if (out.length >= 3) break;
    if (p.match.some((m) => hay.includes(m.toLowerCase()))) {
      out.push({
        title: p.title,
        url: p.url,
        image: p.image || null,
        summary: p.blurb,
      });
    }
  }
  return out;
}

function catalogSummaryForPrompt() {
  return PRODUCTS.map((p) => `- **${p.title}** → ${p.url}`).join('\n');
}

module.exports = {
  PRODUCTS,
  linkifyProductNamesInMarkdown,
  pickShowcaseProducts,
  userRequestedVisuals,
  catalogSummaryForPrompt,
};
