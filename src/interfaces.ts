export type CardSuitsType = '♠' | '♥' | '♣' | '♦';

export type CardValuesType =
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'J'
  | 'Q'
  | 'K'
  | 'A';

export type HandTypes =
  | 'HIGH_CARD'
  | 'PAIR'
  | 'TWO_PAIR'
  | 'TRIPS'
  | 'STRAIGHT'
  | 'FLUSH'
  | 'FULL_HOUSE'
  | 'QUADS'
  | 'STRAIGHT_FLUSH'
  | 'ROYAL_STRAIGHT_FLUSH';

export type GameTypes = 'holdem';

export type GameLimits = 'no-limit';

export interface CardInterface {
  display: string;
  value: CardValuesType;
  suit: CardSuitsType;
  score: number;
}

export interface DeckInterface {
  deadCards: CardInterface[];
  cards: CardInterface[];
}

export interface InitialPlayerInterface {
  name: string;
  chips: number;
  cards?: CardInterface[];
}

export interface PlayerInterface extends InitialPlayerInterface {
  cards: CardInterface[];
  position: TablePositionTypes;
  initialChips: number;
  betsByRound: PotActionType[][];
  getDisplay: () => string;
}

export interface BoardStructureInterace {
  discard: number;
  deal: number;
  name: string;
}

import { AbstractRenderer } from './renderers/AbstractRenderer';
export interface BoardInterace {
  cards: CardInterface[];
}

export type TableActionTypes =
  | 'SEATS'
  | 'BLINDS'
  | 'DEAL'
  | 'BET'
  | 'BOARD'
  | 'SHOWDOW'
  | 'WINNERS';

export interface PotInterface {
  type: 'MAIN' | 'SIDE';
  players: PlayerInterface[];
  total: number;
  currency: TableCurrencyTypes;
}

export interface PotActionBaseOptionInterface {
  player: PlayerInterface;
}

export interface PotActionBetOptionInterface
  extends PotActionBaseOptionInterface {
  action: 'BET' | 'BET_BLIND' | 'RAISE';
  amount: number;
}

export interface PotActionCallOptionInterface
  extends PotActionBaseOptionInterface {
  action: 'CALL';
  amount: number;
}

// export interface PotActionRaiseOptionInterface extends PotActionBaseOptionInterface {
//   action: 'RAISE';
//   amount: number;
// }

export interface PotActionCheckOptionInterface
  extends PotActionBaseOptionInterface {
  action: 'CHECK';
}

export interface PotActionFoldOptionInterface
  extends PotActionBaseOptionInterface {
  action: 'FOLD';
}

export interface PotActionWinShowdownOptionInterface {
  action: 'WIN_SHOWDOW';
  winners: FinalHandInterface[];
}

export interface PotActionWinNoShowdownOptionInterface {
  action: 'WIN_NO_SHOWDOW';
  player: PlayerInterface;
}

export type PotActionsType =
  | 'CHECK'
  | 'BET'
  | 'CALL'
  | 'RAISE'
  | 'FOLD'
  | 'WIN_SHOWDOW'
  | 'WIN_NO_SHOWDOW';

export type PotActionOptionsType =
  | PotActionCheckOptionInterface
  | PotActionBetOptionInterface
  | PotActionCallOptionInterface
  // | PotActionRaiseOptionInterface
  | PotActionFoldOptionInterface
  | PotActionWinShowdownOptionInterface
  | PotActionWinNoShowdownOptionInterface;

export interface PotActionBaseInterface {
  player: PlayerInterface;
  pot: PotInterface;
}

export interface PotActionBetInterface extends PotActionBaseInterface {
  action: 'BET' | 'BET_BLIND' | 'RAISE' | 'CALL';
  amount: number;
}

export interface PotActionCheckInterface extends PotActionBaseInterface {
  action: 'CHECK' | 'FOLD';
}

// export interface PotActionCallInterface extends PotActionBaseInterface {
//   action: 'CALL';
//   // amount: number;
// }

// // export interface PotActionRaiseInterface extends PotActionBaseInterface {
// //   action: 'RAISE';
// //   amount: number;
// // }

// export interface PotActionFoldInterface extends PotActionBaseInterface {
//   action: 'FOLD';
// }

export interface PotActionWinShowdownInterface {
  action: 'WIN_SHOWDOW';
  winners: FinalHandInterface[];
  pot: PotInterface;
  amount?: number;
}

export interface PotActionWinNoShowdownInterface {
  action: 'WIN_NO_SHOWDOW';
  player: PlayerInterface;
  pot: PotInterface;
  amount?: number;
}

export type PotActionType =
  | PotActionBetInterface
  | PotActionCheckInterface
  // | PotActionCallInterface
  // | PotActionRaiseInterface
  // | PotActionFoldInterface
  | PotActionWinShowdownInterface
  | PotActionWinNoShowdownInterface;

export interface TableOptions {
  currency: TableCurrencyTypes;
  players: InitialPlayerInterface[];
  gameType: GameTypes;
  gameLimit: GameLimits;
  handsCount: number;
  stakes: number[];
}

export interface FinalHandInterface {
  player: PlayerInterface;
  hand: HandInterface;
  score: number;
}

export interface HandInterface {
  name: string;
  cardsRanking: number;
  handRanking: number;
  cards: CardInterface[];
}

export interface TurnInterface {
  type: 'PLAYER' | 'DEALER';
}

export type TablePositionTypes =
  | 'BUTTON'
  | 'SMALL_BLIND'
  | 'BIG_BLIND'
  | 'OTHER'
  | 'UNSEATED';

export interface TablePositionInterface {
  type: TablePositionTypes;
  player: PlayerInterface;
}

export type TableCurrencyTypes = '$' | 'R$';

export interface PlayerInfoInterface extends PlayerInterface {
  positionIndex: number;
}

export type ConfigLogModeType = 'NULL' | 'FILE' | 'TERMINAL';

export interface SetupOptionsInterface {
  deadCards?: CardInterface[];
}

export interface GetHandsOptionsInterface {
  player: PlayerInterface;
  boardCards: CardInterface[];
  checker: HandCheckerFunction;
}

export type HandCheckerFunction = (
  player: PlayerInterface,
  cards: CardInterface[],
) => HandInterface;

export type PlayerOptionsType = Exclude<
  PotActionsType,
  'WIN_SHOWDOW' | 'WIN_NO_SHOWDOW'
>;
