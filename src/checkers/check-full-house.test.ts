import {
  InitialPlayerInterface,
  PlayerInterface,
  CardInterface,
} from '../interfaces';
import { Table } from '../Table';
import { getCard, sortByCardValue, getWinners, getFinalHand } from '../helpers';
import { checkPair } from './check-pair';
import { checkFlush } from './check-flush';
import { checkHoldem } from './check-holdem';
import { HANDS_RANKING } from '../config';

test('Full House', () => {
  const player: PlayerInterface = {
    name: 'Player 1',
    chips: 100,
    cards: ['10♣', '10♦'].map(getCard),
    initialChips: 100,
    position: 'SMALL_BLIND',
    getDisplay: () => '',
    betsByRound: [],
  };

  const boardCards = ['10♠', '9♠', '9♣', '5♥', '4♣'].map(getCard);

  const hand = getFinalHand({
    player,
    boardCards,
    checker: checkHoldem,
  });

  expect(hand.player.name).toBe('Player 1');
  expect(hand.hand.name).toBe(HANDS_RANKING.FULL_HOUSE.name);
  expect(hand.hand.cards).toEqual(
    ['10♣', '10♦', '10♠', '9♠', '9♣'].map(getCard),
  );
});

test('Full House (TTT 99 vs TTT 88) [kicker]', () => {
  const players: PlayerInterface[] = [
    {
      name: 'Player 1',
      chips: 100,
      cards: ['10♣', '9♣'].map(getCard),
      initialChips: 100,
      position: 'SMALL_BLIND',
      getDisplay: () => '',
      betsByRound: [],
    },
    {
      name: 'Player 2',
      chips: 100,
      cards: ['10♦', '8♦'].map(getCard),
      initialChips: 100,
      position: 'BIG_BLIND',
      getDisplay: () => '',
      betsByRound: [],
    },
  ];

  const boardCards = ['10♠', '9♠', '8♣', '10♥', '4♣'].map(getCard);

  const hands = players.map(player =>
    getFinalHand({
      player,
      boardCards,
      checker: checkHoldem,
    }),
  );

  const winners = getWinners(hands);

  expect(hands[0].player.name).toBe('Player 1');
  expect(hands[0].hand.name).toBe(HANDS_RANKING.FULL_HOUSE.name);
  expect(hands[0].hand.cards).toEqual(
    ['10♣', '10♠', '10♥', '9♣', '9♠'].map(getCard),
  );

  expect(hands[1].player.name).toBe('Player 2');
  expect(hands[1].hand.name).toBe(HANDS_RANKING.FULL_HOUSE.name);
  expect(hands[1].hand.cards).toEqual(
    ['10♦', '10♠', '10♥', '8♦', '8♣'].map(getCard),
  );

  expect(winners.length).toBe(1);
  expect(hands[0].player.name).toBe('Player 1');
});
