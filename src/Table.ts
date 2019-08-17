// @todo All in
// @todo Side pots
// @todo Players choices
// @todo Rebuy
// @todo Sitting out
// @todo Multiplayer
// @todo Add 'shuffle' method to deck so it can be reused during hands

import { cloneDeep } from 'lodash';

import {
  BOARD_STRUCTURE,
  CARDS_PER_PLAYER,
  SUITS,
  TABLE_ACTIONS,
  TOTAL_CARDS,
  VALUES_RANKING,
  TABLE_POSITIONS,
  TABLE_POSITIONS_DISPLAY,
  BETTING_ROUNDS,
} from './config';
import {
  BoardInterace,
  CardInterface,
  CardSuitsType,
  CardValuesType,
  DeckInterface,
  GameLimits,
  GameOptions,
  GameTypes,
  PlayerInterface,
  TableActionTypes,
  WinnerInterface,
  PotInterface,
  TablePositionTypes,
  TablePositionInterface,
  InitialPlayerInterface,
  TableCurrencyTypes,
  PotActionOptionsType,
  PotActionsType,
  PotActionType,
  PlayerInfoInterface,
  PotActionWinInterface,
} from './interfaces';
import { checkHoldem } from './checkers/check-holdem';
import { randomIndex, getCard, getCardFromDeck } from './helpers';

const LOG = true;

export class Table {
  protected options: GameOptions;
  protected checkers: Record<GameTypes, Function>;

  protected gameType: GameTypes;
  protected gameLimit: GameLimits;
  protected playersCount: number;
  protected players: PlayerInterface[];
  protected board: BoardInterace[];
  protected deck: DeckInterface;
  protected winners: WinnerInterface[];
  protected tableActionIndex: number;
  protected tableActions: TableActionTypes[];
  protected pots: PotInterface[];
  protected history: any[];
  protected stakes: number[];
  protected mainPositions: TablePositionTypes[];
  protected positions: TablePositionInterface[];
  protected buttonPlayerIndex: number;
  protected currency: TableCurrencyTypes;
  protected potsActions: PotActionType[][];
  protected bettingRoundsCount: number;
  protected bettingRounds: number[];
  protected betsByPlayerAndRound: Record<string, PotActionType[][]>;
  protected currentBettingRound: number;
  protected currentBettingPlayer: number;
  protected playersInfo: Record<string, PlayerInfoInterface>;
  protected handsCount: number;

  constructor(options: GameOptions) {
    this.options = options;

    this.gameType = options.gameType;
    this.gameLimit = options.gameLimit;
    this.handsCount = options.handsCount;

    this.bettingRoundsCount = BETTING_ROUNDS[this.gameType];

    this.stakes = options.stakes;
    this.currency = options.currency;

    this.checkers = {
      holdem: checkHoldem,
    };

    this.playersCount = options.players.length;
    this.players = this.updatePlayers(options.players);

    this.tableActions = TABLE_ACTIONS[this.gameType];

    this.mainPositions = TABLE_POSITIONS[this.gameType];

    this.history = [];
  }

  public start(): void {
    console.log('');
    console.log('--- STARTING GAME ---');
    console.log(
      this.gameLimit,
      this.gameType,
      this.stakes.map(stake => this.getValueDisplay(stake)).join('/'),
    );

    this.setup();
    this.update();
  }

  public update(): void {
    const nextState = this.tableActionIndex + 1;

    if (nextState > this.tableActions.length) {
      console.log('');
      console.log('--- HAND FINISHED --');

      this.history.push(`Hand #${this.history.length + 1}`);
      const handsLeft = this.handsCount - this.history.length;

      if (handsLeft > 0) {
        this.setup();
        this.update();
        return;
      } else {
        console.log();
        console.log('--- GAME FINISHED ---');

        this.printPlayersProfits();
        return;
      }
    }

    const state = this.tableActions[this.tableActionIndex];

    if (state === 'SEATS') {
      this.seatPlayers();
    } else if (state === 'BLINDS') {
      this.postBlinds();
    } else if (state === 'DEAL') {
      this.dealCards();
    } else if (state === 'BET') {
      console.log('');
      console.log('--- BETTING ---', this.currentBettingRound);
      this.betRound();
    } else if (state === 'BOARD') {
      this.dealBoard();
    } else if (state === 'SHOWDOW') {
      console.log('');
      console.log('--- SHOWDOW ---');
      this.checkWinners();
    }

    this.tableActionIndex = nextState;
    this.update();
  }

