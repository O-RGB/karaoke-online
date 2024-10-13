// "use client";
// import { createContext, FC, useEffect, useState } from "react";

// type KeyUpContextType = {
//   lastKey: string | null;
//   searching: string;
//   onEnter: boolean;
//   arrowDown: boolean;
//   arrowUp: boolean;
//   arrowLeft: boolean;
//   arrowRight: boolean;
// };

// type KeyupProviderProps = {
//   children: React.ReactNode;
// };

// export const KeyUpContext = createContext<KeyUpContextType>({
//   lastKey: null,
//   searching: "",
//   onEnter: false,
//   arrowDown: false,
//   arrowUp: false,
//   arrowLeft: false,
//   arrowRight: false,
// });

// export const KeyUpProvider: FC<KeyupProviderProps> = ({ children }) => {
//   const [lastKey, setLastKey] = useState<string | null>(null);
//   const [searching, setSearching] = useState<string>("");
//   const [onEnter, setEnter] = useState<boolean>(false);

//   const [arrowDown, setArrowDown] = useState<boolean>(false);
//   const [arrowUp, setArrowUp] = useState<boolean>(false);
//   const [arrowLeft, setArrowLeft] = useState<boolean>(false);
//   const [arrowRight, setArrowRight] = useState<boolean>(false);

//   useEffect(() => {
//     let timeout: NodeJS.Timeout;

//     const handleKeyUp = (event: KeyboardEvent) => {
//       const { key } = event;

//       console.log(key);
//       if (/^[a-zA-Zก-๙0-9\s]$/.test(key)) {
//         // If a valid character is pressed, append it to the 'searching' string
//         setLastKey(key);
//         setSearching((prev) => prev + key);

//         // Reset the timeout to clear the 'searching' state after 10 seconds of inactivity
//         if (timeout) {
//           clearTimeout(timeout);
//         }
//         timeout = setTimeout(() => {
//           setSearching("");
//         }, 10000);
//       } else if (key === "Backspace") {
//         // Handle the 'Backspace' key to remove the last character from 'searching'
//         setSearching((prev) => prev.slice(0, -1));

//         // Reset the timeout when Backspace is pressed
//         if (timeout) {
//           clearTimeout(timeout);
//         }
//         timeout = setTimeout(() => {
//           setSearching("");
//         }, 10000);
//       } else if (key === "Enter") {
//         setEnter((value) => !value);
//         setSearching("");
//       } else if (key === "ArrowDown") {
//         setArrowDown((value) => !value);
//       } else if (key === "ArrowUp") {
//         setArrowUp((value) => !value);
//       } else if (key === "ArrowLeft") {
//         setArrowLeft((value) => !value);
//         // Reset the timeout when Backspace is pressed
//         if (timeout) {
//           clearTimeout(timeout);
//         }
//         timeout = setTimeout(() => {
//           setSearching("");
//         }, 10000);
//       } else if (key === "ArrowRight") {
//         setArrowRight((value) => !value);
//         // Reset the timeout when Backspace is pressed
//         if (timeout) {
//           clearTimeout(timeout);
//         }
//         timeout = setTimeout(() => {
//           setSearching("");
//         }, 10000);
//       } else {
//         // Ignore non-character keys except Backspace
//         setLastKey(null);
//       }
//     };

//     window.addEventListener("keyup", handleKeyUp);

//     return () => {
//       window.removeEventListener("keyup", handleKeyUp);
//       if (timeout) {
//         clearTimeout(timeout); // Cleanup timeout on unmount
//       }
//     };
//   }, []);

//   return (
//     <KeyUpContext.Provider
//       value={{
//         lastKey,
//         searching,
//         onEnter,
//         arrowDown,
//         arrowUp,
//         arrowLeft,
//         arrowRight,
//       }}
//     >
//       {children}
//     </KeyUpContext.Provider>
//   );
// };
