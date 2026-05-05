// Initialize local D1 database for development
async function initializeDatabase() {
  try {
    console.log('Initializing local database...');
    
    const response = await fetch('http://localhost:5173/api/init-db', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Database initialized successfully!');
      console.log('Tables created:');
      console.log('  - saved_trips');
      console.log('  - saved_cities');
      console.log('  - saved_attractions');
      console.log('  - saved_itineraries');
      console.log('\nYou can now use the Dashboard features.');
    } else {
      console.error('❌ Database initialization failed:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    console.log('\nMake sure the dev server is running on http://localhost:5173');
    process.exit(1);
  }
}

initializeDatabase();
