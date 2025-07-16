# Vleeb News - Modern News Blog Application

A modern, responsive news blog application built with React, TypeScript, and Tailwind CSS.

## Features

- 📱 **Mobile-First Design**: Optimized for both mobile and desktop
- 🌙 **Dark Mode Support**: Automatic theme switching
- ⚡ **Fast Performance**: Built with Vite for optimal development and production builds
- 🔄 **Client-Side Routing**: Smooth navigation with React Router
- 🎨 **Modern UI**: Beautiful, professional design with Tailwind CSS
- 📰 **News Articles**: Dynamic article loading and display
- 🔍 **Search & Filter**: Advanced search and filtering capabilities

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS with custom components
- **Icons**: Lucide React
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd vleeb-news
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

### Project Structure

```
src/
├── components/          # React components
├── context/            # React context providers
├── hooks/              # Custom React hooks
├── App.tsx             # Main app component
├── main.tsx            # App entry point
└── index.css           # Global styles
```

## Deployment

### Vercel (Recommended)

This application is optimized for Vercel deployment with proper SPA routing configuration.

1. **Automatic Deployment**: Connect your GitHub repository to Vercel
2. **Manual Deployment**: 
   ```bash
   npm run build
   # Upload the dist folder to Vercel
   ```

### Other Platforms

For other hosting platforms, ensure you have proper SPA fallback configuration:

#### Netlify
Create a `_redirects` file in the `public` folder:
```
/*    /index.html   200
```

#### Apache
Create a `.htaccess` file:
```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

#### Nginx
Add to your nginx configuration:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

## Routing Configuration

The application includes comprehensive routing solutions to handle:

- **Client-side routing** with React Router
- **SPA fallback** for direct URL access
- **Safari mobile refresh** issues
- **404 error handling**

### Key Files

- `public/vercel.json` - Vercel-specific routing configuration
- `public/_redirects` - Netlify/static hosting fallback
- `src/hooks/useRouteFix.ts` - Client-side routing fixes
- `index.html` - Pre-load routing handler

## Mobile Optimization

### Safari Mobile Support

The application includes specific handling for Safari mobile refresh issues:

- Automatic path recovery on page refresh
- Visibility change detection
- Session storage for route persistence

### Responsive Design

- Mobile-first approach with Tailwind CSS
- Touch-friendly interface elements
- Optimized viewport settings
- Progressive enhancement

## Troubleshooting

### Common Issues

1. **404 Errors on Refresh**
   - Ensure your hosting platform has SPA fallback configured
   - Check that `vercel.json` or `_redirects` is properly set up

2. **Safari Mobile Issues**
   - The app includes automatic Safari mobile handling
   - Clear browser cache if issues persist

3. **Build Errors**
   - Ensure all dependencies are installed: `npm install`
   - Check TypeScript configuration: `npm run lint`

### Development Tips

- Use the browser's developer tools to debug routing issues
- Check the console for any error messages
- Test on multiple devices and browsers
- Verify deployment configuration matches your hosting platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on mobile and desktop
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Check the troubleshooting section above
- Review the deployment configuration
- Test on different devices and browsers
- Ensure all routing files are properly configured 