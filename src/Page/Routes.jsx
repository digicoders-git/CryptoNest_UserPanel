import React from "react";
import { Route, Routes } from "react-router-dom";

import Login from "./Login";
import Register from "./Singhup";
import WelcomeCard from "./Welcome";
import MainDashBord from "../Dashbord/MainDashBord";
import Dashboard from "../Dashbord/Dashboard";
import MyTeam from "../Dashbord/MyTeam";
import MLMTree from "../Dashbord/MLMTree";
import Wallet from "../Dashbord/Wallet";
import History from "../Dashbord/History";
import NFTHistory from "../Dashbord/NFTHistory";
import NFTManagement from "../Dashbord/NFTManagement";
import NFTMarketplace from "../Dashbord/NFTMarketplace";
import MyNFTs from "../Dashbord/MyNFTs";
import NFTDashboard from "../Dashbord/NFTDashboard";
import SimpleNFTTest from "../Dashbord/SimpleNFTTest";
import EndpointTest from "../Dashbord/EndpointTest";
import PackageUpgrade from "../Dashbord/PackageUpgrade";
import Profile from "../Dashbord/Profile";
import ChangePassword from "../Dashbord/ChangePassword";
import MySoldNFTs from "../Dashbord/MySoldNFTs";
// import APITester from "../Dashbord/APITester";
// import NFTStatus from "../Dashbord/NFTStatus";
import ContactUs from "../Dashbord/ContactUs";
import ScrollToTop from "../Componect/ScrollToTop";

import Notifications from "../Dashbord/Notifications";

function Routesr() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<WelcomeCard />} />
        <Route path="/SingUp" element={<Register />} />
        <Route path="/Login" element={<Login />} />

        <Route path="/dashbord" element={<MainDashBord />}>
          <Route index element={<Dashboard />} />
          <Route path="my-team" element={<MyTeam />} />
          <Route path="mlm-tree" element={<MLMTree />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="history" element={<History />} />
          <Route path="nft-history" element={<NFTHistory />} />
          <Route path="nft-dashboard" element={<NFTDashboard />} />
          <Route path="nft-management" element={<NFTManagement />} />
          <Route path="nft-marketplace" element={<NFTMarketplace />} />
          <Route path="my-nfts" element={<MyNFTs />} />
          <Route path="nft-test" element={<SimpleNFTTest />} />
          <Route path="endpoint-test" element={<EndpointTest />} />
          {/* <Route path="api-tester" element={<APITester />} /> */}
          {/* <Route path="nft-status" element={<NFTStatus />} /> */}
          <Route path="package-upgrade" element={<PackageUpgrade />} />
          <Route path="profile" element={<Profile />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="my-sold-nfts" element={<MySoldNFTs />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="contact-us" element={<ContactUs />} />
        </Route>
      </Routes>
    </>
  );
}

export default Routesr;
