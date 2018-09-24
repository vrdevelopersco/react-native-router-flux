import isEqual from 'lodash.isequal';
import { NavigationActions, StackActions } from 'react-navigation';
import getNavigationStore from './getNavigationStore';
import * as ActionConst from './ActionConst';
import { getActiveState, popPrevious } from './State';

export function reducer(state, action) {
  const navigationStore = getNavigationStore();
  const { type, routeName } = action;
  if (type === ActionConst.POP_TO) {
    let nextScene = '';
    let newState = state;
    let currentState = state;
    while (newState && nextScene !== routeName) {
      newState = navigationStore.getStateForAction(StackActions.pop(), currentState);
      if (newState) {
        nextScene = getActiveState(newState).routeName;
        if (isEqual(currentState, newState)) {
          console.warn(`popTo called with an unknown routeName: ${routeName}`);
          break;
        }
        if (nextScene !== routeName) {
          currentState = newState;
        }
      }
    }
    return nextScene === routeName ? newState : state;
  }
  if (type === ActionConst.REPLACE) {
    const newState = navigationStore.getStateForAction(
      NavigationActions.navigate({
        routeName,
        params: action.params,
      }),
      state,
    );
    const res = popPrevious(newState, routeName);
    return res;
  }
  return navigationStore.getStateForAction(action, state) || state;
}

export default function createReducer() {
  return reducer;
}
