import { Footer, Info, Header, Games, UserBets } from "./components";

const App = () => {  

  return (
    <div className="min-h-screen">
      <div className="gradient-bg-welcome">
        <Header />
        <Info />
      </div>
      <Games />
      <UserBets />
      <Footer />
    </div>
  );
}

export default App
