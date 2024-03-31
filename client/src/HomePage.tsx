import { Layout, Row, Col, Button, Spin, List, Checkbox, Flex, Typography} from 'antd';
import { Input, Space ,Card} from 'antd';
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import backgroundImage from './homepage_pic.jpg';
import {
  useWallet,
  InputTransactionData,
} from "@aptos-labs/wallet-adapter-react";
import { useState, useEffect } from "react";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import './styles.css';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PublishNFT from "./PublishNFT";
import root from './index'
import axios from "axios";
import { text } from "stream/consumers";

const { Title } = Typography;
const { Meta } = Card;

function HomePage() {
    const aptos = new Aptos();
    const { account, signAndSubmitTransaction } = useWallet();

    let navigate = useNavigate();

    function handleClick_home() {
        //root.render(<PublishNFT />);
        navigate('../'); // 跳转到AnotherPage组件
      }
      
      function handleClick_square() {
        //root.render(<PublishNFT />);
        navigate('../Square.tsx'); // 跳转到AnotherPage组件
      }
      
      function handleClick_publicNFT() {
        //root.render(<PublishNFT />);
        navigate('../PublishNFT.tsx'); // 跳转到AnotherPage组件
      }
    
        function handleClick_Login() {
        // root.render(<Login />);
        navigate('../login.tsx'); // 跳转到AnotherPage组件
      }
    return(
        <div className="app">
            <header>
        <div>
        <Title italic level={3}>Joint Membership System</Title>
          <Flex gap="small" wrap="wrap">
            <Button type="text"  > Home</Button>
            <Button type="text" onClick={handleClick_square}>Square</Button>
            <Button type="text" onClick={handleClick_publicNFT}>Publish NFT</Button>
          </Flex>
          <hr />
        </div>
          {account ? (
        <div>
          <WalletSelector />
        </div>):(
          <div>
          <Button onClick={handleClick_Login}>Log in</Button>
          <WalletSelector />
        </div>
          )}
      </header>
      <main>

      <div className="full-page">
      <div className="background" style={{ backgroundImage: `url(${backgroundImage})` }}>
        <div className="centered">
        <Flex wrap="wrap" gap="small" className="site-button-ghost-wrapper">
            <Button type="primary" 
            style={{ marginTop: '20vh', width: '200px', height: '60px', marginBottom: '10px' , fontSize: '20px', fontWeight: 'bold'}}
            ghost>
            Home
            </Button>
            <Button type="primary" 
            style={{ marginTop: '20vh', width: '200px', height: '60px', marginBottom: '10px' , fontSize: '20px', fontWeight: 'bold'}}
            onClick={handleClick_square}
            ghost>
            Square
            </Button>
            <Button type="primary" 
            style={{ marginTop: '20vh', width: '200px', height: '60px', marginBottom: '10px' , fontSize: '20px', fontWeight: 'bold'}}
            onClick={handleClick_publicNFT}
            ghost>
            PublishNFT
            </Button>
        </Flex>
        </div>
      </div>
    </div>

    </main>


        </div>
    )
}

export default HomePage;