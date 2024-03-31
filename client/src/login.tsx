import React, { useState } from 'react';
import root from "./index";
import { BrowserRouter as Router, Route, Routes,useNavigate } from 'react-router-dom';

// Contact and EditContact do not share additional UI layout


const Login: React.FC = () => {
  const [privateKey, setPrivateKey] = useState<string>('');
  const navigate = useNavigate();
  // let navigate = useNavigate();
  const handleLogin = () => {
    // 在这里执行登录逻辑，例如验证私钥等
    console.log('Private Key:', privateKey);
    // 清空输入框
    // navigate('./App.tsx');
    setPrivateKey('');
    navigate('../');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>Login</h1>
      <input
        type="password"
        value={privateKey}
        onChange={(e) => setPrivateKey(e.target.value)}
        placeholder="Enter your private key"
        style={{ marginBottom: '1rem', padding: '0.5rem' }}
      />
      <button onClick={handleLogin} style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}>
        Login
      </button>
    </div>
  );
};
export default Login;
