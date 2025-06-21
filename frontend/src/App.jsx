import { Route, Routes } from "react-router-dom";
import { Fragment } from "react";
import Home from "./pages/Home";
import Proposals from "./pages/Proposal";
import CreateProposal from "./pages/CreateProposal";
import Register from "./pages/Register";
import Login from "./pages/Login";
import MyAccount from "./pages/MyAccount";
import Request from "./pages/Requests";
import AddVoter from "./pages/AddVoter";
import TransferAdmin from "./pages/Transfer";
function App() {
  return (
    <Fragment>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/proposals" element={<Proposals/>}/>
        <Route path="/create" element={<CreateProposal />} />
        <Route path="/register" element={<Register/>}/>
        <Route path="/login" element = {<Login/>}/>
        <Route path="/profile" element = {<MyAccount/>}/>
        <Route path="/requests" element = {<Request/>}/>
        <Route path="/add-voter" element = {<AddVoter/>}/>
        <Route path="/transfer" element = {<TransferAdmin/>}/>
        {/* Add more routes as needed */}
      </Routes>
    </Fragment>
  );
}

export default App;
