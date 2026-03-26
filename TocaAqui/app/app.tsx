import 'react-native-gesture-handler';

import React from "react";
import { AccountProvider } from '../contexts/AccountFromContexto';
import { AuthProvider } from '../contexts/AuthContext';
import Navigate from "../navigation/Navigate";

export default function App() {
  return (
    <AuthProvider>
      <AccountProvider>
        <Navigate />
      </AccountProvider>
    </AuthProvider>
  );
}