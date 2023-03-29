import { CodeBracketIcon } from '@heroicons/react/24/solid'
import { Head, Html, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <a href="https://github.com/gempir/gptchat" className='top-5 right-5 absolute hover:opacity-50' target={"_blank"}>
          <CodeBracketIcon className='h-6' />
        </a>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
