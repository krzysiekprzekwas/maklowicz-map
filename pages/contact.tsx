import React from 'react';
import { motion } from 'framer-motion';

export default function Contact() {
  return (
    <main className="flex flex-1 flex-col bg-secondary">
      <div className="container mx-auto px-6 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-4xl font-bold text-primary mb-8">Kontakt</h2>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
          >
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-primary-hover text-lg mb-4"
            >
              Projekt powstały w ramach działalności Kristof.pro
            </motion.p>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-primary-hover mb-6"
            >
              Masz pytanie, sugestię lub znalazłeś błąd na mapie? Daj mi znać.
              Jestem zawsze otwarty na feedback i chętnie pomogę w rozwiązaniu
              wszelkich problemów związanych z aplikacją.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mb-8"
            >
              <p className="text-primary-hover mb-2">Możesz się ze mną skontaktować przez:</p>
              <a 
                href="mailto:przekwaskrzysiek@gmail.com"
                className="text-primary hover:text-primary-hover transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                przekwaskrzysiek@gmail.com
              </a>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex space-x-6"
            >
              <motion.a
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                href="https://www.linkedin.com/in/krzysztofprzekwas/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-hover transition-colors"
                aria-label="LinkedIn Profile"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                href="https://kristof.pro"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-hover transition-colors"
                aria-label="Personal Website"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0 0a9 9 0 0 0 9-9m-9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9h18" />
                </svg>
              </motion.a>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
} 