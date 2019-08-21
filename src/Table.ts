// @todo All in
// @todo Side pots
// @todo Fold
// @todo Rebuy
// @todo Sitting out
// @todo Multiplayer
// @todo Add 'shuffle' method to deck so it can be reused during hands
//
import { cloneDeep } from 'lodash';
import * as prompts from 'prompts';

import { AbstractRenderer } from './renderers/AbstractRenderer';
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
  TableOptions,
  GameTypes,
  PlayerInterface,
  TableActionTypes,
  FinalHandInterface,
  PotInterface,
  TablePositionTypes,
  TablePositionInterface,
  InitialPlayerInterface,
  TableCurrencyTypes,
  PotActionOptionsType,
  PotActionType,
  PlayerInfoInterface,
  PotActionWinInterface,
  ConfigLogModeType,
  SetupOptionsInterface,
  HandCheckerFunction,
  PlayerOptionsType,
  PotActionsType,
} from './interfaces';
import { checkHoldem } from './checkers/check-holdem';
import {
  randomIndex,
  getCard,
  getCardFromDeck,
  getWinners,
  getFinalHand,
  getValueDisplay,
} from './helpers';

const LOG = false;
const RENDER = true;

let stateCount = 200;

export class Table implements AbstractRenderer {
  protected logMode: ConfigLogModeType;

  protected options: TableOptions;
  protected checkers: Record<GameTypes, HandCheckerFunction>;

  protected gameType: GameTypes;
  protected gameLimit: GameLimits;
  protected playersCount: number;
  protected players: PlayerInterface[];
  protected board: BoardInterace[];
  protected deck: DeckInterface;
  protected winners: FinalHandInterface[];

  protected tableActionIndex: number;
  protected tableActions: TableActionTypes[];

  protected pots: PotInterface[];
  protected history: any[];
  protected stakes: number[];
  protected mainPositions: TablePositionTypes[];
  protected positions: TablePositionInterface[];
  protected buttonPlayerIndex: number;
  protected currency: TableCurrencyTypes;
  // By bet roun and pot
  protected potsActions: PotActionType[][][];
  protected bettingRoundsCount: number;
  protected bettingRounds: number[];
  protected betsByPlayerAndRound: Record<string, PotActionType[][]>;
  protected currentRound: number;
  protected currentPlayer: number;
  protected playersInfo: Record<string, PlayerInfoInterface>;
  protected handsCount: number;
  protected playersOptions: PlayerOptionsType[][];
  protected lastAggressorIndex: number;

  constructor(options: TableOptions) {
    this.logMode = String(process.env.LOG_MODE) as ConfigLogModeType;

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
    this.players = [];
    this.playersOptions = [];
    this.lastAggressorIndex = -1;
    this.currentRound = 0;

    this.tableActions = TABLE_ACTIONS[this.gameType];

    this.mainPositions = TABLE_POSITIONS[this.gameType];

    this.history = [];
  }

  public async render() {}

  public async start() {
    await this.joinPlayers(this.options.players);
    await this.setup();

    await this.tick();

    // RENDER && (await this.render());

    // await this.update();
  }

  public async tick() {
    this.tableActionIndex++;
    await this.update();
    await this.render();

    if (this.tableActionIndex < stateCount) {
      stateCount--;
      await this.tick();
    }
  }

  public async update() {
    const state = this.tableActions[this.tableActionIndex];
    // let nextState = this.tableActionIndex + 1;

    if (this.tableActionIndex > this.tableActions.length) {
      this.log('');
      this.log('--- HAND FINISHED --');

      this.history.push(`Hand #${this.history.length + 1}`);
      const handsLeft = this.handsCount - this.history.length;

      // if (handsLeft > 0) {
      //   // this.setup();
      //   // this.update();
      //   return;
      // } else {
      //   this.log();
      //   this.log('--- GAME FINISHED ---');

      //   this.printPlayersProfits();
      //   return;
      // }
    }

    if (state === 'SEATS') {
      await this.seatPlayers();
    } else if (state === 'BLINDS') {
      await this.postBlinds();
    } else if (state === 'DEAL') {
      await this.dealCards();
    } else if (state === 'BET') {
      await this.betRound();
    } else if (state === 'BOARD') {
      await this.dealBoard();
    } else if (state === 'SHOWDOW') {
      await this.log('');
      await this.log('--- SHOWDOW ---');
      await this.checkWinners();
    } else if (state === 'WINNERS') {
      const res = await prompts({
        type: 'confirm',
        message: 'Next hand?',
        name: 'next',
        initial: true,
      });

      await this.setup();
      await this.tick();
    }

    await new Promise(r => setTimeout(r, 1000));
  }

