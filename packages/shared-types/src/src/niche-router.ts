export type NicheTag =
  | 'DONA_DE_CASA'
  | 'AUTOMOTIVO'
  | 'ELETRONICOS'
  | 'MODA'
  | 'BELEZA'
  | 'ESPORTES'
  | 'INFANTIL'
  | 'PETS'
  | 'GERAL';

export interface NicheRule {
  tag: NicheTag;
  keywords: string[];
}

export const NICHE_RULES: NicheRule[] = [
  {
    tag: 'DONA_DE_CASA',
    keywords: [
      'panela', 'panelas', 'cozinha', 'utensilio', 'utensílio', 'liquidificador',
      'air fryer', 'fritadeira', 'tramontina', 'brinox', 'faqueiro', 'talheres',
      'toalha', 'jogo de cama', 'edredom', 'travesseiro', 'cortina', 'vassoura',
      'pano de prato', 'geladeira', 'microondas', 'micro-ondas', 'fogao', 'fogão',
    ],
  },
  {
    tag: 'AUTOMOTIVO',
    keywords: [
      'pneu', 'pneus', 'bateria', 'oleo', 'óleo', 'limpador', 'palheta',
      'pastilha de freio', 'amortecedor', 'volante', 'farol', 'lanterna',
      'motor', 'cabo', 'carregador veicular', 'suporte celular carro',
      'adesivo', 'retrovisor', 'macaco hidraulico', 'macaco hidráulico',
    ],
  },
  {
    tag: 'ELETRONICOS',
    keywords: [
      'smartphone', 'celular', 'fone', 'headset', 'notebook', 'tv', 'monitor',
      'teclado', 'mouse', 'camera', 'câmera', 'smartwatch', 'relogio', 'relógio',
      'caixa de som', 'soundbar', 'robo aspirador', 'robô aspirador', 'tablet',
      'gpu', 'placa de video', 'placa de vídeo', 'ssd', 'memoria ram', 'memória ram',
    ],
  },
  {
    tag: 'MODA',
    keywords: [
      'camiseta', 'vestido', 'calca', 'calça', 'bermuda', 'jaqueta', 'blusa',
      'tenis', 'tênis', 'chuteira', 'sandalia', 'sandália', 'bolsa', 'mochila',
      'chinelo', 'roupa', 'fitness', 'leg', 'shorts', 'polo', 'social',
    ],
  },
  {
    tag: 'BELEZA',
    keywords: [
      'shampoo', 'condicionador', 'perfume', 'batom', 'base', 'corretivo',
      'skin care', 'serum', 'sérum', 'protetor solar', 'hidratante', 'creme',
      'maquiagem', 'paleta', 'escova', 'secador', 'prancha', 'alisador',
    ],
  },
  {
    tag: 'ESPORTES',
    keywords: [
      'bicicleta', 'bike', 'esteira', 'halter', 'peso', 'corda', 'yoga',
      'colchonete', 'bola', 'bola de futebol', 'bola de basquete', 'raquete',
      'skate', 'patins', 'jump', 'barra', 'anilha', 'equipamento',
    ],
  },
  {
    tag: 'INFANTIL',
    keywords: [
      'brinquedo', 'boneca', 'carrinho', 'lego', 'bloco', 'fralda', 'mamadeira',
      'chuveirinho', 'berco', 'berço', 'carrinho de bebe', 'carrinho de bebê',
      'cadeira de bebe', 'cadeira de bebê', 'pelucia', 'pelúcia', 'kit bebe', 'kit bebê',
    ],
  },
  {
    tag: 'PETS',
    keywords: [
      'racao', 'ração', 'petisco', 'brinquedo para cachorro', 'brinquedo para gato',
      'coleira', 'guia', 'cama pet', 'arranhador', 'caixa de areia', 'comedouro',
      'bebedouro', 'antipulgas', 'casinha', 'pet gate',
    ],
  },
];

export class NicheRouter {
  static classify(title: string): NicheTag {
    const normalized = title
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    for (const rule of NICHE_RULES) {
      const hasMatch = rule.keywords.some((keyword) =>
        normalized.includes(
          keyword
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase(),
        ),
      );
      if (hasMatch) {
        return rule.tag;
      }
    }
    return 'GERAL';
  }
}
