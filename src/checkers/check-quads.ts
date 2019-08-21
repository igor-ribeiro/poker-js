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

  const tieBraker = getCardsScore(found.hand.slice(0, 4));

  return {
    name: found.name,
    handRanking: found.ranking + tieBraker,
    cardsRanking: getCardsScore(found.hand),
    cards: found.hand,
  };
}
