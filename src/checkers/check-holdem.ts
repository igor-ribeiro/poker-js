import { CardInterface, HandInterface, PlayerInterface } from '../interfaces';
import { checkFlush } from './check-flush';
import { checkFullHouse } from './check-full-house';
import { checkHighCard } from './check-high-card';
import { checkPair } from './check-pair';
import { checkQuads } from './check-quads';
import { checkStraight } from './check-straight';
import { checkStraightFlush } from './check-straight-flush';
import { checkTrips } from './check-trips';
import { sortCardsByValue } from '../helpers';

export function checkHoldem(
  player: PlayerInterface,
  cards: CardInterface[],
): HandInterface | null {
  const sorted = sortCardsByValue(cards);

  const checkers = [
    checkStraightFlush,
    checkQuads,
    checkFullHouse,
    checkFlush,
    checkStraight,
    checkTrips,
    checkPair,
    checkHighCard,
  ];

  let hand: HandInterface | null = null;

  for (let checkFunc of checkers) {
    const score = checkFunc(player, sorted);

    if (score != null) {
      hand = score;
      break;
    }
  }

  return hand;
}
