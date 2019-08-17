import {
  BoardStructureInterace,
  CardSuitsType,
  CardValuesType,
  GameTypes,
  HandTypes,
  TableActionTypes,
  TablePositionTypes,
} from './interfaces';

export const SUITS: CardSuitsType[] = ['♠', '♥', '♣', '♦'];

export const MAX_HAND_CARDS = 5;

export const VALUES_RANKING: Record<CardValuesType, number> = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};

export const HANDS_RANKING: Record<
  HandTypes,
  {
    name: string;
    ranking: number;
  }
> = {
  HIGH_CARD: {
    name: 'High card',
    ranking: 1,
  },
  PAIR: {
    name: 'Pair',
    ranking: 10,
  },
  TWO_PAIR: {
    name: 'Two pair',
    ranking: 10e2,
  },
  TRIPS: {
    name: 'Trips',
    ranking: 10e3,
  },
  STRAIGHT: {
    name: 'Straight',
    ranking: 10e4,
  },
  FLUSH: {
    name: 'Flush',
    ranking: 10e5,
  },
  FULL_HOUSE: {
    name: 'Full house',
    ranking: 10e6,
  },
  QUADS: {
    name: 'Quads',
    ranking: 10e7,
  },
  STRAIGHT_FLUSH: {
    name: 'Straight flush',
    ranking: 10e8,
  },
  ROYAL_STRAIGHT_FLUSH: {
    name: 'Royal Straight flush',
    ranking: 10e9,
  },
};

export const TOTAL_CARDS = 52;

export const CARDS_PER_PLAYER: Record<GameTypes, number> = {
  holdem: 2,
};

export const BOARD_STRUCTURE: Record<GameTypes, BoardStructureInterace[]> = {
  holdem: [
    { discard: 1, deal: 3, name: 'flop' },
    { discard: 1, deal: 1, name: 'turn' },
    { discard: 1, deal: 1, name: 'river' },
  ],
};

export const TABLE_ACTIONS: Record<GameTypes, TableActionTypes[]> = {
  holdem: [
    'SEATS',
    'BLINDS',
    'DEAL',
    'BET',
    'BOARD',
    'BET',
    'BOARD',
    'BET',
    'BOARD',
    'BET',
    'SHOWDOW',
  ],
};

export const TABLE_POSITIONS: Record<GameTypes, TablePositionTypes[]> = {
  holdem: ['BUTTON', 'SMALL_BLIND', 'BIG_BLIND'],
};

export const BETTING_ROUNDS: Record<GameTypes, number> = {
  holdem: 4,
};

export const TABLE_POSITIONS_DISPLAY: Record<TablePositionTypes, string> = {
  BUTTON: 'BU',
  BIG_BLIND: 'BB',
  OTHER: '  ',
  SMALL_BLIND: 'SB',
  UNSEATED: '__',
};
