'use client'
import { WagmiProvider } from 'wagmi'
import { config } from './config' 
import { QueryClient, QueryClientProvider } from '@tanstack/react-query' 

const queryClient = new QueryClient() 
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}> 
            {children}
          </QueryClientProvider>
        </WagmiProvider>  
        </body>
    </html>
  );
}