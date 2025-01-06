# Stylo - Photography Order Management System

A Next.js application for managing photography orders, customers, and image handling.

## Features

- Customer Management
- Order Management with Status Tracking
- Image Upload and Viewing
- Responsive UI with Modern Design

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

## Getting Started

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/stylo.git
cd stylo
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env` file in the root directory with the following variables:
```env
DATABASE_URL="file:./prisma/dev.db"
```

4. **Database Setup**
```bash
# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push
```

5. **Run Development Server**
```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Testing

Run the test suite:
```bash
npm test
```

## Project Structure

```
stylo/
├── src/
│   ├── app/              # Next.js app router
│   ├── components/       # React components
│   ├── lib/             # Utility functions and configurations
│   └── test/            # Test setup and utilities
├── prisma/              # Database schema and migrations
└── public/             # Static assets
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
