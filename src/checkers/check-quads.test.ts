import { HANDS_RANKING } from '../config';
import { PlayerInterface } from '../interfaces';
import { checkHoldem } from './check-holdem';
import { getCard, getWinners, getFinalHand } from '../helpers';

test('Quads vs Quads (TTTT vs 5555)', () => {
  const players: PlayerInterface[] = [
    {
      name: 'Player 1',
      chips: 100,
      cards: ['10♣', '10♦'].map(getCard),
      initialChips: 100,
      position: 'SMALL_BLIND',
      getDisplay: () => '',
    betsByRound: []
    },
    {
      name: 'Player 2',
      chips: 100,
      cards: ['5♣', '5♦'].map(getCard),
      initialChips: 100,
      position: 'BIG_BLIND',
      getDisplay: () => '',
      betsByRound: []
    },
  ];

  const boardCards = ['10♠', '10♥', '5♠', '5♥', '4♣'].map(getCard);

  const hands = players.map(player =>
    getFinalHand({
      player,
      boardCards,
      checker: checkHoldem,
    }),
  );

  const winners = getWinners(hands);

  expect(hands[0].player.name).toBe('Player 1');
  expect(hands[0].hand.name).toBe(HANDS_RANKING.QUADS.name);
  expect(hands[0].hand.cards).toEqual(
    ['10♣', '10♦', '10♠', '10♥', '5♠'].map(getCard),
  );

  expect(hands[1].player.name).toBe('Player 2');
  expect(hands[1].hand.name).toBe(HANDS_RANKING.QUADS.name);
  expect(hands[1].hand.cards).toEqual(
    ['5♣', '5♦', '5♠', '5♥', '10♠'].map(getCard),
  );

  expect(winners.length).toBe(1);
  expect(hands[0].player.name).toBe('Player 1');
});
