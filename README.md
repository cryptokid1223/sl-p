# News Blog

A modern, responsive news blog application built with React, TypeScript, and Tailwind CSS. This application allows you to create and manage news articles with a clean, professional interface.

## Features

- **Landing Page**: Clean, minimalist design with an "Enter News" button
- **News Management**: Add, view, and delete news articles
- **Rich Article Form**: Comprehensive form for creating articles with:
  - Title and content
  - Author information
  - Category selection
  - Optional image URL
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI**: Beautiful design with smooth animations and transitions
- **Real-time Updates**: Articles are displayed immediately after creation

## Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons
- **Date-fns** - Date formatting utilities

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Clone or download this project
2. Navigate to the project directory:
   ```bash
   cd news-blog
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically

## Usage

### Landing Page
- The application starts with a clean landing page
- Click the "Enter News" button to access the news management section

### Adding Articles
1. Click the "Add Article" button
2. Fill in the article details:
   - **Title**: The headline of your article
   - **Content**: The main body text of your article
   - **Author**: Who wrote the article
   - **Category**: Choose from predefined categories
   - **Image URL**: Optional image to accompany the article
3. Click "Publish Article" to save

### Managing Articles
- View all articles in a clean, card-based layout
- Each article shows the title, author, category, and publication date
- Delete articles using the trash icon
- Articles are displayed in reverse chronological order (newest first)

## Project Structure

```
src/
├── components/
│   ├── LandingPage.tsx    # Landing page with "Enter News" button
│   └── NewsPage.tsx       # Main news management page
├── context/
│   └── NewsContext.tsx    # React context for state management
├── App.tsx                # Main application component
├── main.tsx              # Application entry point
└── index.css             # Global styles and Tailwind imports
```

## Customization

### Styling
The application uses Tailwind CSS for styling. You can customize the design by:
- Modifying the `tailwind.config.js` file
- Updating the custom CSS classes in `src/index.css`
- Changing the color scheme in the configuration

### Categories
To add or modify article categories, edit the select options in `src/components/NewsPage.tsx`.

### Features
The application is built with extensibility in mind. You can easily add:
- User authentication
- Article editing
- Search and filtering
- Image upload functionality
- Comments system
- Social sharing

## Browser Support

This application works in all modern browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is open source and available under the MIT License.

## Contributing

Feel free to submit issues and enhancement requests! 