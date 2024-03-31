import { Layout, Row, Col, Button, Spin, List, Checkbox, Flex, Typography} from 'antd';
import { Input, Space ,Card, Carousel } from 'antd';
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import React, {useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {NavigateFunction} from "react-router/dist/lib/hooks";
import ReactDOM from "react-dom";
import root from "./index";
import {Account, Aptos, AptosConfig, Ed25519PrivateKey, Network, NetworkToNetworkName} from "@aptos-labs/ts-sdk";
import {CheckboxChangeEvent} from "antd/es/checkbox";
import {InputTransactionData, useWallet} from "@aptos-labs/wallet-adapter-react";

const { Title } = Typography;
const { Meta } = Card;
const contentStyle: React.CSSProperties = {
  height: '160px',
  color: '#fff',
  lineHeight: '160px',
  textAlign: 'center',
  background: '#364d79',
};  


  type Task = {
    address: string;
    completed: boolean;
    content: string;
    task_id: string;
  };
  function PublishNFT() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [accountHasList, setAccountHasList] = useState<boolean>(false);
    const [accountHasCollection, setAccountHasCollection] = useState<boolean>(false);
    const [name, setName] = useState<string>('');
    const [assetName, setAssetName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [assetDescription, setAssetDescription] = useState<string>('');
    const [uri, setURI] = useState<string>('');
    const [assetURI, setAssetURI] = useState<string>('');
    const [image, setImage] = useState<string>(''); // 存储图片的 URL
    const [newTask, setNewTask] = useState<string>("");
    const [transactionInProgress, setTransactionInProgress] =
      useState<boolean>(false);
    const { account, signAndSubmitTransaction } = useWallet();
    const moduleAddress = "0x6d651c2909aec0611a82d46a21817a6de24f038c7d7d03e8026db8f07d4a3d2d";
    const privateKeyBytes = "0xeed0342350f30d3c3ff93a39b9a77f3a60b9069630a46822822f96c5e17941da";
  
    // Setup the client_git
    const APTOS_NETWORK: Network = Network.DEVNET;
    const config = new AptosConfig({ network: APTOS_NETWORK });
    const aptos = new Aptos(config);

    const default_pic = "https://img2.imgtp.com/2024/03/31/EnOwsu1m.jpg"

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

  
    const onTaskAdded = async () => {
      // check for connected account
      if (!account) return;
      setTransactionInProgress(true);
      const transaction:InputTransactionData = {
        data:{
          function:`${moduleAddress}::todolist::create_task`,
          functionArguments:[newTask]
        }
      }
  
      // hold the latest task.task_id from our local state
      const latestId = tasks.length > 0 ? parseInt(tasks[tasks.length - 1].task_id) + 1 : 1;
  
      // build a newTaskToPush object into our local state
      const newTaskToPush = {
        address: account.address,
        completed: false,
        content: newTask,
        task_id: latestId + "",
      };
  
      try {
        // sign and submit transaction to chain
        const response = await signAndSubmitTransaction(transaction);
        // wait for transaction
        await aptos.waitForTransaction({transactionHash:response.hash});
  
        // Create a new array based on current state:
        let newTasks = [...tasks];
  
        // Add item to the tasks array
        newTasks.push(newTaskToPush);
        // Set state
        setTasks(newTasks);
        // clear input text
        setNewTask("");
      } catch (error: any) {
        console.log("error", error);
      } finally {
        setTransactionInProgress(false);
      }
    };
  
    const fetchList = async () => {
      if (!account) return [];
      try {
        const todoListResource = await aptos.getAccountResource(
          {accountAddress:account?.address,
            resourceType:`${moduleAddress}::todolist::TodoList`}
        );
        setAccountHasList(true);
        // Tasks are stored in a table (this is how we built our contract). To fetch a table item (i.e a task), we need that task's table handle.
        const tableHandle = (todoListResource as any).tasks.handle;
        // We also need the task_counter in that resource so we can loop over and fetch the task with the task_id that matches the task_counter.
        const taskCounter = (todoListResource as any).task_counter;
  
        let tasks = [];
        let counter = 1;
        while (counter <= taskCounter) {
          const tableItem = {
            key_type: "u64",
            value_type: `${moduleAddress}::todolist::Task`,
            key: `${counter}`,
          };
          const task = await aptos.getTableItem<Task>({handle:tableHandle, data:tableItem});
          tasks.push(task);
          counter++;
        }
        // set tasks in local state
        setTasks(tasks);
      } catch (e: any) {
        setAccountHasList(false);
      }
    };
  
    useEffect(() => {
      fetchList();
    }, [account?.address]);
  
    // const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    //   const file = event.target.files?.[0];
    //   if (file) {
    //     const reader = new FileReader();
    //     reader.onloadend = () => {
    //       const imageDataUrl = reader.result as string;
    //       setImage(imageDataUrl);
    //     };
    //     reader.readAsDataURL(file);
    //   }
    // };
  
    const onCheckboxChange = async (
      event: CheckboxChangeEvent,
      taskId: string
    ) => {
      if (!account) return;
      if (!event.target.checked) return;
      setTransactionInProgress(true);
      const transaction:InputTransactionData = {
        data:{
          function:`${moduleAddress}::todolist::complete_task`,
          functionArguments:[taskId]
        }
      }
  
      try {
        // sign and submit transaction to chain
        const response = await signAndSubmitTransaction(transaction);
        // wait for transaction
        await aptos.waitForTransaction({transactionHash:response.hash});
  
        setTasks((prevState) => {
          const newState = prevState.map((obj) => {
            // if task_id equals the checked taskId, update completed property
            if (obj.task_id === taskId) {
              return { ...obj, completed: true };
            }
  
            // otherwise return object as is
            return obj;
          });
  
          return newState;
        });
      } catch (error: any) {
        console.log("error", error);
      } finally {
        setTransactionInProgress(false);
      }
    };
    const onWriteTask = (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setNewTask(value);
      setAssetURI(value);
    };
  
    const handlePublish = () => {
      // createCollection(privateKeyBytes, name, description, uri);
      if(!accountHasList) {
        addNewList();
      }
      setAccountHasCollection(true);
    };
  
    const handlePublishNFT = () => {
      onTaskAdded();
      // createAssetInCollection(privateKeyBytes, name, assetName, assetDescription, assetURI);
    }
  
    const createCollection = async (
      privateKeyBytes: string,
      collectionName: string,
      collectionDescription: string,
      collectionURI: string
    ) => {
      const privateKey = new Ed25519PrivateKey(privateKeyBytes);
      const alice = Account.fromPrivateKey({privateKey});
  
      // Create the collection
      const createCollectionTransaction = await aptos.createCollectionTransaction({
        creator: alice,
        description: collectionDescription,
        name: collectionName,
        uri: collectionURI,
      });
  
      console.log("\n=== Creating the collection ===\n");
  
      const committedTxn = await aptos.signAndSubmitTransaction({
        signer: alice,
        transaction: createCollectionTransaction
      });
      const pendingTxn = await aptos.waitForTransaction({transactionHash: committedTxn.hash});
      const alicesCollection = await aptos.getCollectionData({
        creatorAddress: alice.accountAddress,
        collectionName,
        minimumLedgerVersion: BigInt(pendingTxn.version),
      });
      console.log(`Alice's collection: ${JSON.stringify(alicesCollection, null, 4)}`);
  
      // const alicesCollection = await aptos.getCollectionData({
      //   creatorAddress: alice.accountAddress,
      //   collectionName,
      //   minimumLedgerVersion: BigInt(pendingTxn.version),
      // });
      // console.log(`Alice's collection: ${JSON.stringify(alicesCollection, null, 4)}`);
    };
  
    const addNewList = async () => {
      if (!account) return [];
      setTransactionInProgress(true);
      const transaction:InputTransactionData = {
        data: {
          function:`${moduleAddress}::todolist::create_list`,
          functionArguments:[]
        }
      }
      try {
        // sign and submit transaction to chain
        const response = await signAndSubmitTransaction(transaction);
        // wait for transaction
        await aptos.waitForTransaction({transactionHash:response.hash});
        setAccountHasList(true);
      } catch (error: any) {
        setAccountHasList(false);
      } finally {
        setTransactionInProgress(false);
      }
    };
  
    const createAssetInCollection = async (
      privateKeyBytes: string,
      collectionName: string,
      tokenName: string,
      tokenDescription: string,
      tokenURI: string
    ) => {
      const privateKey = new Ed25519PrivateKey(privateKeyBytes);
      const alice = Account.fromPrivateKey({privateKey});
  
      console.log("\n=== Alice Mints the digital asset ===\n");
  
      const mintTokenTransaction = await aptos.mintDigitalAssetTransaction({
        creator: alice,
        collection: collectionName,
        description: tokenDescription,
        name: tokenName,
        uri: tokenURI,
      });
  
      const committedTxn = await aptos.signAndSubmitTransaction({signer: alice, transaction: mintTokenTransaction});
      const pendingTxn = await aptos.waitForTransaction({transactionHash: committedTxn.hash});
  
    };
  
    const getAsset = async () => {
      const privateKey = new Ed25519PrivateKey(privateKeyBytes);
      const alice = Account.fromPrivateKey({privateKey});
      const alicesDigitalAsset = await aptos.getOwnedDigitalAssets({ownerAddress: alice.accountAddress});
      console.log(`Alice's digital assets balance: ${alicesDigitalAsset.length}`);
      console.log(`Alice's digital asset: ${JSON.stringify(alicesDigitalAsset[0], null, 4)}`);
    }

  return (
    <div className="app">
      <header>
        <div>
        <Title italic level={3}>Joint Membership System</Title>
          <Flex gap="small" wrap="wrap">
            <Button type="text"  onClick={handleClick_home}> Home</Button>
            <Button type="text"  onClick={handleClick_square}> Square</Button>
            <Button type="text" >Publish NFT</Button>
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
      {/*<div style={{marginBottom: '1rem'}}>*/}
      {/*  <input type="file" accept="image/*" onChange={handleImageUpload}/>*/}
      {/*  {image && < img src={image} alt="Uploaded" style={{maxWidth: '100%', maxHeight: '300px'}}/>}*/}
      {/*</div>*/}

      <main>
      {!accountHasList ?(
      <div className="left-column" style={{ height: '80vh', overflowY: 'auto' }}>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name of your collection"
        style={{marginBottom: '1rem'}}
      />
      <Input.TextArea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description of your collection"
        autoSize={{minRows: 4, maxRows: 8}}
        style={{marginBottom: '1rem'}}
      />
      <Input
        value={uri}
        onChange={(e) => setURI(e.target.value)}
        placeholder="URI of your collection"
        style={{marginBottom: '1rem'}}
      />
      <Button type="primary" onClick={handlePublish}>Publish Collection</Button>
      </div>
      ):(
        <div className="left-column" style={{ height: '80vh', overflowY: 'auto' }}>
        <Title level={1}>
          Enjoy
          Your
          NFT
          Life
          </Title>
        </div>
      )}

      
      {
        !accountHasCollection ? (
          <div className="right-column" style={{ display: 'grid', placeItems: 'center', height: '50vh' }}>
        <Title level={1} >
        publish your collection first
        </Title>
      </div>
        ) : (
          <div className="right-column"  >

          <div className="message-container">
            {/* 消息元素 */}
            {tasks.map((task, index) => (
              
              <div key={index} className="message">
                  <Card
                    hoverable
                    style={{ width: 240 }}
                    cover={<img src={default_pic} alt="NFTpic" />}
                  >
                    <Meta title= {task.content} description={<a
                            href=" "
                          >{`${task.address.slice(0, 6)}...${task.address.slice(-5)}`}</a >} />
                  </Card>
                  
                {/* <img src={message.picture} alt="消息图片" />
                <h3>{message.title}</h3>
                <p>{message.text}</p>
                <p>publish at:{new Date(message.pub_time * 1000).toLocaleString()}</p>
                <button onClick={(event)=>NoneButtonClick()}>{message.message_funs}</button> */}
              </div>
            ))}
            {/* 其他消息元素 */}
          </div>

          {/* <Row gutter={[0, 32]} style={{ marginTop: "2rem" }}> */}
          <div className="bottom-inputs">
              <Input.Group compact>
                <Input
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  placeholder="Name of your asset"
                  style={{marginBottom: '1rem'}}
                />
                <Input.TextArea
                  value={assetDescription}
                  onChange={(e) => setAssetDescription(e.target.value)}
                  placeholder="Description of your asset"
                  autoSize={{minRows: 4, maxRows: 8}}
                  style={{marginBottom: '1rem'}}
                />
                <Input
                  value={assetURI}
                  onChange={(e) => {
                    setAssetURI(e.target.value)
                    onWriteTask(e)
                  }
                }
                  placeholder="URI of your asset"
                  style={{marginBottom: '1rem'}}
                />
                <Button type="primary" onClick={handlePublishNFT}>Mint NFT</Button>
              </Input.Group>
            </div>
            {/* <Col span={8} offset={8}>
              {tasks && (
                <List
                  size="small"
                  bordered
                  dataSource={tasks}
                  renderItem={(task: any) => (
                    <List.Item >
                      <List.Item.Meta
                        title={task.content}
                        description={
                          <a
                            href=" "
                          >{`${task.address.slice(0, 6)}...${task.address.slice(-5)}`}</a >
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </Col> */}
          {/* </Row> */}
          </div>
        )
      }
    </main>
    </div>
  );
}

// root.render(<PublishNFT />);
export default PublishNFT;
