import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import {BrowserRouter as Router, Route, Routes, useNavigate} from "react-router-dom";
import Login from "./login";
import Square from './Square';
import HomePage from './HomePage';
import PublishNFT from "./PublishNFT";

const wallets = [new PetraWallet()];
const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

export default root


root.render(
  <AptosWalletAdapterProvider plugins={wallets} autoConnect={true}>
    <Router>
      <Routes>
        <Route path="/" element={
            <HomePage />
        }/>
        <Route path="/Square.tsx" element={<Square/>}/>
        <Route path="/PublishNFT.tsx" element={<PublishNFT/>}/>
        <Route path="/login.tsx" element={<Login/>}/>
      </Routes>
    </Router>
  </AptosWalletAdapterProvider>
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