  public setup(): void {
    this.bettingRounds = [];
    this.currentBettingRound = 0;
    this.currentBettingPlayer = 0;
    this.betsByPlayerAndRound = {};

    for (let index = 0; index < this.bettingRoundsCount; index++) {
      this.bettingRounds[index] = 0;
    }

    this.playersInfo = {};

    this.board = [];
    this.deck = this.generateDeck(TOTAL_CARDS);

    this.winners = [];

    this.tableActionIndex = 0;

    this.positions = [];
    this.buttonPlayerIndex =
      (this.buttonPlayerIndex + 1 || 0) % this.playersCount;

    this.pots = [
      {
        type: 'MAIN',
        players: [],
        total: 0,
        currency: this.currency,
      },
    ];

    this.potsActions = [];

    for (let player of this.players) {
      player.cards = [];
    }
  }

  public seatPlayers(): void {
    const otherPlayers = [...this.players];
    const fromButtonPlayers = otherPlayers.splice(this.buttonPlayerIndex + 1);
    const sortedPlayers = fromButtonPlayers.concat(otherPlayers);

    const positionsWithoutButton = this.mainPositions.filter(
      pos => pos !== 'BUTTON',
    );

    for (
      let playerIndex = 0;
      playerIndex < sortedPlayers.length;
      playerIndex++
    ) {
      const player = sortedPlayers[playerIndex];

      const positionType: TablePositionTypes =
        playerIndex === sortedPlayers.length - 1
          ? 'BUTTON'
          : positionsWithoutButton[playerIndex] || 'OTHER';

      player.position = positionType;

      this.positions.push({
        player,
        type: positionType,
      });

      this.playersInfo[player.name] = {
        ...player,
        position: positionType,
        positionIndex: playerIndex,
      };

      this.betsByPlayerAndRound[player.name] = [];

      for (let round = 0; round < this.bettingRoundsCount; round++) {
        this.betsByPlayerAndRound[player.name].push([]);
      }
    }

    if (LOG) {
      this.printPositions();
    }
  }

  public postBlinds(): void {
    console.log('');
    console.log('--- BLINDS ---');

    for (let index = 0; index < this.stakes.length; index++) {
      const blindBet = this.stakes[index];
      const player = this.positions[index].player;

      this.potAction({
        action: 'BET',
        amount: blindBet,
        player,
      });

      console.log(player.getDisplay(), 'posts', this.getValueDisplay(blindBet));
    }

    if (LOG) {
      this.printPots();
    }
  }

  public potAction(options: PotActionOptionsType): void {
    switch (options.action) {
      case 'CHECK':
        break;

      case 'BET':
      case 'CALL':
        options.player.chips -= options.amount;

        for (let potIndex = 0; potIndex < this.pots.length; potIndex++) {
          const pot = this.pots[potIndex];

          if (pot.players.includes(options.player) === false) {
            pot.players.push(options.player);
          }

          pot.total += options.amount;

          const potAction: PotActionType = {
            action: options.action,
            player: options.player,
            amount: options.amount,
            pot,
          };

          this.updateRoundBiggestBet(options.amount);

          this.addPotAction({
            potAction,
            potIndex,
          });

          this.betsByPlayerAndRound[options.player.name][
            this.currentBettingRound
          ].push(potAction);

          this.currentBettingPlayer = this.playersInfo[
            options.player.name
          ].positionIndex;
        }

        break;

      case 'WIN':
        for (let potIndex = 0; potIndex < this.pots.length; potIndex++) {
          const pot = this.pots[potIndex];
          const potTotalPerPlayer = pot.total / options.winners.length;

          for (let winner of options.winners) {
            const { player, hand } = winner;

            if (pot.players.includes(player) === false) {
              console.log('Ignoring', player.name, ', not in pot');
              continue;
            }

            const potAction: PotActionType = {
              action: options.action,
              winners: options.winners,
              pot,
            };

            this.addPotAction({
              potAction,
              potIndex,
            });

            player.chips += potTotalPerPlayer;
          }

          pot.total = 0;
        }
        break;

      case 'FOLD':
        for (let potIndex = 0; potIndex < this.pots.length; potIndex++) {
          const pot = this.pots[potIndex];

          if (pot.players.includes(options.player) === false) {
            continue;
          }

          pot.players = pot.players.filter(player => player === options.player);

          const potAction: PotActionType = {
            action: options.action,
            player: options.player,
            pot,
          };

          this.addPotAction({
            potAction,
            potIndex,
          });
        }
        break;

      case 'RAISE':
        break;

      default:
        throw Error('Invalid pot action: ' + options);
        break;
    }
  }

