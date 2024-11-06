"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

const Jeu = () => {
  const [number, setNumber] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const handleButtonClick = () => {
    setNumber(number + 1);
  };

  useEffect(() => {
    console.log("Le jeu est prêt car le composant est monté");
    setIsLoading(false);
  }, []);

  useEffect(() => {
    console.log("Le state `number` a changé");
  }, [number]);

  useEffect(() => {
    console.log("Quelque chose a changé");
  });

  useEffect(() => {
    return () => {
      console.log("Le composant est démonté");
    };
  });

  return (
    <>
      {isLoading ? (
        <div>Chargement...</div>
      ) : (
        <>
          <div>Jeu {number}</div>
          <button onClick={handleButtonClick}>Click</button>
          <Link href="/">Retour sur la Home</Link>
        </>
      )}
    </>
  );
};

export default Jeu;
