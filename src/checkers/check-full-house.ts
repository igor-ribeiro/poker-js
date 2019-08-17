import {
  CardInterface,
  CardValuesType,
  PlayerInterface,
  HandInterface,
} from '../interfaces';
import { HANDS_RANKING } from '../config';
import { getCardsScore } from '../helpers';

export function checkFullHouse(
  player: PlayerInterface,
  cards: CardInterface[],
): HandInterface | null {
  const fullHouseMap: Map<CardValuesType, number> = new Map();

  cards.forEach(card => {
    let trips = fullHouseMap.get(card.value) || 0;

    fullHouseMap.set(card.value, trips + 1);
  });

  const trips: CardInterface[] = [];
  const pairs: CardInterface[] = [];
  const rest: CardInterface[] = [];

  cards.forEach(card => {
    if (fullHouseMap.get(card.value) === 3) {
      trips.push(card);
    } else if (fullHouseMap.get(card.value) === 2) {
      pairs.push(card);
    } else {
      rest.push(card);
    }
  });

  if (trips.length === 0 || pairs.length === 0) {
    return null;
  }

  const finalHand = trips.concat(pairs);

  return {
    name: HANDS_RANKING.FULL_HOUSE.name,
    handRanking: HANDS_RANKING.FULL_HOUSE.ranking,
    cardsRanking: getCardsScore(finalHand),
    cards: finalHand,
  };
}
