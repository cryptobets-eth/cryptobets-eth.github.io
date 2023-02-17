# CryptoBets React App

Kod źródłowy, który znajduje się w folderze src, został dodatkowo podzielony na foldery components, context i utils. Pierwszy z nich zawiera komponenty, w drugim folderze znajduje się plik BookmakerContext.jsx odpowiedzialny za komunikację z blockchainem i  przekazywanie pozyskanych z niego danych do reszty aplikacji webowej. W folderze utils są pomocnicze pliki, takie jak interfejs binarny smart contractów (ABI) czy plik constants.js, gdzie przechowuję adres smart contractu Bookmaker.sol umieszczony na blockchainie.

The source code, which is located in the src folder, has been additionally divided into components, context and utils folders. The first one contains components, the second folder contains the BookmakerContext.jsx file responsible for communication with the blockchain and transferring data obtained from it to the rest of the web application. There are helper files in the utils folder, such as the smart contract binary interface (ABI) or the constants.js file, where I store the address of the Bookmaker.sol smart contract placed on the blockchain.

Setup:

```shell
npm install
npm run dev
```