  public updatePlayers(
    initialPlayers: InitialPlayerInterface[],
  ): PlayerInterface[] {
    const currency = this.currency;

    const players: PlayerInterface[] = [];

    for (let initialPlayer of initialPlayers) {
      const player: PlayerInterface = {
        ...initialPlayer,
        cards: [],
        position: 'UNSEATED',
        initialChips: cloneDeep(initialPlayer.chips),
        getDisplay: function() {
          const positionDisplay =
            this.position === 'UNSEATED'
              ? ''
              : TABLE_POSITIONS_DISPLAY[this.position] + ' | ';

          return `${positionDisplay}${this.name} (${currency}${this.chips})`;
        },
      };

      players.push(player);

      console.log(
        player.getDisplay(),
        'joined table',
        // this.getValueDisplay(player.chips),
      );
    }

    return players;
  }

  public generateDeck(
    totalCardsToShuffle: number,
    cardsToIgnore: string[] = [],
  ): DeckInterface {
    const deck: Map<string, CardInterface> = new Map();

    const values = Object.keys(VALUES_RANKING) as CardValuesType[];

    for (let i = 0; i < totalCardsToShuffle; i++) {
      const suitIndex = randomIndex(SUITS);
      const valueIndex = randomIndex(values);

      const suit: CardSuitsType = SUITS[suitIndex];
      const value: CardValuesType = values[valueIndex];

      const display = value + suit;

      if (deck.has(display)) {
        totalCardsToShuffle++;
        continue;
      }

      const card = getCard(display);

      deck.set(display, card);
    }

    for (let card of cardsToIgnore) {
      deck.delete(card);
    }

    const cards = Array.from(deck.values());

    return {
      deadCards: [],
      cards,
    };
  }

  public dealCards(
    options: {
      ignorePlayers: string[];
    } = { ignorePlayers: [] },
  ): void {
    console.log('');
    console.log('--- DEAL CARDS ---');

    const cardsToDeal =
      (this.playersCount - options.ignorePlayers.length) *
      CARDS_PER_PLAYER[this.gameType];

    for (let cardIndex = 0; cardIndex < cardsToDeal; cardIndex++) {
      for (
        let playerIndex = 0;
        playerIndex < this.playersCount;
        playerIndex++
      ) {
        const player = this.positions[playerIndex].player;

        if (options.ignorePlayers.includes(player.name)) {
          continue;
        }

        if (player.cards.length === CARDS_PER_PLAYER[this.gameType]) {
          continue;
        }

        const card = getCardFromDeck(this.deck);

        console.log('Dealing card to', player.name);

        player.cards.push(card);
      }
    }

    LOG && this.printHoldings();
  }

  public betRound(): void {
    const nextBettingPlayerIndex = this.currentBettingPlayer + 1;

    let positions = this.positions
      .slice(nextBettingPlayerIndex)
      .concat(this.positions.slice(0, nextBettingPlayerIndex));

    for (let playerIndex = 0; playerIndex < positions.length; playerIndex++) {
      const position = positions[playerIndex];
      const player = position.player;

      const bets = this.betsByPlayerAndRound[player.name][
        this.currentBettingRound
      ];
      const lastBet = bets[bets.length - 1];

      // @todo Make the player choose the amount
      let amount = 0;
      let action: PotActionsType = 'BET';
      const biggestBet = this.bettingRounds[this.currentBettingRound];

      // First time betting.
      if (lastBet == null) {
        if (biggestBet > 0) {
          amount = biggestBet;
          action = 'CALL';
        } else {
          // Big blind
          amount = this.stakes[1];
          action = 'BET';
          // console.log('\n\n\n\n\n-------');
          // console.log(player.name, 'betting', amount);
        }
      } else if (lastBet.action === 'BET' || lastBet.action === 'CALL') {
        if (lastBet.amount < biggestBet) {
          amount = biggestBet - lastBet.amount;
          action = 'CALL';
        } else if (
          lastBet.amount === biggestBet &&
          this.currentBettingRound === 0 &&
          position.type === 'BIG_BLIND'
        ) {
          action = 'CHECK';
        }
      }

      this.potAction({
        action,
        player,
        amount,
      });

      console.log(
        player.getDisplay(),
        action.toLowerCase() + 's',
        amount > 0 ? this.getValueDisplay(amount) : '',
      );
    }

    this.currentBettingPlayer = -1;
    this.currentBettingRound++;

    if (LOG) {
      this.printPots();
    }
  }

