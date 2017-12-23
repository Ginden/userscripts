## Common mistakes

This README is written in Polish language. 
English speaking users are encouraged to read code as it was written
to be as expressive and readable as possible.

### TODO

* Add code coverage support
* Improve code coverage
* Use test framework supporting ES Modules natively
* Change debug output


## Dla użytkowników

Otwórz plik [./dist/index.js](dist/index.js), wciśnij przycisk "raw" i skopiuj kod albo na swoją stronę. 

Instrukcję znajdziesz na [angielskiej wiki](https://en.wikipedia.org/wiki/Wikipedia:User_scripts).

### Dla nie-paranoików

Otwórz stronę [Special:Mypage/common.js](https://pl.wikipedia.org/wiki/Special:Mypage/common.js);

Utwórz ją lub dopisz na końcu linijkę

```js
importScript('User:Michalwadas/common-mistakes.js');
```

## Dla developerów

System jest budowany [Rollupem](https://rollupjs.org/) ze względu na mały rozmiar końcowego skryptu,

usuwanie martwego kodu, minimalna ingerencja w kod.

Gwarantuję działanie tylko pod Bashem i zsh, Okniarze swoje problemy powinni rozwiązywać sami (Ubuntu for Windows lub Cygwin powinny załatwić sprawę).
 
Kroki:

```shell
git clone https://github.com/Ginden/wikipedia-userscripts.git
cd wikipedia-userscripts/common-mistakes
npm install
npm run build // Result will be stored in dist/index.js file
npm test
```

## Greasemonkey czy skrypt Wikipedii

Skrypt z dist/index.js powinien działać w obu postaciach. 

## Licencja

Klasyczne X11, znana jako [licencja MIT](https://pl.wikipedia.org/wiki/Licencja_MIT).

