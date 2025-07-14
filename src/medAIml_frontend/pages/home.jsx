import React from 'react';
import FileUploader from '../components/file_upload';

const Home = () => {
  const handleImageUpload = (file) => {
    console.log('📷 Uploaded file:', file);
    // You can send this to backend or save it in state
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-700 to-teal-900 text-white">
      {/* Hero Section */}
      <section className="text-center py-20 px-4">
        <h1 className="text-5xl font-extrabold mb-6">Welcome to DataMind 📊</h1>
        <p className="text-lg text-gray-200 max-w-2xl mx-auto">
          Upload your images, get AI-generated summaries, and visualize data with ease. 
        </p>
      </section>

      {/* Features Section */}
      <section className="bg-white text-gray-800 py-16 px-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 text-center">
          <div className="p-6 bg-gray-100 rounded-xl shadow-md hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">📁 Easy File Upload</h3>
            <p>Upload your Image files in one click and get started instantly.</p>
          </div>
          <div className="p-6 bg-gray-100 rounded-xl shadow-md hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">🤖 AI Summarization</h3>
            <p>Receive automatic summaries and key insights from your data.</p>
          </div>
          <div className="p-6 bg-gray-100 rounded-xl shadow-md hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">📈 Visual Analytics</h3>
            <p>View your data as stunning charts and graphs for deeper analysis.</p>
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section className="text-center py-16 px-4 bg-teal-800">
        <h2 className="text-3xl font-bold mb-4">Start exploring your data now</h2>
        <p className="text-gray-200 mb-6">No technical skills required. Just upload and see the magic!</p>

        <div className="max-w-md mx-auto">
          <FileUploader onDataLoaded={handleImageUpload} />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-teal-900 text-center py-6 text-sm text-gray-300">
        &copy; {new Date().getFullYear()} DataMind. All rights reserved.
      </footer>
    </div>
  );
};

export default Home;
