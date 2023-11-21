import { Layout, Menu } from "antd";
import { Link, useLocation } from "react-router-dom";

const { Header } = Layout;

const Navbar = () => {
  const location = useLocation();
  const selectedKey =
    location?.pathname === "/"
      ? "1"
      : location?.pathname === "/bnb"
      ? "2"
      : "3";
  return (
    <Header style={{ position: "fixed", zIndex: 1, width: "100%" }}>
      <Menu theme="dark" mode="horizontal" defaultSelectedKeys={[selectedKey]}>
        <Menu.Item key="1">
          <Link to="/">Dashboard</Link>
        </Menu.Item>
        <Menu.Item key="2">
          <Link to="/bnb">BNB</Link>
        </Menu.Item>
        <Menu.Item key="3">
          <Link to="/eth">ETH</Link>
        </Menu.Item>
      </Menu>
    </Header>
  );
};
export default Navbar;
