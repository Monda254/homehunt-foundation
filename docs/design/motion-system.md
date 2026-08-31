# HomeHunt Motion & Interaction System Specification

This document details the motion system design tokens, reusable primitives, integration patterns, and accessibility guidelines established in Phase 8.5.

## 1. Motion Principles

Every animation in HomeHunt is purposeful. The motion system follows these principles:

1. **Subtle & Confident**: Use micro-transforms (e.g., `y: 8px -> 0`) and natural timing to ensure interfaces feel smooth, not bouncy or playful.
2. **Context-Aware**: Maintain hierarchy and spatial continuity (e.g., page transitions, cards sliding, list staggering) to guide user focus.
3. **Response-Driven**: UI animations must respond to actual database state changes and user clicks immediately, never introducing artificial delays.
4. **Accessible First**: Honor system-level accessibility flags (`prefers-reduced-motion: reduce`) by scaling back transform ranges and timing duration.

---

## 2. Timing & Easing Tokens

Timing tokens are centralized in [motionTokens.ts](file:///home/monda/homehunt-foundation-main/src/components/motion/motionTokens.ts) to guarantee consistency across components.

### Durations

| Token | Timing (ms) | Target Use Case |
| :--- | :--- | :--- |
| `instant` | 100ms | Icon hover states, immediate checks, toggle switches |
| `fast` | 150ms | Dropdown menu entrances, tab indicator shifts |
| `normal` | 250ms | Card lifts, button press shrinkages, modal popup backdrops |
| `medium` | 350ms | Modal window zoom scales, page layout entrances |
| `slow` | 500ms | Large wizard step slides, scroll-in reveals |
| `celebration` | 1000ms | Major milestone confirmations (signature completed, tenancy active) |

### Easing Slopes

* **Standard**: `cubic-bezier(0.4, 0, 0.2, 1)` - For general movements (default ease).
* **Enter (Decelerate)**: `cubic-bezier(0, 0, 0.2, 1)` - For incoming widgets moving into frame.
* **Exit (Accelerate)**: `cubic-bezier(0.4, 0, 1, 1)` - For outgoing widgets exiting frame.
* **Emphasized**: `cubic-bezier(0.83, 0, 0.17, 1)` - For storytelling and marketing hero slides.

---

## 3. Reusable Primitives & Usage

Centralized primitives are placed under `src/components/motion/`:

### 1. [MotionProvider.tsx](file:///home/monda/homehunt-foundation-main/src/components/motion/MotionProvider.tsx)
Context wrapper tracking media query listeners for `prefers-reduced-motion` and propagating it to Framer Motion's `MotionConfig` settings.
```tsx
import { MotionProvider } from '@/components/motion/MotionProvider';

// Wrapped globally inside AuthProvider in Root route
```

### 2. [PageTransition.tsx](file:///home/monda/homehunt-foundation-main/src/components/motion/PageTransition.tsx)
Standard route wrapper performing a smooth vertical fade-in on transition.
```tsx
import { PageTransition } from '@/components/motion/PageTransition';

<PageTransition>
  <MyRouteView />
</PageTransition>
```

### 3. [AnimatedCard.tsx](file:///home/monda/homehunt-foundation-main/src/components/motion/AnimatedCard.tsx)
Card-level entrance stagger animation with slight hover elevation. Inherits standard `div` attributes (e.g., hover events).
```tsx
import { AnimatedCard } from '@/components/motion/AnimatedCard';

<AnimatedCard delay={0.1} className="my-card">
  <CardContent />
</AnimatedCard>
```

### 4. [AnimatedButton.tsx](file:///home/monda/homehunt-foundation-main/src/components/motion/AnimatedButton.tsx)
Button component that handles click press scale shrinkages, disabled actions, and pending loaders.
```tsx
import { AnimatedButton } from '@/components/motion/AnimatedButton';

<AnimatedButton variant="primary" loading={isPending} onClick={handleSubmit}>
  Submit Form
</AnimatedButton>
```

### 5. [AnimatedModal.tsx](file:///home/monda/homehunt-foundation-main/src/components/motion/AnimatedModal.tsx)
Modal dialog popup featuring blurred backdrop fades and spring zoom entries. Prevents page background scrolling automatically.
```tsx
import { AnimatedModal } from '@/components/motion/AnimatedModal';

<AnimatedModal isOpen={isOpen} onClose={handleClose} title="Inspection Record">
  <ModalContent />
</AnimatedModal>
```

### 6. [AnimatedNumber.tsx](file:///home/monda/homehunt-foundation-main/src/components/motion/AnimatedNumber.tsx)
Statistical metric count-up indicator using requestAnimationFrame cubic curves.
```tsx
import { AnimatedNumber } from '@/components/motion/AnimatedNumber';

<AnimatedNumber value={85} />
```

### 7. [Skeleton.tsx](file:///home/monda/homehunt-foundation-main/src/components/motion/Skeleton.tsx)
Low-contrast loading shimmer boxes respecting reduced-motion configurations.
```tsx
import { Skeleton } from '@/components/motion/Skeleton';

<Skeleton className="h-6 w-1/3" />
```

### 8. [HomeHuntJourney.tsx](file:///home/monda/homehunt-foundation-main/src/components/motion/HomeHuntJourney.tsx)
Tenancy milestone stepper progress indicators (Discover -> View -> Apply -> Approve -> Lease -> Move-In -> Tenancy).
```tsx
import { HomeHuntJourney } from '@/components/motion/HomeHuntJourney';

<HomeHuntJourney currentStage="MOVE_IN" />
```

---

## 4. Accessibility Guidelines (Reduced Motion)

When `prefers-reduced-motion` is enabled:
* Framer Motion defaults to an timing-only fallback mode, dropping spring-back or translate transforms.
* The `Skeleton` loading component swaps out dynamic background shimmers for a solid low-contrast fill.
* Count-up metrics inside `AnimatedNumber` render their final values instantly to avoid visual fatigue.
