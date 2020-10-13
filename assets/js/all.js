//npm init or npm init -y создаем файл package json с которым будем работать
// npm ls- list g-global --depth=0 - глубина вложенностей - 0, все что находится в руте
//yarn add - можем установить любую библиотеку
//devDependencies зависимость для создания разработки, т.е. в готовом варианте роли не играет
//dependencies - те библиотеки, которые нужны самому приложению


console.log('1');
console.log('2');
console.log('3');

console.log('new');
console.log('new');
console.log('new');
console.log('new');
console.log('new');
console.log('new');

let num = 10;

console.log('OUTPUT: num', num + 1);

let str = 'str';

console.log('OUTPUT: str', str + 1);

let func =() => {
    console.log('func1');
    console.log('func2');
    num = 100;
    str = `${num}`;
};