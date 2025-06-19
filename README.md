# jBoilerplate

A modern Vue 3 boilerplate with TypeScript, Shadcn UI components, and comprehensive features for quickly starting new projects.

## Features

- 🚀 [Vue 3](https://v3.vuejs.org/) with [Composition API](https://v3.vuejs.org/guide/composition-api-introduction.html)
- 🔥 [TypeScript](https://www.typescriptlang.org/) for type safety
- 🎨 [Shadcn UI](https://ui.shadcn.com/) with customizable components
- 📦 [Pinia](https://pinia.vuejs.org/) for state management
- 🔄 [Vue Router](https://router.vuejs.org/) with route guards
- 🌐 [Vue I18n](https://vue-i18n.intlify.dev/) for internationalization
- 🔍 [Knex.js](https://knexjs.org/) for database query building
- 📧 Plunk email integration
- 📊 Umami analytics
- 🔒 Advanced authentication and authorization
- 🎭 Dark mode with system preference detection
- 🚦 Form validation with VeeValidate
- 📱 Responsive design
- 📈 Dashboard components and layouts
- 🛠️ Admin and SuperAdmin interfaces
- ⚡ Vite for lightning-fast development

## Quick Start

### Prerequisites

1. Install pnpm (if you haven't already):
   ```bash
   npm install -g pnpm
   ```

### Clone and Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/jboilerplate.git
cd jboilerplate

# One command setup (installs dependencies and builds the project)
pnpm setup
```

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Available Scripts

- `pnpm setup` - Initial project setup after cloning
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Lint code
- `pnpm test` - Run tests
- `pnpm test:watch` - Run tests in watch mode

## Configuration

### TypeScript Configuration

The project uses a multi-tsconfig setup for better type checking and build performance:

- `tsconfig.json` - Base configuration file
- `tsconfig.app.json` - Application-specific configuration
- `tsconfig.node.json` - Node.js/build tools configuration

Key TypeScript features enabled:
- Project references for faster builds
- Strict type checking
- Module resolution with path aliases
- Declaration file generation
- Import extensions support

Important settings in `tsconfig.node.json`:
```json
{
  "compilerOptions": {
    "composite": true,
    "emitDeclarationOnly": true,
    "allowImportingTsExtensions": true
  }
}
```

### Environment Variables

Create a `.env` file based on `.env.example`:

```
VITE_API_URL=http://localhost:3000/api
VITE_PLUNK_API_KEY=your_plunk_api_key
VITE_UMAMI_WEBSITE_ID=your_umami_id
VITE_UMAMI_URL=https://analytics.example.com
```

## Project Structure

```
my-project/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Application assets
│   ├── components/         # Vue components
│   │   └── ui/             # Shadcn UI components
│   ├── composables/        # Vue composables
│   ├── constants/          # Application constants
│   ├── layouts/            # Page layouts
│   ├── lib/                # Utilities and libraries
│   │   └── db/             # Database integration
│   ├── locales/            # I18n translation files
│   ├── pages/              # Application pages
│   │   ├── admin/          # Admin pages
│   │   └── superadmin/     # SuperAdmin pages
│   ├── plugins/            # Vue plugins
│   ├── router/             # Vue Router configuration
│   ├── services/           # API and other services
│   ├── stores/             # Pinia stores
│   └── types/              # TypeScript type definitions
├── components.json         # Shadcn UI configuration
├── vite.config.ts          # Vite configuration
└── tsconfig.json           # TypeScript configuration
```

## Features

### Authentication

jBoilerplate provides a complete authentication system with:

- User registration and login
- JWT token handling with HTTP-only cookies
- Role-based access control
- Password reset flow
- Account verification

### Internationalization

Support for multiple languages using Vue I18n:

```javascript
// Change language
const { locale } = useI18n();
locale.value = 'es';

// Use in templates
<p>{{ $t('welcome.message') }}</p>
```

### Theming

Customize the application theme in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {...},
      secondary: {...}
    }
  }
}
```

### Admin Dashboard

The admin dashboard includes:

- Analytics overview
- User management
- Settings management
- Role and permission management
- System health monitoring

## Customization

### Adding New Components

1. Create a new component in `src/components/`:

```vue
<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>

<template>
  <div class="my-component">
    <h2>{{ title }}</h2>
    <slot />
  </div>
</template>
```

2. Import and use it in your pages:

```vue
<script setup lang="ts">
import MyComponent from '@/components/MyComponent.vue';
</script>

<template>
  <MyComponent title="Hello World">
    Content goes here
  </MyComponent>
</template>
```

### Adding New Pages

1. Create a new page in `src/pages/`:

```vue
<script setup lang="ts">
import MainLayout from '@/layouts/MainLayout.vue';
</script>

<template>
  <MainLayout>
    <h1>New Page</h1>
    <p>This is a new page</p>
  </MainLayout>
</template>
```

2. Add a route in `src/router/routes/`:

```typescript
export default [
  {
    path: '/new-page',
    name: 'NewPage',
    component: () => import('@/pages/NewPage.vue'),
    meta: {
      requiresAuth: true,
      title: 'New Page'
    }
  }
];
```

## Performance Optimization

The boilerplate includes several performance optimizations:

- Route-based code splitting
- Image optimization
- Lazy loading components
- Asset caching
- Server-side rendering (optional)

## Security

Built-in security features:

- CSRF protection
- Input sanitization
- XSS protection
- Content Security Policy
- Secure authentication flow

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Vue.js](https://vuejs.org/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
