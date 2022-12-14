# Bookmaker Smart Contract

Kody źródłowe smart contractów, napisanych w języku Solidity, są w folderze contracts. Folder scripts zawiera skrypt deploy.js wywoływany do wdrożenia smart contractu na blockchain. Pliki odpowiedzialne za testy smart contractów znajdują się w zakładce test. Plik hardhat.config.js to plik konfiguracyjny, w którym definiujemy m.in. wersję kompilatora Solidity, sieć blockchain do której będziemy wysyłać nasz kod, jak również usługę lub węzeł sieci, z którego będziemy korzystać do wysłania transakcji. Do ich podpisania musimy również podać klucz prywatny portfela. Plik ten **nie powinien być udostępniany w sieci** po podaniu klucza prywatnego, ponieważ może to spowodować **utratę wszystkich środków** z wygenerowanego przez ten klucz portfela.

Setup:

```shell
mv hardhat.template.config.js hardhat.config.js (bash) / ren hardhat.template.config.js hardhat.config.js (cmd)
npm install
npx hardhat compile
npx hardhat test
```

Deploying and verifying smart contracts:

```shell
npx hardhat deploy
npx hardhat verify "CONTRACT_ADDRESS" --network "NETWORK_NAME"
```
