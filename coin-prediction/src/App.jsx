import { Layout } from "antd";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Dashboard from "./Dashboard";
import CoinDetail from "./CoinDetail";
import Navbar from "./Navbar";

const { Content } = Layout;

function App() {
  return (
    <Router>
      <Layout className="layout" style={{ height: "100vh" }}>
        <Navbar />
        <Content style={{ padding: "50px", marginTop: 64 }}>
          <div style={{ background: "#fff", padding: 24, minHeight: 380 }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/bnb" element={<CoinDetail coin="BNB/USDT" />} />
              <Route path="/eth" element={<CoinDetail coin="ETH/USDT" />} />
            </Routes>
          </div>
        </Content>
      </Layout>
    </Router>
  );
}

export default App;
