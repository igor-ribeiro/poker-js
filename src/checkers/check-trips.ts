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

  const tieBraker = getCardsScore(found.hand.slice(0, 3));

  return {
    name: found.name,
    handRanking: found.ranking + tieBraker,
    cardsRanking: getCardsScore(found.hand),
    cards: found.hand,
  };
}
