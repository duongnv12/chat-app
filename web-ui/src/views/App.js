import Home from './home-page/home';
import './App.scss';

function App() {
  return ( // JSX funtion component
    <div className="App">
      <header className="App-header">
        
        <p>
          <Home />
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
