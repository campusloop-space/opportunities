import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const publicDir = path.resolve(process.cwd(), "public");

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Square Icon SVG (512x512)
const iconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D95C36" />
      <stop offset="50%" stop-color="#BD4B2A" />
      <stop offset="100%" stop-color="#933318" />
    </linearGradient>
    <linearGradient id="loopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#FFF0EB" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- Base background with rounded squircle -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)"/>
  
  <!-- Subtle inner border -->
  <rect x="4" y="4" width="504" height="504" rx="108" fill="none" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="4"/>

  <!-- Loop emblem -->
  <g transform="translate(68, 68) scale(0.74)" filter="url(#glow)">
    <path d="M 245 40 C 190 45, 140 70, 100 110 C 60 150, 35 205, 25 260 C 23 270, 22 285, 22 300 C 20 355, 35 405, 65 450 C 90 490, 125 520, 170 540 C 220 565, 280 572, 335 560 C 410 545, 470 500, 505 430 C 513 415, 517 405, 517 400 C 517 395, 512 388, 508 386 C 505 385, 475 375, 425 360 C 395 350, 397 350, 385 370 C 367 397, 337 417, 305 423 C 294 425, 273 425, 261 423 C 208 413, 170 372, 161 315 C 156 281, 165 246, 187 218 C 204 196, 226 181, 256 173 C 263 171, 268 171, 284 171 C 301 171, 305 171, 314 173 C 344 180, 370 197, 388 221 C 392 226, 396 231, 397 231 C 401 233, 409 233, 414 231 C 416 230, 430 222, 445 214 C 504 181, 504 181, 502 173 C 501 165, 480 138, 460 119 C 420 81, 372 57, 315 48 C 301 46, 265 45, 245 40 Z" fill="url(#loopGrad)"/>
    
    <!-- Spark / Star inside loop signifying discovery & opportunity -->
    <path d="M 360 140 L 372 170 L 402 182 L 372 194 L 360 224 L 348 194 L 318 182 L 348 170 Z" fill="#FFE082"/>
  </g>
</svg>`;

// 2. Maskable Icon SVG (512x512 with safe area margin)
const maskableSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D95C36" />
      <stop offset="50%" stop-color="#BD4B2A" />
      <stop offset="100%" stop-color="#933318" />
    </linearGradient>
    <linearGradient id="loopGradMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#FFF0EB" />
    </linearGradient>
  </defs>

  <!-- Full bleed background for adaptive maskable icon -->
  <rect width="512" height="512" fill="url(#bgGradMask)"/>

  <!-- Scaled within safe zone (80% inner diameter = 410px) -->
  <g transform="translate(102, 102) scale(0.60)">
    <path d="M 245 40 C 190 45, 140 70, 100 110 C 60 150, 35 205, 25 260 C 23 270, 22 285, 22 300 C 20 355, 35 405, 65 450 C 90 490, 125 520, 170 540 C 220 565, 280 572, 335 560 C 410 545, 470 500, 505 430 C 513 415, 517 405, 517 400 C 517 395, 512 388, 508 386 C 505 385, 475 375, 425 360 C 395 350, 397 350, 385 370 C 367 397, 337 417, 305 423 C 294 425, 273 425, 261 423 C 208 413, 170 372, 161 315 C 156 281, 165 246, 187 218 C 204 196, 226 181, 256 173 C 263 171, 268 171, 284 171 C 301 171, 305 171, 314 173 C 344 180, 370 197, 388 221 C 392 226, 396 231, 397 231 C 401 233, 409 233, 414 231 C 416 230, 430 222, 445 214 C 504 181, 504 181, 502 173 C 501 165, 480 138, 460 119 C 420 81, 372 57, 315 48 C 301 46, 265 45, 245 40 Z" fill="url(#loopGradMask)"/>
    <path d="M 360 140 L 372 170 L 402 182 L 372 194 L 360 224 L 348 194 L 318 182 L 348 170 Z" fill="#FFE082"/>
  </g>
</svg>`;

