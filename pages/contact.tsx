import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay },
});

const links = [
  {
    label: 'LinkedIn',
    description: 'zawodowo',
    href: 'https://www.linkedin.com/in/krzysztofprzekwas/',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: 'kristof.pro',
    description: 'inne projekty',
    href: 'https://kristof.pro',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0 0a9 9 0 0 0 9-9m-9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9h18" />
      </svg>
    ),
  },
  {
    label: 'Substack',
    description: 'newsletter',
    href: 'https://substack.com/@kristofpro',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
      </svg>
    ),
  },
];

export default function Contact() {
  return (
    <main className="flex flex-1 flex-col bg-secondary overflow-y-auto">
      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-2xl">

        <motion.h1 {...fadeUp(0)} className="text-4xl font-bold text-primary mb-10">
          Kontakt
        </motion.h1>

        {/* Intro */}
        <motion.div {...fadeUp(0.1)} className="mb-10">
          <p className="text-gray-700 leading-relaxed mb-3">
            Znalazłeś błąd na mapie? Brakuje jakiegoś miejsca, które Robert odwiedził? A może masz pomysł na nową funkcję albo po prostu chcesz napisać — śmiało, chętnie przeczytam.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Staram się odpisywać na każdą wiadomość. Projekt rozwijam hobbistycznie, więc czasem zajmuje mi to kilka dni — ale odpiszę.
          </p>
        </motion.div>

        {/* Email */}
        <motion.div {...fadeUp(0.2)} className="mb-10">
          <p className="text-sm font-medium text-gray-500 mb-3">Napisz do mnie</p>
          <a
            href="mailto:przekwaskrzysiek@gmail.com"
            className="inline-flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white border border-secondary-border hover:border-primary/30 hover:shadow-sm transition-all font-medium text-primary"
          >
            <Mail className="w-5 h-5 flex-shrink-0" />
            przekwaskrzysiek@gmail.com
          </a>
        </motion.div>

        {/* Social links */}
        <motion.div {...fadeUp(0.25)}>
          <p className="text-sm font-medium text-gray-500 mb-3">Znajdziesz mnie też tutaj</p>
          <div className="flex flex-col sm:flex-row gap-3">
            {links.map(({ label, description, href, icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-white border border-secondary-border hover:border-primary/30 hover:shadow-sm transition-all text-primary text-sm"
              >
                {icon}
                <span>
                  <span className="font-medium">{label}</span>
                  <span className="text-gray-400 ml-1.5">{description}</span>
                </span>
              </a>
            ))}
          </div>
        </motion.div>

      </div>
    </main>
  );
}
