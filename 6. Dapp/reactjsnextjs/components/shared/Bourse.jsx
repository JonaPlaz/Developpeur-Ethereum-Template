"use client";
import { useState, useEffect } from "react";
import axios from "axios";

const Bourse = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("https://dumbstockapi.com/stock?exchanges=NYSE");
        setData(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {isLoading ? (
        <div>Chargement...</div>
      ) : (
        <>
          {data.map((item) => {
            return <div key={item.ticker}>{item.name}</div>;
          })}
        </>
      )}
    </div>
  );
};

export default Bourse;
