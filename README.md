# Passivhaus Simulation - Vue 3 Web Application

A modern Vue 3 client-side web application built with TypeScript, Pinia for state management, and Vite as the build tool.

## 🚀 Features

- **Vue 3** with Composition API and `<script setup>` syntax
- **TypeScript** for type safety
- **Pinia** for state management (modern Vuex alternative)
- **Vue Router** for client-side routing
- **Vite** for fast development and building
- **ESLint** and **Prettier** for code quality
- **Custom UI Components** with proper TypeScript interfaces
- **Composables** for reusable logic
- **Utility functions** for common operations

## 📁 Project Structure

```
src/
├── components/          # Reusable Vue components
│   ├── ui/             # Base UI components (BaseButton, BaseInput, etc.)
│   ├── features/       # Feature-specific components
│   └── icons/          # Icon components
├── stores/             # Pinia stores
├── views/              # Page components/views
├── composables/        # Vue composables for reusable logic
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── assets/             # Static assets
└── router/             # Vue Router configuration
```

## 🛠️ Prerequisites

- **Node.js**: ^20.19.0 || >=22.12.0
- **npm** or **pnpm** (pnpm recommended for better performance)

## 📦 Installation

1. **Clone and navigate to the project:**

   ```bash
   cd passivhaussim
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

## 🚀 Development

1. **Start the development server:**

   ```bash
   npm run dev
   ```

2. **Open your browser to:**

   ```
   http://localhost:5174
   ```

3. **Available development commands:**
   ```bash
   npm run dev          # Start development server
   npm run build        # Build for production
   npm run preview      # Preview production build
   npm run type-check   # Run TypeScript type checking
   npm run lint         # Run ESLint
   npm run format       # Format code with Prettier
   ```

## 🎯 Development Guidelines

### Component Development

- Use `<script setup>` syntax for all components
- Define proper TypeScript interfaces for props
- Use semantic and descriptive naming
- Keep components small and focused

### State Management

- Use Pinia stores with composition API syntax
- Organize stores by feature/domain
- Keep state minimal and normalized
- Use computed properties for derived state

### Code Style

- Follow the project's ESLint and Prettier configuration
- Use TypeScript interfaces for all data structures
- Implement proper error handling
- Write meaningful commit messages

### File Organization

- Place reusable components in `src/components/ui/`
- Feature-specific components go in `src/components/features/`
- Create composables for reusable logic in `src/composables/`
- Define types in `src/types/`
- Utility functions belong in `src/utils/`

## 🧩 Available Components

### UI Components

- **BaseButton**: Flexible button component with variants and states
- **BaseInput**: Input component with validation and error states

### Stores

- **Counter Store**: Example store with history and undo functionality

### Composables

- **useApi**: HTTP request handling with loading and error states

### Utilities

- Debounce and throttle functions
- Date formatting
- Object manipulation utilities
- String conversion helpers

## 📝 Copilot Instructions

This project includes comprehensive Copilot instructions in `.copilot-instructions.md` that provide:

- Technology stack overview
- Code style and conventions
- Best practices for Vue 3, Pinia, and TypeScript
- File organization guidelines
- Performance considerations
- Security guidelines

## 🔧 Configuration Files

- **Vite Config**: `vite.config.ts`
- **TypeScript**: `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- **ESLint**: `eslint.config.ts`
- **Prettier**: `.prettierrc.json`
- **Editor Config**: `.editorconfig`

## 🚢 Production Build

1. **Build the application:**

   ```bash
   npm run build
   ```

2. **Preview the production build:**
   ```bash
   npm run preview
   ```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

## 🎨 Customization

The project is designed to be easily customizable:

- Modify the color scheme in CSS custom properties
- Add new UI components following the established patterns
- Extend the type definitions in `src/types/`
- Create new stores for different features
- Add new composables for reusable logic

## 📚 Learning Resources

- [Vue 3 Documentation](https://vuejs.org/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vue Router Documentation](https://router.vuejs.org/)

## 🤝 Contributing

1. Follow the established code style and conventions
2. Write meaningful commit messages
3. Add proper TypeScript types for new features
4. Test your changes thoroughly
5. Update documentation as needed

---

Built with ❤️ using Vue 3, TypeScript, and modern web development tools.
# henrisim
