import React from "react";
import "../assets/styles/NavBar.css";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import Logout from "./LogoutBtn";
import LoginBtn from "./LoginBtn";
import SignUpBtn from "./SignUpBtn";
import { SpotifyConnectBtn } from "./SpotifyConnectBtn";

export default function NavBar(props) {
  return (
    <nav className="nav-bar">
      <Logo />
      <SearchBar />
      {props.isAuth === false ? (
        <>
          <LoginBtn />
          <SignUpBtn />
          <SpotifyConnectBtn />
        </>
      ) : (
        <>
          <SpotifyConnectBtn />
          <Logout />
        </>
      )}
    </nav>
  );
}