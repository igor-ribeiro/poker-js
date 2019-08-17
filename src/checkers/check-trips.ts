import { CardInterface, HandInterface, PlayerInterface } from '../interfaces';
import { getPairsTripsQuads, getCardsScore } from '../helpers';

export function checkTrips(
  player: PlayerInterface,
  cards: CardInterface[],
): HandInterface | null {
  const found = getPairsTripsQuads(cards, 3);

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
