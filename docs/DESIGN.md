# Design direction

Computing Systems Arena is a bench sheet for revision, not a marketing site. The reference is a lab manual laid over a memory map: addresses down the left, one line per world, figures that read as schematics. The job of the screen is to show where you are, what is weak, and what to do next.

This note follows three sources. Anthropic’s frontend-design skill (updated September 2026) asks for a subject-specific identity, a real type scale, and motion only when it answers an action. It also lists second-wave defaults that appear once the first tells are banned: cream-and-terracotta, acid green on black, broadsheet cosplay, identical SaaS cards, and template chrome (tracked eyebrows, arrows on every link). Those are legitimate only when the brief asks for them. Articles on AI-slop UI (Capital & Compute, 925 Studios, Regards) name the first-wave tells: Inter or a system stack for every word, purple-to-pink gradients, glass, emoji icons, `rounded-2xl` cards with the same soft shadow, a centred hero plus three feature cards, gradient text, and filler copy. Refactoring UI (Wathan and Schoger) supplies the working rules: hierarchy from size, weight, and colour together; two weights; a spacing scale whose steps differ by at least about a quarter; grey text in the same hue as the background; colour never as the only signal; primary actions solid and secondary actions quiet.

## Decisions

- Type. IBM Plex Sans for the interface, IBM Plex Mono for addresses, scores, and code. Scale: 12, 14, 16, 20, 28, 40. Body line length stays under 80 characters. Two weights: 400 and 600.
- Colour. One accent, signal amber `#c47d09` (large type and focus) and `#f0a202` as a fill with ink `#1a1408`. Dark ground `#16181b`, light ground `#f4f5f2`. Muted text is a tint of the same hue and clears WCAG AA on both grounds. Correct and incorrect are oxide green and brick, always with the words “Correct” or “Not this”.
- Layout. The home screen is an address table, not a card grid. Rules separate rows. A card exists only when a question, a boss prompt, or a result needs a boundary. Radius is 2px. Elevation is a 1px border, not a shadow. No blur, no glow, no gradient text.
- Density. Mobile is the primary measure. The map fits a week title, a fraction mastered, and a 4px tick on one row. Desktop adds the one-line blurb; it does not inflate the type.
- Motion. Feedback only: the answer row settles in 120ms, the XP line drops in 160ms. Nothing animates on load. `prefers-reduced-motion` removes both.
- Icons. Lucide, 16px, stroke 1.75, same colour as secondary text. World figures and rank insignia are custom 32px schematics in the text colour, not a rainbow of badges.
- Copy. Name the action. “Revise Basics”, “Start the clock”, “Save self-grade”. No slogans.

Amber is used for the primary action, the current rank, XP, and the mastery tick. It is not a wash behind the page.
