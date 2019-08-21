import { PlayerInterface, CardInterface } from '../interfaces';

export class InvalidHandError extends Error {
  constructor() {
    super('Invalid hand');
  }

  public player: PlayerInterface;
  public cards: CardInterface[];
}
