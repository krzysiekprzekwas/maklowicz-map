# Makłowicz Culinary Map

An interactive map showcasing all the restaurants and culinary spots visited by Robert Makłowicz during his legendary TV career. This project allows food enthusiasts and travelers to explore and visit the same locations that were featured in his shows.

## Features

- Interactive world map showing all visited locations
- Details about each restaurant/location
- Information about the episodes where locations were featured
- Mobile-friendly interface

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Mapbox/Leaflet for mapping

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file and add your map provider API key:
   ```
   NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Contributing

Feel free to contribute by adding new locations, fixing data, or improving the application. Please submit a pull request with your changes.

## License

MIT 