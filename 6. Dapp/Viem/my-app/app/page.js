'use client';
import { useState, useEffect } from "react";
import { createPublicClient, http, parseAbiItem, formatEther } from "viem";
import { mainnet } from "viem/chains";

const client = createPublicClient(
  {
    chain: mainnet,
    transport: http('https://mainnet.infura.io/v3/3fbde67a34c34a649b291b0cdd06a2b0'),
  }
);

export default function Home() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const getInfos = async () => {
      const logs = await client.getLogs({
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        event: parseAbiItem('event Deposit(address indexed, uint)'),
        fromBlock: 21100745n,
        toBlock: 21100750n,
      });
      setEvents(logs);
    };
    getInfos();
  }, []);

  return (
    <p>
      {events.length > 0 ? events.map((event) => (
        <p key={crypto.randomUUID}>
          Adresse : {event.args[0]} - Montant : {formatEther(event.args[1])} ETH
        </p>
      )) : "Aucun événement"}
    </p>
  );
}