// 3. Horizontal Full Logo SVG (800x200)
const logoSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="200" viewBox="0 0 800 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logoIconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D95C36" />
      <stop offset="100%" stop-color="#933318" />
    </linearGradient>
  </defs>

  <!-- Emblem on the left -->
  <g transform="translate(20, 20)">
    <rect width="160" height="160" rx="36" fill="url(#logoIconGrad)"/>
    <g transform="translate(18, 18) scale(0.24)">
      <path d="M 245 40 C 190 45, 140 70, 100 110 C 60 150, 35 205, 25 260 C 23 270, 22 285, 22 300 C 20 355, 35 405, 65 450 C 90 490, 125 520, 170 540 C 220 565, 280 572, 335 560 C 410 545, 470 500, 505 430 C 513 415, 517 405, 517 400 C 517 395, 512 388, 508 386 C 505 385, 475 375, 425 360 C 395 350, 397 350, 385 370 C 367 397, 337 417, 305 423 C 294 425, 273 425, 261 423 C 208 413, 170 372, 161 315 C 156 281, 165 246, 187 218 C 204 196, 226 181, 256 173 C 263 171, 268 171, 284 171 C 301 171, 305 171, 314 173 C 344 180, 370 197, 388 221 C 392 226, 396 231, 397 231 C 401 233, 409 233, 414 231 C 416 230, 430 222, 445 214 C 504 181, 504 181, 502 173 C 501 165, 480 138, 460 119 C 420 81, 372 57, 315 48 C 301 46, 265 45, 245 40 Z" fill="#FFFFFF"/>
      <path d="M 360 140 L 372 170 L 402 182 L 372 194 L 360 224 L 348 194 L 318 182 L 348 170 Z" fill="#FFE082"/>
    </g>
  </g>

  <!-- Typography on the right -->
  <text x="210" y="85" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="48" fill="#1E1A17" letter-spacing="-1">CampusLoop</text>
  <text x="210" y="135" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="34" fill="#BD4B2A" letter-spacing="-0.5">Opportunities</text>
  
  <!-- Pill badge: LABS -->
  <rect x="520" y="52" width="70" height="26" rx="6" fill="#FDF3EE" stroke="#F6DCD2" stroke-width="1.5"/>
  <text x="535" y="70" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="13" fill="#BD4B2A" letter-spacing="1">LABS</text>
  
  <text x="210" y="165" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="500" font-size="15" fill="#8C8377">Student Internships, Hackathons &amp; Fellowships</text>
</svg>`;

// 4. OpenGraph Social Preview Banner SVG (1200x630)
const ogSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="ogBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E1714" />
      <stop offset="60%" stop-color="#14100E" />
      <stop offset="100%" stop-color="#0A0807" />
    </linearGradient>
    <radialGradient id="ogGlow" cx="20%" cy="20%" r="60%">
      <stop offset="0%" stop-color="#BD4B2A" stop-opacity="0.32" />
      <stop offset="100%" stop-color="#BD4B2A" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="ogBrandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E86E4A" />
      <stop offset="100%" stop-color="#BD4B2A" />
    </linearGradient>
    <filter id="ogDrop" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Deep dark canvas background -->
  <rect width="1200" height="630" fill="url(#ogBg)" />
  <rect width="1200" height="630" fill="url(#ogGlow)" />

  <!-- Grid accent pattern -->
  <g opacity="0.06" stroke="#FFFFFF" stroke-width="1">
    <line x1="100" y1="0" x2="100" y2="630"/>
    <line x1="300" y1="0" x2="300" y2="630"/>
    <line x1="500" y1="0" x2="500" y2="630"/>
    <line x1="700" y1="0" x2="700" y2="630"/>
    <line x1="900" y1="0" x2="900" y2="630"/>
    <line x1="1100" y1="0" x2="1100" y2="630"/>
    <line x1="0" y1="100" x2="1200" y2="100"/>
    <line x1="0" y1="250" x2="1200" y2="250"/>
    <line x1="0" y1="400" x2="1200" y2="400"/>
    <line x1="0" y1="550" x2="1200" y2="550"/>
  </g>

  <!-- Outer frame -->
  <rect x="24" y="24" width="1152" height="582" rx="28" fill="none" stroke="#FFFFFF" stroke-opacity="0.10" stroke-width="2"/>

  <!-- Brand badge in top left -->
  <g transform="translate(80, 72)">
    <rect width="48" height="48" rx="12" fill="url(#ogBrandGrad)" />
    <g transform="translate(5, 5) scale(0.075)">
      <path d="M 245 40 C 190 45, 140 70, 100 110 C 60 150, 35 205, 25 260 C 23 270, 22 285, 22 300 C 20 355, 35 405, 65 450 C 90 490, 125 520, 170 540 C 220 565, 280 572, 335 560 C 410 545, 470 500, 505 430 C 513 415, 517 405, 517 400 C 517 395, 512 388, 508 386 C 505 385, 475 375, 425 360 C 395 350, 397 350, 385 370 C 367 397, 337 417, 305 423 C 294 425, 273 425, 261 423 C 208 413, 170 372, 161 315 C 156 281, 165 246, 187 218 C 204 196, 226 181, 256 173 C 263 171, 268 171, 284 171 C 301 171, 305 171, 314 173 C 344 180, 370 197, 388 221 C 392 226, 396 231, 397 231 C 401 233, 409 233, 414 231 C 416 230, 430 222, 445 214 C 504 181, 504 181, 502 173 C 501 165, 480 138, 460 119 C 420 81, 372 57, 315 48 C 301 46, 265 45, 245 40 Z" fill="#FFFFFF"/>
    </g>
    <text x="64" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="20" fill="#E86E4A" letter-spacing="2">CAMPUSLOOP LABS</text>
  </g>

  <!-- Main Headline -->
  <text x="80" y="210" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="64" fill="#FFFFFF" letter-spacing="-2">CampusLoop Opportunities</text>
  <text x="80" y="270" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="500" font-size="28" fill="#D6CDC5" letter-spacing="-0.5">The Premier Student Discovery Engine for India &amp; Worldwide</text>

  <!-- Category Pills Bar -->
  <g transform="translate(80, 330)">
    <!-- Internship -->
    <g transform="translate(0, 0)">
      <rect width="140" height="44" rx="10" fill="#29201C" stroke="#BD4B2A" stroke-width="1.5" stroke-opacity="0.6"/>
      <text x="24" y="27" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="16" fill="#FFA585">Internships</text>
    </g>
    <!-- Hackathons -->
    <g transform="translate(155, 0)">
      <rect width="145" height="44" rx="10" fill="#29201C" stroke="#BD4B2A" stroke-width="1.5" stroke-opacity="0.6"/>
      <text x="24" y="27" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="16" fill="#FFA585">Hackathons</text>
    </g>
    <!-- Scholarships -->
    <g transform="translate(315, 0)">
      <rect width="155" height="44" rx="10" fill="#29201C" stroke="#BD4B2A" stroke-width="1.5" stroke-opacity="0.6"/>
      <text x="24" y="27" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="16" fill="#FFA585">Scholarships</text>
    </g>
    <!-- Fellowships -->
    <g transform="translate(485, 0)">
      <rect width="145" height="44" rx="10" fill="#29201C" stroke="#BD4B2A" stroke-width="1.5" stroke-opacity="0.6"/>
      <text x="24" y="27" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="16" fill="#FFA585">Fellowships</text>
    </g>
    <!-- Research -->
    <g transform="translate(645, 0)">
      <rect width="125" height="44" rx="10" fill="#29201C" stroke="#BD4B2A" stroke-width="1.5" stroke-opacity="0.6"/>
      <text x="24" y="27" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="16" fill="#FFA585">Research</text>
    </g>
    <!-- Competitions -->
    <g transform="translate(785, 0)">
      <rect width="160" height="44" rx="10" fill="#29201C" stroke="#BD4B2A" stroke-width="1.5" stroke-opacity="0.6"/>
      <text x="24" y="27" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="16" fill="#FFA585">Competitions</text>
    </g>
  </g>

  <!-- Divider -->
  <line x1="80" y1="430" x2="1120" y2="430" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1"/>

  <!-- Footer highlights & trust features -->
  <g transform="translate(80, 480)">
    <g transform="translate(0, 0)">
      <circle cx="12" cy="12" r="10" fill="#1E7E34" />
      <path d="M 8 12 L 11 15 L 16 9" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="32" y="17" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="18" fill="#F7F3ED">100% Official Links</text>
    </g>

    <g transform="translate(260, 0)">
      <circle cx="12" cy="12" r="10" fill="#1E7E34" />
      <path d="M 8 12 L 11 15 L 16 9" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="32" y="17" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="18" fill="#F7F3ED">Verified Stipends</text>
    </g>

    <g transform="translate(480, 0)">
      <circle cx="12" cy="12" r="10" fill="#1E7E34" />
      <path d="M 8 12 L 11 15 L 16 9" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="32" y="17" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="18" fill="#F7F3ED">WhatsApp Group Sharing</text>
    </g>

    <!-- Domain on far right -->
    <text x="1040" y="17" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="20" fill="#E86E4A">opportunities.campusloop.space</text>
  </g>
</svg>`;

