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

  const tieBraker = getCardsScore(found.hand.slice(0, 2));

  return {
    name: found.name,
    handRanking: found.ranking + tieBraker,
    cardsRanking: getCardsScore(found.hand),
    cards: found.hand,
  };
}
