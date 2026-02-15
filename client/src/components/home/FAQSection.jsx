import React from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

const faqs = [
  {
    question: 'Is Lingora really free?',
    answer: 'Yes! Lingora is completely free to use. We believe language learning should be accessible to everyone.'
  },
  {
    question: 'How do voice rooms work?',
    answer: 'Voice rooms are real-time audio conversations. You can join as a listener first, then become a speaker when you\'re comfortable.'
  },
  {
    question: 'What languages can I learn?',
    answer: 'We support 25+ languages including English, Spanish, French, Japanese, Korean, Mandarin, German, Italian, and more.'
  },
  {
    question: 'Is it safe for beginners?',
    answer: 'Absolutely! We have rooms for all levels, and our community is very supportive of beginners. All rooms are moderated.'
  }
];

const FAQSection = () => {
  return (
    <section className="max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <Badge variant="primary" className="mb-4 inline-block">FAQ</Badge>
        <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
        <p className="text-xl text-gray-600">Got questions? We've got answers</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition">
            <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
            <p className="text-gray-600">{faq.answer}</p>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default FAQSection;