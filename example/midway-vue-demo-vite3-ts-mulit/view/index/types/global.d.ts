import { StateTree } from 'pinia';
declare global {
  interface Window {
    __pinia?: Record<string, StateTree>;
  }
  type TestIndex = number;
}
