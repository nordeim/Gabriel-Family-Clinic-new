# Gabriel Family Clinic Healthcare Platform

A production-ready healthcare platform for Gabriel Family Clinic with elderly-friendly design, WCAG AAA compliance, and Singapore market localization.

## Project Overview

This is a comprehensive Next.js 14 application built specifically for healthcare services with:
- Elderly-friendly interface (18px base font, 44px+ touch targets)
- WCAG AAA accessibility compliance (7:1 contrast ratios)
- Singapore localization (British English, SGT timezone, CHAS compatibility)
- Modern healthcare design system (Professional Blue + Emerald + Warm Neutrals)
- Comprehensive testing infrastructure (Jest, Playwright, axe-core)
- Security-first approach with healthcare data protection

## Technical Stack

### Core Technologies
- **Frontend Framework**: Next.js 14.2.22 (App Router)
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS v4 with custom healthcare theme
- **UI Components**: Radix UI primitives
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod validation

### Development Tools
- **Testing**: Jest, Testing Library, Playwright, axe-core
- **Code Quality**: ESLint, Prettier with accessibility rules
- **Package Manager**: npm

## Project Structure

```
gabriel-family-clinic/
├── app/                          # Next.js App Router
│   ├── globals.css              # Global styles with accessibility
│   ├── layout.tsx               # Root layout with metadata
│   └── page.tsx                 # Homepage
├── components/                   # React components
│   ├── ui/                      # Base UI components
│   ├── forms/                   # Form components
│   ├── layout/                  # Layout components
│   └── healthcare/              # Healthcare-specific components
├── lib/                         # Utilities and configurations
│   ├── utils.ts                 # Utility functions
│   └── types/                   # TypeScript definitions
├── tests/                       # Testing infrastructure
│   ├── components/              # Component tests
│   ├── pages/                   # Page tests
│   ├── e2e/                     # End-to-end tests
│   └── accessibility/           # Accessibility tests
├── public/                      # Static assets
│   ├── images/                  # Image files
│   ├── icons/                   # Icon files
│   └── fonts/                   # Custom fonts
├── docs/                        # Documentation
│   ├── master-implementation-plan.md
│   └── phase-1-detailed-plan.md
├── .env.example                 # Environment variables template
├── jest.config.js               # Jest configuration
├── playwright.config.ts         # Playwright configuration
├── tailwind.config.ts           # Tailwind CSS configuration
└── tsconfig.json                # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js 18.17.0 or higher
- npm (included with Node.js)

### Installation

1. Navigate to the project directory:
```bash
cd /workspace/gabriel-family-clinic
```

2. Install dependencies:
```bash
npm install --prefix .
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting

# Testing
npm run test             # Run Jest tests in watch mode
npm run test:ci          # Run Jest tests in CI mode
npm run test:e2e         # Run Playwright E2E tests
npm run test:e2e:ui      # Run Playwright tests with UI
```

## Healthcare Design System

### Color Palette

- **Professional Blue** (#1E40AF): Primary brand color
- **Emerald** (#10B981): Success and health indicators
- **Warm Neutrals** (#F8FAFC): Comfortable backgrounds

### Typography

- **Base Font Size**: 18px (elderly-friendly)
- **Line Height**: 1.5 (improved readability)
- **Font Family**: System fonts for consistency

### Accessibility Features

- **Touch Targets**: Minimum 44px × 44px for all interactive elements
- **Contrast Ratios**: 7:1 minimum (WCAG AAA)
- **Focus Indicators**: High-visibility focus states
- **Screen Reader Support**: Full ARIA compliance
- **Reduced Motion**: Respects user preferences

### Singapore Localization

- **Language**: British English (en-SG)
- **Timezone**: Asia/Singapore (SGT)
- **Date Format**: DD/MM/YYYY
- **Currency**: Singapore Dollar (SGD)
- **Healthcare**: CHAS compatibility

## Development Guidelines

### Code Quality Standards

- TypeScript strict mode enabled
- ESLint with accessibility rules
- Prettier for consistent formatting
- 80% minimum test coverage

### Accessibility Requirements

- WCAG AAA compliance mandatory
- All components must pass axe-core tests
- Keyboard navigation fully supported
- Screen reader compatibility required

### Healthcare Compliance

- Patient data privacy protection
- Secure authentication and sessions
- Audit logging for data access
- HIPAA-conscious data handling

## Testing

### Unit Tests (Jest)
```bash
npm run test
```

### E2E Tests (Playwright)
```bash
npm run test:e2e
```

### Accessibility Tests (axe-core)
Integrated into both unit and E2E tests.

## Implementation Phases

This project follows a 9-phase implementation plan:

1. **Phase 1** ✅: Project Foundation & Environment Setup (COMPLETE)
2. **Phase 2**: Design System & Component Library Foundation
3. **Phase 3**: Core UI Components Development
4. **Phase 4**: Database Schema & Backend Integration
5. **Phase 5**: Main Application Pages & Features
6. **Phase 6**: Authentication & Security Implementation
7. **Phase 7**: SEO & Performance Optimization
8. **Phase 8**: Testing & Quality Assurance
9. **Phase 9**: Production Deployment & Final Polish

## Performance Targets

- Bundle Size: <300KB first load
- SEO Score: A+ (95/100)
- Accessibility: WCAG AAA compliance
- Test Coverage: 90%+ with 100% pass rate
- Load Time: <3 seconds

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

This project is proprietary software for Gabriel Family Clinic.

## Support

For technical support or questions, please contact the development team.

---

**Phase 1 Status**: ✅ Complete  
**Next Phase**: Phase 2 - Design System & Component Library Foundation
