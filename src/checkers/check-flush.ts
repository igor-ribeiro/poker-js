import {
  CardInterface,
  CardSuitsType,
  HandInterface,
  PlayerInterface,
} from '../interfaces';
import { HANDS_RANKING, MAX_HAND_CARDS } from '../config';
import { getCardsScore } from '../helpers';

export function checkFlush(
  player: PlayerInterface,
  cards: CardInterface[],
): HandInterface | null {
  const countBySuits: Record<string, number> = {};

  cards.forEach((card, index) => {
    if (card.suit in countBySuits === false) {
      countBySuits[card.suit] = 0;
    }

    countBySuits[card.suit]++;
  });

  const suit = Object.keys(countBySuits).find(
    suit => countBySuits[suit] >= MAX_HAND_CARDS,
  ) as CardSuitsType;

  if (suit == null) {
    return null;
  }

  const finalHand = cards
    .filter(card => card.suit === suit)
    .splice(0, MAX_HAND_CARDS);

  return {
    name: HANDS_RANKING.FLUSH.name,
    handRanking: HANDS_RANKING.FLUSH.ranking,
    cardsRanking: getCardsScore(finalHand),
    cards: finalHand,
  };
}
