import { CardInterface, HandInterface, PlayerInterface } from '../interfaces';
import { getCardsScore, getPairsTripsQuads } from '../helpers';

export function checkPair(
  player: PlayerInterface,
  cards: CardInterface[],
): HandInterface | null {
  const found = getPairsTripsQuads(cards, 2);

  if (found == null) {
    return null;
  }

  return {
    name: found.name,
    handRanking: found.ranking,
    cardsRanking: getCardsScore(found.hand),
    cards: found.hand,
  };
}
