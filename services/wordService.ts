import { Word, Category } from '../types';
import { CATEGORIES } from '../constants';

const wordsData: Record<Category, string[]> = {
  Politics: [
    'Democracy', 'Republic', 'Election', 'Legislation', 'Constitution',
    'Diplomacy', 'Sovereignty', 'Federalism', 'Bureaucracy', 'Ideology',
    'Parliament', 'Congress', 'Judiciary', 'Executive', 'Lobbying',
    'Gerrymandering', 'Suffrage', 'Bipartisan', 'Coalition', 'Referendum',
    'Veto', 'Impeachment', 'Embargo', 'Sanction', 'Treaty'
  ],
  Music: [
    'Melody', 'Harmony', 'Rhythm', 'Tempo', 'Orchestra',
    'Symphony', 'Sonata', 'Concerto', 'Opera', 'Aria',
    'Chorus', 'Cadence', 'Crescendo', 'Adagio', 'Allegro',
    'Pitch', 'Timbre', 'Acoustic', 'Synthesizer', 'Improvisation',
    'Fusion', 'Reggae', 'Blues', 'Ballad', 'Genre'
  ],
  Science: [
    'Hypothesis', 'Experiment', 'Theory', 'Quantum', 'Gravity',
    'Photosynthesis', 'Evolution', 'Genetics', 'Molecule', 'Atom',
    'Neutron', 'Proton', 'Electron', 'Galaxy', 'Nebula',
    'Black Hole', 'Supernova', 'Fossil', 'Ecosystem', 'Biodiversity',
    'Catalyst', 'Enzyme', 'Vaccine', 'Antibody', 'Virus'
  ],
  Philosophy: [
    'Epistemology', 'Metaphysics', 'Ethics', 'Aesthetics', 'Logic',
    'Socrates', 'Plato', 'Aristotle', 'Existentialism', 'Nihilism',
    'Utilitarianism', 'Deontology', 'Virtue', 'Dualism', 'Materialism',
    'Idealism', 'Empiricism', 'Rationalism', 'Phenomenology', 'Stoicism',
    'Hedonism', 'Absurdism', 'Ontology', 'Solipsism', 'Determinism'
  ]
};

export const generateInitialWords = (): Word[] => {
  let idCounter = 1;
  const words: Word[] = [];
  CATEGORIES.forEach(category => {
    wordsData[category].forEach(wordText => {
      words.push({
        id: idCounter++,
        text: wordText,
        category: category,
      });
    });
  });
  return words;
};
