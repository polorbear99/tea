# Design Guidelines - AI Smart Tea Shop

## Brand Positioning

- **Product**: AI-powered tea shop mini program
- **Style**: Modern Chinese minimalism, warm and natural
- **Target**: Tea enthusiasts, gift buyers, tea culture curious consumers
- **Mood**: Calm, knowledgeable, trustworthy, unhurried

## Color Palette

| Token | Tailwind Class | Hex | Usage |
|-------|---------------|-----|-------|
| Primary | `bg-tea-600` / `text-tea-600` | #3B6B3A | Main actions, brand elements |
| Primary Dark | `bg-tea-700` | #2A4F2A | Hover states, emphasis |
| Accent | `bg-amber-600` / `text-amber-600` | #C4883A | Highlights, prices, badges |
| Background | `bg-stone-50` | #FAF7F2 | Page background |
| Surface | `bg-stone-100` | #F3EDE4 | Cards, containers |
| Text Primary | `text-stone-800` | #2C2416 | Headings, body text |
| Text Secondary | `text-stone-500` | #7A6B5A | Descriptions, hints |
| Border | `border-stone-200` | #E5DDD0 | Dividers, card borders |
| Error | `text-red-600` | #C4463A | Error states, destructive |

## Typography

- **Page Title**: `text-xl font-bold text-stone-800`
- **Section Title**: `text-lg font-semibold text-stone-800`
- **Body**: `text-sm text-stone-700`
- **Caption**: `text-xs text-stone-500`
- **Price**: `text-lg font-bold text-amber-600`

## Spacing

- **Page horizontal padding**: `px-4`
- **Section gap**: `gap-6`
- **Card padding**: `p-4`
- **Item gap in list**: `gap-3`
- **Card border radius**: `rounded-xl`
- **Button radius**: `rounded-lg`

## Component Usage Principles

- All generic UI components (Button, Input, Card, Dialog, Tabs, Badge, Toast, Skeleton) MUST use `@/components/ui/*`
- Page containers use `View` with Tailwind classes
- Text content uses `Text` from `@tarojs/components` with `block` class for vertical layout
- Icons use `lucide-react-taro` with `color/size/strokeWidth` props
- Product cards, tea info panels are business components built per page

## Navigation Structure

TabBar with 4 tabs:
1. **Home** (pages/index/index) - AI entry + recommendations
2. **Tea Shop** (pages/shop/index) - Product catalog
3. **Orders** (pages/orders/index) - Order history
4. **My** (pages/profile/index) - User profile

## Empty & Loading States

- **Loading**: Use `Skeleton` from `@/components/ui/skeleton` with warm cream background
- **Empty**: Centered icon + text, `text-stone-400` color
- **Error**: Gentle message with retry button