  public dealBoard(): void {
    const gameBoard = BOARD_STRUCTURE[this.gameType];
    const board = gameBoard[this.board.length];

    if (board == null) {
      throw new Error('No more board to deal');
    }

    if (board.discard > 0) {
      if (LOG) {
        console.log('');
        console.log('Discarding', board.discard, 'card(s) for', board.name);
      }

      for (let i = 0; i < board.discard; i++) {
        getCardFromDeck(this.deck);
      }
    }

    const cards: CardInterface[] = [];

    for (let i = 0; i < board.deal; i++) {
      const card = getCardFromDeck(this.deck);

      cards.push(card);
    }

    this.board.push({ ...board, cards });

    LOG && this.printBoard();
  }

  public checkWinners(): void {
    const boardCards: CardInterface[] = [];

    for (let board of this.board) {
      for (let card of board.cards) {
        boardCards.push(card);
      }
    }

    let winner = null;

    let biggestScore = 0;

    const playersWithScore = this.players.map(player => {
      const cards = player.cards.concat(boardCards);

      const ranking = this.checkers[this.gameType](player, cards);
      const score = ranking.handRanking * ranking.cardsRanking;

      if (LOG) {
        console.log(
          player.getDisplay(),
          'has',
          ranking.name,
          ranking.cards.map(c => c.display),
        );
      }

      if (score > biggestScore) {
        biggestScore = score;
      }

      return {
        player: player,
        hand: ranking,
        score,
      };
    });

    for (let winner of playersWithScore) {
      if (winner.score === biggestScore) {
        this.winners.push(winner);
      }
    }

    for (let winner of this.winners) {
      let totalFromPots = 0;

      for (let pot of this.pots) {
        if (pot.players.includes(winner.player) === false) {
          continue;
        }

        totalFromPots += pot.total;
      }
    }

    this.potAction({
      action: 'WIN',
      winners: this.winners,
    });

    LOG && this.printWinners();
  }

  public getValueDisplay(amount: number): string {
    const rawAmount = Math.abs(amount);
    const isNegative = amount < 0;

    return `${isNegative ? '-' : ''}${this.currency}${rawAmount}`;
  }

  public printHoldings(): void {
    console.log('');
    console.log('--- PLAYERS ---');

    for (let position of this.positions) {
      const player = position.player;

      console.log(player.getDisplay(), player.cards.map(c => c.display));
    }
  }

  public printBoard(): void {
    console.log('');
    console.log('--- BOARD ---');

    console.log(...this.board.map(board => board.cards.map(c => c.display)));
  }

  public printWinners(): void {
    console.log('');
    console.log('--- WINNERS ---');

    for (let potIndex = 0; potIndex < this.pots.length; potIndex++) {
      const winnerAction = this.potsActions[potIndex].find(
        potAction => potAction.action === 'WIN',
      ) as PotActionWinInterface;

      if (winnerAction == null) {
        throw Error('Win pot action not found');
      }

      const pot = winnerAction.pot;

      const potTotalPerPlayer = pot.total / winnerAction.winners.length;
      const action = winnerAction.winners.length > 1 ? 'ties' : 'wins';

      for (let winner of winnerAction.winners) {
        console.log(
          winner.player.getDisplay(),
          action,
          this.getValueDisplay(potTotalPerPlayer),
          'with',
          winner.hand.name,
          winner.hand.cards.map(c => c.display),
        );
      }
    }
  }

  public printPositions(): void {
    console.log('');
    console.log('--- POSITIONS ---');

    for (let position of this.positions) {
      console.log(position.player.getDisplay(), 'on', position.type);
    }
  }

  public printPots(): void {
    console.log('');
    console.log('--- POTS ---');

    for (let pot of this.pots) {
      console.log(
        pot.type,
        'pot:',
        `${pot.currency}${pot.total}`,
        'for',
        pot.players.length,
        'players',
      );
    }
  }

  public printPlayersProfits(): void {
    console.log('');
    console.log('--- STACKS AFTER', this.handsCount, 'HANDS ---');

    for (let position of this.positions) {
      const diff = position.player.chips - position.player.initialChips;

      console.log(position.player.getDisplay(), this.getValueDisplay(diff));
    }
  }

  public addPotAction(options: {
    potIndex: number;
    potAction: PotActionType;
  }): void {
    if (this.potsActions[options.potIndex] == null) {
      this.potsActions[options.potIndex] = [];
    }

    this.potsActions[options.potIndex].push(cloneDeep(options.potAction));
  }

  public updateRoundBiggestBet(amount: number): void {
    if (amount > this.bettingRounds[this.currentBettingRound]) {
      this.bettingRounds[this.currentBettingRound] = amount;
    }
  }
}
