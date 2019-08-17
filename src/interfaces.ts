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
}

export interface PlayerInterface extends InitialPlayerInterface {
  cards: CardInterface[];
  position: TablePositionTypes;
  initialChips: number;
  getDisplay: () => string;
}

export interface BoardStructureInterace {
  discard: number;
  deal: number;
  name: string;
}

export interface BoardInterace {
  cards: CardInterface[];
}

export type TableActionTypes =
  | 'SEATS'
  | 'BLINDS'
  | 'DEAL'
  | 'BET'
  | 'BOARD'
  | 'SHOWDOW';

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
  action: 'BET';
  amount: number;
}

export interface PotActionCallOptionInterface
  extends PotActionBaseOptionInterface {
  action: 'CALL';
  amount: number;
}

export interface PotActionRaiseOptionInterface
  extends PotActionBaseOptionInterface {
  action: 'RAISE';
  amount: number;
}

export interface PotActionCheckOptionInterface
  extends PotActionBaseOptionInterface {
  action: 'CHECK';
}

export interface PotActionFoldOptionInterface
  extends PotActionBaseOptionInterface {
  action: 'FOLD';
}

export interface PotActionWinOptionInterface {
  action: 'WIN';
  winners: WinnerInterface[];
}

export type PotActionsType =
  | 'CHECK'
  | 'BET'
  | 'CALL'
  | 'RAISE'
  | 'FOLD'
  | 'WIN';

export type PotActionOptionsType =
  | PotActionCheckOptionInterface
  | PotActionBetOptionInterface
  | PotActionCallOptionInterface
  | PotActionRaiseOptionInterface
  | PotActionFoldOptionInterface
  | PotActionWinOptionInterface;

export interface PotActionBaseInterface {
  player: PlayerInterface;
  pot: PotInterface;
}

export interface PotActionBetInterface extends PotActionBaseInterface {
  action: 'BET';
  amount: number;
}

export interface PotActionCallInterface extends PotActionBaseInterface {
  action: 'CALL';
  amount: number;
}

export interface PotActionRaiseInterface extends PotActionBaseInterface {
  action: 'RAISE';
  amount: number;
}

export interface PotActionFoldInterface extends PotActionBaseInterface {
  action: 'FOLD';
}

export interface PotActionWinInterface {
  action: 'WIN';
  winners: WinnerInterface[];
  pot: PotInterface;
}

export type PotActionType =
  | PotActionBetInterface
  | PotActionCallInterface
  | PotActionRaiseInterface
  | PotActionFoldInterface
  | PotActionWinInterface;

export interface GameOptions {
  currency: TableCurrencyTypes;
  players: InitialPlayerInterface[];
  gameType: GameTypes;
  gameLimit: GameLimits;
  handsCount: number;
  stakes: number[];
}

export interface WinnerInterface {
  player: PlayerInterface;
  hand: {
    name: string;
    cards: CardInterface[];
  };
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
