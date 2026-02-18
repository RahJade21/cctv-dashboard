import React from 'react';
import { HelpCircle, Book, MessageCircle, Mail } from 'lucide-react';

export default function Help() {
  const faqs = [
    {
      question: 'How does the bullying detection work?',
      answer: 'Our AI-powered system analyzes CCTV footage in real-time using computer vision and machine learning algorithms to detect patterns of bullying behavior.'
    },
    {
      question: 'How accurate is the detection system?',
      answer: 'The system maintains an average accuracy rate of 94%, with continuous improvements through machine learning updates.'
    },
    {
      question: 'Can I customize alert settings?',
      answer: 'Yes, you can customize detection sensitivity, notification preferences, and minimum confidence levels in the Settings page.'
    },
    {
      question: 'How long are recordings stored?',
      answer: 'Recordings are automatically stored for 90 days, with the option to manually archive important footage permanently.'
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Help & Support</h1>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
          <Book className="text-indigo-600 mb-3" size={32} />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Documentation</h3>
          <p className="text-gray-600 text-sm">Access comprehensive guides and tutorials</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
          <MessageCircle className="text-indigo-600 mb-3" size={32} />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Live Chat</h3>
          <p className="text-gray-600 text-sm">Chat with our support team in real-time</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
          <Mail className="text-indigo-600 mb-3" size={32} />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Email Support</h3>
          <p className="text-gray-600 text-sm">Send us your questions via email</p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <HelpCircle className="text-indigo-600" size={24} />
          Frequently Asked Questions
        </h2>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
              <h3 className="font-semibold text-gray-800 mb-2">{faq.question}</h3>
              <p className="text-gray-600 text-sm">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Form */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Support</h2>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              placeholder="Enter subject"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              rows="5"
              placeholder="Describe your issue or question"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>
          </div>
          
          <button
            type="submit"
            className="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}