import { CardInterface, PlayerInterface, HandInterface } from '../interfaces';
import { HANDS_RANKING, MAX_HAND_CARDS } from '../config';
import { getCardsScore } from '../helpers';

export function checkHighCard(
  player: PlayerInterface,
  cards: CardInterface[],
): HandInterface {
  const bestCards: CardInterface[] = [];

  for (let i = 0; i < MAX_HAND_CARDS; i++) {
    bestCards.push(cards[i]);
  }

  return {
    name: HANDS_RANKING.HIGH_CARD.name,
    cardsRanking: getCardsScore(bestCards),
    handRanking: HANDS_RANKING.HIGH_CARD.ranking,
    cards: bestCards,
  };
}
