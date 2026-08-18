import type { NicheTag } from './index';

const NICHE_KEYWORDS: Record<NicheTag, string[]> = {
  DONA_DE_CASA: ['casa', 'cozinha', 'limpeza', 'organização', 'lar', 'família', 'panela', 'liquidificador', 'aspirador'],
  AUTOMOTIVO: ['carro', 'veículo', 'motor', 'pneu', 'óleo', 'freio', 'automotivo', 'veicular', 'lavadora'],
  ELETRONICOS: ['celular', 'notebook', 'computador', 'tv', 'fone', 'mouse', 'teclado', 'monitor', 'tablet', 'eletrônico'],
  MODA: ['roupa', 'vestido', 'calça', 'camisa', 'sapato', 'bolsa', 'moda', 'fashion', 'tênis', 'jaqueta'],
  BELEZA: ['make', 'maquiagem', 'cabelo', 'pele', 'creme', 'perfume', 'beleza', 'cosmético', 'skincare'],
  ESPORTES: ['esporte', 'academia', 'musculação', 'corrida', 'bike', 'bicicleta', 'futebol', 'fitness', 'exercício'],
  INFANTIL: ['bebê', 'criança', 'infantil', 'brinquedo', 'fralda', 'berço', 'juguete', 'kids'],
  PETS: ['pet', 'cachorro', 'gato', 'ração', 'petshop', 'animal', 'antipulga', 'vacina'],
  GERAL: [],
};

export class NicheRouter {
  static classify(title: string): NicheTag {
    const lower = title.toLowerCase();

    let bestMatch: NicheTag = 'GERAL';
    let bestScore = 0;

    for (const [niche, keywords] of Object.entries(NICHE_KEYWORDS) as [NicheTag, string[]][]) {
      let score = 0;
      for (const kw of keywords) {
        if (lower.includes(kw)) {
          score++;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = niche;
      }
    }

    return bestMatch;
  }
}
