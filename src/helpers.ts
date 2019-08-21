import {
  CardInterface,
  CardValuesType,
  CardSuitsType,
  DeckInterface,
  FinalHandInterface,
  GetHandsOptionsInterface,
  TableCurrencyTypes,
  TablePositionTypes,
} from './interfaces';
import { VALUES_RANKING, MAX_HAND_CARDS, HANDS_RANKING } from './config';

export function sortByCardValue(cards: CardInterface[]): CardInterface[] {
  return [...cards].sort((a, b) => {
    if (a.score > b.score) return -1;
    if (a.score < b.score) return 1;
    return 0;
  });
}

export function randomIndex(item: any[]): number {
  return Math.round(Math.random() * (item.length - 1));
}

export function getCardsScore(
  cards: CardInterface[],
  extra: number = 0,
): number {
  return cards.reduce((score, card) => score + card.score, extra);
}

export function getPairsTripsQuads(
  cards: CardInterface[],
  totalRepetitions: number,
): {
  name: string;
  ranking: number;
  hand: CardInterface[];
} | null {
  const counter: Map<CardValuesType, number> = new Map();

  for (let card of cards) {
    let count = counter.get(card.value) || 0;

    counter.set(card.value, count + 1);
  }

  const hand: CardInterface[] = [];
  const kickers: CardInterface[] = [];

  let maxRepetitions = 0;

  for (let value of counter.keys()) {
    const count = counter.get(value) || 0;

    if (count < totalRepetitions) {
      continue;
    }

    if (count > maxRepetitions) {
      maxRepetitions = count;
    }

    const totalHandCount = hand.length + count;

    // Here we prevent a hand with 3 pairs.
    if (totalHandCount > MAX_HAND_CARDS) {
      continue;
    }

    const cardsToAdd = cards.filter(card => card.value === value);

    hand.push(...cardsToAdd);
  }

  for (let card of cards) {
    const count = counter.get(card.value) || 0;

    if (hand.includes(card)) {
      continue;
    }

    kickers.push(card);
  }

  // There is no pairs, trips or quads.
  if (hand.length === 0) {
    return null;
  }

  const kickersCount = MAX_HAND_CARDS - hand.length;

  const finalHand = hand.concat(kickers.slice(0, kickersCount));

  let handType: 'PAIR' | 'TWO_PAIR' | 'TRIPS' | 'QUADS' | null = null;

  if (
    maxRepetitions === 2 &&
    totalRepetitions === maxRepetitions &&
    hand.length === 2
  ) {
    handType = 'PAIR';
  }

  if (
    maxRepetitions === 2 &&
    totalRepetitions === maxRepetitions &&
    hand.length === 4
  ) {
    handType = 'TWO_PAIR';
  }

  if (
    maxRepetitions === 3 &&
    totalRepetitions === maxRepetitions &&
    hand.length === 3
  ) {
    handType = 'TRIPS';
  }

  if (
    maxRepetitions === 4 &&
    totalRepetitions === maxRepetitions &&
    hand.length === 4
  ) {
    handType = 'QUADS';
  }

  if (handType == null) {
    return null;
  }

  return {
    ...HANDS_RANKING[handType],
    hand: finalHand,
  };
}

export function getCardsSwappingAce(
  cards: CardInterface[],
): (CardInterface[])[] {
  const aceLowCards: CardInterface[] = [];

  const highCard = { ...cards[0] };
  const lowCard = cards[cards.length - 1];

  if (highCard.value === 'A' && lowCard.value === '2') {
    highCard.score = 1;
    const [_, ...low]: CardInterface[] = cards;
    aceLowCards.push(...low, highCard);
  }

  return [cards, aceLowCards];
}

export function getCardFromDeck(deck: DeckInterface): CardInterface {
  const card = deck.cards.splice(0, 1)[0];
  deck.deadCards.push(card);
  return card;
}

export function getCard(display: string): CardInterface {
  let [suit, ...rest] = display.split('').reverse() as (
    | CardSuitsType
    | CardValuesType)[];

  const value = rest.reverse().join('') as CardValuesType;

  return {
    display,
    value,
    suit: suit as CardSuitsType,
    score: VALUES_RANKING[value],
  };
}

export function getFinalHand(
  options: GetHandsOptionsInterface,
): FinalHandInterface {
  const { player, boardCards, checker } = options;

  const cards = player.cards.concat(boardCards);

  const ranking = checker(player, cards);
  const score = ranking.handRanking * ranking.cardsRanking;

  return {
    player,
    hand: ranking,
    score,
  };
}

export function getWinners(hands: FinalHandInterface[]): FinalHandInterface[] {
  let biggestScore = 0;
  let biggestHandRanking = 0;

  for (let hand of hands) {
    if (hand.score > biggestScore) {
      biggestScore = hand.score;
    }
  }

  return hands.filter(hand => hand.score === biggestScore);
}

export function getValueDisplay(
  amount: number,
  currency: TableCurrencyTypes,
): string {
  const rawAmount = Math.abs(amount);
  const isNegative = amount < 0;

  return `${isNegative ? '-' : ''}${currency}${rawAmount}`;
}

export function clearLine(stream: NodeJS.WritableStream): void {
  if (process.stdout.isTTY) {
    // stream.write('\x1b[999D\x1b[K');
    stream.write('\x1Bc');
  }
}

export function getPositionDisplay(position: TablePositionTypes) {
  if (position === 'BIG_BLIND') {
    return 'BB';
  }

  if (position === 'SMALL_BLIND') {
    return 'SB';
  }

  if (position === 'BUTTON') {
    return 'BU';
  }

  return '  ';
}
