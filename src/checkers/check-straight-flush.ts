import {
  CardInterface,
  CardSuitsType,
  HandInterface,
  PlayerInterface,
} from '../interfaces';
import { HANDS_RANKING, MAX_HAND_CARDS } from '../config';
import { getCardsScore, getCardsSwappingAce } from '../helpers';

export function checkStraightFlush(
  player: PlayerInterface,
  cards: CardInterface[],
): HandInterface | null {
  const countBySuits: Record<string, number> = {};

  for (let card of cards) {
    if (card.suit in countBySuits === false) {
      countBySuits[card.suit] = 0;
    }

    countBySuits[card.suit]++;
  }

  const suit = Object.keys(countBySuits).find(
    suit => countBySuits[suit] >= MAX_HAND_CARDS,
  );

  if (suit == null) {
    return null;
  }

  const sameSuitCards = cards.filter(card => card.suit === suit);

  const allCards = getCardsSwappingAce(sameSuitCards);

  let finalHand: CardInterface[] = [];

  for (let cards of allCards) {
    const straightFlush: Set<CardInterface> = new Set();

    for (let index = 0; index < cards.length; index++) {
      const card = cards[index];

      const nextCard = index < cards.length ? cards[index + 1] : null;

      if (straightFlush.size === 0) {
        if (nextCard != null && card.score - nextCard.score !== 1) {
          continue;
        }

        straightFlush.add(card);
        straightFlush.add(nextCard!);

        continue;
      }

      const lastCards = Array.from(straightFlush.values());
      const lastCard = lastCards[lastCards.length - 1];

      if (lastCard.score - card.score !== 1) {
        continue;
      }

      straightFlush.add(card);
    }

    if (straightFlush.size < MAX_HAND_CARDS) {
      continue;
    }

    finalHand = Array.from(straightFlush.values()).splice(0, MAX_HAND_CARDS);
  }

  if (finalHand.length < MAX_HAND_CARDS) {
    return null;
  }

  const isRoyal =
    finalHand[0].value === 'A' &&
    finalHand[finalHand.length - 1].value === '10';

  const winningHand = isRoyal
    ? HANDS_RANKING.ROYAL_STRAIGHT_FLUSH
    : HANDS_RANKING.STRAIGHT_FLUSH;

  return {
    name: winningHand.name,
    handRanking: winningHand.ranking,
    cardsRanking: getCardsScore(finalHand),
    cards: finalHand,
  };
}
