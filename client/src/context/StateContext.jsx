import { createContext, useContext, useReducer } from "react";

// Create the context
export const StateContext = createContext();

// Create the StateProvider component
export const StateProvider = ({ children, initialState, reducer }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <StateContext.Provider value={{ state, dispatch }}>
      {children}
    </StateContext.Provider>
  );
};

// Create a custom hook to use the StateContext
export const useStateProvider = () => useContext(StateContext);
