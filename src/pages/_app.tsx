import '../globals.css'
import type { AppProps } from 'next/app'
import { ClientSide } from '../ClientSide'

export default function App({ Component, pageProps }: AppProps) {
  return <>
    <ClientSide>
      <Component {...pageProps} />
    </ClientSide>
  </>;
}
