import { Layout, Row, Col, Button, Spin, List, Checkbox, Flex, Typography} from 'antd';
import { Input, Space ,Card} from 'antd';
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
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
// that has the same properties we set on our smart contract

const { Title } = Typography;
const { Meta } = Card;
type Message = {
  message_id: string;
  address: string;
  title: string
  text: string;
  picture: string;
  message_funs: string;
  pub_time: number
};
type MessageList = {
  group_name: string;
  following: Record<number, string>;
  messages: Record<number, Message>;
  messages_counter: number; 
  following_counter: number; 
};

function Square() {
  // const aptosConfig = new AptosConfig({ network: Network.MAINNET });
  // const aptos = new Aptos(aptosConfig);
  const aptos = new Aptos();
  const { account, signAndSubmitTransaction } = useWallet();
  const [accountHasList, setAccountHasList] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [lists, setLists] = useState<{ name: any; addr: string }[]>([]);
  // change this to be your module account address
  const moduleAddress = "0x9f6d548d6b9b46c5088384e4c1e27d335201710124242dd4d2db7c74856d0ba4";

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


  const fetchList = async () => {
    if (!account) return [];
    try {
      const messageListResource = await aptos.getAccountResource(
        {accountAddress:account?.address,
          resourceType:`${moduleAddress}::newmessage::MessageList`}
      );
      setAccountHasList(true);
      const followtablehandle = (messageListResource as any).following.handle;
      const followingCounter = (messageListResource as any).following_counter;
      

      let messages = [];
      let listss = []
      let fcounter = 1;
      while (fcounter <= followingCounter){
        const tableItem = {
          key_type: "u64",
          value_type: "0x1::string::String",
          key: `${fcounter}`,
        };
        const addritem = await aptos.getTableItem<string>({handle:followtablehandle, data:tableItem});//account?.address//
        const ListResource = await aptos.getAccountResource(
          {accountAddress:addritem,
            resourceType:`${moduleAddress}::newmessage::MessageList`}
        );
        // Tasks are stored in a table (this is how we built our contract). To fetch a table item (i.e a task), we need that task's table handle.
        const tableHandle = (ListResource as any).messages.handle;
        // We also need the task_counter in that resource so we can loop over and fetch the task with the task_id that matches the task_counter.
        const messageCounter = (ListResource as any).messages_counter;
        const newlist = { name: (ListResource as any).group_name, addr: addritem};
        let counter = 1;
        listss.push(newlist)
      while (counter <= messageCounter) {
        const tableItem = {
          key_type: "u64",
          value_type: `${moduleAddress}::newmessage::Message`,
          key: `${counter}`,
        };
        const task = await aptos.getTableItem<Message>({handle:tableHandle, data:tableItem});
        messages.push(task);
        counter++;
      }
      fcounter++;}
      // set tasks in local state
      setMessages(messages);
      setLists(listss)
    } catch (e: any) {
      console.log('捕获到的错误：', e.message);
      setAccountHasList(false);
    }
  };

  // add a Spinner component to show up while we are waiting for the transaction. Add a local state to keep track whether a transaction is in progress:
  const [transactionInProgress, setTransactionInProgress] =
    useState<boolean>(false);

  const [newList, setNewList] = useState<string>("");

  const onWriteList = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    // Update newMessage array with input values
    setNewList(value)
  };

  const [newfollow, setNewfollow] = useState<string>("");

  const onWriteFollow = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    // Update newMessage array with input values
    setNewfollow(value)
  };

  const addNewFollow = async ()=>{
    if (lists.some(item => item.addr === newfollow)){
      setNewfollow("You've been following")
      return 0
    }
    try {
      const messageListResource = await aptos.getAccountResource(
        {accountAddress: newfollow,
          resourceType:`${moduleAddress}::newmessage::MessageList`}
      );
      const followname = (messageListResource as any).group_name;

      setTransactionInProgress(true);
      const transaction:InputTransactionData = {
        data:{
          function:`${moduleAddress}::newmessage::add_following`,
          functionArguments:[
            newfollow
          ]
        }
      }
      const response = await signAndSubmitTransaction(transaction);
      // wait for transaction
      await aptos.waitForTransaction({transactionHash:response.hash});
      const newListToPush = {
        name: followname,
        addr: newfollow,
      };
      let newlists = [...lists];
      newlists.push(newListToPush);
      setLists(newlists)
      setNewfollow("")

    }catch (e:any){
      return 0
    }finally {
      setTransactionInProgress(false);
      fetchList()
    }
  }


  const addNewList = async () => {
    if (!account) return [];
    setTransactionInProgress(true);
    const transaction:InputTransactionData = {
      data: {
        function:`${moduleAddress}::newmessage::create_list`,
        functionArguments:[newList,account?.address]
      }
    }
    const newListToPush = {
      name: newList,
      addr: account?.address,
    };
    try {
      // sign and submit transaction to chain
      const response = await signAndSubmitTransaction(transaction);
      // wait for transaction
      await aptos.waitForTransaction({transactionHash:response.hash});
      let newLists = [...lists];

      // Add item to the tasks array
      newLists.push(newListToPush);
      // Set state
      setLists(newLists);
      setAccountHasList(true);
      setNewList("")
    } catch (error: any) {
      setAccountHasList(false);
    } finally {
      setTransactionInProgress(false);
    }
  };

  const [newMessage, setNewMessage] = useState<{ [key: string]: string }>({
    title:"",
    text: "",
    picture: "",
    message_funs:"",
  });

  const onWriteMessage = (event: React.ChangeEvent<HTMLInputElement>, inputName: string) => {
    const value = event.target.value;

    // Update newMessage array with input values
    setNewMessage((prevMessages) => ({
      ...prevMessages,
      [inputName]: value,
    }));
  };



  // When someones adds a new task we:
  // - want to verify they are connected with a wallet.
  // - build a transaction payload that would be submitted to chain.
  // - submit it to chain using our wallet.
  // - wait for the transaction.
  // - update our UI with that new task (without the need to refresh the page).
  const onMessageAdded = async () => {
    // check for connected account
    if (!account) return;
    setTransactionInProgress(true);
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    const transaction:InputTransactionData = {
      data:{
        function:`${moduleAddress}::newmessage::create_Message`,
        functionArguments:[
          newMessage.title,
          newMessage.text, 
          newMessage.picture,
          newMessage.message_funs,
          currentTimeInSeconds
        ]
      }
    }

    // hold the latest task.task_id from our local state
    const latestId = messages.length > 0 ? parseInt(messages[messages.length - 1].message_id) + 1 : 1;

    // build a newTaskToPush object into our local state
    const newMessageToPush = {
      message_id: latestId + "",
      address: account.address,
      title:newMessage.title,
      text: newMessage.text,
      picture: newMessage.picture,
      message_funs: newMessage.message_funs,
      pub_time: currentTimeInSeconds
    };

    try {
      // sign and submit transaction to chain
      const response = await signAndSubmitTransaction(transaction);
      // wait for transaction
      await aptos.waitForTransaction({transactionHash:response.hash});

      // Create a new array based on current state:
      let newMessages = [...messages];

      // Add item to the tasks array
      newMessages.push(newMessageToPush);
      // Set state
      setMessages(newMessages);
      // clear input text
      setNewMessage({
        text: "",
        picture: "",
        message_funs:"",
        // Add more inputs as needed
      });
    } catch (error: any) {
      console.log("error", error);
    } finally {
      setTransactionInProgress(false);
      reorderMessages()
    }
  };

  const reorderMessages = () => {
    const sortedMessages = [...messages].sort((a, b) => b.pub_time - a.pub_time);
    setMessages(sortedMessages);
  };

  useEffect(() => {
    fetchList();
  }, [account?.address]);

  useEffect(() => {
    reorderMessages();
  }, [lists]);


  return (
    <div className="app">
      {/* 头部 */}
      <header>
        <div>
        <Title italic level={3}>Joint Membership System</Title>
          <Flex gap="small" wrap="wrap">
            <Button type="text" onClick={handleClick_home}>Home</Button>
            <Button type="text" >Square</Button>
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

      {/* 正文 */}
      <main>
        {/* 左侧列表 */}
        {accountHasList ? (
        <div className="left-column" style={{ height: '80vh', overflowY: 'auto' }}>
          <Title level={3}>Following List</Title>
                <List
                  size="small"
                  bordered
                  dataSource={lists}
                  renderItem={(list: any) => (
                    <List.Item
                    >
                      <List.Item.Meta
                        title={list.name}
                        description={
                          <a
                            href= "_blank"
                          >{`${list.addr.slice(0, 6)}...${list.addr.slice(-5)}`}</a >
                        }
                      />
                    </List.Item>
                  )}
                />
                
          <div className="bottom-inputs">
          <Space.Compact style={{ width: '100%' }}>
              <Input 
                  onChange={(event) => onWriteFollow(event)}
                  style={{ width: "calc(100% - 60px)" }}
                  placeholder="address"
                  size="large"
                  value={newfollow} // add this
                  />
              <Button 
                  onClick={addNewFollow}
                  type="primary"
                  style={{ height: "40px", backgroundColor: "#3f67ff" }}
                  >Follow!</Button>
            </Space.Compact>
              </div>
        </div>
        ):(
          <div className="bottom-inputs">
          <Space.Compact style={{ width: '100%' }}>
              <Input 
                  onChange={(event) => onWriteList(event)}
                  style={{ width: "calc(100% - 60px)" }}
                  placeholder="Account name"
                  size="large"
                  value={newList} // add this
                  />
              <Button 
                  onClick={addNewList}
                  type="primary"
                  style={{ height: "40px", backgroundColor: "#3f67ff" }}
                  >Create!</Button>
            </Space.Compact>
          </div>
              )}

        {/* 右侧聊天窗口 */}
        <div className="right-column">
          <div className="message-container">
            {/* 消息元素 */}
            {messages.map((message, index) => (
              
              <div key={index} className="message">
                  <Card
                    hoverable
                    style={{ width: 240 }}
                    cover={<img src={message.picture} alt="消息图片" />}
                  >
                    <Meta title= {message.title} description={message.text} />
                  </Card>
                  <Button 
                  onClick={addNewList}
                  type="primary"
                  style={{ height: "30px",width:"100px", backgroundColor: "#65EEBC" }}
                  >{message.message_funs}</Button>
                {/* <img src={message.picture} alt="消息图片" />
                <h3>{message.title}</h3>
                <p>{message.text}</p>
                <p>publish at:{new Date(message.pub_time * 1000).toLocaleString()}</p>
                <button onClick={(event)=>NoneButtonClick()}>{message.message_funs}</button> */}
              </div>
            ))}
            {/* 其他消息元素 */}
          </div>
          {/* 底部输入框和下拉栏 */}
          <div className="bottom-inputs">
          <Input
                  onChange={(event) => onWriteMessage(event,'title')}
                  style={{ width: "calc(100% - 60px)" }}
                  placeholder="Title"
                  size="large"
                  value={newMessage.title} // add this
                />
          <Input
                  onChange={(event) => onWriteMessage(event,'text')}
                  style={{ width: "calc(100% - 60px)" }}
                  placeholder="Message to publish"
                  size="large"
                  value={newMessage.text} // add this
                />
            <Input
                  onChange={(event) => onWriteMessage(event,'picture')}
                  style={{ width: "calc(100% - 60px)" }}
                  placeholder="Picture to publish"
                  size="large"
                  value={newMessage.picture} // add this
                />
            <Input
                  onChange={(event) => onWriteMessage(event,'message_funs')}
                  style={{ width: "calc(100% - 60px)" }}
                  placeholder="Function to Add"
                  size="large"
                  value={newMessage.message_funs} // add this
                />
            <Button
                  onClick={onMessageAdded}
                  type="primary"
                  style={{ height: "40px", backgroundColor: "#3f67ff" }}
                >
                  Publish
                </Button>
          </div>
        </div>
      </main>
    </div>

  );
}


export default Square;
