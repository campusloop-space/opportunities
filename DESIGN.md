# CampusLoop Opportunities — Design System & UI Specification

## 1. Brand Identity & Aesthetic Foundation

CampusLoop Opportunities is part of the **CampusLoop Labs** family, designed with an editorial, trustworthy, academic-grade aesthetic tailored for Indian and global college students.

Rather than a generic blue SaaS layout, the visual identity uses warm terracotta tones, parchment neutrals, crisp micro-typography, and high-density information cards reminiscent of high-end research directories and university publications.

### Color Tokens

| Token Name | Hex Code | Purpose |
| :--- | :--- | :--- |
| `--color-terracotta` | `#BD4B2A` | Primary brand accent, active states, key CTAs |
| `--color-terracotta-hover` | `#A33F22` | Hover states for primary buttons and links |
| `--color-terracotta-light` | `#FDF3EE` | Badge backgrounds, accent containers |
| `--color-terracotta-border` | `#F6DCD2` | Subtle borders for terracotta surfaces |
| `--color-cream` | `#FDFBF7` | Page background, canvas wash |
| `--color-cream-subtle` | `#F7F3ED` | Secondary containers, filter bars, card hover surfaces |
| `--color-border-card` | `#E8E1D5` | Default card and panel outlines |
| `--color-border-divider` | `#F2ECE3` | Hairline dividers and internal card rules |
| `--color-text-primary` | `#1E1A17` | Headings, titles, high-emphasis text |
| `--color-text-secondary` | `#4A4238` | Body copy, descriptions, navigation links |
| `--color-text-muted` | `#6B635B` | Metadata, labels, secondary information |
| `--color-text-faint` | `#8C8377` | Timestamps, placeholder text, source verification indicators |
| `--color-success` | `#1E7E34` | Verified status, active stipends, open badges |
| `--color-success-bg` | `#EBF7EE` | Success badge background |
| `--color-success-border` | `#C3E6CB` | Success badge border |
| `--color-danger` | `#9B1C1C` | Closed/expired indicators, report alerts |
| `--color-danger-bg` | `#FDF2F2` | Danger badge background |
| `--color-danger-border` | `#F8B4B4` | Danger badge border |
| `--color-amber` | `#B45309` | Closing soon countdown warnings |
| `--color-amber-bg` | `#FEF3C7` | Closing soon badge background |
| `--color-amber-border` | `#FDE68A` | Closing soon badge border |

---

## 2. Typography & Spatial Rhythm

### Type Hierarchy
- **Primary Font Family**: Inter, system sans-serif (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`).
- **Headings**:
  - `Hero Title`: `text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight`
  - `Section Title`: `text-xl sm:text-2xl font-bold tracking-tight text-[#1E1A17]`
  - `Card Title`: `text-base font-bold text-[#1E1A17] line-clamp-2`
  - `Metadata / Badges`: `text-[11px] font-semibold tracking-wide uppercase`

### Layout Density
- Designed for scannability during intense application seasons.
- Cards use compact padding (`p-5` on desktop, `p-4` on mobile) with explicit line clamping to prevent vertical sprawl.
- Filter chips and quick categories are accessible within 1 tap on mobile viewports.

---

## 3. Core Component Library

### 1. OpportunityCard (`components/opportunity-card.tsx`)
- **Category Badge**: Top-left colored pill indicating category (`Internship`, `Hackathon`, `Scholarship`, `Fellowship`, `Research`, `Competition`, `Student Program`).
- **Urgency Indicator**: Dynamic pill displaying:
  - `Closing Soon (X days left)` with amber badge if deadline is within 7 days.
  - `Open` with emerald badge if deadline is active.
  - `Expired` with subtle crimson badge if deadline has elapsed.
- **Save Bookmark Action**: Top-right heart/bookmark icon with optimistic local state and CampusLoop authentication check.
- **Organization & Role**: Clear organizer name with building icon, followed by hyperlinked opportunity title.
- **Perks & Format**: Pills showing `Stipend / Prize Pool`, `Remote / In-Person / Hybrid`, and `Location`.
- **Source Verification Footer**: Displays `Official` or `Verified Source` check with quick `View Details` chevron.

### 2. Search & Filter Bar (`components/search-filters.tsx`)
- Dynamic URL parameter synchronization (`useSearchParams` + `useRouter`).
- Free-text query debouncing for instant search across title, organization, and description.
- Multi-dimensional filtering:
  - **Category**: Select dropdown covering all 7 opportunity types.
  - **Location Type**: `all`, `remote`, `in_person`, `hybrid`.
  - **Status Filter**: `all`, `open` (hide closed/expired).
  - **Sort Order**: `deadline` (closing first) vs `newest` (recently posted).
  - **Stipend Toggle**: Checkbox to isolate paid opportunities.

### 3. Share & Bookmark Action Bar (`components/share-buttons.tsx` & `components/save-button.tsx`)
- **Direct WhatsApp Sharing**: Tailored one-tap URL scheme (`https://api.whatsapp.com/send?text=...`) for sharing opportunities into college batch WhatsApp and Telegram groups.
- **Copy Link**: Toast-free inline feedback copying the canonical URL.
- **Web Share API**: Native sheet fallback for mobile browsers.
- **Save Button**: Preserves bookmarks in Neon database for signed-in CampusLoop users.

---

## 4. Accessibility & Responsive Breakpoints

- **Breakpoints**:
  - `sm`: 640px (single-column cards switch to 2-column grid)
  - `md`: 768px (horizontal navigation & filter drawer expands)
  - `lg`: 1024px (3-column discovery feed, sticky sidebars)
  - `xl`: 1280px (maximum container width `max-w-7xl` with 24px padding)
- **Contrast**: All text tokens exceed WCAG 2.1 AA 4.5:1 contrast requirements against their respective backgrounds.
- **Keyboard Navigation**: All interactive elements (filters, bookmark buttons, category chips, outbound links) have visible `:focus-visible` outlines.
- **Semantic HTML**: Proper `<header>`, `<main>`, `<section>`, `<nav>`, `<footer>`, `<article>`, and `<time>` tags throughout all pages.