// Write SVGs
fs.writeFileSync(path.join(publicDir, "icon.svg"), iconSvg);
fs.writeFileSync(path.join(publicDir, "icon-maskable.svg"), maskableSvg);
fs.writeFileSync(path.join(publicDir, "logo.svg"), logoSvg);
fs.writeFileSync(path.join(publicDir, "og-image.svg"), ogSvg);
fs.writeFileSync(path.join(publicDir, "favicon.svg"), iconSvg);

console.log("SVGs generated. Now converting to PNG using ImageMagick...");

// Conversions
const conversions = [
  // PWA standard icons
  { src: "icon.svg", dest: "icon-192x192.png", size: "192x192" },
  { src: "icon.svg", dest: "icon-512x512.png", size: "512x512" },
  { src: "icon.svg", dest: "apple-touch-icon.png", size: "180x180" },
  // PWA maskable icons
  { src: "icon-maskable.svg", dest: "icon-maskable-192x192.png", size: "192x192" },
  { src: "icon-maskable.svg", dest: "icon-maskable-512x512.png", size: "512x512" },
  // Logo
  { src: "logo.svg", dest: "logo.png", size: "800x200" },
  // Social OpenGraph Image
  { src: "og-image.svg", dest: "og-image.png", size: "1200x630" },
  // Favicon ico
  { src: "icon.svg", dest: "favicon.ico", size: "48x48" }
];

for (const item of conversions) {
  const srcPath = path.join(publicDir, item.src);
  const destPath = path.join(publicDir, item.dest);
  const cmd = `convert -background none "${srcPath}" -resize ${item.size} "${destPath}"`;
  try {
    execSync(cmd);
    console.log(`Generated: ${item.dest} (${item.size})`);
  } catch (err) {
    console.error(`Error generating ${item.dest}:`, err.message);
  }
}

console.log("All asset generation complete.");
