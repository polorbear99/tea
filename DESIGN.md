# Design Style: AI Smart Tea Shop

## Essence & Imagery

A quiet morning in a traditional Chinese tea house. Warm light filters through rice paper screens. The gentle steam rises from a gaiwan. Celadon tea ware rests on a wooden tea tray. The air carries the faint aroma of roasted oolong.

This is not a generic e-commerce app with green slapped on. This is a digital tea room -- every screen should feel like unfolding a tea towel to reveal the ware beneath.

## Visual Strategy

- **Photography**: Warm-toned, soft natural light. Tea leaves in focus with bokeh backgrounds. No harsh studio lighting.
- **Graphics**: Minimal line icons with organic stroke weight. Avoid geometric rigidity.
- **Textures**: Subtle paper/fiber textures for cards. No heavy gradients.

## Color Palette

| Role | Color | Hex | Imagery |
|------|-------|-----|---------|
| Primary | Tea Green | #3B6B3A | Fresh tea leaves after rain |
| Primary Dark | Deep Tea | #2A4F2A | Aged pu-erh liquor |
| Accent | Amber Gold | #C4883A | First-brew oolong color |
| Background | Rice Paper | #FAF7F2 | Unbleached cotton wrapper |
| Surface | Warm Cream | #F3EDE4 | Porcelain saucer |
| Text Primary | Ink Brown | #2C2416 | Calligraphy ink on xuan paper |
| Text Secondary | Tea Stain | #7A6B5A | Faint tea stain on cloth |
| Border | Bamboo | #E5DDD0 | Dried bamboo weave |
| Error | Cinnabar | #C4463A | Traditional seal paste |

## Typography

- **Headlines**: Noto Serif SC (Chinese), weight 600-700. Evokes brush-written tea labels.
- **Body**: Noto Sans SC (Chinese), weight 400. Clean, readable, modern.
- **Numbers/English**: DM Sans, weight 400-500.
- **Rhythm**: Generous line-height (1.6-1.8). Tea is about slowing down; the typography should breathe.

## Motion & Interaction

- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` -- gentle, like pouring tea.
- **Duration**: 200-300ms for transitions. Nothing snappy or jarring.
- **Scroll**: Smooth, weighted feel. Cards should settle, not bounce.
- **Loading**: Skeleton screens with warm cream tones, not gray.

## Design Taboos

- No neon colors, no electric blue, no tech gradients
- No rounded-to-the-point-of-blob buttons (max rounded-lg)
- No heavy drop shadows (use subtle elevation: shadow-sm)
- No stock photos of people shaking hands
- No generic "e-commerce red" for CTAs
- No dark mode as default (tea is a daytime, light experience)