  public async setup(options?: SetupOptionsInterface) {
    this.bettingRounds = [];
    this.currentRound = 0;
    this.currentPlayer = -1;
    this.betsByPlayerAndRound = {};

    this.potsActions = [];

    for (let index = 0; index <= this.bettingRoundsCount; index++) {
      this.bettingRounds[index] = 0;
      this.potsActions[index] = [];
    }

    this.playersInfo = {};

    this.board = [];

    const deadCards = (options && options.deadCards) || [];

    this.deck = await this.generateDeck(TOTAL_CARDS, deadCards);

    this.winners = [];

    this.tableActionIndex = -1;

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

    for (let player of this.players) {
      player.cards = [];

      for (let betRound = 0; betRound < this.bettingRoundsCount; betRound++) {
        player.betsByRound[betRound] = [];
      }
    }
  }

  public async seatPlayers() {
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

      this.playersOptions[playerIndex] = [];

      this.betsByPlayerAndRound[player.name] = [];

      for (let round = 0; round < this.bettingRoundsCount; round++) {
        this.betsByPlayerAndRound[player.name].push([]);
      }
    }

    // if (LOG) {
    //   this.printPositions();
    // }
  }

  public async postBlinds() {
    await this.log('');
    await this.log('--- BLINDS ---');

    for (let index = 0; index < this.stakes.length; index++) {
      const blindBet = this.stakes[index];
      const position = this.positions[index];
      const player = position.player;

      // this.currentPlayer = index;

      if (position.type === 'BIG_BLIND') {
        // this.lastAggressorIndex = index;
      }

      await this.potAction({
        action: 'BET_BLIND',
        amount: blindBet,
        player,
      });

      await this.log(
        player.getDisplay(),
        'posts',
        getValueDisplay(blindBet, this.currency),
      );
    }

    this.currentPlayer = this.stakes.length % this.positions.length;
    // console.log('SETTING NEXT', this.currentPlayer);

    if (LOG) {
      await this.printPots();
    }
  }

  public async potAction(options: PotActionOptionsType) {
    switch (options.action) {
      case 'CHECK': {
        for (let potIndex = 0; potIndex < this.pots.length; potIndex++) {
          const pot = this.pots[potIndex];

          if (pot.players.includes(options.player) === false) {
            pot.players.push(options.player);
          }

          const potAction: PotActionType = {
            action: options.action,
            player: options.player,
            pot,
          };

          await this.addPotAction({
            potAction,
            potIndex,
          });

          options.player.betsByRound[this.currentRound].push(potAction);

          this.betsByPlayerAndRound[options.player.name][
            this.currentRound
          ].push(potAction);

          if (this.lastAggressorIndex < 0) {
            this.lastAggressorIndex = pot.players.findIndex(
              player => player.name === options.player.name,
            );
          }
        }

        break;
      }

      case 'CALL': {
        let amount = this.bettingRounds[this.currentRound];
        let totalCall = amount;

        const bets = options.player.betsByRound[this.currentRound].filter(bet =>
          ['CALL', 'BET', 'BET_BLIND', 'RAISE'].includes(bet.action),
        );

        const lastBet = bets[bets.length - 1];

        if (lastBet != null) {
          if (
            lastBet.action === 'CALL' ||
            lastBet.action === 'BET' ||
            lastBet.action === 'BET_BLIND' ||
            lastBet.action === 'RAISE'
          ) {
            amount = amount - lastBet.amount;
          }

          if (amount === 0) {
            throw new Error(`Invalid amount 0 for action CALL`);
          }
        }

        options.player.chips -= amount;

        for (let potIndex = 0; potIndex < this.pots.length; potIndex++) {
          const pot = this.pots[potIndex];

          if (pot.players.includes(options.player) === false) {
            pot.players.push(options.player);
          }

          pot.total += amount;

          const potAction: PotActionType = {
            action: options.action,
            player: options.player,
            amount: totalCall,
            pot,
          };

          options.player.betsByRound[this.currentRound].push(potAction);

          await this.addPotAction({
            potAction,
            potIndex,
          });

          this.betsByPlayerAndRound[options.player.name][
            this.currentRound
          ].push(potAction);
        }
        break;
      }

      case 'BET':
      case 'BET_BLIND':
      case 'RAISE': {
        let amount = options.amount;

        const lastBet = await this.getLastPlayerBet(options.player);

        if (
          lastBet &&
          (lastBet.action === 'BET' || lastBet.action === 'BET_BLIND')
        ) {
          amount = amount - lastBet.amount;
        }

        options.player.chips -= amount;

        for (let potIndex = 0; potIndex < this.pots.length; potIndex++) {
          const pot = this.pots[potIndex];

          if (pot.players.includes(options.player) === false) {
            pot.players.push(options.player);
          }

          pot.total += amount;

          const potAction: PotActionType = {
            action: options.action,
            player: options.player,
            amount: options.amount,
            pot,
          };

          this.lastAggressorIndex = pot.players.findIndex(
            player => player.name === options.player.name,
          );

          await this.updateRoundBiggestBet(options.amount);

          options.player.betsByRound[this.currentRound].push(potAction);

          await this.addPotAction({
            potAction,
            potIndex,
          });

          this.betsByPlayerAndRound[options.player.name][
            this.currentRound
          ].push(potAction);
        }

        break;
      }

      case 'WIN': {
        for (let potIndex = 0; potIndex < this.pots.length; potIndex++) {
          const pot = this.pots[potIndex];
          const potTotalPerPlayer = pot.total / options.winners.length;

          for (let winner of options.winners) {
            const { player, hand } = winner;

            if (pot.players.includes(player) === false) {
              await this.log('Ignoring', player.name, ', not in pot');
              continue;
            }

            const potAction: PotActionType = {
              action: options.action,
              winners: options.winners,
              pot,
            };

            await this.addPotAction({
              potAction,
              potIndex,
            });

            player.chips += potTotalPerPlayer;
          }

          pot.players = [];
          pot.total = 0;
        }

        break;
      }

      case 'FOLD': {
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

          options.player.betsByRound[this.currentRound].push(potAction);

          await this.addPotAction({
            potAction,
            potIndex,
          });
        }

        break;
      }

      default: {
        throw Error('Invalid pot action: ' + JSON.stringify(options));

        break;
      }

      // this.currentPlayer = (this.currentPlayer + 1) % this.positions.length;
    }
  }

  public async joinPlayers(initialPlayers: InitialPlayerInterface[]) {
    const currency = this.currency;

    for (let initialPlayer of initialPlayers) {
      const player: PlayerInterface = {
        ...initialPlayer,
        cards: [],
        position: 'UNSEATED',
        initialChips: cloneDeep(initialPlayer.chips),
        betsByRound: [],
        getDisplay() {
          const positionDisplay =
            this.position === 'UNSEATED'
              ? ''
              : TABLE_POSITIONS_DISPLAY[this.position] + ' | ';

          return `${positionDisplay}${this.name} (${currency}${this.chips})`;
        },
      };

      for (let betRound = 0; betRound < this.bettingRoundsCount; betRound++) {
        player.betsByRound[betRound] = [];
      }

      this.players.push(player);
    }
  }

  public async generateDeck(
    totalCardsToShuffle: number,
    cardsToIgnore: CardInterface[] = [],
  ): Promise<DeckInterface> {
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
      deck.delete(card.display);
    }

    const cards = Array.from(deck.values());

    return {
      deadCards: [],
      cards,
    };
  }

  public async dealCards(
    options: {
      ignorePlayers: string[];
    } = { ignorePlayers: [] },
  ) {
    await this.log('');
    await this.log('--- DEAL CARDS ---');

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

        await this.log('Dealing card to', player.name);

        player.cards.push(card);
      }
    }

    LOG && (await this.printHoldings());
  }

  public async betRound() {
    if (this.currentPlayer < 0) {
      // console.log('NO PLAYER');
      return;
    }

    const nextOptions: Set<PlayerOptionsType> = new Set();

    const position = this.positions[this.currentPlayer];

    const currentBet = await this.getCurrentBet();
    let lastPlayerBet = await this.getLastPlayerBet(position.player);

    const hasBetOnPot = currentBet > 0;
    const hasPlayerBet = lastPlayerBet != null;
    const isLastAggressor = this.lastAggressorIndex === this.currentPlayer;

    // console.log({
    //   player: position.player.name,
    //   currentBet,
    //   round: this.currentRound,
    //   hasPlayerBet,
    //   isLastAggressor,
    // });

    // The player hasn't bet yet.
    if (hasBetOnPot && hasPlayerBet === false) {
      nextOptions.add('FOLD');
      nextOptions.add('CALL');
      nextOptions.add('RAISE');
    }

    if (
      hasBetOnPot &&
      hasPlayerBet &&
      isLastAggressor &&
      position.type === 'BIG_BLIND' &&
      lastPlayerBet &&
      lastPlayerBet.action === 'BET_BLIND'
    ) {
      nextOptions.add('CHECK');
      nextOptions.add('RAISE');
    }

    if (hasBetOnPot && hasPlayerBet && isLastAggressor === false) {
      nextOptions.add('FOLD');
      nextOptions.add('CALL');
      nextOptions.add('RAISE');
    }

    if (hasBetOnPot === false) {
      nextOptions.add('CHECK');
      nextOptions.add('BET');
    }

    const options = Array.from(nextOptions);

    this.playersOptions[this.currentPlayer] = options;

    if (options.length > 0) {
      const response = await prompts([
        {
          type: 'select',
          name: 'action',
          message: 'Action',
          choices: options.map(option => ({ title: option, value: option })),
        },
        {
          type: (_, values) => (values.action === 'BET' ? 'number' : null),
          name: 'amount',
          message: `Amount (${this.currency}):`,
          validate: value => value >= this.stakes[1],
        },
        {
          type: (_, values) => (values.action === 'RAISE' ? 'number' : null),
          name: 'amount',
          message: `Amount (${this.currency}):`,
          validate: value => value > currentBet,
        },
      ]);

      const action: PotActionsType = response.action;

      const amount = response.amount;

      await this.potAction({
        action: response.action,
        player: position.player,
        amount,
      });
    }

    lastPlayerBet = await this.getLastPlayerBet(position.player);

    this.currentPlayer = await this.getNextPlayerIndex();
    // console.log('SETTING NEXT', this.currentPlayer);

    const nextPlayer = this.positions[this.currentPlayer].player;
    const nextPlayerLastBet = await this.getLastPlayerBet(nextPlayer);

    let isLastPlayer = false;

    if (isLastAggressor && lastPlayerBet && lastPlayerBet.action === 'CHECK') {
      isLastPlayer = true;
    } else if (
      this.lastAggressorIndex === this.currentPlayer &&
      nextPlayerLastBet &&
      nextPlayerLastBet.action !== 'BET_BLIND'
    ) {
      isLastPlayer = true;
    }

    if (isLastPlayer) {
      this.currentPlayer = -1;
      this.currentRound++;
      // console.log('LAAAAAAST', { round: this.currentRound });
      this.lastAggressorIndex = -1;

      for (let index = 0; index < this.positions.length; index++) {
        this.playersOptions[index] = [];
      }
    } else {
      this.tableActionIndex--;
    }

    // let positions = this.positions
    //   .slice(nextBettingPlayerIndex)
    //   .concat(this.positions.slice(0, nextBettingPlayerIndex));

    // for (let playerIndex = 0; playerIndex < positions.length; playerIndex++) {
    //   const position = positions[playerIndex];
    //   const player = position.player;

    //   const bets = this.betsByPlayerAndRound[player.name][
    //     this.currentBettingRound
    //   ];
    //   const lastBet = bets[bets.length - 1];

    //   // @todo Make the player choose the amount
    //   let amount = 0;
    //   let action: PotActionsType = 'BET';
    //   const biggestBet = this.bettingRounds[this.currentBettingRound];

    // console.log('next', position.player.name);
    //
    //   // First time betting.
    //   if (lastBet == null) {
    //     if (biggestBet > 0) {
    //       amount = biggestBet;
    //       action = 'CALL';
    //     } else {
    //       // Big blind
    //       amount = this.stakes[1];
    //       action = 'BET';
    //       // this.log('\n\n\n\n\n-------');
    //       // this.log(player.name, 'betting', amount);
    //     }
    //   } else if (lastBet.action === 'BET' || lastBet.action === 'CALL') {
    //     if (lastBet.amount < biggestBet) {
    //       amount = biggestBet - lastBet.amount;
    //       action = 'CALL';
    //     } else if (
    //       lastBet.amount === biggestBet &&
    //       this.currentBettingRound === 0 &&
    //       position.type === 'BIG_BLIND'
    //     ) {
    //       action = 'CHECK';
    //     }
    //   }

    //   this.potAction({
    //     action,
    //     player,
    //     amount,
    //   });

    //   this.log(
    //     player.getDisplay(),
    //     action.toLowerCase() + 's',
    //     amount > 0 ? getValueDisplay(amount, this.currency) : '',
    //   );
    // }

    // this.currentBettingPlayer = -1;
    // this.currentBettingRound++;

    // if (LOG) {
    //   this.printPots();
    // }
  }

  public async dealBoard() {
    const gameBoard = BOARD_STRUCTURE[this.gameType];
    const board = gameBoard[this.board.length];

    if (board == null) {
      throw new Error('No more board to deal');
    }

    if (board.discard > 0) {
      if (LOG) {
        await this.log('');
        await this.log('Discarding', board.discard, 'card(s) for', board.name);
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

    this.currentPlayer = 0;
    // this.currentRound++;

    LOG && (await this.printBoard());
  }

  public async checkWinners() {
    const boardCards: CardInterface[] = [];

    for (let board of this.board) {
      for (let card of board.cards) {
        boardCards.push(card);
      }
    }

    const hands: FinalHandInterface[] = [];

    for (let position of this.positions) {
      const hand = getFinalHand({
        player: position.player,
        boardCards,
        checker: this.checkers[this.gameType],
      });

      this.log(
        hand.player.getDisplay(),
        'has',
        hand.hand.name,
        hand.hand.cards.map(c => c.display),
      );

      hands.push(hand);
    }

    this.winners = getWinners(hands);

    for (let winner of this.winners) {
      let totalFromPots = 0;

      for (let pot of this.pots) {
        if (pot.players.includes(winner.player) === false) {
          continue;
        }

        totalFromPots += pot.total;
      }
    }

    await this.potAction({
      action: 'WIN',
      winners: this.winners,
    });

    LOG && (await this.printWinners());
  }

  public async printHoldings() {
    await this.log('');
    await this.log('--- PLAYERS ---');

    for (let position of this.positions) {
      const player = position.player;

      await this.log(player.getDisplay(), player.cards.map(c => c.display));
    }
  }

  public async printBoard() {
    await this.log('');
    await this.log('--- BOARD ---');

    await this.log(...this.board.map(board => board.cards.map(c => c.display)));
  }

  public async printWinners() {
    await this.log('');
    await this.log('--- WINNERS ---');

    for (let potIndex = 0; potIndex < this.pots.length; potIndex++) {
      const winnerAction = this.potsActions[this.currentRound][potIndex].find(
        potAction => potAction.action === 'WIN',
      ) as PotActionWinInterface;

      if (winnerAction == null) {
        throw Error('Win pot action not found');
      }

      const pot = winnerAction.pot;

      const potTotalPerPlayer = pot.total / winnerAction.winners.length;
      const action = winnerAction.winners.length > 1 ? 'ties' : 'wins';

      for (let winner of winnerAction.winners) {
        await this.log(
          winner.player.getDisplay(),
          action,
          getValueDisplay(potTotalPerPlayer, this.currency),
          'with',
          winner.hand.name,
          winner.hand.cards.map(c => c.display),
        );
      }
    }
  }

  // public async printPositions() {
  //   this.log('');
  //   this.log('--- POSITIONS ---');

  //   for (let position of this.positions) {
  //     this.log(position.player.getDisplay(), 'on', position.type);
  //   }
  // }

  public async printPots() {
    await this.log('');
    await this.log('--- POTS ---');

    for (let pot of this.pots) {
      await this.log(
        pot.type,
        'pot:',
        `${pot.currency}${pot.total}`,
        'for',
        pot.players.length,
        'players',
      );
    }
  }

  public async printPlayersProfits() {
    await this.log('');
    await this.log('--- STACKS AFTER', this.handsCount, 'HANDS ---');

    for (let position of this.positions) {
      const diff = position.player.chips - position.player.initialChips;

      await this.log(
        position.player.getDisplay(),
        getValueDisplay(diff, this.currency),
      );
    }
  }

  public async addPotAction(options: {
    potIndex: number;
    potAction: PotActionType;
  }) {
    if (this.currentRound > this.bettingRoundsCount) {
      return;
    }

    if (this.potsActions[this.currentRound][options.potIndex] == null) {
      this.potsActions[this.currentRound][options.potIndex] = [];
    }

    this.potsActions[this.currentRound][options.potIndex].push(
      cloneDeep(options.potAction),
    );
  }

  public async updateRoundBiggestBet(amount: number) {
    if (amount > this.bettingRounds[this.currentRound]) {
      this.bettingRounds[this.currentRound] = amount;
    }
  }

  public async log(...args: any[]) {
    if (this.logMode === 'NULL') {
      return;
    }

    if (LOG === false) {
      return;
    }

    console.log(...args);
  }

  public async getCurrentBet(): Promise<number> {
    return this.bettingRounds[this.currentRound];
  }

  public async getLastPlayerBet(
    player: PlayerInterface,
  ): Promise<PotActionType | null> {
    const playerBets = this.betsByPlayerAndRound[player.name][
      this.currentRound
    ];

    if (playerBets == null) {
      return null;
    }

    return playerBets[playerBets.length - 1];
  }

  public async getNextPlayerIndex(): Promise<number> {
    return (this.currentPlayer + 1) % this.positions.length;
  }
}
