import { useState, useEffect } from "react";

function App() {
  const [count, setCount] = useState(0);

  const click = () => {
    setCount((previousCount) => previousCount + 1);
  };

  // avec un tableau vide, le useEffect ne s'exécute qu'une seule fois
  // avec un tableau de dépendances, le useEffect s'exécute à chaque fois que l'une des dépendances change
  // avec un tableau de dépendances vide, le useEffect s'exécute à chaque fois que le composant est rendu
  useEffect(() => {
    alert("count a changé !");
  }, []);

  return (
    <>
      <button onClick={click}>J'aime !</button>
      <p>{count}</p>
    </>
  );
}

export default App;
