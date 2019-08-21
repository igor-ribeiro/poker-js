import { CardInterface, HandInterface, PlayerInterface } from '../interfaces';
import { getCardsScore, getPairsTripsQuads } from '../helpers';

export function checkQuads(
  player: PlayerInterface,
  cards: CardInterface[],
): HandInterface | null {
  const found = getPairsTripsQuads(cards, 4);

  if (found == null) {
    return null;
  }

  const extraScore = getCardsScore(found.hand.slice(0, 2));

  return {
    name: found.name,
    handRanking: found.ranking,
    cardsRanking: getCardsScore(found.hand, extraScore),
    cards: found.hand,
  };
}
