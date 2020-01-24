/**
 *
 * Проблематика:
 * Функиця promisify умеет промисифицировать только функции обратного вызова
 * по контракту двух аргументов (первай - ошибка, второй - результат).
 *
 * Описание кейса:
 * При попытке применить promisify на функицю с другим контрактом аргументов
 * (например функцию https.get, у которой всего один аргумент функции обратного вызова - результат)
 * мы получаем неверное поведение - результат попадает в catch как ошибка (по контракту).
 * Контракт же реализации пакета https мы менять не имеем возможности.
 *
 * Предлагаемое решение:
 * Чтобы исправить данное поведение допустимо считать аргументы функции обратного вызова и проверять их тип.
 * Если в контракте один аргумент и его тип не является ошибкой - это результат,
 * если же его тип Error - это ошибка. Поведение resolve() и reject() остаётся без изменений.
 */

const fs = require('fs');
const https = require('https');
// const util = require('util');

const customs = {
  fs: {},
  https: {},
};

customs.promisify = fn => (...args) =>
  new Promise((resolve, reject) =>
    fn(...args, (...argv) =>
      argv.length === 1
        ? typeof argv[0] === 'Error'
          ? reject(argv[0])
          : resolve(argv[0])
        : argv[0]
        ? reject(argv[0])
        : resolve(argv[1]),
    ),
  );

/**
 * ====================
 * FS
 * ====================
 */

// customs.fs.readdir = util.promisify(fs.readdir);
customs.fs.readdir = customs.promisify(fs.readdir);

// fs.readdir();
// customs.fs.readdir();

fs.readdir(__dirname, (err, result) => console.log(result));

customs.fs
  .readdir(__dirname)
  .then(result => console.log(result))
  .catch(err => console.error(`ERROR!!! - ${err}`));

(async () => {
  const result = await customs.fs.readdir(__dirname);
  console.log(result);
})();

/**
 * ====================
 * HTTPS
 * ====================
 */

// customs.https.get = util.promisify(https.get);
customs.https.get = customs.promisify(https.get);

// https.get()
// customs.https.get();

https.get('https://yandex.ru', response => console.log(response));

customs.https
  .get('https://yandex.ru')
  .then(response => console.log(response))
  .catch(err => console.error(`ERROR!!! - ${err}`));

(async () => {
  const result = await customs.https.get('https://yandex.ru');
  console.log(result);
})();
