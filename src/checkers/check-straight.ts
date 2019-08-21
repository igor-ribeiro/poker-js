import { CardInterface, HandInterface, PlayerInterface } from '../interfaces';
import { MAX_HAND_CARDS, HANDS_RANKING } from '../config';
import { getCardsSwappingAce, getCardsScore } from '../helpers';

export function checkStraight(
  player: PlayerInterface,
  cards: CardInterface[],
): HandInterface | null {
  const allCards = getCardsSwappingAce(cards);

  let finalHand: CardInterface[] = [];

  for (let cards of allCards) {
    const straight: Set<CardInterface> = new Set();

    for (let index = 0; index < cards.length; index++) {
      const card = cards[index];
      const nextCard = index < cards.length ? cards[index + 1] : null;

      if (straight.size === 0) {
        if (nextCard != null && card.score - nextCard.score !== 1) {
          continue;
        }

        straight.add(card);
        straight.add(nextCard!);

        continue;
      }

      const lastCards = Array.from(straight);
      const lastCard = lastCards[lastCards.length - 1];

      const distance = lastCard.score - card.score;

      if (distance > 1) {
        if (straight.size < MAX_HAND_CARDS) {
          straight.clear();
          straight.add(card);
        }

        continue;
      }

      if (distance === 0) {
        continue;
      }

      straight.add(card);
    }

    if (straight.size < MAX_HAND_CARDS) {
      continue;
    }

    finalHand = Array.from(straight.values()).splice(0, MAX_HAND_CARDS);
  }

  if (finalHand.length < MAX_HAND_CARDS) {
    return null;
  }

  return {
    name: HANDS_RANKING.STRAIGHT.name,
    handRanking: HANDS_RANKING.STRAIGHT.ranking,
    cardsRanking: getCardsScore(finalHand),
    cards: finalHand,
  };
}
