import React from 'react';
import Link from 'next/link';

export default function Contact() {
  return (
    <main className="flex min-h-screen flex-col bg-secondary">
      <header className="bg-primary text-secondary">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Śladami Roberta Makłowicza</h1>
            <p className="text-lg opacity-90">Interaktywna mapa restauracji i atrakcji odwiedzonych przez Roberta Makłowicza</p>
          </div>
          <nav>
            <ul className="flex space-x-6 items-center text-lg">
              <li>
                <Link 
                  href="/" 
                  className="hover:text-secondary-darker transition-colors border-b-2 border-primary hover:border-secondary-darker"
                >
                  Mapa
                </Link>
              </li>
              <li>
                <Link 
                  href="/about" 
                  className="hover:text-secondary-darker transition-colors border-b-2 border-primary hover:border-secondary-darker"
                >
                  O projekcie
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="text-secondary border-b-2 border-secondary"
                >
                  Kontakt
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-primary mb-8">Kontakt</h2>
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            <p className="text-primary-hover mb-8">
              Masz pytanie, sugestię lub znalazłeś błąd na mapie? Skontaktuj się z nami!
            </p>

            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-primary font-medium mb-2">
                  Imię i nazwisko
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full px-4 py-2 rounded-lg border border-secondary-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-primary font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-2 rounded-lg border border-secondary-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-primary font-medium mb-2">
                  Wiadomość
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-secondary-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                ></textarea>
              </div>

              <button
                type="submit"
                className="bg-primary text-secondary px-6 py-3 rounded-lg hover:bg-primary-hover transition-colors"
              >
                Wyślij wiadomość
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
} 